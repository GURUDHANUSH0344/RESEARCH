export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.17"
  }
  public: {
    Tables: {
      contradictions: {
        Row: {
          confidence: string | null
          created_at: string
          finding_a: string | null
          finding_b: string | null
          id: string
          paper_a: string | null
          paper_b: string | null
          possible_explanation: string | null
          project_id: string
          topic: string | null
        }
        Insert: {
          confidence?: string | null
          created_at?: string
          finding_a?: string | null
          finding_b?: string | null
          id?: string
          paper_a?: string | null
          paper_b?: string | null
          possible_explanation?: string | null
          project_id: string
          topic?: string | null
        }
        Update: {
          confidence?: string | null
          created_at?: string
          finding_a?: string | null
          finding_b?: string | null
          id?: string
          paper_a?: string | null
          paper_b?: string | null
          possible_explanation?: string | null
          project_id?: string
          topic?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contradictions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "research_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      experiments: {
        Row: {
          created_at: string
          hypothesis_id: string | null
          id: string
          plan: Json
          project_id: string
        }
        Insert: {
          created_at?: string
          hypothesis_id?: string | null
          id?: string
          plan?: Json
          project_id: string
        }
        Update: {
          created_at?: string
          hypothesis_id?: string | null
          id?: string
          plan?: Json
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "experiments_hypothesis_id_fkey"
            columns: ["hypothesis_id"]
            isOneToOne: false
            referencedRelation: "hypotheses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "experiments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "research_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      hypotheses: {
        Row: {
          created_at: string
          dependent_variable: string | null
          evidence: string | null
          expected_outcome: string | null
          feasibility_score: number | null
          id: string
          impact_score: number | null
          independent_variable: string | null
          label: string | null
          novelty_score: number | null
          overall_score: number | null
          project_id: string
          rationale: string | null
          selected: boolean
          statement: string
        }
        Insert: {
          created_at?: string
          dependent_variable?: string | null
          evidence?: string | null
          expected_outcome?: string | null
          feasibility_score?: number | null
          id?: string
          impact_score?: number | null
          independent_variable?: string | null
          label?: string | null
          novelty_score?: number | null
          overall_score?: number | null
          project_id: string
          rationale?: string | null
          selected?: boolean
          statement: string
        }
        Update: {
          created_at?: string
          dependent_variable?: string | null
          evidence?: string | null
          expected_outcome?: string | null
          feasibility_score?: number | null
          id?: string
          impact_score?: number | null
          independent_variable?: string | null
          label?: string | null
          novelty_score?: number | null
          overall_score?: number | null
          project_id?: string
          rationale?: string | null
          selected?: boolean
          statement?: string
        }
        Relationships: [
          {
            foreignKeyName: "hypotheses_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "research_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      paper_analysis: {
        Row: {
          contributions: string[]
          created_at: string
          dataset: string | null
          experimental_setup: string | null
          future_work: string[]
          id: string
          limitations: string[]
          methodology: string | null
          objective: string | null
          paper_id: string
          problem: string | null
          results: string | null
        }
        Insert: {
          contributions?: string[]
          created_at?: string
          dataset?: string | null
          experimental_setup?: string | null
          future_work?: string[]
          id?: string
          limitations?: string[]
          methodology?: string | null
          objective?: string | null
          paper_id: string
          problem?: string | null
          results?: string | null
        }
        Update: {
          contributions?: string[]
          created_at?: string
          dataset?: string | null
          experimental_setup?: string | null
          future_work?: string[]
          id?: string
          limitations?: string[]
          methodology?: string | null
          objective?: string | null
          paper_id?: string
          problem?: string | null
          results?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "paper_analysis_paper_id_fkey"
            columns: ["paper_id"]
            isOneToOne: false
            referencedRelation: "papers"
            referencedColumns: ["id"]
          },
        ]
      }
      papers: {
        Row: {
          abstract: string | null
          authors: string[]
          citation_count: number
          concepts: string[]
          created_at: string
          doi: string | null
          external_id: string | null
          id: string
          open_access: boolean
          project_id: string
          source: string | null
          title: string
          url: string | null
          venue: string | null
          year: number | null
        }
        Insert: {
          abstract?: string | null
          authors?: string[]
          citation_count?: number
          concepts?: string[]
          created_at?: string
          doi?: string | null
          external_id?: string | null
          id?: string
          open_access?: boolean
          project_id: string
          source?: string | null
          title: string
          url?: string | null
          venue?: string | null
          year?: number | null
        }
        Update: {
          abstract?: string | null
          authors?: string[]
          citation_count?: number
          concepts?: string[]
          created_at?: string
          doi?: string | null
          external_id?: string | null
          id?: string
          open_access?: boolean
          project_id?: string
          source?: string | null
          title?: string
          url?: string | null
          venue?: string | null
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "papers_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "research_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          id: string
          name: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          id: string
          name?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string | null
        }
        Relationships: []
      }
      reports: {
        Row: {
          content: string
          created_at: string
          id: string
          project_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          project_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "research_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      research_gaps: {
        Row: {
          category: string | null
          confidence: string | null
          created_at: string
          description: string | null
          evidence: string | null
          feasibility: number | null
          id: string
          novelty: number | null
          potential_question: string | null
          project_id: string
          supporting_papers: string[]
          title: string
          why_it_matters: string | null
        }
        Insert: {
          category?: string | null
          confidence?: string | null
          created_at?: string
          description?: string | null
          evidence?: string | null
          feasibility?: number | null
          id?: string
          novelty?: number | null
          potential_question?: string | null
          project_id: string
          supporting_papers?: string[]
          title: string
          why_it_matters?: string | null
        }
        Update: {
          category?: string | null
          confidence?: string | null
          created_at?: string
          description?: string | null
          evidence?: string | null
          feasibility?: number | null
          id?: string
          novelty?: number | null
          potential_question?: string | null
          project_id?: string
          supporting_papers?: string[]
          title?: string
          why_it_matters?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "research_gaps_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "research_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      research_projects: {
        Row: {
          created_at: string
          id: string
          objective: string | null
          paper_limit: number
          research_field: string | null
          research_question: string
          status: string
          synthesis: Json | null
          title: string
          updated_at: string
          user_id: string
          year_from: number | null
          year_to: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          objective?: string | null
          paper_limit?: number
          research_field?: string | null
          research_question: string
          status?: string
          synthesis?: Json | null
          title: string
          updated_at?: string
          user_id: string
          year_from?: number | null
          year_to?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          objective?: string | null
          paper_limit?: number
          research_field?: string | null
          research_question?: string
          status?: string
          synthesis?: Json | null
          title?: string
          updated_at?: string
          user_id?: string
          year_from?: number | null
          year_to?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
