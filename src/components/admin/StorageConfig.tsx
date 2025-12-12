import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Database, Trash, CheckCircle, Warning, Globe, GithubLogo, Info, CaretDown, CaretUp } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { kvAdapter, getStorageInfo, configureGistStorage, getGistId } from '@/lib/kv-adapter'

export function StorageConfig() {
  const [keys, setKeys] = useState<string[]>([])
  const [storageDetails, setStorageDetails] = useState<string>('')
  const [storageMode, setStorageMode] = useState<string>('')
  const [isPersistent, setIsPersistent] = useState(false)
  const [isShared, setIsShared] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [showGistConfig, setShowGistConfig] = useState(false)
  const [githubToken, setGithubToken] = useState('')
  const [gistId, setGistId] = useState('')
  const [isConfiguring, setIsConfiguring] = useState(false)
  const [showInstructions, setShowInstructions] = useState(false)

  useEffect(() => {
    loadStorageInfo()
  }, [])

  const loadStorageInfo = async () => {
    try {
      setIsLoading(true)
      const info = await getStorageInfo()
      const allKeys = await kvAdapter.keys()
      const currentGistId = getGistId()
      
      setKeys(allKeys)
      setStorageDetails(info.details)
      setStorageMode(info.mode || 'unknown')
      setIsPersistent(info.isPersistent)
      setIsShared(info.isShared)
      
      if (currentGistId) {
        setGistId(currentGistId)
      }
    } catch (error) {
      console.error('Error loading storage info:', error)
      setStorageDetails('Error al cargar información de almacenamiento')
    } finally {
      setIsLoading(false)
    }
  }

  const handleConfigureGist = async () => {
    if (!githubToken.trim()) {
      toast.error('Por favor ingresa un token de GitHub válido')
      return
    }

    setIsConfiguring(true)
    try {
      const newGistId = await configureGistStorage(
        githubToken,
        gistId.trim() || undefined
      )
      
      toast.success('Almacenamiento compartido configurado correctamente')
      setGistId(newGistId)
      setShowGistConfig(false)
      
      await loadStorageInfo()
      
      window.location.reload()
    } catch (error) {
      console.error('Error configuring Gist:', error)
      toast.error('Error al configurar el almacenamiento. Verifica tu token.')
    } finally {
      setIsConfiguring(false)
    }
  }

  const deleteKey = async (key: string) => {
    if (!confirm(`¿Estás seguro de eliminar la clave "${key}"?`)) return
    
    try {
      await kvAdapter.delete(key)
      toast.success(`Clave "${key}" eliminada`)
      await loadStorageInfo()
    } catch (error) {
      console.error('Error deleting key:', error)
      toast.error('Error al eliminar la clave')
    }
  }

  const getStorageBadge = () => {
    if (storageMode === 'spark') {
      return (
        <Badge className="bg-green-500 text-white gap-1">
          <CheckCircle size={14} weight="fill" />
          Spark KV (Vercel)
        </Badge>
      )
    } else if (storageMode === 'gist') {
      return (
        <Badge className="bg-blue-500 text-white gap-1">
          <Globe size={14} />
          GitHub Gist
        </Badge>
      )
    } else {
      return (
        <Badge className="bg-orange-500 text-white gap-1">
          <Warning size={14} weight="fill" />
          localStorage
        </Badge>
      )
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Database className="h-5 w-5 text-primary" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold">Modo de Almacenamiento</h4>
                {getStorageBadge()}
              </div>
              <p className="text-sm text-muted-foreground">{storageDetails}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle size={16} className={isPersistent ? 'text-green-500' : 'text-muted-foreground'} weight={isPersistent ? 'fill' : 'regular'} />
              <span className={isPersistent ? 'text-foreground' : 'text-muted-foreground'}>
                {isPersistent ? 'Datos persistentes' : 'No persistente'}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Globe size={16} className={isShared ? 'text-blue-500' : 'text-muted-foreground'} weight={isShared ? 'fill' : 'regular'} />
              <span className={isShared ? 'text-foreground' : 'text-muted-foreground'}>
                {isShared ? 'Compartido entre dispositivos' : 'Solo este navegador'}
              </span>
            </div>
          </div>

          {storageMode === 'spark' && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" weight="fill" />
              <AlertDescription className="text-green-800">
                <strong>Perfecto!</strong> Estás usando Spark KV. Todos los datos persisten automáticamente entre sesiones y dispositivos cuando está desplegado en Vercel.
              </AlertDescription>
            </Alert>
          )}

          {storageMode === 'gist' && (
            <Alert className="bg-blue-50 border-blue-200">
              <Globe className="h-4 w-4 text-blue-600" weight="fill" />
              <AlertDescription className="text-blue-800">
                <strong>GitHub Gist configurado!</strong> Los datos se comparten entre todos los dispositivos mediante Gist ID: <code className="bg-blue-100 px-1 rounded">{gistId}</code>
              </AlertDescription>
            </Alert>
          )}

          {storageMode === 'shared' && (
            <>
              <Alert className="bg-orange-50 border-orange-200">
                <Warning className="h-4 w-4 text-orange-600" weight="fill" />
                <AlertDescription className="text-orange-800">
                  <strong>Nota:</strong> Los datos solo se guardan en este navegador. Para compartir datos entre dispositivos, configura GitHub Gist a continuación.
                </AlertDescription>
              </Alert>

              <div className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <GithubLogo size={20} className="text-foreground" weight="fill" />
                    <h4 className="font-semibold">Configurar GitHub Gist</h4>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowInstructions(!showInstructions)}
                  >
                    {showInstructions ? <CaretUp size={16} /> : <CaretDown size={16} />}
                    {showInstructions ? 'Ocultar' : 'Mostrar'} instrucciones
                  </Button>
                </div>

                {showInstructions && (
                  <Alert className="bg-blue-50 border-blue-200">
                    <Info className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800 text-sm space-y-2">
                      <p><strong>Cómo crear un token de GitHub:</strong></p>
                      <ol className="list-decimal ml-4 space-y-1">
                        <li>Ve a <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer" className="underline">GitHub Settings → Tokens</a></li>
                        <li>Click en "Generate new token (classic)"</li>
                        <li>Dale un nombre: "MeetUp Demo Day"</li>
                        <li>Marca solo el scope <code className="bg-blue-100 px-1 rounded">gist</code></li>
                        <li>Click en "Generate token" y copia el token (empieza con ghp_)</li>
                      </ol>
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-3">
                  <div>
                    <Label htmlFor="github-token">Token de GitHub</Label>
                    <Input
                      id="github-token"
                      type="password"
                      placeholder="ghp_..."
                      value={githubToken}
                      onChange={(e) => setGithubToken(e.target.value)}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="gist-id">Gist ID (opcional - dejar vacío para crear nuevo)</Label>
                    <Input
                      id="gist-id"
                      type="text"
                      placeholder="abc123def456..."
                      value={gistId}
                      onChange={(e) => setGistId(e.target.value)}
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Si ya tienes un Gist creado, pega su ID aquí. Si no, se creará uno nuevo.
                    </p>
                  </div>

                  <Button
                    onClick={handleConfigureGist}
                    disabled={isConfiguring || !githubToken.trim()}
                    className="w-full"
                  >
                    {isConfiguring ? 'Configurando...' : 'Configurar Almacenamiento Compartido'}
                  </Button>
                </div>
              </div>
            </>
          )}

          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-sm">Claves almacenadas ({keys.length})</h4>
              <Button variant="outline" size="sm" onClick={loadStorageInfo}>
                Actualizar
              </Button>
            </div>
            
            {!isLoading && keys.length > 0 && (
              <div className="space-y-1 max-h-64 overflow-y-auto">
                {keys.map((key) => (
                  <div key={key} className="flex items-center justify-between p-2 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                    <span className="font-mono text-xs">{key}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteKey(key)}
                      className="text-destructive hover:text-destructive h-7 w-7 p-0"
                    >
                      <Trash size={14} />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            {!isLoading && keys.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No hay claves almacenadas en el sistema
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
