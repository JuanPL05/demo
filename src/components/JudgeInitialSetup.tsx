import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { GithubLogo, Key, Info } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface JudgeInitialSetupProps {
  onConfigured: (token: string, gistId: string) => void
}

export function JudgeInitialSetup({ onConfigured }: JudgeInitialSetupProps) {
  const [githubToken, setGithubToken] = useState('')
  const [gistId, setGistId] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    if (!githubToken.trim() || !gistId.trim()) {
      toast.error('Por favor completa todos los campos')
      return
    }

    setLoading(true)
    try {
      localStorage.setItem('meetup_github_token', githubToken)
      localStorage.setItem('meetup_gist_id', gistId)

      toast.success('Configuración guardada correctamente')
      onConfigured(githubToken, gistId)
    } catch (error) {
      toast.error('Error al validar la configuración. Verifica tus datos.')
      console.error('Error validating config:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-teal-50/40 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full shadow-xl">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center mb-2">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-400 to-teal-400 flex items-center justify-center">
              <GithubLogo size={32} weight="fill" className="text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold text-center bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent">
            Configuración Inicial
          </CardTitle>
          <CardDescription className="text-base">
            Para sincronizar tus evaluaciones con el sistema, necesitas configurar tu acceso a GitHub Gist
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="github-token" className="flex items-center gap-2 text-base font-semibold">
              <Key size={16} />
              GitHub Token
            </Label>
            <Input
              id="github-token"
              type="password"
              placeholder="ghp_..."
              value={githubToken}
              onChange={(e) => setGithubToken(e.target.value)}
              className="h-11"
            />
            <p className="text-sm text-muted-foreground">
              Token de acceso personal de GitHub con permisos de gist
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="gist-id" className="flex items-center gap-2 text-base font-semibold">
              <GithubLogo size={16} />
              Gist ID
            </Label>
            <Input
              id="gist-id"
              type="text"
              placeholder="abc123def456..."
              value={gistId}
              onChange={(e) => setGistId(e.target.value)}
              className="h-11"
            />
            <p className="text-sm text-muted-foreground">
              ID del Gist donde se almacenarán los datos
            </p>
          </div>

          <Alert className="bg-blue-50 border-blue-200">
            <Info size={16} className="text-blue-600" />
            <AlertDescription className="text-sm text-slate-700">
              <strong>Nota:</strong> Esta información debe ser proporcionada por el administrador del sistema.
              Ambos valores son necesarios para sincronizar tus evaluaciones con el resto del equipo.
            </AlertDescription>
          </Alert>

          <Button
            onClick={handleSave}
            disabled={loading || !githubToken.trim() || !gistId.trim()}
            className="w-full h-12 text-base font-semibold bg-gradient-to-r from-cyan-500 to-teal-500 hover:from-cyan-600 hover:to-teal-600"
          >
            {loading ? 'Validando...' : 'Guardar Configuración'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
