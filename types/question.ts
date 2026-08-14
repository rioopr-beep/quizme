// ============================================================================
// QuizMe — Strict Domain Types
// Sumber kebenaran tunggal untuk seluruh struktur data soal, opsi, dossier,
// dan status mesin evaluasi (quiz engine).
// ============================================================================

export type SectorType =
  | 'financial'
  | 'cryptography'
  | 'psychology'
  | 'physics'
  | 'linguistics'
  | 'book-trivia'
  | 'curiosities'
  | 'mathematics'
  | 'chemistry'
  | 'biology'
  | 'computer_science'
  | 'astronomy'
  | 'earth_science'
  | 'economics'
  | 'engineering'
  | 'football'
  | 'basketball'
  | 'badminton'
  | 'olympics_history'
  | 'tennis'
  | 'esports'
  | 'motorsport'
  | 'general_sports';

export type DifficultyLevel = 'foundational' | 'intermediate' | 'advanced';

export type LanguageCode = 'id' | 'en';

export type OptionKey = 'A' | 'B' | 'C' | 'D';

export type OptionVisualState = 'default' | 'correct' | 'incorrect' | 'muted';

export type OptionsMap = Record<OptionKey, string>;

export interface LocalizedContent {
  readonly id: string;
  readonly en: string;
}

export interface LocalizedOptions {
  readonly id: OptionsMap;
  readonly en: OptionsMap;
}

export interface DossierStructure {
  readonly summary: LocalizedContent;
  readonly reasoning: LocalizedContent;
  readonly references: readonly string[];
}

export interface QuestionData {
  readonly id: string;
  readonly sector: SectorType;
  readonly difficulty: DifficultyLevel;
  readonly prompt: LocalizedContent;
  readonly context: LocalizedContent | null;
  readonly options: LocalizedOptions;
  readonly correctOption: OptionKey;
  readonly dossier: DossierStructure;
  readonly createdAt: string;
}

export interface QuizAnswerRecord {
  readonly questionId: string;
  readonly selectedOption: OptionKey;
  readonly isCorrect: boolean;
  readonly answeredAt: number;
}

export type QuizStatus = 'idle' | 'active' | 'completed';

export interface QuizState {
  readonly sector: SectorType;
  readonly questions: readonly QuestionData[];
  readonly currentIndex: number;
  readonly answers: readonly QuizAnswerRecord[];
  readonly streak: number;
  readonly bestStreak: number;
  readonly lockedOption: OptionKey | null;
  readonly isRevealed: boolean;
  readonly status: QuizStatus;
}

export interface SectorMeta {
  readonly key: SectorType;
  readonly label: LocalizedContent;
  readonly description: LocalizedContent;
  readonly accent:
    | 'emerald'
    | 'rose'
    | 'amber'
    | 'sky'
    | 'violet'
    | 'teal'
    | 'stone'
    | 'indigo';
}

// ----------------------------------------------------------------------------
// Bentuk baris database (snake_case) — merepresentasikan tabel `questions`.
// ----------------------------------------------------------------------------
export interface QuestionRow {
  readonly id: string;
  readonly sector: SectorType;
  readonly difficulty: DifficultyLevel;
  readonly prompt_id: string;
  readonly prompt_en: string;
  readonly context_id: string | null;
  readonly context_en: string | null;
  readonly options_id: OptionsMap;
  readonly options_en: OptionsMap;
  readonly correct_option: OptionKey;
  readonly dossier: {
    readonly summary: LocalizedContent;
    readonly reasoning: LocalizedContent;
    readonly references: readonly string[];
  };
  readonly created_at: string;
  readonly updated_at: string;
}

export type QuestionRowInsert = Omit<QuestionRow, 'id' | 'created_at' | 'updated_at'> & {
  readonly id?: string;
  readonly created_at?: string;
  readonly updated_at?: string;
};

export type QuestionRowUpdate = Partial<QuestionRow>;

export interface ProfileRow {
  readonly id: string;
  readonly name: string | null;
  readonly current_streak: number;
  readonly best_streak: number;
  readonly last_active_date: string | null;
  readonly created_at: string;
}

export type ProfileRowInsert = Partial<ProfileRow> & { readonly id: string };
export type ProfileRowUpdate = Partial<ProfileRow>;

export interface QuizAttemptRow {
  readonly id: string;
  readonly user_id: string;
  readonly sector: string;
  readonly difficulty: string;
  readonly question_count: number;
  readonly score: number;
  readonly answers: unknown;
  readonly language: string | null;
  readonly created_at: string;
}

export type QuizAttemptRowInsert = Omit<QuizAttemptRow, 'id' | 'created_at'> & {
  readonly id?: string;
  readonly created_at?: string;
};
export type QuizAttemptRowUpdate = Partial<QuizAttemptRow>;

export interface Database {
  readonly public: {
    readonly Tables: {
      readonly questions: {
        readonly Row: QuestionRow;
        readonly Insert: QuestionRowInsert;
        readonly Update: QuestionRowUpdate;
        readonly Relationships: [];
      };
      readonly profiles: {
        readonly Row: ProfileRow;
        readonly Insert: ProfileRowInsert;
        readonly Update: ProfileRowUpdate;
        readonly Relationships: [];
      };
      readonly quiz_attempts: {
        readonly Row: QuizAttemptRow;
        readonly Insert: QuizAttemptRowInsert;
        readonly Update: QuizAttemptRowUpdate;
        readonly Relationships: [];
      };
    };
    readonly Views: Record<string, never>;
    readonly Functions: {
      readonly get_leaderboard: {
        readonly Args: { readonly target_sector: string };
        readonly Returns: {
          readonly user_id: string;
          readonly name: string;
          readonly total_questions: number;
        }[];
      };
    };
    readonly Enums: Record<string, never>;
    readonly CompositeTypes: Record<string, never>;
  };
}

// ----------------------------------------------------------------------------
// Mapper murni: baris database -> model domain QuestionData.
// ----------------------------------------------------------------------------
export function mapQuestionRowToQuestionData(row: QuestionRow): QuestionData {
  return {
    id: row.id,
    sector: row.sector,
    difficulty: row.difficulty,
    prompt: { id: row.prompt_id, en: row.prompt_en },
    context:
      row.context_id !== null && row.context_en !== null
        ? { id: row.context_id, en: row.context_en }
        : null,
    options: { id: row.options_id, en: row.options_en },
    correctOption: row.correct_option,
    dossier: {
      summary: row.dossier.summary,
      reasoning: row.dossier.reasoning,
      references: row.dossier.references,
    },
    createdAt: row.created_at,
  };
      }
