'use server'

import { createClient } from '@/utils/supabase/server'

export async function getTickets() {
  const supabase = await createClient()

  // This assumes you have a 'tickets' table in Supabase
  const { data: tickets, error } = await supabase
    .from('tickets')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5)

  if (error) {
    console.error('Error fetching tickets:', error)
    return []
  }

  return tickets
}

export async function createTicket(subject: string, description: string, priority: string) {
  const supabase = await createClient()
  
  // Get the current user
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('Not authenticated')
  }

  const { data, error } = await supabase
    .from('tickets')
    .insert([
      { 
        user_id: user.id, 
        subject, 
        description, 
        priority,
        status: 'Open' 
      }
    ])
    .select()

  if (error) {
    throw new Error(error.message)
  }

  return data
}
