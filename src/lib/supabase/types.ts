export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      user_settings: {
        Row: {
          user_id: string
          accent_color: string
          editor_mode: string
          notification_enabled: boolean
          updated_at: string
        }
        Insert: {
          user_id: string
          accent_color?: string
          editor_mode?: string
          notification_enabled?: boolean
          updated_at?: string
        }
        Update: {
          user_id?: string
          accent_color?: string
          editor_mode?: string
          notification_enabled?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          id: string
          user_id: string
          title: string
          notes: string | null
          status: string
          priority: string
          due_date: string | null
          is_recurring: boolean
          recurrence_pattern: string | null
          parent_id: string | null
          position: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          notes?: string | null
          status?: string
          priority?: string
          due_date?: string | null
          is_recurring?: boolean
          recurrence_pattern?: string | null
          parent_id?: string | null
          position?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          notes?: string | null
          status?: string
          priority?: string
          due_date?: string | null
          is_recurring?: boolean
          recurrence_pattern?: string | null
          parent_id?: string | null
          position?: number
          updated_at?: string
        }
        Relationships: []
      }
      calendar_events: {
        Row: {
          id: string
          user_id: string
          title: string
          description: string | null
          start_time: string
          end_time: string | null
          all_day: boolean
          color: string | null
          source: string
          external_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          description?: string | null
          start_time: string
          end_time?: string | null
          all_day?: boolean
          color?: string | null
          source?: string
          external_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          start_time?: string
          end_time?: string | null
          all_day?: boolean
          color?: string | null
        }
        Relationships: []
      }
      notes: {
        Row: {
          id: string
          user_id: string
          title: string
          content: Json | null
          parent_id: string | null
          icon: string | null
          position: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title?: string
          content?: Json | null
          parent_id?: string | null
          icon?: string | null
          position?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          content?: Json | null
          parent_id?: string | null
          icon?: string | null
          position?: number
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}

export type Task = Database['public']['Tables']['tasks']['Row']
export type TaskInsert = Database['public']['Tables']['tasks']['Insert']
export type TaskUpdate = Database['public']['Tables']['tasks']['Update']
export type CalendarEvent = Database['public']['Tables']['calendar_events']['Row']
export type CalendarEventInsert = Database['public']['Tables']['calendar_events']['Insert']
export type CalendarEventUpdate = Database['public']['Tables']['calendar_events']['Update']
export type Note = Database['public']['Tables']['notes']['Row']
export type NoteInsert = Database['public']['Tables']['notes']['Insert']
export type NoteUpdate = Database['public']['Tables']['notes']['Update']
export type UserSettings = Database['public']['Tables']['user_settings']['Row']
