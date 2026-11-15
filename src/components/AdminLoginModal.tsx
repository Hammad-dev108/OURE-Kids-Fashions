import { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, ShieldCheck, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export function AdminLoginModal() {
  const {
    supabaseEnabled,
    adminLoginOpen,
    closeAdminLogin,
    authenticateAdmin,
  } = useStore();

  const [email, setEmail] = useState('');
  const [credential, setCredential] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!adminLoginOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    if (supabaseEnabled && !email.trim()) {
      setError('Please enter your admin email.');
      return;
    }
    if (!credential.trim()) {
      setError(
        supabaseEnabled
          ? 'Please enter your admin password.'
          : 'Please enter your Admin PIN or password.'
      );
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const res = await authenticateAdmin({
        email: supabaseEnabled ? email.trim() : undefined,
        password: credential,
      });
      if (!res.ok) {
        setError(res.error ?? 'Authentication failed. Please try again.');
        return;
      }
      setEmail('');
      setCredential('');
      setShowSecret(false);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setCredential('');
    setError('');
    setShowSecret(false);
    closeAdminLogin();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 overflow-y-auto overscroll-contain flex items-start sm:items-center justify-center p-2 sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-login-title"
    >
      <div className="relative w-full max-w-md my-auto rounded-2xl border border-[#E8DFD1] bg-[#FFFFFF] shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between rounded-t-2xl border-b border-[#E8DFD1] bg-[#FAF6F0] px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#C8963E]/40 bg-[#F4E4D8] text-[#C8963E]">
              <Lock className="h-4.5 w-4.5" />
            </div>
            <div>
              <h2
                id="admin-login-title"
                className="font-display text-2xl font-semibold text-[#2C221E]"
              >
                Atelier Admin Access
              </h2>
              <p className="text-[11px] text-[#6E5D54]">
                OURA Fashion Kid&apos;s Boutique Management
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            aria-label="Close admin login"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-[#6E5D54] hover:bg-[#F5EFE6] hover:text-[#2C221E]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          {supabaseEnabled && (
            <div>
              <label
                htmlFor="admin-email"
                className="mb-1.5 block text-xs font-medium text-[#6E5D54]"
              >
                Admin Email
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[#6E5D54]" />
                <input
                  id="admin-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError('');
                  }}
                  autoFocus
                  placeholder="admin@ourakids.com"
                  className="w-full min-w-0 rounded-lg border border-[#E8DFD1] bg-[#FAF6F0] py-2.5 pr-3.5 pl-10 text-base sm:text-sm text-[#2C221E] placeholder:text-[#6E5D54]/55 focus:border-[#C8963E] focus:outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label
              htmlFor="admin-credential"
              className="mb-1.5 block text-xs font-medium text-[#6E5D54]"
            >
              {supabaseEnabled ? 'Admin Password' : 'Admin PIN or Password'}
            </label>
            <div className="relative">
              <input
                id="admin-credential"
                type={showSecret ? 'text' : 'password'}
                value={credential}
                onChange={(e) => {
                  setCredential(e.target.value);
                  if (error) setError('');
                }}
                autoFocus={!supabaseEnabled}
                placeholder={
                  supabaseEnabled
                    ? 'Enter your Supabase admin password'
                    : 'Enter admin PIN or password'
                }
                className="w-full min-w-0 rounded-lg border border-[#E8DFD1] bg-[#FAF6F0] py-2.5 pr-10 pl-3.5 text-base sm:text-sm text-[#2C221E] placeholder:text-[#6E5D54]/55 focus:border-[#C8963E] focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowSecret((prev) => !prev)}
                aria-label={showSecret ? 'Hide password' : 'Show password'}
                className="absolute inset-y-0 right-2.5 flex items-center text-[#6E5D54] hover:text-[#2C221E]"
              >
                {showSecret ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-[#C8963E] bg-[#F4E4D8] px-3.5 py-2 text-xs font-medium text-[#2C221E]">
              {error}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-lg border border-[#E8DFD1] bg-[#FFFFFF] px-4 py-2.5 text-xs font-medium text-[#6E5D54] hover:border-[#C8963E] hover:text-[#2C221E]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-lg bg-[#C8963E] px-5 py-2.5 text-xs font-semibold text-[#FFFFFF] transition-colors hover:bg-[#E0AF50] hover:text-[#2C221E] disabled:opacity-60"
            >
              <ShieldCheck className="h-4 w-4" />
              <span>{submitting ? 'Verifying...' : 'Unlock Dashboard'}</span>
            </button>
          </div>
          <div className="h-24 sm:h-8 shrink-0" aria-hidden="true" />
        </form>
      </div>
    </div>
  );
}
