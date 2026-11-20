import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  Brain,
  Grid2x2,
  Hash,
  Search,
  SpellCheck,
  Zap,
} from 'lucide-react';
import { api } from '../lib/api';
import {
  CodeBreakerGame,
  EmojiDetectiveGame,
  MemoryMatchGame,
  MindTrapGame,
  ReactionRushGame,
  WordScrambleGame,
} from './games/AllMiniGames';
import type { ActiveSessionState } from '../types/universe';

type GameId =
  | 'memory'
  | 'reaction'
  | 'scramble'
  | 'emoji'
  | 'code'
  | 'riddles';

const GAMES: Array<{
  id: GameId;
  title: string;
  tagline: string;
  category: string;
  accent: string;
  icon: typeof Grid2x2;
}> = [
  {
    id: 'memory',
    title: 'Memory Match',
    tagline: 'Uncover and match all six celestial pairs in the fewest moves.',
    category: 'Memory',
    accent: 'bg-[#FFF0F5] text-[#702B4C]',
    icon: Grid2x2,
  },
  {
    id: 'reaction',
    title: 'Reaction Rush',
    tagline: 'Test your reflexes in milliseconds across three quick rounds.',
    category: 'Speed',
    accent: 'bg-[#FDF6E6] text-[#7A541C]',
    icon: Zap,
  },
  {
    id: 'scramble',
    title: 'Word Scramble',
    tagline: 'Rearrange shuffled letters to uncover poetic words.',
    category: 'Words',
    accent: 'bg-[#F6F2FF] text-[#4B2F6E]',
    icon: SpellCheck,
  },
  {
    id: 'emoji',
    title: 'Emoji Detective',
    tagline: 'Decode clever emoji sequences into cozy stories.',
    category: 'Visual',
    accent: 'bg-[#FFF0F5] text-[#702B4C]',
    icon: Search,
  },
  {
    id: 'code',
    title: 'Code Breaker',
    tagline: 'Deduce a hidden 4-digit numeric code with logic clues.',
    category: 'Logic',
    accent: 'bg-[#F6F2FF] text-[#4B2F6E]',
    icon: Hash,
  },
  {
    id: 'riddles',
    title: 'Mind Trap',
    tagline: 'Solve five sharp riddles and lateral-thinking puzzles.',
    category: 'Riddles',
    accent: 'bg-[#FDF6E6] text-[#5B3A12]',
    icon: Brain,
  },
];

interface GamesZoneProps {
  activeSession: ActiveSessionState;
  onSessionUpdate: (state: ActiveSessionState) => void;
}

export function GamesZone({ activeSession, onSessionUpdate }: GamesZoneProps) {
  const [selectedGame, setSelectedGame] = useState<GameId | null>(null);
  const activeRunIdsRef = useRef<Partial<Record<GameId, string>>>({});
  const sessionId = activeSession.session.id;

  useEffect(() => {
    setSelectedGame(null);
    activeRunIdsRef.current = {};
  }, [sessionId]);

  const latestScores = useMemo(() => {
    const map: Partial<Record<GameId, string>> = {};
    for (const rec of activeSession.gameRecords) {
      if (rec.status === 'completed' && rec.scoreLabel) {
        const gid = rec.gameId as GameId;
        if (!map[gid]) {
          map[gid] = rec.scoreLabel;
        }
      }
    }
    return map;
  }, [activeSession.gameRecords]);

  function handleGameStart(id: GameId, title: string) {
    void api
      .startGame(id, title)
      .then((res) => {
        activeRunIdsRef.current[id] = res.record.id;
        onSessionUpdate(res.activeSession);
      })
      .catch(() => {
        // Non-blocking
      });
  }

  function handleFinishScore(id: GameId, title: string, summary: string) {
    const recordId = activeRunIdsRef.current[id];
    activeRunIdsRef.current[id] = undefined;
    void api
      .completeGame({
        recordId,
        gameId: id,
        gameTitle: title,
        scoreLabel: summary,
      })
      .then((res) => onSessionUpdate(res.activeSession))
      .catch(() => {
        // Non-blocking
      });
  }

  const activeMeta = GAMES.find((g) => g.id === selectedGame);

  return (
    <div className="space-y-7 pb-8">
      {/* Arcade Header — Deep Plum & Lavender Personality */}
      <section className="rounded-3xl bg-[#702B4C] p-6 text-[#FFF9F5] sm:p-8">
        <p className="text-xs font-semibold text-[#F3D69B]">
          Mini-Games Arcade · 6 Touch-Ready Challenges
        </p>
        <h1 className="mt-2 font-serif text-3xl font-semibold text-[#FFF9F5] sm:text-4xl">
          Playful Challenges Made for Quick Breaks
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#FFF9F5]/80">
          Every game below is fully playable right here with smooth smartphone
          touch controls, scores, and instant replays.
        </p>
      </section>

      {selectedGame && activeMeta ? (
        <section className="rounded-3xl border border-[#702B4C]/12 bg-white p-5 shadow-xs sm:p-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-[#702B4C]/10 pb-4">
            <button
              type="button"
              onClick={() => setSelectedGame(null)}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-[#FAF1EA] px-4 py-2 text-xs font-semibold text-[#702B4C] hover:bg-[#FFDCE8]/60"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>All Games</span>
            </button>
            <span className="text-xs font-semibold text-[#9274B8]">
              {activeMeta.category}
              {latestScores[selectedGame]
                ? ` · Latest: ${latestScores[selectedGame]}`
                : ''}
            </span>
          </div>

          {selectedGame === 'memory' && (
            <MemoryMatchGame
              key={`${sessionId}-memory`}
              onGameStart={() => handleGameStart('memory', 'Memory Match')}
              onFinishScore={(s) =>
                handleFinishScore('memory', 'Memory Match', s)
              }
            />
          )}
          {selectedGame === 'reaction' && (
            <ReactionRushGame
              key={`${sessionId}-reaction`}
              onGameStart={() => handleGameStart('reaction', 'Reaction Rush')}
              onFinishScore={(s) =>
                handleFinishScore('reaction', 'Reaction Rush', s)
              }
            />
          )}
          {selectedGame === 'scramble' && (
            <WordScrambleGame
              key={`${sessionId}-scramble`}
              onGameStart={() => handleGameStart('scramble', 'Word Scramble')}
              onFinishScore={(s) =>
                handleFinishScore('scramble', 'Word Scramble', s)
              }
            />
          )}
          {selectedGame === 'emoji' && (
            <EmojiDetectiveGame
              key={`${sessionId}-emoji`}
              onGameStart={() => handleGameStart('emoji', 'Emoji Detective')}
              onFinishScore={(s) =>
                handleFinishScore('emoji', 'Emoji Detective', s)
              }
            />
          )}
          {selectedGame === 'code' && (
            <CodeBreakerGame
              key={`${sessionId}-code`}
              onGameStart={() => handleGameStart('code', 'Code Breaker')}
              onFinishScore={(s) =>
                handleFinishScore('code', 'Code Breaker', s)
              }
            />
          )}
          {selectedGame === 'riddles' && (
            <MindTrapGame
              key={`${sessionId}-riddles`}
              onGameStart={() => handleGameStart('riddles', 'Mind Trap')}
              onFinishScore={(s) =>
                handleFinishScore('riddles', 'Mind Trap', s)
              }
            />
          )}
        </section>
      ) : (
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {GAMES.map((game) => {
            const Icon = game.icon;
            return (
              <article
                key={game.id}
                className="flex flex-col justify-between rounded-3xl border border-[#702B4C]/12 bg-white p-6 transition-transform hover:-translate-y-0.5"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span
                      className={`flex h-11 w-11 items-center justify-center rounded-2xl ${game.accent}`}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="text-xs font-medium text-[#6A525E] tabular-nums">
                      {game.category}
                      {latestScores[game.id] ? ` · ${latestScores[game.id]}` : ''}
                    </span>
                  </div>
                  <h2 className="mt-4 font-serif text-2xl font-semibold text-[#702B4C]">
                    {game.title}
                  </h2>
                  <p className="mt-1.5 text-sm leading-relaxed text-[#6A525E]">
                    {game.tagline}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedGame(game.id)}
                  className="mt-6 min-h-[46px] w-full rounded-xl bg-[#702B4C] px-4 py-2.5 text-sm font-semibold text-[#FFF9F5] transition-colors hover:bg-[#531D38]"
                >
                  Play {game.title}
                </button>
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
}
