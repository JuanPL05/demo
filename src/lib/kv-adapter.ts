const KV_PREFIX = 'spark_kv_'
const SHARED_STORAGE_KEY = 'meetup_shared_db_v2'
const GIST_STORAGE_KEY = 'meetup_gist_id'
const GITHUB_TOKEN_KEY = 'meetup_github_token'

type StorageMode = 'spark' | 'gist' | 'shared'

let storageMode: StorageMode | null = null
let storageModeCheckPromise: Promise<StorageMode> | null = null
let gistId: string | null = null
let githubToken: string | null = null

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
          console.log('[KV Adapter] ✅ Using Spark KV storage - Data persists across sessions and devices')
          return 'spark'
        } catch (error) {
          console.warn('[KV Adapter] Spark KV not accessible, checking for GitHub Gist storage')
        }
      }

      try {
        const savedGistId = localStorage.getItem(GIST_STORAGE_KEY)
        const savedToken = localStorage.getItem(GITHUB_TOKEN_KEY)
        
        if (savedGistId && savedToken) {
          gistId = savedGistId
          githubToken = savedToken
          
          const response = await fetch(`https://api.github.com/gists/${gistId}`, {
            headers: {
              'Authorization': `token ${savedToken}`,
              'Accept': 'application/vnd.github.v3+json'
            }
          })
          
          if (response.ok) {
            storageMode = 'gist'
            console.log('[KV Adapter] ✅ Using GitHub Gist storage - Data shared across devices via Gist')
            return 'gist'
          }
        }
      } catch (error) {
        console.warn('[KV Adapter] GitHub Gist not accessible, falling back to shared localStorage')
      }

      storageMode = 'shared'
      console.log('[KV Adapter] ⚠️ Using shared localStorage - Data only persists on this browser')
      return 'shared'
    } catch (error) {
      storageMode = 'shared'
      console.warn('[KV Adapter] ⚠️ Using shared localStorage fallback')
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
  try {
    if (!gistId || !githubToken) {
      console.error('[KV Adapter] Gist not configured')
      return
    }
    
    const response = await fetch(`https://api.github.com/gists/${gistId}`, {
      headers: {
        'Authorization': `token ${githubToken}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    })
    
    let allData: Record<string, any> = {}
    
    if (response.ok) {
      const gist = await response.json()
      const file = gist.files?.['database.json']
      if (file?.content) {
        allData = JSON.parse(file.content)
      }
    }
    
    allData[key] = value
    
    await fetch(`https://api.github.com/gists/${gistId}`, {
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
  } catch (error) {
    console.error(`[KV Adapter] Gist set error for key "${key}":`, error)
  }
}

async function deleteFromGist(key: string): Promise<void> {
  try {
    if (!gistId || !githubToken) return
    
    const response = await fetch(`https://api.github.com/gists/${gistId}`, {
      headers: {
        'Authorization': `token ${githubToken}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    })
    
    if (!response.ok) return
    
    const gist = await response.json()
    const file = gist.files?.['database.json']
    if (!file?.content) return
    
    const allData = JSON.parse(file.content)
    delete allData[key]
    
    await fetch(`https://api.github.com/gists/${gistId}`, {
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

export function getGistId(): string | null {
  return gistId
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
      details: 'Usando Spark KV - Los datos persisten entre sesiones y dispositivos',
      isPersistent: true,
      isShared: true
    }
  } else if (mode === 'gist') {
    return {
      mode: 'gist',
      details: `Usando GitHub Gist - Los datos se comparten mediante Gist ID: ${gistId}`,
      isPersistent: true,
      isShared: true
    }
  } else {
    return {
      mode: 'shared',
      details: 'Usando localStorage - Los datos solo persisten en este navegador',
      isPersistent: true,
      isShared: false
    }
  }
}
