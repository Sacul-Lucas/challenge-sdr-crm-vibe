"use client"

import { useState } from "react"
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Eye,
  ArrowUpDown,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Empty, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty"
import { type Lead, LEAD_STAGES } from "@/lib/types"
import { mockUsers } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

interface LeadsTableProps {
  leads: Lead[]
  isLoading?: boolean
}

export function LeadsTable({ leads, isLoading }: LeadsTableProps) {
  const [sortField, setSortField] = useState<keyof Lead>("createdAt")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

  const getUserName = (userId?: string) => {
    if (!userId) return "-"
    const user = mockUsers.find((u) => u.id === userId)
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
                      <DropdownMenuItem className="gap-2">
                        <Eye className="h-4 w-4" />
                        <span>Visualizar</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="gap-2">
                        <Pencil className="h-4 w-4" />
                        <span>Editar</span>
                      </DropdownMenuItem>
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
  )
}
