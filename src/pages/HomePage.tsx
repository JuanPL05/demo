import { Gear, ChartBar, Trophy, Lightning, CheckCircle, Clock, Users } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SystemDiagnostics } from '@/components/SystemDiagnostics'

interface HomePageProps {
  navigate: (route: 'home' | 'admin' | 'dashboard' | 'judge', token?: string) => void
}

export function HomePage({ navigate }: HomePageProps) {
  console.log('[v0] HomePage loaded successfully')

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-blue-50/50 to-green-50/40">
      <div className="container mx-auto px-4 py-8 sm:py-16">
        <div className="mb-12 text-center">
          <Badge variant="outline" className="mb-4 border-primary/40 text-primary">
            <Lightning size={16} weight="fill" />
            <span className="ml-1">Banco Plaza</span>
          </Badge>
          <h1 className="text-5xl sm:text-7xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-6 tracking-tight">
            MEETUP DEMO DAY
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Sistema de evaluación para el MeetUp demo day.
          </p>
        </div>

        <div className="mb-12">
          <SystemDiagnostics />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="border-2 hover:border-primary hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Gear size={24} className="text-primary" weight="duotone" />
              </div>
              <CardTitle className="text-foreground">Panel de Administración</CardTitle>
              <CardDescription>
                Gestiona programas, equipos, proyectos y jueces
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => navigate('admin')}
                className="w-full"
                size="lg"
              >
                Acceder al Panel
              </Button>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-accent hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                <ChartBar size={24} className="text-accent" weight="duotone" />
              </div>
              <CardTitle className="text-foreground">Dashboard</CardTitle>
              <CardDescription>
                Rankings y estadísticas en tiempo real
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => navigate('dashboard')}
                variant="outline"
                className="w-full border-accent text-accent hover:bg-accent hover:text-accent-foreground"
                size="lg"
              >
                Ver Rankings
              </Button>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                <Trophy size={24} className="text-primary" weight="duotone" />
              </div>
              <CardTitle className="text-foreground">Portal de Evaluación</CardTitle>
              <CardDescription>
                Los jueces acceden mediante su enlace único
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                <p className="text-sm text-blue-900 mb-2">
                  <strong>Para jueces:</strong>
                </p>
                <p className="text-sm text-blue-800">
                  Usa el enlace personalizado que recibiste del administrador para acceder a tu panel de evaluación.
                </p>
                <p className="text-xs text-blue-700 mt-2 font-mono">
                  Formato: {window.location.origin}/#/judge/[tu-token]
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <CheckCircle size={24} className="text-accent" weight="duotone" />
                Características
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Clock size={14} className="text-accent" weight="bold" />
                </div>
                <div>
                  <p className="font-medium">Evaluación en tiempo real</p>
                  <p className="text-muted-foreground text-sm">
                    Actualización automática de rankings
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Trophy size={14} className="text-primary" weight="bold" />
                </div>
                <div>
                  <p className="font-medium">Sistema de puntuación 1-5</p>
                  <p className="text-muted-foreground text-sm">
                    Star rating intuitivo y rápido
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <ChartBar size={14} className="text-primary" weight="bold" />
                </div>
                <div>
                  <p className="font-medium">Rankings automáticos</p>
                  <p className="text-muted-foreground text-sm">
                    Cálculo dinámico de posiciones
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Users size={14} className="text-accent" weight="bold" />
                </div>
                <div>
                  <p className="font-medium">Interfaz moderna y profesional</p>
                  <p className="text-muted-foreground text-sm">
                    Diseño limpio y funcional
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Lightning size={24} className="text-primary" weight="duotone" />
                Programas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg bg-accent/5 border-2 border-accent/20">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-accent text-accent-foreground">INCUBACIÓN</Badge>
                </div>
                <p className="text-muted-foreground text-sm">
                  Para startups en etapa temprana
                </p>
              </div>
              <div className="p-4 rounded-lg bg-primary/5 border-2 border-primary/20">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-primary text-primary-foreground">ACELERACIÓN</Badge>
                </div>
                <p className="text-muted-foreground text-sm">
                  Para startups en crecimiento
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="text-center border-t pt-8">
          <p className="text-sm text-muted-foreground">
            Sistema de Evaluación MeetUp Demo Day • Banco Plaza
          </p>
        </div>
      </div>
    </div>
  )
}
