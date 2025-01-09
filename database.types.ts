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
      account: {
        Row: {
          access_token: string | null
          expires_at: number | null
          id_token: string | null
          provider: string
          provider_account_id: string
          refresh_token: string | null
          scope: string | null
          session_state: string | null
          token_type: string | null
          type: string
          user_id: string
        }
        Insert: {
          access_token?: string | null
          expires_at?: number | null
          id_token?: string | null
          provider: string
          provider_account_id: string
          refresh_token?: string | null
          scope?: string | null
          session_state?: string | null
          token_type?: string | null
          type: string
          user_id: string
        }
        Update: {
          access_token?: string | null
          expires_at?: number | null
          id_token?: string | null
          provider?: string
          provider_account_id?: string
          refresh_token?: string | null
          scope?: string | null
          session_state?: string | null
          token_type?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "account_user_id_user_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      clubs: {
        Row: {
          Address: string | null
          City: string | null
          ClubID: number
          ClubName: string | null
          Continent: string | null
          Country: string | null
          Email: string | null
          Latitude: number | null
          Longitude: number | null
          PostalCode: number | null
          State: string | null
          Telephone: string | null
          Website: string | null
        }
        Insert: {
          Address?: string | null
          City?: string | null
          ClubID: number
          ClubName?: string | null
          Continent?: string | null
          Country?: string | null
          Email?: string | null
          Latitude?: number | null
          Longitude?: number | null
          PostalCode?: number | null
          State?: string | null
          Telephone?: string | null
          Website?: string | null
        }
        Update: {
          Address?: string | null
          City?: string | null
          ClubID?: number
          ClubName?: string | null
          Continent?: string | null
          Country?: string | null
          Email?: string | null
          Latitude?: number | null
          Longitude?: number | null
          PostalCode?: number | null
          State?: string | null
          Telephone?: string | null
          Website?: string | null
        }
        Relationships: []
      }
      coordinates: {
        Row: {
          CourseID: number
          Hole: number | null
          Latitude: number | null
          Location: string | null
          Longitude: number | null
          POI: string | null
          SideOfFairway: string | null
        }
        Insert: {
          CourseID: number
          Hole?: number | null
          Latitude?: number | null
          Location?: string | null
          Longitude?: number | null
          POI?: string | null
          SideOfFairway?: string | null
        }
        Update: {
          CourseID?: number
          Hole?: number | null
          Latitude?: number | null
          Location?: string | null
          Longitude?: number | null
          POI?: string | null
          SideOfFairway?: string | null
        }
        Relationships: []
      }
      course: {
        Row: {
          created_at: string
          id: number
          location: string | null
          name: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: number
          location?: string | null
          name: string
          user_id?: string
        }
        Update: {
          created_at?: string
          id?: number
          location?: string | null
          name?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "Course_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          ClubID: number
          CourseID: number
          CourseName: string | null
          Hcp1: number | null
          Hcp10: number | null
          Hcp11: number | null
          Hcp12: number | null
          Hcp13: number | null
          Hcp14: number | null
          Hcp15: number | null
          Hcp16: number | null
          Hcp17: number | null
          Hcp18: number | null
          Hcp2: number | null
          Hcp3: number | null
          Hcp4: number | null
          Hcp5: number | null
          Hcp6: number | null
          Hcp7: number | null
          Hcp8: number | null
          Hcp9: number | null
          HcpW1: number | null
          HcpW10: number | null
          HcpW11: number | null
          HcpW12: number | null
          HcpW13: number | null
          HcpW14: number | null
          HcpW15: number | null
          HcpW16: number | null
          HcpW17: number | null
          HcpW18: number | null
          HcpW2: number | null
          HcpW3: number | null
          HcpW4: number | null
          HcpW5: number | null
          HcpW6: number | null
          HcpW7: number | null
          HcpW8: number | null
          HcpW9: number | null
          MatchIndex1: number | null
          MatchIndex10: number | null
          MatchIndex11: number | null
          MatchIndex12: number | null
          MatchIndex13: number | null
          MatchIndex14: number | null
          MatchIndex15: number | null
          MatchIndex16: number | null
          MatchIndex17: number | null
          MatchIndex18: number | null
          MatchIndex2: number | null
          MatchIndex3: number | null
          MatchIndex4: number | null
          MatchIndex5: number | null
          MatchIndex6: number | null
          MatchIndex7: number | null
          MatchIndex8: number | null
          MatchIndex9: number | null
          MeasureMeters: number | null
          NumHoles: number | null
          Par1: number | null
          Par10: number | null
          Par11: number | null
          Par12: number | null
          Par13: number | null
          Par14: number | null
          Par15: number | null
          Par16: number | null
          Par17: number | null
          Par18: number | null
          Par2: number | null
          Par3: number | null
          Par4: number | null
          Par5: number | null
          Par6: number | null
          Par7: number | null
          Par8: number | null
          Par9: number | null
          ParW1: number | null
          ParW10: number | null
          ParW11: number | null
          ParW12: number | null
          ParW13: number | null
          ParW14: number | null
          ParW15: number | null
          ParW16: number | null
          ParW17: number | null
          ParW18: number | null
          ParW2: number | null
          ParW3: number | null
          ParW4: number | null
          ParW5: number | null
          ParW6: number | null
          ParW7: number | null
          ParW8: number | null
          ParW9: number | null
          SplitIndex1: string | null
          SplitIndex10: string | null
          SplitIndex11: string | null
          SplitIndex12: string | null
          SplitIndex13: string | null
          SplitIndex14: string | null
          SplitIndex15: string | null
          SplitIndex16: string | null
          SplitIndex17: string | null
          SplitIndex18: string | null
          SplitIndex2: string | null
          SplitIndex3: string | null
          SplitIndex4: string | null
          SplitIndex5: string | null
          SplitIndex6: string | null
          SplitIndex7: string | null
          SplitIndex8: string | null
          SplitIndex9: string | null
          TimestampUpdated: number | null
        }
        Insert: {
          ClubID: number
          CourseID: number
          CourseName?: string | null
          Hcp1?: number | null
          Hcp10?: number | null
          Hcp11?: number | null
          Hcp12?: number | null
          Hcp13?: number | null
          Hcp14?: number | null
          Hcp15?: number | null
          Hcp16?: number | null
          Hcp17?: number | null
          Hcp18?: number | null
          Hcp2?: number | null
          Hcp3?: number | null
          Hcp4?: number | null
          Hcp5?: number | null
          Hcp6?: number | null
          Hcp7?: number | null
          Hcp8?: number | null
          Hcp9?: number | null
          HcpW1?: number | null
          HcpW10?: number | null
          HcpW11?: number | null
          HcpW12?: number | null
          HcpW13?: number | null
          HcpW14?: number | null
          HcpW15?: number | null
          HcpW16?: number | null
          HcpW17?: number | null
          HcpW18?: number | null
          HcpW2?: number | null
          HcpW3?: number | null
          HcpW4?: number | null
          HcpW5?: number | null
          HcpW6?: number | null
          HcpW7?: number | null
          HcpW8?: number | null
          HcpW9?: number | null
          MatchIndex1?: number | null
          MatchIndex10?: number | null
          MatchIndex11?: number | null
          MatchIndex12?: number | null
          MatchIndex13?: number | null
          MatchIndex14?: number | null
          MatchIndex15?: number | null
          MatchIndex16?: number | null
          MatchIndex17?: number | null
          MatchIndex18?: number | null
          MatchIndex2?: number | null
          MatchIndex3?: number | null
          MatchIndex4?: number | null
          MatchIndex5?: number | null
          MatchIndex6?: number | null
          MatchIndex7?: number | null
          MatchIndex8?: number | null
          MatchIndex9?: number | null
          MeasureMeters?: number | null
          NumHoles?: number | null
          Par1?: number | null
          Par10?: number | null
          Par11?: number | null
          Par12?: number | null
          Par13?: number | null
          Par14?: number | null
          Par15?: number | null
          Par16?: number | null
          Par17?: number | null
          Par18?: number | null
          Par2?: number | null
          Par3?: number | null
          Par4?: number | null
          Par5?: number | null
          Par6?: number | null
          Par7?: number | null
          Par8?: number | null
          Par9?: number | null
          ParW1?: number | null
          ParW10?: number | null
          ParW11?: number | null
          ParW12?: number | null
          ParW13?: number | null
          ParW14?: number | null
          ParW15?: number | null
          ParW16?: number | null
          ParW17?: number | null
          ParW18?: number | null
          ParW2?: number | null
          ParW3?: number | null
          ParW4?: number | null
          ParW5?: number | null
          ParW6?: number | null
          ParW7?: number | null
          ParW8?: number | null
          ParW9?: number | null
          SplitIndex1?: string | null
          SplitIndex10?: string | null
          SplitIndex11?: string | null
          SplitIndex12?: string | null
          SplitIndex13?: string | null
          SplitIndex14?: string | null
          SplitIndex15?: string | null
          SplitIndex16?: string | null
          SplitIndex17?: string | null
          SplitIndex18?: string | null
          SplitIndex2?: string | null
          SplitIndex3?: string | null
          SplitIndex4?: string | null
          SplitIndex5?: string | null
          SplitIndex6?: string | null
          SplitIndex7?: string | null
          SplitIndex8?: string | null
          SplitIndex9?: string | null
          TimestampUpdated?: number | null
        }
        Update: {
          ClubID?: number
          CourseID?: number
          CourseName?: string | null
          Hcp1?: number | null
          Hcp10?: number | null
          Hcp11?: number | null
          Hcp12?: number | null
          Hcp13?: number | null
          Hcp14?: number | null
          Hcp15?: number | null
          Hcp16?: number | null
          Hcp17?: number | null
          Hcp18?: number | null
          Hcp2?: number | null
          Hcp3?: number | null
          Hcp4?: number | null
          Hcp5?: number | null
          Hcp6?: number | null
          Hcp7?: number | null
          Hcp8?: number | null
          Hcp9?: number | null
          HcpW1?: number | null
          HcpW10?: number | null
          HcpW11?: number | null
          HcpW12?: number | null
          HcpW13?: number | null
          HcpW14?: number | null
          HcpW15?: number | null
          HcpW16?: number | null
          HcpW17?: number | null
          HcpW18?: number | null
          HcpW2?: number | null
          HcpW3?: number | null
          HcpW4?: number | null
          HcpW5?: number | null
          HcpW6?: number | null
          HcpW7?: number | null
          HcpW8?: number | null
          HcpW9?: number | null
          MatchIndex1?: number | null
          MatchIndex10?: number | null
          MatchIndex11?: number | null
          MatchIndex12?: number | null
          MatchIndex13?: number | null
          MatchIndex14?: number | null
          MatchIndex15?: number | null
          MatchIndex16?: number | null
          MatchIndex17?: number | null
          MatchIndex18?: number | null
          MatchIndex2?: number | null
          MatchIndex3?: number | null
          MatchIndex4?: number | null
          MatchIndex5?: number | null
          MatchIndex6?: number | null
          MatchIndex7?: number | null
          MatchIndex8?: number | null
          MatchIndex9?: number | null
          MeasureMeters?: number | null
          NumHoles?: number | null
          Par1?: number | null
          Par10?: number | null
          Par11?: number | null
          Par12?: number | null
          Par13?: number | null
          Par14?: number | null
          Par15?: number | null
          Par16?: number | null
          Par17?: number | null
          Par18?: number | null
          Par2?: number | null
          Par3?: number | null
          Par4?: number | null
          Par5?: number | null
          Par6?: number | null
          Par7?: number | null
          Par8?: number | null
          Par9?: number | null
          ParW1?: number | null
          ParW10?: number | null
          ParW11?: number | null
          ParW12?: number | null
          ParW13?: number | null
          ParW14?: number | null
          ParW15?: number | null
          ParW16?: number | null
          ParW17?: number | null
          ParW18?: number | null
          ParW2?: number | null
          ParW3?: number | null
          ParW4?: number | null
          ParW5?: number | null
          ParW6?: number | null
          ParW7?: number | null
          ParW8?: number | null
          ParW9?: number | null
          SplitIndex1?: string | null
          SplitIndex10?: string | null
          SplitIndex11?: string | null
          SplitIndex12?: string | null
          SplitIndex13?: string | null
          SplitIndex14?: string | null
          SplitIndex15?: string | null
          SplitIndex16?: string | null
          SplitIndex17?: string | null
          SplitIndex18?: string | null
          SplitIndex2?: string | null
          SplitIndex3?: string | null
          SplitIndex4?: string | null
          SplitIndex5?: string | null
          SplitIndex6?: string | null
          SplitIndex7?: string | null
          SplitIndex8?: string | null
          SplitIndex9?: string | null
          TimestampUpdated?: number | null
        }
        Relationships: []
      }
      game: {
        Row: {
          created_at: string
          date: string
          id: number
          round_id: number | null
        }
        Insert: {
          created_at?: string
          date: string
          id?: number
          round_id?: number | null
        }
        Update: {
          created_at?: string
          date?: string
          id?: number
          round_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "game_round_id_fkey"
            columns: ["round_id"]
            isOneToOne: false
            referencedRelation: "round"
            referencedColumns: ["id"]
          },
        ]
      }
      hole: {
        Row: {
          created_at: string
          id: number
          number: number | null
          par: number | null
          round_id: number
        }
        Insert: {
          created_at?: string
          id?: number
          number?: number | null
          par?: number | null
          round_id: number
        }
        Update: {
          created_at?: string
          id?: number
          number?: number | null
          par?: number | null
          round_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "hole_round_id_fkey"
            columns: ["round_id"]
            isOneToOne: false
            referencedRelation: "round"
            referencedColumns: ["id"]
          },
        ]
      }
      post: {
        Row: {
          content: string
          created_at: string
          id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          full_name: string | null
          id: string
          updated_at: string | null
          username: string | null
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
          username?: string | null
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
          username?: string | null
          website?: string | null
        }
        Relationships: []
      }
      round: {
        Row: {
          course_id: number
          created_at: string
          id: number
          name: string | null
        }
        Insert: {
          course_id: number
          created_at?: string
          id?: number
          name?: string | null
        }
        Update: {
          course_id?: number
          created_at?: string
          id?: number
          name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "round_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "course"
            referencedColumns: ["id"]
          },
        ]
      }
      score: {
        Row: {
          created_at: string
          game_id: number
          hole_id: number
          id: number
          puts: number | null
          score: number | null
        }
        Insert: {
          created_at?: string
          game_id: number
          hole_id: number
          id?: number
          puts?: number | null
          score?: number | null
        }
        Update: {
          created_at?: string
          game_id?: number
          hole_id?: number
          id?: number
          puts?: number | null
          score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "score_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "game"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "score_hole_id_fkey"
            columns: ["hole_id"]
            isOneToOne: false
            referencedRelation: "hole"
            referencedColumns: ["id"]
          },
        ]
      }
      session: {
        Row: {
          expires: string
          session_token: string
          user_id: string
        }
        Insert: {
          expires: string
          session_token: string
          user_id: string
        }
        Update: {
          expires?: string
          session_token?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_user_id_user_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user"
            referencedColumns: ["id"]
          },
        ]
      }
      tees: {
        Row: {
          CourseID: number
          CR: number | null
          CRBack9: number | null
          CRFront9: number | null
          CRWomen: string | null
          CRWomenBack9: string | null
          CRWomenFront9: string | null
          Length1: number | null
          Length10: number | null
          Length11: number | null
          Length12: number | null
          Length13: number | null
          Length14: number | null
          Length15: number | null
          Length16: number | null
          Length17: number | null
          Length18: number | null
          Length2: number | null
          Length3: number | null
          Length4: number | null
          Length5: number | null
          Length6: number | null
          Length7: number | null
          Length8: number | null
          Length9: number | null
          MeasureUnit: string | null
          Slope: number | null
          SlopeBack9: number | null
          SlopeFront9: number | null
          SlopeWomen: string | null
          SlopeWomenBack: string | null
          SlopeWomenFront9: string | null
          TeeColor: string | null
          TeeID: number
          TeeName: string | null
        }
        Insert: {
          CourseID: number
          CR?: number | null
          CRBack9?: number | null
          CRFront9?: number | null
          CRWomen?: string | null
          CRWomenBack9?: string | null
          CRWomenFront9?: string | null
          Length1?: number | null
          Length10?: number | null
          Length11?: number | null
          Length12?: number | null
          Length13?: number | null
          Length14?: number | null
          Length15?: number | null
          Length16?: number | null
          Length17?: number | null
          Length18?: number | null
          Length2?: number | null
          Length3?: number | null
          Length4?: number | null
          Length5?: number | null
          Length6?: number | null
          Length7?: number | null
          Length8?: number | null
          Length9?: number | null
          MeasureUnit?: string | null
          Slope?: number | null
          SlopeBack9?: number | null
          SlopeFront9?: number | null
          SlopeWomen?: string | null
          SlopeWomenBack?: string | null
          SlopeWomenFront9?: string | null
          TeeColor?: string | null
          TeeID: number
          TeeName?: string | null
        }
        Update: {
          CourseID?: number
          CR?: number | null
          CRBack9?: number | null
          CRFront9?: number | null
          CRWomen?: string | null
          CRWomenBack9?: string | null
          CRWomenFront9?: string | null
          Length1?: number | null
          Length10?: number | null
          Length11?: number | null
          Length12?: number | null
          Length13?: number | null
          Length14?: number | null
          Length15?: number | null
          Length16?: number | null
          Length17?: number | null
          Length18?: number | null
          Length2?: number | null
          Length3?: number | null
          Length4?: number | null
          Length5?: number | null
          Length6?: number | null
          Length7?: number | null
          Length8?: number | null
          Length9?: number | null
          MeasureUnit?: string | null
          Slope?: number | null
          SlopeBack9?: number | null
          SlopeFront9?: number | null
          SlopeWomen?: string | null
          SlopeWomenBack?: string | null
          SlopeWomenFront9?: string | null
          TeeColor?: string | null
          TeeID?: number
          TeeName?: string | null
        }
        Relationships: []
      }
      user: {
        Row: {
          email: string
          email_verified: string | null
          id: string
          image: string | null
          name: string | null
        }
        Insert: {
          email: string
          email_verified?: string | null
          id?: string
          image?: string | null
          name?: string | null
        }
        Update: {
          email?: string
          email_verified?: string | null
          id?: string
          image?: string | null
          name?: string | null
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
