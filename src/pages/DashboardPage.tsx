import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { ArrowLeft, Trophy, CheckCircle, ChartBar, Users, Eye } from '@phosphor-icons/react'
import { calculateProjectScores, getPrograms } from '@/lib/database'
import { ProjectDetailsDialog } from '@/components/ProjectDetailsDialog'
import type { ProjectScore, Program } from '@/lib/types'

interface DashboardPageProps {
  navigate: (route: 'home' | 'admin' | 'dashboard' | 'judge', token?: string) => void
}

export function DashboardPage({ navigate }: DashboardPageProps) {
  const [scores, setScores] = useState<ProjectScore[]>([])
  const [programs, setPrograms] = useState<Program[]>([])
  const [selectedProgram, setSelectedProgram] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [selectedProjectScore, setSelectedProjectScore] = useState<ProjectScore | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)

  const loadData = async () => {
    try {
      const programFilter = selectedProgram === 'all' ? undefined : selectedProgram
      const projectScores = await calculateProjectScores(programFilter)
      setScores(projectScores)
    } catch (error) {
      console.error('Error loading dashboard:', error)
    }
  }

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const progs = await getPrograms()
        setPrograms(progs)
      } catch (error) {
        console.error('Error loading programs:', error)
      }
    }
    fetchPrograms()
  }, [])

  useEffect(() => {
    setLoading(true)
    loadData().finally(() => setLoading(false))
  }, [selectedProgram])

  const handleViewDetails = (project: ProjectScore) => {
    setSelectedProjectScore(project)
    setDetailsOpen(true)
  }

  const totalProjects = scores.length
  const completedProjects = scores.filter((s) => s.completionPercentage === 100).length
  const avgScore =
    scores.length > 0
      ? scores.reduce((sum, s) => sum + s.averageScore, 0) / scores.length
      : 0
  const totalEvaluations = scores.reduce((sum, s) => sum + s.evaluationCount, 0)

  const getTrophyColor = (rank: number) => {
    if (rank === 1) return 'text-amber-500'
    if (rank === 2) return 'text-slate-400'
    if (rank === 3) return 'text-orange-600'
    return 'text-muted-foreground'
  }

  return (
    <>
      <ProjectDetailsDialog
        projectScore={selectedProjectScore}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
      />
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 sm:px-6 py-6 max-w-7xl">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => navigate('home')}>
            <ArrowLeft size={16} />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl sm:text-4xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground mt-1">Rankings y estadísticas en tiempo real</p>
          </div>
          <Select value={selectedProgram} onValueChange={setSelectedProgram}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los programas</SelectItem>
              {programs.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Proyectos</CardTitle>
              <Trophy size={16} className="text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalProjects}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Completados</CardTitle>
              <CheckCircle size={16} className="text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">{completedProjects}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Puntuación Promedio</CardTitle>
              <ChartBar size={16} className="text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{avgScore.toFixed(2)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Evaluaciones</CardTitle>
              <Users size={16} className="text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalEvaluations}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Rankings de Proyectos</CardTitle>
            <CardDescription>
              Ordenados por puntuación promedio
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-12 text-muted-foreground">Cargando...</div>
            ) : scores.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No hay proyectos para mostrar
              </div>
            ) : (
              <div className="space-y-4">
                {scores.map((project) => (
                  <Card
                    key={project.id}
                    className="p-4 hover:border-primary hover:shadow-md transition-all"
                  >
                    <div className="flex flex-col lg:flex-row gap-4">
                      <div className="flex items-center gap-4">
                        <div className="flex-shrink-0">
                          {project.rank <= 3 ? (
                            <Trophy
                              size={32}
                              weight="fill"
                              className={`${getTrophyColor(project.rank)} ${
                                project.rank === 1 ? 'animate-pulse' : ''
                              }`}
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                              <span className="text-sm font-semibold text-muted-foreground">
                                {project.rank}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-bold text-xl truncate">{project.name}</h3>
                          <div className="flex flex-wrap gap-2 mt-1">
                            <Badge className="bg-primary">{project.program}</Badge>
                            <Badge variant="outline" className="border-accent">
                              {project.team}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-4 lg:ml-auto items-stretch sm:items-center">
                        <div className="text-center sm:text-right">
                          <div className="text-3xl font-bold text-primary">
                            {project.averageScore.toFixed(2)}
                          </div>
                          <div className="text-xs text-muted-foreground">Puntuación</div>
                        </div>
                        <div className="flex-1 min-w-[200px]">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-muted-foreground">Completitud</span>
                            <span className="font-medium">{project.completionPercentage}%</span>
                          </div>
                          <Progress value={project.completionPercentage} className="h-2" />
                          <div className="text-xs text-muted-foreground mt-1">
                            {project.evaluationCount} evaluaciones
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewDetails(project)}
                          className="gap-2"
                        >
                          <Eye size={16} />
                          Detalles
                        </Button>
                      </div>
                    </div>

                    {project.blockAverages.length > 0 && (
                      <div className="mt-4 pt-4 border-t">
                        <div className="text-sm font-medium mb-2">Promedios por bloque:</div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                          {project.blockAverages.map((block, idx) => (
                            <div
                              key={idx}
                              className="bg-muted rounded px-2 py-1 text-xs"
                            >
                              <div className="font-medium truncate">{block.blockName}</div>
                              <div className="text-primary font-bold">{block.average.toFixed(2)}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
    </>
  )
}

