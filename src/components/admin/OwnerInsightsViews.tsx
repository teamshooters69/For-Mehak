import { useMemo, useState } from 'react';
import {
  Activity,
  Archive,
  CalendarHeart,
  CheckSquare,
  Clock,
  Gamepad2,
  Gift,
  HelpCircle,
  History,
  MessageCircleHeart,
  Scale,
} from 'lucide-react';
import type {
  ActivityEventType,
  AnswerRecord,
  UniverseData,
  UniverseSession,
} from '../../types/universe';

export type InsightSection =
  | 'overview'
  | 'answers'
  | 'quizzes'
  | 'selections'
  | 'games'
  | 'surprises'
  | 'bucket_activity'
  | 'date_activity'
  | 'timeline'
  | 'sessions';

export const INSIGHT_TABS: Array<{
  id: InsightSection;
  label: string;
  icon: typeof Activity;
}> = [
  { id: 'overview', label: 'Overview', icon: Activity },
  { id: 'answers', label: 'Her Answers', icon: MessageCircleHeart },
  { id: 'quizzes', label: 'Quiz Results', icon: HelpCircle },
  { id: 'selections', label: 'Selected Options', icon: Scale },
  { id: 'games', label: 'Games & Scores', icon: Gamepad2 },
  { id: 'surprises', label: 'Surprise Activity', icon: Gift },
  { id: 'bucket_activity', label: 'Bucket List', icon: CheckSquare },
  { id: 'date_activity', label: 'Date Ideas', icon: CalendarHeart },
  { id: 'timeline', label: 'Activity Timeline', icon: Clock },
  { id: 'sessions', label: 'Previous Sessions', icon: Archive },
];

const SURPRISE_TYPES = new Set<ActivityEventType>([
  'heart_picked',
  'scratch_revealed',
  'envelope_opened',
  'mystery_box_opened',
  'wheel_spun',
]);

const BUCKET_TYPES = new Set<ActivityEventType>([
  'bucket_added',
  'bucket_completed',
  'bucket_removed',
]);

const DATE_TYPES = new Set<ActivityEventType>([
  'date_idea_selected',
  'date_plan_saved',
]);

function formatDateTime(iso?: string): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function categoryLabel(cat: AnswerRecord['category']): string {
  switch (cat) {
    case 'question':
      return 'Question of the Moment';
    case 'sentence':
      return 'Finish the Sentence';
    case 'would_you_rather':
      return 'Would You Rather';
    case 'red_green_flag':
      return 'Red or Green Flag';
    case 'truth_or_dare':
      return 'Truth or Dare';
    case 'guess_thinking':
      return "Guess What I'm Thinking";
  }
}

function eventTypeLabel(type: ActivityEventType): string {
  switch (type) {
    case 'answer_saved':
      return 'Answer Saved';
    case 'answer_changed':
      return 'Answer Changed';
    case 'quiz_completed':
      return 'Quiz Saved';
    case 'heart_picked':
      return 'Heart Picked';
    case 'tod_choice':
      return 'Truth or Dare';
    case 'scratch_revealed':
      return 'Scratch Card Revealed';
    case 'envelope_opened':
      return 'Envelope Opened';
    case 'mystery_box_opened':
      return 'Mystery Box Opened';
    case 'wheel_spun':
      return 'Spin Wheel Result';
    case 'game_started':
      return 'Game Started';
    case 'game_completed':
      return 'Game Completed';
    case 'bucket_added':
      return 'Bucket Item Added';
    case 'bucket_completed':
      return 'Bucket Item Updated';
    case 'bucket_removed':
      return 'Bucket Item Removed';
    case 'date_idea_selected':
      return 'Date Idea Selected';
    case 'date_plan_saved':
      return 'Date Plan Saved';
    case 'inside_joke_added':
      return 'Inside Joke Added';
    case 'universe_restarted':
      return 'Universe Restarted';
  }
}

function AnswerHistoryCard({
  record,
  sessionMap,
}: {
  record: AnswerRecord;
  sessionMap: Map<string, UniverseSession>;
}) {
  const sess = sessionMap.get(record.sessionId);
  const wasChanged = Boolean(record.previousAnswer);

  return (
    <article className="rounded-2xl border border-[#702B4C]/12 bg-[#FFF9F5] p-5">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className="font-semibold text-[#9274B8]">
          {categoryLabel(record.category)}
          {sess ? ` · Session #${sess.sessionNumber}` : ''}
          {sess?.status === 'archived' ? ' (Archived)' : ''}
        </span>
        <span className="font-mono text-[#6A525E] tabular-nums">
          Updated {formatDateTime(record.updatedAt)}
        </span>
      </div>

      <p className="mt-2 font-serif text-lg font-semibold text-[#702B4C]">
        {record.promptText}
      </p>

      {record.optionsPresented && record.optionsPresented.length > 0 && (
        <p className="mt-1.5 text-xs text-[#6A525E]">
          Options shown: {record.optionsPresented.join(' · ')}
        </p>
      )}

      <div className="mt-3 rounded-xl border border-[#702B4C]/12 bg-white p-3.5">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-800">
          Current Saved Answer
        </p>
        <p className="mt-1 text-sm font-medium text-[#2E1A24]">
          {record.currentAnswer}
        </p>
      </div>

      {wasChanged && (
        <div className="mt-2.5 rounded-xl bg-[#FAF1EA] p-3.5">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-[#702B4C]">
            <History className="h-3.5 w-3.5" />
            <span>
              Previous Answer ({record.changeHistory.length} total versions)
            </span>
          </div>
          <p className="mt-1 text-sm text-[#6A525E] line-through">
            {record.previousAnswer}
          </p>

          {record.changeHistory.length > 1 && (
            <details className="mt-2.5 text-xs text-[#6A525E]">
              <summary className="cursor-pointer font-semibold text-[#702B4C] hover:underline">
                View full change history ({record.changeHistory.length})
              </summary>
              <ol className="mt-2 space-y-1.5 border-t border-[#702B4C]/10 pt-2">
                {record.changeHistory.map((h, i) => (
                  <li
                    key={`${record.id}-hist-${i}`}
                    className="flex flex-wrap items-baseline justify-between gap-2"
                  >
                    <span className="text-[#2E1A24]">
                      v{i + 1}: {h.answer}
                    </span>
                    <span className="font-mono text-[11px] text-[#6A525E] tabular-nums">
                      {formatDateTime(h.changedAt)}
                    </span>
                  </li>
                ))}
              </ol>
            </details>
          )}
        </div>
      )}
    </article>
  );
}

export function OwnerInsightsViews({
  section,
  data,
  sessionFilter,
  onSelectSessionFilter,
  onSwitchSection,
}: {
  section: InsightSection;
  data: UniverseData;
  sessionFilter: string;
  onSelectSessionFilter: (sessionId: string) => void;
  onSwitchSection: (next: InsightSection) => void;
}) {
  const [timelineFilter, setTimelineFilter] = useState<'all' | ActivityEventType>('all');

  const sessionMap = useMemo(() => {
    const map = new Map<string, UniverseSession>();
    for (const s of data.sessions) map.set(s.id, s);
    return map;
  }, [data.sessions]);

  const activeSession = data.sessions.find((s) => s.status === 'active');

  const filteredAnswers = useMemo(
    () =>
      data.answerRecords.filter(
        (r) => sessionFilter === 'all' || r.sessionId === sessionFilter
      ),
    [data.answerRecords, sessionFilter]
  );

  const filteredQuizzes = useMemo(
    () =>
      data.quizAttempts.filter(
        (q) => sessionFilter === 'all' || q.sessionId === sessionFilter
      ),
    [data.quizAttempts, sessionFilter]
  );

  const filteredGames = useMemo(
    () =>
      data.gameRecords.filter(
        (g) => sessionFilter === 'all' || g.sessionId === sessionFilter
      ),
    [data.gameRecords, sessionFilter]
  );

  const filteredEvents = useMemo(
    () =>
      data.activityEvents.filter(
        (e) => sessionFilter === 'all' || e.sessionId === sessionFilter
      ),
    [data.activityEvents, sessionFilter]
  );

  const writtenAnswers = filteredAnswers.filter(
    (a) => a.category === 'question' || a.category === 'sentence'
  );
  const optionSelections = filteredAnswers.filter(
    (a) =>
      a.category === 'would_you_rather' ||
      a.category === 'red_green_flag' ||
      a.category === 'truth_or_dare' ||
      a.category === 'guess_thinking'
  );
  const surpriseEvents = filteredEvents.filter((e) => SURPRISE_TYPES.has(e.type));
  const bucketEvents = filteredEvents.filter((e) => BUCKET_TYPES.has(e.type));
  const dateEvents = filteredEvents.filter((e) => DATE_TYPES.has(e.type));

  const changedAnswersCount = filteredAnswers.filter(
    (a) => Boolean(a.previousAnswer)
  ).length;
  const completedQuizzesCount = filteredQuizzes.filter(
    (q) => q.status === 'completed'
  ).length;
  const completedGamesCount = filteredGames.filter(
    (g) => g.status === 'completed'
  ).length;
  const archivedSessionsCount = data.sessions.filter(
    (s) => s.status === 'archived'
  ).length;

  // 1. Overview
  if (section === 'overview') {
    const kpis = [
      {
        label: 'Active Session',
        value: activeSession ? `#${activeSession.sessionNumber}` : '#1',
        sub: `${archivedSessionsCount} archived restart${archivedSessionsCount === 1 ? '' : 's'}`,
        onClick: () => onSwitchSection('sessions'),
      },
      {
        label: 'Saved Responses',
        value: String(filteredAnswers.length),
        sub: `${changedAnswersCount} changed at least once`,
        onClick: () => onSwitchSection('answers'),
      },
      {
        label: 'Quizzes Saved',
        value: String(completedQuizzesCount),
        sub: `${filteredQuizzes.length} total attempt${filteredQuizzes.length === 1 ? '' : 's'}`,
        onClick: () => onSwitchSection('quizzes'),
      },
      {
        label: 'Games Completed',
        value: String(completedGamesCount),
        sub: `${filteredGames.length} game${filteredGames.length === 1 ? '' : 's'} started`,
        onClick: () => onSwitchSection('games'),
      },
      {
        label: 'Surprises Opened',
        value: String(surpriseEvents.length),
        sub: 'Hearts, cards, envelopes & wheel',
        onClick: () => onSwitchSection('surprises'),
      },
      {
        label: 'Recorded Events',
        value: String(filteredEvents.length),
        sub: 'Real interactions only',
        onClick: () => onSwitchSection('timeline'),
      },
    ];

    return (
      <div className="space-y-6">
        <div>
          <h2 className="font-serif text-2xl font-semibold text-[#702B4C] sm:text-3xl">
            Owner Overview
          </h2>
          <p className="mt-1 text-xs text-[#6A525E]">
            Live summary of Mehak&apos;s real saved selections, answers, quiz
            scores, games, and session history.
          </p>
        </div>

        <div className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-3">
          {kpis.map((card) => (
            <button
              key={card.label}
              type="button"
              onClick={card.onClick}
              className="rounded-2xl border border-[#702B4C]/12 bg-[#FFF9F5] p-5 text-left transition-colors hover:border-[#702B4C]/35 hover:bg-[#FFF0F5]/60"
            >
              <p className="text-xs font-semibold text-[#9274B8]">{card.label}</p>
              <p className="mt-2 font-mono text-3xl font-semibold text-[#702B4C] tabular-nums">
                {card.value}
              </p>
              <p className="mt-1 text-xs text-[#6A525E]">{card.sub}</p>
            </button>
          ))}
        </div>

        <div className="border-t border-[#702B4C]/10 pt-5">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-serif text-xl font-semibold text-[#702B4C]">
              Latest Activity
            </h3>
            <button
              type="button"
              onClick={() => onSwitchSection('timeline')}
              className="text-xs font-semibold text-[#9274B8] hover:text-[#702B4C]"
            >
              View full timeline
            </button>
          </div>

          {filteredEvents.length === 0 ? (
            <p className="mt-3 rounded-2xl bg-[#FFF9F5] p-5 text-sm text-[#6A525E]">
              No interactions recorded in this session filter yet. Real actions
              will appear here the moment Mehak saves an answer, plays a game,
              or opens a surprise.
            </p>
          ) : (
            <ul className="mt-3 divide-y divide-[#702B4C]/10">
              {filteredEvents.slice(0, 8).map((ev) => {
                const sess = sessionMap.get(ev.sessionId);
                return (
                  <li
                    key={ev.id}
                    className="flex flex-col justify-between gap-1 py-3 sm:flex-row sm:items-center"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-[#9274B8]">
                        {eventTypeLabel(ev.type)}
                        {sess ? ` · Session #${sess.sessionNumber}` : ''}
                      </p>
                      <p className="text-sm font-medium text-[#2E1A24]">
                        {ev.title}
                      </p>
                      {ev.detail && (
                        <p className="text-xs text-[#6A525E]">{ev.detail}</p>
                      )}
                    </div>
                    <span className="shrink-0 font-mono text-xs text-[#6A525E] tabular-nums">
                      {formatDateTime(ev.createdAt)}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    );
  }

  // 2. Her Answers (Written Questions & Finish the Sentence)
  if (section === 'answers') {
    return (
      <div className="space-y-5">
        <div>
          <h2 className="font-serif text-2xl font-semibold text-[#702B4C]">
            Her Written Answers ({writtenAnswers.length})
          </h2>
          <p className="mt-1 text-xs text-[#6A525E]">
            Shows current saved answers for Question of the Moment and Finish
            the Sentence, along with previous answers and timestamps whenever
            changed.
          </p>
        </div>

        {writtenAnswers.length === 0 ? (
          <p className="rounded-2xl bg-[#FFF9F5] p-6 text-sm text-[#6A525E]">
            No written question or sentence answers saved in this view yet.
          </p>
        ) : (
          <div className="space-y-3.5">
            {writtenAnswers.map((rec) => (
              <AnswerHistoryCard
                key={rec.id}
                record={rec}
                sessionMap={sessionMap}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // 3. Quiz Results
  if (section === 'quizzes') {
    return (
      <div className="space-y-5">
        <div>
          <h2 className="font-serif text-2xl font-semibold text-[#702B4C]">
            Quiz Results ({filteredQuizzes.length})
          </h2>
          <p className="mt-1 text-xs text-[#6A525E]">
            Full breakdown of options presented, options selected, previous
            options if changed, scores, and completion timestamps.
          </p>
        </div>

        {filteredQuizzes.length === 0 ? (
          <p className="rounded-2xl bg-[#FFF9F5] p-6 text-sm text-[#6A525E]">
            No quiz attempts recorded in this view yet.
          </p>
        ) : (
          <div className="space-y-4">
            {filteredQuizzes.map((attempt) => {
              const sess = sessionMap.get(attempt.sessionId);
              return (
                <article
                  key={attempt.id}
                  className="rounded-2xl border border-[#702B4C]/12 bg-[#FFF9F5] p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-xs font-semibold text-[#9274B8]">
                        {attempt.quizType === 'know_me'
                          ? 'How Well Do You Know Me?'
                          : 'Love Language Quiz'}
                        {sess ? ` · Session #${sess.sessionNumber}` : ''}
                        {' · '}
                        {attempt.status === 'completed'
                          ? 'Completed'
                          : 'In Progress'}
                      </p>
                      <h3 className="mt-1 font-serif text-2xl font-semibold text-[#702B4C]">
                        {attempt.resultSummary ||
                          (attempt.score !== undefined
                            ? `${attempt.score} / ${attempt.total}`
                            : 'Saved progress')}
                      </h3>
                    </div>
                    <span className="font-mono text-xs text-[#6A525E] tabular-nums">
                      {formatDateTime(attempt.updatedAt)}
                    </span>
                  </div>

                  <div className="mt-4 space-y-2.5 border-t border-[#702B4C]/10 pt-4">
                    {attempt.responses.map((resp, idx) => (
                      <div
                        key={`${attempt.id}-${resp.questionId}`}
                        className="rounded-xl bg-white p-3.5"
                      >
                        <p className="text-xs font-semibold text-[#702B4C]">
                          Q{idx + 1}. {resp.questionText}
                        </p>
                        <p className="mt-1 text-xs text-[#6A525E]">
                          Options: {resp.options.join(' · ')}
                        </p>
                        <p className="mt-1.5 text-sm font-medium text-[#2E1A24]">
                          Selected: {resp.selectedOption}
                          {resp.isCorrect !== undefined
                            ? resp.isCorrect
                              ? ' (Correct)'
                              : ' (Missed)'
                            : ''}
                        </p>
                        {resp.previousOption && (
                          <p className="mt-1 text-xs text-[#702B4C]">
                            Previously selected:{' '}
                            <span className="line-through">
                              {resp.previousOption}
                            </span>
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // 4. Selected Options (Would You Rather, Red/Green Flag, Truth/Dare, Guess)
  if (section === 'selections') {
    return (
      <div className="space-y-5">
        <div>
          <h2 className="font-serif text-2xl font-semibold text-[#702B4C]">
            Selected Options ({optionSelections.length})
          </h2>
          <p className="mt-1 text-xs text-[#6A525E]">
            Tracks Would You Rather choices, Red Flag or Green Flag verdicts,
            Truth or Dare replies, and Mind-Reading results — including changes.
          </p>
        </div>

        {optionSelections.length === 0 ? (
          <p className="rounded-2xl bg-[#FFF9F5] p-6 text-sm text-[#6A525E]">
            No interactive selections saved in this view yet.
          </p>
        ) : (
          <div className="space-y-3.5">
            {optionSelections.map((rec) => (
              <AnswerHistoryCard
                key={rec.id}
                record={rec}
                sessionMap={sessionMap}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  // 5. Games & Scores
  if (section === 'games') {
    return (
      <div className="space-y-5">
        <div>
          <h2 className="font-serif text-2xl font-semibold text-[#702B4C]">
            Games &amp; Scores ({filteredGames.length})
          </h2>
          <p className="mt-1 text-xs text-[#6A525E]">
            Every individual game run started or completed is preserved with its
            score and timestamps.
          </p>
        </div>

        {filteredGames.length === 0 ? (
          <p className="rounded-2xl bg-[#FFF9F5] p-6 text-sm text-[#6A525E]">
            No games started or completed in this view yet.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-[#702B4C]/12">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-[#702B4C]/10 bg-[#FAF1EA] text-xs font-semibold text-[#702B4C]">
                <tr>
                  <th className="px-4 py-3">Game</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Score / Result</th>
                  <th className="px-4 py-3">Session</th>
                  <th className="px-4 py-3">Date &amp; Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#702B4C]/10 bg-white">
                {filteredGames.map((g) => {
                  const sess = sessionMap.get(g.sessionId);
                  return (
                    <tr key={g.id}>
                      <td className="px-4 py-3 font-semibold text-[#2E1A24]">
                        {g.gameTitle}
                      </td>
                      <td className="px-4 py-3 text-xs font-medium text-[#6A525E]">
                        {g.status === 'completed' ? 'Completed' : 'Started'}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs font-semibold text-[#702B4C] tabular-nums">
                        {g.scoreLabel || 'In progress'}
                      </td>
                      <td className="px-4 py-3 text-xs text-[#6A525E] tabular-nums">
                        {sess ? `#${sess.sessionNumber}` : '—'}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-[#6A525E] tabular-nums">
                        {formatDateTime(g.completedAt || g.startedAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }

  // 6. Surprise Activity
  if (section === 'surprises') {
    return (
      <div className="space-y-5">
        <div>
          <h2 className="font-serif text-2xl font-semibold text-[#702B4C]">
            Surprise Activity ({surpriseEvents.length})
          </h2>
          <p className="mt-1 text-xs text-[#6A525E]">
            Every heart picked, scratch card revealed, envelope unsealed,
            mystery box opened, and spin-wheel result.
          </p>
        </div>

        {surpriseEvents.length === 0 ? (
          <p className="rounded-2xl bg-[#FFF9F5] p-6 text-sm text-[#6A525E]">
            No surprises opened in this view yet.
          </p>
        ) : (
          <ul className="space-y-2.5">
            {surpriseEvents.map((ev) => {
              const sess = sessionMap.get(ev.sessionId);
              return (
                <li
                  key={ev.id}
                  className="rounded-2xl border border-[#702B4C]/10 bg-[#FFF9F5] p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="font-semibold text-[#9274B8]">
                      {eventTypeLabel(ev.type)}
                      {sess ? ` · Session #${sess.sessionNumber}` : ''}
                    </span>
                    <span className="font-mono text-[#6A525E] tabular-nums">
                      {formatDateTime(ev.createdAt)}
                    </span>
                  </div>
                  <p className="mt-1 text-sm font-semibold text-[#702B4C]">
                    {ev.title}
                  </p>
                  {ev.detail && (
                    <p className="mt-0.5 text-xs text-[#2E1A24]">{ev.detail}</p>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    );
  }

  // 7. Bucket List Activity
  if (section === 'bucket_activity') {
    const completed = data.bucketList.filter((b) => b.completed).length;
    return (
      <div className="space-y-6">
        <div>
          <h2 className="font-serif text-2xl font-semibold text-[#702B4C]">
            Bucket List Overview
          </h2>
          <p className="mt-1 text-xs text-[#6A525E] tabular-nums">
            {completed} of {data.bucketList.length} items completed ·{' '}
            {bucketEvents.length} recorded actions
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2.5">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-[#9274B8]">
              Current Bucket List Items
            </h3>
            {data.bucketList.length === 0 ? (
              <p className="text-sm text-[#6A525E]">No items yet.</p>
            ) : (
              <ul className="divide-y divide-[#702B4C]/10 rounded-2xl border border-[#702B4C]/10 bg-[#FFF9F5] px-4">
                {data.bucketList.map((b) => (
                  <li key={b.id} className="py-3">
                    <p
                      className={`text-sm font-medium ${
                        b.completed
                          ? 'text-[#6A525E] line-through'
                          : 'text-[#2E1A24]'
                      }`}
                    >
                      {b.title}
                    </p>
                    <p className="text-xs text-[#9274B8]">
                      {b.category} · {b.completed ? 'Completed' : 'To Do'}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="space-y-2.5">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-[#9274B8]">
              Bucket List Activity Log
            </h3>
            {bucketEvents.length === 0 ? (
              <p className="rounded-2xl bg-[#FFF9F5] p-4 text-sm text-[#6A525E]">
                No bucket list additions, completions, or removals recorded in
                this filter yet.
              </p>
            ) : (
              <ul className="space-y-2">
                {bucketEvents.map((ev) => (
                  <li
                    key={ev.id}
                    className="rounded-2xl border border-[#702B4C]/10 bg-[#FFF9F5] p-3.5"
                  >
                    <p className="text-xs font-semibold text-[#9274B8]">
                      {eventTypeLabel(ev.type)} · {formatDateTime(ev.createdAt)}
                    </p>
                    <p className="mt-0.5 text-sm font-medium text-[#2E1A24]">
                      {ev.title}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 8. Date Ideas Activity
  if (section === 'date_activity') {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="font-serif text-2xl font-semibold text-[#702B4C]">
            Date Ideas &amp; Selections
          </h2>
          <p className="mt-1 text-xs text-[#6A525E]">
            Saved date plans, destination ideas, and roulette or random spot
            selections.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="space-y-2.5">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-[#9274B8]">
              Saved Date Plans ({data.datePlans.length})
            </h3>
            {data.datePlans.length === 0 ? (
              <p className="rounded-2xl bg-[#FFF9F5] p-4 text-sm text-[#6A525E]">
                No date plans saved yet.
              </p>
            ) : (
              <ul className="space-y-2">
                {data.datePlans.map((p) => (
                  <li
                    key={p.id}
                    className="rounded-2xl border border-[#702B4C]/10 bg-[#FFF9F5] p-3.5"
                  >
                    <p className="text-xs font-semibold text-[#9274B8]">
                      {p.status}
                      {p.plannedDate ? ` · ${p.plannedDate}` : ''}
                    </p>
                    <p className="mt-0.5 text-sm font-semibold text-[#702B4C]">
                      {p.idea}
                    </p>
                    {p.notes && (
                      <p className="mt-0.5 text-xs text-[#6A525E]">{p.notes}</p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="space-y-2.5">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-[#9274B8]">
              Date Idea Selections ({dateEvents.length})
            </h3>
            {dateEvents.length === 0 ? (
              <p className="rounded-2xl bg-[#FFF9F5] p-4 text-sm text-[#6A525E]">
                No random destination picks, roulette rolls, or new plans logged
                in this filter yet.
              </p>
            ) : (
              <ul className="space-y-2">
                {dateEvents.map((ev) => (
                  <li
                    key={ev.id}
                    className="rounded-2xl border border-[#702B4C]/10 bg-[#FFF9F5] p-3.5"
                  >
                    <p className="text-xs font-semibold text-[#9274B8]">
                      {eventTypeLabel(ev.type)} · {formatDateTime(ev.createdAt)}
                    </p>
                    <p className="mt-0.5 text-sm font-medium text-[#2E1A24]">
                      {ev.title}
                    </p>
                    {ev.detail && (
                      <p className="text-xs text-[#6A525E]">{ev.detail}</p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 9. Activity Timeline
  if (section === 'timeline') {
    const visibleEvents =
      timelineFilter === 'all'
        ? filteredEvents
        : filteredEvents.filter((e) => e.type === timelineFilter);

    return (
      <div className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-serif text-2xl font-semibold text-[#702B4C]">
              Activity Timeline ({visibleEvents.length})
            </h2>
            <p className="mt-1 text-xs text-[#6A525E]">
              Chronological log of every real saved interaction.
            </p>
          </div>
          <select
            aria-label="Filter timeline by event type"
            value={timelineFilter}
            onChange={(e) =>
              setTimelineFilter(e.target.value as 'all' | ActivityEventType)
            }
            className="min-h-[42px] rounded-xl border border-[#702B4C]/20 bg-[#FFF9F5] px-3 text-xs font-semibold text-[#2E1A24]"
          >
            <option value="all">All Event Types</option>
            <option value="answer_saved">Answer Saved</option>
            <option value="answer_changed">Answer Changed</option>
            <option value="quiz_completed">Quiz Completed</option>
            <option value="heart_picked">Heart Picked</option>
            <option value="tod_choice">Truth or Dare</option>
            <option value="scratch_revealed">Scratch Card Revealed</option>
            <option value="envelope_opened">Envelope Opened</option>
            <option value="mystery_box_opened">Mystery Box Opened</option>
            <option value="wheel_spun">Wheel Spun</option>
            <option value="game_started">Game Started</option>
            <option value="game_completed">Game Completed</option>
            <option value="bucket_added">Bucket Added</option>
            <option value="bucket_completed">Bucket Completed</option>
            <option value="date_idea_selected">Date Idea Selected</option>
            <option value="date_plan_saved">Date Plan Saved</option>
            <option value="inside_joke_added">Inside Joke Added</option>
            <option value="universe_restarted">Universe Restarted</option>
          </select>
        </div>

        {visibleEvents.length === 0 ? (
          <p className="rounded-2xl bg-[#FFF9F5] p-6 text-sm text-[#6A525E]">
            No matching interactions recorded yet.
          </p>
        ) : (
          <ol className="divide-y divide-[#702B4C]/10 rounded-2xl border border-[#702B4C]/10 bg-[#FFF9F5] px-4">
            {visibleEvents.map((ev) => {
              const sess = sessionMap.get(ev.sessionId);
              return (
                <li
                  key={ev.id}
                  className="flex flex-col justify-between gap-1 py-3.5 sm:flex-row sm:items-start"
                >
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-[#9274B8]">
                      {eventTypeLabel(ev.type)}
                      {sess ? ` · Session #${sess.sessionNumber}` : ''}
                    </p>
                    <p className="mt-0.5 text-sm font-medium text-[#2E1A24]">
                      {ev.title}
                    </p>
                    {ev.detail && (
                      <p className="mt-0.5 text-xs text-[#6A525E]">
                        {ev.detail}
                      </p>
                    )}
                  </div>
                  <span className="shrink-0 font-mono text-xs text-[#6A525E] tabular-nums">
                    {formatDateTime(ev.createdAt)}
                  </span>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    );
  }

  // 10. Previous Sessions (Active vs Archived Sessions from "Start My Universe Again")
  const orderedSessions = [...data.sessions].sort(
    (a, b) => b.sessionNumber - a.sessionNumber
  );

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-serif text-2xl font-semibold text-[#702B4C]">
          Sessions &amp; Restart History ({orderedSessions.length})
        </h2>
        <p className="mt-1 text-xs text-[#6A525E]">
          Every time Mehak chooses &ldquo;Start My Universe Again&rdquo;, her
          previous session is safely archived here without deleting any records.
        </p>
      </div>

      <div className="space-y-3.5">
        {orderedSessions.map((sess) => {
          const ansCount = data.answerRecords.filter(
            (r) => r.sessionId === sess.id
          ).length;
          const quizCount = data.quizAttempts.filter(
            (q) => q.sessionId === sess.id
          ).length;
          const gameCount = data.gameRecords.filter(
            (g) => g.sessionId === sess.id
          ).length;
          const eventCount = data.activityEvents.filter(
            (e) => e.sessionId === sess.id
          ).length;
          const isFiltered = sessionFilter === sess.id;

          return (
            <article
              key={sess.id}
              className={`rounded-2xl border p-5 ${
                sess.status === 'active'
                  ? 'border-[#702B4C]/30 bg-[#FFF0F5]/65'
                  : 'border-[#702B4C]/12 bg-[#FFF9F5]'
              }`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold text-[#9274B8]">
                    {sess.status === 'active'
                      ? 'Current Active Session'
                      : 'Archived Session'}
                  </p>
                  <h3 className="mt-0.5 font-serif text-2xl font-semibold text-[#702B4C]">
                    Session #{sess.sessionNumber}
                  </h3>
                  <p className="mt-1 font-mono text-xs text-[#6A525E] tabular-nums">
                    Started: {formatDateTime(sess.startedAt)}
                    {sess.endedAt
                      ? ` · Archived: ${formatDateTime(sess.endedAt)}`
                      : ''}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onSelectSessionFilter(isFiltered ? 'all' : sess.id);
                    onSwitchSection('overview');
                  }}
                  className="min-h-[42px] rounded-xl bg-[#702B4C] px-4 py-2 text-xs font-semibold text-[#FFF9F5] hover:bg-[#531D38]"
                >
                  {isFiltered
                    ? 'Show All Sessions'
                    : `Inspect Session #${sess.sessionNumber}`}
                </button>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2.5 border-t border-[#702B4C]/10 pt-3.5 text-xs sm:grid-cols-4">
                <div>
                  <span className="text-[#6A525E]">Saved Answers</span>
                  <p className="font-mono text-base font-semibold text-[#702B4C] tabular-nums">
                    {ansCount}
                  </p>
                </div>
                <div>
                  <span className="text-[#6A525E]">Quizzes</span>
                  <p className="font-mono text-base font-semibold text-[#702B4C] tabular-nums">
                    {quizCount}
                  </p>
                </div>
                <div>
                  <span className="text-[#6A525E]">Games Played</span>
                  <p className="font-mono text-base font-semibold text-[#702B4C] tabular-nums">
                    {gameCount}
                  </p>
                </div>
                <div>
                  <span className="text-[#6A525E]">Total Events</span>
                  <p className="font-mono text-base font-semibold text-[#702B4C] tabular-nums">
                    {eventCount}
                  </p>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
