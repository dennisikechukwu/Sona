export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          avatar_url: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string | null;
          avatar_url?: string | null;
        };
      };
      meetings: {
        Row: {
          id: string;
          room_id: string;
          host_id: string;
          title: string | null;
          started_at: string;
          ended_at: string | null;
          participant_count: number;
        };
        Insert: {
          id?: string;
          room_id: string;
          host_id: string;
          title?: string | null;
          started_at?: string;
          ended_at?: string | null;
          participant_count?: number;
        };
        Update: {
          ended_at?: string | null;
          title?: string | null;
          participant_count?: number;
        };
      };
      transcripts: {
        Row: {
          id: string;
          meeting_id: string;
          lines: TranscriptLine[];
          created_at: string;
        };
        Insert: {
          id?: string;
          meeting_id: string;
          lines: TranscriptLine[];
          created_at?: string;
        };
        Update: {
          lines?: TranscriptLine[];
        };
      };
      summaries: {
        Row: {
          id: string;
          meeting_id: string;
          summary_text: string | null;
          key_topics: string[];
          created_at: string;
        };
        Insert: {
          id?: string;
          meeting_id: string;
          summary_text?: string | null;
          key_topics?: string[];
          created_at?: string;
        };
        Update: never;
      };
      action_items: {
        Row: {
          id: string;
          meeting_id: string;
          text: string;
          owner_name: string | null;
          due_date: string | null;
          done: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          meeting_id: string;
          text: string;
          owner_name?: string | null;
          due_date?: string | null;
          done?: boolean;
          created_at?: string;
        };
        Update: {
          done?: boolean;
        };
      };
    };
  };
}

export interface TranscriptLine {
  speaker: string;
  time: string;
  text: string;
  highlight?: boolean;
}

export interface ActionItem {
  text: string;
  owner: string;
  due: string;
  done: boolean;
}
