import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import {
  ArrowLeft,
  Download,
  Eye,
  EyeOff,
  Lock,
  LogOut,
  Plus,
  RefreshCw,
  Save,
  ShieldCheck,
  Trash2,
  Upload,
} from 'lucide-react';
import { api } from '../lib/api';
import {
  INSIGHT_TABS,
  OwnerInsightsViews,
  type InsightSection,
} from './admin/OwnerInsightsViews';
import type {
  DareIntensity,
  DareMode,
  DestinationCategory,
  HeartRewardKind,
  QuestionMood,
  UniverseData,
} from '../types/universe';

interface AdminPanelProps {
  isAdmin: boolean;
  onAuthChange: (isAdmin: boolean) => void;
  onExitAdmin: () => void;
  onUniverseMutated: () => void;
}

type ContentSection =
  | 'welcome'
  | 'questions'
  | 'tod'
  | 'quiz'
  | 'compliments'
  | 'surprises'
  | 'scratch'
  | 'envelopes'
  | 'memories'
  | 'jokes'
  | 'bucket'
  | 'dates'
  | 'backup';

const CONTENT_TABS: Array<{ id: ContentSection; label: string }> = [
  { id: 'welcome', label: 'Welcome & Settings' },
  { id: 'questions', label: 'Questions' },
  { id: 'tod', label: 'Truth or Dare' },
  { id: 'quiz', label: 'Know-Me Quiz' },
  { id: 'compliments', label: 'Compliments' },
  { id: 'surprises', label: 'Hearts & Boxes' },
  { id: 'scratch', label: 'Scratch Cards' },
  { id: 'envelopes', label: 'Envelopes' },
  { id: 'memories', label: 'Memories' },
  { id: 'jokes', label: 'Inside Jokes' },
  { id: 'bucket', label: 'Bucket List Editor' },
  { id: 'dates', label: 'Date Ideas Editor' },
  { id: 'backup', label: 'Export & Backup' },
];

export function AdminPanel({
  isAdmin,
  onAuthChange,
  onExitAdmin,
  onUniverseMutated,
}: AdminPanelProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loggingIn, setLoggingIn] = useState(false);

  const [mode, setMode] = useState<'insights' | 'content'>('insights');
  const [insightSection, setInsightSection] =
    useState<InsightSection>('overview');
  const [contentSection, setContentSection] =
    useState<ContentSection>('welcome');
  const [sessionFilter, setSessionFilter] = useState<string>('all');

  const [data, setData] = useState<UniverseData | null>(null);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [errBanner, setErrBanner] = useState<string | null>(null);

  // Welcome & settings form
  const [welcomeHeading, setWelcomeHeading] = useState('');
  const [welcomeSubtitle, setWelcomeSubtitle] = useState('');
  const [accessHint, setAccessHint] = useState('');
  const [allowSubmissions, setAllowSubmissions] = useState(true);
  const [categoriesInput, setCategoriesInput] = useState('');

  // Quick-add form states
  const [qPrompt, setQPrompt] = useState('');
  const [qMood, setQMood] = useState<QuestionMood>('Thoughtful');

  const [todMode, setTodMode] = useState<DareMode>('Truth');
  const [todIntensity, setTodIntensity] = useState<DareIntensity>('Gentle');
  const [todText, setTodText] = useState('');

  const [quizQuestion, setQuizQuestion] = useState('');
  const [quizOpt0, setQuizOpt0] = useState('');
  const [quizOpt1, setQuizOpt1] = useState('');
  const [quizOpt2, setQuizOpt2] = useState('');
  const [quizOpt3, setQuizOpt3] = useState('');
  const [quizCorrect, setQuizCorrect] = useState(0);
  const [quizNote, setQuizNote] = useState('');

  const [compTitle, setCompTitle] = useState('');
  const [compCat, setCompCat] = useState('Presence');
  const [compText, setCompText] = useState('');

  const [heartKind, setHeartKind] = useState<HeartRewardKind>('Compliment');
  const [heartMsg, setHeartMsg] = useState('');
  const [boxTitle, setBoxTitle] = useState('');
  const [boxMsg, setBoxMsg] = useState('');

  const [scratchTitle, setScratchTitle] = useState('');
  const [scratchCat, setScratchCat] = useState<
    'Compliment' | 'Romantic Note' | 'Challenge' | 'Small Reward' | 'Surprise'
  >('Surprise');
  const [scratchText, setScratchText] = useState('');

  const [envLabel, setEnvLabel] = useState('');
  const [envOccasion, setEnvOccasion] = useState('Anytime');
  const [envSalutation, setEnvSalutation] = useState('Dear Mehak,');
  const [envBody, setEnvBody] = useState('');
  const [envClosing, setEnvClosing] = useState('With warmth,');

  const [memDate, setMemDate] = useState('');
  const [memTitle, setMemTitle] = useState('');
  const [memCat, setMemCat] = useState('Milestone');
  const [memDesc, setMemDesc] = useState('');

  const [jokeTitle, setJokeTitle] = useState('');
  const [jokeClue, setJokeClue] = useState('');
  const [jokeStory, setJokeStory] = useState('');

  const [bucketTitle, setBucketTitle] = useState('');
  const [bucketCat, setBucketCat] = useState('Adventure');

  const [destName, setDestName] = useState('');
  const [destCat, setDestCat] = useState<DestinationCategory>('Café');
  const [destVibe, setDestVibe] = useState('');

  async function loadAdminData() {
    setLoading(true);
    setErrBanner(null);
    try {
      const full = await api.getAdminData();
      setData(full);
      setWelcomeHeading(full.settings.welcomeHeading);
      setWelcomeSubtitle(full.settings.welcomeSubtitle);
      setAccessHint(full.settings.accessHint);
      setAllowSubmissions(full.settings.allowSubmissions);
      setCategoriesInput(full.settings.categories.join(', '));
    } catch (err) {
      setErrBanner(
        err instanceof Error ? err.message : 'Unable to load admin data.'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (isAdmin) {
      void loadAdminData();
    }
  }, [isAdmin]);

  function flash(msg: string) {
    setNotice(msg);
    setErrBanner(null);
    window.setTimeout(() => setNotice(null), 3200);
  }

  async function handleLogin(e: FormEvent) {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setLoginError('Enter both username and password.');
      return;
    }
    setLoggingIn(true);
    setLoginError(null);
    try {
      await api.adminLogin(username, password);
      onAuthChange(true);
      setPassword('');
    } catch (err) {
      setLoginError(
        err instanceof Error ? err.message : 'Invalid administrator credentials.'
      );
    } finally {
      setLoggingIn(false);
    }
  }

  async function handleLogout() {
    await api.adminLogout();
    setData(null);
    onAuthChange(false);
  }

  async function saveWelcomeSettings(e: FormEvent) {
    e.preventDefault();
    try {
      const categories = categoriesInput
        .split(',')
        .map((c) => c.trim())
        .filter(Boolean);
      const updated = await api.updateSettings({
        welcomeHeading,
        welcomeSubtitle,
        accessHint,
        allowSubmissions,
        categories,
      });
      setData((prev) => (prev ? { ...prev, settings: updated } : prev));
      onUniverseMutated();
      flash('Welcome text and settings updated.');
    } catch (err) {
      setErrBanner(err instanceof Error ? err.message : 'Save failed.');
    }
  }

  async function addToCollection(
    collection: keyof UniverseData,
    payload: Record<string, unknown>,
    successMsg: string
  ) {
    try {
      const res = await api.adminCreateItem(collection, payload);
      setData((prev) => (prev ? { ...prev, [collection]: res.items } : prev));
      onUniverseMutated();
      flash(successMsg);
      return true;
    } catch (err) {
      setErrBanner(err instanceof Error ? err.message : 'Unable to save item.');
      return false;
    }
  }

  async function deleteFromCollection(
    collection: keyof UniverseData,
    id: string,
    label: string
  ) {
    try {
      const res = await api.adminDeleteItem(collection, id);
      setData((prev) => (prev ? { ...prev, [collection]: res.items } : prev));
      onUniverseMutated();
      flash(`Removed ${label}.`);
    } catch (err) {
      setErrBanner(err instanceof Error ? err.message : 'Delete failed.');
    }
  }

  async function handleExportBackup() {
    try {
      const backup = await api.downloadBackup();
      const blob = new Blob([JSON.stringify(backup, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mehaks-universe-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      flash('Backup JSON downloaded.');
    } catch (err) {
      setErrBanner(err instanceof Error ? err.message : 'Backup export failed.');
    }
  }

  async function handleRestoreFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as UniverseData;
      const restored = await api.adminRestoreBackup(parsed);
      setData(restored);
      onUniverseMutated();
      flash('Universe backup restored successfully.');
    } catch (err) {
      setErrBanner(
        err instanceof Error ? err.message : 'Invalid backup JSON file.'
      );
    } finally {
      e.target.value = '';
    }
  }

  // Unauthenticated Owner Admin Login Gate (strictly backend-enforced)
  if (!isAdmin) {
    return (
      <main className="flex min-h-[100dvh] flex-col items-center justify-center bg-[#FFF9F5] px-5 py-10">
        <div className="w-full max-w-md rounded-3xl border border-[#702B4C]/15 bg-white p-7 shadow-lg sm:p-9">
          <button
            type="button"
            onClick={onExitAdmin}
            className="mb-6 inline-flex min-h-[40px] items-center gap-1.5 text-xs font-semibold text-[#6A525E] hover:text-[#702B4C]"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Return to Site</span>
          </button>

          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#702B4C] text-[#F3D69B]">
            <Lock className="h-5 w-5" />
          </div>

          <h1 className="mt-4 font-serif text-3xl font-semibold text-[#702B4C]">
            Owner Admin Sign-In
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-[#6A525E]">
            Restricted owner portal. Authenticate with your private
            server-configured credentials to view saved responses, session
            history, and content controls.
          </p>

          <form onSubmit={handleLogin} className="mt-6 space-y-4" noValidate>
            <div>
              <label
                htmlFor="admin-user"
                className="mb-1.5 block text-xs font-semibold text-[#2E1A24]"
              >
                Owner Username
              </label>
              <input
                id="admin-user"
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="min-h-[46px] w-full rounded-xl border border-[#702B4C]/20 bg-[#FFF9F5] px-4 text-sm text-[#2E1A24] focus:border-[#702B4C] focus:outline-none"
              />
            </div>

            <div>
              <label
                htmlFor="admin-pass"
                className="mb-1.5 block text-xs font-semibold text-[#2E1A24]"
              >
                Owner Password
              </label>
              <div className="relative">
                <input
                  id="admin-pass"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="min-h-[48px] w-full rounded-xl border border-[#702B4C]/20 bg-[#FFF9F5] py-3 pr-12 pl-4 text-base text-[#2E1A24] focus:border-[#702B4C] focus:ring-2 focus:ring-[#702B4C]/20 focus:outline-none sm:text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute top-1/2 right-1 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-lg text-[#6A525E] hover:text-[#702B4C]"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {loginError && (
              <div
                role="alert"
                className="rounded-xl bg-[#FFDCE8]/70 px-3.5 py-2.5 text-xs font-medium text-[#702B4C]"
              >
                {loginError}
              </div>
            )}

            <button
              type="submit"
              disabled={loggingIn}
              className="min-h-[48px] w-full rounded-xl bg-[#702B4C] px-5 py-3 text-sm font-semibold text-[#FFF9F5] hover:bg-[#531D38] disabled:opacity-60"
            >
              {loggingIn ? 'Verifying...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 flex items-center gap-2 border-t border-[#702B4C]/10 pt-4 text-xs text-[#6A525E]">
            <ShieldCheck className="h-4 w-4 shrink-0 text-[#9274B8]" />
            <span>
              Protected by backend session authentication. Credentials are never
              stored in client code.
            </span>
          </div>
        </div>
      </main>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-[#FFF9F5] pb-14">
      {/* Admin Header */}
      <header className="sticky top-0 z-30 border-b border-[#702B4C]/12 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-2 px-4 sm:gap-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">
            <button
              type="button"
              onClick={onExitAdmin}
              aria-label="View Site"
              className="inline-flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center gap-1.5 rounded-xl border border-[#702B4C]/15 bg-[#FFF9F5] px-2.5 text-xs font-semibold text-[#702B4C] hover:bg-[#FFDCE8]/40 sm:px-3"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">View Site</span>
            </button>
            <h1 className="truncate font-serif text-xl font-semibold text-[#702B4C] sm:text-2xl">
              Owner Admin<span className="hidden sm:inline"> Dashboard</span>
            </h1>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => void loadAdminData()}
              aria-label="Refresh admin data"
              className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-1.5 rounded-xl border border-[#702B4C]/15 bg-[#FFF9F5] px-2.5 text-xs font-semibold text-[#702B4C] hover:bg-[#FAF1EA] sm:px-3"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex min-h-[44px] shrink-0 items-center gap-1.5 rounded-xl bg-[#702B4C] px-3 text-xs font-semibold whitespace-nowrap text-[#FFF9F5] hover:bg-[#531D38] sm:px-3.5"
            >
              <LogOut className="h-4 w-4 shrink-0" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pt-6 sm:px-6">
        {/* Top Mode Switcher & Session Filter */}
        <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-[#702B4C]/10 bg-white p-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
          <div className="grid grid-cols-2 items-center gap-1.5 rounded-xl bg-[#FAF1EA] p-1 sm:flex">
            <button
              type="button"
              onClick={() => setMode('insights')}
              className={`min-h-[44px] rounded-lg px-4 text-xs font-semibold whitespace-nowrap transition-colors sm:text-sm ${
                mode === 'insights'
                  ? 'bg-[#702B4C] text-[#FFF9F5] shadow-xs'
                  : 'text-[#6A525E] hover:text-[#702B4C]'
              }`}
            >
              Owner Insights
            </button>
            <button
              type="button"
              onClick={() => setMode('content')}
              className={`min-h-[44px] rounded-lg px-4 text-xs font-semibold whitespace-nowrap transition-colors sm:text-sm ${
                mode === 'content'
                  ? 'bg-[#702B4C] text-[#FFF9F5] shadow-xs'
                  : 'text-[#6A525E] hover:text-[#702B4C]'
              }`}
            >
              Manage Content
            </button>
          </div>

          {mode === 'insights' && data && (
            <div className="flex items-center justify-between gap-2 sm:justify-end">
              <label
                htmlFor="admin-session-filter"
                className="text-xs font-semibold whitespace-nowrap text-[#6A525E]"
              >
                Session:
              </label>
              <select
                id="admin-session-filter"
                value={sessionFilter}
                onChange={(e) => setSessionFilter(e.target.value)}
                className="min-h-[44px] flex-1 rounded-xl border border-[#702B4C]/20 bg-[#FFF9F5] px-3 text-xs font-semibold text-[#2E1A24] sm:flex-initial"
              >
                <option value="all">
                  All Sessions ({data.sessions.length})
                </option>
                {[...data.sessions]
                  .sort((a, b) => b.sessionNumber - a.sessionNumber)
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      Session #{s.sessionNumber} (
                      {s.status === 'active' ? 'Active' : 'Archived'})
                    </option>
                  ))}
              </select>
            </div>
          )}
        </div>

        {notice && (
          <div
            role="status"
            className="mb-4 rounded-2xl border border-emerald-700/20 bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-900"
          >
            {notice}
          </div>
        )}
        {errBanner && (
          <div
            role="alert"
            className="mb-4 rounded-2xl border border-[#702B4C]/25 bg-[#FFDCE8]/70 px-4 py-3 text-xs font-semibold text-[#702B4C]"
          >
            {errBanner}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-12">
          {/* Sidebar Navigation — horizontal scroll strip on mobile, vertical sidebar on desktop */}
          <nav
            aria-label="Admin sections"
            className="no-scrollbar flex gap-2 overflow-x-auto pb-1 lg:col-span-3 lg:flex-col lg:overflow-visible lg:pb-0"
          >
            {mode === 'insights'
              ? INSIGHT_TABS.map((t) => {
                  const Icon = t.icon;
                  const active = insightSection === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setInsightSection(t.id)}
                      className={`flex min-h-[44px] shrink-0 items-center gap-2.5 rounded-xl px-3.5 py-2 text-left text-xs font-semibold whitespace-nowrap transition-colors sm:text-sm ${
                        active
                          ? 'bg-[#702B4C] text-[#FFF9F5] shadow-xs'
                          : 'border border-[#702B4C]/10 bg-white text-[#6A525E] hover:bg-[#FAF1EA] hover:text-[#702B4C] lg:border-transparent'
                      }`}
                    >
                      <Icon className="h-4 w-4 shrink-0" />
                      <span>{t.label}</span>
                    </button>
                  );
                })
              : CONTENT_TABS.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setContentSection(t.id)}
                    className={`min-h-[44px] shrink-0 rounded-xl px-3.5 py-2 text-left text-xs font-semibold whitespace-nowrap transition-colors sm:text-sm ${
                      contentSection === t.id
                        ? 'bg-[#702B4C] text-[#FFF9F5] shadow-xs'
                        : 'border border-[#702B4C]/10 bg-white text-[#6A525E] hover:bg-[#FAF1EA] hover:text-[#702B4C] lg:border-transparent'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
          </nav>

          {/* Main Admin Workspace */}
          <section className="min-w-0 rounded-3xl border border-[#702B4C]/12 bg-white p-5 sm:p-7 lg:col-span-9">
            {loading || !data ? (
              <p className="py-12 text-center text-sm text-[#6A525E]">
                Loading universe records...
              </p>
            ) : mode === 'insights' ? (
              <OwnerInsightsViews
                section={insightSection}
                data={data}
                sessionFilter={sessionFilter}
                onSelectSessionFilter={setSessionFilter}
                onSwitchSection={setInsightSection}
              />
            ) : (
              <>
                {/* 1. Welcome & Settings */}
                {contentSection === 'welcome' && (
                  <form onSubmit={saveWelcomeSettings} className="space-y-4">
                    <h2 className="font-serif text-2xl font-semibold text-[#702B4C]">
                      Welcome Text, Access Hint &amp; Categories
                    </h2>
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-[#2E1A24]">
                        Homepage Welcome Heading
                      </label>
                      <input
                        type="text"
                        value={welcomeHeading}
                        onChange={(e) => setWelcomeHeading(e.target.value)}
                        className="min-h-[44px] w-full rounded-xl border border-[#702B4C]/20 bg-[#FFF9F5] px-3.5 text-sm"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-[#2E1A24]">
                        Homepage Supporting Text
                      </label>
                      <textarea
                        rows={2}
                        value={welcomeSubtitle}
                        onChange={(e) => setWelcomeSubtitle(e.target.value)}
                        className="w-full rounded-xl border border-[#702B4C]/20 bg-[#FFF9F5] p-3.5 text-sm"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-[#2E1A24]">
                        Private Gate Passcode Hint
                      </label>
                      <input
                        type="text"
                        value={accessHint}
                        onChange={(e) => setAccessHint(e.target.value)}
                        className="min-h-[44px] w-full rounded-xl border border-[#702B4C]/20 bg-[#FFF9F5] px-3.5 text-sm"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-xs font-semibold text-[#2E1A24]">
                        Content Categories (comma separated)
                      </label>
                      <input
                        type="text"
                        value={categoriesInput}
                        onChange={(e) => setCategoriesInput(e.target.value)}
                        className="min-h-[44px] w-full rounded-xl border border-[#702B4C]/20 bg-[#FFF9F5] px-3.5 text-sm"
                      />
                    </div>
                    <label className="flex items-center gap-2.5 text-sm text-[#2E1A24]">
                      <input
                        type="checkbox"
                        checked={allowSubmissions}
                        onChange={(e) => setAllowSubmissions(e.target.checked)}
                        className="h-4 w-4 accent-[#702B4C]"
                      />
                      <span>
                        Allow saving submitted answers from quizzes and prompts
                      </span>
                    </label>
                    <button
                      type="submit"
                      className="inline-flex min-h-[46px] items-center gap-2 rounded-xl bg-[#702B4C] px-5 py-2.5 text-sm font-semibold text-[#FFF9F5]"
                    >
                      <Save className="h-4 w-4" />
                      <span>Save Settings</span>
                    </button>
                  </form>
                )}

                {/* 2. Questions */}
                {contentSection === 'questions' && (
                  <div className="space-y-5">
                    <h2 className="font-serif text-2xl font-semibold text-[#702B4C]">
                      Manage Questions ({data.questions.length})
                    </h2>
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        if (!qPrompt.trim()) return;
                        const ok = await addToCollection(
                          'questions',
                          { prompt: qPrompt.trim(), mood: qMood },
                          'Question added.'
                        );
                        if (ok) setQPrompt('');
                      }}
                      className="flex flex-col gap-2.5 sm:flex-row"
                    >
                      <input
                        type="text"
                        value={qPrompt}
                        onChange={(e) => setQPrompt(e.target.value)}
                        placeholder="Add a new romantic or curious question..."
                        className="min-h-[44px] flex-1 rounded-xl border border-[#702B4C]/20 bg-[#FFF9F5] px-3.5 text-sm"
                      />
                      <select
                        value={qMood}
                        onChange={(e) => setQMood(e.target.value as QuestionMood)}
                        className="min-h-[44px] rounded-xl border border-[#702B4C]/20 bg-[#FFF9F5] px-3 text-sm"
                      >
                        {(['Thoughtful', 'Playful', 'Deep', 'Bold'] as const).map(
                          (m) => (
                            <option key={m} value={m}>
                              {m}
                            </option>
                          )
                        )}
                      </select>
                      <button
                        type="submit"
                        className="inline-flex min-h-[44px] items-center justify-center gap-1.5 rounded-xl bg-[#702B4C] px-4 text-xs font-semibold text-[#FFF9F5]"
                      >
                        <Plus className="h-4 w-4" />
                        <span>Add</span>
                      </button>
                    </form>
                    <ul className="divide-y divide-[#702B4C]/10">
                      {data.questions.map((q) => (
                        <li
                          key={q.id}
                          className="flex items-center justify-between gap-3 py-3"
                        >
                          <div>
                            <p className="text-xs font-semibold text-[#9274B8]">
                              {q.mood}
                            </p>
                            <p className="text-sm text-[#2E1A24]">{q.prompt}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              deleteFromCollection('questions', q.id, 'question')
                            }
                            aria-label="Delete question"
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[#6A525E] hover:bg-[#FFDCE8]/60 hover:text-[#702B4C]"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 3. Truth or Dare */}
                {contentSection === 'tod' && (
                  <div className="space-y-5">
                    <h2 className="font-serif text-2xl font-semibold text-[#702B4C]">
                      Manage Truth or Dare ({data.truthOrDares.length})
                    </h2>
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        if (!todText.trim()) return;
                        const ok = await addToCollection(
                          'truthOrDares',
                          {
                            mode: todMode,
                            intensity: todIntensity,
                            text: todText.trim(),
                          },
                          'Prompt added.'
                        );
                        if (ok) setTodText('');
                      }}
                      className="space-y-2.5"
                    >
                      <div className="grid gap-2.5 sm:grid-cols-2">
                        <select
                          value={todMode}
                          onChange={(e) => setTodMode(e.target.value as DareMode)}
                          className="min-h-[44px] rounded-xl border border-[#702B4C]/20 bg-[#FFF9F5] px-3 text-sm"
                        >
                          <option value="Truth">Truth</option>
                          <option value="Dare">Dare</option>
                        </select>
                        <select
                          value={todIntensity}
                          onChange={(e) =>
                            setTodIntensity(e.target.value as DareIntensity)
                          }
                          className="min-h-[44px] rounded-xl border border-[#702B4C]/20 bg-[#FFF9F5] px-3 text-sm"
                        >
                          <option value="Gentle">Gentle</option>
                          <option value="Playful">Playful</option>
                          <option value="Bold">Bold</option>
                        </select>
                      </div>
                      <div className="flex gap-2.5">
                        <input
                          type="text"
                          value={todText}
                          onChange={(e) => setTodText(e.target.value)}
                          placeholder="Write a respectful, fun prompt..."
                          className="min-h-[44px] flex-1 rounded-xl border border-[#702B4C]/20 bg-[#FFF9F5] px-3.5 text-sm"
                        />
                        <button
                          type="submit"
                          className="min-h-[44px] rounded-xl bg-[#702B4C] px-4 text-xs font-semibold text-[#FFF9F5]"
                        >
                          Add
                        </button>
                      </div>
                    </form>
                    <ul className="divide-y divide-[#702B4C]/10">
                      {data.truthOrDares.map((item) => (
                        <li
                          key={item.id}
                          className="flex items-center justify-between gap-3 py-3"
                        >
                          <div>
                            <p className="text-xs font-semibold text-[#9274B8]">
                              {item.mode} · {item.intensity}
                            </p>
                            <p className="text-sm text-[#2E1A24]">{item.text}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              deleteFromCollection('truthOrDares', item.id, 'prompt')
                            }
                            aria-label="Delete truth or dare prompt"
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[#6A525E] hover:bg-[#FFDCE8]/60 hover:text-[#702B4C]"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 4. Quiz */}
                {contentSection === 'quiz' && (
                  <div className="space-y-5">
                    <h2 className="font-serif text-2xl font-semibold text-[#702B4C]">
                      Know-Me Quiz Questions ({data.quizQuestions.length})
                    </h2>
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        const opts = [quizOpt0, quizOpt1, quizOpt2, quizOpt3]
                          .map((s) => s.trim())
                          .filter(Boolean);
                        if (!quizQuestion.trim() || opts.length < 2) return;
                        const ok = await addToCollection(
                          'quizQuestions',
                          {
                            question: quizQuestion.trim(),
                            options: opts,
                            correctIndex: Math.min(quizCorrect, opts.length - 1),
                            note: quizNote.trim() || 'A fun detail to know!',
                          },
                          'Quiz question saved.'
                        );
                        if (ok) {
                          setQuizQuestion('');
                          setQuizOpt0('');
                          setQuizOpt1('');
                          setQuizOpt2('');
                          setQuizOpt3('');
                          setQuizNote('');
                        }
                      }}
                      className="space-y-2.5 rounded-2xl bg-[#FFF9F5] p-4"
                    >
                      <input
                        type="text"
                        value={quizQuestion}
                        onChange={(e) => setQuizQuestion(e.target.value)}
                        placeholder="Quiz question..."
                        className="min-h-[44px] w-full rounded-xl border border-[#702B4C]/20 bg-white px-3.5 text-sm"
                      />
                      <div className="grid gap-2 sm:grid-cols-2">
                        <input
                          type="text"
                          value={quizOpt0}
                          onChange={(e) => setQuizOpt0(e.target.value)}
                          placeholder="Option 1"
                          className="min-h-[42px] rounded-xl border border-[#702B4C]/20 bg-white px-3 text-sm"
                        />
                        <input
                          type="text"
                          value={quizOpt1}
                          onChange={(e) => setQuizOpt1(e.target.value)}
                          placeholder="Option 2"
                          className="min-h-[42px] rounded-xl border border-[#702B4C]/20 bg-white px-3 text-sm"
                        />
                        <input
                          type="text"
                          value={quizOpt2}
                          onChange={(e) => setQuizOpt2(e.target.value)}
                          placeholder="Option 3 (optional)"
                          className="min-h-[42px] rounded-xl border border-[#702B4C]/20 bg-white px-3 text-sm"
                        />
                        <input
                          type="text"
                          value={quizOpt3}
                          onChange={(e) => setQuizOpt3(e.target.value)}
                          placeholder="Option 4 (optional)"
                          className="min-h-[42px] rounded-xl border border-[#702B4C]/20 bg-white px-3 text-sm"
                        />
                      </div>
                      <div className="grid gap-2 sm:grid-cols-2">
                        <select
                          value={quizCorrect}
                          onChange={(e) => setQuizCorrect(Number(e.target.value))}
                          className="min-h-[42px] rounded-xl border border-[#702B4C]/20 bg-white px-3 text-sm"
                        >
                          <option value={0}>Correct: Option 1</option>
                          <option value={1}>Correct: Option 2</option>
                          <option value={2}>Correct: Option 3</option>
                          <option value={3}>Correct: Option 4</option>
                        </select>
                        <input
                          type="text"
                          value={quizNote}
                          onChange={(e) => setQuizNote(e.target.value)}
                          placeholder="Feedback note after answering"
                          className="min-h-[42px] rounded-xl border border-[#702B4C]/20 bg-white px-3 text-sm"
                        />
                      </div>
                      <button
                        type="submit"
                        className="min-h-[44px] rounded-xl bg-[#702B4C] px-5 text-xs font-semibold text-[#FFF9F5]"
                      >
                        Add Quiz Question
                      </button>
                    </form>
                    <ul className="divide-y divide-[#702B4C]/10">
                      {data.quizQuestions.map((q) => (
                        <li
                          key={q.id}
                          className="flex items-start justify-between gap-3 py-3"
                        >
                          <div>
                            <p className="text-sm font-semibold text-[#2E1A24]">
                              {q.question}
                            </p>
                            <p className="text-xs text-[#6A525E]">
                              Correct: {q.options[q.correctIndex]}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              deleteFromCollection(
                                'quizQuestions',
                                q.id,
                                'quiz question'
                              )
                            }
                            aria-label="Delete quiz question"
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[#6A525E] hover:bg-[#FFDCE8]/60 hover:text-[#702B4C]"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 5. Compliments */}
                {contentSection === 'compliments' && (
                  <div className="space-y-5">
                    <h2 className="font-serif text-2xl font-semibold text-[#702B4C]">
                      Things I Appreciate ({data.compliments.length})
                    </h2>
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        if (!compTitle.trim() || !compText.trim()) return;
                        const ok = await addToCollection(
                          'compliments',
                          {
                            title: compTitle.trim(),
                            category: compCat.trim() || 'Presence',
                            text: compText.trim(),
                          },
                          'Compliment added.'
                        );
                        if (ok) {
                          setCompTitle('');
                          setCompText('');
                        }
                      }}
                      className="space-y-2.5"
                    >
                      <div className="grid gap-2.5 sm:grid-cols-2">
                        <input
                          type="text"
                          value={compTitle}
                          onChange={(e) => setCompTitle(e.target.value)}
                          placeholder="Short title"
                          className="min-h-[44px] rounded-xl border border-[#702B4C]/20 bg-[#FFF9F5] px-3.5 text-sm"
                        />
                        <input
                          type="text"
                          value={compCat}
                          onChange={(e) => setCompCat(e.target.value)}
                          placeholder="Category (e.g., Warmth)"
                          className="min-h-[44px] rounded-xl border border-[#702B4C]/20 bg-[#FFF9F5] px-3.5 text-sm"
                        />
                      </div>
                      <textarea
                        rows={2}
                        value={compText}
                        onChange={(e) => setCompText(e.target.value)}
                        placeholder="Write a genuine compliment..."
                        className="w-full rounded-xl border border-[#702B4C]/20 bg-[#FFF9F5] p-3.5 text-sm"
                      />
                      <button
                        type="submit"
                        className="min-h-[44px] rounded-xl bg-[#702B4C] px-5 text-xs font-semibold text-[#FFF9F5]"
                      >
                        Add Compliment
                      </button>
                    </form>
                    <ul className="divide-y divide-[#702B4C]/10">
                      {data.compliments.map((c) => (
                        <li
                          key={c.id}
                          className="flex items-start justify-between gap-3 py-3"
                        >
                          <div>
                            <p className="text-xs font-semibold text-[#9274B8]">
                              {c.title} · {c.category}
                            </p>
                            <p className="text-sm text-[#2E1A24]">{c.text}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              deleteFromCollection('compliments', c.id, 'compliment')
                            }
                            aria-label="Delete compliment"
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[#6A525E] hover:bg-[#FFDCE8]/60 hover:text-[#702B4C]"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 6. Hearts & Mystery Boxes */}
                {contentSection === 'surprises' && (
                  <div className="space-y-7">
                    <div className="space-y-4">
                      <h2 className="font-serif text-2xl font-semibold text-[#702B4C]">
                        Pick-a-Heart Surprises ({data.heartSurprises.length})
                      </h2>
                      <form
                        onSubmit={async (e) => {
                          e.preventDefault();
                          if (!heartMsg.trim()) return;
                          const ok = await addToCollection(
                            'heartSurprises',
                            { kind: heartKind, message: heartMsg.trim() },
                            'Heart surprise added.'
                          );
                          if (ok) setHeartMsg('');
                        }}
                        className="flex flex-col gap-2.5 sm:flex-row"
                      >
                        <select
                          value={heartKind}
                          onChange={(e) =>
                            setHeartKind(e.target.value as HeartRewardKind)
                          }
                          className="min-h-[44px] rounded-xl border border-[#702B4C]/20 bg-[#FFF9F5] px-3 text-sm"
                        >
                          {(
                            [
                              'Compliment',
                              'Romantic Note',
                              'Question',
                              'Surprise',
                              'Playful Challenge',
                            ] as const
                          ).map((k) => (
                            <option key={k} value={k}>
                              {k}
                            </option>
                          ))}
                        </select>
                        <input
                          type="text"
                          value={heartMsg}
                          onChange={(e) => setHeartMsg(e.target.value)}
                          placeholder="Hidden heart message..."
                          className="min-h-[44px] flex-1 rounded-xl border border-[#702B4C]/20 bg-[#FFF9F5] px-3.5 text-sm"
                        />
                        <button
                          type="submit"
                          className="min-h-[44px] rounded-xl bg-[#702B4C] px-4 text-xs font-semibold text-[#FFF9F5]"
                        >
                          Add
                        </button>
                      </form>
                      <ul className="divide-y divide-[#702B4C]/10">
                        {data.heartSurprises.map((h) => (
                          <li
                            key={h.id}
                            className="flex items-center justify-between gap-3 py-2.5"
                          >
                            <div>
                              <p className="text-xs font-semibold text-[#9274B8]">
                                {h.kind}
                              </p>
                              <p className="text-sm text-[#2E1A24]">{h.message}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                deleteFromCollection(
                                  'heartSurprises',
                                  h.id,
                                  'surprise'
                                )
                              }
                              aria-label="Delete heart surprise"
                              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[#6A525E] hover:bg-[#FFDCE8]/60 hover:text-[#702B4C]"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-4 border-t border-[#702B4C]/10 pt-6">
                      <h3 className="font-serif text-2xl font-semibold text-[#702B4C]">
                        Mystery Box Rewards ({data.mysteryRewards.length})
                      </h3>
                      <form
                        onSubmit={async (e) => {
                          e.preventDefault();
                          if (!boxTitle.trim() || !boxMsg.trim()) return;
                          const ok = await addToCollection(
                            'mysteryRewards',
                            {
                              title: boxTitle.trim(),
                              kind: 'Reward',
                              message: boxMsg.trim(),
                            },
                            'Mystery box reward added.'
                          );
                          if (ok) {
                            setBoxTitle('');
                            setBoxMsg('');
                          }
                        }}
                        className="flex flex-col gap-2.5 sm:flex-row"
                      >
                        <input
                          type="text"
                          value={boxTitle}
                          onChange={(e) => setBoxTitle(e.target.value)}
                          placeholder="Reward title"
                          className="min-h-[44px] rounded-xl border border-[#702B4C]/20 bg-[#FFF9F5] px-3.5 text-sm"
                        />
                        <input
                          type="text"
                          value={boxMsg}
                          onChange={(e) => setBoxMsg(e.target.value)}
                          placeholder="Reward description"
                          className="min-h-[44px] flex-1 rounded-xl border border-[#702B4C]/20 bg-[#FFF9F5] px-3.5 text-sm"
                        />
                        <button
                          type="submit"
                          className="min-h-[44px] rounded-xl bg-[#702B4C] px-4 text-xs font-semibold text-[#FFF9F5]"
                        >
                          Add
                        </button>
                      </form>
                      <ul className="divide-y divide-[#702B4C]/10">
                        {data.mysteryRewards.map((r) => (
                          <li
                            key={r.id}
                            className="flex items-center justify-between gap-3 py-2.5"
                          >
                            <div>
                              <p className="text-xs font-semibold text-[#9274B8]">
                                {r.title} · {r.kind}
                              </p>
                              <p className="text-sm text-[#2E1A24]">{r.message}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                deleteFromCollection(
                                  'mysteryRewards',
                                  r.id,
                                  'reward'
                                )
                              }
                              aria-label="Delete mystery reward"
                              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[#6A525E] hover:bg-[#FFDCE8]/60 hover:text-[#702B4C]"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* 7. Scratch Cards */}
                {contentSection === 'scratch' && (
                  <div className="space-y-5">
                    <h2 className="font-serif text-2xl font-semibold text-[#702B4C]">
                      Scratch &amp; Reveal Cards ({data.scratchCards.length})
                    </h2>
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        if (!scratchTitle.trim() || !scratchText.trim()) return;
                        const ok = await addToCollection(
                          'scratchCards',
                          {
                            title: scratchTitle.trim(),
                            category: scratchCat,
                            secretText: scratchText.trim(),
                            accent: 'champagne',
                          },
                          'Scratch card added.'
                        );
                        if (ok) {
                          setScratchTitle('');
                          setScratchText('');
                        }
                      }}
                      className="space-y-2.5"
                    >
                      <div className="grid gap-2.5 sm:grid-cols-2">
                        <input
                          type="text"
                          value={scratchTitle}
                          onChange={(e) => setScratchTitle(e.target.value)}
                          placeholder="Card title"
                          className="min-h-[44px] rounded-xl border border-[#702B4C]/20 bg-[#FFF9F5] px-3.5 text-sm"
                        />
                        <select
                          value={scratchCat}
                          onChange={(e) =>
                            setScratchCat(e.target.value as typeof scratchCat)
                          }
                          className="min-h-[44px] rounded-xl border border-[#702B4C]/20 bg-[#FFF9F5] px-3 text-sm"
                        >
                          <option value="Compliment">Compliment</option>
                          <option value="Romantic Note">Romantic Note</option>
                          <option value="Challenge">Challenge</option>
                          <option value="Small Reward">Small Reward</option>
                          <option value="Surprise">Surprise</option>
                        </select>
                      </div>
                      <textarea
                        rows={2}
                        value={scratchText}
                        onChange={(e) => setScratchText(e.target.value)}
                        placeholder="Secret message revealed underneath the foil..."
                        className="w-full rounded-xl border border-[#702B4C]/20 bg-[#FFF9F5] p-3.5 text-sm"
                      />
                      <button
                        type="submit"
                        className="min-h-[44px] rounded-xl bg-[#702B4C] px-5 text-xs font-semibold text-[#FFF9F5]"
                      >
                        Add Scratch Card
                      </button>
                    </form>
                    <ul className="divide-y divide-[#702B4C]/10">
                      {data.scratchCards.map((c) => (
                        <li
                          key={c.id}
                          className="flex items-start justify-between gap-3 py-3"
                        >
                          <div>
                            <p className="text-xs font-semibold text-[#9274B8]">
                              {c.title} · {c.category}
                            </p>
                            <p className="text-sm text-[#2E1A24]">{c.secretText}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              deleteFromCollection(
                                'scratchCards',
                                c.id,
                                'scratch card'
                              )
                            }
                            aria-label="Delete scratch card"
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[#6A525E] hover:bg-[#FFDCE8]/60 hover:text-[#702B4C]"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 8. Secret Envelopes */}
                {contentSection === 'envelopes' && (
                  <div className="space-y-5">
                    <h2 className="font-serif text-2xl font-semibold text-[#702B4C]">
                      Secret Envelopes ({data.envelopes.length})
                    </h2>
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        if (!envLabel.trim() || !envBody.trim()) return;
                        const ok = await addToCollection(
                          'envelopes',
                          {
                            label: envLabel.trim(),
                            occasion: envOccasion.trim() || 'Anytime',
                            salutation: envSalutation.trim() || 'Dear Mehak,',
                            body: envBody.trim(),
                            closing: envClosing.trim() || 'Always,',
                            sealColor: 'burgundy',
                          },
                          'Envelope added.'
                        );
                        if (ok) {
                          setEnvLabel('');
                          setEnvBody('');
                        }
                      }}
                      className="space-y-2.5"
                    >
                      <div className="grid gap-2.5 sm:grid-cols-2">
                        <input
                          type="text"
                          value={envLabel}
                          onChange={(e) => setEnvLabel(e.target.value)}
                          placeholder="Envelope front label (e.g., Open when...)"
                          className="min-h-[44px] rounded-xl border border-[#702B4C]/20 bg-[#FFF9F5] px-3.5 text-sm"
                        />
                        <input
                          type="text"
                          value={envOccasion}
                          onChange={(e) => setEnvOccasion(e.target.value)}
                          placeholder="Occasion"
                          className="min-h-[44px] rounded-xl border border-[#702B4C]/20 bg-[#FFF9F5] px-3.5 text-sm"
                        />
                      </div>
                      <div className="grid gap-2.5 sm:grid-cols-2">
                        <input
                          type="text"
                          value={envSalutation}
                          onChange={(e) => setEnvSalutation(e.target.value)}
                          placeholder="Salutation"
                          className="min-h-[44px] rounded-xl border border-[#702B4C]/20 bg-[#FFF9F5] px-3.5 text-sm"
                        />
                        <input
                          type="text"
                          value={envClosing}
                          onChange={(e) => setEnvClosing(e.target.value)}
                          placeholder="Closing signature"
                          className="min-h-[44px] rounded-xl border border-[#702B4C]/20 bg-[#FFF9F5] px-3.5 text-sm"
                        />
                      </div>
                      <textarea
                        rows={3}
                        value={envBody}
                        onChange={(e) => setEnvBody(e.target.value)}
                        placeholder="Letter message inside the envelope..."
                        className="w-full rounded-xl border border-[#702B4C]/20 bg-[#FFF9F5] p-3.5 text-sm"
                      />
                      <button
                        type="submit"
                        className="min-h-[44px] rounded-xl bg-[#702B4C] px-5 text-xs font-semibold text-[#FFF9F5]"
                      >
                        Add Secret Envelope
                      </button>
                    </form>
                    <ul className="divide-y divide-[#702B4C]/10">
                      {data.envelopes.map((env) => (
                        <li
                          key={env.id}
                          className="flex items-start justify-between gap-3 py-3"
                        >
                          <div>
                            <p className="text-xs font-semibold text-[#9274B8]">
                              {env.label} · {env.occasion}
                            </p>
                            <p className="text-sm text-[#2E1A24]">{env.body}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              deleteFromCollection('envelopes', env.id, 'envelope')
                            }
                            aria-label="Delete envelope"
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[#6A525E] hover:bg-[#FFDCE8]/60 hover:text-[#702B4C]"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 9. Memories */}
                {contentSection === 'memories' && (
                  <div className="space-y-5">
                    <h2 className="font-serif text-2xl font-semibold text-[#702B4C]">
                      Memory Timeline ({data.memories.length})
                    </h2>
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        if (!memDate.trim() || !memTitle.trim() || !memDesc.trim())
                          return;
                        const ok = await addToCollection(
                          'memories',
                          {
                            dateLabel: memDate.trim(),
                            title: memTitle.trim(),
                            category: memCat.trim() || 'Milestone',
                            description: memDesc.trim(),
                          },
                          'Memory added to timeline.'
                        );
                        if (ok) {
                          setMemDate('');
                          setMemTitle('');
                          setMemDesc('');
                        }
                      }}
                      className="space-y-2.5"
                    >
                      <div className="grid gap-2.5 sm:grid-cols-3">
                        <input
                          type="text"
                          value={memDate}
                          onChange={(e) => setMemDate(e.target.value)}
                          placeholder="Date (e.g., Nov 19, 2026)"
                          className="min-h-[44px] rounded-xl border border-[#702B4C]/20 bg-[#FFF9F5] px-3.5 text-sm"
                        />
                        <input
                          type="text"
                          value={memTitle}
                          onChange={(e) => setMemTitle(e.target.value)}
                          placeholder="Moment title"
                          className="min-h-[44px] rounded-xl border border-[#702B4C]/20 bg-[#FFF9F5] px-3.5 text-sm"
                        />
                        <input
                          type="text"
                          value={memCat}
                          onChange={(e) => setMemCat(e.target.value)}
                          placeholder="Category"
                          className="min-h-[44px] rounded-xl border border-[#702B4C]/20 bg-[#FFF9F5] px-3.5 text-sm"
                        />
                      </div>
                      <textarea
                        rows={2}
                        value={memDesc}
                        onChange={(e) => setMemDesc(e.target.value)}
                        placeholder="Describe this real memory..."
                        className="w-full rounded-xl border border-[#702B4C]/20 bg-[#FFF9F5] p-3.5 text-sm"
                      />
                      <button
                        type="submit"
                        className="min-h-[44px] rounded-xl bg-[#702B4C] px-5 text-xs font-semibold text-[#FFF9F5]"
                      >
                        Add Real Memory
                      </button>
                    </form>
                    {data.memories.length === 0 ? (
                      <p className="text-sm text-[#6A525E]">
                        No memories added yet. Add your first real moment above.
                      </p>
                    ) : (
                      <ul className="divide-y divide-[#702B4C]/10">
                        {data.memories.map((m) => (
                          <li
                            key={m.id}
                            className="flex items-start justify-between gap-3 py-3"
                          >
                            <div>
                              <p className="text-xs font-semibold text-[#9274B8]">
                                {m.dateLabel} · {m.category}
                              </p>
                              <p className="font-semibold text-[#702B4C]">
                                {m.title}
                              </p>
                              <p className="text-sm text-[#2E1A24]">
                                {m.description}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                deleteFromCollection('memories', m.id, 'memory')
                              }
                              aria-label="Delete memory"
                              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[#6A525E] hover:bg-[#FFDCE8]/60 hover:text-[#702B4C]"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}

                {/* 10. Inside Jokes */}
                {contentSection === 'jokes' && (
                  <div className="space-y-5">
                    <h2 className="font-serif text-2xl font-semibold text-[#702B4C]">
                      Inside-Joke Vault ({data.insideJokes.length})
                    </h2>
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        if (!jokeTitle.trim() || !jokeStory.trim()) return;
                        const ok = await addToCollection(
                          'insideJokes',
                          {
                            title: jokeTitle.trim(),
                            clue: jokeClue.trim() || 'Tap to unlock',
                            story: jokeStory.trim(),
                            createdAt: new Date().toISOString(),
                          },
                          'Inside joke added.'
                        );
                        if (ok) {
                          setJokeTitle('');
                          setJokeClue('');
                          setJokeStory('');
                        }
                      }}
                      className="space-y-2.5"
                    >
                      <div className="grid gap-2.5 sm:grid-cols-2">
                        <input
                          type="text"
                          value={jokeTitle}
                          onChange={(e) => setJokeTitle(e.target.value)}
                          placeholder="Title"
                          className="min-h-[44px] rounded-xl border border-[#702B4C]/20 bg-[#FFF9F5] px-3.5 text-sm"
                        />
                        <input
                          type="text"
                          value={jokeClue}
                          onChange={(e) => setJokeClue(e.target.value)}
                          placeholder="Clue"
                          className="min-h-[44px] rounded-xl border border-[#702B4C]/20 bg-[#FFF9F5] px-3.5 text-sm"
                        />
                      </div>
                      <textarea
                        rows={2}
                        value={jokeStory}
                        onChange={(e) => setJokeStory(e.target.value)}
                        placeholder="Story..."
                        className="w-full rounded-xl border border-[#702B4C]/20 bg-[#FFF9F5] p-3.5 text-sm"
                      />
                      <button
                        type="submit"
                        className="min-h-[44px] rounded-xl bg-[#702B4C] px-5 text-xs font-semibold text-[#FFF9F5]"
                      >
                        Add Inside Joke
                      </button>
                    </form>
                    <ul className="divide-y divide-[#702B4C]/10">
                      {data.insideJokes.map((j) => (
                        <li
                          key={j.id}
                          className="flex items-start justify-between gap-3 py-3"
                        >
                          <div>
                            <p className="text-sm font-semibold text-[#702B4C]">
                              {j.title}
                            </p>
                            <p className="text-xs text-[#6A525E]">{j.story}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              deleteFromCollection(
                                'insideJokes',
                                j.id,
                                'inside joke'
                              )
                            }
                            aria-label="Delete inside joke"
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[#6A525E] hover:bg-[#FFDCE8]/60 hover:text-[#702B4C]"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 11. Bucket List Editor */}
                {contentSection === 'bucket' && (
                  <div className="space-y-5">
                    <h2 className="font-serif text-2xl font-semibold text-[#702B4C]">
                      Bucket List Editor ({data.bucketList.length})
                    </h2>
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        if (!bucketTitle.trim()) return;
                        const ok = await addToCollection(
                          'bucketList',
                          {
                            title: bucketTitle.trim(),
                            category: bucketCat,
                            completed: false,
                            createdAt: new Date().toISOString(),
                          },
                          'Bucket list activity added.'
                        );
                        if (ok) setBucketTitle('');
                      }}
                      className="flex flex-col gap-2.5 sm:flex-row"
                    >
                      <input
                        type="text"
                        value={bucketTitle}
                        onChange={(e) => setBucketTitle(e.target.value)}
                        placeholder="New bucket list activity..."
                        className="min-h-[44px] flex-1 rounded-xl border border-[#702B4C]/20 bg-[#FFF9F5] px-3.5 text-sm"
                      />
                      <input
                        type="text"
                        value={bucketCat}
                        onChange={(e) => setBucketCat(e.target.value)}
                        placeholder="Category"
                        className="min-h-[44px] w-36 rounded-xl border border-[#702B4C]/20 bg-[#FFF9F5] px-3 text-sm"
                      />
                      <button
                        type="submit"
                        className="min-h-[44px] rounded-xl bg-[#702B4C] px-4 text-xs font-semibold text-[#FFF9F5]"
                      >
                        Add
                      </button>
                    </form>
                    <ul className="divide-y divide-[#702B4C]/10">
                      {data.bucketList.map((b) => (
                        <li
                          key={b.id}
                          className="flex items-center justify-between gap-3 py-3"
                        >
                          <div>
                            <p className="text-sm text-[#2E1A24]">{b.title}</p>
                            <p className="text-xs text-[#9274B8]">
                              {b.category} · {b.completed ? 'Completed' : 'To Do'}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              deleteFromCollection(
                                'bucketList',
                                b.id,
                                'bucket item'
                              )
                            }
                            aria-label="Delete bucket item"
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[#6A525E] hover:bg-[#FFDCE8]/60 hover:text-[#702B4C]"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 12. Date Ideas Editor */}
                {contentSection === 'dates' && (
                  <div className="space-y-5">
                    <h2 className="font-serif text-2xl font-semibold text-[#702B4C]">
                      Destination Ideas ({data.destinations.length}) &amp; Date
                      Plans ({data.datePlans.length})
                    </h2>
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        if (!destName.trim()) return;
                        const ok = await addToCollection(
                          'destinations',
                          {
                            name: destName.trim(),
                            category: destCat,
                            vibeNote:
                              destVibe.trim() || 'Worth exploring together.',
                          },
                          'Destination idea added.'
                        );
                        if (ok) {
                          setDestName('');
                          setDestVibe('');
                        }
                      }}
                      className="flex flex-col gap-2.5 sm:flex-row"
                    >
                      <input
                        type="text"
                        value={destName}
                        onChange={(e) => setDestName(e.target.value)}
                        placeholder="Spot name"
                        className="min-h-[44px] flex-1 rounded-xl border border-[#702B4C]/20 bg-[#FFF9F5] px-3.5 text-sm"
                      />
                      <select
                        value={destCat}
                        onChange={(e) =>
                          setDestCat(e.target.value as DestinationCategory)
                        }
                        className="min-h-[44px] rounded-xl border border-[#702B4C]/20 bg-[#FFF9F5] px-3 text-sm"
                      >
                        {(
                          ['Café', 'Restaurant', 'Park', 'Shopping', 'Travel'] as const
                        ).map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        value={destVibe}
                        onChange={(e) => setDestVibe(e.target.value)}
                        placeholder="Vibe note"
                        className="min-h-[44px] flex-1 rounded-xl border border-[#702B4C]/20 bg-[#FFF9F5] px-3.5 text-sm"
                      />
                      <button
                        type="submit"
                        className="min-h-[44px] rounded-xl bg-[#702B4C] px-4 text-xs font-semibold text-[#FFF9F5]"
                      >
                        Add
                      </button>
                    </form>
                    <ul className="divide-y divide-[#702B4C]/10">
                      {data.destinations.map((d) => (
                        <li
                          key={d.id}
                          className="flex items-center justify-between gap-3 py-2.5"
                        >
                          <div>
                            <p className="text-sm font-semibold text-[#2E1A24]">
                              {d.name}
                            </p>
                            <p className="text-xs text-[#6A525E]">
                              {d.category} · {d.vibeNote}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              deleteFromCollection(
                                'destinations',
                                d.id,
                                'destination'
                              )
                            }
                            aria-label="Delete destination"
                            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[#6A525E] hover:bg-[#FFDCE8]/60 hover:text-[#702B4C]"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 13. Export & Backup */}
                {contentSection === 'backup' && (
                  <div className="space-y-5">
                    <h2 className="font-serif text-2xl font-semibold text-[#702B4C]">
                      Export &amp; Restore Universe Data
                    </h2>
                    <p className="text-sm text-[#6A525E]">
                      Download a complete JSON snapshot of every question,
                      envelope, memory, compliment, bucket item, saved answer,
                      quiz attempt, game score, and archived session — or
                      restore from a previous backup.
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={handleExportBackup}
                        className="inline-flex min-h-[46px] items-center gap-2 rounded-xl bg-[#702B4C] px-5 py-2.5 text-sm font-semibold text-[#FFF9F5] hover:bg-[#531D38]"
                      >
                        <Download className="h-4 w-4" />
                        <span>Download JSON Backup</span>
                      </button>

                      <label className="inline-flex min-h-[46px] cursor-pointer items-center gap-2 rounded-xl border border-[#702B4C]/25 bg-[#FFF9F5] px-5 py-2.5 text-sm font-semibold text-[#702B4C] hover:bg-[#FFDCE8]/40">
                        <Upload className="h-4 w-4" />
                        <span>Restore from Backup</span>
                        <input
                          type="file"
                          accept="application/json"
                          onChange={handleRestoreFile}
                          className="sr-only"
                        />
                      </label>
                    </div>
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
