'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getSupabaseBrowserClient } from '../../../../lib/supabase/client';
import { useLanguage } from '../../../../context/LanguageContext';
import { TOPIC_CATEGORY_CHILDREN, CATEGORY_LABEL } from '../../../../lib/topicCategories';

type TopicCountMap = Readonly<Record<string, number>>;

// Sector children (dari kategori engineering/science/sports) yang punya minimal 1 soal is_preview.
// Kalau nanti nambah preview ke child lain, tambahin key-nya di sini juga.
// (sama isinya dgn PREVIEW_SECTORS di app/topics/page.tsx — pertimbangkan pindah ke lib/topicCategories.ts biar gak dobel)
const PREVIEW_SECTORS = new Set([
  'astronomy', 'biology', 'chemistry', 'civil_engineering', 'computer_science',
  'cryptography', 'curiosities', 'economics', 'electrical_engineering',
  'environmental_engineering', 'financial', 'general_sports', 'linguistics',
  'mathematics', 'mechanical_engineering', 'motorsport', 'physics', 'psychology',
]);

export default function TopicCategoryPage(): JSX.Element {
  const params = useParams<{ category: string }>();
  const router = useRouter();
  const { language } = useLanguage();

  const [topicCounts, setTopicCounts] = useState<TopicCountMap>({});
  const [isLoadingCounts, setIsLoadingCounts] = useState<boolean>(true);

  const children = TOPIC_CATEGORY_CHILDREN[params.category] ?? [];
  const categoryLabel = CATEGORY_LABEL[params.category]?.[language] ?? params.category;
  const backAriaLabel = language === 'id' ? 'Kembali' : 'Back';
  const eyebrow = language === 'id' ? 'Topik' : 'Topics';
  const previewBadgeLabel = language === 'id' ? 'Coba Gratis' : 'Try Free';

  useEffect(() => {
    if (children.length === 0) {
      setIsLoadingCounts(false);
      return;
    }

    let isMounted = true;

    async function checkAuthAndLoad(): Promise<void> {
      const supabase = getSupabaseBrowserClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      const counts: Record<string, number> = {};
      await Promise.all(
        children.map(async (child) => {
          const { count } = await supabase
            .from('questions')
            .select('id', { count: 'exact', head: true })
            .eq('sector', child.key);
          counts[child.key] = count ?? 0;
        }),
      );

      if (isMounted) {
        setTopicCounts(counts);
        setIsLoadingCounts(false);
      }
    }

    void checkAuthAndLoad();
    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.category, router]);

  return (
    <main className="min-h-screen bg-base-bg px-6 py-10 sm:px-10">
      <div className="mx-auto max-w-5xl">
        <header className="mb-6 flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.push('/topics')}
            aria-label={backAriaLabel}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-base-surface text-text-secondary shadow-floating-sm transition active:scale-95 hover:text-text-primary"
          >
            <i className="ti ti-arrow-left text-base" />
          </button>
          <div className="flex flex-col">
            <span className="text-[11px] uppercase tracking-wide text-text-muted">
              {eyebrow}
            </span>
            <h1 className="text-lg font-semibold leading-tight text-text-primary">
              {categoryLabel}
            </h1>
          </div>
        </header>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {children.map((child) => {
            const hasPreview = PREVIEW_SECTORS.has(child.key);

            return (
              <div
                key={child.key}
                className="flex flex-col rounded-floating bg-base-surface shadow-floating-sm p-5 transition hover:shadow-floating"
              >
                <Link
                  href={`/quiz/${child.key}`}
                  className="flex flex-1 flex-col items-start gap-3 transition active:scale-95"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-soft text-accent">
                    <i className={`ti ${child.icon} text-lg`} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text-primary">
                      {child.label[language]}
                    </p>
                    <p className="mt-0.5 text-[11px] text-text-muted">
                      {isLoadingCounts ? '...' : topicCounts[child.key] ?? 0}
                    </p>
                  </div>
                </Link>

                {hasPreview ? (
                  <Link
                    href={`/quiz/${child.key}/preview`}
                    className="mt-3 inline-block w-fit rounded-full bg-accent-soft px-2.5 py-1 text-[10px] font-medium text-accent transition active:scale-95 hover:bg-accent hover:text-base-surface"
                  >
                    {previewBadgeLabel}
                  </Link>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
            }
