import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Flag,
  Flame,
  Heart,
  Save,
  Shuffle,
  Sparkles,
} from 'lucide-react';
import { api } from '../../lib/api';
import type {
  ActiveSessionState,
  AnswerRecord,
  DareIntensity,
  DareMode,
  FlagScenario,
  HeartSurprise,
  QuestionItem,
  QuestionMood,
  TruthOrDareItem,
  WouldYouRatherItem,
} from '../../types/universe';

function findSavedAnswer(
  answers: AnswerRecord[],
  category: AnswerRecord['category'],
  itemKey: string
): AnswerRecord | undefined {
  return answers.find((a) => a.category === category && a.itemKey === itemKey);
}

// A. Question of the Moment (with saveable & changeable answers)
export function QuestionOfTheMoment({
  questions,
  savedAnswers,
  sessionId,
  allowSubmissions,
  onSessionUpdate,
}: {
  questions: QuestionItem[];
  savedAnswers: AnswerRecord[];
  sessionId: string;
  allowSubmissions: boolean;
  onSessionUpdate: (state: ActiveSessionState) => void;
}) {
  const [moodFilter, setMoodFilter] = useState<'All' | QuestionMood>('All');
  const [index, setIndex] = useState(0);
  const [draft, setDraft] = useState('');
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (moodFilter === 'All') return questions;
    return questions.filter((q) => q.mood === moodFilter);
  }, [questions, moodFilter]);

  const active = filtered.length > 0 ? filtered[index % filtered.length] : null;
  const savedRecord = active
    ? findSavedAnswer(savedAnswers, 'question', active.id)
    : undefined;

  useEffect(() => {
    setDraft(savedRecord?.currentAnswer ?? '');
  }, [active?.id, savedRecord?.currentAnswer, sessionId]);

  useEffect(() => {
    setFeedback(null);
    setError(null);
  }, [active?.id, sessionId]);

  const answeredCount = useMemo(
    () => savedAnswers.filter((a) => a.category === 'question').length,
    [savedAnswers]
  );

  function goPrev() {
    if (filtered.length <= 1) return;
    setIndex((prev) => (prev - 1 + filtered.length) % filtered.length);
  }

  function goNext() {
    if (filtered.length <= 1) return;
    setIndex((prev) => (prev + 1) % filtered.length);
  }

  function revealAnother() {
    if (filtered.length <= 1) return;
    let next = Math.floor(Math.random() * filtered.length);
    if (next === index % filtered.length) {
      next = (next + 1) % filtered.length;
    }
    setIndex(next);
  }

  async function handleSave() {
    if (!active) return;
    const trimmed = draft.trim();
    if (!trimmed) {
      setError('Write your thoughts before saving.');
      return;
    }
    setSaving(true);
    setError(null);
    setFeedback(null);
    try {
      const res = await api.saveAnswer({
        category: 'question',
        itemKey: active.id,
        promptText: active.prompt,
        answer: trimmed,
      });
      onSessionUpdate(res.activeSession);
      setFeedback(
        res.changed
          ? 'Your answer has been updated.'
          : 'Your answer has been saved.'
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save answer.');
    } finally {
      setSaving(false);
    }
  }

  const isUnchanged =
    Boolean(savedRecord) && draft.trim() === savedRecord?.currentAnswer;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-1.5 rounded-2xl bg-[#FAF1EA] p-1.5">
        {(['All', 'Thoughtful', 'Playful', 'Deep', 'Bold'] as const).map(
          (mood) => (
            <button
              key={mood}
              type="button"
              onClick={() => {
                setMoodFilter(mood);
                setIndex(0);
              }}
              className={`min-h-[40px] flex-1 rounded-xl px-3 py-2 text-xs font-semibold whitespace-nowrap transition-colors ${
                moodFilter === mood
                  ? 'bg-white text-[#702B4C] shadow-xs'
                  : 'text-[#6A525E] hover:text-[#702B4C]'
              }`}
            >
              {mood}
            </button>
          )
        )}
      </div>

      <AnimatePresence mode="wait">
        {active ? (
          <motion.div
            key={`${sessionId}-${active.id}`}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22 }}
            className="rounded-3xl border border-[#702B4C]/12 bg-white p-6 shadow-xs sm:p-8"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <span className="font-medium text-[#9274B8]">
                Question of the Moment · {active.mood}
              </span>
              <span className="text-[#6A525E] tabular-nums">
                {(index % filtered.length) + 1} of {filtered.length} · {answeredCount} answered
              </span>
            </div>

            <p className="mt-4 font-serif text-2xl leading-snug font-semibold text-[#702B4C] sm:text-3xl">
              &ldquo;{active.prompt}&rdquo;
            </p>

            {/* Answer input with saved & changeable support */}
            <div className="mt-6 space-y-3 border-t border-[#702B4C]/10 pt-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <label
                  htmlFor="question-moment-answer"
                  className="text-xs font-semibold text-[#2E1A24]"
                >
                  {savedRecord ? 'Your Saved Answer (edit anytime)' : 'Your Answer'}
                </label>
                {savedRecord && (
                  <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-800">
                    <Check className="h-3.5 w-3.5" />
                    <span>Saved</span>
                  </span>
                )}
              </div>

              <textarea
                id="question-moment-answer"
                rows={3}
                value={draft}
                onChange={(e) => {
                  setDraft(e.target.value);
                  if (error) setError(null);
                  if (feedback) setFeedback(null);
                }}
                placeholder="Write what comes to your heart — you can always return and change it later..."
                className="w-full rounded-2xl border border-[#702B4C]/20 bg-[#FFF9F5] p-4 text-sm text-[#2E1A24] placeholder:text-[#6A525E]/60 focus:border-[#702B4C] focus:ring-2 focus:ring-[#702B4C]/20 focus:outline-none"
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

              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={goPrev}
                    aria-label="Previous question"
                    className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#702B4C]/15 bg-[#FFF9F5] text-[#702B4C] hover:bg-[#FFDCE8]/40"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={goNext}
                    aria-label="Next question"
                    className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#702B4C]/15 bg-[#FFF9F5] text-[#702B4C] hover:bg-[#FFDCE8]/40"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={revealAnother}
                    className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-[#702B4C]/20 bg-white px-4 py-2 text-xs font-semibold text-[#702B4C] hover:bg-[#FAF1EA]"
                  >
                    <Shuffle className="h-3.5 w-3.5" />
                    <span>Shuffle</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => void handleSave()}
                  disabled={saving || !allowSubmissions || isUnchanged}
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-[#702B4C] px-5 py-2.5 text-sm font-semibold text-[#FFF9F5] transition-transform hover:bg-[#531D38] active:scale-[0.98] disabled:opacity-55"
                >
                  <Save className="h-4 w-4" />
                  <span>
                    {saving
                      ? 'Saving...'
                      : savedRecord
                        ? 'Save Changes'
                        : 'Save Answer'}
                  </span>
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="rounded-3xl border border-[#702B4C]/12 bg-white p-8 text-center text-sm text-[#6A525E]">
            No questions in this mood yet. Try another mood filter.
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// B. Would You Rather? (saveable & changeable choice)
export function WouldYouRatherCard({
  items,
  savedAnswers,
  sessionId,
  onSessionUpdate,
}: {
  items: WouldYouRatherItem[];
  savedAnswers: AnswerRecord[];
  sessionId: string;
  onSessionUpdate: (state: ActiveSessionState) => void;
}) {
  const [idx, setIdx] = useState(0);
  const current = items.length > 0 ? items[idx % items.length] : null;
  const savedRecord = current
    ? findSavedAnswer(savedAnswers, 'would_you_rather', current.id)
    : undefined;

  const savedChoice: 'A' | 'B' | null =
    current && savedRecord
      ? savedRecord.currentAnswer === current.optionA
        ? 'A'
        : savedRecord.currentAnswer === current.optionB
          ? 'B'
          : null
      : null;

  const [choice, setChoice] = useState<'A' | 'B' | null>(savedChoice);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  useEffect(() => {
    setChoice(savedChoice);
  }, [current?.id, savedChoice, sessionId]);

  useEffect(() => {
    setStatusMsg(null);
  }, [current?.id, sessionId]);

  if (!current) {
    return (
      <div className="rounded-3xl border border-[#702B4C]/12 bg-white p-8 text-center text-sm text-[#6A525E]">
        No dilemmas added yet.
      </div>
    );
  }

  async function handleSaveChoice() {
    if (!current || !choice) return;
    setSaving(true);
    setStatusMsg(null);
    try {
      const answerText = choice === 'A' ? current.optionA : current.optionB;
      const res = await api.saveAnswer({
        category: 'would_you_rather',
        itemKey: current.id,
        promptText: `${current.optionA} vs. ${current.optionB}`,
        optionsPresented: [current.optionA, current.optionB],
        answer: answerText,
      });
      onSessionUpdate(res.activeSession);
      setStatusMsg(
        res.changed ? 'Choice updated and saved.' : 'Choice saved.'
      );
    } catch {
      setStatusMsg('Could not save right now. Try again.');
    } finally {
      setSaving(false);
    }
  }

  const isDirty = choice !== null && choice !== savedChoice;

  return (
    <div className="space-y-5">
      <div className="rounded-3xl border border-[#702B4C]/12 bg-white p-6 sm:p-8">
        <div className="flex items-center justify-between text-xs text-[#6A525E]">
          <span className="font-medium text-[#9274B8]">
            Would You Rather · {current.category}
          </span>
          <span className="tabular-nums">
            {(idx % items.length) + 1} / {items.length}
            {savedChoice ? ` · Saved: Option ${savedChoice}` : ''}
          </span>
        </div>

        <h3 className="mt-2 font-serif text-2xl font-semibold text-[#702B4C] sm:text-3xl">
          Pick the one your heart leans toward
        </h3>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => {
              setChoice('A');
              setStatusMsg(null);
            }}
            className={`flex min-h-[112px] flex-col justify-between rounded-2xl border p-5 text-left transition-all active:scale-[0.99] ${
              choice === 'A'
                ? 'border-[#702B4C] bg-[#FFF0F5] shadow-xs'
                : 'border-[#702B4C]/15 bg-[#FFF9F5] hover:border-[#702B4C]/40'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-semibold text-[#9274B8]">
              <span>Option A</span>
              {savedChoice === 'A' && (
                <span className="text-emerald-800">Saved</span>
              )}
            </div>
            <span className="mt-2 text-base font-medium leading-snug text-[#2E1A24]">
              {current.optionA}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setChoice('B');
              setStatusMsg(null);
            }}
            className={`flex min-h-[112px] flex-col justify-between rounded-2xl border p-5 text-left transition-all active:scale-[0.99] ${
              choice === 'B'
                ? 'border-[#702B4C] bg-[#F6F2FF] shadow-xs'
                : 'border-[#702B4C]/15 bg-[#FFF9F5] hover:border-[#702B4C]/40'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-semibold text-[#9274B8]">
              <span>Option B</span>
              {savedChoice === 'B' && (
                <span className="text-emerald-800">Saved</span>
              )}
            </div>
            <span className="mt-2 text-base font-medium leading-snug text-[#2E1A24]">
              {current.optionB}
            </span>
          </button>
        </div>

        <AnimatePresence mode="wait">
          {choice && (
            <motion.div
              key={`${current.id}-${choice}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="mt-5 rounded-2xl bg-[#FDF6E6] p-5"
            >
              <p className="text-xs font-semibold text-[#702B4C]">
                Selected: Option {choice}
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-[#2E1A24]">
                {choice === 'A' ? current.reactionA : current.reactionB}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {statusMsg && (
          <p role="status" className="mt-3 text-xs font-medium text-emerald-800">
            {statusMsg}
          </p>
        )}

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[#702B4C]/10 pt-5">
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() =>
                setIdx((prev) => (prev - 1 + items.length) % items.length)
              }
              aria-label="Previous dilemma"
              className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#702B4C]/15 bg-[#FFF9F5] text-[#702B4C] hover:bg-[#FFDCE8]/40"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setIdx((prev) => (prev + 1) % items.length)}
              className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-[#702B4C]/20 bg-white px-4 py-2 text-xs font-semibold text-[#702B4C] hover:bg-[#FAF1EA]"
            >
              <span>Next Dilemma</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <button
            type="button"
            disabled={!choice || saving || !isDirty}
            onClick={() => void handleSaveChoice()}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-[#702B4C] px-5 py-2.5 text-sm font-semibold text-[#FFF9F5] hover:bg-[#531D38] active:scale-[0.98] disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            <span>
              {saving
                ? 'Saving...'
                : savedChoice && !isDirty
                  ? 'Choice Saved'
                  : savedChoice
                    ? 'Update Choice'
                    : 'Save Choice'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}

// C. Truth or Dare (logs choices & saves/updates responses)
export function TruthOrDareCard({
  items,
  savedAnswers,
  sessionId,
  onSessionUpdate,
}: {
  items: TruthOrDareItem[];
  savedAnswers: AnswerRecord[];
  sessionId: string;
  onSessionUpdate: (state: ActiveSessionState) => void;
}) {
  const [mode, setMode] = useState<DareMode>('Truth');
  const [intensity, setIntensity] = useState<'All' | DareIntensity>('All');
  const [current, setCurrent] = useState<TruthOrDareItem | null>(
    items.find((i) => i.mode === 'Truth') ?? null
  );
  const [responseText, setResponseText] = useState('');
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const savedRecord = current
    ? findSavedAnswer(savedAnswers, 'truth_or_dare', current.id)
    : undefined;

  useEffect(() => {
    setResponseText(savedRecord?.currentAnswer ?? '');
  }, [current?.id, savedRecord?.currentAnswer, sessionId]);

  useEffect(() => {
    setStatusMsg(null);
  }, [current?.id, sessionId]);

  const pool = useMemo(
    () =>
      items.filter(
        (item) =>
          item.mode === mode &&
          (intensity === 'All' || item.intensity === intensity)
      ),
    [items, mode, intensity]
  );

  function drawCard(
    nextMode: DareMode = mode,
    nextIntensity = intensity,
    logChoice = true
  ) {
    const candidates = items.filter(
      (i) =>
        i.mode === nextMode &&
        (nextIntensity === 'All' || i.intensity === nextIntensity)
    );
    if (candidates.length === 0) {
      setCurrent(null);
      return;
    }
    const filteredOther = candidates.filter((c) => c.id !== current?.id);
    const source = filteredOther.length > 0 ? filteredOther : candidates;
    const picked = source[Math.floor(Math.random() * source.length)];
    setCurrent(picked);

    if (logChoice) {
      void api
        .logActivityEvent({
          type: 'tod_choice',
          title: `${picked.mode} · ${picked.intensity}`,
          detail: picked.text,
          itemKey: picked.id,
        })
        .then((res) => onSessionUpdate(res.activeSession))
        .catch(() => {
          // Non-blocking
        });
    }
  }

  async function saveResponse(customValue?: string) {
    if (!current) return;
    const value = (customValue ?? responseText).trim();
    if (!value) return;
    setSaving(true);
    setStatusMsg(null);
    try {
      const res = await api.saveAnswer({
        category: 'truth_or_dare',
        itemKey: current.id,
        promptText: `${current.mode} (${current.intensity}): ${current.text}`,
        optionsPresented: ['Truth', 'Dare'],
        answer: value,
      });
      onSessionUpdate(res.activeSession);
      setResponseText(value);
      setStatusMsg(res.changed ? 'Response updated.' : 'Response saved.');
    } catch {
      setStatusMsg('Unable to save right now.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-2 rounded-2xl bg-[#FAF1EA] p-1.5">
        {(['Truth', 'Dare'] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => {
              setMode(m);
              drawCard(m, intensity, true);
            }}
            className={`min-h-[44px] rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
              mode === m
                ? 'bg-[#702B4C] text-[#FFF9F5] shadow-xs'
                : 'text-[#6A525E] hover:text-[#702B4C]'
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-[#6A525E]">Intensity:</span>
        {(['All', 'Gentle', 'Playful', 'Bold'] as const).map((level) => (
          <button
            key={level}
            type="button"
            onClick={() => {
              setIntensity(level);
              drawCard(mode, level, true);
            }}
            className={`min-h-[40px] rounded-xl border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              intensity === level
                ? 'border-[#702B4C] bg-[#FFDCE8]/70 text-[#702B4C]'
                : 'border-[#702B4C]/15 bg-white text-[#6A525E] hover:border-[#702B4C]/40'
            }`}
          >
            {level}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={current?.id ?? 'empty'}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.2 }}
          className="rounded-3xl border border-[#702B4C]/12 bg-white p-6 sm:p-8"
        >
          {current ? (
            <>
              <div className="flex items-center justify-between gap-2 text-xs font-semibold text-[#9274B8]">
                <div className="flex items-center gap-2">
                  <Flame className="h-4 w-4 text-[#702B4C]" />
                  <span>
                    {current.mode} · {current.intensity}
                  </span>
                </div>
                {savedRecord && (
                  <span className="text-emerald-800">Saved</span>
                )}
              </div>

              <p className="mt-4 font-serif text-2xl leading-snug font-semibold text-[#702B4C] sm:text-3xl">
                {current.text}
              </p>

              {/* Saveable response or quick dare status */}
              <div className="mt-5 space-y-3 border-t border-[#702B4C]/10 pt-5">
                {current.mode === 'Dare' && (
                  <div className="flex flex-wrap gap-2">
                    {['Challenge Accepted & Done!', 'Saving This Dare for Later'].map(
                      (quick) => (
                        <button
                          key={quick}
                          type="button"
                          onClick={() => void saveResponse(quick)}
                          disabled={saving}
                          className={`min-h-[40px] rounded-xl border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                            savedRecord?.currentAnswer === quick
                              ? 'border-[#702B4C] bg-[#FFF0F5] text-[#702B4C]'
                              : 'border-[#702B4C]/15 bg-[#FFF9F5] text-[#6A525E] hover:border-[#702B4C]/40'
                          }`}
                        >
                          {quick}
                        </button>
                      )
                    )}
                  </div>
                )}

                <div className="flex flex-col gap-2.5 sm:flex-row">
                  <input
                    type="text"
                    aria-label="Your truth or dare reply"
                    value={responseText}
                    onChange={(e) => {
                      setResponseText(e.target.value);
                      if (statusMsg) setStatusMsg(null);
                    }}
                    placeholder={
                      current.mode === 'Truth'
                        ? 'Write your honest answer (editable anytime)...'
                        : 'Add a quick note about how it went...'
                    }
                    className="min-h-[44px] flex-1 rounded-xl border border-[#702B4C]/20 bg-[#FFF9F5] px-3.5 text-sm text-[#2E1A24] focus:border-[#702B4C] focus:outline-none"
                  />
                  <button
                    type="button"
                    disabled={
                      saving ||
                      !responseText.trim() ||
                      responseText.trim() === savedRecord?.currentAnswer
                    }
                    onClick={() => void saveResponse()}
                    className="inline-flex min-h-[44px] shrink-0 items-center justify-center gap-1.5 rounded-xl bg-[#702B4C] px-4 text-xs font-semibold text-[#FFF9F5] hover:bg-[#531D38] disabled:opacity-50"
                  >
                    <Save className="h-3.5 w-3.5" />
                    <span>{savedRecord ? 'Update' : 'Save'}</span>
                  </button>
                </div>

                {statusMsg && (
                  <p role="status" className="text-xs font-medium text-emerald-800">
                    {statusMsg}
                  </p>
                )}
              </div>

              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[#702B4C]/10 pt-5">
                <span className="text-xs text-[#6A525E] tabular-nums">
                  {pool.length} respectful prompts in this level
                </span>
                <button
                  type="button"
                  onClick={() => drawCard(mode, intensity, true)}
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-[#702B4C]/20 bg-[#FFF9F5] px-5 py-2.5 text-sm font-semibold text-[#702B4C] hover:bg-[#FFDCE8]/40 active:scale-[0.98]"
                >
                  <Shuffle className="h-4 w-4" />
                  <span>Draw Another {mode}</span>
                </button>
              </div>
            </>
          ) : (
            <p className="py-6 text-center text-sm text-[#6A525E]">
              No {mode.toLowerCase()} prompts match that intensity yet. Try &ldquo;All&rdquo;.
            </p>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// E. Pick a Heart (records each heart opened & restores session progress)
export function PickAHeartGrid({
  surprises,
  openedHeartIds,
  sessionId,
  onSessionUpdate,
}: {
  surprises: HeartSurprise[];
  openedHeartIds: string[];
  sessionId: string;
  onSessionUpdate: (state: ActiveSessionState) => void;
}) {
  const [board, setBoard] = useState<HeartSurprise[]>(() =>
    surprises.slice(0, 6)
  );
  const [selected, setSelected] = useState<HeartSurprise | null>(null);

  useEffect(() => {
    setSelected(null);
  }, [sessionId]);

  useEffect(() => {
    if (surprises.length > 0 && board.length === 0) {
      setBoard(surprises.slice(0, 6));
    }
  }, [surprises, board.length]);

  function pickHeart(item: HeartSurprise) {
    setSelected(item);
    void api
      .logActivityEvent({
        type: 'heart_picked',
        title: item.kind,
        detail: item.message,
        itemKey: item.id,
      })
      .then((res) => onSessionUpdate(res.activeSession))
      .catch(() => {
        // Non-blocking
      });
  }

  function shuffleBoard() {
    const next = [...surprises].sort(() => Math.random() - 0.5).slice(0, 6);
    setBoard(next);
    setSelected(null);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-serif text-2xl font-semibold text-[#702B4C]">
            Choose a Heart
          </h3>
          <p className="text-xs text-[#6A525E]">
            Every heart holds a hidden compliment, note, question, or playful challenge.
          </p>
        </div>
        <button
          type="button"
          onClick={shuffleBoard}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-[#702B4C]/20 bg-white px-4 py-2 text-xs font-semibold text-[#702B4C] hover:bg-[#FFDCE8]/40"
        >
          <Shuffle className="h-3.5 w-3.5" />
          <span>Shuffle Hearts</span>
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
        {board.map((item, idx) => {
          const isOpened = openedHeartIds.includes(item.id);
          const isCurrent = selected?.id === item.id;
          return (
            <motion.button
              key={item.id}
              type="button"
              whileTap={{ scale: 0.93 }}
              onClick={() => pickHeart(item)}
              aria-label={`Open heart ${idx + 1}${isOpened ? ' (opened)' : ''}`}
              className={`flex min-h-[96px] flex-col items-center justify-center gap-2 rounded-2xl border p-3 transition-colors ${
                isCurrent
                  ? 'border-[#702B4C] bg-[#702B4C] text-[#FFF9F5] shadow-md'
                  : isOpened
                    ? 'border-[#702B4C]/25 bg-[#FFDCE8]/75 text-[#702B4C]'
                    : 'border-[#702B4C]/12 bg-white text-[#702B4C] hover:bg-[#FFF0F5]'
              }`}
            >
              <Heart
                className="h-7 w-7"
                fill={isOpened || isCurrent ? 'currentColor' : 'none'}
              />
              <span className="text-[11px] font-medium">
                {isOpened ? 'Opened' : `Heart ${idx + 1}`}
              </span>
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {selected && (
          <motion.div
            key={selected.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.22 }}
            className="rounded-3xl border border-[#702B4C]/15 bg-[#FFF0F5] p-6"
          >
            <div className="flex items-center gap-2 text-xs font-semibold text-[#9274B8]">
              <Sparkles className="h-4 w-4 text-[#702B4C]" />
              <span>{selected.kind}</span>
            </div>
            <p className="mt-3 font-serif text-2xl leading-snug text-[#702B4C]">
              {selected.message}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// G. Red Flag or Green Flag (saveable & changeable verdict)
const FLAG_LABELS: Record<'green' | 'red' | 'depends', string> = {
  green: 'Green Flag',
  red: 'Red Flag',
  depends: 'It Depends',
};

function labelToVerdict(
  label?: string
): 'green' | 'red' | 'depends' | null {
  if (label === 'Green Flag') return 'green';
  if (label === 'Red Flag') return 'red';
  if (label === 'It Depends') return 'depends';
  return null;
}

export function RedGreenFlagCard({
  scenarios,
  savedAnswers,
  sessionId,
  onSessionUpdate,
}: {
  scenarios: FlagScenario[];
  savedAnswers: AnswerRecord[];
  sessionId: string;
  onSessionUpdate: (state: ActiveSessionState) => void;
}) {
  const [idx, setIdx] = useState(0);
  const current = scenarios.length > 0 ? scenarios[idx % scenarios.length] : null;
  const savedRecord = current
    ? findSavedAnswer(savedAnswers, 'red_green_flag', current.id)
    : undefined;
  const savedVerdict = labelToVerdict(savedRecord?.currentAnswer);

  const [verdict, setVerdict] = useState<'green' | 'red' | 'depends' | null>(
    savedVerdict
  );
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  useEffect(() => {
    setVerdict(savedVerdict);
  }, [current?.id, savedVerdict, sessionId]);

  useEffect(() => {
    setStatusMsg(null);
  }, [current?.id, sessionId]);

  if (!current) return null;

  async function saveVerdict() {
    if (!current || !verdict) return;
    setSaving(true);
    setStatusMsg(null);
    try {
      const res = await api.saveAnswer({
        category: 'red_green_flag',
        itemKey: current.id,
        promptText: current.scenario,
        optionsPresented: ['Green Flag', 'Red Flag', 'It Depends'],
        answer: FLAG_LABELS[verdict],
      });
      onSessionUpdate(res.activeSession);
      setStatusMsg(res.changed ? 'Verdict updated.' : 'Verdict saved.');
    } catch {
      setStatusMsg('Could not save right now.');
    } finally {
      setSaving(false);
    }
  }

  const feedback =
    verdict === 'green'
      ? current.feedbackGreen
      : verdict === 'red'
        ? current.feedbackRed
        : verdict === 'depends'
          ? current.feedbackDepends
          : null;

  const isDirty = verdict !== null && verdict !== savedVerdict;

  return (
    <div className="rounded-3xl border border-[#702B4C]/12 bg-white p-6 sm:p-8">
      <div className="flex items-center justify-between text-xs text-[#6A525E]">
        <span className="font-semibold text-[#9274B8]">
          Red Flag or Green Flag?
        </span>
        <span className="tabular-nums">
          {(idx % scenarios.length) + 1} / {scenarios.length}
          {savedVerdict ? ` · Saved: ${FLAG_LABELS[savedVerdict]}` : ''}
        </span>
      </div>

      <p className="mt-4 font-serif text-2xl leading-snug font-semibold text-[#702B4C] sm:text-3xl">
        &ldquo;{current.scenario}&rdquo;
      </p>

      <div className="mt-6 grid gap-2.5 sm:grid-cols-3">
        <button
          type="button"
          onClick={() => {
            setVerdict('green');
            setStatusMsg(null);
          }}
          className={`flex min-h-[48px] items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition-colors ${
            verdict === 'green'
              ? 'border-emerald-700 bg-emerald-700 text-white'
              : 'border-emerald-700/25 bg-emerald-50/70 text-emerald-900 hover:bg-emerald-100/70'
          }`}
        >
          <Flag className="h-4 w-4" />
          <span>Green Flag</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setVerdict('red');
            setStatusMsg(null);
          }}
          className={`flex min-h-[48px] items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition-colors ${
            verdict === 'red'
              ? 'border-[#702B4C] bg-[#702B4C] text-white'
              : 'border-[#702B4C]/25 bg-[#FFDCE8]/60 text-[#702B4C] hover:bg-[#FFDCE8]'
          }`}
        >
          <Flag className="h-4 w-4" />
          <span>Red Flag</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setVerdict('depends');
            setStatusMsg(null);
          }}
          className={`flex min-h-[48px] items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-semibold transition-colors ${
            verdict === 'depends'
              ? 'border-[#9274B8] bg-[#9274B8] text-white'
              : 'border-[#9274B8]/25 bg-[#E9DFFF]/60 text-[#4B2F6E] hover:bg-[#E9DFFF]'
          }`}
        >
          <span>It Depends</span>
        </button>
      </div>

      <AnimatePresence mode="wait">
        {feedback && (
          <motion.div
            key={`${current.id}-${verdict}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-5 rounded-2xl bg-[#FAF1EA] p-5 text-sm leading-relaxed text-[#2E1A24]"
          >
            {feedback}
          </motion.div>
        )}
      </AnimatePresence>

      {statusMsg && (
        <p role="status" className="mt-3 text-xs font-medium text-emerald-800">
          {statusMsg}
        </p>
      )}

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[#702B4C]/10 pt-5">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() =>
              setIdx((prev) => (prev - 1 + scenarios.length) % scenarios.length)
            }
            aria-label="Previous scenario"
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-[#702B4C]/15 bg-[#FFF9F5] text-[#702B4C] hover:bg-[#FFDCE8]/40"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setIdx((prev) => (prev + 1) % scenarios.length)}
            className="inline-flex min-h-[44px] items-center gap-1.5 rounded-xl border border-[#702B4C]/20 bg-white px-4 py-2 text-xs font-semibold text-[#702B4C] hover:bg-[#FAF1EA]"
          >
            <span>Next Scenario</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <button
          type="button"
          disabled={!verdict || saving || !isDirty}
          onClick={() => void saveVerdict()}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-[#702B4C] px-5 py-2.5 text-sm font-semibold text-[#FFF9F5] hover:bg-[#531D38] disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          <span>
            {saving
              ? 'Saving...'
              : savedVerdict && !isDirty
                ? 'Verdict Saved'
                : savedVerdict
                  ? 'Update Verdict'
                  : 'Save Verdict'}
          </span>
        </button>
      </div>
    </div>
  );
}
