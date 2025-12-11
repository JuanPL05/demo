import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Trophy, CheckCircle, Star, TrendUp } from '@phosphor-icons/react'
import type { Project, Question, Evaluation, Block, Program } from '@/lib/types'

interface JudgeDashboardProps {
  projects: Project[]
  questions: Question[]
  evaluations: Evaluation[]
  blocks: Block[]
  programs: Program[]
}

export function JudgeDashboard({
  projects,
  questions,
  evaluations,
  blocks,
  programs,
}: JudgeDashboardProps) {
  const totalProjects = projects.length
  const totalQuestions = questions.length
  const totalPossibleEvaluations = totalProjects * totalQuestions
  const completedEvaluations = evaluations.length
  const completionPercentage =
    totalPossibleEvaluations > 0 ? (completedEvaluations / totalPossibleEvaluations) * 100 : 0

  const evaluatedProjects = new Set(evaluations.map((e) => e.projectId)).size
  const averageScore =
    evaluations.length > 0
      ? evaluations.reduce((sum, e) => sum + e.score, 0) / evaluations.length
      : 0

  const projectStats = projects.map((project) => {
    const projectEvals = evaluations.filter((e) => e.projectId === project.id)
    const projectQuestions = questions.filter((q) => q.programId === project.programId)
    const avgScore =
      projectEvals.length > 0
        ? projectEvals.reduce((sum, e) => sum + e.score, 0) / projectEvals.length
        : 0
    const completion =
      projectQuestions.length > 0 ? (projectEvals.length / projectQuestions.length) * 100 : 0
    const program = programs.find((p) => p.id === project.programId)

    return {
      id: project.id,
      name: project.name,
      programName: program?.name || 'Sin programa',
      avgScore,
      completion,
      evaluationsCount: projectEvals.length,
      totalQuestions: projectQuestions.length,
    }
  })

  const sortedProjects = projectStats.sort((a, b) => b.avgScore - a.avgScore)

  const blockStats = blocks.map((block) => {
    const blockQuestions = questions.filter((q) => q.blockId === block.id)
    const blockEvals = evaluations.filter((e) =>
      blockQuestions.some((q) => q.id === e.questionId)
    )
    const avgScore =
      blockEvals.length > 0
        ? blockEvals.reduce((sum, e) => sum + e.score, 0) / blockEvals.length
        : 0

    return {
      blockName: block.name,
      avgScore,
      evaluationsCount: blockEvals.length,
    }
  })

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-primary/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Proyectos Evaluados
              </CardTitle>
              <Trophy size={20} className="text-primary" weight="duotone" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {evaluatedProjects}/{totalProjects}
            </div>
            <Progress value={(evaluatedProjects / totalProjects) * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card className="border-accent/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Evaluaciones Totales
              </CardTitle>
              <CheckCircle size={20} className="text-accent" weight="duotone" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">{completedEvaluations}</div>
            <p className="text-xs text-muted-foreground mt-2">
              De {totalPossibleEvaluations} posibles
            </p>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Puntuación Promedio
              </CardTitle>
              <Star size={20} className="text-primary" weight="duotone" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {averageScore.toFixed(1)}
              <span className="text-lg text-muted-foreground">/5</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">De tus evaluaciones</p>
          </CardContent>
        </Card>

        <Card className="border-accent/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Progreso Total
              </CardTitle>
              <TrendUp size={20} className="text-accent" weight="duotone" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-foreground">
              {completionPercentage.toFixed(0)}%
            </div>
            <Progress value={completionPercentage} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Trophy size={24} className="text-primary" weight="duotone" />
            Mis Evaluaciones por Proyecto
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {sortedProjects.map((project, index) => (
              <div
                key={project.id}
                className="flex items-center gap-4 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm flex-shrink-0">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold text-foreground truncate">{project.name}</p>
                    <Badge variant="outline" className="text-xs">
                      {project.programName}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-muted-foreground">
                      {project.evaluationsCount}/{project.totalQuestions} evaluadas
                    </span>
                    <Progress value={project.completion} className="w-24 h-1.5" />
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Star size={18} className="text-primary" weight="fill" />
                  <span className="font-bold text-lg text-foreground">
                    {project.avgScore > 0 ? project.avgScore.toFixed(1) : '-'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {blockStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle size={24} className="text-accent" weight="duotone" />
              Desempeño por Bloque
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {blockStats.map((block) => (
                <div
                  key={block.blockName}
                  className="flex items-center justify-between p-4 rounded-lg border border-border"
                >
                  <div>
                    <p className="font-medium text-foreground">{block.blockName}</p>
                    <p className="text-xs text-muted-foreground">
                      {block.evaluationsCount} evaluaciones
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star size={16} className="text-primary" weight="fill" />
                    <span className="font-bold text-xl text-foreground">
                      {block.avgScore > 0 ? block.avgScore.toFixed(1) : '-'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
