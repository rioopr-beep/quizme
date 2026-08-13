'use client';

import { useEffect, useState } from 'react';
import { getSupabaseBrowserClient } from '../lib/supabase/client';
import { useLanguage } from '../context/LanguageContext';

type Comment = {
  id: string;
  user_id: string;
  parent_comment_id: string | null;
  content: string;
  created_at: string;
  authorName: string;
};

type Props = {
  questionId: string;
};

export default function DiscussionThread({ questionId }: Props) {
  const { language } = useLanguage();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const t = {
    title: language === 'id' ? 'Diskusi' : 'Discussion',
    placeholder:
      language === 'id'
        ? 'Tulis komentar atau pertanyaan...'
        : 'Write a comment or question...',
    replyPlaceholder: language === 'id' ? 'Balas...' : 'Reply...',
    send: language === 'id' ? 'Kirim' : 'Send',
    reply: language === 'id' ? 'Balas' : 'Reply',
    cancel: language === 'id' ? 'Batal' : 'Cancel',
    loginPrompt:
      language === 'id'
        ? 'Login dulu buat ikut diskusi'
        : 'Log in to join the discussion',
    empty:
      language === 'id'
        ? 'Belum ada diskusi. Jadi yang pertama!'
        : 'No discussion yet. Be the first!',
  };

  useEffect(() => {
    const load = async () => {
      const supabase = getSupabaseBrowserClient();
      const { data: userData } = await supabase.auth.getUser();
      setIsLoggedIn(!!userData.user);

      const { data, error } = await supabase
        .from('discussion_comments')
        .select('id, user_id, parent_comment_id, content, created_at, profiles(name)')
        .eq('question_id', questionId)
        .order('created_at', { ascending: true });

      if (!error && data) {
        setComments(
          data.map((row: any) => ({
            id: row.id,
            user_id: row.user_id,
            parent_comment_id: row.parent_comment_id,
            content: row.content,
            created_at: row.created_at,
            authorName: row.profiles?.name ?? '—',
          }))
        );
      }
      setLoading(false);
    };

    load();
  }, [questionId]);

  const postComment = async (content: string, parentId: string | null) => {
    if (!content.trim() || submitting) return;
    setSubmitting(true);

    const supabase = getSupabaseBrowserClient();
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      setSubmitting(false);
      return;
    }

    const { data, error } = await supabase
      .from('discussion_comments')
      .insert({
        question_id: questionId,
        user_id: userData.user.id,
        parent_comment_id: parentId,
        content: content.trim(),
      })
      .select('id, user_id, parent_comment_id, content, created_at, profiles(name)')
      .single();

    if (!error && data) {
      setComments((prev) => [
        ...prev,
        {
          id: data.id,
          user_id: data.user_id,
          parent_comment_id: data.parent_comment_id,
          content: data.content,
          created_at: data.created_at,
          authorName: (data as any).profiles?.name ?? '—',
        },
      ]);
    }

    setSubmitting(false);
    setNewComment('');
    setReplyText('');
    setReplyTo(null);
  };

  const topLevel = comments.filter((c) => !c.parent_comment_id);
  const repliesOf = (id: string) =>
    comments.filter((c) => c.parent_comment_id === id);

  return (
    <div className="rounded-floating bg-base-surface shadow-floating-sm p-5">
      <h3 className="text-sm font-semibold text-text-primary mb-4">{t.title}</h3>

      {loading ? (
        <p className="text-xs text-text-muted">…</p>
      ) : topLevel.length === 0 ? (
        <p className="text-xs text-text-muted mb-4">{t.empty}</p>
      ) : (
        <div className="flex flex-col gap-4 mb-4">
          {topLevel.map((comment) => (
            <div key={comment.id}>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-text-primary">
                  {comment.authorName}
                </span>
                <p className="text-sm text-text-secondary mt-0.5">
                  {comment.content}
                </p>
                {isLoggedIn && (
                  <button
                    type="button"
                    onClick={() =>
                      setReplyTo(replyTo === comment.id ? null : comment.id)
                    }
                    className="self-start mt-1 text-[11px] font-medium text-accent"
                  >
                    {replyTo === comment.id ? t.cancel : t.reply}
                  </button>
                )}
              </div>

              {/* Replies — 1 level saja */}
              {repliesOf(comment.id).length > 0 && (
                <div className="ml-4 mt-2 flex flex-col gap-2 border-l-2 border-base-border pl-3">
                  {repliesOf(comment.id).map((reply) => (
                    <div key={reply.id}>
                      <span className="text-xs font-semibold text-text-primary">
                        {reply.authorName}
                      </span>
                      <p className="text-sm text-text-secondary mt-0.5">
                        {reply.content}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {replyTo === comment.id && (
                <div className="ml-4 mt-2 flex gap-2">
                  <input
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={t.replyPlaceholder}
                    className="flex-1 rounded-full bg-base-bg px-3 py-2 text-xs text-text-primary outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => postComment(replyText, comment.id)}
                    disabled={submitting}
                    className="rounded-full bg-accent px-3 py-2 text-xs font-medium text-base-surface active:scale-95"
                  >
                    {t.send}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {isLoggedIn ? (
        <div className="flex gap-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={t.placeholder}
            className="flex-1 rounded-full bg-base-bg px-3.5 py-2.5 text-sm text-text-primary outline-none"
          />
          <button
            type="button"
            onClick={() => postComment(newComment, null)}
            disabled={submitting}
            className="rounded-full bg-accent px-4 py-2.5 text-sm font-medium text-base-surface active:scale-95"
          >
            {t.send}
          </button>
        </div>
      ) : (
        <p className="text-xs text-text-muted text-center py-2">
          {t.loginPrompt}
        </p>
      )}
    </div>
  );
}
