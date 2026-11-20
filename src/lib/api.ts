import type {
  ActiveSessionState,
  ActivityEvent,
  ActivityEventType,
  AnswerCategory,
  AnswerRecord,
  BucketItem,
  DatePlan,
  DatePlanStatus,
  DestinationCategory,
  DestinationIdea,
  GameRecord,
  InsideJokeItem,
  QuizAttemptRecord,
  RecipientUniversePayload,
  SessionInfo,
  SiteSettings,
  SubmittedAnswer,
  UniverseData,
} from '../types/universe';

// Strictly RAM-only fallback tokens (never written to localStorage/sessionStorage/document.cookie)
// so embedded cross-site iframes still unlock cleanly even in browsers that block third-party cookies.
let memoryUniverseSession: string | null = null;
let memoryAdminSession: string | null = null;

async function request<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = new Headers(options.headers);
  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (memoryUniverseSession && !headers.has('X-Universe-Session')) {
    headers.set('X-Universe-Session', memoryUniverseSession);
  }
  if (memoryAdminSession && !headers.has('X-Admin-Session')) {
    headers.set('X-Admin-Session', memoryAdminSession);
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (!response.ok) {
    let message = 'Something went wrong. Please try again.';
    try {
      const errData = (await response.json()) as { error?: string };
      if (errData?.error) message = errData.error;
    } catch {
      // Keep default message
    }
    throw new Error(message);
  }

  return (await response.json()) as T;
}

export const api = {
  getSession(): Promise<SessionInfo> {
    return request<SessionInfo>('/api/auth/session');
  },

  async unlockUniverse(code: string): Promise<RecipientUniversePayload> {
    const res = await request<{
      ok: boolean;
      universe: RecipientUniversePayload;
      sessionToken?: string;
    }>('/api/auth/unlock', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
    if (res.sessionToken) {
      memoryUniverseSession = res.sessionToken;
    }
    return res.universe;
  },

  async lockUniverse(): Promise<void> {
    memoryUniverseSession = null;
    await request<{ ok: boolean }>('/api/auth/lock', { method: 'POST' });
  },

  async adminLogin(username: string, password: string): Promise<void> {
    const res = await request<{
      ok: boolean;
      adminSessionToken?: string;
      universeSessionToken?: string;
    }>('/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    if (res.adminSessionToken) {
      memoryAdminSession = res.adminSessionToken;
    }
    if (res.universeSessionToken) {
      memoryUniverseSession = res.universeSessionToken;
    }
  },

  async adminLogout(): Promise<void> {
    memoryAdminSession = null;
    await request<{ ok: boolean }>('/api/admin/logout', { method: 'POST' });
  },

  getUniverse(): Promise<RecipientUniversePayload> {
    return request<RecipientUniversePayload>('/api/universe');
  },

  saveAnswer(payload: {
    category: AnswerCategory;
    itemKey: string;
    promptText: string;
    optionsPresented?: string[];
    answer: string;
  }): Promise<{
    record: AnswerRecord;
    changed: boolean;
    activeSession: ActiveSessionState;
  }> {
    return request('/api/interactions/answer', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  saveQuizAttempt(payload: {
    quizType: 'know_me' | 'love_language';
    status: 'in_progress' | 'completed';
    responses: Array<{
      questionId: string;
      questionText: string;
      options: string[];
      selectedIndex: number;
      selectedOption: string;
      isCorrect?: boolean;
    }>;
    score?: number;
    total: number;
    percentage?: number;
    resultSummary?: string;
  }): Promise<{
    attempt: QuizAttemptRecord;
    activeSession: ActiveSessionState;
  }> {
    return request('/api/interactions/quiz', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  logActivityEvent(payload: {
    type: ActivityEventType;
    title: string;
    detail: string;
    itemKey?: string;
  }): Promise<{
    event: ActivityEvent;
    activeSession: ActiveSessionState;
  }> {
    return request('/api/interactions/event', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  startGame(
    gameId: string,
    gameTitle: string
  ): Promise<{ record: GameRecord; activeSession: ActiveSessionState }> {
    return request('/api/games/start', {
      method: 'POST',
      body: JSON.stringify({ gameId, gameTitle }),
    });
  },

  completeGame(payload: {
    recordId?: string;
    gameId: string;
    gameTitle: string;
    scoreLabel: string;
  }): Promise<{ record: GameRecord; activeSession: ActiveSessionState }> {
    return request('/api/games/complete', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  restartSession(): Promise<RecipientUniversePayload> {
    return request<RecipientUniversePayload>('/api/session/restart', {
      method: 'POST',
    });
  },

  submitAnswer(payload: {
    source: 'Finish the Sentence' | 'Know Me Quiz' | 'Love Language';
    prompt: string;
    response: string;
  }): Promise<SubmittedAnswer> {
    return request<SubmittedAnswer>('/api/answers', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  addBucketItem(title: string, category: string): Promise<BucketItem> {
    return request<BucketItem>('/api/bucket', {
      method: 'POST',
      body: JSON.stringify({ title, category }),
    });
  },

  toggleBucketItem(id: string, completed: boolean): Promise<BucketItem> {
    return request<BucketItem>(`/api/bucket/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify({ completed }),
    });
  },

  deleteBucketItem(id: string): Promise<{ ok: boolean }> {
    return request<{ ok: boolean }>(`/api/bucket/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  },

  addInsideJoke(payload: {
    title: string;
    clue: string;
    story: string;
  }): Promise<InsideJokeItem> {
    return request<InsideJokeItem>('/api/inside-jokes', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  addDestination(payload: {
    name: string;
    category: DestinationCategory;
    vibeNote: string;
  }): Promise<DestinationIdea> {
    return request<DestinationIdea>('/api/destinations', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  deleteDestination(id: string): Promise<{ ok: boolean }> {
    return request<{ ok: boolean }>(`/api/destinations/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  },

  addDatePlan(payload: {
    idea: string;
    plannedDate: string;
    notes: string;
    status: DatePlanStatus;
  }): Promise<DatePlan> {
    return request<DatePlan>('/api/date-plans', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  updateDatePlanStatus(id: string, status: DatePlanStatus): Promise<DatePlan> {
    return request<DatePlan>(`/api/date-plans/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  deleteDatePlan(id: string): Promise<{ ok: boolean }> {
    return request<{ ok: boolean }>(`/api/date-plans/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  },

  // --- Admin ---

  getAdminData(): Promise<UniverseData> {
    return request<UniverseData>('/api/admin/data');
  },

  updateSettings(settings: Partial<SiteSettings>): Promise<SiteSettings> {
    return request<SiteSettings>('/api/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  },

  adminCreateItem<T>(collection: string, item: Record<string, unknown>): Promise<{ item: T; items: T[] }> {
    return request<{ item: T; items: T[] }>(
      `/api/admin/collection/${encodeURIComponent(collection)}`,
      {
        method: 'POST',
        body: JSON.stringify(item),
      }
    );
  },

  adminUpdateItem<T>(
    collection: string,
    id: string,
    item: Record<string, unknown>
  ): Promise<{ items: T[] }> {
    return request<{ items: T[] }>(
      `/api/admin/collection/${encodeURIComponent(collection)}/${encodeURIComponent(id)}`,
      {
        method: 'PUT',
        body: JSON.stringify(item),
      }
    );
  },

  adminDeleteItem<T>(collection: string, id: string): Promise<{ items: T[] }> {
    return request<{ items: T[] }>(
      `/api/admin/collection/${encodeURIComponent(collection)}/${encodeURIComponent(id)}`,
      {
        method: 'DELETE',
      }
    );
  },

  adminDeleteAnswer(id: string): Promise<{ submittedAnswers: SubmittedAnswer[] }> {
    return request<{ submittedAnswers: SubmittedAnswer[] }>(
      `/api/admin/answers/${encodeURIComponent(id)}`,
      { method: 'DELETE' }
    );
  },

  adminRestoreBackup(data: UniverseData): Promise<UniverseData> {
    return request<UniverseData>('/api/admin/restore', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async downloadBackup(): Promise<UniverseData> {
    return request<UniverseData>('/api/admin/backup');
  },
};
