"use client"

import { useState } from "react"
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Eye,
  ArrowUpDown,
  ArrowRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Empty, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty"
import { type Lead, LEAD_STAGES, LEAD_ORIGINS, type LeadStage, type LeadOrigin } from "@/lib/types"
import { cn } from "@/lib/utils"

interface LeadsTableProps {
  leads: Lead[]
  isLoading?: boolean
  onLeadEdit?: (leadData: Partial<Lead> & { id: string }) => Promise<void>
  onStageChange?: (leadId: string, newStage: LeadStage) => Promise<void>
  members?: { id: string; name: string }[]
}

export function LeadsTable({ leads, isLoading, onLeadEdit, onStageChange, members = [] }: LeadsTableProps) {
  const [sortField, setSortField] = useState<keyof Lead>("createdAt")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [editingLead, setEditingLead] = useState<Lead | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState<Partial<Lead>>({})

  const getUserName = (userId?: string) => {
    if (!userId) return "-"
    const user = members.find((u) => u.id === userId)
    return user?.name || "-"
  }

  const sortedLeads = [...leads].sort((a, b) => {
    const aValue = a[sortField]
    const bValue = b[sortField]

    if (aValue === undefined) return 1
    if (bValue === undefined) return -1

    if (aValue instanceof Date && bValue instanceof Date) {
      return sortOrder === "asc"
        ? aValue.getTime() - bValue.getTime()
        : bValue.getTime() - aValue.getTime()
    }

    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortOrder === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue)
    }

    return 0
  })

  const toggleSort = (field: keyof Lead) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortOrder("asc")
    }
  }

  const handleEditClick = (lead: Lead) => {
    setEditingLead(lead)
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
    setIsEditModalOpen(true)
  }

  const handleSave = async () => {
    if (!editingLead || !onLeadEdit) return
    setIsSaving(true)
    try {
      await onLeadEdit({ ...formData, id: editingLead.id })
      setIsEditModalOpen(false)
      setEditingLead(null)
    } finally {
      setIsSaving(false)
    }
  }

  const handleStageChangeClick = async (leadId: string, newStage: LeadStage) => {
    if (onStageChange) {
      await onStageChange(leadId, newStage)
    }
  }

  if (isLoading) {
    return (
      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Empresa</TableHead>
              <TableHead>Cargo</TableHead>
              <TableHead>Etapa</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton className="h-4 w-32" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-40" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-28" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-8 w-8" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    )
  }

  if (leads.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-lg border border-border bg-card py-16">
        <Empty>
          <EmptyMedia />
          <EmptyTitle>Nenhum lead encontrado</EmptyTitle>
          <EmptyDescription>
            Adicione um novo lead para comecar.
          </EmptyDescription>
        </Empty>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  className="-ml-3 h-8 gap-1 text-xs font-medium"
                  onClick={() => toggleSort("name")}
                >
                  Nome
                  <ArrowUpDown className="h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  className="-ml-3 h-8 gap-1 text-xs font-medium"
                  onClick={() => toggleSort("email")}
                >
                  Email
                  <ArrowUpDown className="h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead className="hidden md:table-cell">
                <Button
                  variant="ghost"
                  size="sm"
                  className="-ml-3 h-8 gap-1 text-xs font-medium"
                  onClick={() => toggleSort("company")}
                >
                  Empresa
                  <ArrowUpDown className="h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead className="hidden lg:table-cell">Cargo</TableHead>
              <TableHead>Etapa</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedLeads.map((lead) => {
              const stageInfo = LEAD_STAGES[lead.stage]
              return (
                <TableRow key={lead.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{lead.name}</span>
                      <span className="text-xs text-muted-foreground md:hidden">
                        {lead.company}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {lead.email}
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    {lead.company}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell text-muted-foreground">
                    {lead.role || "-"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="secondary"
                      className={cn("font-normal", stageInfo.color)}
                    >
                      {stageInfo.label}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Abrir menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem 
                          className="gap-2"
                          onClick={() => handleEditClick(lead)}
                        >
                          <Pencil className="h-4 w-4" />
                          <span>Editar</span>
                        </DropdownMenuItem>
                        <DropdownMenuSub>
                          <DropdownMenuSubTrigger className="gap-2">
                            <ArrowRight className="h-4 w-4" />
                            <span>Mover para</span>
                          </DropdownMenuSubTrigger>
                          <DropdownMenuSubContent>
                            {Object.entries(LEAD_STAGES)
                              .filter(([key]) => key !== lead.stage)
                              .map(([key, { label }]) => (
                                <DropdownMenuItem
                                  key={key}
                                  onClick={() => handleStageChangeClick(lead.id, key as LeadStage)}
                                >
                                  {label}
                                </DropdownMenuItem>
                              ))}
                          </DropdownMenuSubContent>
                        </DropdownMenuSub>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="gap-2 text-destructive">
                          <Trash2 className="h-4 w-4" />
                          <span>Excluir</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Lead</DialogTitle>
            <DialogDescription>
              Atualize as informacoes do lead. Campos com * sao obrigatorios.
            </DialogDescription>
          </DialogHeader>
          <FieldGroup className="gap-4 py-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="edit-name">Nome *</FieldLabel>
                <Input
                  id="edit-name"
                  placeholder="Nome completo"
                  value={formData.name || ""}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="edit-email">Email *</FieldLabel>
                <Input
                  id="edit-email"
                  type="email"
                  placeholder="email@empresa.com"
                  value={formData.email || ""}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="edit-phone">Telefone</FieldLabel>
                <Input
                  id="edit-phone"
                  placeholder="(00) 00000-0000"
                  value={formData.phone || ""}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="edit-company">Empresa *</FieldLabel>
                <Input
                  id="edit-company"
                  placeholder="Nome da empresa"
                  value={formData.company || ""}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                />
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel htmlFor="edit-role">Cargo</FieldLabel>
                <Input
                  id="edit-role"
                  placeholder="Cargo do lead"
                  value={formData.role || ""}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
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
                <FieldLabel htmlFor="edit-stage">Etapa</FieldLabel>
                <Select
                  value={formData.stage}
                  onValueChange={(value) => setFormData({ ...formData, stage: value as LeadStage })}
                >
                  <SelectTrigger id="edit-stage">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(LEAD_STAGES).map(([key, { label }]) => (
                      <SelectItem key={key} value={key}>
                        {label}
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
          </FieldGroup>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="button" disabled={isSaving} onClick={handleSave}>
              {isSaving ? <Spinner className="mr-2" /> : null}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
