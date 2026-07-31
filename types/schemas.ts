// ============================================================================
// QuizMe — Data Validation Engine
// Skema Zod murni untuk memvalidasi struktur JSON soal sebelum disimpan ke
// Supabase. Digunakan oleh scripts/bulk-import.ts dan (opsional) endpoint
// admin di masa depan.
// ============================================================================

import { z } from 'zod';

export const sectorSchema = z.enum([
  'financial',
  'cryptography',
  'psychology',
  'physics',
  'science',
  'linguistics',
]);

export const difficultySchema = z.enum(['foundational', 'intermediate', 'advanced']);

export const optionKeySchema = z.enum(['A', 'B', 'C', 'D']);

export const localizedContentSchema = z.object({
  id: z.string().trim().min(1, 'Konten Bahasa Indonesia wajib diisi'),
  en: z.string().trim().min(1, 'English content is required'),
});

export const optionsMapSchema = z.object({
  A: z.string().trim().min(1, 'Opsi A wajib diisi'),
  B: z.string().trim().min(1, 'Opsi B wajib diisi'),
  C: z.string().trim().min(1, 'Opsi C wajib diisi'),
  D: z.string().trim().min(1, 'Opsi D wajib diisi'),
});

export const localizedOptionsSchema = z.object({
  id: optionsMapSchema,
  en: optionsMapSchema,
});

export const dossierStructureSchema = z.object({
  summary: localizedContentSchema,
  reasoning: localizedContentSchema,
  references: z.array(z.string().trim().min(1)).default([]),
});

const OPTION_KEYS = ['A', 'B', 'C', 'D'] as const;

export const questionDataSchema = z
  .object({
    id: z.string().uuid().optional(),
    sector: sectorSchema,
    difficulty: difficultySchema,
    prompt: localizedContentSchema,
    context: localizedContentSchema.nullable().default(null),
    options: localizedOptionsSchema,
    correctOption: optionKeySchema,
    dossier: dossierStructureSchema,
    createdAt: z.string().datetime().optional(),
  })
  .superRefine((data, ctx) => {
    for (const lang of ['id', 'en'] as const) {
      const values = OPTION_KEYS.map((key) => data.options[lang][key].trim().toLowerCase());
      const uniqueValues = new Set(values);

      if (uniqueValues.size !== values.length) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Opsi jawaban pada bahasa "${lang}" mengandung duplikasi teks yang identik`,
          path: ['options', lang],
        });
      }
    }

    const promptId = data.prompt.id.trim().toLowerCase();
    const promptEn = data.prompt.en.trim().toLowerCase();

    if (promptId.length > 0 && promptId === promptEn) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Prompt Bahasa Indonesia dan Bahasa Inggris tidak boleh identik',
        path: ['prompt'],
      });
    }
  });

export const questionBatchSchema = z
  .array(questionDataSchema)
  .min(1, 'Batch data tidak boleh kosong');

export type SectorTypeInput = z.infer<typeof sectorSchema>;
export type DifficultyLevelInput = z.infer<typeof difficultySchema>;
export type QuestionDataInput = z.infer<typeof questionDataSchema>;
export type QuestionBatchInput = z.infer<typeof questionBatchSchema>;
