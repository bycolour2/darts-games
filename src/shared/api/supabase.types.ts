export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      games: {
        Row: {
          createdAt: string;
          id: string;
          maxPlayers: number;
          name: string;
        };
        Insert: {
          createdAt?: string;
          id?: string;
          maxPlayers: number;
          name?: string;
        };
        Update: {
          createdAt?: string;
          id?: string;
          maxPlayers?: number;
          name?: string;
        };
        Relationships: [];
      };
      hits: {
        Row: {
          id: number;
          multiplicator: number | null;
          sector: number | null;
        };
        Insert: {
          id?: number;
          multiplicator?: number | null;
          sector?: number | null;
        };
        Update: {
          id?: number;
          multiplicator?: number | null;
          sector?: number | null;
        };
        Relationships: [];
      };
      KDPlayerDetails: {
        Row: {
          firstScore: number | null;
          id: string;
          isDead: boolean;
          isKiller: boolean;
          lifeCount: number;
          lobbyId: string;
          order: number;
          sector: number | null;
          userId: string;
          username: string;
        };
        Insert: {
          firstScore?: number | null;
          id?: string;
          isDead?: boolean;
          isKiller?: boolean;
          lifeCount: number;
          lobbyId: string;
          order: number;
          sector?: number | null;
          userId: string;
          username: string;
        };
        Update: {
          firstScore?: number | null;
          id?: string;
          isDead?: boolean;
          isKiller?: boolean;
          lifeCount?: number;
          lobbyId?: string;
          order?: number;
          sector?: number | null;
          userId?: string;
          username?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'KDPlayerDetails_lobbyId_fkey';
            columns: ['lobbyId'];
            referencedRelation: 'lobbies';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'KDPlayerDetails_userId_fkey';
            columns: ['userId'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      lobbies: {
        Row: {
          closed: boolean;
          createdAt: string;
          finished: boolean;
          gameName: string;
          id: string;
          winner: string | null;
        };
        Insert: {
          closed?: boolean;
          createdAt?: string;
          finished?: boolean;
          gameName: string;
          id?: string;
          winner?: string | null;
        };
        Update: {
          closed?: boolean;
          createdAt?: string;
          finished?: boolean;
          gameName?: string;
          id?: string;
          winner?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'lobbies_winner_fkey';
            columns: ['winner'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      lobby_turns: {
        Row: {
          id: number;
          lobbyId: string;
          turnId: string;
        };
        Insert: {
          id?: number;
          lobbyId: string;
          turnId: string;
        };
        Update: {
          id?: number;
          lobbyId?: string;
          turnId?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'lobby_turns_lobbyId_fkey';
            columns: ['lobbyId'];
            referencedRelation: 'lobbies';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'lobby_turns_turnId_fkey';
            columns: ['turnId'];
            referencedRelation: 'turns';
            referencedColumns: ['id'];
          },
        ];
      };
      lobby_users: {
        Row: {
          id: string;
          lobbyId: string;
          userId: string;
        };
        Insert: {
          id?: string;
          lobbyId: string;
          userId: string;
        };
        Update: {
          id?: string;
          lobbyId?: string;
          userId?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'lobby_users_lobbyId_fkey';
            columns: ['lobbyId'];
            referencedRelation: 'lobbies';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'lobby_users_userId_fkey';
            columns: ['userId'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      turn_hits: {
        Row: {
          hitId: number;
          id: number;
          turnId: string;
        };
        Insert: {
          hitId: number;
          id?: number;
          turnId: string;
        };
        Update: {
          hitId?: number;
          id?: number;
          turnId?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'turn_hits_hitId_fkey';
            columns: ['hitId'];
            referencedRelation: 'hits';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'turn_hits_turnId_fkey';
            columns: ['turnId'];
            referencedRelation: 'turns';
            referencedColumns: ['id'];
          },
        ];
      };
      turns: {
        Row: {
          id: string;
          round: number;
          userId: string;
        };
        Insert: {
          id?: string;
          round: number;
          userId: string;
        };
        Update: {
          id?: string;
          round?: number;
          userId?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'turns_userId_fkey';
            columns: ['userId'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      turnsKD: {
        Row: {
          created_at: string;
          hits: number[];
          id: string;
          lobbyId: string;
          round: number;
          userId: string;
        };
        Insert: {
          created_at?: string;
          hits?: number[];
          id?: string;
          lobbyId: string;
          round: number;
          userId: string;
        };
        Update: {
          created_at?: string;
          hits?: number[];
          id?: string;
          lobbyId?: string;
          round?: number;
          userId?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'turnsKD_lobbyId_fkey';
            columns: ['lobbyId'];
            referencedRelation: 'lobbies';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'turnsKD_userId_fkey';
            columns: ['userId'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      users: {
        Row: {
          avatar: string;
          id: string;
          username: string;
        };
        Insert: {
          avatar: string;
          id: string;
          username: string;
        };
        Update: {
          avatar?: string;
          id?: string;
          username?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'users_id_fkey';
            columns: ['id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
