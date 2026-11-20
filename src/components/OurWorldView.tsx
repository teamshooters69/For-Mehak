import { useState, type FormEvent } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  BookHeart,
  Check,
  Clock,
  Heart,
  LockOpen,
  Moon,
  Plus,
  Shuffle,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { api } from '../lib/api';
import type {
  BucketItem,
  InsideJokeItem,
  RecipientUniversePayload,
} from '../types/universe';

interface OurWorldViewProps {
  data: RecipientUniversePayload;
  onUpdateBucketList: (items: BucketItem[]) => void;
  onAddInsideJoke: (item: InsideJokeItem) => void;
}

type WorldTab = 'timeline' | 'appreciate' | 'jokes' | 'bucket';

export function OurWorldView({
  data,
  onUpdateBucketList,
  onAddInsideJoke,
}: OurWorldViewProps) {
  const [tab, setTab] = useState<WorldTab>('appreciate');
  const [moonTaps, setMoonTaps] = useState(0);
  const [easterEggOpen, setEasterEggOpen] = useState(false);

  // Compliments state
  const [spotlightId, setSpotlightId] = useState<string | null>(null);

  // Bucket list state
  const [bucketTitle, setBucketTitle] = useState('');
  const [bucketCategory, setBucketCategory] = useState('Cozy');
  const [bucketFilter, setBucketFilter] = useState<'all' | 'todo' | 'done'>('all');
  const [bucketError, setBucketError] = useState<string | null>(null);
  const [bucketSaving, setBucketSaving] = useState(false);

  // Inside-joke vault state
  const [jokeTitle, setJokeTitle] = useState('');
  const [jokeClue, setJokeClue] = useState('');
  const [jokeStory, setJokeStory] = useState('');
  const [jokeError, setJokeError] = useState<string | null>(null);
  const [jokeSaving, setJokeSaving] = useState(false);
  const [unlockedJokeIds, setUnlockedJokeIds] = useState<string[]>([]);

  function handleMoonTap() {
    const next = moonTaps + 1;
    setMoonTaps(next);
    if (next >= 3) {
      setEasterEggOpen(true);
      setMoonTaps(0);
    }
  }

  function pickRandomCompliment() {
    if (data.compliments.length === 0) return;
    const picked =
      data.compliments[Math.floor(Math.random() * data.compliments.length)];
    setSpotlightId(picked.id);
  }

  async function handleAddBucket(e: FormEvent) {
    e.preventDefault();
    if (!bucketTitle.trim()) {
      setBucketError('Add an activity you would love to do together.');
      return;
    }
    setBucketSaving(true);
    setBucketError(null);
    try {
      const created = await api.addBucketItem(bucketTitle.trim(), bucketCategory);
      onUpdateBucketList([created, ...data.bucketList]);
      setBucketTitle('');
    } catch (err) {
      setBucketError(err instanceof Error ? err.message : 'Unable to add item.');
    } finally {
      setBucketSaving(false);
    }
  }

  async function handleToggleBucket(item: BucketItem) {
    try {
      const updated = await api.toggleBucketItem(item.id, !item.completed);
      onUpdateBucketList(
        data.bucketList.map((b) => (b.id === item.id ? updated : b))
      );
    } catch {
      // Keep current state on network failure
    }
  }

  async function handleDeleteBucket(id: string) {
    try {
      await api.deleteBucketItem(id);
      onUpdateBucketList(data.bucketList.filter((b) => b.id !== id));
    } catch {
      // Keep current state
    }
  }

  async function handleAddJoke(e: FormEvent) {
    e.preventDefault();
    if (!jokeTitle.trim() || !jokeStory.trim()) {
      setJokeError('Give this inside joke a short title and the real story behind it.');
      return;
    }
    setJokeSaving(true);
    setJokeError(null);
    try {
      const created = await api.addInsideJoke({
        title: jokeTitle.trim(),
        clue: jokeClue.trim() || 'Tap to remember',
        story: jokeStory.trim(),
      });
      onAddInsideJoke(created);
      setJokeTitle('');
      setJokeClue('');
      setJokeStory('');
    } catch (err) {
      setJokeError(err instanceof Error ? err.message : 'Unable to save note.');
    } finally {
      setJokeSaving(false);
    }
  }

  const filteredBucket = data.bucketList.filter((item) => {
    if (bucketFilter === 'todo') return !item.completed;
    if (bucketFilter === 'done') return item.completed;
    return true;
  });

  const completedCount = data.bucketList.filter((b) => b.completed).length;

  return (
    <div className="space-y-7 pb-8">
      {/* Champagne-Editorial Header */}
      <section className="rounded-3xl border border-[#F3D69B]/75 bg-gradient-to-br from-[#FDF6E6] via-[#FFF9F5] to-[#FAF1EA] p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-[#7A541C]">
              Our Little World · Keepsakes &amp; Shared Dreams
            </p>
            <h1 className="mt-2 font-serif text-3xl font-semibold text-[#5B3A12] sm:text-4xl">
              Real Chapters, Warmth &amp; Someday Plans
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#6E5639]">
              A quiet corner for genuine appreciation, real moments added over
              time, inside jokes worth keeping, and everything on our bucket
              list.
            </p>
          </div>

          <button
            type="button"
            onClick={handleMoonTap}
            aria-label="Crescent moon ornament"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-[#F3D69B] bg-white/80 text-[#702B4C] transition-transform hover:scale-105 active:scale-95"
          >
            <Moon className="h-4 w-4" />
          </button>
        </div>

        <AnimatePresence>
          {easterEggOpen && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#702B4C]/15 bg-white px-4 py-3 text-xs text-[#702B4C]"
            >
              <span>
                Secret moon note found: somehow juggling eight thoughts and still
                making everyone smile — classic Octopus 🐙 talent.
              </span>
              <button
                type="button"
                onClick={() => setEasterEggOpen(false)}
                className="font-semibold underline underline-offset-2"
              >
                Tuck away
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Tabs */}
      <div className="grid grid-cols-2 gap-1.5 rounded-2xl bg-[#FAF1EA] p-1.5 sm:grid-cols-4">
        {[
          { id: 'appreciate' as WorldTab, label: 'Things I Appreciate' },
          { id: 'timeline' as WorldTab, label: 'Memory Timeline' },
          { id: 'jokes' as WorldTab, label: 'Inside-Joke Vault' },
          { id: 'bucket' as WorldTab, label: 'Our Bucket List' },
        ].map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`min-h-[44px] rounded-xl px-3 py-2 text-xs font-semibold whitespace-nowrap transition-colors sm:text-sm ${
              tab === item.id
                ? 'bg-white text-[#702B4C] shadow-xs'
                : 'text-[#6A525E] hover:text-[#702B4C]'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* B. Things I Appreciate About You */}
      {tab === 'appreciate' && (
        <section className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-serif text-2xl font-semibold text-[#702B4C] sm:text-3xl">
                Things I Appreciate About You
              </h2>
              <p className="text-xs text-[#6A525E]">
                {data.compliments.length} curated notes · Tap shuffle for a random highlight
              </p>
            </div>
            <button
              type="button"
              onClick={pickRandomCompliment}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-[#702B4C] px-4 py-2 text-xs font-semibold text-[#FFF9F5] hover:bg-[#531D38]"
            >
              <Shuffle className="h-3.5 w-3.5" />
              <span>Spotlight a Note</span>
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.compliments.map((item) => {
              const isHighlighted = spotlightId === item.id;
              return (
                <article
                  key={item.id}
                  className={`flex flex-col justify-between rounded-3xl border p-6 transition-all ${
                    isHighlighted
                      ? 'border-[#702B4C] bg-[#FFF0F5] shadow-md'
                      : 'border-[#702B4C]/10 bg-white'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between text-xs text-[#9274B8]">
                      <span className="font-semibold">{item.category}</span>
                      <Heart
                        className="h-4 w-4 text-[#702B4C]"
                        fill={isHighlighted ? 'currentColor' : 'none'}
                      />
                    </div>
                    <h3 className="mt-3 font-serif text-2xl font-semibold text-[#702B4C]">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-[#2E1A24]">
                      {item.text}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}

      {/* A. Memory Timeline (Zero Invented Memories) */}
      {tab === 'timeline' && (
        <section className="space-y-5">
          <div>
            <h2 className="font-serif text-2xl font-semibold text-[#702B4C] sm:text-3xl">
              Memory Timeline
            </h2>
            <p className="text-xs text-[#6A525E]">
              Reserved strictly for real moments, genuine milestones, and favorite days.
            </p>
          </div>

          {data.memories.length === 0 ? (
            <div className="rounded-3xl border border-[#F3D69B]/80 bg-white p-8 text-center sm:p-10">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FDF6E6] text-[#702B4C]">
                <Clock className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-serif text-2xl font-semibold text-[#702B4C]">
                Our First Chapter Awaits
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-[#6A525E]">
                No placeholder dates or invented stories here. Every real moment
                and genuine milestone we share will unfold right here on our
                timeline.
              </p>
            </div>
          ) : (
            <ol className="relative space-y-5 pl-6 before:absolute before:top-2 before:bottom-2 before:left-2 before:w-px before:bg-[#702B4C]/20">
              {data.memories.map((mem) => (
                <li
                  key={mem.id}
                  className="relative rounded-3xl border border-[#702B4C]/12 bg-white p-6"
                >
                  <span
                    aria-hidden="true"
                    className="absolute top-7 -left-[22px] h-3.5 w-3.5 rounded-full border-2 border-[#FFF9F5] bg-[#702B4C]"
                  />
                  <p className="text-xs font-semibold text-[#9274B8]">
                    {mem.dateLabel} · {mem.category}
                  </p>
                  <h3 className="mt-1.5 font-serif text-2xl font-semibold text-[#702B4C]">
                    {mem.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#2E1A24]">
                    {mem.description}
                  </p>
                </li>
              ))}
            </ol>
          )}
        </section>
      )}

      {/* C. Inside-Joke Vault */}
      {tab === 'jokes' && (
        <section className="grid gap-6 lg:grid-cols-12">
          <div className="space-y-4 lg:col-span-7">
            <div>
              <h2 className="font-serif text-2xl font-semibold text-[#702B4C] sm:text-3xl">
                Inside-Joke Vault
              </h2>
              <p className="text-xs text-[#6A525E]">
                A private shelf for genuine laughs, funny lines, and moments only we get.
              </p>
            </div>

            {data.insideJokes.length === 0 ? (
              <div className="rounded-3xl border border-[#9274B8]/20 bg-[#F6F2FF]/70 p-7 text-center">
                <Sparkles className="mx-auto h-7 w-7 text-[#9274B8]" />
                <h3 className="mt-3 font-serif text-2xl font-semibold text-[#4B2F6E]">
                  The Vault Is Ready for Its First Laugh
                </h3>
                <p className="mx-auto mt-2 max-w-sm text-sm text-[#5C4B72]">
                  Seal a real funny conversation or special reference using the
                  form beside this card.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {data.insideJokes.map((joke) => {
                  const unlocked = unlockedJokeIds.includes(joke.id);
                  return (
                    <div
                      key={joke.id}
                      className="rounded-3xl border border-[#702B4C]/12 bg-white p-5"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-serif text-xl font-semibold text-[#702B4C]">
                            {joke.title}
                          </h3>
                          <p className="mt-0.5 text-xs text-[#9274B8]">
                            Clue: {joke.clue}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setUnlockedJokeIds((prev) =>
                              prev.includes(joke.id)
                                ? prev.filter((id) => id !== joke.id)
                                : [...prev, joke.id]
                            )
                          }
                          className="inline-flex min-h-[40px] shrink-0 items-center gap-1.5 rounded-xl bg-[#FAF1EA] px-3.5 py-2 text-xs font-semibold text-[#702B4C] hover:bg-[#FFDCE8]/60"
                        >
                          <LockOpen className="h-3.5 w-3.5" />
                          <span>{unlocked ? 'Hide' : 'Unlock'}</span>
                        </button>
                      </div>
                      {unlocked && (
                        <p className="mt-3 border-t border-[#702B4C]/10 pt-3 text-sm leading-relaxed text-[#2E1A24]">
                          {joke.story}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <form
            onSubmit={handleAddJoke}
            noValidate
            className="h-fit space-y-4 rounded-3xl border border-[#702B4C]/12 bg-white p-6 lg:col-span-5"
          >
            <div>
              <h3 className="font-serif text-2xl font-semibold text-[#702B4C]">
                Seal an Inside Joke
              </h3>
              <p className="mt-0.5 text-xs text-[#6A525E]">
                Add a real reference so we never forget it.
              </p>
            </div>

            <div>
              <label
                htmlFor="joke-title"
                className="mb-1 block text-xs font-semibold text-[#2E1A24]"
              >
                Short Title
              </label>
              <input
                id="joke-title"
                type="text"
                value={jokeTitle}
                onChange={(e) => setJokeTitle(e.target.value)}
                placeholder="e.g., The Great Coffee Debate"
                className="min-h-[44px] w-full rounded-xl border border-[#702B4C]/20 bg-[#FFF9F5] px-3.5 text-sm text-[#2E1A24] focus:border-[#702B4C] focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="joke-clue"
                className="mb-1 block text-xs font-semibold text-[#2E1A24]"
              >
                Playful Clue (Optional)
              </label>
              <input
                id="joke-clue"
                type="text"
                value={jokeClue}
                onChange={(e) => setJokeClue(e.target.value)}
                placeholder="One-line hint before unlocking"
                className="min-h-[44px] w-full rounded-xl border border-[#702B4C]/20 bg-[#FFF9F5] px-3.5 text-sm text-[#2E1A24] focus:border-[#702B4C] focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="joke-story"
                className="mb-1 block text-xs font-semibold text-[#2E1A24]"
              >
                The Story
              </label>
              <textarea
                id="joke-story"
                rows={3}
                value={jokeStory}
                onChange={(e) => setJokeStory(e.target.value)}
                placeholder="What happened that still makes us laugh..."
                className="w-full rounded-xl border border-[#702B4C]/20 bg-[#FFF9F5] p-3.5 text-sm text-[#2E1A24] focus:border-[#702B4C] focus:outline-none"
              />
            </div>

            {jokeError && (
              <p role="alert" className="text-xs font-medium text-[#702B4C]">
                {jokeError}
              </p>
            )}

            <button
              type="submit"
              disabled={jokeSaving}
              className="inline-flex min-h-[46px] w-full items-center justify-center gap-2 rounded-xl bg-[#702B4C] px-4 py-2.5 text-sm font-semibold text-[#FFF9F5] hover:bg-[#531D38] disabled:opacity-60"
            >
              <BookHeart className="h-4 w-4" />
              <span>{jokeSaving ? 'Sealing...' : 'Add to Vault'}</span>
            </button>
          </form>
        </section>
      )}

      {/* D. Our Bucket List */}
      {tab === 'bucket' && (
        <section className="space-y-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="font-serif text-2xl font-semibold text-[#702B4C] sm:text-3xl">
                Our Bucket List
              </h2>
              <p className="text-xs text-[#6A525E] tabular-nums">
                {completedCount} of {data.bucketList.length} completed
              </p>
            </div>

            <div className="flex items-center gap-1 rounded-xl bg-[#FAF1EA] p-1">
              {[
                { id: 'all' as const, label: 'All' },
                { id: 'todo' as const, label: 'To Do' },
                { id: 'done' as const, label: 'Completed' },
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setBucketFilter(f.id)}
                  className={`min-h-[36px] rounded-lg px-3 text-xs font-semibold transition-colors ${
                    bucketFilter === f.id
                      ? 'bg-white text-[#702B4C] shadow-xs'
                      : 'text-[#6A525E]'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <form
            onSubmit={handleAddBucket}
            noValidate
            className="flex flex-col gap-2.5 rounded-3xl border border-[#702B4C]/12 bg-white p-4 sm:flex-row sm:items-center"
          >
            <label htmlFor="bucket-input" className="sr-only">
              Add a bucket list activity
            </label>
            <input
              id="bucket-input"
              type="text"
              value={bucketTitle}
              onChange={(e) => {
                setBucketTitle(e.target.value);
                if (bucketError) setBucketError(null);
              }}
              placeholder="Add an activity we should do together..."
              className="min-h-[46px] flex-1 rounded-xl border border-[#702B4C]/18 bg-[#FFF9F5] px-4 text-sm text-[#2E1A24] focus:border-[#702B4C] focus:outline-none"
            />
            <select
              aria-label="Activity category"
              value={bucketCategory}
              onChange={(e) => setBucketCategory(e.target.value)}
              className="min-h-[46px] rounded-xl border border-[#702B4C]/18 bg-[#FFF9F5] px-3 text-sm text-[#2E1A24] focus:border-[#702B4C] focus:outline-none"
            >
              {['Cozy', 'Food', 'Adventure', 'Music', 'Travel'].map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            <button
              type="submit"
              disabled={bucketSaving}
              className="inline-flex min-h-[46px] shrink-0 items-center justify-center gap-1.5 rounded-xl bg-[#702B4C] px-5 text-sm font-semibold text-[#FFF9F5] hover:bg-[#531D38] disabled:opacity-60"
            >
              <Plus className="h-4 w-4" />
              <span>Add</span>
            </button>
          </form>

          {bucketError && (
            <p role="alert" className="text-xs font-medium text-[#702B4C]">
              {bucketError}
            </p>
          )}

          {filteredBucket.length === 0 ? (
            <div className="rounded-3xl border border-[#702B4C]/10 bg-white p-8 text-center text-sm text-[#6A525E]">
              No items in this view yet. Add a dream above!
            </div>
          ) : (
            <ul className="space-y-2.5">
              {filteredBucket.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center gap-3 rounded-2xl border border-[#702B4C]/10 bg-white px-4 py-3.5"
                >
                  <button
                    type="button"
                    onClick={() => handleToggleBucket(item)}
                    aria-label={
                      item.completed
                        ? `Mark "${item.title}" as not completed`
                        : `Mark "${item.title}" as completed`
                    }
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border transition-colors ${
                      item.completed
                        ? 'border-[#702B4C] bg-[#702B4C] text-[#FFF9F5]'
                        : 'border-[#702B4C]/25 bg-[#FFF9F5] text-transparent hover:border-[#702B4C]'
                    }`}
                  >
                    <Check className="h-4 w-4" />
                  </button>
                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-sm font-medium ${
                        item.completed
                          ? 'text-[#6A525E] line-through'
                          : 'text-[#2E1A24]'
                      }`}
                    >
                      {item.title}
                    </p>
                    <p className="text-xs text-[#9274B8]">{item.category}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteBucket(item.id)}
                    aria-label={`Remove "${item.title}" from bucket list`}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[#6A525E] transition-colors hover:bg-[#FFDCE8]/60 hover:text-[#702B4C]"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}
