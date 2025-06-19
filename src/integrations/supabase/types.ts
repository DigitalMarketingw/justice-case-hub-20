export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      attorney_bonuses: {
        Row: {
          attorney_id: string
          awarded_by: string
          awarded_date: string
          bonus_amount: number
          bonus_type: string
          case_id: string | null
          created_at: string
          criteria_met: string | null
          description: string | null
          id: string
          updated_at: string
        }
        Insert: {
          attorney_id: string
          awarded_by: string
          awarded_date?: string
          bonus_amount: number
          bonus_type?: string
          case_id?: string | null
          created_at?: string
          criteria_met?: string | null
          description?: string | null
          id?: string
          updated_at?: string
        }
        Update: {
          attorney_id?: string
          awarded_by?: string
          awarded_date?: string
          bonus_amount?: number
          bonus_type?: string
          case_id?: string | null
          created_at?: string
          criteria_met?: string | null
          description?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "attorney_bonuses_attorney_id_fkey"
            columns: ["attorney_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attorney_bonuses_awarded_by_fkey"
            columns: ["awarded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attorney_bonuses_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      attorneys: {
        Row: {
          bar_number: string | null
          created_at: string | null
          hourly_rate: number | null
          id: string
          specialization: string[] | null
          updated_at: string | null
          years_of_experience: number | null
        }
        Insert: {
          bar_number?: string | null
          created_at?: string | null
          hourly_rate?: number | null
          id: string
          specialization?: string[] | null
          updated_at?: string | null
          years_of_experience?: number | null
        }
        Update: {
          bar_number?: string | null
          created_at?: string | null
          hourly_rate?: number | null
          id?: string
          specialization?: string[] | null
          updated_at?: string | null
          years_of_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "attorneys_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      billing_entries: {
        Row: {
          attorney_id: string
          case_id: string
          created_at: string | null
          date_worked: string
          description: string
          hourly_rate: number
          hours_worked: number
          id: string
          is_billable: boolean | null
          total_amount: number | null
        }
        Insert: {
          attorney_id: string
          case_id: string
          created_at?: string | null
          date_worked: string
          description: string
          hourly_rate: number
          hours_worked: number
          id?: string
          is_billable?: boolean | null
          total_amount?: number | null
        }
        Update: {
          attorney_id?: string
          case_id?: string
          created_at?: string | null
          date_worked?: string
          description?: string
          hourly_rate?: number
          hours_worked?: number
          id?: string
          is_billable?: boolean | null
          total_amount?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "billing_entries_attorney_id_fkey"
            columns: ["attorney_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "billing_entries_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
        ]
      }
      bonus_criteria: {
        Row: {
          bonus_amount: number
          created_at: string
          created_by: string
          criteria_type: string
          description: string | null
          firm_id: string | null
          id: string
          is_active: boolean
          name: string
          target_value: number | null
          updated_at: string
        }
        Insert: {
          bonus_amount: number
          created_at?: string
          created_by: string
          criteria_type: string
          description?: string | null
          firm_id?: string | null
          id?: string
          is_active?: boolean
          name: string
          target_value?: number | null
          updated_at?: string
        }
        Update: {
          bonus_amount?: number
          created_at?: string
          created_by?: string
          criteria_type?: string
          description?: string | null
          firm_id?: string | null
          id?: string
          is_active?: boolean
          name?: string
          target_value?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bonus_criteria_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bonus_criteria_firm_id_fkey"
            columns: ["firm_id"]
            isOneToOne: false
            referencedRelation: "firms"
            referencedColumns: ["id"]
          },
        ]
      }
      calendar_events: {
        Row: {
          attendees: string[] | null
          created_at: string
          description: string | null
          end_time: string
          event_type: string | null
          google_event_id: string | null
          id: string
          is_google_synced: boolean | null
          location: string | null
          start_time: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          attendees?: string[] | null
          created_at?: string
          description?: string | null
          end_time: string
          event_type?: string | null
          google_event_id?: string | null
          id?: string
          is_google_synced?: boolean | null
          location?: string | null
          start_time: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          attendees?: string[] | null
          created_at?: string
          description?: string | null
          end_time?: string
          event_type?: string | null
          google_event_id?: string | null
          id?: string
          is_google_synced?: boolean | null
          location?: string | null
          start_time?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      case_referrals: {
        Row: {
          auto_approved: boolean | null
          case_id: string
          client_consent_obtained: boolean | null
          compliance_notes: string | null
          created_at: string
          deadline_date: string | null
          external_source_name: string | null
          id: string
          notes: string | null
          priority_level: string | null
          processed_by: string | null
          processed_date: string | null
          referral_date: string
          referral_fee: number | null
          referral_reason: string | null
          referral_source: string | null
          referred_to_attorney_id: string | null
          referring_attorney_id: string | null
          requires_case_manager_approval: boolean | null
          requires_compliance_review: boolean | null
          requires_firm_admin_approval: boolean | null
          risk_assessment_score: number | null
          status: string
          updated_at: string
          workflow_stage: string | null
        }
        Insert: {
          auto_approved?: boolean | null
          case_id: string
          client_consent_obtained?: boolean | null
          compliance_notes?: string | null
          created_at?: string
          deadline_date?: string | null
          external_source_name?: string | null
          id?: string
          notes?: string | null
          priority_level?: string | null
          processed_by?: string | null
          processed_date?: string | null
          referral_date?: string
          referral_fee?: number | null
          referral_reason?: string | null
          referral_source?: string | null
          referred_to_attorney_id?: string | null
          referring_attorney_id?: string | null
          requires_case_manager_approval?: boolean | null
          requires_compliance_review?: boolean | null
          requires_firm_admin_approval?: boolean | null
          risk_assessment_score?: number | null
          status?: string
          updated_at?: string
          workflow_stage?: string | null
        }
        Update: {
          auto_approved?: boolean | null
          case_id?: string
          client_consent_obtained?: boolean | null
          compliance_notes?: string | null
          created_at?: string
          deadline_date?: string | null
          external_source_name?: string | null
          id?: string
          notes?: string | null
          priority_level?: string | null
          processed_by?: string | null
          processed_date?: string | null
          referral_date?: string
          referral_fee?: number | null
          referral_reason?: string | null
          referral_source?: string | null
          referred_to_attorney_id?: string | null
          referring_attorney_id?: string | null
          requires_case_manager_approval?: boolean | null
          requires_compliance_review?: boolean | null
          requires_firm_admin_approval?: boolean | null
          risk_assessment_score?: number | null
          status?: string
          updated_at?: string
          workflow_stage?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "case_referrals_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_referrals_processed_by_fkey"
            columns: ["processed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_referrals_referred_to_attorney_id_fkey"
            columns: ["referred_to_attorney_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_referrals_referring_attorney_id_fkey"
            columns: ["referring_attorney_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      cases: {
        Row: {
          attorney_id: string
          billable_rate: number | null
          case_number: string
          case_type: string | null
          client_id: string
          court_date: string | null
          court_name: string | null
          created_at: string | null
          description: string | null
          estimated_hours: number | null
          filing_date: string | null
          firm_id: string | null
          id: string
          is_referral: boolean | null
          judge_name: string | null
          original_attorney_id: string | null
          priority: Database["public"]["Enums"]["case_priority"] | null
          referral_count: number | null
          status: Database["public"]["Enums"]["case_status"] | null
          title: string
          total_billed: number | null
          updated_at: string | null
        }
        Insert: {
          attorney_id: string
          billable_rate?: number | null
          case_number: string
          case_type?: string | null
          client_id: string
          court_date?: string | null
          court_name?: string | null
          created_at?: string | null
          description?: string | null
          estimated_hours?: number | null
          filing_date?: string | null
          firm_id?: string | null
          id?: string
          is_referral?: boolean | null
          judge_name?: string | null
          original_attorney_id?: string | null
          priority?: Database["public"]["Enums"]["case_priority"] | null
          referral_count?: number | null
          status?: Database["public"]["Enums"]["case_status"] | null
          title: string
          total_billed?: number | null
          updated_at?: string | null
        }
        Update: {
          attorney_id?: string
          billable_rate?: number | null
          case_number?: string
          case_type?: string | null
          client_id?: string
          court_date?: string | null
          court_name?: string | null
          created_at?: string | null
          description?: string | null
          estimated_hours?: number | null
          filing_date?: string | null
          firm_id?: string | null
          id?: string
          is_referral?: boolean | null
          judge_name?: string | null
          original_attorney_id?: string | null
          priority?: Database["public"]["Enums"]["case_priority"] | null
          referral_count?: number | null
          status?: Database["public"]["Enums"]["case_status"] | null
          title?: string
          total_billed?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cases_attorney_id_fkey"
            columns: ["attorney_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cases_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cases_firm_id_fkey"
            columns: ["firm_id"]
            isOneToOne: false
            referencedRelation: "firms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cases_original_attorney_id_fkey"
            columns: ["original_attorney_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      client_assignments: {
        Row: {
          assigned_by: string
          assigned_date: string
          attorney_id: string | null
          client_id: string
          created_at: string | null
          id: string
          is_active: boolean | null
          reason: string | null
          unassigned_by: string | null
          unassigned_date: string | null
        }
        Insert: {
          assigned_by: string
          assigned_date?: string
          attorney_id?: string | null
          client_id: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          reason?: string | null
          unassigned_by?: string | null
          unassigned_date?: string | null
        }
        Update: {
          assigned_by?: string
          assigned_date?: string
          attorney_id?: string | null
          client_id?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          reason?: string | null
          unassigned_by?: string | null
          unassigned_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_assignments_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_assignments_attorney_id_fkey"
            columns: ["attorney_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_assignments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_assignments_unassigned_by_fkey"
            columns: ["unassigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      client_transfers: {
        Row: {
          client_id: string
          created_at: string | null
          from_firm_id: string | null
          id: string
          reason: string | null
          to_firm_id: string
          transferred_by: string
          transferred_date: string
        }
        Insert: {
          client_id: string
          created_at?: string | null
          from_firm_id?: string | null
          id?: string
          reason?: string | null
          to_firm_id: string
          transferred_by: string
          transferred_date?: string
        }
        Update: {
          client_id?: string
          created_at?: string | null
          from_firm_id?: string | null
          id?: string
          reason?: string | null
          to_firm_id?: string
          transferred_by?: string
          transferred_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_transfers_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_transfers_from_firm_id_fkey"
            columns: ["from_firm_id"]
            isOneToOne: false
            referencedRelation: "firms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_transfers_to_firm_id_fkey"
            columns: ["to_firm_id"]
            isOneToOne: false
            referencedRelation: "firms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_transfers_transferred_by_fkey"
            columns: ["transferred_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          address: string | null
          created_at: string | null
          date_of_birth: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          id: string
          notes: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          id: string
          notes?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          id?: string
          notes?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clients_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          attorney_id: string
          case_id: string | null
          client_id: string
          created_at: string | null
          id: string
          last_message_at: string | null
        }
        Insert: {
          attorney_id: string
          case_id?: string | null
          client_id: string
          created_at?: string | null
          id?: string
          last_message_at?: string | null
        }
        Update: {
          attorney_id?: string
          case_id?: string | null
          client_id?: string
          created_at?: string | null
          id?: string
          last_message_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_attorney_id_fkey"
            columns: ["attorney_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_conversations_attorney"
            columns: ["attorney_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_conversations_client"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          attorney_id: string | null
          case_id: string | null
          client_id: string | null
          created_at: string | null
          description: string | null
          document_type: Database["public"]["Enums"]["document_type"] | null
          file_path: string | null
          file_size: number | null
          id: string
          is_confidential: boolean | null
          mime_type: string | null
          name: string
          updated_at: string | null
          uploaded_by: string
        }
        Insert: {
          attorney_id?: string | null
          case_id?: string | null
          client_id?: string | null
          created_at?: string | null
          description?: string | null
          document_type?: Database["public"]["Enums"]["document_type"] | null
          file_path?: string | null
          file_size?: number | null
          id?: string
          is_confidential?: boolean | null
          mime_type?: string | null
          name: string
          updated_at?: string | null
          uploaded_by: string
        }
        Update: {
          attorney_id?: string | null
          case_id?: string | null
          client_id?: string | null
          created_at?: string | null
          description?: string | null
          document_type?: Database["public"]["Enums"]["document_type"] | null
          file_path?: string | null
          file_size?: number | null
          id?: string
          is_confidential?: boolean | null
          mime_type?: string | null
          name?: string
          updated_at?: string | null
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_attorney_id_fkey"
            columns: ["attorney_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      firms: {
        Row: {
          address: string | null
          created_at: string | null
          email: string | null
          id: string
          name: string
          phone: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      google_calendar_settings: {
        Row: {
          access_token: string | null
          created_at: string
          google_calendar_id: string | null
          id: string
          is_connected: boolean | null
          refresh_token: string | null
          token_expires_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token?: string | null
          created_at?: string
          google_calendar_id?: string | null
          id?: string
          is_connected?: boolean | null
          refresh_token?: string | null
          token_expires_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string | null
          created_at?: string
          google_calendar_id?: string | null
          id?: string
          is_connected?: boolean | null
          refresh_token?: string | null
          token_expires_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      invoices: {
        Row: {
          amount: number
          attorney_id: string
          case_id: string
          client_id: string
          created_at: string | null
          due_date: string
          id: string
          invoice_number: string
          notes: string | null
          paid_date: string | null
          status: string | null
          tax_amount: number | null
          total_amount: number | null
        }
        Insert: {
          amount: number
          attorney_id: string
          case_id: string
          client_id: string
          created_at?: string | null
          due_date: string
          id?: string
          invoice_number: string
          notes?: string | null
          paid_date?: string | null
          status?: string | null
          tax_amount?: number | null
          total_amount?: number | null
        }
        Update: {
          amount?: number
          attorney_id?: string
          case_id?: string
          client_id?: string
          created_at?: string | null
          due_date?: string
          id?: string
          invoice_number?: string
          notes?: string | null
          paid_date?: string | null
          status?: string | null
          tax_amount?: number | null
          total_amount?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_attorney_id_fkey"
            columns: ["attorney_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_case_id_fkey"
            columns: ["case_id"]
            isOneToOne: false
            referencedRelation: "cases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      message_attachments: {
        Row: {
          created_at: string
          file_name: string
          file_path: string
          file_size: number | null
          file_type: string
          id: string
          message_id: string
          mime_type: string | null
          uploaded_by: string
        }
        Insert: {
          created_at?: string
          file_name: string
          file_path: string
          file_size?: number | null
          file_type: string
          id?: string
          message_id: string
          mime_type?: string | null
          uploaded_by: string
        }
        Update: {
          created_at?: string
          file_name?: string
          file_path?: string
          file_size?: number | null
          file_type?: string
          id?: string
          message_id?: string
          mime_type?: string | null
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_attachments_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_attachments_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          client_id: string | null
          content: string
          conversation_id: string
          created_at: string | null
          id: string
          is_read: boolean | null
          recipient_id: string
          sender_id: string
        }
        Insert: {
          client_id?: string | null
          content: string
          conversation_id: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          recipient_id: string
          sender_id: string
        }
        Update: {
          client_id?: string | null
          content?: string
          conversation_id?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          recipient_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_messages_conversation"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_messages_recipient"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_messages_sender"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          activated_at: string | null
          assigned_attorney_id: string | null
          created_at: string | null
          created_by: string | null
          dropped_by: string | null
          dropped_date: string | null
          email: string
          firm_id: string | null
          first_name: string | null
          id: string
          invite_token: string | null
          invited_at: string | null
          is_active: boolean | null
          is_dropped: boolean | null
          last_login: string | null
          last_name: string | null
          password_reset_required: boolean | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          transferred_by: string | null
          transferred_date: string | null
          transferred_from_firm_id: string | null
          updated_at: string | null
        }
        Insert: {
          activated_at?: string | null
          assigned_attorney_id?: string | null
          created_at?: string | null
          created_by?: string | null
          dropped_by?: string | null
          dropped_date?: string | null
          email: string
          firm_id?: string | null
          first_name?: string | null
          id: string
          invite_token?: string | null
          invited_at?: string | null
          is_active?: boolean | null
          is_dropped?: boolean | null
          last_login?: string | null
          last_name?: string | null
          password_reset_required?: boolean | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          transferred_by?: string | null
          transferred_date?: string | null
          transferred_from_firm_id?: string | null
          updated_at?: string | null
        }
        Update: {
          activated_at?: string | null
          assigned_attorney_id?: string | null
          created_at?: string | null
          created_by?: string | null
          dropped_by?: string | null
          dropped_date?: string | null
          email?: string
          firm_id?: string | null
          first_name?: string | null
          id?: string
          invite_token?: string | null
          invited_at?: string | null
          is_active?: boolean | null
          is_dropped?: boolean | null
          last_login?: string | null
          last_name?: string | null
          password_reset_required?: boolean | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          transferred_by?: string | null
          transferred_date?: string | null
          transferred_from_firm_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_assigned_attorney_id_fkey"
            columns: ["assigned_attorney_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_dropped_by_fkey"
            columns: ["dropped_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_firm_id_fkey"
            columns: ["firm_id"]
            isOneToOne: false
            referencedRelation: "firms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_transferred_by_fkey"
            columns: ["transferred_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_transferred_from_firm_id_fkey"
            columns: ["transferred_from_firm_id"]
            isOneToOne: false
            referencedRelation: "firms"
            referencedColumns: ["id"]
          },
        ]
      }
      referral_approvals: {
        Row: {
          approval_type: string
          approved_at: string | null
          approver_id: string
          comments: string | null
          created_at: string
          id: string
          referral_id: string
          status: string
          updated_at: string
        }
        Insert: {
          approval_type: string
          approved_at?: string | null
          approver_id: string
          comments?: string | null
          created_at?: string
          id?: string
          referral_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          approval_type?: string
          approved_at?: string | null
          approver_id?: string
          comments?: string | null
          created_at?: string
          id?: string
          referral_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "referral_approvals_approver_id_fkey"
            columns: ["approver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referral_approvals_referral_id_fkey"
            columns: ["referral_id"]
            isOneToOne: false
            referencedRelation: "case_referrals"
            referencedColumns: ["id"]
          },
        ]
      }
      referral_comments: {
        Row: {
          comment: string
          created_at: string
          id: string
          is_internal: boolean | null
          referral_id: string
          user_id: string
        }
        Insert: {
          comment: string
          created_at?: string
          id?: string
          is_internal?: boolean | null
          referral_id: string
          user_id: string
        }
        Update: {
          comment?: string
          created_at?: string
          id?: string
          is_internal?: boolean | null
          referral_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "referral_comments_referral_id_fkey"
            columns: ["referral_id"]
            isOneToOne: false
            referencedRelation: "case_referrals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referral_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      referral_notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean | null
          message: string
          notification_type: string
          referral_id: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message: string
          notification_type: string
          referral_id: string
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message?: string
          notification_type?: string
          referral_id?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "referral_notifications_referral_id_fkey"
            columns: ["referral_id"]
            isOneToOne: false
            referencedRelation: "case_referrals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referral_notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      referral_sources: {
        Row: {
          address: string | null
          contact_email: string | null
          contact_phone: string | null
          created_at: string
          firm_id: string | null
          id: string
          is_active: boolean
          source_name: string
          source_type: string
          total_referrals: number | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          firm_id?: string | null
          id?: string
          is_active?: boolean
          source_name: string
          source_type: string
          total_referrals?: number | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string
          firm_id?: string | null
          id?: string
          is_active?: boolean
          source_name?: string
          source_type?: string
          total_referrals?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "referral_sources_firm_id_fkey"
            columns: ["firm_id"]
            isOneToOne: false
            referencedRelation: "firms"
            referencedColumns: ["id"]
          },
        ]
      }
      user_activity_log: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          id: string
          performed_by: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          id?: string
          performed_by?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          performed_by?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_activity_log_performed_by_fkey"
            columns: ["performed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_activity_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_access_profile: {
        Args: { profile_id: string }
        Returns: boolean
      }
      determine_approval_requirements: {
        Args: {
          p_referral_fee: number
          p_case_value?: number
          p_referral_source?: string
        }
        Returns: {
          requires_case_manager: boolean
          requires_firm_admin: boolean
          requires_compliance: boolean
          risk_score: number
        }[]
      }
      get_current_user_firm_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: Database["public"]["Enums"]["user_role"]
      }
      get_user_role: {
        Args: { user_id: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
      is_current_user_firm_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_firm_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
      is_super_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
      log_user_activity: {
        Args: { p_user_id: string; p_action: string; p_details?: Json }
        Returns: undefined
      }
    }
    Enums: {
      case_priority: "low" | "medium" | "high" | "urgent"
      case_status:
        | "active"
        | "pending"
        | "closed"
        | "on_hold"
        | "pending_case_manager"
        | "case_manager_approved"
        | "firm_admin_approved"
        | "compliance_review"
        | "rejected"
      document_type:
        | "contract"
        | "court_filing"
        | "evidence"
        | "correspondence"
        | "other"
      user_role:
        | "super_admin"
        | "firm_admin"
        | "attorney"
        | "client"
        | "case_manager"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      case_priority: ["low", "medium", "high", "urgent"],
      case_status: [
        "active",
        "pending",
        "closed",
        "on_hold",
        "pending_case_manager",
        "case_manager_approved",
        "firm_admin_approved",
        "compliance_review",
        "rejected",
      ],
      document_type: [
        "contract",
        "court_filing",
        "evidence",
        "correspondence",
        "other",
      ],
      user_role: [
        "super_admin",
        "firm_admin",
        "attorney",
        "client",
        "case_manager",
      ],
    },
  },
} as const
