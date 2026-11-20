import { AnimatePresence, motion } from 'motion/react';
import {
  BookHeart,
  CalendarHeart,
  Gamepad2,
  Gift,
  Heart,
  RotateCcw,
  Settings,
  Sparkles,
  X,
} from 'lucide-react';
import type { NavTab } from '../types/universe';

interface MenuSheetProps {
  open: boolean;
  activeTab: NavTab;
  onClose: () => void;
  onSelectTab: (tab: NavTab) => void;
  onRequestRestart: () => void;
}

export function MenuSheet({
  open,
  activeTab,
  onClose,
  onSelectTab,
  onRequestRestart,
}: MenuSheetProps) {
  function navigate(tab: NavTab) {
    onSelectTab(tab);
    onClose();
  }

  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center md:items-center md:justify-end"
          role="dialog"
          aria-modal="true"
          aria-label="Universe Menu"
        >
          <motion.button
            type="button"
            aria-label="Close menu backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#2E1A24]/45 backdrop-blur-xs"
          />

          <motion.div
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className="pb-safe relative z-10 max-h-[85dvh] w-full overflow-y-auto rounded-t-3xl bg-[#FFF9F5] p-6 shadow-2xl md:mr-6 md:max-w-sm md:rounded-3xl"
          >
            <div
              aria-hidden="true"
              className="mx-auto mb-4 h-1.5 w-10 rounded-full bg-[#702B4C]/20 md:hidden"
            />

            <div className="flex items-center justify-between pb-4">
              <div>
                <h2 className="font-serif text-2xl font-semibold text-[#702B4C]">
                  Explore More
                </h2>
                <p className="text-xs text-[#6A525E]">
                  Date planning, preferences, and every corner of the universe
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close menu"
                className="flex h-11 w-11 items-center justify-center rounded-full text-[#6A525E] transition-colors hover:bg-[#FFDCE8]/60 hover:text-[#702B4C]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-2 border-t border-[#702B4C]/10 pt-4">
              <button
                type="button"
                onClick={() => navigate('dates')}
                className={`flex min-h-[56px] w-full items-center gap-3.5 rounded-2xl px-4 py-3 text-left transition-colors ${
                  activeTab === 'dates'
                    ? 'bg-[#FDF6E6] text-[#702B4C]'
                    : 'bg-white text-[#2E1A24] hover:bg-[#FDF6E6]/70'
                }`}
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F3D69B]/45 text-[#702B4C]">
                  <CalendarHeart className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold">Date &amp; Adventure Zone</div>
                  <div className="text-xs text-[#6A525E]">
                    Destination picker, virtual date roulette &amp; planner
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => navigate('settings')}
                className={`flex min-h-[56px] w-full items-center gap-3.5 rounded-2xl px-4 py-3 text-left transition-colors ${
                  activeTab === 'settings'
                    ? 'bg-[#E9DFFF]/70 text-[#702B4C]'
                    : 'bg-white text-[#2E1A24] hover:bg-[#E9DFFF]/40'
                }`}
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E9DFFF] text-[#702B4C]">
                  <Settings className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold">Settings &amp; Privacy</div>
                  <div className="text-xs text-[#6A525E]">
                    Motion preferences, privacy promise &amp; lock gate
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onRequestRestart();
                }}
                className="flex min-h-[56px] w-full items-center gap-3.5 rounded-2xl bg-[#FFF0F5] px-4 py-3 text-left text-[#702B4C] transition-colors hover:bg-[#FFDCE8]/75"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#702B4C]">
                  <RotateCcw className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold">Start My Universe Again</div>
                  <div className="text-xs text-[#6A525E]">
                    Reset your answers, quizzes &amp; surprises for a fresh run
                  </div>
                </div>
              </button>
            </div>

            <div className="mt-5 border-t border-[#702B4C]/10 pt-4">
              <p className="mb-2.5 text-xs font-semibold text-[#6A525E]">
                Quick Jump
              </p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'home' as NavTab, label: 'Home', icon: Sparkles },
                  { id: 'love' as NavTab, label: 'Love Zone', icon: Heart },
                  { id: 'surprises' as NavTab, label: 'Surprises', icon: Gift },
                  { id: 'world' as NavTab, label: 'Our World', icon: BookHeart },
                  { id: 'games' as NavTab, label: 'Mini-Games', icon: Gamepad2 },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => navigate(item.id)}
                      className="flex min-h-[44px] items-center gap-2 rounded-xl border border-[#702B4C]/10 bg-white px-3 py-2.5 text-xs font-medium text-[#2E1A24] transition-colors hover:border-[#702B4C]/30 hover:text-[#702B4C]"
                    >
                      <Icon className="h-4 w-4 text-[#9274B8]" />
                      <span className="truncate">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
