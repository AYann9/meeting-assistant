import { createClient } from '@supabase/supabase-js'
import { Database } from './database.types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// 会议 CRUD 操作
export async function getMeetings(userId?: string) {
  let query = supabase
    .from('meetings')
    .select('*')
    .order('scheduled_at', { ascending: false })

  if (userId) {
    query = query.eq('user_id', userId)
  }

  const { data, error } = await query
  if (error) throw error
  return data
}

export async function getMeetingById(id: string): Promise<Database['public']['Tables']['meetings']['Row'] | null> {
  const { data, error } = await supabase
    .from('meetings')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error) {
    console.error('getMeetingById error:', error)
    return null
  }
  return data as Database['public']['Tables']['meetings']['Row']
}

export async function createMeeting(meeting: Database['public']['Tables']['meetings']['Insert']) {
  const { data, error } = await supabase
    .from('meetings')
    .insert(meeting)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function updateMeeting(
  id: string,
  updates: Database['public']['Tables']['meetings']['Update']
) {
  const { data, error } = await supabase
    .from('meetings')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function deleteMeeting(id: string) {
  const { error } = await supabase
    .from('meetings')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

// 材料 CRUD 操作
export async function getMaterials(meetingId: string) {
  const { data, error } = await supabase
    .from('materials')
    .select('*')
    .eq('meeting_id', meetingId)
    .order('uploaded_at', { ascending: false })
  
  if (error) throw error
  return data
}

export async function createMaterial(material: Database['public']['Tables']['materials']['Insert']) {
  const { data, error } = await supabase
    .from('materials')
    .insert(material)
    .select()
    .single()
  
  if (error) throw error
  return data
}

// 议程项 CRUD 操作
export async function getAgendaItems(meetingId: string) {
  const { data, error } = await supabase
    .from('agenda_items')
    .select('*')
    .eq('meeting_id', meetingId)
    .order('sort_order', { ascending: true })
  
  if (error) throw error
  return data
}

export async function createAgendaItem(item: Database['public']['Tables']['agenda_items']['Insert']) {
  const { data, error } = await supabase
    .from('agenda_items')
    .insert(item)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function updateAgendaItem(
  id: string,
  updates: Database['public']['Tables']['agenda_items']['Update']
) {
  const { data, error } = await supabase
    .from('agenda_items')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function deleteAgendaItem(id: string) {
  const { error } = await supabase
    .from('agenda_items')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

// 纪要 CRUD 操作
export async function getMinutes(meetingId: string) {
  const { data, error } = await supabase
    .from('minutes')
    .select('*')
    .eq('meeting_id', meetingId)
    .single()
  
  if (error && error.code !== 'PGRST116') throw error
  return data
}

export async function createMinutes(minutes: Database['public']['Tables']['minutes']['Insert']) {
  const { data, error } = await supabase
    .from('minutes')
    .insert(minutes)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function updateMinutes(
  id: string,
  updates: Database['public']['Tables']['minutes']['Update']
) {
  const { data, error } = await supabase
    .from('minutes')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

// 待办事项 CRUD 操作
export async function getTodos(meetingId?: string) {
  let query = supabase
    .from('todos')
    .select('*')
    .order('created_at', { ascending: false })

  if (meetingId) {
    query = query.eq('meeting_id', meetingId)
  }

  const { data, error } = await query
  if (error) throw error
  return data
}

export async function createTodo(todo: Database['public']['Tables']['todos']['Insert']) {
  const { data, error } = await supabase
    .from('todos')
    .insert(todo)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function updateTodo(
  id: string,
  updates: Database['public']['Tables']['todos']['Update']
) {
  const { data, error } = await supabase
    .from('todos')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function deleteTodo(id: string) {
  const { error } = await supabase
    .from('todos')
    .delete()
    .eq('id', id)
  
  if (error) throw error
}

// 用户资料操作
export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  
  if (error) throw error
  return data
}

export async function updateProfile(
  userId: string,
  updates: Database['public']['Tables']['profiles']['Update']
) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()
  
  if (error) throw error
  return data
}

// 文件上传到 Supabase Storage
export async function uploadFile(bucket: string, path: string, file: File) {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false,
    })
  
  if (error) throw error
  return data
}

export async function getFileUrl(bucket: string, path: string) {
  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(path)
  
  return data.publicUrl
}

// 获取当前用户
export async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) {
      if (error.name === 'AuthSessionMissingError') {
        return null
      }
      throw error
    }
    return user
  } catch (err: any) {
    if (err.name === 'AuthSessionMissingError' || err.message?.includes('Auth session missing')) {
      return null
    }
    throw err
  }
}

// 订阅会议变更
export function subscribeToMeetings(callback: (payload: any) => void) {
  return supabase
    .channel('meetings_changes')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'meetings' },
      callback
    )
    .subscribe()
}
