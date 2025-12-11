import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getSystemState } from '@/lib/database'
import type { SystemState } from '@/lib/types'
import { CheckCircle, XCircle } from '@phosphor-icons/react'

export function SystemDiagnostics() {
  const [state, setState] = useState<SystemState | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadState = async () => {
      try {
        const systemState = await getSystemState()
        setState(systemState)
      } catch (error) {
        console.error('Error loading system state:', error)
      } finally {
        setLoading(false)
      }
    }
    loadState()
  }, [])

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-blue-50/80 via-white to-green-50/80 backdrop-blur border-blue-200/50 shadow-lg">
        <CardHeader>
          <CardTitle className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">Diagnóstico del Sistema</CardTitle>
          <CardDescription className="text-blue-600/70">Cargando...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const stats = [
    { label: 'Programas', count: state?.programs.length || 0, color: 'text-primary' },
    { label: 'Bloques', count: state?.blocks.length || 0, color: 'text-accent' },
    { label: 'Preguntas', count: state?.questions.length || 0, color: 'text-blue-400' },
    { label: 'Áreas', count: state?.teams.length || 0, color: 'text-green-400' },
    { label: 'Proyectos', count: state?.projects.length || 0, color: 'text-purple-400' },
    { label: 'Jueces', count: state?.judges.length || 0, color: 'text-orange-400' },
    { label: 'Evaluaciones', count: state?.evaluations.length || 0, color: 'text-pink-400' },
  ]

  const isHealthy = state && state.programs.length > 0 && state.projects.length > 0 && state.judges.length > 0

  return (
    <Card className="bg-gradient-to-br from-blue-50/80 via-white to-green-50/80 backdrop-blur border-blue-200/50 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">Diagnóstico del Sistema</CardTitle>
            <CardDescription className="text-blue-600/70">
              Estado actual de la base de datos
            </CardDescription>
          </div>
          <Badge
            variant={isHealthy ? 'default' : 'destructive'}
            className="flex items-center gap-1"
          >
            {isHealthy ? (
              <>
                <CheckCircle size={16} weight="fill" />
                <span>Operativo</span>
              </>
            ) : (
              <>
                <XCircle size={16} weight="fill" />
                <span>Sin datos</span>
              </>
            )}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className={`text-3xl font-bold ${stat.color} mb-1`}>{stat.count}</div>
              <div className="text-xs text-slate-600">{stat.label}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
