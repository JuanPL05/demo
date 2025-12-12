import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Database, Trash, CheckCircle, Warning, Users, Copy, Key, GithubLogo } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { kvAdapter, getStorageInfo, configureGistStorage } from '@/lib/kv-adapter'

export function StorageConfig() {
  const [keys, setKeys] = useState<string[]>([])
  const [storageDetails, setStorageDetails] = useState<string>('')
  const [storageMode, setStorageMode] = useState<string>('')
  const [isPersistent, setIsPersistent] = useState(false)
  const [isShared, setIsShared] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [githubToken, setGithubToken] = useState('')
  const [gistId, setGistId] = useState('')
  const [showConfig, setShowConfig] = useState(false)
  const [configLoading, setConfigLoading] = useState(false)

  useEffect(() => {
    loadStorageInfo()
    loadCurrentConfig()
  }, [])

  const loadCurrentConfig = () => {
    const savedToken = localStorage.getItem('meetup_github_token')
    const savedGistId = localStorage.getItem('meetup_gist_id')
    if (savedToken) setGithubToken(savedToken)
    if (savedGistId) setGistId(savedGistId)
  }

  const loadStorageInfo = async () => {
    try {
      setIsLoading(true)
      const info = await getStorageInfo()
      const allKeys = await kvAdapter.keys()
      
      setKeys(allKeys)
      setStorageDetails(info.details)
      setStorageMode(info.mode || 'unknown')
      setIsPersistent(info.isPersistent)
      setIsShared(info.isShared)
    } catch (error) {
      console.error('Error loading storage info:', error)
      setStorageDetails('Error al cargar información de almacenamiento')
    } finally {
      setIsLoading(false)
    }
  }

  const handleConfigureGist = async () => {
    if (!githubToken.trim()) {
      toast.error('Por favor ingresa un GitHub Token válido')
      return
    }

    setConfigLoading(true)
    try {
      const resultGistId = await configureGistStorage(githubToken, gistId || undefined)
      setGistId(resultGistId)
      toast.success('Configuración de GitHub Gist guardada exitosamente')
      setShowConfig(false)
      await loadStorageInfo()
    } catch (error) {
      console.error('Error configuring Gist:', error)
      toast.error('Error al configurar GitHub Gist. Verifica tu token.')
    } finally {
      setConfigLoading(false)
    }
  }

  const copyGistId = () => {
    if (gistId) {
      navigator.clipboard.writeText(gistId)
      toast.success('Gist ID copiado al portapapeles')
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
          Spark KV
        </Badge>
      )
    } else if (storageMode === 'gist') {
      return (
        <Badge className="bg-blue-500 text-white gap-1">
          <GithubLogo size={14} weight="fill" />
          GitHub Gist
        </Badge>
      )
    } else {
      return (
        <Badge className="bg-blue-500 text-white gap-1">
          <Users size={14} weight="fill" />
          localStorage Compartido
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
              <Users size={16} className={isShared ? 'text-blue-500' : 'text-muted-foreground'} weight={isShared ? 'fill' : 'regular'} />
              <span className={isShared ? 'text-foreground' : 'text-muted-foreground'}>
                {isShared ? 'Compartido' : 'Solo este navegador'}
              </span>
            </div>
          </div>

          {gistId && (
            <Alert className="bg-cyan-50 border-cyan-200">
              <GithubLogo className="h-4 w-4 text-cyan-600" weight="fill" />
              <AlertDescription className="text-cyan-900">
                <div className="space-y-2">
                  <p className="font-semibold">Gist ID Configurado</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 px-3 py-2 bg-white rounded text-sm font-mono border border-cyan-300">
                      {gistId}
                    </code>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={copyGistId}
                      className="shrink-0"
                    >
                      <Copy size={14} className="mr-1" />
                      Copiar
                    </Button>
                  </div>
                  <p className="text-sm text-cyan-700">
                    <strong>Importante:</strong> Comparte este Gist ID con los jueces para que puedan sincronizar sus datos.
                  </p>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {!showConfig && !gistId && storageMode === 'shared' && (
            <Alert className="bg-yellow-50 border-yellow-200">
              <Warning className="h-4 w-4 text-yellow-600" weight="fill" />
              <AlertDescription className="text-yellow-900 space-y-2">
                <p><strong>Almacenamiento Local</strong></p>
                <p className="text-sm">Los datos solo se comparten en este navegador. Para sincronizar entre dispositivos, configura GitHub Gist.</p>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowConfig(true)}
                  className="mt-2"
                >
                  <GithubLogo size={14} className="mr-1" weight="fill" />
                  Configurar GitHub Gist
                </Button>
              </AlertDescription>
            </Alert>
          )}

          {showConfig && (
            <Card className="border-blue-200 bg-blue-50/50">
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-blue-900">Configurar GitHub Gist</h4>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowConfig(false)}
                  >
                    Cancelar
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="admin-github-token" className="flex items-center gap-2">
                    <Key size={14} />
                    GitHub Token
                  </Label>
                  <Input
                    id="admin-github-token"
                    type="password"
                    placeholder="ghp_..."
                    value={githubToken}
                    onChange={(e) => setGithubToken(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Token de acceso personal con permisos de gist
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="admin-gist-id" className="flex items-center gap-2">
                    <GithubLogo size={14} />
                    Gist ID (opcional)
                  </Label>
                  <Input
                    id="admin-gist-id"
                    type="text"
                    placeholder="abc123def456... (dejar vacío para crear uno nuevo)"
                    value={gistId}
                    onChange={(e) => setGistId(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    ID del Gist existente o déjalo vacío para crear uno nuevo
                  </p>
                </div>

                <Button
                  onClick={handleConfigureGist}
                  disabled={configLoading || !githubToken.trim()}
                  className="w-full"
                >
                  {configLoading ? 'Configurando...' : 'Guardar Configuración'}
                </Button>
              </CardContent>
            </Card>
          )}

          {gistId && !showConfig && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowConfig(true)}
              className="w-full"
            >
              <GithubLogo size={14} className="mr-1" weight="fill" />
              Actualizar Configuración de GitHub Gist
            </Button>
          )}

          {storageMode === 'spark' && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" weight="fill" />
              <AlertDescription className="text-green-800">
                <strong>¡Perfecto!</strong> Estás usando Spark KV. Todos los datos persisten automáticamente y se comparten entre todos los usuarios (admin y jueces).
              </AlertDescription>
            </Alert>
          )}

          {storageMode === 'gist' && (
            <Alert className="bg-blue-50 border-blue-200">
              <GithubLogo className="h-4 w-4 text-blue-600" weight="fill" />
              <AlertDescription className="text-blue-800 space-y-2">
                <p><strong>GitHub Gist Activo</strong></p>
                <p className="text-sm">Los datos se sincronizan automáticamente entre todos los dispositivos y usuarios configurados con el mismo Gist ID.</p>
              </AlertDescription>
            </Alert>
          )}

          {storageMode === 'shared' && !showConfig && !gistId && (
            <Alert className="bg-blue-50 border-blue-200">
              <Users className="h-4 w-4 text-blue-600" weight="fill" />
              <AlertDescription className="text-blue-800 space-y-2">
                <p><strong>Almacenamiento Local Compartido</strong></p>
                <p className="text-sm">Los datos que configures como administrador serán visibles automáticamente para todos los jueces que accedan desde este mismo navegador/dispositivo.</p>
                <p className="text-sm"><strong>Importante:</strong> Los jueces NO necesitan configurar nada adicional. Solo necesitan su token de acceso.</p>
              </AlertDescription>
            </Alert>
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

