import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useLeadMessages(leadId: string) {
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  const fetchMessages = async () => {
    const { data } = await supabase
      .from('lead_messages')
      .select('*')
      .eq('lead_id', leadId)
      .order('created_at', { ascending: false })
    setMessages(data || [])
  }

  const generateMessages = async (campaignId: string) => {
    setLoading(true)

    // MOCK - depois trocamos por OpenAI
    const mockMessages = [
      `Olá ${campaignId}, tudo bem? Vi que você trabalha com ${campaignId} na sua empresa...`,
      `Oi! Sou da equipe ${campaignId}. Notei que sua empresa pode se beneficiar de...`,
      `E aí ${campaignId}! Rápido: já pensou em ${campaignId} para otimizar seus processos?`
    ]

    // Salvar no banco
    for (let i = 0; i < 3; i++) {
      await supabase.from('lead_messages').insert({
        lead_id: leadId,
        campaign_id: campaignId,
        message_content: mockMessages[i],
        variant: i + 1
      })
    }

    setLoading(false)
    await fetchMessages()
  }

  useEffect(() => {
    if (leadId) fetchMessages()
  }, [leadId])

  return { messages, loading, generateMessages }
}