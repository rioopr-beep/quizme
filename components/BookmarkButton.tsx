'use client';

import { useEffect, useState } from 'react';
import { Bookmark } from 'lucide-react';
import { getSupabaseBrowserClient } from '../lib/supabase/client';
import { useLanguage } from '../context/LanguageContext';

interface BookmarkButtonProps {
  questionId: string;
}

export default function BookmarkButton({ questionId }: BookmarkButtonProps): JSX.Element | null {
  const { language } = useLanguage();
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);
  const [isReady, setIsReady] = useState<boolean>(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function checkBookmark(): Promise<void> {
      const supabase = getSupabaseBrowserClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        if (isMounted) setIsReady(true);
        return;
      }

      const { data } = await supabase
        .from('bookmarks')
        .select('id')
        .eq('user_id', user.id)
        .eq('question_id', questionId)
        .maybeSingle();

      if (isMounted) {
        setUserId(user.id);
        setIsBookmarked(Boolean(data));
        setIsReady(true);
      }
    }

    void checkBookmark();
    return () => {
      isMounted = false;
    };
  }, [questionId]);

  async function toggleBookmark(): Promise<void> {
    if (!userId) return;
    const supabase = getSupabaseBrowserClient();

    if (isBookmarked) {
      await supabase
        .from('bookmarks')
        .delete()
        .eq('user_id', userId)
        .eq('question_id', questionId);
      setIsBookmarked(false);
    } else {
      await supabase.from('bookmarks').insert({
        user_id: userId,
        question_id: questionId,
      });
      setIsBookmarked(true);
    }
  }

  if (!isReady || !userId) return null;

  const label = language === 'id' ? 'Simpan soal' : 'Save question';

  return (
    <button
      type="button"
      onClick={() => void toggleBookmark()}
      aria-label={label}
      title={label}
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-base-border bg-base-surface shadow-floating-sm transition active:scale-90 hover:bg-base-bg"
    >
      <Bookmark
        className={`h-4 w-4 transition ${
          isBookmarked ? 'fill-accent text-accent' : 'text-text-muted'
        }`}
      />
    </button>
  );
}
