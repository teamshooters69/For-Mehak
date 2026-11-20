import { useEffect, useRef, useState, type FormEvent } from 'react';
import { motion } from 'motion/react';
import {
  CheckCircle2,
  Delete,
  HelpCircle,
  Play,
  RotateCcw,
  Sparkles,
  Trophy,
} from 'lucide-react';
import {
  evaluateCodeBreakerGuess,
  generateSecretCode,
  scrambleWord,
} from '../../utils/logic';

interface GameCallbacks {
  onGameStart?: () => void;
  onFinishScore: (summary: string) => void;
}

// 1. Memory Match
const MEMORY_SYMBOLS = [
  { id: 'moon', label: 'Crescent Moon', icon: '🌙' },
  { id: 'star', label: 'Golden Star', icon: '✨' },
  { id: 'rose', label: 'Blossom', icon: '🌸' },
  { id: 'letter', label: 'Love Letter', icon: '💌' },
  { id: 'coffee', label: 'Warm Cup', icon: '☕' },
  { id: 'music', label: 'Melody', icon: '🎵' },
];

interface MemoryCard {
  uid: number;
  pairId: string;
  label: string;
  icon: string;
  matched: boolean;
}

function createMemoryDeck(): MemoryCard[] {
  const doubled = [...MEMORY_SYMBOLS, ...MEMORY_SYMBOLS].map((sym, index) => ({
    uid: index,
    pairId: sym.id,
    label: sym.label,
    icon: sym.icon,
    matched: false,
  }));
  return doubled.sort(() => Math.random() - 0.5);
}

export function MemoryMatchGame({
  onGameStart,
  onFinishScore,
}: GameCallbacks) {
  const [phase, setPhase] = useState<'start' | 'playing' | 'done'>('start');
  const [deck, setDeck] = useState<MemoryCard[]>(() => createMemoryDeck());
  const [flipped, setFlipped] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [locked, setLocked] = useState(false);

  function startGame() {
    setDeck(createMemoryDeck());
    setFlipped([]);
    setMoves(0);
    setLocked(false);
    setPhase('playing');
    onGameStart?.();
  }

  function handleFlip(uid: number) {
    if (locked || flipped.includes(uid)) return;
    const card = deck.find((c) => c.uid === uid);
    if (!card || card.matched) return;

    const nextFlipped = [...flipped, uid];
    setFlipped(nextFlipped);

    if (nextFlipped.length === 2) {
      setMoves((m) => m + 1);
      setLocked(true);
      const [firstId, secondId] = nextFlipped;
      const first = deck.find((c) => c.uid === firstId)!;
      const second = deck.find((c) => c.uid === secondId)!;

      if (first.pairId === second.pairId) {
        const updated = deck.map((c) =>
          c.pairId === first.pairId ? { ...c, matched: true } : c
        );
        setDeck(updated);
        setFlipped([]);
        setLocked(false);
        if (updated.every((c) => c.matched)) {
          const finalMoves = moves + 1;
          setPhase('done');
          onFinishScore(`${finalMoves} moves`);
        }
      } else {
        window.setTimeout(() => {
          setFlipped([]);
          setLocked(false);
        }, 700);
      }
    }
  }

  if (phase === 'start') {
    return (
      <div className="space-y-4 py-4 text-center">
        <h3 className="font-serif text-3xl font-semibold text-[#702B4C]">
          Memory Match
        </h3>
        <p className="mx-auto max-w-md text-sm text-[#6A525E]">
          Tap two cards at a time to uncover all six matching celestial pairs in
          as few moves as possible.
        </p>
        <button
          type="button"
          onClick={startGame}
          className="inline-flex min-h-[48px] items-center gap-2 rounded-2xl bg-[#702B4C] px-7 py-3 text-sm font-semibold text-[#FFF9F5] hover:bg-[#531D38]"
        >
          <Play className="h-4 w-4" />
          <span>Start Memory Match</span>
        </button>
      </div>
    );
  }

  if (phase === 'done') {
    return (
      <div className="space-y-4 py-4 text-center">
        <Trophy className="mx-auto h-9 w-9 text-[#702B4C]" />
        <h3 className="font-serif text-3xl font-semibold text-[#702B4C]">
          Every Pair Matched!
        </h3>
        <p className="font-mono text-2xl font-semibold text-[#4B2F6E] tabular-nums">
          {moves} moves
        </p>
        <p className="text-sm text-[#6A525E]">
          Sharp eyes and effortless memory.
        </p>
        <button
          type="button"
          onClick={startGame}
          className="inline-flex min-h-[46px] items-center gap-2 rounded-xl bg-[#702B4C] px-6 py-2.5 text-sm font-semibold text-[#FFF9F5] hover:bg-[#531D38]"
        >
          <RotateCcw className="h-4 w-4" />
          <span>Play Again</span>
        </button>
      </div>
    );
  }

  const matchedPairs = deck.filter((c) => c.matched).length / 2;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs font-semibold text-[#6A525E] tabular-nums">
        <span>Moves: {moves}</span>
        <span>Pairs: {matchedPairs} / 6</span>
      </div>

      <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
        {deck.map((card) => {
          const isUp = card.matched || flipped.includes(card.uid);
          return (
            <motion.button
              key={card.uid}
              type="button"
              whileTap={{ scale: 0.94 }}
              onClick={() => handleFlip(card.uid)}
              aria-label={isUp ? card.label : 'Hidden memory card'}
              className={`flex aspect-square min-h-[76px] flex-col items-center justify-center rounded-2xl border text-3xl transition-colors ${
                card.matched
                  ? 'border-[#702B4C]/30 bg-[#FDF6E6]'
                  : isUp
                    ? 'border-[#702B4C] bg-[#FFF0F5]'
                    : 'border-[#9274B8]/25 bg-[#E9DFFF] hover:bg-[#DDD0FF]'
              }`}
            >
              {isUp ? (
                <span role="img" aria-label={card.label}>
                  {card.icon}
                </span>
              ) : (
                <Sparkles className="h-5 w-5 text-[#702B4C]/55" />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

// 2. Reaction Rush
export function ReactionRushGame({
  onGameStart,
  onFinishScore,
}: GameCallbacks) {
  const [phase, setPhase] = useState<
    'start' | 'waiting' | 'ready' | 'tooSoon' | 'roundResult' | 'done'
  >('start');
  const [round, setRound] = useState(1);
  const [times, setTimes] = useState<number[]>([]);
  const [lastMs, setLastMs] = useState<number | null>(null);
  const readyAtRef = useRef<number>(0);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, []);

  function beginRound(nextRound: number) {
    setRound(nextRound);
    setPhase('waiting');
    if (timerRef.current) window.clearTimeout(timerRef.current);
    const delay = 1400 + Math.random() * 2000;
    timerRef.current = window.setTimeout(() => {
      readyAtRef.current = performance.now();
      setPhase('ready');
    }, delay);
  }

  function startGame() {
    setTimes([]);
    setLastMs(null);
    onGameStart?.();
    beginRound(1);
  }

  function handleTap() {
    if (phase === 'waiting') {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      setPhase('tooSoon');
      return;
    }
    if (phase === 'ready') {
      const elapsed = Math.max(1, Math.round(performance.now() - readyAtRef.current));
      const nextTimes = [...times, elapsed];
      setTimes(nextTimes);
      setLastMs(elapsed);
      if (nextTimes.length >= 3) {
        const avg = Math.round(
          nextTimes.reduce((a, b) => a + b, 0) / nextTimes.length
        );
        setPhase('done');
        onFinishScore(`${avg} ms avg`);
      } else {
        setPhase('roundResult');
      }
    }
  }

  if (phase === 'start') {
    return (
      <div className="space-y-4 py-4 text-center">
        <h3 className="font-serif text-3xl font-semibold text-[#702B4C]">
          Reaction Rush
        </h3>
        <p className="mx-auto max-w-md text-sm text-[#6A525E]">
          Wait for the lavender pad to turn warm champagne gold, then tap as
          fast as you can across 3 quick rounds.
        </p>
        <button
          type="button"
          onClick={startGame}
          className="inline-flex min-h-[48px] items-center gap-2 rounded-2xl bg-[#702B4C] px-7 py-3 text-sm font-semibold text-[#FFF9F5] hover:bg-[#531D38]"
        >
          <Play className="h-4 w-4" />
          <span>Start Reaction Rush</span>
        </button>
      </div>
    );
  }

  if (phase === 'done') {
    const avg = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
    const best = Math.min(...times);
    return (
      <div className="space-y-4 py-4 text-center">
        <Trophy className="mx-auto h-9 w-9 text-[#702B4C]" />
        <h3 className="font-serif text-3xl font-semibold text-[#702B4C]">
          Lightning Reflexes
        </h3>
        <div className="flex items-center justify-center gap-6 font-mono text-lg font-semibold text-[#4B2F6E] tabular-nums">
          <span>Avg: {avg} ms</span>
          <span>Best: {best} ms</span>
        </div>
        <button
          type="button"
          onClick={startGame}
          className="inline-flex min-h-[46px] items-center gap-2 rounded-xl bg-[#702B4C] px-6 py-2.5 text-sm font-semibold text-[#FFF9F5]"
        >
          <RotateCcw className="h-4 w-4" />
          <span>Play Again</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs font-semibold text-[#6A525E] tabular-nums">
        <span>Round {round} of 3</span>
        <span>{times.length > 0 ? `Previous: ${times.join('ms · ')}ms` : 'Get ready'}</span>
      </div>

      {phase === 'waiting' || phase === 'ready' ? (
        <button
          type="button"
          onPointerDown={handleTap}
          className={`flex min-h-[210px] w-full flex-col items-center justify-center rounded-3xl p-6 text-center transition-colors ${
            phase === 'ready'
              ? 'bg-[#F3D69B] text-[#531D38]'
              : 'bg-[#702B4C] text-[#FFF9F5]'
          }`}
        >
          <span className="font-serif text-3xl font-semibold">
            {phase === 'ready' ? 'TAP NOW!' : 'Wait for Gold...'}
          </span>
          <span className="mt-2 text-xs opacity-85">
            {phase === 'ready'
              ? 'Quick! Tap anywhere on this pad.'
              : 'Hold steady — do not tap too early.'}
          </span>
        </button>
      ) : phase === 'tooSoon' ? (
        <div className="rounded-3xl bg-[#FFDCE8]/80 p-8 text-center">
          <p className="font-serif text-2xl font-semibold text-[#702B4C]">
            Too eager!
          </p>
          <p className="mt-1 text-sm text-[#6A525E]">
            Wait until the pad turns champagne gold.
          </p>
          <button
            type="button"
            onClick={() => beginRound(round)}
            className="mt-5 min-h-[44px] rounded-xl bg-[#702B4C] px-5 py-2.5 text-sm font-semibold text-[#FFF9F5]"
          >
            Retry Round {round}
          </button>
        </div>
      ) : (
        <div className="rounded-3xl bg-[#FDF6E6] p-8 text-center">
          <p className="font-mono text-3xl font-semibold text-[#702B4C] tabular-nums">
            {lastMs} ms
          </p>
          <p className="mt-1 text-sm text-[#6A525E]">Nice catch!</p>
          <button
            type="button"
            onClick={() => beginRound(round + 1)}
            className="mt-5 min-h-[44px] rounded-xl bg-[#702B4C] px-5 py-2.5 text-sm font-semibold text-[#FFF9F5]"
          >
            Next Round
          </button>
        </div>
      )}
    </div>
  );
}

// 3. Word Scramble
const SCRAMBLE_WORDS = [
  { word: 'STARLIGHT', hint: 'Soft glow scattered across a clear midnight sky' },
  { word: 'SUNSET', hint: 'Golden hour when the sky turns blush and violet' },
  { word: 'ENVELOPE', hint: 'Holds a secret handwritten letter inside' },
  { word: 'PLAYLIST', hint: 'A collection of favorite songs shared together' },
  { word: 'SPARKLE', hint: 'A tiny shimmer of unexpected joy' },
  { word: 'WARMTH', hint: 'What a genuine smile brings into any room' },
];

export function WordScrambleGame({
  onGameStart,
  onFinishScore,
}: GameCallbacks) {
  const [phase, setPhase] = useState<'start' | 'playing' | 'done'>('start');
  const [index, setIndex] = useState(0);
  const [scrambled, setScrambled] = useState('');
  const [input, setInput] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);

  function loadWord(i: number) {
    setIndex(i);
    setScrambled(scrambleWord(SCRAMBLE_WORDS[i].word));
    setInput('');
    setShowHint(false);
    setFeedback(null);
  }

  function startGame() {
    setScore(0);
    setPhase('playing');
    loadWord(0);
    onGameStart?.();
  }

  function advance(nextScore: number) {
    if (index + 1 >= SCRAMBLE_WORDS.length) {
      setPhase('done');
      onFinishScore(`${nextScore}/${SCRAMBLE_WORDS.length}`);
    } else {
      loadWord(index + 1);
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const target = SCRAMBLE_WORDS[index].word;
    if (input.trim().toUpperCase() === target) {
      const nextScore = score + 1;
      setScore(nextScore);
      advance(nextScore);
    } else {
      setFeedback('Not quite — rearrange the letters or tap Hint.');
    }
  }

  if (phase === 'start') {
    return (
      <div className="space-y-4 py-4 text-center">
        <h3 className="font-serif text-3xl font-semibold text-[#702B4C]">
          Word Scramble
        </h3>
        <p className="mx-auto max-w-md text-sm text-[#6A525E]">
          Unscramble six warm, poetic words letter by letter. Use a hint anytime
          you want a nudge.
        </p>
        <button
          type="button"
          onClick={startGame}
          className="inline-flex min-h-[48px] items-center gap-2 rounded-2xl bg-[#702B4C] px-7 py-3 text-sm font-semibold text-[#FFF9F5]"
        >
          <Play className="h-4 w-4" />
          <span>Start Word Scramble</span>
        </button>
      </div>
    );
  }

  if (phase === 'done') {
    return (
      <div className="space-y-4 py-4 text-center">
        <Trophy className="mx-auto h-9 w-9 text-[#702B4C]" />
        <h3 className="font-serif text-3xl font-semibold text-[#702B4C]">
          All Words Complete!
        </h3>
        <p className="font-mono text-2xl font-semibold text-[#4B2F6E] tabular-nums">
          {score} / {SCRAMBLE_WORDS.length} solved
        </p>
        <button
          type="button"
          onClick={startGame}
          className="inline-flex min-h-[46px] items-center gap-2 rounded-xl bg-[#702B4C] px-6 py-2.5 text-sm font-semibold text-[#FFF9F5]"
        >
          <RotateCcw className="h-4 w-4" />
          <span>Play Again</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between text-xs font-semibold text-[#6A525E] tabular-nums">
        <span>
          Word {index + 1} of {SCRAMBLE_WORDS.length}
        </span>
        <span>Score: {score}</span>
      </div>

      <div className="rounded-3xl bg-[#F6F2FF] p-6 text-center">
        <div className="flex flex-wrap justify-center gap-2">
          {scrambled.split('').map((ch, i) => (
            <span
              key={i}
              className="flex h-11 w-10 items-center justify-center rounded-xl border border-[#9274B8]/30 bg-white font-mono text-lg font-semibold text-[#4B2F6E]"
            >
              {ch}
            </span>
          ))}
        </div>
        {showHint && (
          <p className="mt-4 text-xs font-medium text-[#5C4B72]">
            Hint: {SCRAMBLE_WORDS[index].hint}
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-3" noValidate>
        <div className="flex flex-col gap-2.5 sm:flex-row">
          <label htmlFor="word-scramble-input" className="sr-only">
            Unscrambled word
          </label>
          <input
            id="word-scramble-input"
            type="text"
            autoComplete="off"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              if (feedback) setFeedback(null);
            }}
            placeholder="Type the unscrambled word..."
            className="min-h-[48px] flex-1 rounded-xl border border-[#702B4C]/20 bg-[#FFF9F5] px-4 text-base uppercase text-[#2E1A24] focus:border-[#702B4C] focus:outline-none"
          />
          <button
            type="submit"
            className="min-h-[48px] shrink-0 rounded-xl bg-[#702B4C] px-6 text-sm font-semibold text-[#FFF9F5]"
          >
            Check
          </button>
        </div>

        {feedback && (
          <p className="text-xs font-medium text-[#702B4C]">{feedback}</p>
        )}

        <div className="flex items-center justify-between pt-1">
          <button
            type="button"
            onClick={() => setShowHint(true)}
            className="inline-flex min-h-[40px] items-center gap-1.5 text-xs font-semibold text-[#9274B8]"
          >
            <HelpCircle className="h-4 w-4" />
            <span>Show Hint</span>
          </button>
          <button
            type="button"
            onClick={() => advance(score)}
            className="min-h-[40px] text-xs font-semibold text-[#6A525E] hover:text-[#702B4C]"
          >
            Skip Word
          </button>
        </div>
      </form>
    </div>
  );
}

// 4. Emoji Detective
const EMOJI_PUZZLES = [
  {
    emojis: '🌅 ☕ 🚶‍♀️',
    answer: 'Golden Hour Coffee Walk',
    options: [
      'Golden Hour Coffee Walk',
      'Midnight Bakery Run',
      'Rainy Day Reading',
      'Mountain Train Ride',
    ],
  },
  {
    emojis: '🎬 🍿 🛋️ ✨',
    answer: 'Cozy Movie Night',
    options: [
      'Concert in the Park',
      'Cozy Movie Night',
      'Rooftop Stargazing',
      'Sunday Brunch',
    ],
  },
  {
    emojis: '🎧 🌙 🚗 🎵',
    answer: 'Late-Night Music Drive',
    options: [
      'Morning Gym Session',
      'Beach Picnic',
      'Late-Night Music Drive',
      'Art Gallery Date',
    ],
  },
  {
    emojis: '💌 🕯️ 🌸',
    answer: 'Handwritten Love Letter',
    options: [
      'Handwritten Love Letter',
      'Birthday Cake Surprise',
      'Flower Market Visit',
      'Postcard from Paris',
    ],
  },
  {
    emojis: '🍦 🌆 💬',
    answer: 'Sunset Gelato & Deep Talk',
    options: [
      'Morning Bookstore Browse',
      'Sunset Gelato & Deep Talk',
      'Cooking Class Challenge',
      'Rainy Café Puzzle',
    ],
  },
];

export function EmojiDetectiveGame({
  onGameStart,
  onFinishScore,
}: GameCallbacks) {
  const [phase, setPhase] = useState<'start' | 'playing' | 'done'>('start');
  const [step, setStep] = useState(0);
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);

  function startGame() {
    setStep(0);
    setScore(0);
    setPicked(null);
    setPhase('playing');
    onGameStart?.();
  }

  function choose(opt: string) {
    if (picked) return;
    setPicked(opt);
    const correct = opt === EMOJI_PUZZLES[step].answer;
    const nextScore = correct ? score + 1 : score;
    setScore(nextScore);

    window.setTimeout(() => {
      setPicked(null);
      if (step + 1 >= EMOJI_PUZZLES.length) {
        setPhase('done');
        onFinishScore(`${nextScore}/${EMOJI_PUZZLES.length}`);
      } else {
        setStep((s) => s + 1);
      }
    }, 800);
  }

  if (phase === 'start') {
    return (
      <div className="space-y-4 py-4 text-center">
        <h3 className="font-serif text-3xl font-semibold text-[#702B4C]">
          Emoji Detective
        </h3>
        <p className="mx-auto max-w-md text-sm text-[#6A525E]">
          Decode five visual emoji stories and pick the phrase that matches each
          clue.
        </p>
        <button
          type="button"
          onClick={startGame}
          className="inline-flex min-h-[48px] items-center gap-2 rounded-2xl bg-[#702B4C] px-7 py-3 text-sm font-semibold text-[#FFF9F5]"
        >
          <Play className="h-4 w-4" />
          <span>Start Emoji Detective</span>
        </button>
      </div>
    );
  }

  if (phase === 'done') {
    return (
      <div className="space-y-4 py-4 text-center">
        <Trophy className="mx-auto h-9 w-9 text-[#702B4C]" />
        <h3 className="font-serif text-3xl font-semibold text-[#702B4C]">
          Case Closed!
        </h3>
        <p className="font-mono text-2xl font-semibold text-[#4B2F6E] tabular-nums">
          {score} / {EMOJI_PUZZLES.length} decoded
        </p>
        <button
          type="button"
          onClick={startGame}
          className="inline-flex min-h-[46px] items-center gap-2 rounded-xl bg-[#702B4C] px-6 py-2.5 text-sm font-semibold text-[#FFF9F5]"
        >
          <RotateCcw className="h-4 w-4" />
          <span>Play Again</span>
        </button>
      </div>
    );
  }

  const current = EMOJI_PUZZLES[step];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between text-xs font-semibold text-[#6A525E] tabular-nums">
        <span>
          Clue {step + 1} of {EMOJI_PUZZLES.length}
        </span>
        <span>Score: {score}</span>
      </div>

      <div className="rounded-3xl bg-[#FDF6E6] py-8 text-center text-4xl tracking-widest sm:text-5xl">
        {current.emojis}
      </div>

      <div className="grid gap-2.5 sm:grid-cols-2">
        {current.options.map((opt) => {
          const isCorrect = opt === current.answer;
          const isPicked = opt === picked;
          let cls =
            'border-[#702B4C]/15 bg-[#FFF9F5] text-[#2E1A24] hover:border-[#702B4C]';
          if (picked) {
            if (isCorrect) cls = 'border-emerald-700 bg-emerald-50 text-emerald-950';
            else if (isPicked) cls = 'border-[#702B4C] bg-[#FFDCE8] text-[#702B4C]';
          }
          return (
            <button
              key={opt}
              type="button"
              onClick={() => choose(opt)}
              className={`min-h-[52px] rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition-colors ${cls}`}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// 5. Code Breaker
export function CodeBreakerGame({
  onGameStart,
  onFinishScore,
}: GameCallbacks) {
  const [phase, setPhase] = useState<'start' | 'playing' | 'won' | 'lost'>('start');
  const [secret, setSecret] = useState(() => generateSecretCode(4));
  const [currentGuess, setCurrentGuess] = useState('');
  const [history, setHistory] = useState<
    Array<{ guess: string; exact: number; misplaced: number }>
  >([]);

  function startGame() {
    setSecret(generateSecretCode(4));
    setCurrentGuess('');
    setHistory([]);
    setPhase('playing');
    onGameStart?.();
  }

  function pushDigit(digit: string) {
    if (currentGuess.length >= 4 || currentGuess.includes(digit)) return;
    setCurrentGuess((prev) => prev + digit);
  }

  function submitGuess() {
    if (currentGuess.length !== 4) return;
    const res = evaluateCodeBreakerGuess(secret, currentGuess);
    const nextHistory = [
      { guess: currentGuess, exact: res.exact, misplaced: res.misplaced },
      ...history,
    ];
    setHistory(nextHistory);
    setCurrentGuess('');

    if (res.solved) {
      setPhase('won');
      onFinishScore(`Cracked in ${nextHistory.length}`);
    } else if (nextHistory.length >= 8) {
      setPhase('lost');
      onFinishScore('Out of attempts (0/8)');
    }
  }

  if (phase === 'start') {
    return (
      <div className="space-y-4 py-4 text-center">
        <h3 className="font-serif text-3xl font-semibold text-[#702B4C]">
          Code Breaker
        </h3>
        <p className="mx-auto max-w-md text-sm text-[#6A525E]">
          Crack a hidden 4-digit code made of unique digits (1–9) within 8
          tries. After each guess you&apos;ll see how many digits are in the exact
          spot or misplaced.
        </p>
        <button
          type="button"
          onClick={startGame}
          className="inline-flex min-h-[48px] items-center gap-2 rounded-2xl bg-[#702B4C] px-7 py-3 text-sm font-semibold text-[#FFF9F5]"
        >
          <Play className="h-4 w-4" />
          <span>Start Code Breaker</span>
        </button>
      </div>
    );
  }

  if (phase === 'won' || phase === 'lost') {
    return (
      <div className="space-y-4 py-4 text-center">
        <Trophy className="mx-auto h-9 w-9 text-[#702B4C]" />
        <h3 className="font-serif text-3xl font-semibold text-[#702B4C]">
          {phase === 'won' ? 'Vault Unlocked!' : 'Out of Attempts'}
        </h3>
        <p className="font-mono text-2xl font-semibold tracking-widest text-[#4B2F6E] tabular-nums">
          Code: {secret}
        </p>
        <p className="text-sm text-[#6A525E]">
          {phase === 'won'
            ? `Solved in ${history.length} tries.`
            : 'So close — try a fresh secret code!'}
        </p>
        <button
          type="button"
          onClick={startGame}
          className="inline-flex min-h-[46px] items-center gap-2 rounded-xl bg-[#702B4C] px-6 py-2.5 text-sm font-semibold text-[#FFF9F5]"
        >
          <RotateCcw className="h-4 w-4" />
          <span>Play Again</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between text-xs font-semibold text-[#6A525E] tabular-nums">
        <span>Tries left: {8 - history.length}</span>
        <span>4 unique digits (1–9)</span>
      </div>

      {/* Display slots */}
      <div className="flex items-center justify-center gap-2.5">
        {[0, 1, 2, 3].map((slot) => (
          <div
            key={slot}
            className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-[#702B4C]/25 bg-[#FFF9F5] font-mono text-2xl font-semibold text-[#702B4C] tabular-nums"
          >
            {currentGuess[slot] ?? '·'}
          </div>
        ))}
      </div>

      {/* Touch keypad */}
      <div className="mx-auto grid max-w-xs grid-cols-3 gap-2">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => {
          const used = currentGuess.includes(d);
          return (
            <button
              key={d}
              type="button"
              disabled={used}
              onClick={() => pushDigit(d)}
              className="min-h-[48px] rounded-xl border border-[#702B4C]/15 bg-white font-mono text-lg font-semibold text-[#2E1A24] transition-colors hover:bg-[#E9DFFF]/50 disabled:opacity-35"
            >
              {d}
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => setCurrentGuess((prev) => prev.slice(0, -1))}
          aria-label="Backspace digit"
          className="flex min-h-[48px] items-center justify-center rounded-xl border border-[#702B4C]/15 bg-[#FAF1EA] text-[#702B4C]"
        >
          <Delete className="h-5 w-5" />
        </button>
        <button
          type="button"
          disabled={currentGuess.length !== 4}
          onClick={submitGuess}
          className="col-span-2 min-h-[48px] rounded-xl bg-[#702B4C] text-sm font-semibold text-[#FFF9F5] disabled:opacity-45"
        >
          Test Code
        </button>
      </div>

      {history.length > 0 && (
        <ul className="space-y-1.5 border-t border-[#702B4C]/10 pt-3">
          {history.map((entry, idx) => (
            <li
              key={idx}
              className="flex items-center justify-between rounded-xl bg-[#F6F2FF] px-4 py-2.5 text-xs font-medium text-[#2E1A24] tabular-nums"
            >
              <span className="font-mono text-sm font-semibold tracking-widest text-[#4B2F6E]">
                {entry.guess}
              </span>
              <span>
                {entry.exact} exact · {entry.misplaced} misplaced
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// 6. Mind Trap (Riddles & Logic)
const RIDDLES = [
  {
    riddle:
      'I have cities, but no houses. I have mountains, but no trees. I have water, but no fish. What am I?',
    options: ['A map', 'A mirror', 'A cloud', 'A dream'],
    answer: 0,
    explanation: 'A map holds every city, mountain, and sea in ink and paper.',
  },
  {
    riddle: 'The more you take of me, the more you leave behind. What am I?',
    options: ['Time', 'Footsteps', 'Memories', 'Breaths'],
    answer: 1,
    explanation: 'Every step forward leaves another footstep behind you.',
  },
  {
    riddle: 'What has keys that open no locks, space without room, and lets you enter without going inside?',
    options: ['A piano', 'A keyboard', 'A compass', 'A riddle'],
    answer: 1,
    explanation: 'A keyboard has keys, a space bar, and an Enter key.',
  },
  {
    riddle: 'I speak without a mouth and hear without ears. I come alive with wind. What am I?',
    options: ['A whisper', 'An echo', 'A shadow', 'A bell'],
    answer: 1,
    explanation: 'An echo answers back from open valleys and quiet halls.',
  },
  {
    riddle: 'What belongs to you, yet everyone else uses it far more often than you do?',
    options: ['Your favorite song', 'Your calendar', 'Your name', 'Your umbrella'],
    answer: 2,
    explanation: 'Other people say your name far more often than you say it yourself.',
  },
];

export function MindTrapGame({ onGameStart, onFinishScore }: GameCallbacks) {
  const [phase, setPhase] = useState<'start' | 'playing' | 'done'>('start');
  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);

  function startGame() {
    setStep(0);
    setPicked(null);
    setScore(0);
    setPhase('playing');
    onGameStart?.();
  }

  function selectAnswer(idx: number) {
    if (picked !== null) return;
    setPicked(idx);
    if (idx === RIDDLES[step].answer) {
      setScore((s) => s + 1);
    }
  }

  function nextRiddle() {
    if (step + 1 >= RIDDLES.length) {
      setPhase('done');
      onFinishScore(`${score}/${RIDDLES.length}`);
    } else {
      setPicked(null);
      setStep((s) => s + 1);
    }
  }

  if (phase === 'start') {
    return (
      <div className="space-y-4 py-4 text-center">
        <h3 className="font-serif text-3xl font-semibold text-[#702B4C]">
          Mind Trap
        </h3>
        <p className="mx-auto max-w-md text-sm text-[#6A525E]">
          Outsmart five clever riddles and lateral-thinking puzzles. Read every
          clue carefully!
        </p>
        <button
          type="button"
          onClick={startGame}
          className="inline-flex min-h-[48px] items-center gap-2 rounded-2xl bg-[#702B4C] px-7 py-3 text-sm font-semibold text-[#FFF9F5]"
        >
          <Play className="h-4 w-4" />
          <span>Start Mind Trap</span>
        </button>
      </div>
    );
  }

  if (phase === 'done') {
    return (
      <div className="space-y-4 py-4 text-center">
        <Trophy className="mx-auto h-9 w-9 text-[#702B4C]" />
        <h3 className="font-serif text-3xl font-semibold text-[#702B4C]">
          Mind Trap Cleared!
        </h3>
        <p className="font-mono text-2xl font-semibold text-[#4B2F6E] tabular-nums">
          {score} / {RIDDLES.length} riddles solved
        </p>
        <button
          type="button"
          onClick={startGame}
          className="inline-flex min-h-[46px] items-center gap-2 rounded-xl bg-[#702B4C] px-6 py-2.5 text-sm font-semibold text-[#FFF9F5]"
        >
          <RotateCcw className="h-4 w-4" />
          <span>Play Again</span>
        </button>
      </div>
    );
  }

  const current = RIDDLES[step];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between text-xs font-semibold text-[#6A525E] tabular-nums">
        <span>
          Riddle {step + 1} of {RIDDLES.length}
        </span>
        <span>Score: {score}</span>
      </div>

      <p className="font-serif text-2xl leading-snug font-semibold text-[#702B4C]">
        {current.riddle}
      </p>

      <div className="grid gap-2.5 sm:grid-cols-2">
        {current.options.map((opt, idx) => {
          const isCorrect = idx === current.answer;
          const isPicked = idx === picked;
          let cls =
            'border-[#702B4C]/15 bg-[#FFF9F5] text-[#2E1A24] hover:border-[#702B4C]';
          if (picked !== null) {
            if (isCorrect) cls = 'border-emerald-700 bg-emerald-50 text-emerald-950';
            else if (isPicked) cls = 'border-[#702B4C] bg-[#FFDCE8] text-[#702B4C]';
          }
          return (
            <button
              key={opt}
              type="button"
              onClick={() => selectAnswer(idx)}
              className={`flex min-h-[50px] items-center justify-between rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition-colors ${cls}`}
            >
              <span>{opt}</span>
              {picked !== null && isCorrect && (
                <CheckCircle2 className="h-4 w-4 text-emerald-700" />
              )}
            </button>
          );
        })}
      </div>

      {picked !== null && (
        <div className="flex flex-col justify-between gap-3 rounded-2xl bg-[#FDF6E6] p-4 sm:flex-row sm:items-center">
          <p className="text-sm text-[#2E1A24]">{current.explanation}</p>
          <button
            type="button"
            onClick={nextRiddle}
            className="min-h-[44px] shrink-0 rounded-xl bg-[#702B4C] px-5 py-2.5 text-sm font-semibold text-[#FFF9F5]"
          >
            {step + 1 >= RIDDLES.length ? 'See Final Score' : 'Next Riddle'}
          </button>
        </div>
      )}
    </div>
  );
}
