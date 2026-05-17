import { Database } from './database.types'

export type MeetingType = 'project_review' | 'client_visit' | 'weekly_standup' | 'other'

export const MEETING_TYPE_LABELS: Record<MeetingType, string> = {
  project_review: '项目推进',
  client_visit: '客户拜访',
  weekly_standup: '周例会',
  other: '其他',
}

export const MEETING_TYPES: MeetingType[] = ['project_review', 'client_visit', 'weekly_standup', 'other']

export const MEETING_TYPE_COLORS: Record<MeetingType, { bg: string; text: string; border: string }> = {
  project_review: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  client_visit: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  weekly_standup: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  other: { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' },
}

export type Meeting = Database['public']['Tables']['meetings']['Row']

export type MeetingInsert = Database['public']['Tables']['meetings']['Insert']

export type MeetingUpdate = Database['public']['Tables']['meetings']['Update']

export interface MeetingMinutes {
  id: string
  meeting_id: string
  summary: string
  discussions: DiscussionItem[]
  decisions: string[]
  actionItems: ActionItem[]
  controversies: Controversy[]
  generatedAt: string
  fullText?: string
}

export interface DiscussionItem {
  topic: string
  content: string
  participants: string[]
}

export interface ActionItem {
  task: string
  assignee: string
  deadline: string
  priority: 'high' | 'medium' | 'low'
}

export interface Controversy {
  issue: string
  views: string[]
  status: string
}

export interface SearchResult {
  meeting: Meeting
  minutes?: MeetingMinutes
  relevance: number
  matchedFields: string[]
  highlights: { field: string; text: string }[]
}

export type Todo = Database['public']['Tables']['todos']['Row']
export type TodoInsert = Database['public']['Tables']['todos']['Insert']
export type TodoUpdate = Database['public']['Tables']['todos']['Update']

export type AgendaItem = Database['public']['Tables']['agenda_items']['Row']
export type AgendaItemInsert = Database['public']['Tables']['agenda_items']['Insert']

export type Material = Database['public']['Tables']['materials']['Row']
export type MaterialInsert = Database['public']['Tables']['materials']['Insert']

export type Minutes = Database['public']['Tables']['minutes']['Row']
export type MinutesInsert = Database['public']['Tables']['minutes']['Insert']
export type MinutesUpdate = Database['public']['Tables']['minutes']['Update']

export type Profile = Database['public']['Tables']['profiles']['Row']
