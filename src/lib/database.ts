import type {
  Program,
  Block,
  Question,
  Team,
  Project,
  Judge,
  Evaluation,
  ProjectScore,
  SystemState,
} from './types'
import { kvAdapter as kv } from './kv-adapter'

const KV_KEYS = {
  PROGRAMS: 'programs',
  BLOCKS: 'blocks',
  QUESTIONS: 'questions',
  TEAMS: 'teams',
  PROJECTS: 'projects',
  JUDGES: 'judges',
  EVALUATIONS: 'evaluations',
  VOTING_CLOSED: 'voting_closed',
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`
}

function generateTokenFromName(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export async function getPrograms(): Promise<Program[]> {
  return (await kv.get<Program[]>(KV_KEYS.PROGRAMS)) || []
}

export async function getBlocks(): Promise<Block[]> {
  return (await kv.get<Block[]>(KV_KEYS.BLOCKS)) || []
}

export async function getQuestions(): Promise<Question[]> {
  return (await kv.get<Question[]>(KV_KEYS.QUESTIONS)) || []
}

export async function getTeams(): Promise<Team[]> {
  return (await kv.get<Team[]>(KV_KEYS.TEAMS)) || []
}

export async function getProjects(): Promise<Project[]> {
  return (await kv.get<Project[]>(KV_KEYS.PROJECTS)) || []
}

export async function getJudges(): Promise<Judge[]> {
  return (await kv.get<Judge[]>(KV_KEYS.JUDGES)) || []
}

export async function getEvaluations(): Promise<Evaluation[]> {
  return (await kv.get<Evaluation[]>(KV_KEYS.EVALUATIONS)) || []
}

export async function getVotingClosed(): Promise<boolean> {
  return (await kv.get<boolean>(KV_KEYS.VOTING_CLOSED)) || false
}

export async function setVotingClosed(closed: boolean): Promise<void> {
  await kv.set(KV_KEYS.VOTING_CLOSED, closed)
}

export async function createProgram(
  data: Omit<Program, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Program> {
  const programs = await getPrograms()
  const now = new Date().toISOString()
  const program: Program = {
    ...data,
    id: generateId(),
    createdAt: now,
    updatedAt: now,
  }
  await kv.set(KV_KEYS.PROGRAMS, [...programs, program])
  return program
}

export async function updateProgram(id: string, data: Partial<Program>): Promise<Program | null> {
  const programs = await getPrograms()
  const index = programs.findIndex((p) => p.id === id)
  if (index === -1) return null
  
  const updated = {
    ...programs[index],
    ...data,
    id,
    updatedAt: new Date().toISOString(),
  }
  programs[index] = updated
  await kv.set(KV_KEYS.PROGRAMS, programs)
  return updated
}

export async function deleteProgram(id: string): Promise<boolean> {
  const programs = await getPrograms()
  const filtered = programs.filter((p) => p.id !== id)
  if (filtered.length === programs.length) return false
  await kv.set(KV_KEYS.PROGRAMS, filtered)
  return true
}

export async function createBlock(data: Omit<Block, 'id' | 'createdAt' | 'updatedAt'>): Promise<Block> {
  const blocks = await getBlocks()
  const now = new Date().toISOString()
  const block: Block = {
    ...data,
    id: generateId(),
    createdAt: now,
    updatedAt: now,
  }
  await kv.set(KV_KEYS.BLOCKS, [...blocks, block])
  return block
}

export async function updateBlock(id: string, data: Partial<Block>): Promise<Block | null> {
  const blocks = await getBlocks()
  const index = blocks.findIndex((b) => b.id === id)
  if (index === -1) return null
  
  const updated = {
    ...blocks[index],
    ...data,
    id,
    updatedAt: new Date().toISOString(),
  }
  blocks[index] = updated
  await kv.set(KV_KEYS.BLOCKS, blocks)
  return updated
}

export async function deleteBlock(id: string): Promise<boolean> {
  const blocks = await getBlocks()
  const filtered = blocks.filter((b) => b.id !== id)
  if (filtered.length === blocks.length) return false
  await kv.set(KV_KEYS.BLOCKS, filtered)
  return true
}

export async function createQuestion(
  data: Omit<Question, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Question> {
  const questions = await getQuestions()
  const now = new Date().toISOString()
  const question: Question = {
    ...data,
    id: generateId(),
    createdAt: now,
    updatedAt: now,
  }
  await kv.set(KV_KEYS.QUESTIONS, [...questions, question])
  return question
}

export async function updateQuestion(id: string, data: Partial<Question>): Promise<Question | null> {
  const questions = await getQuestions()
  const index = questions.findIndex((q) => q.id === id)
  if (index === -1) return null
  
  const updated = {
    ...questions[index],
    ...data,
    id,
    updatedAt: new Date().toISOString(),
  }
  questions[index] = updated
  await kv.set(KV_KEYS.QUESTIONS, questions)
  return updated
}

export async function deleteQuestion(id: string): Promise<boolean> {
  const questions = await getQuestions()
  const filtered = questions.filter((q) => q.id !== id)
  if (filtered.length === questions.length) return false
  await kv.set(KV_KEYS.QUESTIONS, filtered)
  return true
}

export async function createTeam(data: Omit<Team, 'id' | 'createdAt' | 'updatedAt'>): Promise<Team> {
  const teams = await getTeams()
  const now = new Date().toISOString()
  const team: Team = {
    ...data,
    id: generateId(),
    createdAt: now,
    updatedAt: now,
  }
  await kv.set(KV_KEYS.TEAMS, [...teams, team])
  return team
}

export async function updateTeam(id: string, data: Partial<Team>): Promise<Team | null> {
  const teams = await getTeams()
  const index = teams.findIndex((t) => t.id === id)
  if (index === -1) return null
  
  const updated = {
    ...teams[index],
    ...data,
    id,
    updatedAt: new Date().toISOString(),
  }
  teams[index] = updated
  await kv.set(KV_KEYS.TEAMS, teams)
  return updated
}

export async function deleteTeam(id: string): Promise<boolean> {
  const teams = await getTeams()
  const filtered = teams.filter((t) => t.id !== id)
  if (filtered.length === teams.length) return false
  await kv.set(KV_KEYS.TEAMS, filtered)
  return true
}

export async function createProject(
  data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Project> {
  const projects = await getProjects()
  const now = new Date().toISOString()
  const project: Project = {
    ...data,
    id: generateId(),
    createdAt: now,
    updatedAt: now,
  }
  await kv.set(KV_KEYS.PROJECTS, [...projects, project])
  return project
}

export async function updateProject(id: string, data: Partial<Project>): Promise<Project | null> {
  const projects = await getProjects()
  const index = projects.findIndex((p) => p.id === id)
  if (index === -1) return null
  
  const updated = {
    ...projects[index],
    ...data,
    id,
    updatedAt: new Date().toISOString(),
  }
  projects[index] = updated
  await kv.set(KV_KEYS.PROJECTS, projects)
  return updated
}

export async function deleteProject(id: string): Promise<boolean> {
  const projects = await getProjects()
  const filtered = projects.filter((p) => p.id !== id)
  if (filtered.length === projects.length) return false
  await kv.set(KV_KEYS.PROJECTS, filtered)
  return true
}

export async function createJudge(data: Omit<Judge, 'id' | 'createdAt' | 'updatedAt'>): Promise<Judge> {
  const judges = await getJudges()
  const now = new Date().toISOString()
  
  const token = data.token || generateTokenFromName(data.name)
  
  const existingToken = judges.find((j) => j.token === token)
  if (existingToken) {
    throw new Error(`El token "${token}" ya existe. Por favor use un nombre diferente.`)
  }
  
  const judge: Judge = {
    ...data,
    token,
    id: generateId(),
    createdAt: now,
    updatedAt: now,
  }
  await kv.set(KV_KEYS.JUDGES, [...judges, judge])
  return judge
}

export async function updateJudge(id: string, data: Partial<Judge>): Promise<Judge | null> {
  const judges = await getJudges()
  const index = judges.findIndex((j) => j.id === id)
  if (index === -1) return null
  
  const updated = {
    ...judges[index],
    ...data,
    id,
    updatedAt: new Date().toISOString(),
  }
  judges[index] = updated
  await kv.set(KV_KEYS.JUDGES, judges)
  return updated
}

export async function deleteJudge(id: string): Promise<boolean> {
  const judges = await getJudges()
  const filtered = judges.filter((j) => j.id !== id)
  if (filtered.length === judges.length) return false
  await kv.set(KV_KEYS.JUDGES, filtered)
  return true
}

export async function createEvaluation(
  data: Omit<Evaluation, 'id' | 'createdAt' | 'updatedAt'>
): Promise<Evaluation> {
  const evaluations = await getEvaluations()
  const existing = evaluations.find(
    (e) =>
      e.judgeId === data.judgeId &&
      e.projectId === data.projectId &&
      e.questionId === data.questionId
  )

  if (existing) {
    return updateEvaluation(existing.id, { score: data.score }) as Promise<Evaluation>
  }

  const now = new Date().toISOString()
  const evaluation: Evaluation = {
    ...data,
    id: generateId(),
    createdAt: now,
    updatedAt: now,
  }
  await kv.set(KV_KEYS.EVALUATIONS, [...evaluations, evaluation])
  return evaluation
}

export async function updateEvaluation(
  id: string,
  data: Partial<Evaluation>
): Promise<Evaluation | null> {
  const evaluations = await getEvaluations()
  const index = evaluations.findIndex((e) => e.id === id)
  if (index === -1) return null
  
  const updated = {
    ...evaluations[index],
    ...data,
    id,
    updatedAt: new Date().toISOString(),
  }
  evaluations[index] = updated
  await kv.set(KV_KEYS.EVALUATIONS, evaluations)
  return updated
}

export async function deleteEvaluation(id: string): Promise<boolean> {
  const evaluations = await getEvaluations()
  const filtered = evaluations.filter((e) => e.id !== id)
  if (filtered.length === evaluations.length) return false
  await kv.set(KV_KEYS.EVALUATIONS, filtered)
  return true
}

export async function validateJudgeToken(token: string): Promise<Judge | null> {
  const judges = await getJudges()
  return judges.find((j) => j.token === token) || null
}

export async function calculateProjectScores(filterProgramId?: string): Promise<ProjectScore[]> {
  const projects = await getProjects()
  const programs = await getPrograms()
  const teams = await getTeams()
  const evaluations = await getEvaluations()
  const questions = await getQuestions()
  const blocks = await getBlocks()
  const judges = await getJudges()

  let filteredProjects = projects
  if (filterProgramId) {
    filteredProjects = projects.filter((p) => p.programId === filterProgramId)
  }

  const scores: ProjectScore[] = filteredProjects.map((project) => {
    const program = programs.find((p) => p.id === project.programId)
    const team = teams.find((t) => t.id === project.teamId)
    const projectEvaluations = evaluations.filter((e) => e.projectId === project.id)
    const projectQuestions = questions.filter((q) => q.programId === project.programId)

    const totalScore = projectEvaluations.reduce((sum, e) => sum + e.score, 0)
    const averageScore = projectEvaluations.length > 0 ? totalScore / projectEvaluations.length : 0
    
    const maxPossibleScore = projectQuestions.length * judges.length * 5
    const completionPercentage =
      maxPossibleScore > 0 ? (projectEvaluations.length / (projectQuestions.length * judges.length)) * 100 : 0

    const blockAverages = blocks
      .filter((b) => b.programId === project.programId)
      .map((block) => {
        const blockQuestions = questions.filter((q) => q.blockId === block.id)
        const blockQuestionIds = blockQuestions.map((q) => q.id)
        const blockEvaluations = projectEvaluations.filter((e) =>
          blockQuestionIds.includes(e.questionId)
        )
        const blockAverage =
          blockEvaluations.length > 0
            ? blockEvaluations.reduce((sum, e) => sum + e.score, 0) / blockEvaluations.length
            : 0
        return {
          blockName: block.name,
          average: Math.round(blockAverage * 100) / 100,
        }
      })

    return {
      id: project.id,
      name: project.name,
      team: team?.name || 'Sin equipo',
      program: program?.name || 'Sin programa',
      programId: project.programId,
      totalScore: Math.round(totalScore * 100) / 100,
      averageScore: Math.round(averageScore * 100) / 100,
      maxPossibleScore,
      completionPercentage: Math.round(completionPercentage * 100) / 100,
      evaluationCount: projectEvaluations.length,
      rank: 0,
      blockAverages,
    }
  })

  scores.sort((a, b) => b.averageScore - a.averageScore)
  scores.forEach((score, index) => {
    score.rank = index + 1
  })

  return scores
}

export async function seedData(): Promise<void> {
  const programs: Program[] = [
    {
      id: generateId(),
      name: 'ACELERACIÓN',
      description: 'Para startups en crecimiento',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]
  await kv.set(KV_KEYS.PROGRAMS, programs)

  const blocks: Block[] = [
    {
      id: generateId(),
      name: 'Tracción',
      description: 'Evidencia de crecimiento y consolidación del negocio',
      programId: programs[0].id,
      order: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: generateId(),
      name: 'Rentabilidad',
      description: 'Modelo de negocio y estructura financiera',
      programId: programs[0].id,
      order: 2,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: generateId(),
      name: 'Escalabilidad',
      description: 'Potencial de crecimiento y expansión',
      programId: programs[0].id,
      order: 3,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: generateId(),
      name: 'Propuesta de Valor',
      description: 'Diferenciación y ventajas competitivas',
      programId: programs[0].id,
      order: 4,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: generateId(),
      name: 'Uso de Tecnología / Innovación',
      description: 'Aplicación de tecnología e innovación',
      programId: programs[0].id,
      order: 5,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: generateId(),
      name: 'Visión Estratégica y Futuro',
      description: 'Planificación y visión de crecimiento',
      programId: programs[0].id,
      order: 6,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: generateId(),
      name: 'Capacidad del Equipo',
      description: 'Experiencia y cohesión del equipo fundador',
      programId: programs[0].id,
      order: 7,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]
  await kv.set(KV_KEYS.BLOCKS, blocks)

  const questions: Question[] = [
    {
      id: generateId(),
      text: '¿Existen datos claros de ventas, contratos u otras métricas de crecimiento?',
      description: 'Evalúa si muestran números, validaciones, resultados.',
      blockId: blocks[0].id,
      programId: programs[0].id,
      order: 1,
      maxScore: 0.7,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: generateId(),
      text: '¿Se percibe una tendencia de crecimiento o consolidación en su modelo?',
      description: 'Fíjate si el negocio está avanzando o estancado.',
      blockId: blocks[0].id,
      programId: programs[0].id,
      order: 2,
      maxScore: 0.8,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: generateId(),
      text: '¿El modelo de negocio muestra ingresos consistentes o una estructura clara para generarlos?',
      description: '¿Tienen ingresos? ¿Saben cómo ganarán dinero?',
      blockId: blocks[1].id,
      programId: programs[0].id,
      order: 1,
      maxScore: 0.7,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: generateId(),
      text: '¿Existe una ruta financiera clara hacia la rentabilidad en los próximos 18 meses?',
      description: 'Considera planes, proyecciones o eficiencia del modelo.',
      blockId: blocks[1].id,
      programId: programs[0].id,
      order: 2,
      maxScore: 0.8,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: generateId(),
      text: '¿El negocio puede crecer a otros mercados, regiones o segmentos?',
      description: 'Evalúa si hay un plan o visión más allá de lo actual.',
      blockId: blocks[2].id,
      programId: programs[0].id,
      order: 1,
      maxScore: 0.8,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: generateId(),
      text: '¿Los procesos, equipo y estructura permiten escalar sin perder eficiencia?',
      description: 'Fíjate en la preparación para crecer sin colapsar.',
      blockId: blocks[2].id,
      programId: programs[0].id,
      order: 2,
      maxScore: 0.7,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: generateId(),
      text: '¿El producto o servicio tiene atributos diferenciadores frente a la competencia?',
      description: '¿Por qué alguien debería preferirlos?',
      blockId: blocks[3].id,
      programId: programs[0].id,
      order: 1,
      maxScore: 0.8,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: generateId(),
      text: '¿Esa ventaja competitiva es difícil de replicar o mantener en el tiempo?',
      description: 'Evalúa si pueden sostener esa ventaja.',
      blockId: blocks[3].id,
      programId: programs[0].id,
      order: 2,
      maxScore: 0.7,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: generateId(),
      text: '¿El negocio aplica tecnologías o metodologías innovadoras en su operación o producto?',
      description: 'Herramientas digitales, técnicas, nuevos modelos.',
      blockId: blocks[4].id,
      programId: programs[0].id,
      order: 1,
      maxScore: 0.7,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: generateId(),
      text: '¿La innovación mejora significativamente algún proceso, producto o experiencia del cliente?',
      description: 'Impacto real de lo innovador.',
      blockId: blocks[4].id,
      programId: programs[0].id,
      order: 2,
      maxScore: 0.8,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: generateId(),
      text: '¿El equipo identifica claramente sus áreas de mejora o expansión?',
      description: 'Evalúa si tienen autodiagnóstico y foco.',
      blockId: blocks[5].id,
      programId: programs[0].id,
      order: 1,
      maxScore: 0.7,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: generateId(),
      text: '¿Saben cómo podrían aprovechar inversión o acompañamiento externo?',
      description: '¿Tienen claridad de para qué usarían los recursos?',
      blockId: blocks[5].id,
      programId: programs[0].id,
      order: 2,
      maxScore: 0.8,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: generateId(),
      text: '¿El equipo tiene experiencia comprobable para ejecutar y escalar el negocio?',
      description: 'Considera su trayectoria, logros o experticia.',
      blockId: blocks[6].id,
      programId: programs[0].id,
      order: 1,
      maxScore: 0.8,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: generateId(),
      text: '¿Se percibe liderazgo, enfoque y cohesión en el equipo fundador?',
      description: 'Evalúa si trabajan bien juntos y tienen dirección.',
      blockId: blocks[6].id,
      programId: programs[0].id,
      order: 2,
      maxScore: 0.7,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]
  await kv.set(KV_KEYS.QUESTIONS, questions)

  const teams: Team[] = [
    {
      id: generateId(),
      name: 'Tecnología',
      description: 'Área de desarrollo tecnológico',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: generateId(),
      name: 'Negocios',
      description: 'Área de desarrollo de negocios',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: generateId(),
      name: 'Marketing',
      description: 'Área de marketing y crecimiento',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]
  await kv.set(KV_KEYS.TEAMS, teams)

  const projectsList: Project[] = [
    {
      id: generateId(),
      name: 'EcoTech Solutions',
      description: 'Plataforma de gestión de residuos con IA',
      programId: programs[0].id,
      teamId: teams[0].id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: generateId(),
      name: 'FinPro',
      description: 'App de finanzas personales para jóvenes',
      programId: programs[0].id,
      teamId: teams[1].id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: generateId(),
      name: 'HealthHub',
      description: 'Telemedicina con especialistas certificados',
      programId: programs[0].id,
      teamId: teams[0].id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: generateId(),
      name: 'EduConnect',
      description: 'Plataforma de educación en línea',
      programId: programs[0].id,
      teamId: teams[2].id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]
  await kv.set(KV_KEYS.PROJECTS, projectsList)

  const judgesList: Judge[] = [
    {
      id: generateId(),
      name: 'María González',
      email: 'maria@example.com',
      token: generateId(),
      category: 'Tecnología',
      votingClosed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: generateId(),
      name: 'Carlos Rodríguez',
      email: 'carlos@example.com',
      token: generateId(),
      category: 'Negocios',
      votingClosed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: generateId(),
      name: 'Ana Martínez',
      email: 'ana@example.com',
      token: generateId(),
      category: 'Innovación',
      votingClosed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ]
  await kv.set(KV_KEYS.JUDGES, judgesList)

  await kv.set(KV_KEYS.EVALUATIONS, [])
  await kv.set(KV_KEYS.VOTING_CLOSED, false)
}

export async function clearAllData(): Promise<void> {
  await kv.delete(KV_KEYS.PROGRAMS)
  await kv.delete(KV_KEYS.BLOCKS)
  await kv.delete(KV_KEYS.QUESTIONS)
  await kv.delete(KV_KEYS.TEAMS)
  await kv.delete(KV_KEYS.PROJECTS)
  await kv.delete(KV_KEYS.JUDGES)
  await kv.delete(KV_KEYS.EVALUATIONS)
  await kv.delete(KV_KEYS.VOTING_CLOSED)
}

export async function getSystemState(): Promise<SystemState> {
  return {
    programs: await getPrograms(),
    blocks: await getBlocks(),
    questions: await getQuestions(),
    teams: await getTeams(),
    projects: await getProjects(),
    judges: await getJudges(),
    evaluations: await getEvaluations(),
    votingClosed: await getVotingClosed(),
  }
}
