import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowRight,
  BookHeart,
  CalendarHeart,
  Compass,
  Gamepad2,
  Gift,
  Heart,
  Shuffle,
  Sparkles,
  Star,
  X,
} from 'lucide-react';
import type { NavTab, RecipientUniversePayload } from '../types/universe';
import heroArtUrl from '../assets/images/hero_universe_illustration_1795155824511.jpg';

interface HomeViewProps {
  data: RecipientUniversePayload;
  onNavigate: (tab: NavTab) => void;
}

const HERO_ART_URL = heroArtUrl;

const STAR_NOTES = [
  'A little spark of warmth for your day.',
  'Something playful waiting around the next corner.',
  'Every piece of this universe was placed here with care.',
];

interface DiscoveryItem {
  kind: string;
  headline: string;
  body: string;
  ctaLabel: string;
  targetTab: NavTab;
}

export function HomeView({ data, onNavigate }: HomeViewProps) {
  const portalsRef = useRef<HTMLElement | null>(null);
  const [heroArtFailed, setHeroArtFailed] = useState(false);
  const [litStars, setLitStars] = useState<number[]>([]);
  const [discovery, setDiscovery] = useState<DiscoveryItem | null>(null);

  useEffect(() => {
    setLitStars([]);
  }, [data.activeSession.session.id]);

  function handleEnterUniverse() {
    portalsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function handleDiscoverSomething() {
    // Pick a surprise item from non-Easter-egg pools so homepage stays clean and welcoming
    const safeHearts = data.heartSurprises.filter((h) => !h.isEasterEgg);
    const pool: DiscoveryItem[] = [
      ...data.compliments.map((c) => ({
        kind: 'A Thought for You',
        headline: c.title,
        body: c.text,
        ctaLabel: 'See More Appreciation',
        targetTab: 'world' as NavTab,
      })),
      ...data.questions.map((q) => ({
        kind: `Question · ${q.mood}`,
        headline: 'Curious Moment',
        body: q.prompt,
        ctaLabel: 'Explore the Love Zone',
        targetTab: 'love' as NavTab,
      })),
      ...safeHearts.map((h) => ({
        kind: h.kind,
        headline: 'Unexpected Find',
        body: h.message,
        ctaLabel: 'Open Surprises',
        targetTab: 'surprises' as NavTab,
      })),
    ];

    if (pool.length === 0) return;
    const picked = pool[Math.floor(Math.random() * pool.length)];
    setDiscovery(picked);
  }

  function toggleStar(index: number) {
    setLitStars((prev) =>
      prev.includes(index) ? prev : [...prev, index]
    );
  }

  const allStarsLit = litStars.length === 3;

  return (
    <div className="space-y-12 pb-8 md:space-y-16">
      {/* Hero Section */}
      <section className="grid items-stretch gap-7 pt-2 lg:grid-cols-12 lg:gap-10 lg:pt-6">
        <div className="flex flex-col justify-center lg:col-span-6">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="text-xs font-medium tracking-wide text-[#9274B8]"
          >
            Curated Especially for Mehak · Interactive Keepsake
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.48, delay: 0.06, ease: [0.16, 1, 0.3, 1] }}
            className="mt-3 font-serif text-[2.3rem] leading-[1.08] font-semibold tracking-tight text-[#702B4C] sm:text-5xl lg:text-[3.5rem]"
          >
            {data.settings.welcomeHeading}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
            className="mt-4 max-w-xl text-base leading-relaxed text-[#6A525E] sm:text-[1.0625rem]"
          >
            {data.settings.welcomeSubtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            <button
              type="button"
              onClick={handleEnterUniverse}
              className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-2xl bg-[#702B4C] px-6 py-3 text-sm font-semibold whitespace-nowrap text-[#FFF9F5] shadow-[0_14px_30px_-14px_rgba(112,43,76,0.55)] transition-transform duration-150 hover:bg-[#531D38] active:scale-[0.98]"
            >
              <span>Enter My Universe</span>
              <ArrowRight className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={handleDiscoverSomething}
              className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-2xl border border-[#702B4C]/22 bg-white px-6 py-3 text-sm font-semibold whitespace-nowrap text-[#702B4C] transition-colors hover:bg-[#FFDCE8]/45 active:scale-[0.98]"
            >
              <Compass className="h-4 w-4 text-[#9274B8]" />
              <span>Discover Something</span>
            </button>
          </motion.div>

          {/* Playful Introductory Interaction: Light Three Stars */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.48, delay: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className={`mt-7 rounded-2xl border p-4 transition-colors duration-300 sm:mt-8 sm:p-5 ${
              allStarsLit
                ? 'border-[#702B4C]/25 bg-gradient-to-br from-[#FDF6E6] via-[#FFF9F5] to-[#FFF0F5]'
                : 'border-[#F3D69B]/60 bg-[#FDF6E6]/85'
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-[#702B4C]">
                  Tiny Welcome Ritual
                </p>
                <p className="mt-0.5 text-xs text-[#6A525E]">
                  {allStarsLit
                    ? 'Your little constellation is glowing — ready to explore.'
                    : `Tap all three stars to light up today's welcome (${litStars.length}/3)`}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {[0, 1, 2].map((idx) => {
                  const isLit = litStars.includes(idx);
                  return (
                    <motion.button
                      key={idx}
                      type="button"
                      whileTap={{ scale: 0.9 }}
                      animate={
                        isLit
                          ? { scale: [1, 1.18, 1], rotate: [0, 8, 0] }
                          : { scale: 1 }
                      }
                      transition={{ duration: 0.32 }}
                      onClick={() => toggleStar(idx)}
                      aria-label={`Light welcome star ${idx + 1}`}
                      aria-pressed={isLit}
                      className={`flex h-11 w-11 items-center justify-center rounded-full border transition-colors duration-200 ${
                        isLit
                          ? 'border-[#702B4C] bg-[#702B4C] text-[#F3D69B] shadow-sm'
                          : 'border-[#702B4C]/20 bg-white text-[#9274B8] hover:border-[#702B4C]/50'
                      }`}
                    >
                      <Star
                        className="h-4 w-4"
                        fill={isLit ? 'currentColor' : 'none'}
                      />
                    </motion.button>
                  );
                })}
              </div>
            </div>

            <AnimatePresence mode="wait">
              {litStars.length > 0 && (
                <motion.p
                  key={litStars.length}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.24 }}
                  className="mt-3 border-t border-[#702B4C]/10 pt-3 font-serif text-base italic text-[#702B4C]"
                >
                  {allStarsLit
                    ? '“Every galaxy starts with a single spark — thank you for bringing your light into this one.”'
                    : STAR_NOTES[litStars[litStars.length - 1]]}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Bespoke Celestial Editorial Hero Illustration */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 14 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
          className="relative lg:col-span-6"
        >
          <div className="relative h-full min-h-[250px] overflow-hidden rounded-3xl border border-[#702B4C]/12 bg-[#FAF1EA] shadow-[0_24px_50px_-28px_rgba(112,43,76,0.28)] sm:min-h-[340px]">
            {!heroArtFailed ? (
              <img
                src={HERO_ART_URL}
                alt="Celestial gouache illustration of a golden crescent moon, folded cotton love letters, peonies, and constellations"
                referrerPolicy="no-referrer"
                onError={() => setHeroArtFailed(true)}
                className="h-full w-full object-cover transition-transform duration-700 hover:scale-[1.03]"
              />
            ) : (
              <div className="flex h-full min-h-[300px] flex-col items-center justify-center bg-gradient-to-br from-[#E9DFFF] via-[#FFF9F5] to-[#FFDCE8] p-8 text-center">
                <Sparkles className="h-10 w-10 text-[#702B4C]" />
                <p className="mt-3 font-serif text-2xl text-[#702B4C]">
                  A Sky Built for Quiet Wonders
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </section>

      {/* Explore the Five Worlds + Date Ideas (Distinct Color Personalities) */}
      <section ref={portalsRef} className="scroll-mt-20 space-y-5">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end"
        >
          <div>
            <p className="text-xs font-medium text-[#9274B8]">
              Six Chapters to Wander
            </p>
            <h2 className="mt-1 font-serif text-3xl font-semibold text-[#702B4C]">
              Where shall we start today?
            </h2>
          </div>
          <p className="text-sm text-[#6A525E]">
            Every corner has its own mood, games, and hidden notes.
          </p>
        </motion.div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Love Zone — Blush */}
          <motion.button
            type="button"
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.38, delay: 0.03 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => onNavigate('love')}
            className="group flex flex-col justify-between rounded-3xl border border-[#702B4C]/10 bg-[#FFF0F5] p-6 text-left transition-transform duration-150 hover:-translate-y-0.5"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FFDCE8] text-[#702B4C]">
                  <Heart className="h-5 w-5" />
                </span>
                <span className="text-xs font-medium text-[#702B4C]/75">
                  9 Interactive Modes
                </span>
              </div>
              <h3 className="mt-4 font-serif text-2xl font-semibold text-[#702B4C]">
                Love &amp; Flirting Zone
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-[#6A525E]">
                Truth or Dare, Would You Rather, Pick a Heart, Know-Me Quiz, Love
                Language, and curious questions.
              </p>
            </div>
            <span className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-[#702B4C] transition-all group-hover:gap-2.5">
              Open Love Zone <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </motion.button>

          {/* Surprise Zone — Lavender */}
          <motion.button
            type="button"
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.38, delay: 0.07 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => onNavigate('surprises')}
            className="group flex flex-col justify-between rounded-3xl border border-[#9274B8]/20 bg-[#F6F2FF] p-6 text-left transition-transform duration-150 hover:-translate-y-0.5"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#E9DFFF] text-[#5B3E82]">
                  <Gift className="h-5 w-5" />
                </span>
                <span className="text-xs font-medium text-[#6C4F94]">
                  4 Reveal Experiences
                </span>
              </div>
              <h3 className="mt-4 font-serif text-2xl font-semibold text-[#4B2F6E]">
                Surprise Zone
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-[#5C4B72]">
                Foil scratch cards, Spin the Wheel, wax-sealed secret envelopes,
                and replayable mystery boxes.
              </p>
            </div>
            <span className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-[#5B3E82] transition-all group-hover:gap-2.5">
              Unwrap Surprises <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </motion.button>

          {/* Our Little World — Champagne Cream */}
          <motion.button
            type="button"
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.38, delay: 0.11 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => onNavigate('world')}
            className="group flex flex-col justify-between rounded-3xl border border-[#F3D69B]/70 bg-[#FDF6E6] p-6 text-left transition-transform duration-150 hover:-translate-y-0.5"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F3D69B]/65 text-[#702B4C]">
                  <BookHeart className="h-5 w-5" />
                </span>
                <span className="text-xs font-medium text-[#7A541C]">
                  Personal Keepsakes
                </span>
              </div>
              <h3 className="mt-4 font-serif text-2xl font-semibold text-[#5B3A12]">
                Our Little World
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-[#6E5639]">
                Timeline of real chapters, things appreciated about you, the
                inside-joke vault, and our bucket list.
              </p>
            </div>
            <span className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-[#702B4C] transition-all group-hover:gap-2.5">
              Visit Our World <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </motion.button>

          {/* Date & Adventure Zone — Warm Ivory + Plum */}
          <motion.button
            type="button"
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.38, delay: 0.15 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => onNavigate('dates')}
            className="group flex flex-col justify-between rounded-3xl border border-[#702B4C]/12 bg-white p-6 text-left transition-transform duration-150 hover:-translate-y-0.5"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FAF1EA] text-[#702B4C]">
                  <CalendarHeart className="h-5 w-5" />
                </span>
                <span className="text-xs font-medium text-[#6A525E]">
                  Planner &amp; Roulette
                </span>
              </div>
              <h3 className="mt-4 font-serif text-2xl font-semibold text-[#702B4C]">
                Date &amp; Adventure Zone
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-[#6A525E]">
                Add cafés and dream spots, spin virtual date roulette, and keep
                upcoming plans neatly saved.
              </p>
            </div>
            <span className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-[#702B4C] transition-all group-hover:gap-2.5">
              Plan an Outing <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </motion.button>

          {/* Mini-Games Arcade — Deep Plum Editorial Card */}
          <motion.button
            type="button"
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.38, delay: 0.19 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => onNavigate('games')}
            className="group flex flex-col justify-between rounded-3xl bg-[#702B4C] p-6 text-left text-[#FFF9F5] transition-transform duration-150 hover:-translate-y-0.5 sm:col-span-2"
          >
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
              <div className="max-w-lg">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 text-[#F3D69B]">
                    <Gamepad2 className="h-5 w-5" />
                  </span>
                  <span className="text-xs font-medium text-[#F3D69B]">
                    6 Playable Touch Games
                  </span>
                </div>
                <h3 className="mt-4 font-serif text-2xl font-semibold text-[#FFF9F5] sm:text-3xl">
                  Playful Mini-Games Arcade
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-[#FFF9F5]/80">
                  Memory Match, Reaction Rush, Word Scramble, Emoji Detective,
                  Code Breaker, and Mind Trap — designed for quick smartphone
                  play.
                </p>
              </div>

              <span className="inline-flex min-h-[44px] shrink-0 items-center justify-center gap-2 self-start rounded-2xl bg-[#F3D69B] px-5 py-2.5 text-xs font-semibold text-[#531D38] transition-colors group-hover:bg-[#FFF9F5]">
                Enter Arcade <ArrowRight className="h-3.5 w-3.5" />
              </span>
            </div>
          </motion.button>
        </div>
      </section>

      {/* Discover Something Modal */}
      <AnimatePresence>
        {discovery && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-label="Discovered Moment"
          >
            <motion.button
              type="button"
              aria-label="Close discovery modal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDiscovery(null)}
              className="absolute inset-0 bg-[#2E1A24]/50 backdrop-blur-xs"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 12 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10 w-full max-w-md rounded-3xl border border-[#702B4C]/15 bg-[#FFF9F5] p-6 shadow-2xl sm:p-7"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="text-xs font-semibold text-[#9274B8]">
                  {discovery.kind}
                </p>
                <button
                  type="button"
                  onClick={() => setDiscovery(null)}
                  aria-label="Close discovery"
                  className="flex h-10 w-10 items-center justify-center rounded-full text-[#6A525E] hover:bg-[#FFDCE8]/60"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <h3 className="mt-1 font-serif text-3xl font-semibold text-[#702B4C]">
                {discovery.headline}
              </h3>

              <p className="mt-3 text-base leading-relaxed text-[#2E1A24]">
                {discovery.body}
              </p>

              <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
                <button
                  type="button"
                  onClick={() => {
                    const target = discovery.targetTab;
                    setDiscovery(null);
                    onNavigate(target);
                  }}
                  className="inline-flex min-h-[46px] flex-1 items-center justify-center gap-2 rounded-xl bg-[#702B4C] px-4 py-2.5 text-sm font-semibold text-[#FFF9F5] hover:bg-[#531D38]"
                >
                  <span>{discovery.ctaLabel}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={handleDiscoverSomething}
                  className="inline-flex min-h-[46px] items-center justify-center gap-2 rounded-xl border border-[#702B4C]/20 bg-white px-4 py-2.5 text-sm font-medium text-[#702B4C] hover:bg-[#FFDCE8]/40"
                >
                  <Shuffle className="h-4 w-4" />
                  <span>Another</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
