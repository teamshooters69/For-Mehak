import { useState, type FormEvent } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  CalendarHeart,
  Compass,
  Dices,
  Plus,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { api } from '../lib/api';
import type {
  ActiveSessionState,
  DatePlan,
  DatePlanStatus,
  DestinationCategory,
  DestinationIdea,
  RecipientUniversePayload,
} from '../types/universe';
import dateArtUrl from '../assets/images/date_adventure_art_1795155824086.jpg';

interface DateAdventureViewProps {
  data: RecipientUniversePayload;
  onUpdateDestinations: (items: DestinationIdea[]) => void;
  onUpdateDatePlans: (items: DatePlan[]) => void;
  onSessionUpdate: (state: ActiveSessionState) => void;
}

const DATE_ART_URL = dateArtUrl;

const VIRTUAL_DATE_IDEAS = [
  {
    title: 'Cozy Movie Night & Snack Rating',
    vibe: 'Cozy',
    detail: 'Pick a film together, bring two contrasting snacks, and rate every plot twist afterward.',
  },
  {
    title: 'Try a Brand-New Restaurant',
    vibe: 'Food',
    detail: 'Order each other’s appetizer and dessert as a surprise and compare favorites.',
  },
  {
    title: 'Create a Shared Soundtrack',
    vibe: 'Music',
    detail: 'Take turns adding ten songs that match late-night drives, rainy afternoons, and sunny mornings.',
  },
  {
    title: 'Golden-Hour Sunset Walk',
    vibe: 'Outdoors',
    detail: 'Grab warm drinks, pick a scenic path, and walk with nowhere to hurry.',
  },
  {
    title: 'Two-Player Mini-Game Tournament',
    vibe: 'Playful',
    detail: 'Play three rounds across Memory Match, Reaction Rush, and Code Breaker — winner picks dessert.',
  },
  {
    title: 'Unhurried Midnight Conversation',
    vibe: 'Deep',
    detail: 'Phones on silent, tea or hot chocolate poured, and five questions from the Love Zone.',
  },
  {
    title: 'Bookstore Swap Challenge',
    vibe: 'Creative',
    detail: 'Wander a bookstore for twenty minutes and pick one book the other person would secretly love.',
  },
];

const DEST_CATEGORIES: DestinationCategory[] = [
  'Café',
  'Restaurant',
  'Park',
  'Shopping',
  'Travel',
];

export function DateAdventureView({
  data,
  onUpdateDestinations,
  onUpdateDatePlans,
  onSessionUpdate,
}: DateAdventureViewProps) {
  const [bannerFailed, setBannerFailed] = useState(false);

  // A. Where Should We Go?
  const [destName, setDestName] = useState('');
  const [destCat, setDestCat] = useState<DestinationCategory>('Café');
  const [destVibe, setDestVibe] = useState('');
  const [destError, setDestError] = useState<string | null>(null);
  const [destSaving, setDestSaving] = useState(false);
  const [pickedDest, setPickedDest] = useState<DestinationIdea | null>(null);

  // B. Virtual Date Roulette
  const [rouletteIdea, setRouletteIdea] = useState(VIRTUAL_DATE_IDEAS[0]);
  const [rouletteSpinning, setRouletteSpinning] = useState(false);

  // C. Date Planner
  const [planIdea, setPlanIdea] = useState('');
  const [planDate, setPlanDate] = useState('');
  const [planNotes, setPlanNotes] = useState('');
  const [planStatus, setPlanStatus] = useState<DatePlanStatus>('Upcoming');
  const [planError, setPlanError] = useState<string | null>(null);
  const [planSaving, setPlanSaving] = useState(false);

  async function handleAddDestination(e: FormEvent) {
    e.preventDefault();
    if (!destName.trim()) {
      setDestError('Enter a spot or destination idea first.');
      return;
    }
    setDestSaving(true);
    setDestError(null);
    try {
      const created = await api.addDestination({
        name: destName.trim(),
        category: destCat,
        vibeNote: destVibe.trim() || 'A lovely spot to explore together.',
      });
      onUpdateDestinations([created, ...data.destinations]);
      setDestName('');
      setDestVibe('');
    } catch (err) {
      setDestError(err instanceof Error ? err.message : 'Could not save spot.');
    } finally {
      setDestSaving(false);
    }
  }

  async function handleDeleteDestination(id: string) {
    try {
      await api.deleteDestination(id);
      onUpdateDestinations(data.destinations.filter((d) => d.id !== id));
      if (pickedDest?.id === id) setPickedDest(null);
    } catch {
      // Keep current list
    }
  }

  function pickRandomDestination() {
    if (data.destinations.length === 0) return;
    const pool =
      data.destinations.length > 1
        ? data.destinations.filter((d) => d.id !== pickedDest?.id)
        : data.destinations;
    const chosen = pool[Math.floor(Math.random() * pool.length)];
    setPickedDest(chosen);
    void api
      .logActivityEvent({
        type: 'date_idea_selected',
        title: `Random Destination: ${chosen.name}`,
        detail: `${chosen.category} · ${chosen.vibeNote}`,
        itemKey: chosen.id,
      })
      .then((res) => onSessionUpdate(res.activeSession))
      .catch(() => {
        // Non-blocking
      });
  }

  function spinRoulette() {
    if (rouletteSpinning) return;
    setRouletteSpinning(true);
    let ticks = 0;
    const interval = window.setInterval(() => {
      ticks++;
      const next =
        VIRTUAL_DATE_IDEAS[
          Math.floor(Math.random() * VIRTUAL_DATE_IDEAS.length)
        ];
      setRouletteIdea(next);
      if (ticks >= 8) {
        window.clearInterval(interval);
        setRouletteSpinning(false);
        void api
          .logActivityEvent({
            type: 'date_idea_selected',
            title: `Date Roulette: ${next.title}`,
            detail: `${next.vibe} · ${next.detail}`,
          })
          .then((res) => onSessionUpdate(res.activeSession))
          .catch(() => {
            // Non-blocking
          });
      }
    }, 90);
  }

  async function handleAddPlan(e: FormEvent) {
    e.preventDefault();
    if (!planIdea.trim()) {
      setPlanError('Enter a date idea to save to the planner.');
      return;
    }
    setPlanSaving(true);
    setPlanError(null);
    try {
      const created = await api.addDatePlan({
        idea: planIdea.trim(),
        plannedDate: planDate,
        notes: planNotes.trim(),
        status: planStatus,
      });
      onUpdateDatePlans([created, ...data.datePlans]);
      setPlanIdea('');
      setPlanDate('');
      setPlanNotes('');
    } catch (err) {
      setPlanError(err instanceof Error ? err.message : 'Unable to save plan.');
    } finally {
      setPlanSaving(false);
    }
  }

  async function handlePlanStatus(id: string, status: DatePlanStatus) {
    try {
      const updated = await api.updateDatePlanStatus(id, status);
      onUpdateDatePlans(data.datePlans.map((p) => (p.id === id ? updated : p)));
    } catch {
      // Ignore
    }
  }

  async function handleDeletePlan(id: string) {
    try {
      await api.deleteDatePlan(id);
      onUpdateDatePlans(data.datePlans.filter((p) => p.id !== id));
    } catch {
      // Ignore
    }
  }

  return (
    <div className="space-y-8 pb-8">
      {/* Twilight Balcony Café Banner */}
      <section className="overflow-hidden rounded-3xl border border-[#F3D69B]/70 bg-[#FDF6E6]">
        <div className="grid items-stretch md:grid-cols-12">
          <div className="flex flex-col justify-center p-6 sm:p-8 md:col-span-6">
            <p className="text-xs font-semibold text-[#7A541C]">
              Date &amp; Adventure Zone · Idea Picker &amp; Planner
            </p>
            <h1 className="mt-2 font-serif text-3xl font-semibold text-[#702B4C] sm:text-4xl">
              Plot Our Next Favorite Evening
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-[#6A525E]">
              Collect café and getaway ideas, spin the virtual date roulette,
              and keep upcoming plans neatly organized — purely creative
              planning, zero location tracking.
            </p>
          </div>
          <div className="relative min-h-[190px] bg-[#702B4C] md:col-span-6">
            {!bannerFailed ? (
              <img
                src={DATE_ART_URL}
                alt="Twilight terrace café with warm string lights overlooking lavender hills"
                referrerPolicy="no-referrer"
                onError={() => setBannerFailed(true)}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center p-6 text-[#F3D69B]">
                <CalendarHeart className="h-10 w-10" />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* B. Virtual Date Roulette */}
      <section className="rounded-3xl border border-[#702B4C]/12 bg-white p-6 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-[#9274B8]">
              Virtual Date Roulette
            </p>
            <h2 className="mt-0.5 font-serif text-2xl font-semibold text-[#702B4C] sm:text-3xl">
              Need Instant Inspiration?
            </h2>
          </div>
          <button
            type="button"
            onClick={spinRoulette}
            disabled={rouletteSpinning}
            className="inline-flex min-h-[46px] items-center gap-2 rounded-xl bg-[#702B4C] px-5 py-2.5 text-sm font-semibold text-[#FFF9F5] hover:bg-[#531D38] disabled:opacity-60"
          >
            <Dices className="h-4 w-4" />
            <span>{rouletteSpinning ? 'Rolling...' : 'Roll Date Idea'}</span>
          </button>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={rouletteIdea.title}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-5 flex flex-col justify-between gap-4 rounded-2xl bg-[#FDF6E6] p-5 sm:flex-row sm:items-center"
          >
            <div>
              <p className="text-xs font-semibold text-[#7A541C]">
                {rouletteIdea.vibe} Mood
              </p>
              <h3 className="mt-1 font-serif text-2xl font-semibold text-[#702B4C]">
                {rouletteIdea.title}
              </h3>
              <p className="mt-1 text-sm text-[#2E1A24]">
                {rouletteIdea.detail}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setPlanIdea(rouletteIdea.title);
                setPlanNotes(rouletteIdea.detail);
              }}
              className="min-h-[44px] shrink-0 rounded-xl border border-[#702B4C]/25 bg-white px-4 py-2 text-xs font-semibold text-[#702B4C] hover:bg-[#FFDCE8]/45"
            >
              Send to Planner
            </button>
          </motion.div>
        </AnimatePresence>
      </section>

      {/* A. Where Should We Go? & C. Date Planner */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* Where Should We Go? */}
        <section className="space-y-5 rounded-3xl border border-[#702B4C]/12 bg-white p-6 lg:col-span-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold text-[#9274B8]">
                Where Should We Go?
              </p>
              <h2 className="font-serif text-2xl font-semibold text-[#702B4C]">
                Destination Idea Jar
              </h2>
            </div>
            <button
              type="button"
              onClick={pickRandomDestination}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-[#9274B8] px-4 py-2 text-xs font-semibold text-white hover:bg-[#702B4C]"
            >
              <Compass className="h-4 w-4" />
              <span>Pick One Randomly</span>
            </button>
          </div>

          <AnimatePresence>
            {pickedDest && (
              <motion.div
                key={pickedDest.id}
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                className="rounded-2xl border border-[#702B4C]/20 bg-[#F6F2FF] p-4"
              >
                <p className="text-xs font-semibold text-[#5B3E82]">
                  Selected Spot · {pickedDest.category}
                </p>
                <p className="mt-1 font-serif text-2xl font-semibold text-[#702B4C]">
                  {pickedDest.name}
                </p>
                <p className="mt-1 text-xs text-[#5C4B72]">
                  {pickedDest.vibeNote}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleAddDestination} noValidate className="space-y-3">
            <div className="grid gap-2.5 sm:grid-cols-3">
              <input
                type="text"
                aria-label="Destination idea name"
                value={destName}
                onChange={(e) => {
                  setDestName(e.target.value);
                  if (destError) setDestError(null);
                }}
                placeholder="Café, park, city..."
                className="min-h-[44px] rounded-xl border border-[#702B4C]/20 bg-[#FFF9F5] px-3.5 text-sm text-[#2E1A24] focus:border-[#702B4C] focus:outline-none sm:col-span-2"
              />
              <select
                aria-label="Destination category"
                value={destCat}
                onChange={(e) => setDestCat(e.target.value as DestinationCategory)}
                className="min-h-[44px] rounded-xl border border-[#702B4C]/20 bg-[#FFF9F5] px-3 text-sm text-[#2E1A24] focus:border-[#702B4C] focus:outline-none"
              >
                {DEST_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2.5">
              <input
                type="text"
                aria-label="Destination vibe note"
                value={destVibe}
                onChange={(e) => setDestVibe(e.target.value)}
                placeholder="What makes it special? (optional)"
                className="min-h-[44px] flex-1 rounded-xl border border-[#702B4C]/20 bg-[#FFF9F5] px-3.5 text-sm text-[#2E1A24] focus:border-[#702B4C] focus:outline-none"
              />
              <button
                type="submit"
                disabled={destSaving}
                className="inline-flex min-h-[44px] shrink-0 items-center gap-1.5 rounded-xl bg-[#702B4C] px-4 text-xs font-semibold text-[#FFF9F5] hover:bg-[#531D38]"
              >
                <Plus className="h-4 w-4" />
                <span>Add</span>
              </button>
            </div>
            {destError && (
              <p role="alert" className="text-xs font-medium text-[#702B4C]">
                {destError}
              </p>
            )}
          </form>

          <ul className="divide-y divide-[#702B4C]/10">
            {data.destinations.map((d) => (
              <li
                key={d.id}
                className="flex items-center justify-between gap-3 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[#2E1A24]">
                    {d.name}
                  </p>
                  <p className="text-xs text-[#6A525E]">
                    {d.category} · {d.vibeNote}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteDestination(d.id)}
                  aria-label={`Remove destination ${d.name}`}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[#6A525E] hover:bg-[#FFDCE8]/60 hover:text-[#702B4C]"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </li>
            ))}
          </ul>
        </section>

        {/* C. Date Planner */}
        <section className="space-y-5 rounded-3xl border border-[#702B4C]/12 bg-white p-6 lg:col-span-6">
          <div>
            <p className="text-xs font-semibold text-[#9274B8]">Date Planner</p>
            <h2 className="font-serif text-2xl font-semibold text-[#702B4C]">
              Upcoming &amp; Dream Plans
            </h2>
          </div>

          <form onSubmit={handleAddPlan} noValidate className="space-y-3">
            <input
              type="text"
              aria-label="Date idea"
              value={planIdea}
              onChange={(e) => {
                setPlanIdea(e.target.value);
                if (planError) setPlanError(null);
              }}
              placeholder="Date idea (e.g., Late-night gelato walk)"
              className="min-h-[44px] w-full rounded-xl border border-[#702B4C]/20 bg-[#FFF9F5] px-3.5 text-sm text-[#2E1A24] focus:border-[#702B4C] focus:outline-none"
            />
            <div className="grid gap-2.5 sm:grid-cols-2">
              <input
                type="date"
                aria-label="Planned date"
                value={planDate}
                onChange={(e) => setPlanDate(e.target.value)}
                className="min-h-[44px] rounded-xl border border-[#702B4C]/20 bg-[#FFF9F5] px-3.5 text-sm text-[#2E1A24] focus:border-[#702B4C] focus:outline-none"
              />
              <select
                aria-label="Plan status"
                value={planStatus}
                onChange={(e) => setPlanStatus(e.target.value as DatePlanStatus)}
                className="min-h-[44px] rounded-xl border border-[#702B4C]/20 bg-[#FFF9F5] px-3 text-sm text-[#2E1A24] focus:border-[#702B4C] focus:outline-none"
              >
                <option value="Upcoming">Upcoming</option>
                <option value="Dreaming">Dreaming</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
            <textarea
              rows={2}
              aria-label="Notes for the date"
              value={planNotes}
              onChange={(e) => setPlanNotes(e.target.value)}
              placeholder="Little notes, dress code, or playlist ideas..."
              className="w-full rounded-xl border border-[#702B4C]/20 bg-[#FFF9F5] p-3.5 text-sm text-[#2E1A24] focus:border-[#702B4C] focus:outline-none"
            />
            {planError && (
              <p role="alert" className="text-xs font-medium text-[#702B4C]">
                {planError}
              </p>
            )}
            <button
              type="submit"
              disabled={planSaving}
              className="inline-flex min-h-[46px] w-full items-center justify-center gap-2 rounded-xl bg-[#702B4C] px-4 py-2.5 text-sm font-semibold text-[#FFF9F5] hover:bg-[#531D38]"
            >
              <Sparkles className="h-4 w-4" />
              <span>{planSaving ? 'Saving...' : 'Save to Date Planner'}</span>
            </button>
          </form>

          <div className="space-y-3">
            {data.datePlans.map((plan) => (
              <article
                key={plan.id}
                className="rounded-2xl border border-[#702B4C]/10 bg-[#FFF9F5] p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-semibold text-[#9274B8]">
                      {plan.status}
                      {plan.plannedDate ? ` · ${plan.plannedDate}` : ''}
                    </p>
                    <h3 className="mt-0.5 font-serif text-xl font-semibold text-[#702B4C]">
                      {plan.idea}
                    </h3>
                    {plan.notes && (
                      <p className="mt-1 text-xs leading-relaxed text-[#6A525E]">
                        {plan.notes}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeletePlan(plan.id)}
                    aria-label={`Delete date plan ${plan.idea}`}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[#6A525E] hover:bg-[#FFDCE8]/60 hover:text-[#702B4C]"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {(['Dreaming', 'Upcoming', 'Completed'] as const).map(
                    (st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => handlePlanStatus(plan.id, st)}
                        className={`min-h-[34px] rounded-lg px-2.5 text-xs font-semibold transition-colors ${
                          plan.status === st
                            ? 'bg-[#702B4C] text-[#FFF9F5]'
                            : 'bg-white text-[#6A525E] hover:text-[#702B4C]'
                        }`}
                      >
                        {st}
                      </button>
                    )
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
