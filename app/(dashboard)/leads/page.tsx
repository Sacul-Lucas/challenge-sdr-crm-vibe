"use client"

import { useState, useMemo } from "react"
import { Search, Filter } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { InputGroup, InputGroupInput, InputGroupAddon } from "@/components/ui/input-group"
import { NewLeadModal } from "@/components/new-lead-modal"
import { LeadsTable } from "@/components/leads-table"
import { mockLeads } from "@/lib/mock-data"
import { LEAD_STAGES, type Lead, type LeadStage } from "@/lib/types"

const CURRENT_USER_ID = "1" // Lucas Silva

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>(mockLeads)
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [stageFilter, setStageFilter] = useState<LeadStage | "all">("all")
  const [isLoading, setIsLoading] = useState(false)

  const handleLeadCreated = (newLead: Lead) => {
    setLeads((prev) => [newLead, ...prev])
  }

  const filteredLeads = useMemo(() => {
    let result = leads

    // Filter by tab
    if (activeTab === "mine") {
      result = result.filter((lead) => lead.assignedTo === CURRENT_USER_ID)
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
  }, [leads, activeTab, stageFilter, searchQuery])

  const myLeadsCount = leads.filter(
    (lead) => lead.assignedTo === CURRENT_USER_ID
  ).length

  return (
    <div className="flex flex-col gap-6 p-4 lg:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Leads</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie e acompanhe seus leads de vendas
          </p>
        </div>
        <NewLeadModal onLeadCreated={handleLeadCreated} />
      </div>

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
          </div>
        </div>

        <TabsContent value="all" className="mt-4">
          <LeadsTable leads={filteredLeads} isLoading={isLoading} />
        </TabsContent>

        <TabsContent value="mine" className="mt-4">
          <LeadsTable leads={filteredLeads} isLoading={isLoading} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
