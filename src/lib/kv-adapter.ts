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
    
    const response = await fetch(`https://api.github.com/gists/${gistId}`, {
      headers: {
        'Authorization': `token ${githubToken}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    })
    
    if (!response.ok) return undefined
    
    const gist = await response.json()
    const file = gist.files?.['database.json']
    if (!file?.content) return undefined
    
    const allData = JSON.parse(file.content)
    return allData[key]
  } catch (error) {
    console.error(`[KV Adapter] Gist get error for key "${key}":`, error)
    return undefined
  }
}

async function setToGist<T>(key: string, value: T): Promise<void> {
  await acquireGistWriteLock()
  try {
    if (!gistId || !githubToken) {
      console.error('[KV Adapter] Gist not configured')
      return
    }
    
    // Obtener datos actuales
    const getResponse = await fetch(`https://api.github.com/gists/${gistId}`, {
      headers: {
        'Authorization': `token ${githubToken}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    })
    
    if (!getResponse.ok) {
      console.error(`[KV Adapter] Error reading Gist: ${getResponse.status} ${getResponse.statusText}`)
      if (getResponse.status === 403) {
        console.error('[KV Adapter] ❌ Error 403: Permisos insuficientes. Verifica que tu token tiene permisos de "gist"')
      }
      return
    }
    
    const gist = await getResponse.json()
    const file = gist.files?.['database.json']
    let allData: Record<string, any> = {}
    
    if (file?.content) {
      try {
        allData = JSON.parse(file.content)
      } catch (parseError) {
        console.error('[KV Adapter] Error parsing Gist content:', parseError)
        allData = {}
      }
    }
    
    allData[key] = value
    
    // Actualizar Gist
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
      const errorText = await updateResponse.text()
      console.error(`[KV Adapter] ❌ Error al actualizar Gist: ${updateResponse.status} ${updateResponse.statusText}`)
      console.error(`[KV Adapter] Respuesta: ${errorText}`)
      
      if (updateResponse.status === 403) {
        console.error('[KV Adapter] ❌ Error 403: Permisos insuficientes. Verifica que tu token tiene permisos de "gist"')
      } else if (updateResponse.status === 401) {
        console.error('[KV Adapter] ❌ Error 401: Token inválido o expirado')
      }
      throw new Error(`Failed to update Gist: ${updateResponse.status}`)
    }
    
    console.log(`[KV Adapter] ✅ Datos guardados en Gist para key: ${key}`)
  } catch (error) {
    console.error(`[KV Adapter] Gist set error for key "${key}":`, error)
  } finally {
    releaseGistWriteLock()
  }
}

async function deleteFromGist(key: string): Promise<void> {
  await acquireGistWriteLock()
  try {
    if (!gistId || !githubToken) return
    
    const response = await fetch(`https://api.github.com/gists/${gistId}`, {
      headers: {
        'Authorization': `token ${githubToken}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    })
    
    if (!response.ok) {
      console.error(`[KV Adapter] Error reading Gist for delete: ${response.status} ${response.statusText}`)
      return
    }
    
    const gist = await response.json()
    const file = gist.files?.['database.json']
    if (!file?.content) return
    
    const allData = JSON.parse(file.content)
    delete allData[key]
    
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
      const errorText = await updateResponse.text()
      console.error(`[KV Adapter] ❌ Error al eliminar de Gist: ${updateResponse.status} ${updateResponse.statusText}`)
      console.error(`[KV Adapter] Respuesta: ${errorText}`)
      
      if (updateResponse.status === 403) {
        console.error('[KV Adapter] ❌ Error 403: Permisos insuficientes')
      }
      throw new Error(`Failed to delete from Gist: ${updateResponse.status}`)
    }
    
    console.log(`[KV Adapter] ✅ Dato eliminado del Gist para key: ${key}`)
  } catch (error) {
    console.error(`[KV Adapter] Gist delete error for key "${key}":`, error)
  } finally {
    releaseGistWriteLock()
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
