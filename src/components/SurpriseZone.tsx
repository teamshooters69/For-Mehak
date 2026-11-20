import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  Disc3,
  Eye,
  Gift,
  Mail,
  MailOpen,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { api } from '../lib/api';
import {
  calculateWheelLandingIndex,
  computeTargetRotationForSegment,
} from '../utils/logic';
import type {
  ActiveSessionState,
  MysteryBoxReward,
  RecipientUniversePayload,
  ScratchCardItem,
  SecretEnvelope,
  WheelSegment,
} from '../types/universe';
import surpriseBannerUrl from '../assets/images/surprise_envelopes_art_1795155824021.jpg';

const SURPRISE_BANNER_URL = surpriseBannerUrl;

type SurpriseTab = 'scratch' | 'wheel' | 'envelopes' | 'boxes';

// A. Interactive Canvas Scratch & Reveal Card
function ScratchCardSection({
  cards,
  revealedIds,
  sessionId,
  onSessionUpdate,
}: {
  cards: ScratchCardItem[];
  revealedIds: string[];
  sessionId: string;
  onSessionUpdate: (state: ActiveSessionState) => void;
}) {
  const [cardIdx, setCardIdx] = useState(0);
  const [localRevealed, setLocalRevealed] = useState(false);
  const [scratchProgress, setScratchProgress] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const drawingRef = useRef(false);
  const scratchedCountRef = useRef(0);
  const loggedRef = useRef<Set<string>>(new Set());

  const activeCard = cards.length > 0 ? cards[cardIdx % cards.length] : null;
  const isAlreadyRevealedInSession = activeCard
    ? revealedIds.includes(activeCard.id)
    : false;
  const revealed = localRevealed || isAlreadyRevealedInSession;

  useEffect(() => {
    loggedRef.current = new Set();
    setCardIdx(0);
    setLocalRevealed(false);
    setScratchProgress(0);
    scratchedCountRef.current = 0;
  }, [sessionId]);

  function markRevealed(card: ScratchCardItem) {
    setLocalRevealed(true);
    const dedupeKey = `${sessionId}:${card.id}`;
    if (loggedRef.current.has(dedupeKey) || revealedIds.includes(card.id)) {
      return;
    }
    loggedRef.current.add(dedupeKey);
    void api
      .logActivityEvent({
        type: 'scratch_revealed',
        title: card.title,
        detail: `${card.category}: ${card.secretText}`,
        itemKey: card.id,
      })
      .then((res) => onSessionUpdate(res.activeSession))
      .catch(() => {
        // Non-blocking
      });
  }

  useEffect(() => {
    setLocalRevealed(isAlreadyRevealedInSession);
    setScratchProgress(isAlreadyRevealedInSession ? 100 : 0);
    scratchedCountRef.current = 0;

    if (isAlreadyRevealedInSession) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.globalCompositeOperation = 'source-over';

    const grad = ctx.createLinearGradient(0, 0, width, height);
    grad.addColorStop(0, '#E9DFFF');
    grad.addColorStop(0.5, '#F3D69B');
    grad.addColorStop(1, '#FFDCE8');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = 'rgba(112, 43, 76, 0.14)';
    for (let x = 18; x < width; x += 28) {
      for (let y = 18; y < height; y += 28) {
        ctx.beginPath();
        ctx.arc(x, y, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.fillStyle = '#702B4C';
    ctx.font = '600 17px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Scratch gently to reveal', width / 2, height / 2 - 4);
    ctx.font = '500 13px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = 'rgba(112, 43, 76, 0.72)';
    ctx.fillText(
      'Drag your finger or cursor across the foil',
      width / 2,
      height / 2 + 20
    );
  }, [cardIdx, cards.length, isAlreadyRevealedInSession, sessionId]);

  function scratchAt(clientX: number, clientY: number) {
    const canvas = canvasRef.current;
    if (!canvas || revealed || !activeCard) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * canvas.width;
    const y = ((clientY - rect.top) / rect.height) * canvas.height;

    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(x, y, 26, 0, Math.PI * 2);
    ctx.fill();

    scratchedCountRef.current += 1;
    const approx = Math.min(
      100,
      Math.round((scratchedCountRef.current / 36) * 100)
    );
    setScratchProgress(approx);
    if (approx >= 85) {
      markRevealed(activeCard);
    }
  }

  if (!activeCard) {
    return (
      <div className="rounded-3xl bg-white p-8 text-center text-sm text-[#6A525E]">
        No scratch cards available yet.
      </div>
    );
  }

  const cardBg =
    activeCard.accent === 'champagne'
      ? 'bg-[#FDF6E6]'
      : activeCard.accent === 'lavender'
        ? 'bg-[#F6F2FF]'
        : 'bg-[#FFF0F5]';

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="font-serif text-2xl font-semibold text-[#4B2F6E] sm:text-3xl">
            Scratch &amp; Reveal
          </h2>
          <p className="text-xs text-[#5C4B72]">
            {activeCard.title} · {activeCard.category}
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          {cards.map((c, idx) => {
            const isCardRevealed = revealedIds.includes(c.id);
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setCardIdx(idx)}
                aria-label={`Select scratch card ${idx + 1}: ${c.title}${isCardRevealed ? ' (revealed)' : ''}`}
                className={`h-10 min-w-[40px] rounded-xl px-3 text-xs font-semibold transition-colors ${
                  idx === cardIdx % cards.length
                    ? 'bg-[#702B4C] text-[#FFF9F5]'
                    : isCardRevealed
                      ? 'bg-[#FFDCE8] text-[#702B4C]'
                      : 'bg-white text-[#5C4B72] hover:bg-[#E9DFFF]'
                }`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </div>

      <div
        className={`relative mx-auto max-w-xl overflow-hidden rounded-3xl border border-[#702B4C]/15 ${cardBg} p-7 shadow-sm sm:p-9`}
      >
        <div className="flex min-h-[210px] flex-col items-center justify-center text-center">
          <Sparkles className="h-6 w-6 text-[#702B4C]" />
          <p className="mt-2 text-xs font-semibold text-[#9274B8]">
            {activeCard.category}
          </p>
          <p className="mt-3 font-serif text-2xl leading-snug font-semibold text-[#702B4C] sm:text-3xl">
            {activeCard.secretText}
          </p>
        </div>

        {!revealed && (
          <canvas
            ref={canvasRef}
            width={560}
            height={260}
            data-testid="scratch-canvas"
            onPointerDown={(e) => {
              drawingRef.current = true;
              e.currentTarget.setPointerCapture(e.pointerId);
              scratchAt(e.clientX, e.clientY);
            }}
            onPointerMove={(e) => {
              if (!drawingRef.current) return;
              scratchAt(e.clientX, e.clientY);
            }}
            onPointerUp={() => {
              drawingRef.current = false;
            }}
            onPointerCancel={() => {
              drawingRef.current = false;
            }}
            className="absolute inset-0 h-full w-full cursor-pointer touch-none"
          />
        )}
      </div>

      <div className="mx-auto flex max-w-xl flex-wrap items-center justify-between gap-3">
        <span className="text-xs text-[#5C4B72] tabular-nums">
          {revealed ? 'Card fully revealed' : `Scratched ${scratchProgress}%`}
        </span>
        <div className="flex items-center gap-2">
          {!revealed && (
            <button
              type="button"
              onClick={() => markRevealed(activeCard)}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-[#702B4C]/20 bg-white px-4 py-2 text-xs font-semibold text-[#702B4C] hover:bg-[#FFDCE8]/40"
            >
              <Eye className="h-4 w-4" />
              <span>Reveal Instantly</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => setCardIdx((prev) => (prev + 1) % cards.length)}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-[#702B4C] px-4 py-2 text-xs font-semibold text-[#FFF9F5] hover:bg-[#531D38]"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Next Card</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// B. Spin the Wheel
function SpinTheWheelSection({
  segments,
  sessionId,
  onSessionUpdate,
}: {
  segments: WheelSegment[];
  sessionId: string;
  onSessionUpdate: (state: ActiveSessionState) => void;
}) {
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<WheelSegment | null>(null);

  useEffect(() => {
    setResult(null);
  }, [sessionId]);

  if (segments.length === 0) return null;

  const sliceAngle = 360 / segments.length;

  function spin() {
    if (spinning) return;
    setSpinning(true);
    setResult(null);

    const chosenIdx = Math.floor(Math.random() * segments.length);
    const jitter = 0.28 + Math.random() * 0.44;
    const nextRotation = computeTargetRotationForSegment(
      rotation,
      chosenIdx,
      segments.length,
      5,
      jitter
    );
    setRotation(nextRotation);

    window.setTimeout(() => {
      const landedIdx = calculateWheelLandingIndex(
        nextRotation,
        segments.length
      );
      const landedSeg = segments[landedIdx];
      setResult(landedSeg);
      setSpinning(false);

      if (landedSeg) {
        void api
          .logActivityEvent({
            type: 'wheel_spun',
            title: landedSeg.label,
            detail: landedSeg.actionDetail,
            itemKey: landedSeg.id,
          })
          .then((res) => onSessionUpdate(res.activeSession))
          .catch(() => {
            // Non-blocking
          });
      }
    }, 3400);
  }

  function describeSlice(index: number) {
    const startAngle = (index * sliceAngle - 90) * (Math.PI / 180);
    const endAngle = ((index + 1) * sliceAngle - 90) * (Math.PI / 180);
    const r = 140;
    const cx = 150;
    const cy = 150;
    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const largeArc = sliceAngle > 180 ? 1 : 0;
    return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
  }

  return (
    <div className="grid items-center gap-7 lg:grid-cols-12">
      <div className="flex flex-col items-center lg:col-span-6">
        <div className="relative flex items-center justify-center">
          <div
            aria-hidden="true"
            className="absolute -top-2.5 left-1/2 z-20 -translate-x-1/2"
          >
            <div className="h-0 w-0 border-x-[11px] border-t-[20px] border-x-transparent border-t-[#702B4C] drop-shadow-xs" />
          </div>

          <div
            className="h-[290px] w-[290px] rounded-full border-4 border-[#F3D69B] bg-white p-1.5 shadow-lg sm:h-[320px] sm:w-[320px]"
            style={{
              transform: `rotate(${rotation}deg)`,
              transition: spinning
                ? 'transform 3.3s cubic-bezier(0.14, 0.88, 0.22, 1)'
                : 'none',
            }}
          >
            <svg viewBox="0 0 300 300" className="h-full w-full">
              {segments.map((seg, i) => {
                const midAngle = i * sliceAngle + sliceAngle / 2 - 90;
                const rad = (midAngle * Math.PI) / 180;
                const tx = 150 + 90 * Math.cos(rad);
                const ty = 150 + 90 * Math.sin(rad);
                return (
                  <g key={seg.id}>
                    <path
                      d={describeSlice(i)}
                      fill={seg.color}
                      stroke="#FFF9F5"
                      strokeWidth="2"
                    />
                    <text
                      x={tx}
                      y={ty}
                      fill={seg.textColor}
                      fontSize="9.5"
                      fontWeight="600"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      transform={`rotate(${midAngle + 90}, ${tx}, ${ty})`}
                    >
                      {seg.label}
                    </text>
                  </g>
                );
              })}
              <circle
                cx="150"
                cy="150"
                r="24"
                fill="#702B4C"
                stroke="#F3D69B"
                strokeWidth="3"
              />
            </svg>
          </div>
        </div>

        <button
          type="button"
          onClick={spin}
          disabled={spinning}
          className="mt-6 inline-flex min-h-[48px] items-center gap-2 rounded-2xl bg-[#702B4C] px-7 py-3 text-sm font-semibold text-[#FFF9F5] shadow-md transition-transform hover:bg-[#531D38] active:scale-[0.98] disabled:opacity-60"
        >
          <Disc3 className={`h-4 w-4 ${spinning ? 'animate-spin' : ''}`} />
          <span>{spinning ? 'Spinning...' : 'Spin the Wheel'}</span>
        </button>
      </div>

      <div className="lg:col-span-6">
        <div className="rounded-3xl border border-[#9274B8]/20 bg-white p-6 sm:p-7">
          <p className="text-xs font-semibold text-[#9274B8]">
            Wheel of Spontaneous Moments
          </p>
          <AnimatePresence mode="wait">
            {result ? (
              <motion.div
                key={result.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mt-3"
              >
                <h3 className="font-serif text-3xl font-semibold text-[#702B4C]">
                  {result.label}
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-[#2E1A24]">
                  {result.actionDetail}
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="idle"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-3"
              >
                <h3 className="font-serif text-2xl font-semibold text-[#4B2F6E]">
                  {spinning
                    ? 'Let fate pick our next spark...'
                    : 'Ready for a spin?'}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#5C4B72]">
                  Tap Spin the Wheel to land on a random romantic prompt — from
                  sending a song to planning a date or starting a mini-game.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// C. Secret Envelopes
function SecretEnvelopesSection({
  envelopes,
  openedEnvelopeIds,
  sessionId,
  onSessionUpdate,
}: {
  envelopes: SecretEnvelope[];
  openedEnvelopeIds: string[];
  sessionId: string;
  onSessionUpdate: (state: ActiveSessionState) => void;
}) {
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    setOpenId(null);
  }, [sessionId]);

  function toggleEnvelope(env: SecretEnvelope) {
    const opening = openId !== env.id;
    setOpenId(opening ? env.id : null);
    if (opening) {
      void api
        .logActivityEvent({
          type: 'envelope_opened',
          title: env.label,
          detail: env.occasion,
          itemKey: env.id,
        })
        .then((res) => onSessionUpdate(res.activeSession))
        .catch(() => {
          // Non-blocking
        });
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-serif text-2xl font-semibold text-[#4B2F6E] sm:text-3xl">
          Secret Envelopes
        </h2>
        <p className="mt-1 text-xs text-[#5C4B72]">
          Tap any wax-sealed envelope to unfold the letter tucked inside.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {envelopes.map((env) => {
          const isOpen = openId === env.id;
          const wasOpened = openedEnvelopeIds.includes(env.id);
          const sealBg =
            env.sealColor === 'champagne'
              ? 'bg-[#F3D69B] text-[#5B3A12]'
              : env.sealColor === 'plum'
                ? 'bg-[#9274B8] text-[#FFF9F5]'
                : 'bg-[#702B4C] text-[#F3D69B]';

          return (
            <div
              key={env.id}
              className="flex flex-col overflow-hidden rounded-3xl border border-[#702B4C]/12 bg-white shadow-xs"
            >
              <button
                type="button"
                onClick={() => toggleEnvelope(env)}
                aria-expanded={isOpen}
                className="flex min-h-[120px] flex-col items-start justify-between bg-[#FAF1EA] p-5 text-left transition-colors hover:bg-[#FDF6E6]"
              >
                <div className="flex w-full items-center justify-between">
                  <span className="text-xs font-medium text-[#6A525E]">
                    {env.occasion}
                    {wasOpened ? ' · Opened' : ''}
                  </span>
                  <span
                    className={`flex h-10 w-10 items-center justify-center rounded-full shadow-xs ${sealBg}`}
                  >
                    {isOpen || wasOpened ? (
                      <MailOpen className="h-4 w-4" />
                    ) : (
                      <Mail className="h-4 w-4" />
                    )}
                  </span>
                </div>
                <div className="mt-3">
                  <p className="font-serif text-xl font-semibold text-[#702B4C]">
                    {env.label}
                  </p>
                  <p className="mt-1 text-xs font-medium text-[#9274B8]">
                    {isOpen ? 'Tap to fold letter' : 'Tap to break wax seal'}
                  </p>
                </div>
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden border-t border-[#702B4C]/10 bg-[#FFF9F5]"
                  >
                    <div className="space-y-3 p-5">
                      <p className="font-serif text-lg italic text-[#702B4C]">
                        {env.salutation}
                      </p>
                      <p className="text-sm leading-relaxed text-[#2E1A24]">
                        {env.body}
                      </p>
                      <p className="pt-2 font-serif text-base font-semibold text-[#702B4C]">
                        {env.closing}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// D. Mystery Boxes
function MysteryBoxesSection({
  rewards,
  sessionId,
  onSessionUpdate,
}: {
  rewards: MysteryBoxReward[];
  sessionId: string;
  onSessionUpdate: (state: ActiveSessionState) => void;
}) {
  const [openedBoxes, setOpenedBoxes] = useState<
    Record<number, MysteryBoxReward>
  >({});
  const [round, setRound] = useState(1);

  useEffect(() => {
    setOpenedBoxes({});
    setRound(1);
  }, [sessionId]);

  if (rewards.length === 0) return null;

  function openBox(boxIndex: number, boxLabel: string) {
    if (openedBoxes[boxIndex]) return;
    const usedIds = new Set(Object.values(openedBoxes).map((r) => r.id));
    const available = rewards.filter((r) => !usedIds.has(r.id));
    const pool = available.length > 0 ? available : rewards;
    const picked = pool[Math.floor(Math.random() * pool.length)];
    setOpenedBoxes((prev) => ({ ...prev, [boxIndex]: picked }));

    void api
      .logActivityEvent({
        type: 'mystery_box_opened',
        title: `${boxLabel}: ${picked.title}`,
        detail: picked.message,
        itemKey: picked.id,
      })
      .then((res) => onSessionUpdate(res.activeSession))
      .catch(() => {
        // Non-blocking
      });
  }

  function resetBoxes() {
    setOpenedBoxes({});
    setRound((r) => r + 1);
  }

  const boxColors = [
    { closed: 'bg-[#FFDCE8]/85 text-[#702B4C]', label: 'Rose Box' },
    { closed: 'bg-[#E9DFFF]/90 text-[#4B2F6E]', label: 'Lavender Box' },
    { closed: 'bg-[#F3D69B]/75 text-[#5B3A12]', label: 'Champagne Box' },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-serif text-2xl font-semibold text-[#4B2F6E] sm:text-3xl">
            Mystery Boxes
          </h2>
          <p className="mt-1 text-xs text-[#5C4B72]">
            Tap a box to pop it open and uncover a surprise note, challenge, or reward.
          </p>
        </div>
        <button
          type="button"
          onClick={resetBoxes}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-[#702B4C]/20 bg-white px-4 py-2 text-xs font-semibold text-[#702B4C] hover:bg-[#E9DFFF]/40"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Refill Boxes</span>
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {boxColors.map((style, idx) => {
          const reward = openedBoxes[idx];
          return (
            <motion.div
              key={`${round}-${idx}`}
              whileTap={!reward ? { scale: 0.96 } : undefined}
              className="rounded-3xl border border-[#702B4C]/12 bg-white p-5 shadow-xs"
            >
              {!reward ? (
                <button
                  type="button"
                  onClick={() => openBox(idx, style.label)}
                  className={`flex min-h-[180px] w-full flex-col items-center justify-center gap-3 rounded-2xl p-6 text-center transition-transform hover:-translate-y-0.5 ${style.closed}`}
                >
                  <Gift className="h-10 w-10" />
                  <div>
                    <p className="font-serif text-xl font-semibold">
                      {style.label}
                    </p>
                    <p className="mt-1 text-xs opacity-80">Tap to open</p>
                  </div>
                </button>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex min-h-[180px] flex-col justify-between rounded-2xl bg-[#FFF9F5] p-4"
                >
                  <div>
                    <p className="text-xs font-semibold text-[#9274B8]">
                      {reward.kind}
                    </p>
                    <h3 className="mt-1 font-serif text-2xl font-semibold text-[#702B4C]">
                      {reward.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-[#2E1A24]">
                      {reward.message}
                    </p>
                  </div>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export function SurpriseZone({
  data,
  onSessionUpdate,
}: {
  data: RecipientUniversePayload;
  onSessionUpdate: (state: ActiveSessionState) => void;
}) {
  const [tab, setTab] = useState<SurpriseTab>('scratch');
  const [bannerFailed, setBannerFailed] = useState(false);
  const sessionId = data.activeSession.session.id;

  return (
    <div className="space-y-7 pb-8">
      {/* Lavender & Champagne Hero Banner */}
      <section className="overflow-hidden rounded-3xl border border-[#9274B8]/20 bg-[#F6F2FF]">
        <div className="grid items-stretch md:grid-cols-12">
          <div className="flex flex-col justify-center p-6 sm:p-8 md:col-span-7">
            <p className="text-xs font-semibold text-[#6C4F94]">
              Surprise Zone · Tactile Unwraps &amp; Spins
            </p>
            <h1 className="mt-2 font-serif text-3xl font-semibold text-[#4B2F6E] sm:text-4xl">
              Little Moments Waiting to Be Unwrapped
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-[#5C4B72]">
              Scratch golden foil cards, spin the wheel of ideas, unseal quiet
              envelopes, or open mystery boxes whenever you want a spark.
            </p>
          </div>
          <div className="relative min-h-[170px] bg-[#E9DFFF] md:col-span-5">
            {!bannerFailed ? (
              <img
                src={SURPRISE_BANNER_URL}
                alt="Wax-sealed cotton stationery envelopes with lavender sprigs"
                referrerPolicy="no-referrer"
                onError={() => setBannerFailed(true)}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center p-6 text-[#4B2F6E]">
                <Gift className="h-10 w-10" />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Segmented Navigation */}
      <div className="grid grid-cols-2 gap-1.5 rounded-2xl bg-[#E9DFFF]/70 p-1.5 sm:grid-cols-4">
        {[
          { id: 'scratch' as SurpriseTab, label: 'Scratch & Reveal' },
          { id: 'wheel' as SurpriseTab, label: 'Spin the Wheel' },
          { id: 'envelopes' as SurpriseTab, label: 'Secret Envelopes' },
          { id: 'boxes' as SurpriseTab, label: 'Mystery Boxes' },
        ].map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`min-h-[44px] rounded-xl px-3 py-2 text-xs font-semibold whitespace-nowrap transition-colors sm:text-sm ${
              tab === item.id
                ? 'bg-white text-[#4B2F6E] shadow-xs'
                : 'text-[#5C4B72] hover:text-[#4B2F6E]'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Active Surprise Module */}
      <section className="rounded-3xl border border-[#9274B8]/15 bg-[#F6F2FF]/65 p-5 sm:p-7">
        {tab === 'scratch' && (
          <ScratchCardSection
            cards={data.scratchCards}
            revealedIds={data.activeSession.revealedScratchIds}
            sessionId={sessionId}
            onSessionUpdate={onSessionUpdate}
          />
        )}
        {tab === 'wheel' && (
          <SpinTheWheelSection
            segments={data.wheelSegments}
            sessionId={sessionId}
            onSessionUpdate={onSessionUpdate}
          />
        )}
        {tab === 'envelopes' && (
          <SecretEnvelopesSection
            envelopes={data.envelopes}
            openedEnvelopeIds={data.activeSession.openedEnvelopeIds}
            sessionId={sessionId}
            onSessionUpdate={onSessionUpdate}
          />
        )}
        {tab === 'boxes' && (
          <MysteryBoxesSection
            rewards={data.mysteryRewards}
            sessionId={sessionId}
            onSessionUpdate={onSessionUpdate}
          />
        )}
      </section>
    </div>
  );
}
