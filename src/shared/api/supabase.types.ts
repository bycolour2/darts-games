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
      KDLobbySettings: {
        Row: {
          additionalLifeRule: string;
          hasAdditionalLife: boolean;
          id: string;
          lifeCount: number;
          lobbyId: string;
        };
        Insert: {
          additionalLifeRule?: string;
          hasAdditionalLife?: boolean;
          id?: string;
          lifeCount?: number;
          lobbyId: string;
        };
        Update: {
          additionalLifeRule?: string;
          hasAdditionalLife?: boolean;
          id?: string;
          lifeCount?: number;
          lobbyId?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'KDLobbySettings_lobbyId_fkey';
            columns: ['lobbyId'];
            referencedRelation: 'lobbies';
            referencedColumns: ['id'];
          },
        ];
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
          gameId: string;
          id: string;
          stageId: string;
          winner: string | null;
        };
        Insert: {
          closed?: boolean;
          createdAt?: string;
          finished?: boolean;
          gameId: string;
          id?: string;
          stageId: string;
          winner?: string | null;
        };
        Update: {
          closed?: boolean;
          createdAt?: string;
          finished?: boolean;
          gameId?: string;
          id?: string;
          stageId?: string;
          winner?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'lobbies_gameId_fkey';
            columns: ['gameId'];
            referencedRelation: 'games';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'lobbies_stageId_fkey';
            columns: ['stageId'];
            referencedRelation: 'stages';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'lobbies_winner_fkey';
            columns: ['winner'];
            referencedRelation: 'users';
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
      stages: {
        Row: {
          description: string | null;
          gameId: string;
          id: string;
          order: number;
          title: string;
        };
        Insert: {
          description?: string | null;
          gameId: string;
          id?: string;
          order: number;
          title: string;
        };
        Update: {
          description?: string | null;
          gameId?: string;
          id?: string;
          order?: number;
          title?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'stages_gameId_fkey';
            columns: ['gameId'];
            referencedRelation: 'games';
            referencedColumns: ['id'];
          },
        ];
      };
      turnsKD: {
        Row: {
          created_at: string;
          firstHit: number | null;
          id: string;
          lobbyId: string;
          round: number;
          secondHit: number | null;
          thirdHit: number | null;
          userId: string;
        };
        Insert: {
          created_at?: string;
          firstHit?: number | null;
          id?: string;
          lobbyId: string;
          round: number;
          secondHit?: number | null;
          thirdHit?: number | null;
          userId: string;
        };
        Update: {
          created_at?: string;
          firstHit?: number | null;
          id?: string;
          lobbyId?: string;
          round?: number;
          secondHit?: number | null;
          thirdHit?: number | null;
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
