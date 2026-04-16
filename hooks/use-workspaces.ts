'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from './use-auth'

export interface Workspace {
  id: string
  name: string
  created_at: string
  owner_id: string
}

export function useWorkspaces() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([])
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null)
  const [loading, setLoading] = useState(false)
  const { user } = useAuth()
  const supabase = createClient()

  const fetchWorkspaces = useCallback(async () => {
    if (!user) return
    
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('workspaces')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      
      setWorkspaces(data || [])
      
      // Define o primeiro workspace como atual se não houver nenhum selecionado
      if (data && data.length > 0 && !currentWorkspace) {
        setCurrentWorkspace(data[0])
      }
    } catch (error) {
      console.error('Erro ao buscar workspaces:', error)
    } finally {
      setLoading(false)
    }
  }, [user, supabase, currentWorkspace])

  const createWorkspace = useCallback(async (name: string) => {
    if (!user) return { data: null, error: new Error('Usuario nao autenticado') }

    try {
      const { data, error } = await supabase
        .from('workspaces')
        .insert({ 
          name,
          owner_id: user.id 
        })
        .select()
        .single()

      if (error) throw error
      
      await fetchWorkspaces()
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }, [user, supabase, fetchWorkspaces])

  const selectWorkspace = useCallback((workspace: Workspace) => {
    setCurrentWorkspace(workspace)
  }, [])

  useEffect(() => {
    if (user) {
      fetchWorkspaces()
    }
  }, [user, fetchWorkspaces])

  return { 
    workspaces, 
    currentWorkspace, 
    loading, 
    createWorkspace, 
    selectWorkspace,
    refetch: fetchWorkspaces 
  }
}
