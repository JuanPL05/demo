import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, Eye, Copy, Link } from '@phosphor-icons/react'
import { SeedManager } from '@/components/admin/SeedManager'
import { EntityManager } from '@/components/admin/EntityManager'
import { StorageConfig } from '@/components/admin/StorageConfig'
import { toast } from 'sonner'
import {
  getPrograms,
  getBlocks,
  getQuestions,
  getTeams,
  getProjects,
  getJudges,
  createProgram,
  updateProgram,
  deleteProgram,
  createBlock,
  updateBlock,
  deleteBlock,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  createTeam,
  updateTeam,
  deleteTeam,
  createProject,
  updateProject,
  deleteProject,
  createJudge,
  updateJudge,
  deleteJudge,
} from '@/lib/database'
import type { Program, Block, Question, Team, Project, Judge } from '@/lib/types'

interface AdminPageProps {
  navigate: (route: 'home' | 'admin' | 'dashboard' | 'judge', token?: string) => void
}

export function AdminPage({ navigate }: AdminPageProps) {
  const [programs, setPrograms] = useState<Program[]>([])
  const [blocks, setBlocks] = useState<Block[]>([])
  const [questions, setQuestions] = useState<Question[]>([])
  const [teams, setTeams] = useState<Team[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [judges, setJudges] = useState<Judge[]>([])

  const loadData = async () => {
    try {
      const [programsData, blocksData, questionsData, teamsData, projectsData, judgesData] = await Promise.all([
        getPrograms(),
        getBlocks(),
        getQuestions(),
        getTeams(),
        getProjects(),
        getJudges(),
      ])
      
      setPrograms(programsData)
      setBlocks(blocksData)
      setQuestions(questionsData)
      setTeams(teamsData)
      setProjects(projectsData)
      setJudges(judgesData)
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Error al cargar los datos. Verifica que estés en un entorno Spark válido.')
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/30 to-green-50/30">
      <div className="container mx-auto px-4 sm:px-6 py-6 max-w-7xl">
        <div className="mb-6 flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => navigate('home')}>
            <ArrowLeft size={16} />
          </Button>
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              Panel de Administración
            </h1>
            <p className="text-muted-foreground mt-1">
              Gestiona programas, equipos, proyectos, jueces y evaluaciones
            </p>
          </div>
        </div>

        <Card className="border-blue-200 shadow-lg">
          <Tabs defaultValue="storage" className="p-6">
            <TabsList className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-2 h-auto">
              <TabsTrigger value="storage" className="text-xs sm:text-sm">
                Almacenamiento
              </TabsTrigger>
              <TabsTrigger value="seed" className="text-xs sm:text-sm">
                Datos
              </TabsTrigger>
              <TabsTrigger value="programs" className="text-xs sm:text-sm">
                Programas
              </TabsTrigger>
              <TabsTrigger value="blocks" className="text-xs sm:text-sm">
                Bloques
              </TabsTrigger>
              <TabsTrigger value="questions" className="text-xs sm:text-sm">
                Preguntas
              </TabsTrigger>
              <TabsTrigger value="teams" className="text-xs sm:text-sm">
                Áreas
              </TabsTrigger>
              <TabsTrigger value="projects" className="text-xs sm:text-sm">
                Proyectos
              </TabsTrigger>
              <TabsTrigger value="judges" className="text-xs sm:text-sm">
                Jueces
              </TabsTrigger>
            </TabsList>

            <TabsContent value="storage">
              <div className="pt-6">
                <h3 className="text-xl font-semibold text-blue-600 mb-2">Configuración de Almacenamiento</h3>
                <p className="text-muted-foreground mb-4">
                  Configura cómo se almacenan y comparten los datos entre usuarios
                </p>
                <StorageConfig />
              </div>
            </TabsContent>

            <TabsContent value="seed">
              <div className="pt-6">
                <h3 className="text-xl font-semibold text-blue-600 mb-2">Gestión de Datos</h3>
                <p className="text-muted-foreground mb-4">
                  Poblar la base de datos con datos de ejemplo
                </p>
                <SeedManager />
              </div>
            </TabsContent>

            <TabsContent value="programs">
              <div className="pt-6">
                <h3 className="text-xl font-semibold text-blue-600 mb-2">Gestión de Programas</h3>
                <p className="text-muted-foreground mb-4">
                  Administra los programas de aceleración
                </p>
                <EntityManager<Program>
                  title="Programa"
                  fields={[
                    { name: 'name', label: 'Nombre', type: 'text', required: true },
                    { name: 'description', label: 'Descripción', type: 'textarea' },
                  ]}
                  items={programs}
                  onRefresh={loadData}
                  onCreate={createProgram}
                  onUpdate={updateProgram}
                  onDelete={deleteProgram}
                  getItemLabel={(item) => item.name}
                  getItemDescription={(item) => item.description}
                />
              </div>
            </TabsContent>

            <TabsContent value="blocks">
              <div className="pt-6">
                <h3 className="text-xl font-semibold text-blue-600 mb-2">
                  Gestión de Bloques de Preguntas
                </h3>
                <p className="text-muted-foreground mb-4">Organiza las categorías de evaluación</p>
                <EntityManager<Block>
                  title="Bloque"
                  fields={[
                    { name: 'name', label: 'Nombre', type: 'text', required: true },
                    { name: 'description', label: 'Descripción', type: 'textarea' },
                    {
                      name: 'programId',
                      label: 'Programa',
                      type: 'select',
                      required: true,
                      options: programs.map((p) => ({ value: p.id, label: p.name })),
                    },
                    { name: 'order', label: 'Orden', type: 'number', required: true },
                  ]}
                  items={blocks}
                  onRefresh={loadData}
                  onCreate={createBlock}
                  onUpdate={updateBlock}
                  onDelete={deleteBlock}
                  getItemLabel={(item) => item.name}
                  getItemDescription={(item) => item.description}
                  getBadges={(item) => {
                    const program = programs.find((p) => p.id === item.programId)
                    return [
                      { label: program?.name || 'Sin programa', variant: 'default' },
                      { label: `Orden: ${item.order}`, variant: 'outline' },
                    ]
                  }}
                />
              </div>
            </TabsContent>

            <TabsContent value="questions">
              <div className="pt-6">
                <h3 className="text-xl font-semibold text-blue-600 mb-2">Gestión de Preguntas</h3>
                <p className="text-muted-foreground mb-4">
                  Define las preguntas de evaluación por bloque. Cada pregunta tiene una puntuación de 0.5 a 1.2, y el total debe sumar 10 puntos.
                </p>
                <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-blue-900">Total de puntuación acumulada:</span>
                    <span className={`text-2xl font-bold font-mono ${
                      questions.reduce((sum, q) => sum + (q.maxScore || 0), 0) === 10 
                        ? 'text-green-600' 
                        : 'text-orange-600'
                    }`}>
                      {questions.reduce((sum, q) => sum + (q.maxScore || 0), 0).toFixed(1)} / 10
                    </span>
                  </div>
                </div>
                <EntityManager<Question>
                  title="Pregunta"
                  fields={[
                    { name: 'text', label: 'Texto de la pregunta', type: 'textarea', required: true },
                    { name: 'description', label: 'Descripción', type: 'textarea' },
                    {
                      name: 'programId',
                      label: 'Programa',
                      type: 'select',
                      required: true,
                      options: programs.map((p) => ({ value: p.id, label: p.name })),
                    },
                    {
                      name: 'blockId',
                      label: 'Bloque',
                      type: 'select',
                      required: true,
                      options: blocks.map((b) => ({ value: b.id, label: b.name })),
                    },
                    { name: 'order', label: 'Orden', type: 'number', required: true },
                    { name: 'maxScore', label: 'Puntuación máxima (0.5 - 1.2)', type: 'number', required: true, min: 0.5, max: 1.2, step: 0.1 },
                  ]}
                  items={questions}
                  onRefresh={loadData}
                  onCreate={createQuestion}
                  onUpdate={updateQuestion}
                  onDelete={deleteQuestion}
                  getItemLabel={(item) => item.text}
                  getItemDescription={(item) => item.description}
                  getBadges={(item) => {
                    const block = blocks.find((b) => b.id === item.blockId)
                    return [
                      { label: block?.name || 'Sin bloque', variant: 'default' },
                      { label: `Orden: ${item.order}`, variant: 'outline' },
                      { label: `${item.maxScore || 0} pts`, variant: 'secondary' },
                    ]
                  }}
                />
              </div>
            </TabsContent>

            <TabsContent value="teams">
              <div className="pt-6">
                <h3 className="text-xl font-semibold text-blue-600 mb-2">Gestión de Áreas</h3>
                <p className="text-muted-foreground mb-4">Crea y edita áreas de trabajo</p>
                <EntityManager<Team>
                  title="Área"
                  fields={[
                    { name: 'name', label: 'Nombre', type: 'text', required: true },
                    { name: 'description', label: 'Descripción', type: 'textarea' },
                  ]}
                  items={teams}
                  onRefresh={loadData}
                  onCreate={createTeam}
                  onUpdate={updateTeam}
                  onDelete={deleteTeam}
                  getItemLabel={(item) => item.name}
                  getItemDescription={(item) => item.description}
                />
              </div>
            </TabsContent>

            <TabsContent value="projects">
              <div className="pt-6">
                <h3 className="text-xl font-semibold text-blue-600 mb-2">Gestión de Proyectos</h3>
                <p className="text-muted-foreground mb-4">Administra los proyectos a evaluar</p>
                <EntityManager<Project>
                  title="Proyecto"
                  fields={[
                    { name: 'name', label: 'Nombre', type: 'text', required: true },
                    { name: 'description', label: 'Descripción', type: 'textarea' },
                    {
                      name: 'programId',
                      label: 'Programa',
                      type: 'select',
                      required: true,
                      options: programs.map((p) => ({ value: p.id, label: p.name })),
                    },
                    {
                      name: 'teamId',
                      label: 'Área',
                      type: 'select',
                      required: true,
                      options: teams.map((t) => ({ value: t.id, label: t.name })),
                    },
                  ]}
                  items={projects}
                  onRefresh={loadData}
                  onCreate={createProject}
                  onUpdate={updateProject}
                  onDelete={deleteProject}
                  getItemLabel={(item) => item.name}
                  getItemDescription={(item) => item.description}
                  getBadges={(item) => {
                    const program = programs.find((p) => p.id === item.programId)
                    const team = teams.find((t) => t.id === item.teamId)
                    return [
                      { label: program?.name || 'Sin programa', variant: 'default' },
                      { label: team?.name || 'Sin área', variant: 'outline' },
                    ]
                  }}
                />
              </div>
            </TabsContent>

            <TabsContent value="judges">
              <div className="pt-6">
                <h3 className="text-xl font-semibold text-blue-600 mb-2">Gestión de Jueces</h3>
                <p className="text-muted-foreground mb-4">Crea jueces y gestiona sus tokens</p>
                <EntityManager<Judge>
                  title="Juez"
                  fields={[
                    { name: 'name', label: 'Nombre (se usará como token)', type: 'text', required: true },
                    { name: 'email', label: 'Email', type: 'text', required: true },
                    { name: 'category', label: 'Categoría', type: 'text' },
                  ]}
                  items={judges}
                  onRefresh={loadData}
                  onCreate={createJudge}
                  onUpdate={updateJudge}
                  onDelete={deleteJudge}
                  getItemLabel={(item) => item.name}
                  getItemDescription={(item) => `${item.email} • Token: ${item.token}`}
                  getBadges={(item) => {
                    const badges: { label: string; variant?: 'default' | 'secondary' | 'outline' }[] = []
                    if (item.category) badges.push({ label: item.category, variant: 'default' })
                    badges.push({
                      label: item.votingClosed ? 'Cerrado' : 'Activo',
                      variant: item.votingClosed ? 'outline' : 'default',
                    })
                    return badges
                  }}
                  customActions={(judge) => (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const baseUrl = window.location.origin
                          const judgeUrl = `${baseUrl}/#/judge/${judge.token}`
                          navigator.clipboard.writeText(judgeUrl)
                          toast.success('Enlace copiado al portapapeles')
                        }}
                        title="Copiar enlace del juez"
                      >
                        <Copy size={14} className="mr-1" />
                        Enlace
                      </Button>
                      <Button
                        size="sm"
                        variant="default"
                        onClick={() => navigate('judge', judge.token)}
                        title="Ir a vista de evaluación"
                      >
                        <Eye size={14} />
                      </Button>
                    </div>
                  )}
                />
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  )
}

