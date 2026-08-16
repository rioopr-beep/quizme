// types/schoolPool.ts

export type SchoolLevel = 'sd' | 'smp' | 'sma_smk';
export type SmaTrack = 'ipa' | 'ips' | 'bahasa';

export type SdSubject =
  | 'sd_matematika' | 'sd_ipa' | 'sd_ips'
  | 'sd_bahasa_indonesia' | 'sd_bahasa_inggris' | 'sd_ppkn';

export type SmpSubject =
  | 'smp_matematika' | 'smp_biologi' | 'smp_fisika' | 'smp_kimia'
  | 'smp_ips' | 'smp_bahasa_indonesia' | 'smp_bahasa_inggris' | 'smp_ppkn';

export type SmaWajibSubject =
  | 'sma_matematika_wajib' | 'sma_bahasa_indonesia' | 'sma_bahasa_inggris'
  | 'sma_ppkn' | 'sma_sejarah_indonesia' | 'sma_pendidikan_agama';

export type SmaIpaSubject = 'sma_matematika_peminatan' | 'sma_fisika' | 'sma_kimia' | 'sma_biologi';
export type SmaIpsSubject = 'sma_ekonomi' | 'sma_sosiologi' | 'sma_geografi' | 'sma_sejarah_peminatan';
export type SmaBahasaSubject = 'sma_bahasa_asing' | 'sma_sastra' | 'sma_antropologi';

export type SchoolSubject =
  | SdSubject | SmpSubject | SmaWajibSubject
  | SmaIpaSubject | SmaIpsSubject | SmaBahasaSubject;

// Label tampilan (dwibahasa, konsisten sama pola LanguageContext yang sudah ada)
export const SD_SUBJECTS: { key: SdSubject; label_id: string; label_en: string }[] = [
  { key: 'sd_matematika', label_id: 'Matematika', label_en: 'Mathematics' },
  { key: 'sd_ipa', label_id: 'IPA', label_en: 'Science' },
  { key: 'sd_ips', label_id: 'IPS', label_en: 'Social Studies' },
  { key: 'sd_bahasa_indonesia', label_id: 'Bahasa Indonesia', label_en: 'Indonesian' },
  { key: 'sd_bahasa_inggris', label_id: 'Bahasa Inggris', label_en: 'English' },
  { key: 'sd_ppkn', label_id: 'PPKn', label_en: 'Civics' },
];

export const SMP_SUBJECTS: { key: SmpSubject; label_id: string; label_en: string }[] = [
  { key: 'smp_matematika', label_id: 'Matematika', label_en: 'Mathematics' },
  { key: 'smp_biologi', label_id: 'Biologi', label_en: 'Biology' },
  { key: 'smp_fisika', label_id: 'Fisika', label_en: 'Physics' },
  { key: 'smp_kimia', label_id: 'Kimia', label_en: 'Chemistry' },
  { key: 'smp_ips', label_id: 'IPS', label_en: 'Social Studies' },
  { key: 'smp_bahasa_indonesia', label_id: 'Bahasa Indonesia', label_en: 'Indonesian' },
  { key: 'smp_bahasa_inggris', label_id: 'Bahasa Inggris', label_en: 'English' },
  { key: 'smp_ppkn', label_id: 'PPKn', label_en: 'Civics' },
];

export const SMA_WAJIB_SUBJECTS: { key: SmaWajibSubject; label_id: string; label_en: string }[] = [
  { key: 'sma_matematika_wajib', label_id: 'Matematika Wajib', label_en: 'Core Mathematics' },
  { key: 'sma_bahasa_indonesia', label_id: 'Bahasa Indonesia', label_en: 'Indonesian' },
  { key: 'sma_bahasa_inggris', label_id: 'Bahasa Inggris', label_en: 'English' },
  { key: 'sma_ppkn', label_id: 'PPKn', label_en: 'Civics' },
  { key: 'sma_sejarah_indonesia', label_id: 'Sejarah Indonesia', label_en: 'Indonesian History' },
  { key: 'sma_pendidikan_agama', label_id: 'Pendidikan Agama', label_en: 'Religious Education' },
];

export const SMA_TRACK_SUBJECTS: Record<SmaTrack, { key: string; label_id: string; label_en: string }[]> = {
  ipa: [
    { key: 'sma_matematika_peminatan', label_id: 'Matematika Peminatan', label_en: 'Advanced Mathematics' },
    { key: 'sma_fisika', label_id: 'Fisika', label_en: 'Physics' },
    { key: 'sma_kimia', label_id: 'Kimia', label_en: 'Chemistry' },
    { key: 'sma_biologi', label_id: 'Biologi', label_en: 'Biology' },
  ],
  ips: [
    { key: 'sma_ekonomi', label_id: 'Ekonomi', label_en: 'Economics' },
    { key: 'sma_sosiologi', label_id: 'Sosiologi', label_en: 'Sociology' },
    { key: 'sma_geografi', label_id: 'Geografi', label_en: 'Geography' },
    { key: 'sma_sejarah_peminatan', label_id: 'Sejarah Peminatan', label_en: 'Advanced History' },
  ],
  bahasa: [
    { key: 'sma_bahasa_asing', label_id: 'Bahasa Asing', label_en: 'Foreign Language' },
    { key: 'sma_sastra', label_id: 'Sastra', label_en: 'Literature' },
    { key: 'sma_antropologi', label_id: 'Antropologi', label_en: 'Anthropology' },
  ],
};

export const SCHOOL_LEVELS: { key: SchoolLevel; label_id: string; label_en: string }[] = [
  { key: 'sd', label_id: 'SD', label_en: 'Elementary' },
  { key: 'smp', label_id: 'SMP', label_en: 'Junior High' },
  { key: 'sma_smk', label_id: 'SMA/SMK', label_en: 'Senior High/Vocational' },
];

export const SMA_TRACKS: { key: SmaTrack; label_id: string; label_en: string }[] = [
  { key: 'ipa', label_id: 'IPA', label_en: 'Science Track' },
  { key: 'ips', label_id: 'IPS', label_en: 'Social Track' },
  { key: 'bahasa', label_id: 'Bahasa', label_en: 'Language Track' },
];
