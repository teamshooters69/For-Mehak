import {
  EyeOff,
  KeyRound,
  Lock,
  RotateCcw,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

interface SettingsViewProps {
  reducedMotion: boolean;
  sessionNumber: number;
  onToggleReducedMotion: () => void;
  onLockUniverse: () => void;
  onRequestRestart: () => void;
}

export function SettingsView({
  reducedMotion,
  sessionNumber,
  onToggleReducedMotion,
  onLockUniverse,
  onRequestRestart,
}: SettingsViewProps) {
  return (
    <div className="space-y-7 pb-8">
      <section className="rounded-3xl border border-[#702B4C]/12 bg-white p-6 sm:p-8">
        <p className="text-xs font-semibold text-[#9274B8]">
          Settings &amp; Privacy
        </p>
        <h1 className="mt-2 font-serif text-3xl font-semibold text-[#702B4C] sm:text-4xl">
          Your Comfort &amp; Privacy Come First
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#6A525E]">
          Adjust visual motion preferences, start your interactive journey
          fresh anytime, or lock the private gate when stepping away.
        </p>
      </section>

      {/* Prominent "Start My Universe Again" Experience Card */}
      <section className="flex flex-col justify-between gap-5 rounded-3xl border border-[#F3D69B]/80 bg-gradient-to-br from-[#FDF6E6] via-[#FFF9F5] to-[#FFF0F5] p-6 sm:flex-row sm:items-center sm:p-7">
        <div className="max-w-xl">
          <p className="text-xs font-semibold text-[#7A541C]">
            Fresh Beginning · Journey #{sessionNumber}
          </p>
          <h2 className="mt-1 font-serif text-2xl font-semibold text-[#702B4C] sm:text-3xl">
            Want to Experience Everything Fresh?
          </h2>
          <p className="mt-1.5 text-sm leading-relaxed text-[#6A525E]">
            Reset your quiz answers, question selections, mini-game scores,
            scratch cards, envelopes, and hearts back to their starting state
            whenever you feel like exploring all over again.
          </p>
        </div>

        <button
          type="button"
          onClick={onRequestRestart}
          className="inline-flex min-h-[48px] shrink-0 items-center justify-center gap-2 rounded-2xl bg-[#702B4C] px-6 py-3 text-sm font-semibold whitespace-nowrap text-[#FFF9F5] shadow-sm transition-transform hover:bg-[#531D38] active:scale-[0.98]"
        >
          <RotateCcw className="h-4 w-4" />
          <span>Start My Universe Again</span>
        </button>
      </section>

      <div className="grid gap-5 md:grid-cols-2">
        {/* Experience Controls */}
        <section className="space-y-4 rounded-3xl border border-[#702B4C]/12 bg-white p-6">
          <h2 className="font-serif text-2xl font-semibold text-[#702B4C]">
            Display &amp; Access
          </h2>

          <div className="flex items-center justify-between gap-4 rounded-2xl bg-[#FFF9F5] p-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#2E1A24]">
                <Sparkles className="h-4 w-4 text-[#9274B8]" />
                <span>Reduce Motion</span>
              </div>
              <p className="mt-1 text-xs text-[#6A525E]">
                Pauses floating sparkles and softens card transitions.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={reducedMotion}
              onClick={onToggleReducedMotion}
              className={`relative inline-flex h-8 w-14 shrink-0 items-center rounded-full transition-colors ${
                reducedMotion ? 'bg-[#702B4C]' : 'bg-[#702B4C]/20'
              }`}
            >
              <span className="sr-only">Toggle reduced motion</span>
              <span
                className={`inline-block h-6 w-6 rounded-full bg-white shadow-xs transition-transform ${
                  reducedMotion ? 'translate-x-7' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between gap-4 rounded-2xl bg-[#FFF9F5] p-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#2E1A24]">
                <Lock className="h-4 w-4 text-[#702B4C]" />
                <span>Lock Universe Gate</span>
              </div>
              <p className="mt-1 text-xs text-[#6A525E]">
                Returns to the private passcode screen on this device.
              </p>
            </div>
            <button
              type="button"
              onClick={onLockUniverse}
              className="min-h-[42px] shrink-0 rounded-xl border border-[#702B4C]/25 bg-white px-4 py-2 text-xs font-semibold text-[#702B4C] hover:bg-[#FFDCE8]/50"
            >
              Lock Now
            </button>
          </div>
        </section>

        {/* Privacy Promise */}
        <section className="space-y-4 rounded-3xl border border-[#9274B8]/20 bg-[#F6F2FF]/75 p-6">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-[#702B4C]" />
            <h2 className="font-serif text-2xl font-semibold text-[#4B2F6E]">
              Privacy Commitment
            </h2>
          </div>

          <ul className="space-y-2.5 text-sm leading-relaxed text-[#5C4B72]">
            <li className="flex items-start gap-2.5">
              <EyeOff className="mt-0.5 h-4 w-4 shrink-0 text-[#9274B8]" />
              <span>
                Zero third-party analytics, ad trackers, or public user
                directories.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#9274B8]" />
              <span>
                No GPS location tracking, and no access to your camera,
                microphone, contacts, or personal files.
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <KeyRound className="mt-0.5 h-4 w-4 shrink-0 text-[#9274B8]" />
              <span>
                Your selections, answers, quiz results, and plans stay private
                inside this personal universe.
              </span>
            </li>
          </ul>
        </section>
      </div>

      <div className="border-t border-[#702B4C]/10 pt-5 text-center text-xs text-[#6A525E]">
        Mehak&apos;s Little Universe · Private Edition
      </div>
    </div>
  );
}
