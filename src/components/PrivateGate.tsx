import { useState, type FormEvent } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowRight,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import { api } from '../lib/api';
import type { RecipientUniversePayload } from '../types/universe';
import gateArtUrl from '../assets/images/private_gate_moon_1795155823996.jpg';

interface PrivateGateProps {
  accessHint: string;
  onUnlocked: (payload: RecipientUniversePayload) => void;
}

const GATE_ART_URL = gateArtUrl;

export function PrivateGate({ accessHint, onUnlocked }: PrivateGateProps) {
  const [code, setCode] = useState('');
  const [showCode, setShowCode] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [unlocking, setUnlocking] = useState(false);
  const [shaking, setShaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [artFailed, setArtFailed] = useState(false);

  function triggerShake() {
    setShaking(false);
    window.requestAnimationFrame(() => {
      setShaking(true);
      window.setTimeout(() => setShaking(false), 380);
    });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!code.trim()) {
      setError('Enter the private key to step inside.');
      triggerShake();
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const payload = await api.unlockUniverse(code);
      setUnlocking(true);
      window.setTimeout(() => {
        onUnlocked(payload);
      }, 360);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'That passcode did not open the gate.'
      );
      triggerShake();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden bg-[#FFF9F5] px-4 py-8 sm:px-6">
      <motion.section
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={
          unlocking
            ? { opacity: 0, scale: 1.04, y: -10 }
            : { opacity: 1, y: 0, scale: 1 }
        }
        transition={{ duration: 0.48, ease: [0.16, 1, 0.3, 1] }}
        className="relative w-full max-w-md rounded-3xl border border-[#702B4C]/12 bg-white/95 p-6 shadow-[0_28px_70px_-28px_rgba(112,43,76,0.26)] backdrop-blur-sm sm:p-9"
      >
        {/* Celestial Emblem with Golden Breathing Halo */}
        <motion.div
          initial={{ opacity: 0, scale: 0.86 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.55, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
          className="relative mx-auto mb-6 flex h-32 w-32 items-center justify-center sm:h-36 sm:w-36"
        >
          <span
            aria-hidden="true"
            className="animate-halo-breathe pointer-events-none absolute -inset-2.5 rounded-full border border-[#F3D69B]/75 bg-gradient-to-tr from-[#FFDCE8]/40 via-[#F3D69B]/25 to-[#E9DFFF]/45"
          />
          <div className="relative h-full w-full overflow-hidden rounded-full border-2 border-[#F3D69B]/80 bg-[#531D38] shadow-md">
            {!artFailed ? (
              <img
                src={GATE_ART_URL}
                alt="Golden crescent moon surrounded by ivory blossoms on deep plum sky"
                referrerPolicy="no-referrer"
                onError={() => setArtFailed(true)}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#702B4C] to-[#3B1528] text-[#F3D69B]">
                <Lock className="h-9 w-9" />
              </div>
            )}
          </div>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.14 }}
          className="text-center text-xs font-medium tracking-wide text-[#9274B8]"
        >
          Private Invitation · Just for You
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.2 }}
          className="mt-2 text-center font-serif text-3xl leading-tight font-semibold text-[#702B4C] sm:text-4xl"
        >
          Mehak&apos;s Little Universe
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.26 }}
          className="mt-3 text-center text-sm leading-relaxed text-[#6A525E]"
        >
          This little digital world is kept private behind a personal key. Enter
          your passcode below to step inside.
        </motion.p>

        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 12 }}
          animate={
            shaking
              ? { x: [0, -8, 8, -5, 5, 0], opacity: 1, y: 0 }
              : { x: 0, opacity: 1, y: 0 }
          }
          transition={
            shaking ? { duration: 0.34 } : { duration: 0.45, delay: 0.32 }
          }
          className="mt-7 space-y-4"
          noValidate
        >
          <div>
            <label
              htmlFor="universe-passcode"
              className="mb-1.5 block text-xs font-semibold text-[#2E1A24]"
            >
              Personal Passcode
            </label>
            <div className="relative">
              <KeyRound
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[#9274B8]"
              />
              <input
                id="universe-passcode"
                type={showCode ? 'text' : 'password'}
                autoComplete="off"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  if (error) setError(null);
                }}
                placeholder="Enter your secret key"
                className="min-h-[48px] w-full rounded-xl border border-[#702B4C]/20 bg-[#FFF9F5] py-3 pr-12 pl-10 text-base text-[#2E1A24] placeholder:text-[#6A525E]/60 focus:border-[#702B4C] focus:ring-2 focus:ring-[#702B4C]/20 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowCode((s) => !s)}
                aria-label={showCode ? 'Hide passcode' : 'Show passcode'}
                className="absolute top-1/2 right-1 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-lg text-[#6A525E] hover:text-[#702B4C]"
              >
                {showCode ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {accessHint && (
              <p className="mt-2 text-xs text-[#6A525E]">Hint: {accessHint}</p>
            )}
          </div>

          <AnimatePresence>
            {error && (
              <motion.div
                role="alert"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="rounded-xl border border-[#702B4C]/25 bg-[#FFDCE8]/60 px-3.5 py-2.5 text-xs font-medium text-[#702B4C]"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={submitting || unlocking}
            className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-[#702B4C] px-5 py-3 text-sm font-semibold text-[#FFF9F5] shadow-[0_14px_30px_-14px_rgba(112,43,76,0.55)] transition-transform duration-150 hover:bg-[#531D38] active:scale-[0.98] disabled:opacity-65"
          >
            {unlocking ? (
              <>
                <Sparkles className="h-4 w-4 text-[#F3D69B]" />
                <span>Welcome Inside...</span>
              </>
            ) : (
              <>
                <span>
                  {submitting ? 'Opening the Gate...' : 'Unlock My Universe'}
                </span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </motion.form>

        <div className="mt-6 flex items-center justify-center gap-2 border-t border-[#702B4C]/10 pt-5 text-xs text-[#6A525E]">
          <ShieldCheck className="h-4 w-4 shrink-0 text-[#9274B8]" />
          <span>Private access · Zero tracking · No public directory</span>
        </div>
      </motion.section>
    </main>
  );
}
