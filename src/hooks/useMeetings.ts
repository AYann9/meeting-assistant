import { useState, useEffect, useCallback } from 'react'
import { Meeting, MeetingType } from '@/lib/types'
import {
  getMeetings as getMeetingsFromSupabase,
  createMeeting as createMeetingInSupabase,
  updateMeeting as updateMeetingInSupabase,
  deleteMeeting as deleteMeetingInSupabase,
  getCurrentUser,
} from '@/lib/supabase'
import { getMeetings as getMeetingsFromStorage, saveMeetings, generateId } from '@/lib/storage'

function isSupabaseAvailable(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co' &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY !== 'placeholder-key'
  )
}

export function useMeetings() {
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMeetings = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      if (isSupabaseAvailable()) {
        const user = await getCurrentUser()
        const data = await getMeetingsFromSupabase(user?.id)
        setMeetings(data || [])
      } else {
        const data = getMeetingsFromStorage()
        setMeetings(data)
      }
    } catch (err: any) {
      console.error('获取会议列表失败:', err)
      const data = getMeetingsFromStorage()
      setMeetings(data)
      if (isSupabaseAvailable()) {
        setError(err.message || 'Supabase 连接失败，已切换到本地存储')
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMeetings()
  }, [fetchMeetings])

  const addMeeting = async (data: {
    title: string
    scheduled_at: string
    attendees: string[]
    location: string
    meeting_type: MeetingType
  }) => {
    const now = new Date().toISOString()
    const newMeeting: Meeting = {
      id: generateId(),
      user_id: 'demo',
      title: data.title,
      scheduled_at: data.scheduled_at,
      attendees: data.attendees,
      location: data.location,
      meeting_type: data.meeting_type,
      status: 'upcoming',
      duration_min: 90,
      tags: [],
      created_at: now,
      updated_at: now,
    }

    try {
      if (isSupabaseAvailable()) {
        const user = await getCurrentUser()
        const supabaseMeeting = await createMeetingInSupabase({
          ...newMeeting,
          user_id: user?.id || 'demo',
        })
        if (supabaseMeeting) {
          setMeetings((prev) =>
            [...prev, supabaseMeeting].sort(
              (a, b) =>
                new Date(a.scheduled_at || '').getTime() - new Date(b.scheduled_at || '').getTime()
            )
          )
          return supabaseMeeting
        }
      }

      const current = getMeetingsFromStorage()
      const updated = [...current, newMeeting]
      saveMeetings(updated)
      setMeetings((prev) =>
        [...prev, newMeeting].sort(
          (a, b) =>
            new Date(a.scheduled_at || '').getTime() - new Date(b.scheduled_at || '').getTime()
        )
      )
      return newMeeting
    } catch (err: any) {
      console.error('创建会议失败:', err)
      const current = getMeetingsFromStorage()
      const updated = [...current, newMeeting]
      saveMeetings(updated)
      setMeetings((prev) =>
        [...prev, newMeeting].sort(
          (a, b) =>
            new Date(a.scheduled_at || '').getTime() - new Date(b.scheduled_at || '').getTime()
        )
      )
      return newMeeting
    }
  }

  const updateMeeting = async (id: string, data: {
    title: string
    scheduled_at: string
    attendees: string[]
    location: string
    meeting_type: MeetingType
  }) => {
    try {
      if (isSupabaseAvailable()) {
        const updated = await updateMeetingInSupabase(id, {
          title: data.title,
          scheduled_at: data.scheduled_at,
          attendees: data.attendees,
          location: data.location,
          meeting_type: data.meeting_type,
          updated_at: new Date().toISOString(),
        })
        if (updated) {
          setMeetings((prev) =>
            prev.map((m) => (m.id === id ? updated : m)).sort(
              (a, b) =>
                new Date(a.scheduled_at || '').getTime() - new Date(b.scheduled_at || '').getTime()
            )
          )
          return updated
        }
      }

      const current = getMeetingsFromStorage()
      const updated = current.map((m) =>
        m.id === id
          ? {
              ...m,
              title: data.title,
              scheduled_at: data.scheduled_at,
              attendees: data.attendees,
              location: data.location,
              meeting_type: data.meeting_type,
              updated_at: new Date().toISOString(),
            }
          : m
      )
      saveMeetings(updated)
      const meeting = updated.find((m) => m.id === id)!
      setMeetings((prev) =>
        prev.map((m) => (m.id === id ? meeting : m)).sort(
          (a, b) =>
            new Date(a.scheduled_at || '').getTime() - new Date(b.scheduled_at || '').getTime()
        )
      )
      return meeting
    } catch (err: any) {
      console.error('更新会议失败:', err)
      const current = getMeetingsFromStorage()
      const updated = current.map((m) =>
        m.id === id
          ? {
              ...m,
              title: data.title,
              scheduled_at: data.scheduled_at,
              attendees: data.attendees,
              location: data.location,
              meeting_type: data.meeting_type,
              updated_at: new Date().toISOString(),
            }
          : m
      )
      saveMeetings(updated)
      const meeting = updated.find((m) => m.id === id)!
      setMeetings((prev) =>
        prev.map((m) => (m.id === id ? meeting : m)).sort(
          (a, b) =>
            new Date(a.scheduled_at || '').getTime() - new Date(b.scheduled_at || '').getTime()
        )
      )
      return meeting
    }
  }

  const deleteMeeting = async (id: string) => {
    try {
      if (isSupabaseAvailable()) {
        await deleteMeetingInSupabase(id)
      }
    } catch (err: any) {
      console.error('Supabase 删除失败:', err)
    }

    const current = getMeetingsFromStorage()
    saveMeetings(current.filter((m) => m.id !== id))
    setMeetings((prev) => prev.filter((m) => m.id !== id))
  }

  return { meetings, loading, error, addMeeting, updateMeeting, deleteMeeting, refresh: fetchMeetings }
}
