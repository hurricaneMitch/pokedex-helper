export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      user_collection: {
        Row: {
          id: string;
          user_id: string;
          pokemon_id: number;
          has_regular: boolean;
          has_shiny: boolean;
          has_xxl: boolean;
          has_xxl_shiny: boolean;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          pokemon_id: number;
          has_regular?: boolean;
          has_shiny?: boolean;
          has_xxl?: boolean;
          has_xxl_shiny?: boolean;
          updated_at?: string;
        };
        Update: {
          has_regular?: boolean;
          has_shiny?: boolean;
          has_xxl?: boolean;
          has_xxl_shiny?: boolean;
          updated_at?: string;
        };
      };
    };
  };
}

export type CollectionRow = Database["public"]["Tables"]["user_collection"]["Row"];
export type CollectionFlag = "has_regular" | "has_shiny" | "has_xxl" | "has_xxl_shiny";
