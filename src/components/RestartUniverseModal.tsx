import { AnimatePresence, motion } from 'motion/react';
import { RotateCcw, Sparkles, X } from 'lucide-react';

interface RestartUniverseModalProps {
  open: boolean;
  restarting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function RestartUniverseModal({
  open,
  restarting,
  onCancel,
  onConfirm,
}: RestartUniverseModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="restart-universe-title"
        >
          <motion.button
            type="button"
            aria-label="Cancel restart"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onCancel}
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
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#FDF6E6] text-[#702B4C]">
                <Sparkles className="h-5 w-5" />
              </div>
              <button
                type="button"
                onClick={onCancel}
                aria-label="Close confirmation"
                className="flex h-10 w-10 items-center justify-center rounded-full text-[#6A525E] hover:bg-[#FFDCE8]/60"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <h2
              id="restart-universe-title"
              className="mt-4 font-serif text-3xl font-semibold text-[#702B4C]"
            >
              Start My Universe Again?
            </h2>

            <p className="mt-2.5 text-sm leading-relaxed text-[#6A525E]">
              Choosing a fresh start resets your personal interactive progress
              so you can experience everything all over again:
            </p>

            <ul className="mt-4 space-y-2 rounded-2xl bg-white p-4 text-xs leading-relaxed text-[#2E1A24]">
              <li>· Your saved question answers, sentence endings &amp; choices reset</li>
              <li>· Quizzes, love language results &amp; mini-game scores start fresh</li>
              <li>· Hearts, scratch cards, envelopes, mystery boxes &amp; welcome stars reset</li>
              <li>· Your shared bucket list, date plans &amp; memories stay safely in place</li>
            </ul>

            <div className="mt-6 flex flex-col-reverse gap-2.5 sm:flex-row">
              <button
                type="button"
                onClick={onCancel}
                disabled={restarting}
                className="min-h-[46px] flex-1 rounded-xl border border-[#702B4C]/20 bg-white px-4 py-2.5 text-sm font-semibold text-[#702B4C] hover:bg-[#FAF1EA] disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={restarting}
                className="inline-flex min-h-[46px] flex-1 items-center justify-center gap-2 rounded-xl bg-[#702B4C] px-4 py-2.5 text-sm font-semibold text-[#FFF9F5] hover:bg-[#531D38] disabled:opacity-60"
              >
                <RotateCcw className="h-4 w-4" />
                <span>{restarting ? 'Starting Fresh...' : 'Yes, Start Again'}</span>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
