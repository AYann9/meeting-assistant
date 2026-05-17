import { Meeting, MeetingType } from '@/lib/types'

const STORAGE_KEY = 'meeting_assistant_data'

export function getMeetings(): Meeting[] {
  if (typeof window === 'undefined') return []
  const data = localStorage.getItem(STORAGE_KEY)
  if (!data) return []
  try {
    return JSON.parse(data) as Meeting[]
  } catch {
    return []
  }
}

export function saveMeetings(meetings: Meeting[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(meetings))
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9)
}
