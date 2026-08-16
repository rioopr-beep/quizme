import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '../../../../lib/supabase/admin';
import {
  detectInputFormat,
  parseSqlInsert,
  sqlRowsToObjects,
  sanitizeInvalidJsonEscapes,
  validateRows,
  type ImportTarget,
  type RawQuestionInput,
} from '../../../../lib/adminImport/importValidation';

export const runtime = 'nodejs';

interface ImportRequestBody {
  target: ImportTarget;
  raw: string;
}

async function checkAdminAccess(request: NextRequest): Promise<{ isAdmin: boolean; reason: string }> {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice('Bearer '.length) : null;

  if (!token) {
    return { isAdmin: false, reason: 'Tidak ada token di header request (client gagal kirim session).' };
  }

  const supabaseAdmin = getSupabaseAdminClient();

  const {
    data: { user },
    error: userError,
  } = await supabaseAdmin.auth.getUser(token);

  if (userError || !user) {
    return { isAdmin: false, reason: `Token tidak valid/expired: ${userError?.message ?? 'user tidak ditemukan'}` };
  }

  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profileError) {
    return { isAdmin: false, reason: `Gagal baca profile: ${profileError.message}` };
  }

  if (profile?.role !== 'admin') {
    return { isAdmin: false, reason: `Role user ini adalah "${profile?.role ?? 'null'}", bukan "admin". User ID: ${user.id}` };
  }

  return { isAdmin: true, reason: 'ok' };
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const { isAdmin, reason } = await checkAdminAccess(request);
  if (!isAdmin) {
    return NextResponse.json({ error: `Tidak diizinkan. Detail: ${reason}` }, { status: 403 });
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
      // Sanitasi backslash LaTeX (\approx, \frac, dst) yang di-escape
      // asal-asalan oleh AI generator sebelum JSON.parse, karena backslash
      // tunggal yang diikuti huruf non-escape (mis. \a, \f di luar konteks
      // \\, \n, dst) bikin parse gagal total ("Bad escaped character").
      const sanitized = sanitizeInvalidJsonEscapes(raw);
      const parsed = JSON.parse(sanitized);
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
