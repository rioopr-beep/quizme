'use client';

// ============================================================================
// QuizMe — Global Language Context
// Mengelola sakelar bahasa (ID/EN) secara global. Nilai context dibungkus
// dengan useMemo agar consumer tidak re-render kecuali `language` berubah.
// ============================================================================

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react';
import type { LanguageCode } from '@/types/question';

interface LanguageContextValue {
  readonly language: LanguageCode;
  readonly toggleLanguage: () => void;
  readonly setLanguage: Dispatch<SetStateAction<LanguageCode>>;
}

const LANGUAGE_STORAGE_KEY = 'quizme:language';
const DEFAULT_LANGUAGE: LanguageCode = 'id';

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

function readInitialLanguage(): LanguageCode {
  if (typeof window === 'undefined') {
    return DEFAULT_LANGUAGE;
  }

  const stored = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);

  return stored === 'en' || stored === 'id' ? stored : DEFAULT_LANGUAGE;
}

interface LanguageProviderProps {
  readonly children: ReactNode;
}

export function LanguageProvider({ children }: LanguageProviderProps): JSX.Element {
  const [language, setLanguage] = useState<LanguageCode>(readInitialLanguage);

  const toggleLanguage = useCallback((): void => {
    setLanguage((previous) => {
      const next: LanguageCode = previous === 'id' ? 'en' : 'id';

      if (typeof window !== 'undefined') {
        window.localStorage.setItem(LANGUAGE_STORAGE_KEY, next);
      }

      return next;
    });
  }, []);

  const value = useMemo<LanguageContextValue>(
    () => ({ language, toggleLanguage, setLanguage }),
    [language, toggleLanguage],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);

  if (context === undefined) {
    throw new Error('useLanguage harus digunakan di dalam LanguageProvider');
  }

  return context;
}
