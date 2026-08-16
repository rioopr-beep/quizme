import { Parser } from 'node-sql-parser';

// ============================================================================
// Konstanta valid — HARUS disinkron manual kalau daftar sector/subject berubah
// ============================================================================

export const VALID_SECTORS = [
  'financial', 'cryptography', 'psychology', 'physics', 'linguistics',
  'book-trivia', 'curiosities', 'mathematics', 'chemistry', 'biology',
  'computer_science', 'astronomy', 'earth_science', 'economics',
  'civil_engineering', 'mechanical_engineering', 'electrical_engineering',
  'software_engineering', 'industrial_engineering', 'aerospace_engineering',
  'automotive_engineering', 'environmental_engineering',
  'football', 'basketball', 'badminton', 'olympics_history', 'tennis',
  'esports', 'motorsport', 'general_sports',
] as const;

export const VALID_DIFFICULTIES = ['foundational', 'intermediate', 'advanced'] as const;

export const VALID_SCHOOL_SUBJECTS = {
  sd: ['sd_matematika', 'sd_ipa', 'sd_ips', 'sd_bahasa_indonesia', 'sd_bahasa_inggris', 'sd_ppkn'],
  smp: ['smp_matematika', 'smp_biologi', 'smp_fisika', 'smp_kimia', 'smp_ips', 'smp_bahasa_indonesia', 'smp_bahasa_inggris', 'smp_ppkn'],
  sma_smk_wajib: ['sma_matematika_wajib', 'sma_bahasa_indonesia', 'sma_bahasa_inggris', 'sma_ppkn', 'sma_sejarah_indonesia', 'sma_pendidikan_agama'],
  sma_smk_ipa: ['sma_matematika_peminatan', 'sma_fisika', 'sma_kimia', 'sma_biologi'],
  sma_smk_ips: ['sma_ekonomi', 'sma_sosiologi', 'sma_geografi', 'sma_sejarah_peminatan'],
  sma_smk_bahasa: ['sma_bahasa_asing', 'sma_sastra', 'sma_antropologi'],
} as const;

const ALL_SCHOOL_SUBJECTS: readonly string[] = Object.values(VALID_SCHOOL_SUBJECTS).flat();

function subjectToLevelTrack(subject: string): { level: string; track: string | null } | null {
  if (VALID_SCHOOL_SUBJECTS.sd.includes(subject as never)) return { level: 'sd', track: null };
  if (VALID_SCHOOL_SUBJECTS.smp.includes(subject as never)) return { level: 'smp', track: null };
  if (VALID_SCHOOL_SUBJECTS.sma_smk_wajib.includes(subject as never)) return { level: 'sma_smk', track: null };
  if (VALID_SCHOOL_SUBJECTS.sma_smk_ipa.includes(subject as never)) return { level: 'sma_smk', track: 'ipa' };
  if (VALID_SCHOOL_SUBJECTS.sma_smk_ips.includes(subject as never)) return { level: 'sma_smk', track: 'ips' };
  if (VALID_SCHOOL_SUBJECTS.sma_smk_bahasa.includes(subject as never)) return { level: 'sma_smk', track: 'bahasa' };
  return null;
}

export type ImportTarget = 'sector' | 'school';

export interface RawQuestionInput {
  [key: string]: unknown;
}

export interface ValidationError {
  readonly row: number;
  readonly message: string;
}

export interface ValidatedRow {
  readonly row: number;
  readonly data: Record<string, unknown>;
}

export interface ValidationResult {
  readonly validRows: ValidatedRow[];
  readonly errors: ValidationError[];
}

// ============================================================================
// Sanitasi backslash LaTeX yang invalid di teks JSON mentah
// ============================================================================

// JSON cuma mengizinkan backslash diikuti oleh salah satu dari: " \ / b f n r t u
// Soal Matematika/Kimia sering mengandung LaTeX (\approx, \frac, \alpha, dst)
// yang kadang ditulis AI generator dengan single backslash (bukan \\approx),
// dan itu bikin JSON.parse gagal total ("Bad escaped character"). Fungsi ini
// men-dobel backslash yang TIDAK diikuti karakter escape valid, tanpa
// mengubah escape yang memang sudah benar (\\, \n, \t, dll).
export function sanitizeInvalidJsonEscapes(raw: string): string {
  return raw.replace(/\\(?!["\\/bfnrtu])/g, '\\\\');
}

// ============================================================================
// Deteksi format input: JSON array vs SQL INSERT
// ============================================================================

export function detectInputFormat(raw: string): 'json' | 'sql' {
  const trimmed = raw.trim();
  if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
    return 'json';
  }
  return 'sql';
}

// ============================================================================
// Parse SQL INSERT INTO ... VALUES (...), (...); jadi array object
// ============================================================================

function jsonbLiteralToValue(expr: unknown): unknown {
  // node-sql-parser merepresentasikan CAST('...'::jsonb) atau string biasa
  // sebagai node dengan .value (string) atau .type === 'cast'
  if (expr && typeof expr === 'object') {
    const node = expr as Record<string, unknown>;

    if (node.type === 'cast' && node.expr) {
      return jsonbLiteralToValue(node.expr);
    }

    if (typeof node.value === 'string') {
      // node-sql-parser tidak meng-unescape '' (doubled single-quote, standar
      // escaping SQL) balik jadi ' — teks Indonesia yang pakai tanda kutip
      // tunggal untuk penekanan istilah (mis. 'pencemaran') bakal ke-dobel
      // jadi ''pencemaran'' oleh normalizeDollarQuoting, dan bikin
      // JSON.parse gagal kalau tidak di-fix dulu.
      const unescaped = node.value.replace(/''/g, "'");
      try {
        return JSON.parse(unescaped);
      } catch {
        // fallback: coba versi asli (belum di-unescape), siapa tau memang
        // bukan kasus ini
        try {
          return JSON.parse(node.value);
        } catch {
          return node.value;
        }
      }
    }

    if (node.type === 'null') {
      return null;
    }

    if (typeof node.value !== 'undefined') {
      return node.value;
    }
  }
  return null;
}

// Ubah dollar-quoting Postgres ($$...$$) jadi single-quote biasa ('...'),
// karena node-sql-parser tidak mengerti sintaks $$ khas Postgres.
// Semua tanda kutip tunggal literal di dalamnya di-escape jadi '' (standar SQL).
function normalizeDollarQuoting(raw: string): string {
  return raw.replace(/\$\$([\s\S]*?)\$\$/g, (_match, inner: string) => {
    const escaped = inner.replace(/'/g, "''");
    return `'${escaped}'`;
  });
}

export function parseSqlInsert(rawInput: string): { columns: string[]; rows: unknown[][] } {
  const raw = normalizeDollarQuoting(rawInput);
  const parser = new Parser();
  let ast: unknown;

  try {
    ast = parser.astify(raw, { database: 'postgresql' });
  } catch (error) {
    throw new Error(
      `Gagal parse SQL: ${error instanceof Error ? error.message : 'format tidak dikenali'}. Cek lagi apa SQL-nya lengkap (ada titik koma di akhir, tanda kutip seimbang).`,
    );
  }

  const statement = Array.isArray(ast) ? ast[0] : ast;
  const stmt = statement as Record<string, unknown>;

  if (!stmt || stmt.type !== 'insert') {
    throw new Error('Teks yang di-paste bukan statement INSERT INTO yang valid.');
  }

  const columns = (stmt.columns as string[]) ?? [];
  const valuesClause = stmt.values as Array<{ value: unknown[] }>;

  const rows = valuesClause.map((v) => v.value.map((expr) => jsonbLiteralToValue(expr)));


  return { columns, rows };
}

export function sqlRowsToObjects(columns: string[], rows: unknown[][]): RawQuestionInput[] {
  return rows.map((row) => {
    const obj: RawQuestionInput = {};
    columns.forEach((col, index) => {
      obj[col] = row[index];
    });
    return obj;
  });
}

// ============================================================================
// Validasi tiap baris soal
// ============================================================================

function isValidOptionsObject(options: unknown): options is Record<'A' | 'B' | 'C' | 'D', string> {
  if (!options || typeof options !== 'object' || Array.isArray(options)) return false;
  const obj = options as Record<string, unknown>;
  return ['A', 'B', 'C', 'D'].every((key) => typeof obj[key] === 'string' && obj[key].length > 0);
}

function validateCommonFields(row: RawQuestionInput, rowIndex: number, errors: ValidationError[]): void {
  if (!row.prompt_id || typeof row.prompt_id !== 'string') {
    errors.push({ row: rowIndex, message: 'prompt_id kosong/bukan string' });
  }
  if (!row.prompt_en || typeof row.prompt_en !== 'string') {
    errors.push({ row: rowIndex, message: 'prompt_en kosong/bukan string' });
  }
  if (!isValidOptionsObject(row.options_id)) {
    errors.push({ row: rowIndex, message: 'options_id bukan object berlabel A/B/C/D yang valid (kemungkinan masih array atau ada key kosong)' });
  }
  if (!isValidOptionsObject(row.options_en)) {
    errors.push({ row: rowIndex, message: 'options_en bukan object berlabel A/B/C/D yang valid' });
  }
  if (typeof row.correct_option !== 'string' || !['A', 'B', 'C', 'D'].includes(row.correct_option)) {
    errors.push({ row: rowIndex, message: `correct_option harus huruf A/B/C/D, ditemukan: ${JSON.stringify(row.correct_option)}` });
  }
  if (!row.dossier || typeof row.dossier !== 'object') {
    const actualType = typeof row.dossier;
    const preview =
      actualType === 'string' ? (row.dossier as string).slice(0, 80) : JSON.stringify(row.dossier).slice(0, 80);
    errors.push({
      row: rowIndex,
      message: `dossier kosong/bukan object (tipe diterima: ${actualType}, cuplikan: ${preview}...)`,
    });
  }
}

export function validateSectorRows(rawRows: RawQuestionInput[]): ValidationResult {
  const errors: ValidationError[] = [];
  const validRows: ValidatedRow[] = [];

  rawRows.forEach((row, index) => {
    const rowIndex = index + 1;
    const rowErrors: ValidationError[] = [];

    if (typeof row.sector !== 'string' || !VALID_SECTORS.includes(row.sector as never)) {
      rowErrors.push({ row: rowIndex, message: `sector "${row.sector}" tidak ada di daftar VALID_SECTORS (${VALID_SECTORS.length} sector resmi)` });
    }
    if (typeof row.difficulty !== 'string' || !VALID_DIFFICULTIES.includes(row.difficulty as never)) {
      rowErrors.push({ row: rowIndex, message: `difficulty "${row.difficulty}" harus salah satu dari: foundational, intermediate, advanced` });
    }

    validateCommonFields(row, rowIndex, rowErrors);

    if (rowErrors.length > 0) {
      errors.push(...rowErrors);
    } else {
      validRows.push({
        row: rowIndex,
        data: {
          sector: row.sector,
          difficulty: row.difficulty,
          prompt_id: row.prompt_id,
          prompt_en: row.prompt_en,
          context_id: row.context_id ?? null,
          context_en: row.context_en ?? null,
          options_id: row.options_id,
          options_en: row.options_en,
          correct_option: row.correct_option,
          dossier: row.dossier,
        },
      });
    }
  });

  return { validRows, errors };
}

export function validateSchoolRows(rawRows: RawQuestionInput[]): ValidationResult {
  const errors: ValidationError[] = [];
  const validRows: ValidatedRow[] = [];

  rawRows.forEach((row, index) => {
    const rowIndex = index + 1;
    const rowErrors: ValidationError[] = [];

    const subject = typeof row.subject === 'string' ? row.subject : '';
    const mapping = subjectToLevelTrack(subject);

    if (!mapping) {
      rowErrors.push({
        row: rowIndex,
        message: `subject "${row.subject}" tidak ada di daftar resmi kolam sekolah (${ALL_SCHOOL_SUBJECTS.length} subject valid)`,
      });
    } else {
      if (row.level !== mapping.level) {
        rowErrors.push({ row: rowIndex, message: `level "${row.level}" tidak konsisten dengan subject "${subject}" (seharusnya "${mapping.level}")` });
      }
      const trackValue = row.track === undefined ? null : row.track;
      if (trackValue !== mapping.track) {
        rowErrors.push({ row: rowIndex, message: `track "${row.track}" tidak konsisten dengan subject "${subject}" (seharusnya "${mapping.track}")` });
      }
    }

    validateCommonFields(row, rowIndex, rowErrors);

    if (rowErrors.length > 0) {
      errors.push(...rowErrors);
    } else {
      validRows.push({
        row: rowIndex,
        data: {
          level: mapping!.level,
          track: mapping!.track,
          subject,
          prompt_id: row.prompt_id,
          prompt_en: row.prompt_en,
          context_id: row.context_id ?? null,
          context_en: row.context_en ?? null,
          options_id: row.options_id,
          options_en: row.options_en,
          correct_option: row.correct_option,
          dossier: row.dossier,
        },
      });
    }
  });

  return { validRows, errors };
}

export function validateRows(target: ImportTarget, rawRows: RawQuestionInput[]): ValidationResult {
  return target === 'sector' ? validateSectorRows(rawRows) : validateSchoolRows(rawRows);
  }
