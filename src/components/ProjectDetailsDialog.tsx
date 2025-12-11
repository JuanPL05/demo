import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useState, useEffect } from 'react'
import { getBlocks, getQuestions, getEvaluations, getJudges } from '@/lib/database'
import type { ProjectScore, Block, Question, Evaluation, Judge } from '@/lib/types'

interface ProjectDetailsDialogProps {
  projectScore: ProjectScore | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProjectDetailsDialog({ projectScore, open, onOpenChange }: ProjectDetailsDialogProps) {
  const [loading, setLoading] = useState(true)
  const [questions, setQuestions] = useState<Question[]>([])
  const [evaluations, setEvaluations] = useState<Evaluation[]>([])
  const [blocks, setBlocks] = useState<Block[]>([])
  const [judges, setJudges] = useState<Judge[]>([])

  useEffect(() => {
    if (!open || !projectScore) return

    const loadData = async () => {
      try {
        setLoading(true)
        const [allQuestions, allEvaluations, allBlocks, allJudges] = await Promise.all([
          getQuestions(),
          getEvaluations(),
          getBlocks(),
          getJudges(),
        ])

        const projectQuestions = allQuestions.filter((q) => q.programId === projectScore.programId)
        const projectEvaluations = allEvaluations.filter((e) => e.projectId === projectScore.id)
        
        setQuestions(projectQuestions)
        setEvaluations(projectEvaluations)
        setBlocks(allBlocks)
        setJudges(allJudges)
      } catch (error) {
        console.error('Error loading project details:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [projectScore, open])

  if (!projectScore) return null

  const getEvaluationsForQuestion = (questionId: string) => {
    return evaluations.filter((e) => e.questionId === questionId)
  }

  const getJudgeName = (judgeId: string) => {
    const judge = judges.find((j) => j.id === judgeId)
    return judge ? judge.name : 'Unknown Judge'
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl">{projectScore.name}</DialogTitle>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="outline" className="text-lg px-3 py-1">
              Total: {projectScore.totalScore.toFixed(2)}
            </Badge>
          </div>
        </DialogHeader>
        <ScrollArea className="max-h-[calc(90vh-120px)] pr-4">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading details...</div>
          ) : (
            <div className="space-y-6">
              {projectScore.blockAverages.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Promedios por Bloque</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {projectScore.blockAverages.map((blockAvg, idx) => (
                      <Card key={idx}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">{blockAvg.blockName}</span>
                            <span className="text-2xl font-bold text-primary">
                              {blockAvg.average.toFixed(2)}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
              
              <Separator />
              
              <div>
                <h3 className="text-lg font-semibold mb-3">Evaluaciones Detalladas</h3>
                <div className="space-y-4">
                  {blocks
                    .sort((a, b) => a.order - b.order)
                    .map((block) => {
                      const blockQuestions = questions
                        .filter((q) => q.blockId === block.id)
                        .sort((a, b) => a.order - b.order)

                      if (blockQuestions.length === 0) return null

                      return (
                        <Card key={block.id}>
                          <CardContent className="p-4">
                            <h4 className="font-semibold text-lg mb-3">{block.name}</h4>
                            <div className="space-y-3">
                              {blockQuestions.map((question) => {
                                const questionEvals = getEvaluationsForQuestion(question.id)
                                const avgScore =
                                  questionEvals.length > 0
                                    ? questionEvals.reduce((sum, e) => sum + e.score, 0) /
                                      questionEvals.length
                                    : 0

                                return (
                                  <div key={question.id} className="border-l-2 border-muted pl-3">
                                    <div className="flex justify-between items-start mb-2">
                                      <div className="flex-1">
                                        <p className="font-medium">{question.text}</p>
                                        {question.description && (
                                          <p className="text-sm text-muted-foreground">
                                            {question.description}
                                          </p>
                                        )}
                                      </div>
                                      <Badge variant="secondary" className="ml-2">
                                        {avgScore.toFixed(2)} / {question.maxScore}
                                      </Badge>
                                    </div>
                                    {questionEvals.length > 0 && (
                                      <div className="mt-2 space-y-1">
                                        {questionEvals.map((evaluation) => (
                                          <div
                                            key={evaluation.id}
                                            className="text-sm flex justify-between items-center bg-muted rounded px-2 py-1"
                                          >
                                            <span className="text-muted-foreground">
                                              {getJudgeName(evaluation.judgeId)}
                                            </span>
                                            <span className="font-medium">
                                              {evaluation.score} / {question.maxScore}
                                            </span>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                )
                              })}
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                </div>
              </div>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
