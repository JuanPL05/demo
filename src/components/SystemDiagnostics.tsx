import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { getSystemState } from '@/lib/database'
import { getStorageInfo } from '@/lib/kv-adapter'
import type { SystemState } from '@/lib/types'
import { CheckCircle, XCircle, Warning, GithubLogo } from '@phosphor-icons/react'

export function SystemDiagnostics() {
  const [state, setState] = useState<SystemState | null>(null)
  const [loading, setLoading] = useState(true)
  const [storageMode, setStorageMode] = useState<string>('')
  const [isShared, setIsShared] = useState(false)

  useEffect(() => {
    const loadState = async () => {
      try {
        const systemState = await getSystemState()
        const storageInfo = await getStorageInfo()
        setState(systemState)
        setStorageMode(storageInfo.mode || '')
        setIsShared(storageInfo.isShared)
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
    <>
      {storageMode === 'shared' && (
        <Alert className="mb-6 bg-gradient-to-r from-orange-50 to-amber-50 border-orange-300">
          <Warning className="h-5 w-5 text-orange-600" weight="fill" />
          <AlertDescription className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <p className="font-semibold text-orange-900">
                Almacenamiento Local Detectado
              </p>
              <p className="text-sm text-orange-800">
                Los datos solo persisten en este navegador. Para compartir entre dispositivos y usuarios, configura GitHub Gist en el panel de administración.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="shrink-0 border-orange-300 hover:bg-orange-100"
              onClick={() => window.location.href = '#admin'}
            >
              <GithubLogo size={16} weight="fill" className="mr-1" />
              Configurar
            </Button>
          </AlertDescription>
        </Alert>
      )}
      
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
    </>
  )
}
