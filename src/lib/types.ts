export interface Program {
  id: string
  name: string
  description?: string
  createdAt: string
  updatedAt: string
}

export interface Block {
  id: string
  name: string
  description?: string
  programId: string
  order: number
  createdAt: string
  updatedAt: string
}

export interface Question {
  id: string
  text: string
  description?: string
  blockId: string
  programId: string
  order: number
  maxScore: number
  createdAt: string
  updatedAt: string
}

export interface Team {
  id: string
  name: string
  description?: string
  createdAt: string
  updatedAt: string
}

export interface Project {
  id: string
  name: string
  description?: string
  programId: string
  teamId: string
  createdAt: string
  updatedAt: string
}

export interface Judge {
  id: string
  name: string
  email: string
  token: string
  category?: string
  votingClosed?: boolean
  createdAt: string
  updatedAt: string
}

export interface Evaluation {
  id: string
  score: number
  judgeId: string
  projectId: string
  questionId: string
  createdAt: string
  updatedAt: string
}

export interface ProjectScore {
  id: string
  name: string
  team: string
  program: string
  programId: string
  totalScore: number
  averageScore: number
  maxPossibleScore: number
  completionPercentage: number
  evaluationCount: number
  rank: number
  blockAverages: Array<{
    blockName: string
    average: number
  }>
}

export interface JudgeStats {
  judgeId: string
  judgeName: string
  totalEvaluations: number
  completionPercentage: number
}

export interface SystemState {
  programs: Program[]
  blocks: Block[]
  questions: Question[]
  teams: Team[]
  projects: Project[]
  judges: Judge[]
  evaluations: Evaluation[]
  votingClosed: boolean
}
