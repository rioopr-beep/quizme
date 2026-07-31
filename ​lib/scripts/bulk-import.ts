// ============================================================================
// QuizMe — Batch Ingestion Script
// Skrip mandiri (dijalankan via `tsx scripts/bulk-import.ts <file.json>`)
// untuk memvalidasi data soal dengan Zod lalu memasukkannya secara batch
// ke Supabase menggunakan service role key (bypass RLS untuk penulisan).
// ============================================================================

import { readFileSync } from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';
import { questionBatchSchema, type QuestionDataInput } from '../lib/zod/schemas';
import type { Database, QuestionRowInsert } from '../types/question';

const BATCH_SIZE = 100;

interface ImportSummary {
  readonly totalRecords: number;
  readonly insertedRecords: number;
  readonly skippedRecords: number;
  readonly errors: readonly string[];
}

function resolveEnv(key: string): string {
  const value = process.env[key];

  if (!value) {
    throw new Error(`Environment variable ${key} tidak ditemukan. Set di .env sebelum menjalankan skrip.`);
  }

  return value;
}

function readJsonFile(filePath: string): unknown {
  const absolutePath = path.resolve(process.cwd(), filePath);
  const raw = readFileSync(absolutePath, 'utf-8');

  return JSON.parse(raw) as unknown;
}

function toDatabaseRow(question: QuestionDataInput): QuestionRowInsert {
  return {
    sector: question.sector,
    difficulty: question.difficulty,
    prompt_id: question.prompt.id,
    prompt_en: question.prompt.en,
    context_id: question.context?.id ?? null,
    context_en: question.context?.en ?? null,
    options_id: question.options.id,
    options_en: question.options.en,
    correct_option: question.correctOption,
    dossier: question.dossier,
  };
}

async function importQuestions(filePath: string): Promise<ImportSummary> {
  const supabaseUrl = resolveEnv('NEXT_PUBLIC_SUPABASE_URL');
  const supabaseServiceRoleKey = resolveEnv('SUPABASE_SERVICE_ROLE_KEY');

  const supabase = createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
    auth: { persistSession: false },
  });

  const rawData = readJsonFile(filePath);
  const parseResult = questionBatchSchema.safeParse(rawData);

  if (!parseResult.success) {
    const errors = parseResult.error.issues.map(
      (issue) => `[${issue.path.join('.')}] ${issue.message}`,
    );
    const rawLength = Array.isArray(rawData) ? rawData.length : 0;

    return {
      totalRecords: rawLength,
      insertedRecords: 0,
      skippedRecords: rawLength,
      errors,
    };
  }

  const validQuestions = parseResult.data;
  const rows = validQuestions.map(toDatabaseRow);

  let insertedRecords = 0;
  const errors: string[] = [];

  for (let offset = 0; offset < rows.length; offset += BATCH_SIZE) {
    const chunk = rows.slice(offset, offset + BATCH_SIZE);
    const { error, count } = await supabase.from('questions').insert(chunk, { count: 'exact' });

    if (error) {
      errors.push(`Batch ${offset}-${offset + chunk.length}: ${error.message}`);
      continue;
    }

    insertedRecords += count ?? chunk.length;
  }

  return {
    totalRecords: validQuestions.length,
    insertedRecords,
    skippedRecords: validQuestions.length - insertedRecords,
    errors,
  };
}

async function main(): Promise<void> {
  const filePath = process.argv[2];

  if (!filePath) {
    console.error('Penggunaan: tsx scripts/bulk-import.ts <path-ke-file-json>');
    process.exitCode = 1;
    return;
  }

  console.log(`Memulai impor batch dari: ${filePath}`);

  try {
    const summary = await importQuestions(filePath);

    console.log('--- Ringkasan Impor ---');
    console.log(`Total data tervalidasi : ${summary.totalRecords}`);
    console.log(`Berhasil dimasukkan    : ${summary.insertedRecords}`);
    console.log(`Gagal / dilewati       : ${summary.skippedRecords}`);

    if (summary.errors.length > 0) {
      console.log('--- Detail Kesalahan ---');
      summary.errors.forEach((error) => console.log(`- ${error}`));
      process.exitCode = 1;
      return;
    }

    console.log('Impor selesai tanpa kesalahan.');
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Kesalahan tidak diketahui';
    console.error(`Impor gagal: ${message}`);
    process.exitCode = 1;
  }
}

void main();
