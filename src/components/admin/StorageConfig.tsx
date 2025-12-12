import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Database, Trash, CheckCircle, Warning, Users } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { kvAdapter, getStorageInfo } from '@/lib/kv-adapter'

export function StorageConfig() {
  const [keys, setKeys] = useState<string[]>([])
  const [storageDetails, setStorageDetails] = useState<string>('')
  const [storageMode, setStorageMode] = useState<string>('')
  const [isPersistent, setIsPersistent] = useState(false)
  const [isShared, setIsShared] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadStorageInfo()
  }, [])

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

          {storageMode === 'spark' && (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" weight="fill" />
              <AlertDescription className="text-green-800">
                <strong>¡Perfecto!</strong> Estás usando Spark KV. Todos los datos persisten automáticamente y se comparten entre todos los usuarios (admin y jueces).
              </AlertDescription>
            </Alert>
          )}

          {storageMode === 'shared' && (
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

