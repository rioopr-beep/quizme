import type { Metadata } from 'next';
import PreviewQuizClient from './PreviewQuizClient';

const VALID_SECTORS = [
  'financial', 'cryptography', 'psychology', 'physics', 'linguistics',
  'translation', 'book-trivia', 'curiosities', 'mathematics', 'chemistry',
  'biology', 'computer_science', 'astronomy', 'earth_science', 'economics',
  'civil_engineering', 'mechanical_engineering', 'electrical_engineering',
  'software_engineering', 'industrial_engineering', 'aerospace_engineering',
  'automotive_engineering', 'environmental_engineering', 'football',
  'basketball', 'badminton', 'olympics_history', 'tennis', 'esports',
  'motorsport', 'general_sports',
] as const;

interface Props {
  params: { sector: string };
}

function sectorToLabel(sector: string): string {
  return sector
    .replace(/[_-]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function generateMetadata({ params }: Props): Metadata {
  const sectorParam = params.sector?.toLowerCase() ?? '';
  const isValid = (VALID_SECTORS as readonly string[]).includes(sectorParam);
  const label = sectorToLabel(sectorParam);
  const url = `https://www.quizfrend.my.id/quiz/${sectorParam}/preview`;

  if (!isValid) {
    return {
      title: 'Quiz Preview',
      robots: { index: false, follow: false },
    };
  }

  return {
    title: `${label} Quiz Preview`,
    description: `Try free sample case-study questions on ${label} and see how QuizFrend's cross-disciplinary analysis practice works.`,
    alternates: { canonical: url },
    openGraph: {
      title: `${label} Quiz Preview`,
      description: `Try free sample case-study questions on ${label}.`,
      url,
      type: 'website',
      siteName: 'QuizFrend',
      locale: 'en_US',
      images: [
        {
          url: 'https://www.quizfrend.my.id/opengraph-image',
          width: 1200,
          height: 630,
        },
      ],
    },
  };
}

export default function PreviewQuizPage() {
  return <PreviewQuizClient />;
}
