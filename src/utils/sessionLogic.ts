import type {
  ActiveSessionState,
  ActivityEvent,
  AnswerCategory,
  AnswerRecord,
  QuizAttemptRecord,
  QuizQuestionResponse,
  UniverseData,
  UniverseSession,
} from '../types/universe.ts';

export function ensureActiveSession(
  data: UniverseData,
  nowIso: string = new Date().toISOString()
): UniverseSession {
  if (!Array.isArray(data.sessions)) {
    data.sessions = [];
  }
  const existing = data.sessions.find((s) => s.status === 'active');
  if (existing) return existing;

  const nextNum =
    data.sessions.reduce((max, s) => Math.max(max, s.sessionNumber), 0) + 1;
  const created: UniverseSession = {
    id: `sess-${nextNum}-${nowIso.replace(/[^0-9]/g, '').slice(-6)}`,
    sessionNumber: nextNum,
    startedAt: nowIso,
    status: 'active',
  };
  data.sessions.unshift(created);
  return created;
}

export interface UpsertAnswerInput {
  sessionId: string;
  category: AnswerCategory;
  itemKey: string;
  promptText: string;
  optionsPresented?: string[];
  answer: string;
  idGenerator: () => string;
  nowIso?: string;
}

export function upsertAnswerRecord(
  records: AnswerRecord[],
  input: UpsertAnswerInput
): { record: AnswerRecord; changed: boolean; isNew: boolean } {
  const nowIso = input.nowIso ?? new Date().toISOString();
  const cleanAnswer = input.answer.trim();
  const existing = records.find(
    (r) =>
      r.sessionId === input.sessionId &&
      r.category === input.category &&
      r.itemKey === input.itemKey
  );

  if (!existing) {
    const created: AnswerRecord = {
      id: input.idGenerator(),
      sessionId: input.sessionId,
      category: input.category,
      itemKey: input.itemKey,
      promptText: input.promptText,
      optionsPresented: input.optionsPresented,
      currentAnswer: cleanAnswer,
      changeHistory: [{ answer: cleanAnswer, changedAt: nowIso }],
      createdAt: nowIso,
      updatedAt: nowIso,
    };
    records.unshift(created);
    return { record: created, changed: false, isNew: true };
  }

  if (existing.currentAnswer === cleanAnswer) {
    existing.updatedAt = nowIso;
    return { record: existing, changed: false, isNew: false };
  }

  existing.previousAnswer = existing.currentAnswer;
  existing.currentAnswer = cleanAnswer;
  existing.changeHistory.push({ answer: cleanAnswer, changedAt: nowIso });
  existing.updatedAt = nowIso;
  if (input.optionsPresented && input.optionsPresented.length > 0) {
    existing.optionsPresented = input.optionsPresented;
  }

  return { record: existing, changed: true, isNew: false };
}

export interface UpsertQuizAttemptInput {
  sessionId: string;
  quizType: 'know_me' | 'love_language';
  responses: Array<{
    questionId: string;
    questionText: string;
    options: string[];
    selectedIndex: number;
    selectedOption: string;
    isCorrect?: boolean;
  }>;
  status: 'in_progress' | 'completed';
  score?: number;
  total: number;
  percentage?: number;
  resultSummary?: string;
  idGenerator: () => string;
  nowIso?: string;
}

export function upsertQuizAttempt(
  attempts: QuizAttemptRecord[],
  input: UpsertQuizAttemptInput
): QuizAttemptRecord {
  const nowIso = input.nowIso ?? new Date().toISOString();
  const existing = attempts.find(
    (a) => a.sessionId === input.sessionId && a.quizType === input.quizType
  );

  const buildMergedResponses = (
    prevList: QuizQuestionResponse[]
  ): QuizQuestionResponse[] =>
    input.responses.map((nextItem) => {
      const prev = prevList.find((p) => p.questionId === nextItem.questionId);
      const changed = prev && prev.selectedOption !== nextItem.selectedOption;
      return {
        questionId: nextItem.questionId,
        questionText: nextItem.questionText,
        options: nextItem.options,
        selectedIndex: nextItem.selectedIndex,
        selectedOption: nextItem.selectedOption,
        previousOption: changed ? prev.selectedOption : prev?.previousOption,
        isCorrect: nextItem.isCorrect,
        updatedAt: nowIso,
      };
    });

  if (!existing) {
    const created: QuizAttemptRecord = {
      id: input.idGenerator(),
      sessionId: input.sessionId,
      quizType: input.quizType,
      status: input.status,
      responses: buildMergedResponses([]),
      score: input.score,
      total: input.total,
      percentage: input.percentage,
      resultSummary: input.resultSummary,
      startedAt: nowIso,
      completedAt: input.status === 'completed' ? nowIso : undefined,
      updatedAt: nowIso,
    };
    attempts.unshift(created);
    return created;
  }

  existing.responses = buildMergedResponses(existing.responses);
  existing.status = input.status;
  existing.score = input.score;
  existing.total = input.total;
  existing.percentage = input.percentage;
  existing.resultSummary = input.resultSummary;
  existing.updatedAt = nowIso;
  if (input.status === 'completed') {
    existing.completedAt = nowIso;
  }
  return existing;
}

export function archiveAndStartNewSession(
  data: UniverseData,
  idGenerator: () => string,
  nowIso: string = new Date().toISOString()
): { previousSession: UniverseSession; newSession: UniverseSession } {
  const previousSession = ensureActiveSession(data, nowIso);
  previousSession.status = 'archived';
  previousSession.endedAt = nowIso;

  const nextNum =
    data.sessions.reduce((max, s) => Math.max(max, s.sessionNumber), 0) + 1;
  const newSession: UniverseSession = {
    id: `sess-${nextNum}-${idGenerator().slice(0, 6)}`,
    sessionNumber: nextNum,
    startedAt: nowIso,
    status: 'active',
  };
  data.sessions.unshift(newSession);

  const restartEvent: ActivityEvent = {
    id: idGenerator(),
    sessionId: newSession.id,
    type: 'universe_restarted',
    title: 'Started Universe Again',
    detail: `Archived Session #${previousSession.sessionNumber} and began Session #${newSession.sessionNumber}.`,
    createdAt: nowIso,
  };
  data.activityEvents.unshift(restartEvent);

  return { previousSession, newSession };
}

export function buildActiveSessionState(data: UniverseData): ActiveSessionState {
  const session = ensureActiveSession(data);
  const sid = session.id;

  const answers = data.answerRecords.filter((r) => r.sessionId === sid);
  const quizAttempts = data.quizAttempts.filter((q) => q.sessionId === sid);
  const gameRecords = data.gameRecords.filter((g) => g.sessionId === sid);
  const sessionEvents = data.activityEvents.filter((e) => e.sessionId === sid);

  const revealedScratchIds = Array.from(
    new Set(
      sessionEvents
        .filter((e) => e.type === 'scratch_revealed' && e.itemKey)
        .map((e) => e.itemKey as string)
    )
  );
  const openedEnvelopeIds = Array.from(
    new Set(
      sessionEvents
        .filter((e) => e.type === 'envelope_opened' && e.itemKey)
        .map((e) => e.itemKey as string)
    )
  );
  const openedHeartIds = Array.from(
    new Set(
      sessionEvents
        .filter((e) => e.type === 'heart_picked' && e.itemKey)
        .map((e) => e.itemKey as string)
    )
  );

  return {
    session,
    answers,
    quizAttempts,
    gameRecords,
    revealedScratchIds,
    openedEnvelopeIds,
    openedHeartIds,
  };
}
