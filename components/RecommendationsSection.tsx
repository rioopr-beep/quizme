'use client';

// ============================================================================
// RecommendationsSection — "Rekomendasi Untukmu".
// WAJIB typography-only sesuai spec: tanpa gambar/icon besar/progress/
// jumlah quiz, cuma nama topic besar di card rounded + shadow tipis.
// Sumber rekomendasi: sector resmi yang BELUM pernah dikerjakan user.
// ============================================================================

import Link from 'next/link';
import { useMemo } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { ALL_SECTORS, labelForSector } from '../lib/sectorLabels';

interface RecommendationsSectionProps {
  /** sector id yang sudah pernah dikerjakan user, akan dikecualikan */
  excludeSectorIds: string[];
  maxItems?: number;
}

export default function RecommendationsSection({
  excludeSectorIds,
  maxItems = 4,
}: RecommendationsSectionProps): JSX.Element | null {
  const { language } = useLanguage();

  const recommended = useMemo(() => {
    const excluded = new Set(excludeSectorIds);
    return ALL_SECTORS.filter((sector) => !excluded.has(sector.id)).slice(0, maxItems);
  }, [excludeSectorIds, maxItems]);

  const title = language === 'id' ? 'Rekomendasi Untukmu' : 'Recommended For You';
  const seeAllLabel = language === 'id' ? 'Lihat Semua' : 'See All';

  // Semua sector resmi sudah pernah dicoba user — tidak ada yang direkomendasikan
  if (recommended.length === 0) return null;

  return (
    <section>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
        <Link
          href="/topics"
          className="text-xs font-medium text-accent transition hover:opacity-80"
        >
          {seeAllLabel} →
        </Link>
      </div>

      <div className="-mx-6 flex gap-3 overflow-x-auto px-6 pb-1 sm:-mx-10 sm:px-10">
        {recommended.map((sector) => (
          <Link
            key={sector.id}
            href={`/quiz/${sector.id}`}
            className="flex shrink-0 items-center justify-center rounded-floating bg-base-surface px-6 py-4 shadow-floating-sm transition active:scale-95 hover:opacity-90"
          >
            <span className="whitespace-nowrap text-sm font-semibold text-text-primary">
              {labelForSector(sector.id, language)}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
