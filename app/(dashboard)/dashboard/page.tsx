"use client"

import Link from "next/link"
import {
  Users,
  TrendingUp,
  Calendar,
  Target,
  ArrowRight,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { mockLeads } from "@/lib/mock-data"
import { LEAD_STAGES } from "@/lib/types"

export default function DashboardPage() {
  const totalLeads = mockLeads.length
  const qualifiedLeads = mockLeads.filter(
    (l) => l.stage === "qualificado" || l.stage === "reuniao_agendada"
  ).length
  const wonLeads = mockLeads.filter((l) => l.stage === "ganho").length
  const meetingsScheduled = mockLeads.filter(
    (l) => l.stage === "reuniao_agendada"
  ).length

  const stats = [
    {
      title: "Total de Leads",
      value: totalLeads,
      icon: Users,
      description: "Leads no pipeline",
    },
    {
      title: "Leads Qualificados",
      value: qualifiedLeads,
      icon: Target,
      description: "Prontos para conversao",
    },
    {
      title: "Reunioes Agendadas",
      value: meetingsScheduled,
      icon: Calendar,
      description: "Proximas reunioes",
    },
    {
      title: "Ganhos",
      value: wonLeads,
      icon: TrendingUp,
      description: "Negocios fechados",
    },
  ]

  const stageDistribution = Object.entries(LEAD_STAGES).map(([key, { label }]) => {
    const count = mockLeads.filter((l) => l.stage === key).length
    return { stage: label, count }
  }).filter(s => s.count > 0)

  return (
    <div className="flex flex-col gap-6 p-4 lg:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Visao geral do seu pipeline de vendas
          </p>
        </div>
        <Button asChild>
          <Link href="/leads" className="gap-2">
            Ver Todos os Leads
            <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Distribuicao por Etapa</CardTitle>
            <CardDescription>
              Quantidade de leads em cada etapa do funil
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stageDistribution.map(({ stage, count }) => (
                <div key={stage} className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between text-sm">
                      <span>{stage}</span>
                      <span className="font-medium">{count}</span>
                    </div>
                    <div className="mt-1 h-2 rounded-full bg-muted">
                      <div
                        className="h-2 rounded-full bg-primary"
                        style={{
                          width: `${(count / totalLeads) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Leads Recentes</CardTitle>
            <CardDescription>Ultimos leads adicionados ao sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockLeads.slice(0, 5).map((lead) => (
                <div
                  key={lead.id}
                  className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0"
                >
                  <div>
                    <p className="font-medium">{lead.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {lead.company}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {LEAD_STAGES[lead.stage].label}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
