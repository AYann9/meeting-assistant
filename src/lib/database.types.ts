export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          avatar_url: string | null
          default_llm: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          default_llm?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          avatar_url?: string | null
          default_llm?: string
          created_at?: string
          updated_at?: string
        }
      }
      meetings: {
        Row: {
          id: string
          user_id: string
          title: string
          meeting_type: 'project_review' | 'client_visit' | 'weekly_standup' | 'other' | null
          scheduled_at: string | null
          duration_min: number
          location: string | null
          attendees: string[]
          status: 'upcoming' | 'completed' | 'cancelled'
          tags: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          meeting_type?: 'project_review' | 'client_visit' | 'weekly_standup' | 'other' | null
          scheduled_at?: string | null
          duration_min?: number
          location?: string | null
          attendees?: string[]
          status?: 'upcoming' | 'completed' | 'cancelled'
          tags?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          meeting_type?: 'project_review' | 'client_visit' | 'weekly_standup' | 'other' | null
          scheduled_at?: string | null
          duration_min?: number
          location?: string | null
          attendees?: string[]
          status?: 'upcoming' | 'completed' | 'cancelled'
          tags?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      materials: {
        Row: {
          id: string
          meeting_id: string
          file_name: string
          file_url: string | null
          file_type: string | null
          file_size: number | null
          version: number
          uploaded_by: string | null
          uploaded_at: string
        }
        Insert: {
          id?: string
          meeting_id: string
          file_name: string
          file_url?: string | null
          file_type?: string | null
          file_size?: number | null
          version?: number
          uploaded_by?: string | null
          uploaded_at?: string
        }
        Update: {
          id?: string
          meeting_id?: string
          file_name?: string
          file_url?: string | null
          file_type?: string | null
          file_size?: number | null
          version?: number
          uploaded_by?: string | null
          uploaded_at?: string
        }
      }
      agenda_items: {
        Row: {
          id: string
          meeting_id: string
          content: string
          duration_min: number
          sort_order: number
          suggested_by_ai: boolean
          created_at: string
        }
        Insert: {
          id?: string
          meeting_id: string
          content: string
          duration_min?: number
          sort_order?: number
          suggested_by_ai?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          meeting_id?: string
          content?: string
          duration_min?: number
          sort_order?: number
          suggested_by_ai?: boolean
          created_at?: string
        }
      }
      minutes: {
        Row: {
          id: string
          meeting_id: string
          raw_transcript: string | null
          structured_content: Json
          audio_url: string | null
          generated_by_ai: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          meeting_id: string
          raw_transcript?: string | null
          structured_content?: Json
          audio_url?: string | null
          generated_by_ai?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          meeting_id?: string
          raw_transcript?: string | null
          structured_content?: Json
          audio_url?: string | null
          generated_by_ai?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      todos: {
        Row: {
          id: string
          meeting_id: string
          content: string
          assignee: string | null
          due_date: string | null
          priority: 'high' | 'medium' | 'low'
          status: 'pending' | 'in_progress' | 'done'
          external_link: string | null
          external_platform: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          meeting_id: string
          content: string
          assignee?: string | null
          due_date?: string | null
          priority?: 'high' | 'medium' | 'low'
          status?: 'pending' | 'in_progress' | 'done'
          external_link?: string | null
          external_platform?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          meeting_id?: string
          content?: string
          assignee?: string | null
          due_date?: string | null
          priority?: 'high' | 'medium' | 'low'
          status?: 'pending' | 'in_progress' | 'done'
          external_link?: string | null
          external_platform?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
