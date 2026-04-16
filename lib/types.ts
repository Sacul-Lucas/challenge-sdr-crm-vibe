export type LeadStage =
  | 'base'
  | 'lead_mapeado'
  | 'tentando_contato'
  | 'contato_realizado'
  | 'qualificado'
  | 'reuniao_agendada'
  | 'proposta_enviada'
  | 'negociacao'
  | 'ganho'
  | 'perdido'

export const LEAD_STAGES: Record<LeadStage, { label: string; color: string }> = {
  base: { label: 'Base', color: 'bg-muted text-muted-foreground' },
  lead_mapeado: { label: 'Lead Mapeado', color: 'bg-blue-500/20 text-blue-400' },
  tentando_contato: { label: 'Tentando Contato', color: 'bg-yellow-500/20 text-yellow-400' },
  contato_realizado: { label: 'Contato Realizado', color: 'bg-orange-500/20 text-orange-400' },
  qualificado: { label: 'Qualificado', color: 'bg-cyan-500/20 text-cyan-400' },
  reuniao_agendada: { label: 'Reuniao Agendada', color: 'bg-indigo-500/20 text-indigo-400' },
  proposta_enviada: { label: 'Proposta Enviada', color: 'bg-purple-500/20 text-purple-400' },
  negociacao: { label: 'Negociacao', color: 'bg-pink-500/20 text-pink-400' },
  ganho: { label: 'Ganho', color: 'bg-green-500/20 text-green-400' },
  perdido: { label: 'Perdido', color: 'bg-red-500/20 text-red-400' },
}

export interface Lead {
  id: string
  name: string
  email: string
  phone?: string
  company: string
  role?: string
  stage: LeadStage
  origin?: string
  notes?: string
  assignedTo?: string
  createdAt: Date
  updatedAt: Date
}

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
}

export const LEAD_ORIGINS = [
  'Inbound',
  'Outbound',
  'Indicacao',
  'LinkedIn',
  'Evento',
  'Site',
  'Outro',
] as const

export type LeadOrigin = typeof LEAD_ORIGINS[number]
