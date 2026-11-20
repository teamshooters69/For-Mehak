import {
  BookHeart,
  Gamepad2,
  Gift,
  Heart,
  Menu,
  Sparkles,
} from 'lucide-react';
import type { NavTab } from '../types/universe';

interface NavigationProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenMenu: () => void;
}

const PRIMARY_TABS: Array<{
  id: Exclude<NavTab, 'dates' | 'settings'>;
  label: string;
  icon: typeof Sparkles;
}> = [
  { id: 'home', label: 'Home', icon: Sparkles },
  { id: 'love', label: 'Love', icon: Heart },
  { id: 'surprises', label: 'Surprises', icon: Gift },
  { id: 'world', label: 'Our World', icon: BookHeart },
  { id: 'games', label: 'Games', icon: Gamepad2 },
];

export function Navigation({
  activeTab,
  onSelectTab,
  onOpenMenu,
}: NavigationProps) {
  return (
    <>
      {/* Desktop 3-Zone Top Bar & Compact Mobile Top Bar */}
      <header className="pt-safe sticky top-0 z-30 border-b border-[#702B4C]/10 bg-[#FFF9F5]/90 backdrop-blur-md">
        <div className="mx-auto flex h-12 max-w-6xl items-center justify-between gap-8 px-4 sm:px-6 md:h-16">
          {/* Zone 1: Single-line brand wordmark */}
          <button
            type="button"
            onClick={() => onSelectTab('home')}
            className="shrink-0 whitespace-nowrap font-serif text-xl font-semibold tracking-tight text-[#702B4C] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#702B4C] md:text-2xl"
          >
            Mehak&apos;s Little Universe
          </button>

          {/* Zone 2: Desktop Horizontal Navigation */}
          <nav
            aria-label="Primary navigation"
            className="hidden items-center gap-7 md:flex"
          >
            {PRIMARY_TABS.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectTab(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`relative shrink-0 whitespace-nowrap py-1 text-sm font-medium transition-colors ${
                    isActive
                      ? 'text-[#702B4C]'
                      : 'text-[#6A525E] hover:text-[#702B4C]'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span
                      aria-hidden="true"
                      className="absolute right-0 -bottom-0.5 left-0 h-0.5 rounded-full bg-[#702B4C]"
                    />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Single Menu / More Trigger (Date Ideas & Settings) */}
          <div className="flex shrink-0 items-center">
            <button
              type="button"
              onClick={onOpenMenu}
              aria-label="Open menu for Date Ideas and Settings"
              className="inline-flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center gap-2 rounded-xl px-3 text-sm font-medium whitespace-nowrap text-[#702B4C] transition-colors hover:bg-[#FFDCE8]/50 active:scale-[0.97] md:border md:border-[#702B4C]/18 md:bg-white md:px-4"
            >
              <Menu className="h-5 w-5" />
              <span className="hidden md:inline">Dates &amp; More</span>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Fixed Bottom Navigation Bar (5 primary destinations) */}
      <nav
        aria-label="Mobile bottom navigation"
        className="pb-safe fixed right-0 bottom-0 left-0 z-40 border-t border-[#702B4C]/12 bg-[#FFF9F5]/95 backdrop-blur-md md:hidden"
      >
        <div className="mx-auto grid h-16 max-w-lg grid-cols-5 items-center px-1">
          {PRIMARY_TABS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`flex min-h-[48px] flex-col items-center justify-center gap-1 rounded-xl transition-colors ${
                  isActive ? 'text-[#702B4C]' : 'text-[#6A525E]'
                }`}
              >
                <span
                  className={`flex h-7 w-11 items-center justify-center rounded-full transition-colors ${
                    isActive ? 'bg-[#FFDCE8]' : 'bg-transparent'
                  }`}
                >
                  <Icon
                    className="h-[19px] w-[19px]"
                    strokeWidth={isActive ? 2.25 : 1.8}
                  />
                </span>
                <span
                  className={`text-[10px] leading-none whitespace-nowrap ${
                    isActive ? 'font-semibold text-[#702B4C]' : 'font-medium'
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </>
  );
}
