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
  | 'science'
  | 'linguistics';

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
  readonly accent: 'emerald' | 'rose';
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

export interface Database {
  readonly public: {
    readonly Tables: {
      readonly questions: {
        readonly Row: QuestionRow;
        readonly Insert: QuestionRowInsert;
        readonly Update: QuestionRowUpdate;
        readonly Relationships: [];
      };
    };
    readonly Views: Record<string, never>;
    readonly Functions: Record<string, never>;
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
