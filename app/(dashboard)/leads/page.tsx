"use client"

import { useState, useMemo } from "react"
import { Search, Filter, LayoutGrid, List, AlertCircle } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { InputGroup, InputGroupInput, InputGroupAddon } from "@/components/ui/input-group"
import { NewLeadModal } from "@/components/new-lead-modal"
import { LeadsTable } from "@/components/leads-table"
import { KanbanBoard } from "@/components/kanban-board"
import { LEAD_STAGES, type Lead, type LeadStage } from "@/lib/types"
import { useLeads } from "@/hooks/use-leads"
import { useAuth } from "@/hooks/use-auth"
import { useWorkspaces } from "@/hooks/use-workspaces"
import { useWorkspaceMembers } from "@/hooks/use-workspace-members"

export default function LeadsPage() {
  const { user } = useAuth()
  const { currentWorkspace } = useWorkspaces()
  const workspaceId = currentWorkspace?.id || ""
  
  const { leads, isLoading, error, createLead, updateLead, refetch } = useLeads(workspaceId)
  const { members } = useWorkspaceMembers(workspaceId)

  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [stageFilter, setStageFilter] = useState<LeadStage | "all">("all")
  const [viewMode, setViewMode] = useState<"table" | "kanban">("table")

  const membersList = useMemo(() => {
    return members.map((m) => ({
      id: m.userId,
      name: m.profile?.firstName 
        ? `${m.profile.firstName} ${m.profile.lastName || ""}`.trim() 
        : m.profile?.email || "Usuario",
    }))
  }, [members])

  const handleLeadCreated = async (leadData: Omit<Lead, "id" | "createdAt" | "updatedAt">) => {
    await createLead(leadData)
    refetch()
  }

  const handleStageChange = async (leadId: string, newStage: LeadStage) => {
    await updateLead(leadId, { stage: newStage })
    refetch()
  }

  const handleLeadEdit = async (leadData: Partial<Lead> & { id: string }) => {
    const { id, ...data } = leadData
    await updateLead(id, data)
    refetch()
  }

  const filteredLeads = useMemo(() => {
    let result = leads

    // Filter by tab
    if (activeTab === "mine") {
      result = result.filter((lead) => lead.assignedTo === user?.id)
    }

    // Filter by stage
    if (stageFilter !== "all") {
      result = result.filter((lead) => lead.stage === stageFilter)
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (lead) =>
          lead.name.toLowerCase().includes(query) ||
          lead.email.toLowerCase().includes(query) ||
          lead.company.toLowerCase().includes(query)
      )
    }

    return result
  }, [leads, activeTab, stageFilter, searchQuery, user?.id])

  const myLeadsCount = useMemo(() => {
    return leads.filter((lead) => lead.assignedTo === user?.id).length
  }, [leads, user?.id])

  return (
    <div className="flex flex-col gap-6 p-4 lg:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Leads</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie e acompanhe seus leads de vendas
          </p>
        </div>
        <NewLeadModal 
          onLeadCreated={handleLeadCreated}
          workspaceId={workspaceId}
          members={membersList}
        />
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro ao carregar leads</AlertTitle>
          <AlertDescription>
            {error.message || "Ocorreu um erro ao buscar os leads. Tente novamente mais tarde."}
          </AlertDescription>
        </Alert>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <TabsList>
            <TabsTrigger value="all">
              Todos
              <span className="ml-1.5 rounded-full bg-muted px-2 py-0.5 text-xs">
                {leads.length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="mine">
              Meus Leads
              <span className="ml-1.5 rounded-full bg-muted px-2 py-0.5 text-xs">
                {myLeadsCount}
              </span>
            </TabsTrigger>
          </TabsList>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <InputGroup className="w-full sm:w-64">
              <InputGroupAddon>
                <Search className="h-4 w-4" />
              </InputGroupAddon>
              <InputGroupInput
                placeholder="Buscar leads..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </InputGroup>

            <Select
              value={stageFilter}
              onValueChange={(value) =>
                setStageFilter(value as LeadStage | "all")
              }
            >
              <SelectTrigger className="w-full sm:w-44">
                <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="Filtrar por etapa" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as etapas</SelectItem>
                {Object.entries(LEAD_STAGES).map(([key, { label }]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <ToggleGroup
              type="single"
              value={viewMode}
              onValueChange={(value) => value && setViewMode(value as "table" | "kanban")}
              className="hidden sm:flex"
            >
              <ToggleGroupItem value="table" aria-label="Visualizacao em tabela">
                <List className="h-4 w-4" />
              </ToggleGroupItem>
              <ToggleGroupItem value="kanban" aria-label="Visualizacao em Kanban">
                <LayoutGrid className="h-4 w-4" />
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>

        <TabsContent value="all" className="mt-4">
          {viewMode === "table" ? (
            <LeadsTable 
              leads={filteredLeads} 
              isLoading={isLoading}
              onLeadEdit={handleLeadEdit}
              onStageChange={handleStageChange}
              members={membersList}
            />
          ) : (
            <KanbanBoard
              workspaceId={workspaceId}
              leads={filteredLeads}
              isLoading={isLoading}
              onStageChange={handleStageChange}
              onLeadEdit={handleLeadEdit}
              members={membersList}
            />
          )}
        </TabsContent>

        <TabsContent value="mine" className="mt-4">
          {viewMode === "table" ? (
            <LeadsTable 
              leads={filteredLeads} 
              isLoading={isLoading}
              onLeadEdit={handleLeadEdit}
              onStageChange={handleStageChange}
              members={membersList}
            />
          ) : (
            <KanbanBoard
              workspaceId={workspaceId}
              leads={filteredLeads}
              isLoading={isLoading}
              onStageChange={handleStageChange}
              onLeadEdit={handleLeadEdit}
              members={membersList}
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
