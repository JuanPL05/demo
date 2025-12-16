/**
 * KV Adapter - Sistema de persistencia con caché y batch updates
 * 
 * Modos de almacenamiento (en orden de preferencia):
 * 1. Spark KV (GitHub) - Automático en GitHub Codespaces/Spark
 * 2. GitHub Gist - Manual via token + Gist ID
 * 3. localStorage compartido - Fallback local
 * 
 * Para evitar rate limiting de GitHub API (5000 requests/hora):
 * - Caché en memoria: GET requests devuelven datos en caché (30s TTL)
 * - Batch updates: Agrupa múltiples cambios en 1 PATCH (cada 2s)
 * - Flush on unload: Sincroniza cambios pendientes al cerrar la sesión
 * 
 * Flujo: set() → cola de cambios + caché local → (2s después) → PATCH a Gist
 */

const KV_PREFIX = 'spark_kv_'
const SHARED_STORAGE_KEY = 'meetup_shared_db_v2'
const GIST_STORAGE_KEY = 'meetup_gist_id'
const GITHUB_TOKEN_KEY = 'meetup_github_token'

type StorageMode = 'spark' | 'gist' | 'shared'

let storageMode: StorageMode | null = null
let storageModeCheckPromise: Promise<StorageMode> | null = null
let gistId: string | null = null
let githubToken: string | null = null

// Simple mutex para evitar race conditions en operaciones Gist
let gistWriteLock = false
async function acquireGistWriteLock(): Promise<void> {
  while (gistWriteLock) {
    await new Promise(resolve => setTimeout(resolve, 50))
  }
  gistWriteLock = true
}

function releaseGistWriteLock(): void {
  gistWriteLock = false
}

// Caché local para evitar rate limit - almacena todos los datos del Gist
let gistCache: Record<string, any> | null = null
let gistCacheTimestamp: number = 0
const GIST_CACHE_DURATION = 30000 // 30 segundos

// Cola de cambios pendientes para batch updates
let pendingGistChanges: Map<string, any> = new Map()
let gistSaveTimeout: ReturnType<typeof setTimeout> | null = null
const GIST_BATCH_DELAY = 2000 // Agrupa cambios en 2 segundos

function isCacheValid(): boolean {
  return gistCache !== null && (Date.now() - gistCacheTimestamp) < GIST_CACHE_DURATION
}

async function loadGistToCache(): Promise<Record<string, any>> {
  if (isCacheValid() && gistCache !== null) {
    return gistCache
  }

  try {
    if (!gistId || !githubToken) return {}
    
    const response = await fetch(`https://api.github.com/gists/${gistId}`, {
      headers: {
        'Authorization': `token ${githubToken}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    })
    
    if (!response.ok) {
      if (response.status === 403) {
        const errorData = await response.json()
        if (errorData.message?.includes('API rate limit')) {
          console.error('[KV Adapter] ⏱️ Rate limit de GitHub API alcanzado. Esperando...')
        }
      }
      return gistCache || {}
    }
    
    const gist = await response.json()
    const file = gist.files?.['database.json']
    let allData: Record<string, any> = {}
    
    if (file?.content) {
      try {
        allData = JSON.parse(file.content)
      } catch (parseError) {
        console.error('[KV Adapter] Error parsing Gist content:', parseError)
      }
    }
    
    gistCache = allData
    gistCacheTimestamp = Date.now()
    console.log('[KV Adapter] 📦 Caché del Gist cargado')
    return allData
  } catch (error) {
    console.error('[KV Adapter] Error loading Gist to cache:', error)
    return gistCache || {}
  }
}

function scheduleBatchGistSave(): void {
  if (gistSaveTimeout) {
    clearTimeout(gistSaveTimeout)
  }
  
  gistSaveTimeout = setTimeout(async () => {
    await flushGistChanges()
  }, GIST_BATCH_DELAY)
}

async function flushGistChanges(): Promise<void> {
  if (pendingGistChanges.size === 0) return
  
  const changes = Object.fromEntries(pendingGistChanges)
  pendingGistChanges.clear()
  
  console.log(`[KV Adapter] 💾 Guardando ${Object.keys(changes).length} cambios pendientes...`)
  
  await acquireGistWriteLock()
  try {
    if (!gistId || !githubToken) {
      console.error('[KV Adapter] Gist not configured')
      return
    }
    
    // Usar caché como base, aplicar cambios
    let allData = await loadGistToCache()
    
    // Aplicar cambios (undefined significa eliminar)
    Object.entries(changes).forEach(([key, value]) => {
      if (value === undefined) {
        delete allData[key]
      } else {
        allData[key] = value
      }
    })
    
    const updateResponse = await fetch(`https://api.github.com/gists/${gistId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `token ${githubToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        files: {
          'database.json': {
            content: JSON.stringify(allData, null, 2)
          }
        }
      })
    })
    
    if (!updateResponse.ok) {
      const errorData = await updateResponse.json()
      console.error(`[KV Adapter] ❌ Error al actualizar Gist: ${updateResponse.status}`)
      
      if (updateResponse.status === 403) {
        if (errorData.message?.includes('API rate limit')) {
          console.error('[KV Adapter] ⏱️ Rate limit alcanzado. Los cambios quedarán pendientes.')
          // Reencolar los cambios
          Object.entries(changes).forEach(([k, v]) => {
            pendingGistChanges.set(k, v)
          })
          scheduleBatchGistSave()
        } else {
          console.error('[KV Adapter] ❌ Permisos insuficientes. Verifica que tu token tiene permisos de "gist"')
        }
      }
      return
    }
    
    // Actualizar caché con los datos guardados
    gistCache = allData
    gistCacheTimestamp = Date.now()
    console.log(`[KV Adapter] ✅ ${Object.keys(changes).length} cambios guardados en Gist`)
  } catch (error) {
    console.error('[KV Adapter] Error flushing Gist changes:', error)
  } finally {
    releaseGistWriteLock()
  }
}

async function detectStorageMode(): Promise<StorageMode> {
  if (storageMode !== null) {
    return storageMode
  }

  if (storageModeCheckPromise) {
    return storageModeCheckPromise
  }

  storageModeCheckPromise = (async () => {
    try {
      if (typeof window !== 'undefined' && window.spark?.kv) {
        try {
          await window.spark.kv.keys()
          storageMode = 'spark'
          console.log('[KV Adapter] ✅ Usando Spark KV - Los datos se comparten automáticamente entre todos los usuarios')
          return 'spark'
        } catch (error) {
          console.warn('[KV Adapter] Spark KV no accesible, verificando almacenamiento compartido local')
        }
      }

      const savedToken = localStorage.getItem(GITHUB_TOKEN_KEY)
      const savedGistId = localStorage.getItem(GIST_STORAGE_KEY)

      if (savedToken && savedGistId) {
        githubToken = savedToken
        gistId = savedGistId
        storageMode = 'gist'
        console.log('[KV Adapter] ✅ Usando GitHub Gist - Los datos se sincronizan entre todos los dispositivos')
        return 'gist'
      }

      storageMode = 'shared'
      console.log('[KV Adapter] ✅ Usando localStorage compartido - Todos los usuarios en este navegador verán los mismos datos')
      return 'shared'
    } catch (error) {
      storageMode = 'shared'
      console.warn('[KV Adapter] ✅ Usando localStorage compartido (fallback)')
      return 'shared'
    }
  })()

  return storageModeCheckPromise
}

function getSharedData(): Record<string, any> {
  try {
    const data = localStorage.getItem(SHARED_STORAGE_KEY)
    return data ? JSON.parse(data) : {}
  } catch (error) {
    console.error('[KV Adapter] Error reading shared data:', error)
    return {}
  }
}

function setSharedData(data: Record<string, any>): void {
  try {
    localStorage.setItem(SHARED_STORAGE_KEY, JSON.stringify(data))
  } catch (error) {
    console.error('[KV Adapter] Error writing shared data:', error)
  }
}

function getFromSharedStorage<T>(key: string): T | undefined {
  try {
    const allData = getSharedData()
    return allData[key]
  } catch (error) {
    console.error(`[KV Adapter] Shared storage get error for key "${key}":`, error)
    return undefined
  }
}

function setToSharedStorage<T>(key: string, value: T): void {
  try {
    const allData = getSharedData()
    allData[key] = value
    setSharedData(allData)
  } catch (error) {
    console.error(`[KV Adapter] Shared storage set error for key "${key}":`, error)
  }
}

function deleteFromSharedStorage(key: string): void {
  try {
    const allData = getSharedData()
    delete allData[key]
    setSharedData(allData)
  } catch (error) {
    console.error(`[KV Adapter] Shared storage delete error for key "${key}":`, error)
  }
}

function getKeysFromSharedStorage(): string[] {
  try {
    const allData = getSharedData()
    return Object.keys(allData)
  } catch (error) {
    console.error('[KV Adapter] Shared storage keys error:', error)
    return []
  }
}

function getFromLocalStorage<T>(key: string): T | undefined {
  try {
    const item = localStorage.getItem(KV_PREFIX + key)
    return item ? JSON.parse(item) : undefined
  } catch (error) {
    console.error(`[KV Adapter] LocalStorage get error for key "${key}":`, error)
    return undefined
  }
}

function setToLocalStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(KV_PREFIX + key, JSON.stringify(value))
  } catch (error) {
    console.error(`[KV Adapter] LocalStorage set error for key "${key}":`, error)
  }
}

function deleteFromLocalStorage(key: string): void {
  try {
    localStorage.removeItem(KV_PREFIX + key)
  } catch (error) {
    console.error(`[KV Adapter] LocalStorage delete error for key "${key}":`, error)
  }
}

function getKeysFromLocalStorage(): string[] {
  try {
    const allKeys = Object.keys(localStorage)
    return allKeys
      .filter((k) => k.startsWith(KV_PREFIX))
      .map((k) => k.slice(KV_PREFIX.length))
  } catch (error) {
    console.error('[KV Adapter] LocalStorage keys error:', error)
    return []
  }
}

async function getFromGist<T>(key: string): Promise<T | undefined> {
  try {
    if (!gistId || !githubToken) return undefined
    
    // Usar caché si está disponible
    const data = await loadGistToCache()
    return data[key]
  } catch (error) {
    console.error(`[KV Adapter] Gist get error for key "${key}":`, error)
    return undefined
  }
}

async function setToGist<T>(key: string, value: T): Promise<void> {
  try {
    if (!gistId || !githubToken) {
      console.error('[KV Adapter] Gist not configured')
      return
    }
    
    // Agregar a cambios pendientes (usa caché local, no hace GET)
    pendingGistChanges.set(key, value)
    
    // Actualizar caché localmente también
    if (!gistCache) {
      gistCache = {}
    }
    gistCache[key] = value
    
    console.log(`[KV Adapter] 📝 Cambio pendiente: ${key} (total pendientes: ${pendingGistChanges.size})`)
    
    // Programar guardado en batch
    scheduleBatchGistSave()
  } catch (error) {
    console.error(`[KV Adapter] Gist set error for key "${key}":`, error)
  }
}

async function deleteFromGist(key: string): Promise<void> {
  try {
    if (!gistId || !githubToken) return
    
    // Agregar a cambios pendientes con undefined para indicar eliminación
    pendingGistChanges.set(key, undefined)
    
    // Actualizar caché también
    if (gistCache) {
      delete gistCache[key]
    }
    
    console.log(`[KV Adapter] 🗑️ Eliminación pendiente: ${key}`)
    
    // Programar guardado en batch
    scheduleBatchGistSave()
  } catch (error) {
    console.error(`[KV Adapter] Gist delete error for key "${key}":`, error)
  }
}

async function getKeysFromGist(): Promise<string[]> {
  try {
    if (!gistId || !githubToken) return []
    
    const response = await fetch(`https://api.github.com/gists/${gistId}`, {
      headers: {
        'Authorization': `token ${githubToken}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    })
    
    if (!response.ok) return []
    
    const gist = await response.json()
    const file = gist.files?.['database.json']
    if (!file?.content) return []
    
    const allData = JSON.parse(file.content)
    return Object.keys(allData)
  } catch (error) {
    console.error('[KV Adapter] Gist keys error:', error)
    return []
  }
}

export const kvAdapter = {
  async get<T>(key: string): Promise<T | undefined> {
    const mode = await detectStorageMode()
    
    if (mode === 'spark') {
      return await window.spark.kv.get<T>(key)
    } else if (mode === 'gist') {
      return await getFromGist<T>(key)
    } else {
      return getFromSharedStorage<T>(key)
    }
  },

  async set<T>(key: string, value: T): Promise<void> {
    const mode = await detectStorageMode()
    
    if (mode === 'spark') {
      await window.spark.kv.set(key, value)
    } else if (mode === 'gist') {
      await setToGist(key, value)
    } else {
      setToSharedStorage(key, value)
    }
  },

  async delete(key: string): Promise<void> {
    const mode = await detectStorageMode()
    
    if (mode === 'spark') {
      await window.spark.kv.delete(key)
    } else if (mode === 'gist') {
      await deleteFromGist(key)
    } else {
      deleteFromSharedStorage(key)
    }
  },

  async keys(): Promise<string[]> {
    const mode = await detectStorageMode()
    
    if (mode === 'spark') {
      return await window.spark.kv.keys()
    } else if (mode === 'gist') {
      return await getKeysFromGist()
    } else {
      return getKeysFromSharedStorage()
    }
  },

  async flush(): Promise<void> {
    const mode = await detectStorageMode()
    if (mode === 'gist') {
      await flushGistChanges()
    }
  }
}

export async function configureGistStorage(token: string, existingGistId?: string): Promise<string> {
  githubToken = token
  
  if (existingGistId) {
    try {
      const response = await fetch(`https://api.github.com/gists/${existingGistId}`, {
        headers: {
          'Authorization': `token ${token}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      })
      
      if (response.ok) {
        gistId = existingGistId
        localStorage.setItem(GIST_STORAGE_KEY, existingGistId)
        localStorage.setItem(GITHUB_TOKEN_KEY, token)
        storageMode = 'gist'
        console.log('[KV Adapter] Configured with existing Gist:', existingGistId)
        return existingGistId
      }
    } catch (error) {
      console.error('[KV Adapter] Error checking existing Gist:', error)
    }
  }
  
  try {
    const response = await fetch('https://api.github.com/gists', {
      method: 'POST',
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        description: 'MeetUp Demo Day - Database Storage',
        public: false,
        files: {
          'database.json': {
            content: JSON.stringify({}, null, 2)
          }
        }
      })
    })
    
    if (!response.ok) {
      throw new Error('Failed to create Gist')
    }
    
    const gist = await response.json()
    gistId = gist.id
    localStorage.setItem(GIST_STORAGE_KEY, gist.id)
    localStorage.setItem(GITHUB_TOKEN_KEY, token)
    storageMode = 'gist'
    console.log('[KV Adapter] Created new Gist:', gist.id)
    return gist.id
  } catch (error) {
    console.error('[KV Adapter] Error creating Gist:', error)
    throw error
  }
}

export function getStorageMode(): StorageMode | null {
  return storageMode
}

export async function getStorageInfo(): Promise<{
  mode: StorageMode | null
  details: string
  isPersistent: boolean
  isShared: boolean
}> {
  const mode = await detectStorageMode()
  
  if (mode === 'spark') {
    return {
      mode: 'spark',
      details: 'Los datos se guardan en Spark KV y se comparten automáticamente entre todos los usuarios y dispositivos',
      isPersistent: true,
      isShared: true
    }
  } else if (mode === 'gist') {
    return {
      mode: 'gist',
      details: 'Los datos se guardan en GitHub Gist y se sincronizan entre todos los usuarios y dispositivos configurados',
      isPersistent: true,
      isShared: true
    }
  } else {
    return {
      mode: 'shared',
      details: 'Los datos se guardan localmente y se comparten entre todos los usuarios de este navegador (Admin y Jueces)',
      isPersistent: true,
      isShared: true
    }
  }
}
