import { useEffect, useState, type FormEvent } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Check,
  CheckCircle2,
  ChevronLeft,
  Eye,
  HeartHandshake,
  HelpCircle,
  PenLine,
  Save,
  Sparkles,
} from 'lucide-react';
import { api } from '../../lib/api';
import {
  calculateLoveLanguage,
  evaluateGuessAttempt,
  evaluateQuizScore,
} from '../../utils/logic';
import type {
  ActiveSessionState,
  AnswerRecord,
  GuessChallenge,
  LoveLanguageKey,
  LoveLanguageQuestion,
  QuizAttemptRecord,
  QuizQuestion,
  SentencePrompt,
} from '../../types/universe';

// D. How Well Do You Know Me? (full persistence + change answers anytime)
export function KnowMeQuiz({
  questions,
  existingAttempt,
  sessionId,
  allowSubmissions,
  onSessionUpdate,
}: {
  questions: QuizQuestion[];
  existingAttempt?: QuizAttemptRecord;
  sessionId: string;
  allowSubmissions: boolean;
  onSessionUpdate: (state: ActiveSessionState) => void;
}) {
  const [step, setStep] = useState(0);
  const [selectedMap, setSelectedMap] = useState<Record<string, number>>({});
  const [viewingResult, setViewingResult] = useState(false);
  const [saving, setSaving] = useState(false);

  // Sync from server session state (handles page refresh & "Start My Universe Again")
  useEffect(() => {
    if (existingAttempt && existingAttempt.responses.length > 0) {
      const next: Record<string, number> = {};
      for (const r of existingAttempt.responses) {
        next[r.questionId] = r.selectedIndex;
      }
      setSelectedMap(next);
      setViewingResult(existingAttempt.status === 'completed');
      setStep(0);
    } else {
      setSelectedMap({});
      setViewingResult(false);
      setStep(0);
    }
  }, [sessionId, existingAttempt?.id]);

  if (questions.length === 0) {
    return (
      <div className="rounded-3xl border border-[#702B4C]/12 bg-white p-8 text-center text-sm text-[#6A525E]">
        No quiz questions configured yet.
      </div>
    );
  }

  const current = questions[step];
  const pickedNow =
    current && selectedMap[current.id] !== undefined
      ? selectedMap[current.id]
      : null;

  const selectedArray = questions.map((q) => selectedMap[q.id] ?? -1);
  const allAnswered = questions.every((q) => selectedMap[q.id] !== undefined);
  const result = allAnswered
    ? evaluateQuizScore(questions, selectedArray)
    : null;

  function chooseOption(optIdx: number) {
    setSelectedMap((prev) => ({ ...prev, [current.id]: optIdx }));
  }

  async function saveAttempt(status: 'in_progress' | 'completed') {
    if (!allowSubmissions) return;
    setSaving(true);
    try {
      const responses = questions
        .filter((q) => selectedMap[q.id] !== undefined)
        .map((q) => {
          const sIdx = selectedMap[q.id];
          return {
            questionId: q.id,
            questionText: q.question,
            options: q.options,
            selectedIndex: sIdx,
            selectedOption: q.options[sIdx] ?? '',
            isCorrect: sIdx === q.correctIndex,
          };
        });
      const evalRes =
        status === 'completed'
          ? evaluateQuizScore(
              questions,
              questions.map((q) => selectedMap[q.id] ?? -1)
            )
          : null;
      const res = await api.saveQuizAttempt({
        quizType: 'know_me',
        status,
        responses,
        score: evalRes?.score,
        total: questions.length,
        percentage: evalRes?.percentage,
        resultSummary: evalRes
          ? `${evalRes.score}/${evalRes.total} (${evalRes.percentage}%) — ${evalRes.headline}`
          : undefined,
      });
      onSessionUpdate(res.activeSession);
    } catch {
      // Non-blocking save
    } finally {
      setSaving(false);
    }
  }

  async function handleNextOrFinish() {
    if (pickedNow === null) return;
    if (step + 1 >= questions.length) {
      await saveAttempt('completed');
      setViewingResult(true);
    } else {
      setStep((prev) => prev + 1);
    }
  }

  if (viewingResult && result) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-[#702B4C]/15 bg-white p-7 text-center sm:p-9"
      >
        <p className="text-xs font-semibold text-[#9274B8]">Quiz Complete</p>
        <p className="mt-3 font-mono text-5xl font-semibold text-[#702B4C] tabular-nums">
          {result.score}/{result.total}
        </p>
        <h3 className="mt-2 font-serif text-3xl font-semibold text-[#702B4C]">
          {result.headline}
        </h3>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-[#6A525E]">
          {result.message}
        </p>
        <button
          type="button"
          onClick={() => {
            setStep(0);
            setViewingResult(false);
          }}
          className="mt-6 inline-flex min-h-[46px] items-center gap-2 rounded-xl bg-[#702B4C] px-6 py-2.5 text-sm font-semibold text-[#FFF9F5] hover:bg-[#531D38]"
        >
          <PenLine className="h-4 w-4" />
          <span>Review or Change My Answers</span>
        </button>
      </motion.div>
    );
  }

  return (
    <div className="rounded-3xl border border-[#702B4C]/12 bg-white p-6 sm:p-8">
      <div className="flex items-center justify-between text-xs text-[#6A525E]">
        <span className="font-semibold text-[#9274B8]">
          How Well Do You Know Me?
        </span>
        <span className="tabular-nums">
          Question {step + 1} of {questions.length}
        </span>
      </div>

      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[#FAF1EA]">
        <div
          className="h-full rounded-full bg-[#702B4C] transition-all duration-300"
          style={{ width: `${((step + 1) / questions.length) * 100}%` }}
        />
      </div>

      <h3 className="mt-5 font-serif text-2xl leading-snug font-semibold text-[#702B4C] sm:text-3xl">
        {current.question}
      </h3>

      <div className="mt-5 space-y-2.5">
        {current.options.map((opt, idx) => {
          const isPicked = pickedNow === idx;
          const isCorrect = idx === current.correctIndex;
          let tone =
            'border-[#702B4C]/15 bg-[#FFF9F5] text-[#2E1A24] hover:border-[#702B4C]/40';
          if (pickedNow !== null) {
            if (isPicked && isCorrect) {
              tone = 'border-emerald-700 bg-emerald-50 text-emerald-950';
            } else if (isPicked && !isCorrect) {
              tone = 'border-[#702B4C] bg-[#FFDCE8]/75 text-[#702B4C]';
            } else if (isCorrect) {
              tone = 'border-emerald-700/45 bg-emerald-50/50 text-emerald-950';
            }
          }

          return (
            <button
              key={idx}
              type="button"
              onClick={() => chooseOption(idx)}
              className={`flex min-h-[50px] w-full items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left text-sm font-medium transition-colors ${tone}`}
            >
              <span>{opt}</span>
              {pickedNow !== null && isPicked && (
                <CheckCircle2 className="h-4 w-4 shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      <AnimatePresence>
        {pickedNow !== null && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-5 rounded-2xl bg-[#FDF6E6] p-4"
          >
            <p className="text-sm text-[#2E1A24]">
              <span className="font-semibold text-[#702B4C]">
                {pickedNow === current.correctIndex
                  ? 'Spot on! '
                  : 'Good guess! '}
              </span>
              {current.note}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[#702B4C]/10 pt-4">
        <button
          type="button"
          disabled={step === 0}
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-[#702B4C]/15 bg-[#FFF9F5] px-4 py-2 text-xs font-semibold text-[#702B4C] disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Back</span>
        </button>

        <button
          type="button"
          disabled={pickedNow === null || saving}
          onClick={() => void handleNextOrFinish()}
          className="min-h-[44px] shrink-0 rounded-xl bg-[#702B4C] px-5 py-2.5 text-sm font-semibold text-[#FFF9F5] hover:bg-[#531D38] disabled:opacity-50"
        >
          {saving
            ? 'Saving...'
            : step + 1 >= questions.length
              ? existingAttempt
                ? 'Save Updated Answers'
                : 'Save & See My Score'
              : 'Next Question'}
        </button>
      </div>
    </div>
  );
}

// F. Finish the Sentence (load saved answer + edit & update in place)
export function FinishTheSentence({
  prompts,
  savedAnswers,
  sessionId,
  allowSubmissions,
  onSessionUpdate,
}: {
  prompts: SentencePrompt[];
  savedAnswers: AnswerRecord[];
  sessionId: string;
  allowSubmissions: boolean;
  onSessionUpdate: (state: ActiveSessionState) => void;
}) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [answerText, setAnswerText] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const activePrompt =
    prompts.length > 0 ? prompts[selectedIdx % prompts.length] : null;
  const savedSentenceRecords = savedAnswers.filter(
    (a) => a.category === 'sentence'
  );
  const currentSaved = activePrompt
    ? savedSentenceRecords.find((a) => a.itemKey === activePrompt.id)
    : undefined;

  useEffect(() => {
    setAnswerText(currentSaved?.currentAnswer ?? '');
  }, [activePrompt?.id, currentSaved?.currentAnswer, sessionId]);

  useEffect(() => {
    setError(null);
    setFeedback(null);
  }, [activePrompt?.id, sessionId]);

  if (!activePrompt) return null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!activePrompt) return;
    if (!answerText.trim()) {
      setError('Write how you would finish this sentence first.');
      return;
    }
    setSaving(true);
    setError(null);
    setFeedback(null);
    try {
      const res = await api.saveAnswer({
        category: 'sentence',
        itemKey: activePrompt.id,
        promptText: activePrompt.starter,
        answer: answerText.trim(),
      });
      onSessionUpdate(res.activeSession);
      setFeedback(
        res.changed ? 'Your sentence has been updated.' : 'Your sentence has been saved.'
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save answer.');
    } finally {
      setSaving(false);
    }
  }

  const isUnchanged =
    Boolean(currentSaved) && answerText.trim() === currentSaved?.currentAnswer;

  return (
    <div className="space-y-5">
      <div className="rounded-3xl border border-[#702B4C]/12 bg-white p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-xs font-semibold text-[#9274B8]">
            Finish the Sentence
          </p>
          <div className="flex items-center gap-1.5">
            {prompts.map((p, i) => {
              const hasAnswer = savedSentenceRecords.some(
                (r) => r.itemKey === p.id
              );
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setSelectedIdx(i);
                    setError(null);
                    setFeedback(null);
                  }}
                  aria-label={`Select sentence prompt ${i + 1}${hasAnswer ? ' (answered)' : ''}`}
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold transition-colors ${
                    i === selectedIdx
                      ? 'bg-[#702B4C] text-[#FFF9F5]'
                      : hasAnswer
                        ? 'bg-[#FFDCE8] text-[#702B4C]'
                        : 'bg-[#FAF1EA] text-[#6A525E] hover:bg-[#FFDCE8]/60'
                  }`}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
        </div>

        <h3 className="mt-4 font-serif text-2xl leading-snug font-semibold text-[#702B4C] sm:text-3xl">
          &ldquo;{activePrompt.starter}&rdquo;
        </h3>

        <form onSubmit={handleSubmit} className="mt-5 space-y-3" noValidate>
          <div className="flex items-center justify-between">
            <label
              htmlFor="sentence-answer"
              className="text-xs font-semibold text-[#2E1A24]"
            >
              {currentSaved
                ? 'Your saved ending (you can edit and update it anytime)'
                : 'Your ending'}
            </label>
            {currentSaved && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-800">
                <Check className="h-3.5 w-3.5" />
                <span>Saved</span>
              </span>
            )}
          </div>

          <textarea
            id="sentence-answer"
            rows={3}
            value={answerText}
            onChange={(e) => {
              setAnswerText(e.target.value);
              if (error) setError(null);
              if (feedback) setFeedback(null);
            }}
            placeholder="Type your honest or playful ending here..."
            className="w-full rounded-2xl border border-[#702B4C]/20 bg-[#FFF9F5] p-4 text-base text-[#2E1A24] placeholder:text-[#6A525E]/60 focus:border-[#702B4C] focus:ring-2 focus:ring-[#702B4C]/20 focus:outline-none"
          />

          {error && (
            <p role="alert" className="text-xs font-medium text-[#702B4C]">
              {error}
            </p>
          )}
          {feedback && (
            <p role="status" className="text-xs font-medium text-emerald-800">
              {feedback}
            </p>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs text-[#6A525E]">
              {allowSubmissions
                ? 'Saved privately — revisit any prompt to revise your answer.'
                : 'Response saving is currently paused.'}
            </span>
            <button
              type="submit"
              disabled={saving || !allowSubmissions || isUnchanged}
              className="inline-flex min-h-[46px] items-center gap-2 rounded-xl bg-[#702B4C] px-5 py-2.5 text-sm font-semibold text-[#FFF9F5] hover:bg-[#531D38] disabled:opacity-55"
            >
              <Save className="h-4 w-4" />
              <span>
                {saving
                  ? 'Saving...'
                  : currentSaved
                    ? 'Save Changes'
                    : 'Save My Answer'}
              </span>
            </button>
          </div>
        </form>
      </div>

      {savedSentenceRecords.length > 0 && (
        <div className="space-y-2.5">
          <p className="text-xs font-semibold text-[#6A525E]">
            Your Saved Sentences (tap any to edit)
          </p>
          {savedSentenceRecords.map((entry) => {
            const promptIndex = prompts.findIndex((p) => p.id === entry.itemKey);
            return (
              <button
                key={entry.id}
                type="button"
                onClick={() => {
                  if (promptIndex >= 0) setSelectedIdx(promptIndex);
                }}
                className="w-full rounded-2xl border border-[#702B4C]/12 bg-[#FFF0F5]/80 p-4 text-left transition-colors hover:border-[#702B4C]/35"
              >
                <p className="text-xs text-[#6A525E]">{entry.promptText}</p>
                <p className="mt-1 font-serif text-lg text-[#702B4C]">
                  &ldquo;{entry.currentAnswer}&rdquo;
                </p>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// H. Guess What I'm Thinking (persists attempts & outcomes)
export function GuessWhatImThinking({
  challenges,
  savedAnswers,
  sessionId,
  onSessionUpdate,
}: {
  challenges: GuessChallenge[];
  savedAnswers: AnswerRecord[];
  sessionId: string;
  onSessionUpdate: (state: ActiveSessionState) => void;
}) {
  const [idx, setIdx] = useState(0);
  const [hintsShown, setHintsShown] = useState(1);
  const [attemptsLeft, setAttemptsLeft] = useState(4);
  const [guess, setGuess] = useState('');
  const [status, setStatus] = useState<'playing' | 'won' | 'revealed'>('playing');
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    setIdx(0);
    setHintsShown(1);
    setAttemptsLeft(4);
    setGuess('');
    setStatus('playing');
    setFeedback(null);
  }, [sessionId]);

  if (challenges.length === 0) return null;
  const current = challenges[idx % challenges.length];
  const savedRecord = savedAnswers.find(
    (a) => a.category === 'guess_thinking' && a.itemKey === current.id
  );

  function recordOutcome(answerText: string) {
    void api
      .saveAnswer({
        category: 'guess_thinking',
        itemKey: current.id,
        promptText: `Guess What I'm Thinking (${current.category}): ${current.answer}`,
        answer: answerText,
      })
      .then((res) => onSessionUpdate(res.activeSession))
      .catch(() => {
        // Non-blocking
      });
  }

  function handleGuess(e: FormEvent) {
    e.preventDefault();
    if (!guess.trim() || status !== 'playing') return;

    if (evaluateGuessAttempt(current, guess)) {
      setStatus('won');
      setFeedback(null);
      recordOutcome(`Guessed "${guess.trim()}" correctly`);
      return;
    }

    const nextAttempts = attemptsLeft - 1;
    setAttemptsLeft(nextAttempts);
    const tried = guess.trim();
    setGuess('');
    if (nextAttempts <= 0) {
      setStatus('revealed');
      setFeedback(null);
      recordOutcome(`Revealed after trying "${tried}"`);
    } else {
      setFeedback('Not quite that — try another guess or unlock the next hint.');
      if (hintsShown < current.hints.length) {
        setHintsShown((h) => h + 1);
      }
    }
  }

  function nextChallenge() {
    setIdx((prev) => (prev + 1) % challenges.length);
    setHintsShown(1);
    setAttemptsLeft(4);
    setGuess('');
    setStatus('playing');
    setFeedback(null);
  }

  return (
    <div className="rounded-3xl border border-[#702B4C]/12 bg-white p-6 sm:p-8">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-[#6A525E]">
        <span className="font-semibold text-[#9274B8]">
          Guess What I&apos;m Thinking · {current.category}
        </span>
        <span className="tabular-nums">
          Attempts left: {attemptsLeft}
          {savedRecord ? ' · Played' : ''}
        </span>
      </div>

      <h3 className="mt-2 font-serif text-2xl font-semibold text-[#702B4C] sm:text-3xl">
        Can you read my mind from the clues?
      </h3>

      <ol className="mt-5 space-y-2.5">
        {current.hints.slice(0, hintsShown).map((hint, i) => (
          <motion.li
            key={i}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-[#F6F2FF] px-4 py-3 text-sm text-[#2E1A24]"
          >
            <span className="mr-2 font-mono text-xs font-semibold text-[#9274B8]">
              Clue {i + 1}
            </span>
            {hint}
          </motion.li>
        ))}
      </ol>

      {status === 'playing' ? (
        <form onSubmit={handleGuess} className="mt-5 space-y-3" noValidate>
          <div className="flex flex-col gap-2.5 sm:flex-row">
            <label htmlFor="mind-guess-input" className="sr-only">
              Type your guess
            </label>
            <input
              id="mind-guess-input"
              type="text"
              value={guess}
              onChange={(e) => setGuess(e.target.value)}
              placeholder="Type your guess..."
              className="min-h-[48px] flex-1 rounded-xl border border-[#702B4C]/20 bg-[#FFF9F5] px-4 text-base text-[#2E1A24] placeholder:text-[#6A525E]/60 focus:border-[#702B4C] focus:ring-2 focus:ring-[#702B4C]/20 focus:outline-none"
            />
            <button
              type="submit"
              className="min-h-[48px] shrink-0 rounded-xl bg-[#702B4C] px-6 text-sm font-semibold text-[#FFF9F5] hover:bg-[#531D38]"
            >
              Guess
            </button>
          </div>

          {feedback && (
            <p className="text-xs font-medium text-[#702B4C]">{feedback}</p>
          )}

          <div className="flex flex-wrap items-center gap-3 pt-1">
            {hintsShown < current.hints.length && (
              <button
                type="button"
                onClick={() => setHintsShown((h) => h + 1)}
                className="inline-flex min-h-[40px] items-center gap-1.5 text-xs font-semibold text-[#9274B8] hover:text-[#702B4C]"
              >
                <HelpCircle className="h-4 w-4" />
                <span>Show Another Clue</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                setStatus('revealed');
                recordOutcome('Revealed answer');
              }}
              className="inline-flex min-h-[40px] items-center gap-1.5 text-xs font-semibold text-[#6A525E] hover:text-[#702B4C]"
            >
              <Eye className="h-4 w-4" />
              <span>Reveal Answer</span>
            </button>
          </div>
        </form>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-5 rounded-2xl bg-[#FDF6E6] p-5"
        >
          <p className="text-xs font-semibold text-[#702B4C]">
            {status === 'won' ? 'You guessed it!' : 'The thought was:'}
          </p>
          <p className="mt-1 font-serif text-2xl font-semibold capitalize text-[#702B4C]">
            {current.answer}
          </p>
          <p className="mt-1.5 text-sm text-[#2E1A24]">{current.revealNote}</p>
          <button
            type="button"
            onClick={nextChallenge}
            className="mt-4 inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-[#702B4C] px-5 py-2.5 text-sm font-semibold text-[#FFF9F5] hover:bg-[#531D38]"
          >
            <Sparkles className="h-4 w-4" />
            <span>Try Another Thought</span>
          </button>
        </motion.div>
      )}
    </div>
  );
}

// I. Love Language Quiz (persists full responses + allows changing answers anytime)
export function LoveLanguageQuiz({
  questions,
  existingAttempt,
  sessionId,
  allowSubmissions,
  onSessionUpdate,
}: {
  questions: LoveLanguageQuestion[];
  existingAttempt?: QuizAttemptRecord;
  sessionId: string;
  allowSubmissions: boolean;
  onSessionUpdate: (state: ActiveSessionState) => void;
}) {
  const [step, setStep] = useState(0);
  const [selectedMap, setSelectedMap] = useState<Record<string, number>>({});
  const [viewingResult, setViewingResult] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (existingAttempt && existingAttempt.responses.length > 0) {
      const next: Record<string, number> = {};
      for (const r of existingAttempt.responses) {
        next[r.questionId] = r.selectedIndex;
      }
      setSelectedMap(next);
      setViewingResult(existingAttempt.status === 'completed');
      setStep(0);
    } else {
      setSelectedMap({});
      setViewingResult(false);
      setStep(0);
    }
  }, [sessionId, existingAttempt?.id]);

  if (questions.length === 0) return null;

  const allAnswered = questions.every((q) => selectedMap[q.id] !== undefined);
  const selectedLanguages: LoveLanguageKey[] = questions
    .map((q) => q.options[selectedMap[q.id]]?.language)
    .filter((l): l is LoveLanguageKey => Boolean(l));

  const result =
    allAnswered && selectedLanguages.length === questions.length
      ? calculateLoveLanguage(selectedLanguages)
      : null;

  async function persistLoveLanguage(nextMap: Record<string, number>) {
    if (!allowSubmissions) return;
    setSaving(true);
    try {
      const langs = questions
        .map((q) => q.options[nextMap[q.id]]?.language)
        .filter((l): l is LoveLanguageKey => Boolean(l));
      const computed = calculateLoveLanguage(langs);
      const responses = questions.map((q) => {
        const sIdx = nextMap[q.id] ?? 0;
        const opt = q.options[sIdx];
        return {
          questionId: q.id,
          questionText: q.prompt,
          options: q.options.map((o) => `${o.label} (${o.language})`),
          selectedIndex: sIdx,
          selectedOption: opt ? `${opt.label} (${opt.language})` : '',
        };
      });
      const res = await api.saveQuizAttempt({
        quizType: 'love_language',
        status: 'completed',
        responses,
        total: questions.length,
        percentage: computed.primary.percentage,
        resultSummary: `${computed.primary.language} (${computed.primary.percentage}%)`,
      });
      onSessionUpdate(res.activeSession);
    } catch {
      // Non-blocking save
    } finally {
      setSaving(false);
    }
  }

  const current = questions[step];
  const pickedIdx =
    current && selectedMap[current.id] !== undefined
      ? selectedMap[current.id]
      : null;

  async function handleNextOrFinish() {
    if (pickedIdx === null) return;
    if (step + 1 >= questions.length) {
      await persistLoveLanguage(selectedMap);
      setViewingResult(true);
    } else {
      setStep((s) => s + 1);
    }
  }

  if (viewingResult && result) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-[#702B4C]/15 bg-white p-6 sm:p-8"
      >
        <div className="flex items-center gap-2 text-xs font-semibold text-[#9274B8]">
          <HeartHandshake className="h-4 w-4 text-[#702B4C]" />
          <span>Your Primary Love Language</span>
        </div>

        <h3 className="mt-2 font-serif text-3xl font-semibold text-[#702B4C]">
          {result.primary.language}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-[#6A525E]">
          {result.primary.summary}
        </p>

        <div className="mt-6 space-y-3 border-t border-[#702B4C]/10 pt-5">
          {result.breakdown.map((item) => (
            <div key={item.language} className="space-y-1">
              <div className="flex items-center justify-between text-xs font-medium text-[#2E1A24]">
                <span>{item.language}</span>
                <span className="font-mono text-[#702B4C] tabular-nums">
                  {item.percentage}%
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-[#FAF1EA]">
                <div
                  className="h-full rounded-full bg-[#702B4C]"
                  style={{ width: `${Math.max(item.percentage, 4)}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={() => {
            setStep(0);
            setViewingResult(false);
          }}
          className="mt-6 inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-[#702B4C]/20 bg-[#FFF9F5] px-5 py-2.5 text-sm font-semibold text-[#702B4C] hover:bg-[#FFDCE8]/40"
        >
          <PenLine className="h-4 w-4" />
          <span>Change My Answers</span>
        </button>
      </motion.div>
    );
  }

  return (
    <div className="rounded-3xl border border-[#702B4C]/12 bg-white p-6 sm:p-8">
      <div className="flex items-center justify-between text-xs text-[#6A525E]">
        <span className="font-semibold text-[#9274B8]">Love Language Quiz</span>
        <span className="tabular-nums">
          {step + 1} of {questions.length}
        </span>
      </div>

      <h3 className="mt-3 font-serif text-2xl leading-snug font-semibold text-[#702B4C] sm:text-3xl">
        {current.prompt}
      </h3>

      <div className="mt-5 space-y-2.5">
        {current.options.map((option, optIdx) => {
          const isSelected = pickedIdx === optIdx;
          return (
            <button
              key={option.language}
              type="button"
              onClick={() =>
                setSelectedMap((prev) => ({ ...prev, [current.id]: optIdx }))
              }
              className={`flex min-h-[52px] w-full items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-left text-sm font-medium transition-colors active:scale-[0.99] ${
                isSelected
                  ? 'border-[#702B4C] bg-[#FFF0F5] text-[#702B4C]'
                  : 'border-[#702B4C]/15 bg-[#FFF9F5] text-[#2E1A24] hover:border-[#702B4C] hover:bg-[#FFF0F5]'
              }`}
            >
              <span>{option.label}</span>
              {isSelected && <Check className="h-4 w-4 shrink-0 text-[#702B4C]" />}
            </button>
          );
        })}
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[#702B4C]/10 pt-4">
        <button
          type="button"
          disabled={step === 0}
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-[#702B4C]/15 bg-[#FFF9F5] px-4 py-2 text-xs font-semibold text-[#702B4C] disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Back</span>
        </button>

        <button
          type="button"
          disabled={pickedIdx === null || saving}
          onClick={() => void handleNextOrFinish()}
          className="min-h-[44px] rounded-xl bg-[#702B4C] px-5 py-2.5 text-sm font-semibold text-[#FFF9F5] hover:bg-[#531D38] disabled:opacity-50"
        >
          {saving
            ? 'Saving...'
            : step + 1 >= questions.length
              ? existingAttempt
                ? 'Save Updated Answers'
                : 'Save & See Result'
              : 'Next'}
        </button>
      </div>
    </div>
  );
}
