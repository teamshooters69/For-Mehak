import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { api } from './lib/api';
import { AmbientBackdrop } from './components/AmbientBackdrop';
import { PrivateGate } from './components/PrivateGate';
import { Navigation } from './components/Navigation';
import { MenuSheet } from './components/MenuSheet';
import { HomeView } from './components/HomeView';
import { LoveZone } from './components/LoveZone';
import { SurpriseZone } from './components/SurpriseZone';
import { OurWorldView } from './components/OurWorldView';
import { DateAdventureView } from './components/DateAdventureView';
import { GamesZone } from './components/GamesZone';
import { SettingsView } from './components/SettingsView';
import { RestartUniverseModal } from './components/RestartUniverseModal';
import type {
  ActiveSessionState,
  NavTab,
  RecipientUniversePayload,
  SessionInfo,
} from './types/universe';

const AdminPanel = lazy(() =>
  import('./components/AdminPanel').then((mod) => ({ default: mod.AdminPanel }))
);

function isAdminPath(): boolean {
  const normalized = window.location.pathname.replace(/\/+$/, '');
  return normalized === '/admin' || normalized === '/owner-admin';
}

export default function App() {
  const [adminMode, setAdminMode] = useState<boolean>(() => isAdminPath());
  const [session, setSession] = useState<SessionInfo | null>(null);
  const [universe, setUniverse] = useState<RecipientUniversePayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [menuOpen, setMenuOpen] = useState(false);
  const [restartModalOpen, setRestartModalOpen] = useState(false);
  const [restarting, setRestarting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [showEntranceVeil, setShowEntranceVeil] = useState(false);

  const [reducedMotion, setReducedMotion] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('mlu_reduced_motion');
      if (saved !== null) return saved === 'true';
    } catch {
      // Ignore
    }
    return (
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
    );
  });

  useEffect(() => {
    document.documentElement.classList.toggle('reduced-motion', reducedMotion);
    try {
      localStorage.setItem('mlu_reduced_motion', String(reducedMotion));
    } catch {
      // Ignore
    }
  }, [reducedMotion]);

  useEffect(() => {
    const onPopState = () => setAdminMode(isAdminPath());
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const refreshUniverse = useCallback(async () => {
    try {
      const data = await api.getUniverse();
      setUniverse(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load universe.');
    }
  }, []);

  const bootstrap = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const info = await api.getSession();
      setSession(info);
      if (info.universeUnlocked) {
        const data = await api.getUniverse();
        setUniverse(data);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Could not reach the universe server.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  function exitAdminRoute() {
    window.history.pushState({}, '', '/');
    setAdminMode(false);
    void bootstrap();
  }

  function selectTab(tab: NavTab) {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
  }

  const handleSessionUpdate = useCallback((nextActive: ActiveSessionState) => {
    setUniverse((prev) =>
      prev ? { ...prev, activeSession: nextActive } : prev
    );
  }, []);

  async function handleConfirmRestart() {
    setRestarting(true);
    try {
      const fresh = await api.restartSession();
      setUniverse(fresh);
      setRestartModalOpen(false);
      setActiveTab('home');
      window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
      setToast(
        `Welcome to a fresh beginning — Journey #${fresh.activeSession.session.sessionNumber} is ready.`
      );
      window.setTimeout(() => setToast(null), 4500);
    } catch {
      setToast('Could not restart right now. Please try again.');
      window.setTimeout(() => setToast(null), 3500);
    } finally {
      setRestarting(false);
    }
  }

  async function handleLockUniverse() {
    await api.lockUniverse();
    setUniverse(null);
    setSession((prev) =>
      prev ? { ...prev, universeUnlocked: false } : prev
    );
    setActiveTab('home');
  }

  function handleGateUnlocked(payload: RecipientUniversePayload) {
    setUniverse(payload);
    setSession((prev) =>
      prev
        ? { ...prev, universeUnlocked: true }
        : {
            universeUnlocked: true,
            isAdmin: false,
            requiresAccessCode: true,
            accessHint: payload.settings.accessHint || '',
          }
    );
    setError(null);
    if (!reducedMotion) {
      setShowEntranceVeil(true);
      window.setTimeout(() => setShowEntranceVeil(false), 1150);
    }
  }

  // Separate owner-only admin route (lazy-loaded & backend-protected)
  if (adminMode) {
    return (
      <Suspense
        fallback={
          <div className="flex min-h-[100dvh] items-center justify-center bg-[#FFF9F5] text-sm text-[#6A525E]">
            Loading owner portal...
          </div>
        }
      >
        <AdminPanel
          isAdmin={Boolean(session?.isAdmin)}
          requiresUsername={Boolean(session?.adminRequiresUsername)}
          onAuthChange={(nextIsAdmin) =>
            setSession((prev) =>
              prev
                ? {
                    ...prev,
                    isAdmin: nextIsAdmin,
                    universeUnlocked: prev.universeUnlocked || nextIsAdmin,
                  }
                : {
                    isAdmin: nextIsAdmin,
                    universeUnlocked: nextIsAdmin,
                    requiresAccessCode: true,
                    accessHint: '',
                  }
            )
          }
          onExitAdmin={exitAdminRoute}
          onUniverseMutated={() => {
            void refreshUniverse();
          }}
        />
      </Suspense>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-[#FFF9F5] px-6 text-center">
        <p className="font-serif text-3xl font-semibold text-[#702B4C]">
          Mehak&apos;s Little Universe
        </p>
        <p className="mt-2 text-sm text-[#6A525E]">
          Opening the starlight gate...
        </p>
      </div>
    );
  }

  if (error && !session) {
    return (
      <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-[#FFF9F5] px-6 text-center">
        <p className="font-serif text-2xl font-semibold text-[#702B4C]">
          Unable to open the universe right now
        </p>
        <p className="mt-2 text-sm text-[#6A525E]">{error}</p>
        <button
          type="button"
          onClick={() => void bootstrap()}
          className="mt-5 min-h-[44px] rounded-xl bg-[#702B4C] px-5 text-sm font-semibold text-[#FFF9F5]"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!session?.universeUnlocked || !universe) {
    return (
      <>
        <AmbientBackdrop reducedMotion={reducedMotion} />
        <PrivateGate
          accessHint={session?.accessHint || ''}
          onUnlocked={handleGateUnlocked}
        />
      </>
    );
  }

  return (
    <div className="relative min-h-[100dvh] bg-[#FFF9F5] text-[#2E1A24]">
      <AmbientBackdrop reducedMotion={reducedMotion} />

      {/* Brief cinematic starlight entrance veil right after unlocking */}
      <AnimatePresence>
        {showEntranceVeil && (
          <motion.div
            aria-hidden="true"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="pointer-events-none fixed inset-0 z-[70] flex flex-col items-center justify-center bg-gradient-to-br from-[#531D38] via-[#702B4C] to-[#3B1528] px-6 text-center text-[#FFF9F5]"
          >
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="text-xs font-medium tracking-wide text-[#F3D69B]"
            >
              Opening Your Sky
            </motion.p>
            <motion.p
              initial={{ opacity: 0, scale: 0.94, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="mt-3 font-serif text-4xl font-semibold text-[#FFF9F5] sm:text-5xl"
            >
              Welcome, Mehak
            </motion.p>
            <motion.span
              initial={{ scaleX: 0, opacity: 0 }}
              animate={{ scaleX: 1, opacity: 1 }}
              transition={{ duration: 0.55, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
              className="mt-5 h-px w-28 origin-center bg-gradient-to-r from-transparent via-[#F3D69B] to-transparent"
            />
          </motion.div>
        )}
      </AnimatePresence>

      <Navigation
        activeTab={activeTab}
        onSelectTab={selectTab}
        onOpenMenu={() => setMenuOpen(true)}
      />

      <MenuSheet
        open={menuOpen}
        activeTab={activeTab}
        onClose={() => setMenuOpen(false)}
        onSelectTab={selectTab}
        onRequestRestart={() => setRestartModalOpen(true)}
      />

      <RestartUniverseModal
        open={restartModalOpen}
        restarting={restarting}
        onCancel={() => {
          if (!restarting) setRestartModalOpen(false);
        }}
        onConfirm={() => {
          void handleConfirmRestart();
        }}
      />

      <AnimatePresence>
        {toast && (
          <motion.div
            role="status"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="fixed top-18 left-1/2 z-40 w-[92%] max-w-md -translate-x-1/2 rounded-2xl border border-[#702B4C]/15 bg-[#702B4C] px-4 py-3 text-center text-xs font-medium text-[#FFF9F5] shadow-lg"
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Container with generous bottom clearance for mobile bottom nav */}
      <main className="mx-auto max-w-6xl px-4 pt-5 pb-28 sm:px-6 md:pt-8 md:pb-14">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={reducedMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reducedMotion ? undefined : { opacity: 0, y: -6 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          >
            {activeTab === 'home' && (
              <HomeView data={universe} onNavigate={selectTab} />
            )}

            {activeTab === 'love' && (
              <LoveZone
                data={universe}
                onSessionUpdate={handleSessionUpdate}
              />
            )}

            {activeTab === 'surprises' && (
              <SurpriseZone
                data={universe}
                onSessionUpdate={handleSessionUpdate}
              />
            )}

            {activeTab === 'world' && (
              <OurWorldView
                data={universe}
                onUpdateBucketList={(items) =>
                  setUniverse((prev) =>
                    prev ? { ...prev, bucketList: items } : prev
                  )
                }
                onAddInsideJoke={(joke) =>
                  setUniverse((prev) =>
                    prev
                      ? { ...prev, insideJokes: [joke, ...prev.insideJokes] }
                      : prev
                  )
                }
              />
            )}

            {activeTab === 'dates' && (
              <DateAdventureView
                data={universe}
                onUpdateDestinations={(items) =>
                  setUniverse((prev) =>
                    prev ? { ...prev, destinations: items } : prev
                  )
                }
                onUpdateDatePlans={(items) =>
                  setUniverse((prev) =>
                    prev ? { ...prev, datePlans: items } : prev
                  )
                }
                onSessionUpdate={handleSessionUpdate}
              />
            )}

            {activeTab === 'games' && (
              <GamesZone
                activeSession={universe.activeSession}
                onSessionUpdate={handleSessionUpdate}
              />
            )}

            {activeTab === 'settings' && (
              <SettingsView
                reducedMotion={reducedMotion}
                sessionNumber={universe.activeSession.session.sessionNumber}
                onToggleReducedMotion={() => setReducedMotion((r) => !r)}
                onLockUniverse={() => {
                  void handleLockUniverse();
                }}
                onRequestRestart={() => setRestartModalOpen(true)}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
