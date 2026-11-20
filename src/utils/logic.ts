import type {
  GuessChallenge,
  LoveLanguageKey,
  QuizQuestion,
  UniverseData,
} from '../types/universe.ts';

export interface LoveLanguageScore {
  language: LoveLanguageKey;
  count: number;
  percentage: number;
  summary: string;
}

export const LOVE_LANGUAGE_SUMMARIES: Record<LoveLanguageKey, string> = {
  'Words of Affirmation':
    'Sincere notes, thoughtful compliments, and honest verbal warmth resonate deeply with you.',
  'Quality Time':
    'Undivided presence, unhurried conversations, and shared experiences mean more than anything else.',
  'Acts of Service':
    'Quiet, thoughtful effort and someone showing up to make life gentler speak louder than words.',
  'Receiving Gifts':
    'Meaningful little keepsakes chosen with genuine attention feel like tangible proof of being remembered.',
  'Physical Affection':
    'Warm closeness, holding hands, and gentle hugs ground you in comfort and connection.',
};

export function calculateLoveLanguage(
  selectedLanguages: LoveLanguageKey[]
): { primary: LoveLanguageScore; breakdown: LoveLanguageScore[] } {
  const allLanguages: LoveLanguageKey[] = [
    'Words of Affirmation',
    'Quality Time',
    'Acts of Service',
    'Receiving Gifts',
    'Physical Affection',
  ];

  const counts = new Map<LoveLanguageKey, number>();
  for (const lang of allLanguages) {
    counts.set(lang, 0);
  }
  for (const lang of selectedLanguages) {
    counts.set(lang, (counts.get(lang) ?? 0) + 1);
  }

  const total = Math.max(selectedLanguages.length, 1);
  const breakdown: LoveLanguageScore[] = allLanguages
    .map((language) => {
      const count = counts.get(language) ?? 0;
      return {
        language,
        count,
        percentage: Math.round((count / total) * 100),
        summary: LOVE_LANGUAGE_SUMMARIES[language],
      };
    })
    .sort((a, b) => b.count - a.count);

  return {
    primary: breakdown[0],
    breakdown,
  };
}

export interface CodeBreakerFeedback {
  exact: number;
  misplaced: number;
  solved: boolean;
}

export function evaluateCodeBreakerGuess(
  secret: string,
  guess: string
): CodeBreakerFeedback {
  if (secret.length !== guess.length) {
    throw new Error('Guess length must match secret code length.');
  }

  let exact = 0;
  const secretRemainder: string[] = [];
  const guessRemainder: string[] = [];

  for (let i = 0; i < secret.length; i++) {
    if (secret[i] === guess[i]) {
      exact++;
    } else {
      secretRemainder.push(secret[i]);
      guessRemainder.push(guess[i]);
    }
  }

  let misplaced = 0;
  for (const digit of guessRemainder) {
    const idx = secretRemainder.indexOf(digit);
    if (idx !== -1) {
      misplaced++;
      secretRemainder.splice(idx, 1);
    }
  }

  return {
    exact,
    misplaced,
    solved: exact === secret.length,
  };
}

export function generateSecretCode(
  length = 4,
  rng: () => number = Math.random
): string {
  const digits = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
  for (let i = digits.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [digits[i], digits[j]] = [digits[j], digits[i]];
  }
  return digits.slice(0, length).join('');
}

export function scrambleWord(
  word: string,
  rng: () => number = Math.random
): string {
  const clean = word.trim().toUpperCase();
  if (clean.length <= 1) return clean;
  const chars = clean.split('');
  const allSame = chars.every((c) => c === chars[0]);
  if (allSame) return clean;

  for (let attempt = 0; attempt < 12; attempt++) {
    const copy = [...chars];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    const candidate = copy.join('');
    if (candidate !== clean) {
      return candidate;
    }
  }
  return clean.slice(1) + clean[0];
}

/**
 * Given a wheel drawn clockwise starting at 0deg (12 o'clock) with `segmentCount`
 * equal slices, and rotated clockwise by `rotationDeg`, returns the index of the
 * segment currently resting under the fixed top (12 o'clock) pointer.
 */
export function calculateWheelLandingIndex(
  rotationDeg: number,
  segmentCount: number
): number {
  if (segmentCount <= 0) return 0;
  const sliceAngle = 360 / segmentCount;
  const normalized = ((rotationDeg % 360) + 360) % 360;
  const pointerAngleInWheel = (360 - normalized) % 360;
  return Math.floor(pointerAngleInWheel / sliceAngle) % segmentCount;
}

export function computeTargetRotationForSegment(
  currentRotationDeg: number,
  targetIndex: number,
  segmentCount: number,
  extraSpins = 5,
  jitterFraction = 0.5
): number {
  const sliceAngle = 360 / segmentCount;
  const clampedJitter = Math.min(0.8, Math.max(0.2, jitterFraction));
  const targetAngleInWheel = targetIndex * sliceAngle + sliceAngle * clampedJitter;
  const neededNormalized = (360 - targetAngleInWheel + 360) % 360;
  const currentMod = ((currentRotationDeg % 360) + 360) % 360;
  const delta = (neededNormalized - currentMod + 360) % 360;
  return currentRotationDeg + extraSpins * 360 + delta;
}

export interface QuizResultSummary {
  score: number;
  total: number;
  percentage: number;
  headline: string;
  message: string;
}

export function evaluateQuizScore(
  questions: QuizQuestion[],
  selectedIndices: number[]
): QuizResultSummary {
  const total = questions.length;
  let score = 0;
  for (let i = 0; i < total; i++) {
    if (selectedIndices[i] === questions[i].correctIndex) {
      score++;
    }
  }
  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;

  if (percentage === 100) {
    return {
      score,
      total,
      percentage,
      headline: 'Effortlessly in Sync',
      message: 'Every single answer landed on the mark. Clearly paying close attention.',
    };
  }
  if (percentage >= 70) {
    return {
      score,
      total,
      percentage,
      headline: 'Remarkably Close',
      message: 'You caught almost every nuance — and left just enough mystery for the next conversation.',
    };
  }
  if (percentage >= 40) {
    return {
      score,
      total,
      percentage,
      headline: 'Curiosity Sparked',
      message: 'A great excuse to grab coffee and trade a few more stories.',
    };
  }
  return {
    score,
    total,
    percentage,
    headline: 'So Much Left to Discover',
    message: 'The very best part of getting to know someone is still ahead.',
  };
}

export function evaluateGuessAttempt(
  challenge: GuessChallenge,
  rawGuess: string
): boolean {
  const normalized = rawGuess.trim().toLowerCase().replace(/[^a-z0-9\s]/g, '');
  if (!normalized) return false;
  const accepted = [challenge.answer, ...challenge.acceptedAliases].map((s) =>
    s.trim().toLowerCase().replace(/[^a-z0-9\s]/g, '')
  );
  return accepted.some(
    (target) => normalized === target || normalized.includes(target)
  );
}

export function validateUniverseBackup(input: unknown): input is UniverseData {
  if (!input || typeof input !== 'object') return false;
  const candidate = input as Partial<UniverseData>;
  return (
    Boolean(candidate.settings) &&
    typeof candidate.settings?.welcomeHeading === 'string' &&
    Array.isArray(candidate.questions) &&
    Array.isArray(candidate.truthOrDares) &&
    Array.isArray(candidate.quizQuestions) &&
    Array.isArray(candidate.compliments) &&
    Array.isArray(candidate.scratchCards) &&
    Array.isArray(candidate.envelopes) &&
    Array.isArray(candidate.memories) &&
    Array.isArray(candidate.insideJokes) &&
    Array.isArray(candidate.bucketList) &&
    Array.isArray(candidate.destinations) &&
    Array.isArray(candidate.datePlans)
  );
}
