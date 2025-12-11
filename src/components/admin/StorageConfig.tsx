import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Database, Trash } from '@phosphor-icons/react'
import { toast } from 'sonner'


const spark = window.spark

export function StorageConfig() {
  const [keys, setKeys] = useState<string[]>([])
  const [storageInfo, setStorageInfo] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadStorageInfo()
  }, [])

  const loadStorageInfo = async () => {
    try {
      setIsLoading(true)
      const allKeys = await spark.kv.keys()
      setKeys(allKeys)
      setStorageInfo(`${allKeys.length} claves almacenadas en el sistema`)
    } catch (error) {
      console.error('Error loading storage info:', error)
      setStorageInfo('Error al cargar información de almacenamiento')
    } finally {
      setIsLoading(false)
    }
  }

  const deleteKey = async (key: string) => {
    if (!confirm(`¿Estás seguro de eliminar la clave "${key}"?`)) return
    
    try {
      await spark.kv.delete(key)
      toast.success(`Clave "${key}" eliminada`)
      await loadStorageInfo()
    } catch (error) {
      console.error('Error deleting key:', error)
      toast.error('Error al eliminar la clave')
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <Alert className="mb-4">
          <Database className="h-4 w-4" />
          <AlertDescription>{storageInfo}</AlertDescription>
        </Alert>

        {!isLoading && keys.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Claves almacenadas:</h4>
            <div className="space-y-1">
              {keys.map((key) => (
                <div key={key} className="flex items-center justify-between p-2 rounded-lg border bg-card">
                  <span className="font-mono text-sm">{key}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteKey(key)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {!isLoading && keys.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No hay claves almacenadas en el sistema
          </p>
        )}
      </CardContent>
    </Card>
  )
}
