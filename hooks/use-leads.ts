'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Lead, LeadStage } from '@/lib/types'

export interface LeadInput {
  name: string
  email: string
  phone?: string
  company: string
  role?: string
  stage: LeadStage
  origin?: string
  notes?: string
  assigned_to?: string
  workspace_id: string
}

export function useLeads(workspaceId?: string) {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const supabase = createClient()

  const fetchLeads = useCallback(async (wsId: string) => {
    setLoading(true)
    setError(null)
    
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('workspace_id', wsId)
        .order('created_at', { ascending: false })

      if (error) throw error
      
      // Mapeia os dados do banco para o formato do tipo Lead
      const mappedLeads: Lead[] = (data || []).map((lead) => ({
        id: lead.id,
        name: lead.name,
        email: lead.email,
        phone: lead.phone,
        company: lead.company,
        role: lead.role,
        stage: lead.stage,
        origin: lead.origin,
        notes: lead.notes,
        assignedTo: lead.assigned_to,
        createdAt: new Date(lead.created_at),
        updatedAt: new Date(lead.updated_at),
      }))
      
      setLeads(mappedLeads)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erro ao buscar leads'))
      console.error('Erro ao buscar leads:', err)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  const createLead = useCallback(async (leadData: LeadInput) => {
    try {
      const { data, error } = await supabase
        .from('leads')
        .insert({
          name: leadData.name,
          email: leadData.email,
          phone: leadData.phone,
          company: leadData.company,
          role: leadData.role,
          stage: leadData.stage,
          origin: leadData.origin,
          notes: leadData.notes,
          assigned_to: leadData.assigned_to,
          workspace_id: leadData.workspace_id,
        })
        .select()
        .single()

      if (error) throw error
      
      if (workspaceId) {
        await fetchLeads(workspaceId)
      }
      
      return { data, error: null }
    } catch (err) {
      return { data: null, error: err }
    }
  }, [supabase, workspaceId, fetchLeads])

  const updateLead = useCallback(async (id: string, updates: Partial<LeadInput>) => {
    try {
      const { data, error } = await supabase
        .from('leads')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      
      if (workspaceId) {
        await fetchLeads(workspaceId)
      }
      
      return { data, error: null }
    } catch (err) {
      return { data: null, error: err }
    }
  }, [supabase, workspaceId, fetchLeads])

  const deleteLead = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('leads')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      if (workspaceId) {
        await fetchLeads(workspaceId)
      }
      
      return { error: null }
    } catch (err) {
      return { error: err }
    }
  }, [supabase, workspaceId, fetchLeads])

  useEffect(() => {
    if (workspaceId) {
      fetchLeads(workspaceId)
    }
  }, [workspaceId, fetchLeads])

  return { 
    leads, 
    loading, 
    error,
    createLead, 
    updateLead,
    deleteLead,
    refetch: () => workspaceId && fetchLeads(workspaceId) 
  }
}
