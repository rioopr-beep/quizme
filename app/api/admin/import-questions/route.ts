import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { getSupabaseAdminClient } from '../../../../lib/supabase/admin';
import {
  detectInputFormat,
  parseSqlInsert,
  sqlRowsToObjects,
  validateRows,
  type ImportTarget,
  type RawQuestionInput,
} from '../../../../lib/adminImport/importValidation';

export const runtime = 'nodejs';

interface ImportRequestBody {
  target: ImportTarget;
  raw: string;
}

async function isRequesterAdmin(): Promise<boolean> {
  const supabase = createRouteHandlerClient({ cookies });
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return false;

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  return profile?.role === 'admin';
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const isAdmin = await isRequesterAdmin();
  if (!isAdmin) {
    return NextResponse.json({ error: 'Tidak diizinkan. Halaman ini khusus admin.' }, { status: 403 });
  }

  let body: ImportRequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Body request tidak valid.' }, { status: 400 });
  }

  const { target, raw } = body;

  if (target !== 'sector' && target !== 'school') {
    return NextResponse.json({ error: 'target harus "sector" atau "school".' }, { status: 400 });
  }

  if (!raw || typeof raw !== 'string' || raw.trim().length === 0) {
    return NextResponse.json({ error: 'Teks yang di-paste kosong.' }, { status: 400 });
  }

  // --- Parse (JSON atau SQL) ---
  let rawRows: RawQuestionInput[];
  const format = detectInputFormat(raw);

  try {
    if (format === 'json') {
      const parsed = JSON.parse(raw);
      rawRows = Array.isArray(parsed) ? parsed : [parsed];
    } else {
      const { columns, rows } = parseSqlInsert(raw);
      rawRows = sqlRowsToObjects(columns, rows);
    }
  } catch (error) {
    return NextResponse.json(
      { error: `Gagal parse input: ${error instanceof Error ? error.message : 'format tidak dikenali'}` },
      { status: 400 },
    );
  }

  if (rawRows.length === 0) {
    return NextResponse.json({ error: 'Tidak ada baris soal yang terbaca dari input.' }, { status: 400 });
  }

  // --- Validasi ---
  const { validRows, errors } = validateRows(target, rawRows);

  // --- Insert baris yang valid (best-effort, bukan all-or-nothing) ---
  const insertResults: { row: number; success: boolean; message?: string }[] = [];

  if (validRows.length > 0) {
    const supabaseAdmin = getSupabaseAdminClient();
    const tableName = target === 'sector' ? 'questions' : 'school_questions';

    const { error: insertError } = await supabaseAdmin
      .from(tableName)
      .insert(validRows.map((v) => v.data));

    if (insertError) {
      // Kalau batch insert gagal total (misal 1 row punya constraint error),
      // coba insert satu-satu supaya baris lain yang valid tetap masuk.
      for (const validRow of validRows) {
        const { error: singleError } = await supabaseAdmin.from(tableName).insert(validRow.data);
        insertResults.push({
          row: validRow.row,
          success: !singleError,
          message: singleError?.message,
        });
      }
    } else {
      validRows.forEach((v) => insertResults.push({ row: v.row, success: true }));
    }
  }

  const successCount = insertResults.filter((r) => r.success).length;
  const dbErrors = insertResults.filter((r) => !r.success);

  return NextResponse.json({
    totalRows: rawRows.length,
    successCount,
    validationErrorCount: errors.length,
    dbErrorCount: dbErrors.length,
    validationErrors: errors,
    dbErrors,
  });
}
