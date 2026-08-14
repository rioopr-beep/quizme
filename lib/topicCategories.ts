// ============================================================================
// QuizFrend — Topic Category Data
// Data sub-topik untuk kategori nested (Science, Engineering, Sports).
// Sengaja dipisah dari file page.tsx supaya aman di-import dari halaman
// manapun tanpa memicu server-side exception di production build Next.js.
// ============================================================================

export interface TopicCategoryChild {
  readonly key: string;
  readonly icon: string;
  readonly label: { readonly id: string; readonly en: string };
}

export const TOPIC_CATEGORY_CHILDREN: Record<string, readonly TopicCategoryChild[]> = {
  science: [
    { key: 'chemistry', icon: 'ti-flask', label: { id: 'Kimia', en: 'Chemistry' } },
    { key: 'biology', icon: 'ti-dna-2', label: { id: 'Biologi', en: 'Biology' } },
    { key: 'computer_science', icon: 'ti-code', label: { id: 'Ilmu Komputer', en: 'Computer Science' } },
    { key: 'astronomy', icon: 'ti-telescope', label: { id: 'Astronomi', en: 'Astronomy' } },
    { key: 'earth_science', icon: 'ti-world', label: { id: 'Ilmu Bumi', en: 'Earth Science' } },
    { key: 'economics', icon: 'ti-chart-line', label: { id: 'Ekonomi', en: 'Economics' } },
  ],
  engineering: [
    { key: 'civil_engineering', icon: 'ti-building-bridge-2', label: { id: 'Teknik Sipil', en: 'Civil Engineering' } },
    { key: 'mechanical_engineering', icon: 'ti-settings', label: { id: 'Teknik Mesin', en: 'Mechanical Engineering' } },
    { key: 'electrical_engineering', icon: 'ti-bolt', label: { id: 'Teknik Elektro', en: 'Electrical Engineering' } },
    { key: 'software_engineering', icon: 'ti-code', label: { id: 'Teknik Perangkat Lunak', en: 'Software Engineering' } },
    { key: 'industrial_engineering', icon: 'ti-building-factory-2', label: { id: 'Teknik Industri', en: 'Industrial Engineering' } },
    { key: 'aerospace_engineering', icon: 'ti-rocket', label: { id: 'Teknik Kedirgantaraan', en: 'Aerospace Engineering' } },
    { key: 'automotive_engineering', icon: 'ti-car', label: { id: 'Teknik Otomotif', en: 'Automotive Engineering' } },
    { key: 'environmental_engineering', icon: 'ti-leaf', label: { id: 'Teknik Lingkungan', en: 'Environmental Engineering' } },
  ],
  sports: [
    { key: 'football', icon: 'ti-ball-football', label: { id: 'Sepak Bola', en: 'Football' } },
    { key: 'basketball', icon: 'ti-ball-basketball', label: { id: 'Basket', en: 'Basketball' } },
    { key: 'badminton', icon: 'ti-ball-badminton', label: { id: 'Bulu Tangkis', en: 'Badminton' } },
    { key: 'olympics_history', icon: 'ti-medal', label: { id: 'Olimpiade & Sejarah Olahraga', en: 'Olympics & Sports History' } },
    { key: 'tennis', icon: 'ti-ball-tennis', label: { id: 'Tenis', en: 'Tennis' } },
    { key: 'esports', icon: 'ti-device-gamepad-2', label: { id: 'E-Sports', en: 'Esports' } },
    { key: 'motorsport', icon: 'ti-steering-wheel', label: { id: 'Formula 1 / Balap', en: 'Motorsport' } },
    { key: 'general_sports', icon: 'ti-run', label: { id: 'Olahraga Umum', en: 'General Sports' } },
  ],
};

export const CATEGORY_LABEL: Record<string, { readonly id: string; readonly en: string }> = {
  science: { id: 'Science', en: 'Science' },
  engineering: { id: 'Engineering', en: 'Engineering' },
  sports: { id: 'Olahraga', en: 'Sports' },
};
