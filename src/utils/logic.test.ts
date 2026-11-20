import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateLoveLanguage,
  calculateWheelLandingIndex,
  computeTargetRotationForSegment,
  evaluateCodeBreakerGuess,
  evaluateGuessAttempt,
  evaluateQuizScore,
  generateSecretCode,
  scrambleWord,
  validateUniverseBackup,
} from './logic';
import {
  archiveAndStartNewSession,
  buildActiveSessionState,
  upsertAnswerRecord,
  upsertQuizAttempt,
} from './sessionLogic';
import { createSeedUniverse } from '../data/seedUniverse';
import type { AnswerRecord, QuizAttemptRecord } from '../types/universe';

test('calculateLoveLanguage identifies dominant love language and sums accurately', () => {
  const result = calculateLoveLanguage([
    'Quality Time',
    'Words of Affirmation',
    'Quality Time',
    'Quality Time',
    'Acts of Service',
  ]);
  assert.equal(result.primary.language, 'Quality Time');
  assert.equal(result.primary.count, 3);
  assert.equal(result.primary.percentage, 60);
  assert.equal(result.breakdown.length, 5);
});

test('evaluateCodeBreakerGuess computes exact and misplaced matches correctly', () => {
  const solved = evaluateCodeBreakerGuess('4827', '4827');
  assert.deepEqual(solved, { exact: 4, misplaced: 0, solved: true });

  const mixed = evaluateCodeBreakerGuess('4827', '4289');
  assert.deepEqual(mixed, { exact: 1, misplaced: 2, solved: false });

  const duplicates = evaluateCodeBreakerGuess('1234', '1111');
  assert.deepEqual(duplicates, { exact: 1, misplaced: 0, solved: false });
});

test('generateSecretCode creates 4 unique digits from 1-9', () => {
  const code = generateSecretCode(4);
  assert.equal(code.length, 4);
  assert.equal(new Set(code.split('')).size, 4);
  assert.match(code, /^[1-9]{4}$/);
});

test('scrambleWord preserves characters and avoids identical output', () => {
  const scrambled = scrambleWord('STARLIGHT');
  assert.notEqual(scrambled, 'STARLIGHT');
  assert.equal(
    scrambled.split('').sort().join(''),
    'STARLIGHT'.split('').sort().join('')
  );
});

test('wheel rotation math lands on exact target segment index every time', () => {
  const segmentCount = 8;
  let rotation = 0;
  for (let target = 0; target < segmentCount; target++) {
    rotation = computeTargetRotationForSegment(rotation, target, segmentCount, 4, 0.5);
    const landed = calculateWheelLandingIndex(rotation, segmentCount);
    assert.equal(landed, target);
  }
});

test('evaluateQuizScore calculates correct totals and tiers', () => {
  const seed = createSeedUniverse();
  const perfect = evaluateQuizScore(
    seed.quizQuestions,
    seed.quizQuestions.map((q) => q.correctIndex)
  );
  assert.equal(perfect.score, seed.quizQuestions.length);
  assert.equal(perfect.percentage, 100);

  const zero = evaluateQuizScore(
    seed.quizQuestions,
    seed.quizQuestions.map((q) => (q.correctIndex + 1) % q.options.length)
  );
  assert.equal(zero.score, 0);
  assert.equal(zero.percentage, 0);
});

test('evaluateGuessAttempt matches canonical answers and aliases fuzzily', () => {
  const seed = createSeedUniverse();
  const coffeeChallenge = seed.guessChallenges[0];
  assert.equal(evaluateGuessAttempt(coffeeChallenge, 'Coffee!'), true);
  assert.equal(evaluateGuessAttempt(coffeeChallenge, 'a warm latte'), true);
  assert.equal(evaluateGuessAttempt(coffeeChallenge, 'airplane'), false);
});

test('validateUniverseBackup accepts valid universe data and rejects malformed input', () => {
  const seed = createSeedUniverse();
  assert.equal(validateUniverseBackup(seed), true);
  assert.equal(validateUniverseBackup({ settings: {} }), false);
  assert.equal(validateUniverseBackup(null), false);
});

test('seed data respects no-invented-memories and strict nickname rules', () => {
  const seed = createSeedUniverse();
  assert.equal(seed.memories.length, 0);
  assert.equal(seed.insideJokes.length, 0);
  assert.equal(seed.settings.welcomeHeading, 'Welcome to Your Little Universe, Mehak.');
  assert.ok(!seed.settings.welcomeHeading.includes('Karma Wali'));
  assert.ok(!seed.settings.welcomeHeading.includes('Mini Crocodile'));
  assert.ok(!seed.settings.welcomeHeading.includes('Octopus'));
});

test('upsertAnswerRecord updates current answer in place without duplicates and preserves change history', () => {
  const records: AnswerRecord[] = [];
  let seq = 1;
  const gen = () => `rec-${seq++}`;

  const first = upsertAnswerRecord(records, {
    sessionId: 'sess-1',
    category: 'would_you_rather',
    itemKey: 'wyr-1',
    promptText: 'Midnight adventure or planned candlelit evening?',
    optionsPresented: ['Midnight adventure', 'Planned evening'],
    answer: 'Midnight adventure',
    idGenerator: gen,
    nowIso: '2026-11-19T10:00:00.000Z',
  });
  assert.equal(first.isNew, true);
  assert.equal(first.changed, false);
  assert.equal(records.length, 1);
  assert.equal(first.record.previousAnswer, undefined);

  const second = upsertAnswerRecord(records, {
    sessionId: 'sess-1',
    category: 'would_you_rather',
    itemKey: 'wyr-1',
    promptText: 'Midnight adventure or planned candlelit evening?',
    optionsPresented: ['Midnight adventure', 'Planned evening'],
    answer: 'Planned evening',
    idGenerator: gen,
    nowIso: '2026-11-19T10:05:00.000Z',
  });
  assert.equal(second.isNew, false);
  assert.equal(second.changed, true);
  assert.equal(records.length, 1);
  assert.equal(second.record.currentAnswer, 'Planned evening');
  assert.equal(second.record.previousAnswer, 'Midnight adventure');
  assert.equal(second.record.changeHistory.length, 2);

  // Re-saving identical value should not duplicate history
  const same = upsertAnswerRecord(records, {
    sessionId: 'sess-1',
    category: 'would_you_rather',
    itemKey: 'wyr-1',
    promptText: 'Midnight adventure or planned candlelit evening?',
    answer: 'Planned evening',
    idGenerator: gen,
    nowIso: '2026-11-19T10:06:00.000Z',
  });
  assert.equal(same.changed, false);
  assert.equal(same.record.changeHistory.length, 2);
});

test('upsertQuizAttempt tracks per-question changed selections cleanly', () => {
  const attempts: QuizAttemptRecord[] = [];
  const first = upsertQuizAttempt(attempts, {
    sessionId: 'sess-1',
    quizType: 'know_me',
    status: 'completed',
    score: 0,
    total: 1,
    percentage: 0,
    responses: [
      {
        questionId: 'quiz-1',
        questionText: 'Favorite evening?',
        options: ['Café', 'Club'],
        selectedIndex: 1,
        selectedOption: 'Club',
        isCorrect: false,
      },
    ],
    idGenerator: () => 'qa-1',
    nowIso: '2026-11-19T11:00:00.000Z',
  });
  assert.equal(first.responses[0].previousOption, undefined);

  const updated = upsertQuizAttempt(attempts, {
    sessionId: 'sess-1',
    quizType: 'know_me',
    status: 'completed',
    score: 1,
    total: 1,
    percentage: 100,
    responses: [
      {
        questionId: 'quiz-1',
        questionText: 'Favorite evening?',
        options: ['Café', 'Club'],
        selectedIndex: 0,
        selectedOption: 'Café',
        isCorrect: true,
      },
    ],
    idGenerator: () => 'qa-2',
    nowIso: '2026-11-19T11:05:00.000Z',
  });
  assert.equal(attempts.length, 1);
  assert.equal(updated.score, 1);
  assert.equal(updated.responses[0].selectedOption, 'Café');
  assert.equal(updated.responses[0].previousOption, 'Club');
});

test('archiveAndStartNewSession resets active state while preserving all historical admin data', () => {
  const data = createSeedUniverse();
  const s1 = data.sessions[0].id;
  upsertAnswerRecord(data.answerRecords, {
    sessionId: s1,
    category: 'question',
    itemKey: 'q-1',
    promptText: 'Tiny moment?',
    answer: 'Morning chai in sunlight',
    idGenerator: () => 'ar-1',
  });

  const { previousSession, newSession } = archiveAndStartNewSession(
    data,
    () => 'ev-restart-1',
    '2026-11-19T12:00:00.000Z'
  );

  assert.equal(previousSession.status, 'archived');
  assert.equal(previousSession.endedAt, '2026-11-19T12:00:00.000Z');
  assert.equal(newSession.status, 'active');
  assert.equal(newSession.sessionNumber, 2);

  // Admin database still has all Session #1 answers intact
  assert.equal(data.answerRecords.length, 1);
  assert.equal(data.answerRecords[0].sessionId, s1);

  // Active session view for Mehak starts clean and empty
  const activeState = buildActiveSessionState(data);
  assert.equal(activeState.session.id, newSession.id);
  assert.equal(activeState.answers.length, 0);
  assert.equal(activeState.quizAttempts.length, 0);
});
