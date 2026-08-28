export interface TopicActivity {
  id: string;
  name: string;
  quizCount: number;
  /** 0..1 — dipakai untuk urutan tampil & fallback central core kalau tidak ada quiz aktif */
  activity: number;
  lastAccessedAt?: string | null;
  /** 0..1, opsional — kalau ada dipakai buat variasi ukuran planet */
  progress?: number;
  /** override warna planet (hex). Kalau kosong, ambil dari palet default berdasar index */
  color?: string;
}

export interface ActiveQuiz {
  topicId: string;
  topicName: string;
  correctCount: number;
  totalCount: number;
  href: string;
}

export interface QuizUniverseProps {
  activeQuiz: ActiveQuiz | null;
  topics: TopicActivity[];
  onSelectTopic?: (topic: TopicActivity) => void;
  /** label subteks di bawah universe, default "Geser untuk melihat topik lain" */
  swipeHintLabel?: string;
  /** label CTA saat belum ada aktivitas sama sekali */
  emptyStateLabel?: string;
  emptyStateHref?: string;
  className?: string;
}
