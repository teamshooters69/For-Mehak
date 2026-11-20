import 'dotenv/config';
import crypto from 'node:crypto';
import express from 'express';
import {
  checkAdminLoginRateLimit,
  clearAdminLoginFailures,
  clearSessionCookie,
  createSessionToken,
  hasAdminSession,
  hasUniverseSession,
  recordFailedAdminLogin,
  requireAdminAuth,
  requireUniverseAccess,
  setSessionCookie,
  verifyAccessCode,
  verifyAdminCredentials,
} from './auth.ts';
import {
  getUniverseData,
  replaceUniverseData,
  updateUniverseData,
} from './store.ts';
import { validateUniverseBackup } from '../src/utils/logic.ts';
import {
  archiveAndStartNewSession,
  buildActiveSessionState,
  ensureActiveSession,
  upsertAnswerRecord,
  upsertQuizAttempt,
} from '../src/utils/sessionLogic.ts';
import type {
  ActivityEvent,
  ActivityEventType,
  AnswerCategory,
  BucketItem,
  DatePlan,
  DestinationIdea,
  GameRecord,
  InsideJokeItem,
  RecipientUniversePayload,
  SubmittedAnswer,
  UniverseData,
} from '../src/types/universe.ts';

const ALLOWED_ADMIN_COLLECTIONS = new Set<keyof UniverseData>([
  'questions',
  'wouldYouRather',
  'truthOrDares',
  'quizQuestions',
  'heartSurprises',
  'sentencePrompts',
  'flagScenarios',
  'guessChallenges',
  'scratchCards',
  'wheelSegments',
  'envelopes',
  'mysteryRewards',
  'memories',
  'compliments',
  'insideJokes',
  'bucketList',
  'destinations',
  'datePlans',
]);

const ALLOWED_ANSWER_CATEGORIES = new Set<AnswerCategory>([
  'question',
  'sentence',
  'would_you_rather',
  'red_green_flag',
  'truth_or_dare',
  'guess_thinking',
]);

const ALLOWED_EVENT_TYPES = new Set<ActivityEventType>([
  'heart_picked',
  'tod_choice',
  'scratch_revealed',
  'envelope_opened',
  'mystery_box_opened',
  'wheel_spun',
  'date_idea_selected',
]);

function makeId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
}

function toRecipientPayload(data: UniverseData): RecipientUniversePayload {
  return {
    settings: data.settings,
    questions: data.questions,
    wouldYouRather: data.wouldYouRather,
    truthOrDares: data.truthOrDares,
    quizQuestions: data.quizQuestions,
    heartSurprises: data.heartSurprises,
    sentencePrompts: data.sentencePrompts,
    flagScenarios: data.flagScenarios,
    guessChallenges: data.guessChallenges,
    loveLanguageQuestions: data.loveLanguageQuestions,
    scratchCards: data.scratchCards,
    wheelSegments: data.wheelSegments,
    envelopes: data.envelopes,
    mysteryRewards: data.mysteryRewards,
    memories: data.memories,
    compliments: data.compliments,
    insideJokes: data.insideJokes,
    bucketList: data.bucketList,
    destinations: data.destinations,
    datePlans: data.datePlans,
    activeSession: buildActiveSessionState(data),
  };
}

export function createApiApp(): express.Express {
  const app = express();
  app.set('trust proxy', 1);
  app.use(express.json({ limit: '2mb' }));

  // Prevent proxy/browser caching of private API responses
  app.use('/api', (_req, res, next) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    next();
  });

  // --- Auth & Session (Strictly HttpOnly Cookie Based) ---

  app.get('/api/auth/session', async (req, res) => {
    try {
      const data = await getUniverseData();
      res.json({
        universeUnlocked: hasUniverseSession(req),
        isAdmin: hasAdminSession(req),
        requiresAccessCode: true,
        accessHint: data.settings.accessHint,
      });
    } catch (error) {
      console.error('Session lookup failed:', error);
      res.status(500).json({ error: 'Unable to check session status.' });
    }
  });

  app.post('/api/auth/unlock', async (req, res) => {
    const code = typeof req.body?.code === 'string' ? req.body.code : '';
    if (!verifyAccessCode(code)) {
      res.status(401).json({
        error: 'That passcode did not unlock the gate. Try again with the hint below.',
      });
      return;
    }
    try {
      const token = createSessionToken('universe', 168);
      setSessionCookie(req, res, 'universe', token);
      const data = await getUniverseData();
      res.json({
        ok: true,
        universe: toRecipientPayload(data),
        sessionToken: token,
      });
    } catch (error) {
      console.error('Failed loading universe during unlock:', error);
      res.status(500).json({ error: 'Unlocked, but could not load universe content.' });
    }
  });

  app.post('/api/auth/lock', (req, res) => {
    clearSessionCookie(req, res, 'universe');
    res.json({ ok: true });
  });

  app.post('/api/admin/login', (req, res) => {
    const rate = checkAdminLoginRateLimit(req);
    if (!rate.allowed) {
      res.setHeader('Retry-After', String(rate.retryAfterSeconds));
      res.status(429).json({
        error: `Too many failed attempts. Try again in ${Math.ceil(rate.retryAfterSeconds / 60)} minute(s).`,
      });
      return;
    }

    const username = typeof req.body?.username === 'string' ? req.body.username : '';
    const password = typeof req.body?.password === 'string' ? req.body.password : '';

    if (!verifyAdminCredentials(username, password)) {
      recordFailedAdminLogin(req);
      res.status(401).json({ error: 'Invalid owner credentials.' });
      return;
    }

    clearAdminLoginFailures(req);
    const adminToken = createSessionToken('admin', 24);
    const universeToken = createSessionToken('universe', 168);
    setSessionCookie(req, res, 'admin', adminToken);
    setSessionCookie(req, res, 'universe', universeToken);
    res.json({
      ok: true,
      adminSessionToken: adminToken,
      universeSessionToken: universeToken,
    });
  });

  app.post('/api/admin/logout', (req, res) => {
    clearSessionCookie(req, res, 'admin');
    res.json({ ok: true });
  });

  // --- Recipient Universe Endpoints (Protected by Private Access) ---

  app.get('/api/universe', requireUniverseAccess, async (_req, res) => {
    try {
      const data = await getUniverseData();
      res.json(toRecipientPayload(data));
    } catch (error) {
      console.error('Failed loading universe:', error);
      res.status(500).json({ error: 'Unable to load universe content.' });
    }
  });

  // Save or update a changeable answer (replaces current answer in place, preserves change history)
  app.put('/api/interactions/answer', requireUniverseAccess, async (req, res) => {
    const category = req.body?.category as AnswerCategory;
    const itemKey = typeof req.body?.itemKey === 'string' ? req.body.itemKey.trim() : '';
    const promptText =
      typeof req.body?.promptText === 'string' ? req.body.promptText.trim() : '';
    const answer = typeof req.body?.answer === 'string' ? req.body.answer.trim() : '';
    const optionsPresented = Array.isArray(req.body?.optionsPresented)
      ? req.body.optionsPresented
          .filter((o: unknown): o is string => typeof o === 'string')
          .map((o: string) => o.slice(0, 200))
      : undefined;

    if (!ALLOWED_ANSWER_CATEGORIES.has(category) || !itemKey || !promptText || !answer) {
      res.status(400).json({ error: 'Please choose or write an answer before saving.' });
      return;
    }

    try {
      let savedRecord: ReturnType<typeof upsertAnswerRecord> | null = null;
      const next = await updateUniverseData((draft) => {
        const session = ensureActiveSession(draft);
        savedRecord = upsertAnswerRecord(draft.answerRecords, {
          sessionId: session.id,
          category,
          itemKey: itemKey.slice(0, 80),
          promptText: promptText.slice(0, 320),
          optionsPresented,
          answer: answer.slice(0, 1000),
          idGenerator: () => makeId('ans'),
        });

        const ev: ActivityEvent = {
          id: makeId('ev'),
          sessionId: session.id,
          type: savedRecord.changed ? 'answer_changed' : 'answer_saved',
          title: savedRecord.changed ? 'Changed Saved Answer' : 'Saved Answer',
          detail: `${promptText.slice(0, 120)} -> ${answer.slice(0, 180)}`,
          itemKey: itemKey.slice(0, 80),
          createdAt: new Date().toISOString(),
        };
        draft.activityEvents.unshift(ev);
      });

      res.json({
        record: savedRecord!.record,
        changed: savedRecord!.changed,
        activeSession: buildActiveSessionState(next),
      });
    } catch (error) {
      console.error('Failed saving interaction answer:', error);
      res.status(500).json({ error: 'Unable to save selection.' });
    }
  });

  // Save or update quiz attempt (Know-Me Quiz or Love Language Quiz)
  app.post('/api/interactions/quiz', requireUniverseAccess, async (req, res) => {
    const quizType = req.body?.quizType;
    const status = req.body?.status === 'completed' ? 'completed' : 'in_progress';
    const rawResponses = Array.isArray(req.body?.responses) ? req.body.responses : [];
    const total = Number(req.body?.total) || rawResponses.length;
    const score = typeof req.body?.score === 'number' ? req.body.score : undefined;
    const percentage =
      typeof req.body?.percentage === 'number' ? req.body.percentage : undefined;
    const resultSummary =
      typeof req.body?.resultSummary === 'string'
        ? req.body.resultSummary.slice(0, 300)
        : undefined;

    if (!['know_me', 'love_language'].includes(quizType) || rawResponses.length === 0) {
      res.status(400).json({ error: 'Invalid quiz payload.' });
      return;
    }

    const sanitized = rawResponses.map((r: Record<string, unknown>) => ({
      questionId: String(r.questionId ?? '').slice(0, 80),
      questionText: String(r.questionText ?? '').slice(0, 300),
      options: Array.isArray(r.options)
        ? r.options.map((o) => String(o).slice(0, 200))
        : [],
      selectedIndex: Number(r.selectedIndex ?? 0),
      selectedOption: String(r.selectedOption ?? '').slice(0, 200),
      isCorrect: typeof r.isCorrect === 'boolean' ? r.isCorrect : undefined,
    }));

    try {
      let savedAttempt = null;
      const next = await updateUniverseData((draft) => {
        const session = ensureActiveSession(draft);
        savedAttempt = upsertQuizAttempt(draft.quizAttempts, {
          sessionId: session.id,
          quizType,
          responses: sanitized,
          status,
          score,
          total,
          percentage,
          resultSummary,
          idGenerator: () => makeId('quiz'),
        });

        if (status === 'completed') {
          draft.activityEvents.unshift({
            id: makeId('ev'),
            sessionId: session.id,
            type: 'quiz_completed',
            title:
              quizType === 'know_me'
                ? 'Completed Know-Me Quiz'
                : 'Completed Love Language Quiz',
            detail:
              resultSummary ||
              (score !== undefined ? `Scored ${score}/${total}` : 'Completed'),
            createdAt: new Date().toISOString(),
          });
        }
      });

      res.json({
        attempt: savedAttempt,
        activeSession: buildActiveSessionState(next),
      });
    } catch (error) {
      console.error('Failed saving quiz attempt:', error);
      res.status(500).json({ error: 'Unable to save quiz result.' });
    }
  });

  // Record individual repeatable activity event
  app.post('/api/interactions/event', requireUniverseAccess, async (req, res) => {
    const type = req.body?.type as ActivityEventType;
    const title = typeof req.body?.title === 'string' ? req.body.title.trim() : '';
    const detail = typeof req.body?.detail === 'string' ? req.body.detail.trim() : '';
    const itemKey =
      typeof req.body?.itemKey === 'string' ? req.body.itemKey.trim().slice(0, 80) : undefined;

    if (!ALLOWED_EVENT_TYPES.has(type) || !title) {
      res.status(400).json({ error: 'Invalid interaction event.' });
      return;
    }

    try {
      let createdEvent: ActivityEvent | null = null;
      const next = await updateUniverseData((draft) => {
        const session = ensureActiveSession(draft);
        createdEvent = {
          id: makeId('ev'),
          sessionId: session.id,
          type,
          title: title.slice(0, 140),
          detail: detail.slice(0, 400),
          itemKey,
          createdAt: new Date().toISOString(),
        };
        draft.activityEvents.unshift(createdEvent);
      });

      res.status(201).json({
        event: createdEvent,
        activeSession: buildActiveSessionState(next),
      });
    } catch (error) {
      console.error('Failed saving activity event:', error);
      res.status(500).json({ error: 'Unable to record activity.' });
    }
  });

  // Games started & completed (individual records preserved)
  app.post('/api/games/start', requireUniverseAccess, async (req, res) => {
    const gameId = typeof req.body?.gameId === 'string' ? req.body.gameId.trim() : '';
    const gameTitle =
      typeof req.body?.gameTitle === 'string' ? req.body.gameTitle.trim() : '';
    if (!gameId || !gameTitle) {
      res.status(400).json({ error: 'Game identifier required.' });
      return;
    }

    const now = new Date().toISOString();
    let created: GameRecord | null = null;
    const next = await updateUniverseData((draft) => {
      const session = ensureActiveSession(draft);
      created = {
        id: makeId('game'),
        sessionId: session.id,
        gameId: gameId.slice(0, 40),
        gameTitle: gameTitle.slice(0, 80),
        status: 'started',
        startedAt: now,
      };
      draft.gameRecords.unshift(created);
      draft.activityEvents.unshift({
        id: makeId('ev'),
        sessionId: session.id,
        type: 'game_started',
        title: `Started ${gameTitle.slice(0, 80)}`,
        detail: 'Began a new round.',
        itemKey: gameId.slice(0, 40),
        createdAt: now,
      });
    });

    res.status(201).json({
      record: created,
      activeSession: buildActiveSessionState(next),
    });
  });

  app.post('/api/games/complete', requireUniverseAccess, async (req, res) => {
    const recordId = typeof req.body?.recordId === 'string' ? req.body.recordId.trim() : '';
    const gameId = typeof req.body?.gameId === 'string' ? req.body.gameId.trim() : '';
    const gameTitle =
      typeof req.body?.gameTitle === 'string' ? req.body.gameTitle.trim() : '';
    const scoreLabel =
      typeof req.body?.scoreLabel === 'string' ? req.body.scoreLabel.trim() : '';
    if (!gameId || !gameTitle) {
      res.status(400).json({ error: 'Game details required.' });
      return;
    }

    const now = new Date().toISOString();
    let completedRec: GameRecord | null = null;
    const next = await updateUniverseData((draft) => {
      const session = ensureActiveSession(draft);
      const existing = recordId
        ? draft.gameRecords.find((g) => g.id === recordId && g.sessionId === session.id)
        : undefined;
      if (existing) {
        existing.status = 'completed';
        existing.scoreLabel = scoreLabel.slice(0, 80);
        existing.completedAt = now;
        completedRec = { ...existing };
      } else {
        completedRec = {
          id: makeId('game'),
          sessionId: session.id,
          gameId: gameId.slice(0, 40),
          gameTitle: gameTitle.slice(0, 80),
          status: 'completed',
          scoreLabel: scoreLabel.slice(0, 80),
          startedAt: now,
          completedAt: now,
        };
        draft.gameRecords.unshift(completedRec);
      }
      draft.activityEvents.unshift({
        id: makeId('ev'),
        sessionId: session.id,
        type: 'game_completed',
        title: `Completed ${gameTitle.slice(0, 80)}`,
        detail: scoreLabel ? `Result: ${scoreLabel.slice(0, 80)}` : 'Completed round.',
        itemKey: gameId.slice(0, 40),
        createdAt: now,
      });
    });

    res.json({
      record: completedRec,
      activeSession: buildActiveSessionState(next),
    });
  });

  // Mehak's "Start My Universe Again" — archives current session intact & starts fresh session
  app.post('/api/session/restart', requireUniverseAccess, async (_req, res) => {
    try {
      const next = await updateUniverseData((draft) => {
        archiveAndStartNewSession(draft, () => makeId('ev'));
      });
      res.json(toRecipientPayload(next));
    } catch (error) {
      console.error('Failed restarting universe session:', error);
      res.status(500).json({ error: 'Unable to restart experience.' });
    }
  });

  app.post('/api/answers', requireUniverseAccess, async (req, res) => {
    const source = req.body?.source;
    const prompt = typeof req.body?.prompt === 'string' ? req.body.prompt.trim() : '';
    const responseText =
      typeof req.body?.response === 'string' ? req.body.response.trim() : '';

    if (
      !['Finish the Sentence', 'Know Me Quiz', 'Love Language'].includes(source) ||
      !prompt ||
      !responseText
    ) {
      res.status(400).json({ error: 'Please write a response before submitting.' });
      return;
    }

    try {
      const current = await getUniverseData();
      if (!current.settings.allowSubmissions) {
        res.status(403).json({ error: 'Saving responses is currently paused in settings.' });
        return;
      }
      const entry: SubmittedAnswer = {
        id: makeId('ans'),
        source,
        prompt: prompt.slice(0, 300),
        response: responseText.slice(0, 1000),
        createdAt: new Date().toISOString(),
      };
      await updateUniverseData((draft) => {
        draft.submittedAnswers.unshift(entry);
      });
      res.status(201).json(entry);
    } catch (error) {
      console.error('Failed saving answer:', error);
      res.status(500).json({ error: 'Unable to save response.' });
    }
  });

  // Shared Bucket List
  app.post('/api/bucket', requireUniverseAccess, async (req, res) => {
    const title = typeof req.body?.title === 'string' ? req.body.title.trim() : '';
    const category =
      typeof req.body?.category === 'string' && req.body.category.trim()
        ? req.body.category.trim()
        : 'Adventure';
    if (!title) {
      res.status(400).json({ error: 'Please enter a bucket list activity.' });
      return;
    }
    const now = new Date().toISOString();
    const item: BucketItem = {
      id: makeId('bl'),
      title: title.slice(0, 180),
      category: category.slice(0, 40),
      completed: false,
      createdAt: now,
    };
    await updateUniverseData((draft) => {
      const session = ensureActiveSession(draft);
      draft.bucketList.unshift(item);
      draft.activityEvents.unshift({
        id: makeId('ev'),
        sessionId: session.id,
        type: 'bucket_added',
        title: 'Added Bucket List Activity',
        detail: `${item.title} (${item.category})`,
        itemKey: item.id,
        createdAt: now,
      });
    });
    res.status(201).json(item);
  });

  app.patch('/api/bucket/:id', requireUniverseAccess, async (req, res) => {
    const { id } = req.params;
    const completed = Boolean(req.body?.completed);
    let updated: BucketItem | null = null;
    await updateUniverseData((draft) => {
      const session = ensureActiveSession(draft);
      const target = draft.bucketList.find((b) => b.id === id);
      if (target) {
        target.completed = completed;
        updated = { ...target };
        draft.activityEvents.unshift({
          id: makeId('ev'),
          sessionId: session.id,
          type: 'bucket_completed',
          title: completed ? 'Completed Bucket List Item' : 'Reopened Bucket List Item',
          detail: target.title,
          itemKey: target.id,
          createdAt: new Date().toISOString(),
        });
      }
    });
    if (!updated) {
      res.status(404).json({ error: 'Bucket list item not found.' });
      return;
    }
    res.json(updated);
  });

  app.delete('/api/bucket/:id', requireUniverseAccess, async (req, res) => {
    const { id } = req.params;
    await updateUniverseData((draft) => {
      const session = ensureActiveSession(draft);
      const existing = draft.bucketList.find((b) => b.id === id);
      draft.bucketList = draft.bucketList.filter((b) => b.id !== id);
      if (existing) {
        draft.activityEvents.unshift({
          id: makeId('ev'),
          sessionId: session.id,
          type: 'bucket_removed',
          title: 'Removed Bucket List Item',
          detail: existing.title,
          itemKey: existing.id,
          createdAt: new Date().toISOString(),
        });
      }
    });
    res.json({ ok: true });
  });

  // Inside-Joke Vault additions
  app.post('/api/inside-jokes', requireUniverseAccess, async (req, res) => {
    const title = typeof req.body?.title === 'string' ? req.body.title.trim() : '';
    const clue = typeof req.body?.clue === 'string' ? req.body.clue.trim() : '';
    const story = typeof req.body?.story === 'string' ? req.body.story.trim() : '';
    if (!title || !story) {
      res.status(400).json({ error: 'Please provide both a title and the story.' });
      return;
    }
    const now = new Date().toISOString();
    const item: InsideJokeItem = {
      id: makeId('ij'),
      title: title.slice(0, 120),
      clue: (clue || 'Tap to remember').slice(0, 140),
      story: story.slice(0, 800),
      createdAt: now,
    };
    await updateUniverseData((draft) => {
      const session = ensureActiveSession(draft);
      draft.insideJokes.unshift(item);
      draft.activityEvents.unshift({
        id: makeId('ev'),
        sessionId: session.id,
        type: 'inside_joke_added',
        title: 'Sealed an Inside Joke',
        detail: `${item.title}: ${item.story.slice(0, 160)}`,
        itemKey: item.id,
        createdAt: now,
      });
    });
    res.status(201).json(item);
  });

  // Destinations (Where Should We Go?)
  app.post('/api/destinations', requireUniverseAccess, async (req, res) => {
    const name = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
    const category = req.body?.category;
    const vibeNote =
      typeof req.body?.vibeNote === 'string' ? req.body.vibeNote.trim() : '';
    const validCategories = ['Café', 'Restaurant', 'Park', 'Shopping', 'Travel'];
    if (!name || !validCategories.includes(category)) {
      res.status(400).json({ error: 'Please enter a destination name and category.' });
      return;
    }
    const item: DestinationIdea = {
      id: makeId('dest'),
      name: name.slice(0, 120),
      category,
      vibeNote: (vibeNote || 'Worth discovering together.').slice(0, 200),
    };
    await updateUniverseData((draft) => {
      const session = ensureActiveSession(draft);
      draft.destinations.unshift(item);
      draft.activityEvents.unshift({
        id: makeId('ev'),
        sessionId: session.id,
        type: 'date_idea_selected',
        title: 'Added Destination Idea',
        detail: `${item.name} (${item.category})`,
        itemKey: item.id,
        createdAt: new Date().toISOString(),
      });
    });
    res.status(201).json(item);
  });

  app.delete('/api/destinations/:id', requireUniverseAccess, async (req, res) => {
    const { id } = req.params;
    await updateUniverseData((draft) => {
      draft.destinations = draft.destinations.filter((d) => d.id !== id);
    });
    res.json({ ok: true });
  });

  // Date Planner
  app.post('/api/date-plans', requireUniverseAccess, async (req, res) => {
    const idea = typeof req.body?.idea === 'string' ? req.body.idea.trim() : '';
    const plannedDate =
      typeof req.body?.plannedDate === 'string' ? req.body.plannedDate.trim() : '';
    const notes = typeof req.body?.notes === 'string' ? req.body.notes.trim() : '';
    const status = ['Dreaming', 'Upcoming', 'Completed'].includes(req.body?.status)
      ? req.body.status
      : 'Upcoming';
    if (!idea) {
      res.status(400).json({ error: 'Please enter a date idea.' });
      return;
    }
    const plan: DatePlan = {
      id: makeId('dp'),
      idea: idea.slice(0, 180),
      plannedDate: plannedDate.slice(0, 30),
      notes: notes.slice(0, 400),
      status,
    };
    await updateUniverseData((draft) => {
      const session = ensureActiveSession(draft);
      draft.datePlans.unshift(plan);
      draft.activityEvents.unshift({
        id: makeId('ev'),
        sessionId: session.id,
        type: 'date_plan_saved',
        title: 'Saved Date Plan',
        detail: `${plan.idea}${plan.plannedDate ? ` (${plan.plannedDate})` : ''} · ${plan.status}`,
        itemKey: plan.id,
        createdAt: new Date().toISOString(),
      });
    });
    res.status(201).json(plan);
  });

  app.patch('/api/date-plans/:id', requireUniverseAccess, async (req, res) => {
    const { id } = req.params;
    const status = req.body?.status;
    if (!['Dreaming', 'Upcoming', 'Completed'].includes(status)) {
      res.status(400).json({ error: 'Invalid plan status.' });
      return;
    }
    let updated: DatePlan | null = null;
    await updateUniverseData((draft) => {
      const session = ensureActiveSession(draft);
      const plan = draft.datePlans.find((p) => p.id === id);
      if (plan) {
        plan.status = status;
        updated = { ...plan };
        draft.activityEvents.unshift({
          id: makeId('ev'),
          sessionId: session.id,
          type: 'date_plan_saved',
          title: 'Updated Date Plan Status',
          detail: `${plan.idea} -> ${status}`,
          itemKey: plan.id,
          createdAt: new Date().toISOString(),
        });
      }
    });
    if (!updated) {
      res.status(404).json({ error: 'Date plan not found.' });
      return;
    }
    res.json(updated);
  });

  app.delete('/api/date-plans/:id', requireUniverseAccess, async (req, res) => {
    const { id } = req.params;
    await updateUniverseData((draft) => {
      draft.datePlans = draft.datePlans.filter((p) => p.id !== id);
    });
    res.json({ ok: true });
  });

  // --- Protected Owner-Only Admin Endpoints ---

  app.get('/api/admin/data', requireAdminAuth, async (_req, res) => {
    const data = await getUniverseData();
    ensureActiveSession(data);
    res.json(data);
  });

  app.put('/api/admin/settings', requireAdminAuth, async (req, res) => {
    const incoming = req.body ?? {};
    const next = await updateUniverseData((draft) => {
      if (typeof incoming.welcomeHeading === 'string' && incoming.welcomeHeading.trim()) {
        draft.settings.welcomeHeading = incoming.welcomeHeading.trim().slice(0, 160);
      }
      if (typeof incoming.welcomeSubtitle === 'string' && incoming.welcomeSubtitle.trim()) {
        draft.settings.welcomeSubtitle = incoming.welcomeSubtitle.trim().slice(0, 320);
      }
      if (typeof incoming.accessHint === 'string') {
        draft.settings.accessHint = incoming.accessHint.trim().slice(0, 180);
      }
      if (typeof incoming.allowSubmissions === 'boolean') {
        draft.settings.allowSubmissions = incoming.allowSubmissions;
      }
      if (Array.isArray(incoming.categories)) {
        draft.settings.categories = incoming.categories
          .filter((c: unknown): c is string => typeof c === 'string' && c.trim().length > 0)
          .map((c: string) => c.trim().slice(0, 40));
      }
    });
    res.json(next.settings);
  });

  app.post('/api/admin/collection/:name', requireAdminAuth, async (req, res) => {
    const name = req.params.name as keyof UniverseData;
    if (!ALLOWED_ADMIN_COLLECTIONS.has(name)) {
      res.status(400).json({ error: 'Unsupported collection.' });
      return;
    }
    const payload = req.body;
    if (!payload || typeof payload !== 'object') {
      res.status(400).json({ error: 'Invalid item payload.' });
      return;
    }
    const newItem = {
      ...payload,
      id:
        typeof payload.id === 'string' && payload.id.trim()
          ? payload.id.trim()
          : makeId(String(name).slice(0, 4)),
    };
    const next = await updateUniverseData((draft) => {
      const list = draft[name] as unknown as Array<Record<string, unknown>>;
      list.unshift(newItem);
    });
    res.status(201).json({ item: newItem, items: next[name] });
  });

  app.put('/api/admin/collection/:name/:id', requireAdminAuth, async (req, res) => {
    const name = req.params.name as keyof UniverseData;
    const { id } = req.params;
    if (!ALLOWED_ADMIN_COLLECTIONS.has(name)) {
      res.status(400).json({ error: 'Unsupported collection.' });
      return;
    }
    const payload = req.body;
    if (!payload || typeof payload !== 'object') {
      res.status(400).json({ error: 'Invalid update payload.' });
      return;
    }
    let found = false;
    const next = await updateUniverseData((draft) => {
      const list = draft[name] as unknown as Array<{ id: string }>;
      const index = list.findIndex((entry) => entry.id === id);
      if (index !== -1) {
        list[index] = { ...list[index], ...payload, id };
        found = true;
      }
    });
    if (!found) {
      res.status(404).json({ error: 'Item not found.' });
      return;
    }
    res.json({ items: next[name] });
  });

  app.delete('/api/admin/collection/:name/:id', requireAdminAuth, async (req, res) => {
    const name = req.params.name as keyof UniverseData;
    const { id } = req.params;
    if (!ALLOWED_ADMIN_COLLECTIONS.has(name)) {
      res.status(400).json({ error: 'Unsupported collection.' });
      return;
    }
    const next = await updateUniverseData((draft) => {
      const list = draft[name] as unknown as Array<{ id: string }>;
      (draft[name] as unknown) = list.filter((entry) => entry.id !== id);
    });
    res.json({ items: next[name] });
  });

  app.delete('/api/admin/answers/:id', requireAdminAuth, async (req, res) => {
    const { id } = req.params;
    const next = await updateUniverseData((draft) => {
      draft.submittedAnswers = draft.submittedAnswers.filter((a) => a.id !== id);
      draft.answerRecords = draft.answerRecords.filter((a) => a.id !== id);
    });
    res.json({
      submittedAnswers: next.submittedAnswers,
      answerRecords: next.answerRecords,
    });
  });

  app.get('/api/admin/backup', requireAdminAuth, async (_req, res) => {
    const data = await getUniverseData();
    res.setHeader('Content-Type', 'application/json');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="mehaks-universe-backup-${new Date().toISOString().slice(0, 10)}.json"`
    );
    res.send(JSON.stringify(data, null, 2));
  });

  app.post('/api/admin/restore', requireAdminAuth, async (req, res) => {
    if (!validateUniverseBackup(req.body)) {
      res.status(400).json({ error: 'Backup JSON is missing required universe fields.' });
      return;
    }
    const restored = await replaceUniverseData(req.body);
    res.json(restored);
  });

  return app;
}
