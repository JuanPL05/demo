import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Warning, CheckCircle, CaretDown, CaretUp, ChartBar } from '@phosphor-icons/react'
import { StarRating } from '@/components/StarRating'
import { JudgeDashboard } from '@/components/JudgeDashboard'
import {
  validateJudgeToken,
  getProjects,
  getPrograms,
  getBlocks,
  getQuestions,
  getTeams,
  getEvaluations,
  createEvaluation,
  getVotingClosed,
} from '@/lib/database'
import type { Judge, Project, Program, Block, Question, Team, Evaluation } from '@/lib/types'
import { toast } from 'sonner'

interface JudgePageProps {
  token: string
  navigate: (route: 'home' | 'admin' | 'dashboard' | 'judge', token?: string) => void
}

export function JudgePage({ token, navigate }: JudgePageProps) {
  const [judge, setJudge] = useState<Judge | null>(null)
  const [loading, setLoading] = useState(true)
  const [votingClosed, setVotingClosed] = useState(false)
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProjectId, setSelectedProjectId] = useState<string>('')
  const [programs, setPrograms] = useState<Program[]>([])
  const [blocks, setBlocks] = useState<Block[]>([])
  const [questions, setQuestions] = useState<Question[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [evaluations, setEvaluations] = useState<Evaluation[]>([])
  const [openBlocks, setOpenBlocks] = useState<Record<string, boolean>>({})
  const [activeTab, setActiveTab] = useState<'evaluation' | 'dashboard'>('evaluation')

  useEffect(() => {
    const validateAndLoad = async () => {
      try {
        const closed = await getVotingClosed()
        setVotingClosed(closed)

        const validatedJudge = await validateJudgeToken(token)
        if (!validatedJudge) {
          toast.error('Token inválido o expirado')
          navigate('home')
          return
        }
        setJudge(validatedJudge)

        const [projs, progs, blks, quests, tms, evals] = await Promise.all([
          getProjects(),
          getPrograms(),
          getBlocks(),
          getQuestions(),
          getTeams(),
          getEvaluations(),
        ])

        setProjects(projs)
        setPrograms(progs)
        setBlocks(blks)
        setQuestions(quests)
        setTeams(tms)
        setEvaluations(evals)

        if (projs.length > 0) {
          setSelectedProjectId(projs[0].id)
        }
      } catch (error) {
        console.error('Error loading judge page:', error)
        toast.error('Error al cargar datos')
      } finally {
        setLoading(false)
      }
    }

    validateAndLoad()
  }, [token, navigate])

  const selectedProject = projects.find((p) => p.id === selectedProjectId)
  const selectedProgram = selectedProject
    ? programs.find((p) => p.id === selectedProject.programId)
    : null
  const selectedTeam = selectedProject ? teams.find((t) => t.id === selectedProject.teamId) : null

  const projectQuestions = selectedProject
    ? questions.filter((q) => q.programId === selectedProject.programId)
    : []
  const projectBlocks = selectedProject
    ? blocks.filter((b) => b.programId === selectedProject.programId)
    : []

  const myEvaluations = judge ? evaluations.filter((e) => e.judgeId === judge.id) : []
  const projectEvaluations = myEvaluations.filter((e) => e.projectId === selectedProjectId)

  const getEvaluationForQuestion = (questionId: string) => {
    return projectEvaluations.find((e) => e.questionId === questionId)
  }

  const handleRate = async (questionId: string, score: number) => {
    if (!judge) return
    try {
      await createEvaluation({
        judgeId: judge.id,
        projectId: selectedProjectId,
        questionId,
        score,
      })
      toast.success('Evaluación guardada')
      const updatedEvaluations = await getEvaluations()
      setEvaluations(updatedEvaluations)
    } catch (error) {
      console.error('Error saving evaluation:', error)
      toast.error('Error al guardar evaluación')
    }
  }

  const toggleBlock = (blockId: string) => {
    setOpenBlocks((prev) => ({ ...prev, [blockId]: !prev[blockId] }))
  }

  const myEvaluationCount = myEvaluations.length
  const totalQuestions = questions.length * projects.length
  const completionPercentage = totalQuestions > 0 ? (myEvaluationCount / totalQuestions) * 100 : 0

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl font-semibold mb-2">Cargando...</div>
          <p className="text-muted-foreground">Validando token de acceso</p>
        </div>
      </div>
    )
  }

  if (votingClosed) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <Warning size={24} />
              Votación Cerrada
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              La evaluación ha sido cerrada por el administrador. Ya no se pueden enviar más
              evaluaciones.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!judge) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <Warning size={24} />
              Token Inválido
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              El token proporcionado no es válido o ha expirado. Por favor, verifica el enlace o
              contacta al administrador.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-teal-50/40">
      <div className="container mx-auto px-4 sm:px-6 py-8 max-w-7xl">
        <div className="bg-gradient-to-r from-cyan-400/90 to-teal-400/90 rounded-2xl p-6 sm:p-8 mb-8 shadow-lg">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex-1">
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">Panel de Evaluación</h1>
              <p className="text-white/90 text-lg">Bienvenido, <span className="font-semibold">{judge.name}</span></p>
            </div>
            <Card className="bg-white/95 backdrop-blur border-0 shadow-md">
              <CardContent className="p-4 flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-accent/10">
                  <CheckCircle size={24} weight="fill" className="text-accent" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">
                    {myEvaluationCount} de {projects.length} equipos evaluados
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {completionPercentage.toFixed(0)}% completado
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="flex gap-3 mb-8 border-b-2 border-slate-200">
          <button
            onClick={() => setActiveTab('evaluation')}
            className={`px-6 py-3 font-semibold transition-all ${
              activeTab === 'evaluation'
                ? 'text-cyan-600 border-b-4 border-cyan-500 bg-gradient-to-r from-cyan-400/10 to-teal-400/10 rounded-t-lg'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <CheckCircle size={20} />
              Evaluación
            </div>
          </button>
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-6 py-3 font-semibold transition-all ${
              activeTab === 'dashboard'
                ? 'text-cyan-600 border-b-4 border-cyan-500 bg-gradient-to-r from-cyan-400/10 to-teal-400/10 rounded-t-lg'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <div className="flex items-center gap-2">
              <ChartBar size={20} />
              Mi Dashboard
            </div>
          </button>
        </div>

        {activeTab === 'dashboard' ? (
          <JudgeDashboard
            projects={projects}
            questions={questions}
            evaluations={myEvaluations}
            blocks={blocks}
            programs={programs}
          />
        ) : (
          <>
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-3">Selecciona un equipo participante</h2>
              <p className="text-slate-600 mb-6">Elige un equipo participante de la lista para comenzar la evaluación</p>

              {selectedProject && (
                <Card className="bg-gradient-to-br from-teal-50/50 to-emerald-50/50 border-teal-200 mb-6">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-accent/80 text-white flex-shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-slate-900 mb-2">{selectedProject.name}</h3>
                        <div className="flex items-center gap-2 mb-2 text-slate-600">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                          </svg>
                          <span className="text-sm">Área: {selectedTeam?.name}</span>
                        </div>
                        {selectedProject.description && (
                          <p className="text-sm text-slate-600">Descripción: {selectedProject.description}</p>
                        )}
                      </div>
                      <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-accent text-white font-bold text-2xl flex-shrink-0">
                        {projects.findIndex(p => p.id === selectedProjectId) + 1}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {projects.map((project) => {
                  const prog = programs.find((pr) => pr.id === project.programId)
                  const team = teams.find((t) => t.id === project.teamId)
                  const isSelected = project.id === selectedProjectId
                  const projectEvals = myEvaluations.filter((e) => e.projectId === project.id)
                  const projectQuestionsCount = questions.filter((q) => q.programId === project.programId).length
                  const isComplete = projectEvals.length >= projectQuestionsCount

                  return (
                    <Card
                      key={project.id}
                      className={`cursor-pointer transition-all hover:shadow-lg ${
                        isSelected
                          ? 'border-2 border-accent shadow-md bg-accent/5'
                          : 'border border-slate-200 hover:border-accent/50'
                      }`}
                      onClick={() => setSelectedProjectId(project.id)}
                    >
                      <CardContent className="p-5">
                        <div className="flex items-start gap-3 mb-3">
                          <Badge className="bg-accent text-white font-semibold px-3 py-1 rounded-full">
                            {prog?.name}
                          </Badge>
                          {isComplete && (
                            <div className="ml-auto flex items-center gap-1 text-accent text-xs font-medium">
                              <CheckCircle size={14} weight="fill" />
                              Completo
                            </div>
                          )}
                        </div>
                        <h3 className="font-bold text-lg mb-2 text-slate-900">{project.name}</h3>
                        <div className="flex items-center gap-2 text-slate-600 text-sm">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                          </svg>
                          <span>Área: {team?.name}</span>
                        </div>
                        {project.description && (
                          <p className="text-xs text-slate-500 mt-2 line-clamp-2">
                            Descripción: {project.description}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>

            {selectedProject && projectBlocks.length > 0 ? (
              <div className="space-y-4">
                {projectBlocks
                  .sort((a, b) => a.order - b.order)
                  .map((block) => {
                    const blockQuestions = projectQuestions
                      .filter((q) => q.blockId === block.id)
                      .sort((a, b) => a.order - b.order)
                    const isOpen = openBlocks[block.id] !== false

                    return (
                      <Card key={block.id} className="border-slate-200 shadow-sm">
                        <Collapsible open={isOpen} onOpenChange={() => toggleBlock(block.id)}>
                          <CollapsibleTrigger asChild>
                            <CardHeader className="cursor-pointer hover:bg-slate-50 transition-colors">
                              <div className="flex items-center justify-between">
                                <div className="flex-1">
                                  <CardTitle className="text-xl">{block.name}</CardTitle>
                                  {block.description && (
                                    <CardDescription className="mt-1">
                                      {block.description}
                                    </CardDescription>
                                  )}
                                </div>
                                {isOpen ? (
                                  <CaretUp size={24} className="text-slate-400" />
                                ) : (
                                  <CaretDown size={24} className="text-slate-400" />
                                )}
                              </div>
                            </CardHeader>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <CardContent className="space-y-6 pt-6">
                              {blockQuestions.map((question) => {
                                const evaluation = getEvaluationForQuestion(question.id)
                                return (
                                  <div
                                    key={question.id}
                                    className="border-l-4 border-accent/40 pl-4 py-2"
                                  >
                                    <div className="mb-3">
                                      <div className="font-semibold mb-1">{question.text}</div>
                                      {question.description && (
                                        <div className="text-sm text-slate-500">
                                          {question.description}
                                        </div>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-4">
                                      <StarRating
                                        value={evaluation?.score || 0}
                                        onChange={(score) => handleRate(question.id, score)}
                                        size={28}
                                      />
                                      {evaluation && (
                                        <div className="flex items-center gap-2 text-accent">
                                          <CheckCircle size={20} weight="fill" />
                                          <span className="text-sm font-medium">Guardado</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )
                              })}
                            </CardContent>
                          </CollapsibleContent>
                        </Collapsible>
                      </Card>
                    )
                  })}
              </div>
            ) : (
              <Alert>
                <Warning size={16} className="text-slate-500" />
                <AlertDescription>
                  No hay preguntas disponibles para este proyecto. Contacta al administrador.
                </AlertDescription>
              </Alert>
            )}
          </>
        )}
      </div>
    </div>
  )
}

