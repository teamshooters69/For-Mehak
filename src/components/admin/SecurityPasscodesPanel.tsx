import { useState, type FormEvent } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  ShieldCheck,
} from 'lucide-react';
import { api } from '../../lib/api';
import type { AdminSecurityStatus } from '../../types/universe';

interface SecurityPasscodesPanelProps {
  security: AdminSecurityStatus | null;
  currentHint: string;
  onSecurityUpdated: (next: AdminSecurityStatus) => void;
  onUniverseMutated: () => void;
  onFlash: (message: string) => void;
  onError: (message: string) => void;
}

export function SecurityPasscodesPanel({
  security,
  currentHint,
  onSecurityUpdated,
  onUniverseMutated,
  onFlash,
  onError,
}: SecurityPasscodesPanelProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showAdminPw, setShowAdminPw] = useState(false);
  const [savingAdmin, setSavingAdmin] = useState(false);

  const [newAccessCode, setNewAccessCode] = useState('');
  const [accessHint, setAccessHint] = useState(currentHint);
  const [showGateCode, setShowGateCode] = useState(false);
  const [savingGate, setSavingGate] = useState(false);

  async function handleSaveAdminCredentials(e: FormEvent) {
    e.preventDefault();
    if (!currentPassword.trim()) {
      onError('Enter your current owner password to confirm this change.');
      return;
    }
    if (newPassword.trim().length < 6) {
      onError('New owner password must be at least 6 characters.');
      return;
    }
    if (newPassword.trim() !== confirmPassword.trim()) {
      onError('New password and confirmation do not match.');
      return;
    }

    setSavingAdmin(true);
    try {
      const updated = await api.updateAdminCredentials({
        currentPassword: currentPassword.trim(),
        newUsername: newUsername.trim() || undefined,
        newPassword: newPassword.trim(),
      });
      onSecurityUpdated(updated);
      setCurrentPassword('');
      setNewUsername('');
      setNewPassword('');
      setConfirmPassword('');
      onFlash('Owner admin password updated securely.');
    } catch (err) {
      onError(
        err instanceof Error ? err.message : 'Unable to update owner password.'
      );
    } finally {
      setSavingAdmin(false);
    }
  }

  async function handleSaveGatePasscode(e: FormEvent) {
    e.preventDefault();
    if (newAccessCode.trim().length < 3) {
      onError('Gate passcode must be at least 3 characters.');
      return;
    }

    setSavingGate(true);
    try {
      const updated = await api.updateUniverseAccessCode({
        newAccessCode: newAccessCode.trim(),
        accessHint: accessHint.trim(),
      });
      onSecurityUpdated(updated);
      setNewAccessCode('');
      onUniverseMutated();
      onFlash("Mehak's gate passcode and hint updated.");
    } catch (err) {
      onError(
        err instanceof Error ? err.message : 'Unable to update gate passcode.'
      );
    } finally {
      setSavingGate(false);
    }
  }

  return (
    <div className="space-y-7">
      <div>
        <h2 className="font-serif text-2xl font-semibold text-[#702B4C]">
          Security &amp; Passcodes
        </h2>
        <p className="mt-1 text-sm text-[#6A525E]">
          Control your private owner sign-in password and Mehak&apos;s entrance
          passcode. Credentials are hashed with salted scrypt on the backend and
          never exposed to client code.
        </p>
      </div>

      {/* Live Security Status Grid */}
      {security && (
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-[#702B4C]/12 bg-[#FFF9F5] p-4">
            <p className="text-xs font-semibold text-[#6A525E]">
              Owner Admin Password
            </p>
            <div className="mt-1.5 flex items-center gap-2">
              {security.usingDefaultAdminPassword ? (
                <AlertTriangle className="h-4 w-4 shrink-0 text-amber-700" />
              ) : (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-700" />
              )}
              <span
                className={`text-sm font-semibold ${
                  security.usingDefaultAdminPassword
                    ? 'text-amber-800'
                    : 'text-emerald-800'
                }`}
              >
                {security.usingDefaultAdminPassword
                  ? 'Default Active'
                  : security.adminPasswordSource === 'env'
                    ? 'Custom (Vercel Env)'
                    : security.adminPasswordSource === 'panel'
                      ? 'Custom (Saved in Panel)'
                      : 'Custom (Configured)'}
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-[#702B4C]/12 bg-[#FFF9F5] p-4">
            <p className="text-xs font-semibold text-[#6A525E]">
              Mehak&apos;s Gate Passcode
            </p>
            <div className="mt-1.5 flex items-center gap-2">
              <KeyRound className="h-4 w-4 shrink-0 text-[#9274B8]" />
              <span className="text-sm font-semibold text-[#2E1A24]">
                {security.usingDefaultAccessCode
                  ? 'Default ("mehak")'
                  : security.accessCodeSource === 'env'
                    ? 'Custom (Vercel Env)'
                    : 'Custom (Saved in Panel)'}
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-[#702B4C]/12 bg-[#FFF9F5] p-4">
            <p className="text-xs font-semibold text-[#6A525E]">
              Storage Durability
            </p>
            <div className="mt-1.5 flex items-center gap-2">
              {security.durableStorageActive ? (
                <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-700" />
              ) : (
                <AlertTriangle className="h-4 w-4 shrink-0 text-amber-700" />
              )}
              <span
                className={`text-sm font-semibold ${
                  security.durableStorageActive
                    ? 'text-emerald-800'
                    : 'text-amber-800'
                }`}
              >
                {security.storageMode === 'kv'
                  ? 'Cloud KV Connected'
                  : security.storageMode === 'local-file'
                    ? 'Local Disk'
                    : 'Temporary Vercel /tmp'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Important Vercel Persistence Notice */}
      {security && security.storageMode === 'vercel-tmp' && (
        <div className="rounded-2xl border border-amber-700/25 bg-amber-50/90 p-4 text-xs leading-relaxed text-amber-950">
          <p className="font-semibold">
            Make your password permanent on Vercel:
          </p>
          <p className="mt-1">
            This Vercel deployment does not have Upstash Redis / Vercel KV
            connected yet, so changes saved inside this form reset when Vercel
            restarts a serverless instance. For permanent passcodes across every
            deployment, set{' '}
            <code className="rounded bg-amber-900/10 px-1 py-0.5 font-mono">
              ADMIN_PASSWORD
            </code>
            ,{' '}
            <code className="rounded bg-amber-900/10 px-1 py-0.5 font-mono">
              ADMIN_USERNAME
            </code>
            ,{' '}
            <code className="rounded bg-amber-900/10 px-1 py-0.5 font-mono">
              UNIVERSE_ACCESS_CODE
            </code>
            , and{' '}
            <code className="rounded bg-amber-900/10 px-1 py-0.5 font-mono">
              SESSION_SECRET
            </code>{' '}
            in <strong>Vercel → Project Settings → Environment Variables</strong>{' '}
            and click <strong>Redeploy</strong>.
          </p>
        </div>
      )}

      {/* Form 1: Owner Admin Password */}
      <form
        onSubmit={handleSaveAdminCredentials}
        className="space-y-4 rounded-2xl border border-[#702B4C]/12 bg-[#FFF9F5]/70 p-5"
      >
        <div className="flex items-center gap-2.5">
          <Lock className="h-4 w-4 text-[#702B4C]" />
          <h3 className="font-serif text-lg font-semibold text-[#702B4C]">
            Change Owner Admin Password
          </h3>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="sec-current-pw"
              className="mb-1.5 block text-xs font-semibold text-[#2E1A24]"
            >
              Current Owner Password
            </label>
            <input
              id="sec-current-pw"
              type={showAdminPw ? 'text' : 'password'}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Enter current password"
              className="min-h-[44px] w-full rounded-xl border border-[#702B4C]/20 bg-white px-3.5 text-sm text-[#2E1A24] focus:border-[#702B4C] focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="sec-new-user"
              className="mb-1.5 block text-xs font-semibold text-[#2E1A24]"
            >
              Custom Owner Username (optional)
            </label>
            <input
              id="sec-new-user"
              type="text"
              value={newUsername}
              onChange={(e) => setNewUsername(e.target.value)}
              placeholder="Leave blank to allow password-only login"
              className="min-h-[44px] w-full rounded-xl border border-[#702B4C]/20 bg-white px-3.5 text-sm text-[#2E1A24] focus:border-[#702B4C] focus:outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="sec-new-pw"
              className="mb-1.5 block text-xs font-semibold text-[#2E1A24]"
            >
              New Owner Password
            </label>
            <div className="relative">
              <input
                id="sec-new-pw"
                type={showAdminPw ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="min-h-[44px] w-full rounded-xl border border-[#702B4C]/20 bg-white py-2 pr-11 pl-3.5 text-sm text-[#2E1A24] focus:border-[#702B4C] focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowAdminPw((v) => !v)}
                aria-label={showAdminPw ? 'Hide passwords' : 'Show passwords'}
                className="absolute top-1/2 right-1 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg text-[#6A525E] hover:text-[#702B4C]"
              >
                {showAdminPw ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label
              htmlFor="sec-confirm-pw"
              className="mb-1.5 block text-xs font-semibold text-[#2E1A24]"
            >
              Confirm New Owner Password
            </label>
            <input
              id="sec-confirm-pw"
              type={showAdminPw ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter new password"
              className="min-h-[44px] w-full rounded-xl border border-[#702B4C]/20 bg-white px-3.5 text-sm text-[#2E1A24] focus:border-[#702B4C] focus:outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={savingAdmin}
          className="min-h-[44px] rounded-xl bg-[#702B4C] px-5 text-xs font-semibold text-[#FFF9F5] hover:bg-[#531D38] disabled:opacity-60"
        >
          {savingAdmin ? 'Updating...' : 'Save New Owner Password'}
        </button>
      </form>

      {/* Form 2: Mehak's Entrance Passcode */}
      <form
        onSubmit={handleSaveGatePasscode}
        className="space-y-4 rounded-2xl border border-[#702B4C]/12 bg-[#FFF9F5]/70 p-5"
      >
        <div className="flex items-center gap-2.5">
          <KeyRound className="h-4 w-4 text-[#9274B8]" />
          <h3 className="font-serif text-lg font-semibold text-[#702B4C]">
            Change Mehak&apos;s Entrance Passcode
          </h3>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="sec-gate-code"
              className="mb-1.5 block text-xs font-semibold text-[#2E1A24]"
            >
              New Gate Passcode
            </label>
            <div className="relative">
              <input
                id="sec-gate-code"
                type={showGateCode ? 'text' : 'password'}
                value={newAccessCode}
                onChange={(e) => setNewAccessCode(e.target.value)}
                placeholder="e.g. a secret word only she knows"
                className="min-h-[44px] w-full rounded-xl border border-[#702B4C]/20 bg-white py-2 pr-11 pl-3.5 text-sm text-[#2E1A24] focus:border-[#702B4C] focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowGateCode((v) => !v)}
                aria-label={showGateCode ? 'Hide passcode' : 'Show passcode'}
                className="absolute top-1/2 right-1 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg text-[#6A525E] hover:text-[#702B4C]"
              >
                {showGateCode ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label
              htmlFor="sec-gate-hint"
              className="mb-1.5 block text-xs font-semibold text-[#2E1A24]"
            >
              Passcode Hint Shown on Gate
            </label>
            <input
              id="sec-gate-hint"
              type="text"
              value={accessHint}
              onChange={(e) => setAccessHint(e.target.value)}
              placeholder="Optional clue shown under the input"
              className="min-h-[44px] w-full rounded-xl border border-[#702B4C]/20 bg-white px-3.5 text-sm text-[#2E1A24] focus:border-[#702B4C] focus:outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={savingGate}
          className="min-h-[44px] rounded-xl bg-[#702B4C] px-5 text-xs font-semibold text-[#FFF9F5] hover:bg-[#531D38] disabled:opacity-60"
        >
          {savingGate ? 'Saving...' : 'Update Gate Passcode'}
        </button>
      </form>
    </div>
  );
}
