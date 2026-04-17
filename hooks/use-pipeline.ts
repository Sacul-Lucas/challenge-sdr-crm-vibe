import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export function usePipeline() {
  const [stages, setStages] = useState<any[]>([])
  const supabase = createClient()

  useEffect(() => {
    supabase
      .from('pipeline_stages')
      .select('*')
      .order('position')
      .then(({ data }) => setStages(data || []))
  }, [])

  const validateStageTransition = (lead: any, targetStageId: number) => {
    const stage = stages.find(s => s.id === targetStageId)
    if (!stage) return { valid: true, missing: [] }

    const requiredFields = stage.required_fields || []
    const missing: string[] = []

    requiredFields.forEach((field: string) => {
      if (!lead[field as keyof typeof lead]) {
        missing.push(field)
      }
    })

    return {
      valid: missing.length === 0,
      missing,
      stageName: stage.name
    }
  }

  return { stages, validateStageTransition }
}