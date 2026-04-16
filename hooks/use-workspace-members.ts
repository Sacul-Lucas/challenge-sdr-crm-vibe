'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface WorkspaceMember {
  id: string
  user_id: string
  workspace_id: string
  role: 'owner' | 'admin' | 'member'
  user: {
    id: string
    email: string
    full_name?: string
  }
}

export function useWorkspaceMembers(workspaceId?: string) {
  const [members, setMembers] = useState<WorkspaceMember[]>([])
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const fetchMembers = useCallback(async (wsId: string) => {
    setLoading(true)
    try {
      // Busca membros do workspace com dados do usuario
      const { data, error } = await supabase
        .from('workspace_members')
        .select(`
          id,
          user_id,
          workspace_id,
          role,
          profiles:user_id (
            id,
            full_name
          )
        `)
        .eq('workspace_id', wsId)

      if (error) throw error

      // Mapeia os dados para o formato esperado
      const mappedMembers = (data || []).map((member) => ({
        id: member.id,
        user_id: member.user_id,
        workspace_id: member.workspace_id,
        role: member.role as 'owner' | 'admin' | 'member',
        user: {
          id: member.user_id,
          email: '', // Email nao disponivel diretamente
          full_name: (member.profiles as { full_name?: string })?.full_name,
        },
      }))

      setMembers(mappedMembers)
    } catch (error) {
      console.error('Erro ao buscar membros:', error)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  const addMember = useCallback(async (userId: string, role: 'admin' | 'member' = 'member') => {
    if (!workspaceId) return { error: new Error('Workspace nao selecionado') }

    try {
      const { error } = await supabase
        .from('workspace_members')
        .insert({
          workspace_id: workspaceId,
          user_id: userId,
          role,
        })

      if (error) throw error
      
      await fetchMembers(workspaceId)
      return { error: null }
    } catch (error) {
      return { error }
    }
  }, [workspaceId, supabase, fetchMembers])

  const removeMember = useCallback(async (memberId: string) => {
    if (!workspaceId) return { error: new Error('Workspace nao selecionado') }

    try {
      const { error } = await supabase
        .from('workspace_members')
        .delete()
        .eq('id', memberId)

      if (error) throw error
      
      await fetchMembers(workspaceId)
      return { error: null }
    } catch (error) {
      return { error }
    }
  }, [workspaceId, supabase, fetchMembers])

  useEffect(() => {
    if (workspaceId) {
      fetchMembers(workspaceId)
    }
  }, [workspaceId, fetchMembers])

  return { 
    members, 
    loading, 
    addMember, 
    removeMember,
    refetch: () => workspaceId && fetchMembers(workspaceId) 
  }
}
