import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Plus, Pencil, Trash, Copy } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface Field {
  name: string
  label: string
  type: 'text' | 'textarea' | 'number' | 'select'
  required?: boolean
  options?: { value: string; label: string }[]
  disabled?: boolean
  min?: number
  max?: number
  step?: number
}

interface EntityManagerProps<T> {
  title: string
  fields: Field[]
  items: T[]
  onRefresh: () => Promise<void>
  onCreate: (data: Partial<T>) => Promise<any>
  onUpdate: (id: string, data: Partial<T>) => Promise<any>
  onDelete: (id: string) => Promise<any>
  getItemLabel: (item: T) => string
  getItemDescription?: (item: T) => string | undefined
  getBadges?: (item: T) => { label: string; variant?: 'default' | 'secondary' | 'outline' }[]
  customActions?: (item: T) => React.ReactNode
}

export function EntityManager<T extends { id: string }>({
  title,
  fields,
  items,
  onRefresh,
  onCreate,
  onUpdate,
  onDelete,
  getItemLabel,
  getItemDescription,
  getBadges,
  customActions,
}: EntityManagerProps<T>) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<T | null>(null)
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (editingItem) {
      setFormData(editingItem as Record<string, any>)
    } else {
      setFormData({})
    }
  }, [editingItem])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (editingItem) {
        await onUpdate(editingItem.id, formData as Partial<T>)
        toast.success(`${title} actualizado exitosamente`)
      } else {
        await onCreate(formData as Partial<T>)
        toast.success(`${title} creado exitosamente`)
      }
      setDialogOpen(false)
      setEditingItem(null)
      setFormData({})
      await onRefresh()
    } catch (error) {
      console.error('Error saving:', error)
      toast.error(`Error al guardar ${title.toLowerCase()}`)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm(`¿Estás seguro de eliminar este ${title.toLowerCase()}?`)) return
    setLoading(true)
    try {
      await onDelete(id)
      toast.success(`${title} eliminado exitosamente`)
      await onRefresh()
    } catch (error) {
      console.error('Error deleting:', error)
      toast.error(`Error al eliminar ${title.toLowerCase()}`)
    } finally {
      setLoading(false)
    }
  }

  const openCreate = () => {
    setEditingItem(null)
    setFormData({})
    setDialogOpen(true)
  }

  const openEdit = (item: T) => {
    setEditingItem(item)
    setFormData(item as Record<string, any>)
    setDialogOpen(true)
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-muted-foreground">Total: {items.length}</p>
        </div>
        <Button onClick={openCreate} size="sm">
          <Plus size={16} className="mr-2" />
          Crear {title}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {items.map((item) => (
          <Card key={item.id} className="p-4 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold truncate">{getItemLabel(item)}</h4>
                {getItemDescription && (
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {getItemDescription(item)}
                  </p>
                )}
                {getBadges && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {getBadges(item).map((badge, idx) => (
                      <Badge key={idx} variant={badge.variant || 'default'}>
                        {badge.label}
                      </Badge>
                    ))}
                  </div>
                )}
                <div className="mt-2 flex gap-2 text-xs text-muted-foreground font-mono">
                  <span className="truncate">ID: {item.id}</span>
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                {customActions && customActions(item)}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openEdit(item)}
                  disabled={loading}
                >
                  <Pencil size={14} />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleDelete(item.id)}
                  disabled={loading}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash size={14} />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {items.length === 0 && (
        <Card className="p-12 text-center">
          <p className="text-muted-foreground">
            No hay {title.toLowerCase()}s. Crea uno para comenzar.
          </p>
        </Card>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? `Editar ${title}` : `Crear ${title}`}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            {fields.map((field) => (
              <div key={field.name}>
                <Label htmlFor={field.name}>
                  {field.label}
                  {field.required && <span className="text-destructive ml-1">*</span>}
                </Label>
                {field.type === 'text' && (
                  <Input
                    id={field.name}
                    value={formData[field.name] || ''}
                    onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                    required={field.required}
                    disabled={field.disabled}
                    className="mt-1"
                  />
                )}
                {field.type === 'textarea' && (
                  <Textarea
                    id={field.name}
                    value={formData[field.name] || ''}
                    onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                    required={field.required}
                    rows={3}
                    className="mt-1"
                  />
                )}
                {field.type === 'number' && (
                  <Input
                    id={field.name}
                    type="number"
                    value={formData[field.name] || ''}
                    onChange={(e) =>
                      setFormData({ ...formData, [field.name]: parseFloat(e.target.value) })
                    }
                    required={field.required}
                    min={field.min}
                    max={field.max}
                    step={field.step || 1}
                    className="mt-1"
                  />
                )}
                {field.type === 'select' && field.options && (
                  <Select
                    value={formData[field.name]}
                    onValueChange={(value) => setFormData({ ...formData, [field.name]: value })}
                    required={field.required}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder={`Seleccionar ${field.label.toLowerCase()}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {field.options.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            ))}
            <div className="flex gap-2 justify-end pt-4">
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Guardando...' : editingItem ? 'Actualizar' : 'Crear'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
