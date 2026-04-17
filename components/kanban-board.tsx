"use client"

import { useState, useMemo } from "react"
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, Building2, User, Pencil } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Spinner } from "@/components/ui/spinner"
import { Empty, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty"
import { type Lead, type LeadStage, LEAD_STAGES, LEAD_ORIGINS, type LeadOrigin } from "@/lib/types"
import { cn } from "@/lib/utils"

interface Stage {
  id: LeadStage
  name: string
  requiredFields?: string[]
}

interface KanbanBoardProps {
  workspaceId: string
  leads: Lead[]
  stages?: Stage[]
  members?: { id: string; name: string }[]
  onStageChange?: (leadId: string, newStage: LeadStage) => Promise<void>
  onLeadEdit?: (leadData: Partial<Lead> & { id: string }) => Promise<void>
  isLoading?: boolean
}

const DEFAULT_STAGES: Stage[] = [
  { id: "base", name: "Base", requiredFields: ["name", "email", "company"] },
  { id: "lead_mapeado", name: "Lead Mapeado", requiredFields: ["name", "email", "company"] },
  { id: "tentando_contato", name: "Tentando Contato", requiredFields: ["name", "email", "company", "phone"] },
  { id: "contato_realizado", name: "Contato Realizado", requiredFields: ["name", "email", "company", "phone"] },
  { id: "qualificado", name: "Qualificado", requiredFields: ["name", "email", "company", "phone", "role"] },
  { id: "reuniao_agendada", name: "Reuniao Agendada", requiredFields: ["name", "email", "company", "phone", "role"] },
  { id: "proposta_enviada", name: "Proposta Enviada", requiredFields: ["name", "email", "company", "phone", "role"] },
  { id: "ganho", name: "Ganho", requiredFields: ["name", "email", "company", "phone", "role"] },
  { id: "perdido", name: "Perdido", requiredFields: ["name", "email", "company"] },
]

interface LeadCardProps {
  lead: Lead
  onClick: () => void
  isDragging?: boolean
}

function LeadCard({ lead, onClick, isDragging }: LeadCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: lead.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const stageInfo = LEAD_STAGES[lead.stage]

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative rounded-lg border border-border/50 bg-card/80 p-3 backdrop-blur-sm transition-all duration-200",
        "hover:border-border hover:bg-card hover:shadow-md",
        (isDragging || isSortableDragging) && "opacity-50 shadow-lg ring-2 ring-primary/20"
      )}
    >
      <div className="flex items-start gap-2">
        <button
          {...attributes}
          {...listeners}
          className="mt-0.5 cursor-grab touch-none rounded p-0.5 text-muted-foreground opacity-0 transition-opacity hover:bg-muted group-hover:opacity-100 active:cursor-grabbing"
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <div className="min-w-0 flex-1" onClick={onClick}>
          <div className="flex items-start justify-between gap-2">
            <p className="truncate font-medium text-sm cursor-pointer hover:text-primary transition-colors">
              {lead.name}
            </p>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation()
                onClick()
              }}
            >
              <Pencil className="h-3 w-3" />
            </Button>
          </div>
          <div className="mt-1.5 flex flex-col gap-1 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Building2 className="h-3 w-3 shrink-0" />
              <span className="truncate">{lead.company}</span>
            </div>
            {lead.role && (
              <div className="flex items-center gap-1.5">
                <User className="h-3 w-3 shrink-0" />
                <span className="truncate">{lead.role}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function DraggingCard({ lead }: { lead: Lead }) {
  return (
    <div className="rounded-lg border border-primary/50 bg-card p-3 shadow-xl ring-2 ring-primary/20">
      <p className="font-medium text-sm">{lead.name}</p>
      <div className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
        <Building2 className="h-3 w-3" />
        <span>{lead.company}</span>
      </div>
    </div>
  )
}

interface KanbanColumnProps {
  stage: Stage
  leads: Lead[]
  onLeadClick: (lead: Lead) => void
}

function KanbanColumn({ stage, leads, onLeadClick }: KanbanColumnProps) {
  const stageInfo = LEAD_STAGES[stage.id]

  return (
    <div className="flex h-full w-72 shrink-0 flex-col rounded-xl border border-border/50 bg-muted/30 backdrop-blur-sm lg:w-auto lg:flex-1">
      <div className="flex items-center justify-between border-b border-border/50 p-3">
        <div className="flex items-center gap-2">
          <div className={cn("h-2 w-2 rounded-full", stageInfo?.color?.replace("text-", "bg-") || "bg-muted-foreground")} />
          <h3 className="text-sm font-medium">{stage.name}</h3>
        </div>
        <Badge variant="secondary" className="text-xs">
          {leads.length}
        </Badge>
      </div>
      <ScrollArea className="flex-1 p-2">
        <SortableContext items={leads.map((l) => l.id)} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-2">
            {leads.length === 0 ? (
              <div className="flex items-center justify-center py-8 text-xs text-muted-foreground">
                Nenhum lead
              </div>
            ) : (
              leads.map((lead) => (
                <LeadCard key={lead.id} lead={lead} onClick={() => onLeadClick(lead)} />
              ))
            )}
          </div>
        </SortableContext>
      </ScrollArea>
    </div>
  )
}

function KanbanSkeleton() {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex h-[500px] w-72 shrink-0 flex-col rounded-xl border border-border/50 bg-muted/30 lg:w-auto lg:flex-1">
          <div className="flex items-center justify-between border-b border-border/50 p-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-5 w-8" />
          </div>
          <div className="flex flex-col gap-2 p-2">
            {Array.from({ length: 3 }).map((_, j) => (
              <div key={j} className="rounded-lg border border-border/50 bg-card/80 p-3">
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-3 w-24" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

interface EditLeadModalProps {
  lead: Lead | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (leadData: Partial<Lead> & { id: string }) => Promise<void>
  onSaveAndMove: (leadData: Partial<Lead> & { id: string }, newStage: LeadStage) => Promise<void>
  stages: Stage[]
  members?: { id: string; name: string }[]
}

function EditLeadModal({ lead, open, onOpenChange, onSave, onSaveAndMove, stages, members = [] }: EditLeadModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<Partial<Lead>>({})
  const [targetStage, setTargetStage] = useState<LeadStage | "">("")

  const currentStage = stages.find((s) => s.id === (formData.stage || lead?.stage))
  const requiredFields = currentStage?.requiredFields || []

  const resetForm = () => {
    if (lead) {
      setFormData({
        name: lead.name,
        email: lead.email,
        phone: lead.phone || "",
        company: lead.company,
        role: lead.role || "",
        stage: lead.stage,
        origin: lead.origin,
        notes: lead.notes || "",
        assignedTo: lead.assignedTo || "",
      })
      setTargetStage("")
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen && lead) {
      resetForm()
    }
    onOpenChange(newOpen)
  }

  const isFieldRequired = (field: string) => requiredFields.includes(field)
  const isFieldMissing = (field: string) => {
    if (!isFieldRequired(field)) return false
    const value = formData[field as keyof Lead]
    return !value || (typeof value === "string" && value.trim() === "")
  }

  const handleSave = async () => {
    if (!lead) return
    setIsLoading(true)
    try {
      await onSave({ ...formData, id: lead.id })
      onOpenChange(false)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveAndMove = async () => {
    if (!lead || !targetStage) return
    setIsLoading(true)
    try {
      await onSaveAndMove({ ...formData, id: lead.id }, targetStage)
      onOpenChange(false)
    } finally {
      setIsLoading(false)
    }
  }

  if (!lead) return null

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Lead</DialogTitle>
          <DialogDescription>
            Atualize as informacoes do lead. Campos com * sao obrigatorios para a etapa atual.
          </DialogDescription>
        </DialogHeader>
        <FieldGroup className="gap-4 py-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="edit-name" className={cn(isFieldMissing("name") && "text-destructive")}>
                Nome {isFieldRequired("name") && "*"}
              </FieldLabel>
              <Input
                id="edit-name"
                placeholder="Nome completo"
                value={formData.name || ""}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={cn(isFieldMissing("name") && "border-destructive")}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="edit-email" className={cn(isFieldMissing("email") && "text-destructive")}>
                Email {isFieldRequired("email") && "*"}
              </FieldLabel>
              <Input
                id="edit-email"
                type="email"
                placeholder="email@empresa.com"
                value={formData.email || ""}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={cn(isFieldMissing("email") && "border-destructive")}
              />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="edit-phone" className={cn(isFieldMissing("phone") && "text-destructive")}>
                Telefone {isFieldRequired("phone") && "*"}
              </FieldLabel>
              <Input
                id="edit-phone"
                placeholder="(00) 00000-0000"
                value={formData.phone || ""}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className={cn(isFieldMissing("phone") && "border-destructive")}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="edit-company" className={cn(isFieldMissing("company") && "text-destructive")}>
                Empresa {isFieldRequired("company") && "*"}
              </FieldLabel>
              <Input
                id="edit-company"
                placeholder="Nome da empresa"
                value={formData.company || ""}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className={cn(isFieldMissing("company") && "border-destructive")}
              />
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="edit-role" className={cn(isFieldMissing("role") && "text-destructive")}>
                Cargo {isFieldRequired("role") && "*"}
              </FieldLabel>
              <Input
                id="edit-role"
                placeholder="Cargo do lead"
                value={formData.role || ""}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className={cn(isFieldMissing("role") && "border-destructive")}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="edit-origin">Origem</FieldLabel>
              <Select
                value={formData.origin || ""}
                onValueChange={(value) => setFormData({ ...formData, origin: value as LeadOrigin })}
              >
                <SelectTrigger id="edit-origin">
                  <SelectValue placeholder="Selecione a origem" />
                </SelectTrigger>
                <SelectContent>
                  {LEAD_ORIGINS.map((origin) => (
                    <SelectItem key={origin} value={origin}>
                      {origin}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field>
              <FieldLabel htmlFor="edit-stage">Etapa Atual</FieldLabel>
              <Select value={formData.stage} disabled>
                <SelectTrigger id="edit-stage">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {stages.map((stage) => (
                    <SelectItem key={stage.id} value={stage.id}>
                      {stage.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel htmlFor="edit-assignedTo">Responsavel</FieldLabel>
              <Select
                value={formData.assignedTo || ""}
                onValueChange={(value) => setFormData({ ...formData, assignedTo: value })}
              >
                <SelectTrigger id="edit-assignedTo">
                  <SelectValue placeholder="Selecione o responsavel" />
                </SelectTrigger>
                <SelectContent>
                  {members.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <Field>
            <FieldLabel htmlFor="edit-notes">Observacoes</FieldLabel>
            <Textarea
              id="edit-notes"
              placeholder="Adicione observacoes sobre o lead..."
              className="resize-none"
              rows={3}
              value={formData.notes || ""}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </Field>

          <div className="rounded-lg border border-border bg-muted/50 p-4">
            <p className="text-sm font-medium mb-2">Mover para outra etapa</p>
            <div className="flex gap-2">
              <Select value={targetStage} onValueChange={(value) => setTargetStage(value as LeadStage)}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Selecione a nova etapa" />
                </SelectTrigger>
                <SelectContent>
                  {stages.filter((s) => s.id !== formData.stage).map((stage) => (
                    <SelectItem key={stage.id} value={stage.id}>
                      {stage.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="secondary"
                disabled={!targetStage || isLoading}
                onClick={handleSaveAndMove}
              >
                {isLoading ? <Spinner className="mr-2" /> : null}
                Salvar e Mover
              </Button>
            </div>
          </div>
        </FieldGroup>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button type="button" disabled={isLoading} onClick={handleSave}>
            {isLoading ? <Spinner className="mr-2" /> : null}
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function KanbanBoard({
  workspaceId,
  leads,
  stages = DEFAULT_STAGES,
  members = [],
  onStageChange,
  onLeadEdit,
  isLoading,
}: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [editingLead, setEditingLead] = useState<Lead | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const leadsByStage = useMemo(() => {
    const grouped: Record<LeadStage, Lead[]> = {} as Record<LeadStage, Lead[]>
    stages.forEach((stage) => {
      grouped[stage.id] = []
    })
    leads.forEach((lead) => {
      if (grouped[lead.stage]) {
        grouped[lead.stage].push(lead)
      }
    })
    return grouped
  }, [leads, stages])

  const activeLead = useMemo(() => {
    if (!activeId) return null
    return leads.find((l) => l.id === activeId) || null
  }, [activeId, leads])

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragOver = (event: DragOverEvent) => {
    // Handled in dragEnd for simplicity
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    const activeLeadId = active.id as string
    const overId = over.id as string

    // Find the lead and determine the target stage
    const lead = leads.find((l) => l.id === activeLeadId)
    if (!lead) return

    // Check if dropped on a column or on another lead
    let targetStage: LeadStage | null = null

    // Check if overId is a stage
    const isStage = stages.some((s) => s.id === overId)
    if (isStage) {
      targetStage = overId as LeadStage
    } else {
      // Dropped on another lead, find its stage
      const targetLead = leads.find((l) => l.id === overId)
      if (targetLead) {
        targetStage = targetLead.stage
      }
    }

    if (targetStage && targetStage !== lead.stage && onStageChange) {
      await onStageChange(activeLeadId, targetStage)
    }
  }

  const handleLeadClick = (lead: Lead) => {
    setEditingLead(lead)
    setIsEditModalOpen(true)
  }

  const handleSaveLead = async (leadData: Partial<Lead> & { id: string }) => {
    if (onLeadEdit) {
      await onLeadEdit(leadData)
    }
  }

  const handleSaveAndMove = async (leadData: Partial<Lead> & { id: string }, newStage: LeadStage) => {
    if (onLeadEdit) {
      await onLeadEdit({ ...leadData, stage: newStage })
    }
    if (onStageChange) {
      await onStageChange(leadData.id, newStage)
    }
  }

  if (isLoading) {
    return <KanbanSkeleton />
  }

  if (leads.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-border bg-card py-16">
        <Empty>
          <EmptyMedia />
          <EmptyTitle>Nenhum lead encontrado</EmptyTitle>
          <EmptyDescription>
            Adicione um novo lead para visualizar no Kanban.
          </EmptyDescription>
        </Empty>
      </div>
    )
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex h-[calc(100vh-16rem)] gap-4 overflow-x-auto pb-4">
          {stages.map((stage) => (
            <KanbanColumn
              key={stage.id}
              stage={stage}
              leads={leadsByStage[stage.id] || []}
              onLeadClick={handleLeadClick}
            />
          ))}
        </div>
        <DragOverlay>
          {activeLead ? <DraggingCard lead={activeLead} /> : null}
        </DragOverlay>
      </DndContext>

      <EditLeadModal
        lead={editingLead}
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        onSave={handleSaveLead}
        onSaveAndMove={handleSaveAndMove}
        stages={stages}
        members={members}
      />
    </>
  )
}
