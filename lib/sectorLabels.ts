// ============================================================================
// sectorLabels — daftar 31 sector resmi (id/en) + helper label.
// Sumber daftar: aturan generator soal "Master Version" (sector resmi).
// ============================================================================

export interface SectorLabel {
  id: string;
  label: { id: string; en: string };
}

export const ALL_SECTORS: SectorLabel[] = [
  { id: 'financial', label: { id: 'Finansial', en: 'Financial' } },
  { id: 'cryptography', label: { id: 'Kriptografi', en: 'Cryptography' } },
  { id: 'linguistics', label: { id: 'Linguistik', en: 'Linguistics' } },
  { id: 'translation', label: { id: 'Terjemahan', en: 'Translation' } },
  { id: 'physics', label: { id: 'Fisika', en: 'Physics' } },
  { id: 'psychology', label: { id: 'Psikologi', en: 'Psychology' } },
  { id: 'kimia', label: { id: 'Kimia', en: 'Chemistry' } },
  { id: 'biologi', label: { id: 'Biologi', en: 'Biology' } },
  { id: 'computer_science', label: { id: 'Ilmu Komputer', en: 'Computer Science' } },
  { id: 'astronomy', label: { id: 'Astronomi', en: 'Astronomy' } },
  { id: 'earth_science', label: { id: 'Ilmu Bumi', en: 'Earth Science' } },
  { id: 'economic', label: { id: 'Ekonomi', en: 'Economics' } },
  { id: 'sipil', label: { id: 'Teknik Sipil', en: 'Civil Engineering' } },
  { id: 'mesin', label: { id: 'Teknik Mesin', en: 'Mechanical Engineering' } },
  { id: 'elektro', label: { id: 'Teknik Elektro', en: 'Electrical Engineering' } },
  { id: 'software', label: { id: 'Teknik Software', en: 'Software Engineering' } },
  { id: 'industri', label: { id: 'Teknik Industri', en: 'Industrial Engineering' } },
  { id: 'kedirgantaraan', label: { id: 'Teknik Kedirgantaraan', en: 'Aerospace Engineering' } },
  { id: 'otomotif', label: { id: 'Teknik Otomotif', en: 'Automotive Engineering' } },
  { id: 'lingkungan', label: { id: 'Teknik Lingkungan', en: 'Environmental Engineering' } },
  { id: 'curiosities', label: { id: 'Rasa Ingin Tahu', en: 'Curiosities' } },
  { id: 'mathematics', label: { id: 'Matematika', en: 'Mathematics' } },
  { id: 'book-trivia', label: { id: 'Trivia Buku', en: 'Book Trivia' } },
  { id: 'football', label: { id: 'Sepak Bola', en: 'Football' } },
  { id: 'basketball', label: { id: 'Basket', en: 'Basketball' } },
  { id: 'badminton', label: { id: 'Bulu Tangkis', en: 'Badminton' } },
  { id: 'olympics_history', label: { id: 'Sejarah Olimpiade', en: 'Olympics History' } },
  { id: 'tennis', label: { id: 'Tenis', en: 'Tennis' } },
  { id: 'esports', label: { id: 'Esports', en: 'Esports' } },
  { id: 'motorsport', label: { id: 'Motorsport', en: 'Motorsport' } },
  { id: 'general_sports', label: { id: 'Olahraga Umum', en: 'General Sports' } },
];

const SECTOR_MAP = new Map(ALL_SECTORS.map((sector) => [sector.id, sector]));

function fallbackLabel(sector: string): string {
  return sector.replace(/[_-]/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

export function labelForSector(sector: string, language: 'id' | 'en'): string {
  return SECTOR_MAP.get(sector)?.label[language] ?? fallbackLabel(sector);
}
