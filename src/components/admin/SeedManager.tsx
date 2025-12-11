import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { seedData, clearAllData } from '@/lib/database'
import { CheckCircle, Warning, Trash } from '@phosphor-icons/react'
import { toast } from 'sonner'

export function SeedManager() {
  const [loading, setLoading] = useState(false)

  const handleSeed = async () => {
    try {
      setLoading(true)
      await seedData()
      toast.success('Datos de prueba cargados exitosamente')
      window.location.reload()
    } catch (error) {
      console.error('Error seeding data:', error)
      toast.error('Error al cargar datos de prueba')
    } finally {
      setLoading(false)
    }
  }

  const handleClear = async () => {
    if (!confirm('¿Estás seguro de eliminar TODOS los datos? Esta acción no se puede deshacer.')) {
      return
    }
    try {
      setLoading(true)
      await clearAllData()
      toast.success('Todos los datos han sido eliminados')
      window.location.reload()
    } catch (error) {
      console.error('Error clearing data:', error)
      toast.error('Error al eliminar datos')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Alert>
        <CheckCircle size={16} className="text-accent" />
        <AlertDescription>
          Usa esta herramienta para cargar datos de ejemplo o limpiar la base de datos por completo.
        </AlertDescription>
      </Alert>

      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Cargar Datos de Prueba</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Carga 1 programa (Aceleración), 7 bloques de evaluación, 14 preguntas (total 10 puntos), 3 áreas, 4 proyectos y 3 jueces de ejemplo.
            </p>
            <Button onClick={handleSeed} disabled={loading} className="w-full sm:w-auto">
              <CheckCircle size={16} className="mr-2" />
              Cargar Datos de Prueba
            </Button>
          </div>

          <div className="border-t pt-4">
            <div className="flex items-start gap-2 mb-4">
              <Warning size={20} className="text-destructive flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="font-semibold text-destructive">Zona Peligrosa</h4>
                <p className="text-sm text-muted-foreground">
                  Elimina TODOS los datos del sistema permanentemente. Esta acción no se puede deshacer.
                </p>
              </div>
            </div>
            <Button
              onClick={handleClear}
              disabled={loading}
              variant="destructive"
              className="w-full sm:w-auto"
            >
              <Trash size={16} className="mr-2" />
              Eliminar Todos los Datos
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
