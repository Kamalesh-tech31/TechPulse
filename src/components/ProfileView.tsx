import React, { useState, useEffect } from 'react';
import { useApp } from '../AppContext';
import {
  User,
  Award,
  Wallet,
  Pencil,
  Save,
  X,
  CheckCircle2,
  AlertCircle,
  Trash2,
  ChevronDown,
  TrendingUp,
  Loader2,
} from 'lucide-react';
import { formatCurrency } from '../utils/formatCurrency';

// ─────────────────────────────────────────────────────────────
//  Constants
// ─────────────────────────────────────────────────────────────
const EXPERIENCE_OPTIONS = ['Beginner', 'Intermediate', 'Advanced'] as const;
const GOAL_OPTIONS = ['Learning', 'Stock Analysis', 'Virtual Trading', 'Portfolio Improvement'] as const;
const SECTOR_OPTIONS = [
  'Technology', 'Banking & Finance', 'Energy', 'FMCG', 'Healthcare',
  'Automobile', 'Infrastructure', 'Metals & Mining', 'Real Estate', 'Telecom',
];

const WEEKLY_CREDIT_LIMIT = 100000;

// ─────────────────────────────────────────────────────────────
//  Types
// ─────────────────────────────────────────────────────────────
interface ProfileData {
  fullName: string;
  phone: string;
  experienceLevel: string;
  investmentGoal: string;
  preferredSectors: string[];
}

// ─────────────────────────────────────────────────────────────
//  Sub-component: SelectField
// ─────────────────────────────────────────────────────────────
const SelectField: React.FC<{
  label: string;
  value: string;
  options: readonly string[];
  onChange: (v: string) => void;
  disabled?: boolean;
}> = ({ label, value, options, onChange, disabled }) => (
  <div className="space-y-1.5">
    <label className="block text-[10px] font-mono text-gray-500 uppercase tracking-wider">{label}</label>
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        disabled={disabled}
        className="w-full appearance-none bg-[#0d0d0d] border border-white/[0.07] focus:border-[rgba(79,107,255,0.5)] focus:outline-none rounded-xl py-2.5 pl-3.5 pr-8 text-sm text-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {options.map(opt => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
      <ChevronDown className="absolute right-2.5 top-3 h-4 w-4 text-gray-500 pointer-events-none" />
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────
//  Sub-component: TextField
// ─────────────────────────────────────────────────────────────
const TextField: React.FC<{
  label: string;
  value: string;
  onChange?: (v: string) => void;
  readOnly?: boolean;
  disabled?: boolean;
  placeholder?: string;
  type?: string;
}> = ({ label, value, onChange, readOnly, disabled, placeholder, type = 'text' }) => (
  <div className="space-y-1.5">
    <label className="block text-[10px] font-mono text-gray-500 uppercase tracking-wider">{label}</label>
    <input
      type={type}
      value={value}
      onChange={e => onChange?.(e.target.value)}
      readOnly={readOnly}
      disabled={disabled}
      placeholder={placeholder}
      className="w-full bg-[#0d0d0d] border border-white/[0.07] focus:border-[rgba(79,107,255,0.5)] focus:outline-none rounded-xl py-2.5 px-3.5 text-sm text-gray-200 transition read-only:opacity-50 read-only:cursor-not-allowed disabled:opacity-50 disabled:cursor-not-allowed placeholder-gray-600"
    />
  </div>
);

// ─────────────────────────────────────────────────────────────
//  Sub-component: SectorPills
// ─────────────────────────────────────────────────────────────
const SectorPills: React.FC<{
  selected: string[];
  onChange: (s: string[]) => void;
  disabled: boolean;
}> = ({ selected, onChange, disabled }) => {
  const toggle = (sector: string) => {
    if (disabled) return;
    onChange(
      selected.includes(sector)
        ? selected.filter(s => s !== sector)
        : [...selected, sector]
    );
  };
  return (
    <div className="space-y-1.5">
      <label className="block text-[10px] font-mono text-gray-500 uppercase tracking-wider">
        Preferred Sector(s)
      </label>
      <div className="flex flex-wrap gap-2">
        {SECTOR_OPTIONS.map(sector => {
          const active = selected.includes(sector);
          return (
            <button
              key={sector}
              type="button"
              onClick={() => toggle(sector)}
              disabled={disabled}
              className={`px-3 py-1 rounded-lg text-[11px] font-mono font-semibold transition border cursor-pointer disabled:cursor-not-allowed ${
                active
                  ? 'text-white border-[rgba(79,107,255,0.5)]'
                  : 'text-gray-500 bg-white/[0.02] border-white/[0.05] hover:border-white/[0.1] hover:text-gray-300'
              }`}
              style={active ? { background: 'rgba(79,107,255,0.12)' } : {}}
            >
              {sector}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
//  Sub-component: DeleteAccountModal
// ─────────────────────────────────────────────────────────────
const DeleteAccountModal: React.FC<{
  onCancel: () => void;
  onConfirm: () => Promise<void>;
  isDeleting: boolean;
}> = ({ onCancel, onConfirm, isDeleting }) => {
  const [confirmText, setConfirmText] = useState('');
  const canDelete = confirmText === 'DELETE';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(6px)' }}>
      <div
        className="w-full max-w-md rounded-2xl p-6 space-y-5 border border-rose-500/20 shadow-[0_0_40px_rgba(239,68,68,0.1)]"
        style={{ background: 'linear-gradient(135deg, #0f0a0a 0%, #110606 100%)', borderColor: 'rgba(239,68,68,0.15)' }}
      >
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)' }}>
            <Trash2 className="h-5 w-5 text-rose-400" />
          </div>
          <div>
            <h2 className="font-display font-bold text-white text-lg">Delete Account</h2>
            <p className="text-gray-400 text-xs mt-0.5 leading-relaxed">
              This action will permanently delete your account and all associated data.
            </p>
          </div>
        </div>

        {/* Warning */}
        <div className="p-3 rounded-xl border border-rose-500/10 bg-rose-950/10 flex items-start gap-2.5">
          <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
          <p className="text-xs text-rose-300/80 leading-relaxed">
            This will permanently erase your wallet, holdings, transactions, learning progress, and AI history. This cannot be undone.
          </p>
        </div>

        {/* Confirmation input */}
        <div className="space-y-1.5">
          <label className="block text-[10px] font-mono text-gray-500 uppercase tracking-wider">
            Type <span className="text-rose-400 font-bold">DELETE</span> to confirm
          </label>
          <input
            type="text"
            value={confirmText}
            onChange={e => setConfirmText(e.target.value)}
            placeholder="DELETE"
            className="w-full bg-black/60 border border-white/[0.07] focus:border-rose-500/40 focus:outline-none rounded-xl py-2.5 px-3.5 text-sm text-white font-mono tracking-widest placeholder-gray-700 transition"
            autoComplete="off"
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={isDeleting}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-gray-300 border border-white/[0.07] hover:bg-white/[0.04] transition cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={!canDelete || isDeleting}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            style={canDelete && !isDeleting ? { background: '#dc2626', boxShadow: '0 0 20px rgba(220,38,38,0.3)' } : { background: 'rgba(220,38,38,0.3)' }}
          >
            {isDeleting ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Deleting...</>
            ) : (
              <><Trash2 className="h-4 w-4" /> Delete Account</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────
//  Main Component
// ─────────────────────────────────────────────────────────────
export const ProfileView: React.FC = () => {
  const { user, holdings, transactions, claimWeeklyCredit, deleteAccount, logout, refreshPortfolio } = useApp();

  // ── Profile edit state ─────────────────────────────────────
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileData, setProfileData] = useState<ProfileData>({
    fullName: user?.name || '',
    phone: '',
    experienceLevel: 'Beginner',
    investmentGoal: 'Learning',
    preferredSectors: [],
  });
  const [editDraft, setEditDraft] = useState<ProfileData>(profileData);
  const [profileError, setProfileError] = useState<string | null>(null);

  // ── Wallet / credit state ──────────────────────────────────
  const [walletLoading, setWalletLoading] = useState(true);
  const [weeklyCreditLimit, setWeeklyCreditLimit] = useState(WEEKLY_CREDIT_LIMIT);
  const [weeklyCreditRemaining, setWeeklyCreditRemaining] = useState(WEEKLY_CREDIT_LIMIT);
  const [initialCapital, setInitialCapital] = useState(1000000);
  const [claimAmount, setClaimAmount] = useState('');
  const [claimLoading, setClaimLoading] = useState(false);

  // ── Notifications ──────────────────────────────────────────
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

  // ── Delete account modal ───────────────────────────────────
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // ── Helper ─────────────────────────────────────────────────
  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 4000);
  };

  const getToken = () => localStorage.getItem('trado_token');

  // ── Fetch profile from backend ─────────────────────────────
  useEffect(() => {
    const fetchProfile = async () => {
      const token = getToken();
      if (!token) { setProfileLoading(false); return; }
      try {
        const res = await fetch('/profile', { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) {
          const result = await res.json();
          if (result.success && result.data) {
            const d = result.data;
            const loaded: ProfileData = {
              fullName: d.fullName || user?.name || '',
              phone: d.phone || '',
              experienceLevel: d.experienceLevel || 'Beginner',
              investmentGoal: d.investmentGoal || 'Learning',
              preferredSectors: d.preferredSectors || d.preferredMarkets || [],
            };
            setProfileData(loaded);
            setEditDraft(loaded);
          }
        }
      } catch (err) {
        console.error('[ProfileView] Failed to fetch profile:', err);
      } finally {
        setProfileLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // ── Fetch wallet details from backend ─────────────────────
  useEffect(() => {
    const fetchWallet = async () => {
      const token = getToken();
      if (!token) { setWalletLoading(false); return; }
      try {
        const res = await fetch('/portfolio/wallet', { headers: { Authorization: `Bearer ${token}` } });
        if (res.ok) {
          const result = await res.json();
          if (result.success && result.data) {
            setInitialCapital(result.data.initialCapital ?? 1000000);
            setWeeklyCreditLimit(result.data.weeklyCreditLimit ?? WEEKLY_CREDIT_LIMIT);
            setWeeklyCreditRemaining(result.data.weeklyCreditRemaining ?? WEEKLY_CREDIT_LIMIT);
          }
        }
      } catch (err) {
        console.error('[ProfileView] Failed to fetch wallet:', err);
      } finally {
        setWalletLoading(false);
      }
    };
    fetchWallet();
  }, []);

  // Also sync from user context (refreshed after trades)
  useEffect(() => {
    if (user?.weeklyCreditRemaining !== undefined) setWeeklyCreditRemaining(user.weeklyCreditRemaining);
    if (user?.weeklyCreditLimit !== undefined) setWeeklyCreditLimit(user.weeklyCreditLimit);
  }, [user?.weeklyCreditRemaining, user?.weeklyCreditLimit]);

  // ── Save profile ───────────────────────────────────────────
  const handleSave = async () => {
    setProfileError(null);
    if (!editDraft.fullName.trim() || editDraft.fullName.trim().length < 2) {
      setProfileError('Full name must be at least 2 characters.');
      return;
    }
    setIsSaving(true);
    const token = getToken();
    try {
      const res = await fetch('/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          fullName: editDraft.fullName.trim(),
          phone: editDraft.phone.trim(),
          experienceLevel: editDraft.experienceLevel,
          investmentGoal: editDraft.investmentGoal,
          preferredSectors: editDraft.preferredSectors,
        }),
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        setProfileError(result.message || 'Failed to save profile.');
        return;
      }
      setProfileData(editDraft);
      setIsEditing(false);
      showToast('success', 'Profile updated successfully.');
    } catch (err) {
      setProfileError('Network error. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setEditDraft(profileData);
    setProfileError(null);
    setIsEditing(false);
  };

  // ── Claim weekly credit ────────────────────────────────────
  const walletBalance = user?.walletBalance ?? 0;
  const canClaim = walletBalance < 100000;

  const handleClaimCredit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseInt(claimAmount, 10);
    if (!amt || isNaN(amt) || amt <= 0) {
      showToast('error', 'Please enter a valid positive whole number.');
      return;
    }
    if (amt > weeklyCreditRemaining) {
      showToast('error', `Amount exceeds weekly credit remaining (${formatCurrency(weeklyCreditRemaining)}).`);
      return;
    }
    setClaimLoading(true);
    const result = await claimWeeklyCredit(amt);
    setClaimLoading(false);
    if (result.success) {
      // Wallet state updated via context; sync local state too
      setWeeklyCreditRemaining(prev => Math.max(0, prev - amt));
      setClaimAmount('');
      showToast('success', result.message);
    } else {
      showToast('error', result.message);
    }
  };

  // ── Delete account ─────────────────────────────────────────
  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    const result = await deleteAccount();
    setIsDeleting(false);
    if (!result.success) {
      setShowDeleteModal(false);
      showToast('error', result.message);
    }
    // On success, AppContext clears state and redirects to landing
  };

  // ── Achievements (local calculation) ──────────────────────
  const totalSimulatedWealth = (holdings.reduce((s, h) => s + h.currentValue, 0)) + walletBalance;
  const achievements = [
    { id: '1', title: 'Nifty Apprentice', desc: 'Registered a simulated wallet on Trado', unlocked: true },
    { id: '2', title: 'Equity Backer', desc: 'Acquired your first blue-chip share holding', unlocked: holdings.length > 0 },
    { id: '3', title: 'Indicator Specialist', desc: 'Completed at least 5 simulated trade transactions', unlocked: transactions.length >= 5 },
    { id: '4', title: 'Portfolio Commander', desc: 'Held a balanced portfolio exceeding ₹1,100,000', unlocked: totalSimulatedWealth > 1100000 },
    { id: '5', title: 'Academic Scholar', desc: 'Registered with an active educational profile', unlocked: true },
  ];
  const unlockedCount = achievements.filter(a => a.unlocked).length;

  const creditProgressPct = weeklyCreditLimit > 0 ? (weeklyCreditRemaining / weeklyCreditLimit) * 100 : 0;

  if (!user) return null;

  return (
    <div className="space-y-6 p-6 lg:p-8 max-w-7xl mx-auto text-gray-200">

      {/* ── Delete Account Modal ────────────────────────────── */}
      {showDeleteModal && (
        <DeleteAccountModal
          onCancel={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteAccount}
          isDeleting={isDeleting}
        />
      )}

      {/* ── Toast Notification ──────────────────────────────── */}
      {toast && (
        <div className={`p-4 rounded-xl border text-sm font-mono flex items-center gap-2.5 animate-fade-in shadow-lg transition ${
          toast.type === 'success'
            ? 'bg-emerald-950/40 border-emerald-500/20 text-emerald-300'
            : 'bg-rose-950/30 border-rose-500/20 text-rose-300'
        }`}>
          {toast.type === 'success'
            ? <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" />
            : <AlertCircle className="h-5 w-5 text-rose-400 shrink-0" />
          }
          <span>{toast.msg}</span>
        </div>
      )}

      {/* ── Page Header ─────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-white/[0.04] pb-5">
        <div>
          <h1 className="text-3xl font-display font-bold text-white tracking-tight">Profile</h1>
          <p className="text-gray-400 text-sm mt-1">Manage your account and virtual trading wallet.</p>
        </div>
        <button
          onClick={() => setShowDeleteModal(true)}
          className="px-4 py-2 rounded-xl text-xs font-semibold text-rose-400 border border-rose-500/20 hover:bg-rose-500/10 hover:border-rose-500/40 transition flex items-center gap-1.5 cursor-pointer"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Delete Account
        </button>
      </div>

      {/* ── Two-column layout ───────────────────────────────── */}
      <div className="grid lg:grid-cols-3 gap-6">

        {/* ══════════════════════════════════════════════════
            LEFT COLUMN (2/3)
        ══════════════════════════════════════════════════ */}
        <div className="lg:col-span-2 space-y-6">

          {/* ── Profile Information Card ────────────────────── */}
          <div className="glassmorphism rounded-2xl border-white/[0.04] overflow-hidden">
            {/* Card header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.04]">
              <h3 className="font-display font-bold text-white flex items-center gap-2">
                <User className="h-5 w-5" style={{ color: 'var(--color-trado-accent)' }} />
                Profile Information
              </h3>
              {!isEditing && !profileLoading && (
                <button
                  onClick={() => { setEditDraft(profileData); setProfileError(null); setIsEditing(true); }}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold border border-white/[0.07] hover:bg-white/[0.04] hover:border-white/[0.12] text-gray-300 transition cursor-pointer"
                >
                  <Pencil className="h-3.5 w-3.5" /> Edit Profile
                </button>
              )}
            </div>

            <div className="p-6 space-y-6">
              {profileLoading ? (
                <div className="flex items-center justify-center py-12 text-gray-500 gap-3">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span className="text-sm font-mono">Loading profile...</span>
                </div>
              ) : (
                <>
                  {/* Profile picture + name row */}
                  <div className="flex items-center gap-4">
                    {user.googlePicture ? (
                      <img
                        src={user.googlePicture}
                        alt={user.name}
                        referrerPolicy="no-referrer"
                        className="h-16 w-16 rounded-2xl object-cover shrink-0 ring-1 ring-white/10"
                      />
                    ) : (
                      <div
                        className="h-16 w-16 rounded-2xl flex items-center justify-center font-display font-bold text-2xl text-white uppercase shrink-0"
                        style={{ background: 'var(--color-trado-accent)', boxShadow: '0 0 20px rgba(79,107,255,0.25)' }}
                      >
                        {(editDraft.fullName || user.name).slice(0, 2)}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-white font-display font-bold text-xl truncate">{profileData.fullName || user.name}</p>
                      <p className="text-gray-500 text-sm font-mono truncate">{user.email}</p>
                    </div>
                  </div>

                  {/* Error banner */}
                  {profileError && (
                    <div className="p-3 rounded-xl border border-rose-500/20 bg-rose-950/20 flex items-center gap-2 text-xs text-rose-300 font-mono">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      {profileError}
                    </div>
                  )}

                  {/* Fields grid */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <TextField
                      label="Full Name"
                      value={isEditing ? editDraft.fullName : profileData.fullName}
                      onChange={v => setEditDraft(p => ({ ...p, fullName: v }))}
                      disabled={!isEditing}
                      placeholder="Enter your full name"
                    />
                    <TextField
                      label="Email Address"
                      value={user.email}
                      readOnly
                    />
                    <TextField
                      label="Phone Number"
                      value={isEditing ? editDraft.phone : profileData.phone}
                      onChange={v => setEditDraft(p => ({ ...p, phone: v }))}
                      disabled={!isEditing}
                      placeholder="+91 00000 00000"
                      type="tel"
                    />
                    <SelectField
                      label="Experience Level"
                      value={isEditing ? editDraft.experienceLevel : profileData.experienceLevel}
                      options={EXPERIENCE_OPTIONS}
                      onChange={v => setEditDraft(p => ({ ...p, experienceLevel: v }))}
                      disabled={!isEditing}
                    />
                    <div className="sm:col-span-2">
                      <SelectField
                        label="Investment Goal"
                        value={isEditing ? editDraft.investmentGoal : profileData.investmentGoal}
                        options={GOAL_OPTIONS}
                        onChange={v => setEditDraft(p => ({ ...p, investmentGoal: v }))}
                        disabled={!isEditing}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <SectorPills
                        selected={isEditing ? editDraft.preferredSectors : profileData.preferredSectors}
                        onChange={v => setEditDraft(p => ({ ...p, preferredSectors: v }))}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>

                  {/* Save / Cancel row */}
                  {isEditing && (
                    <div className="flex gap-3 pt-1">
                      <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-60"
                        style={{ background: 'var(--color-trado-accent)', boxShadow: '0 0 15px rgba(79,107,255,0.25)' }}
                      >
                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        {isSaving ? 'Saving…' : 'Save Changes'}
                      </button>
                      <button
                        onClick={handleCancel}
                        disabled={isSaving}
                        className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-sm font-semibold text-gray-300 border border-white/[0.07] hover:bg-white/[0.04] transition cursor-pointer disabled:opacity-60 flex items-center gap-2"
                      >
                        <X className="h-4 w-4" /> Cancel
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* ── Learning Achievements ───────────────────────── */}
          <div className="glassmorphism p-6 rounded-2xl border-white/[0.04]">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display font-bold text-lg text-white flex items-center gap-2">
                <Award className="h-5 w-5" style={{ color: 'var(--color-trado-accent)' }} />
                Learning Accomplishments
              </h3>
              <span className="text-xs font-mono text-gray-500">
                {unlockedCount} / {achievements.length} UNLOCKED
              </span>
            </div>
            <div className="space-y-3">
              {achievements.map(a => (
                <div
                  key={a.id}
                  className={`p-3.5 rounded-xl border flex items-center justify-between transition ${
                    a.unlocked ? 'bg-white/[0.01] border-white/[0.04]' : 'bg-[#030303]/40 border-white/[0.02] opacity-40'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0 border mt-0.5"
                      style={a.unlocked
                        ? { background: 'rgba(79,107,255,0.08)', borderColor: 'rgba(79,107,255,0.25)', color: 'var(--color-trado-accent)' }
                        : { background: 'rgba(255,255,255,0.01)', borderColor: 'rgba(255,255,255,0.05)', color: '#4B5563' }}
                    >
                      <Award className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-display font-semibold text-white text-sm leading-tight">{a.title}</h4>
                      <p className="text-gray-500 text-xs mt-0.5 leading-relaxed">{a.desc}</p>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase shrink-0 ml-3 ${
                      a.unlocked ? '' : 'text-gray-600'
                    }`}
                    style={a.unlocked ? { color: 'var(--color-trado-accent)', background: 'rgba(79,107,255,0.08)' } : {}}
                  >
                    {a.unlocked ? 'UNLOCKED' : 'LOCKED'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════
            RIGHT COLUMN (1/3)
        ══════════════════════════════════════════════════ */}
        <div className="space-y-5">

          {/* ── Virtual Trading Wallet Card ─────────────────── */}
          <div className="glassmorphism rounded-2xl border-white/[0.04] overflow-hidden">
            <div className="px-5 py-4 border-b border-white/[0.04]">
              <h3 className="font-display font-bold text-white flex items-center gap-2">
                <Wallet className="h-5 w-5" style={{ color: 'var(--color-trado-accent)' }} />
                Virtual Trading Wallet
              </h3>
            </div>

            {walletLoading ? (
              <div className="flex items-center justify-center py-10 gap-3 text-gray-500">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-xs font-mono">Loading wallet...</span>
              </div>
            ) : (
              <div className="p-5 space-y-4">
                {/* Initial Capital */}
                <div className="flex justify-between items-center py-2.5 border-b border-white/[0.03]">
                  <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">Initial Capital</span>
                  <span className="text-sm font-mono font-semibold text-gray-300">{formatCurrency(initialCapital)}</span>
                </div>

                {/* Current Wallet Balance */}
                <div className="flex justify-between items-center py-2.5 border-b border-white/[0.03]">
                  <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">Current Balance</span>
                  <span className="text-base font-mono font-bold text-emerald-400">{formatCurrency(walletBalance)}</span>
                </div>

                {/* Weekly Credit Remaining */}
                <div className="space-y-2.5 pt-1">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">Weekly Credit Remaining</span>
                    <span className="text-xs font-mono font-semibold text-gray-300">
                      {formatCurrency(weeklyCreditRemaining)} / {formatCurrency(weeklyCreditLimit)}
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div className="h-1.5 w-full rounded-full bg-white/[0.05] overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${creditProgressPct}%`,
                        background: creditProgressPct > 50
                          ? 'linear-gradient(90deg, #4F6BFF, #6B82FF)'
                          : creditProgressPct > 20
                          ? 'linear-gradient(90deg, #f59e0b, #fbbf24)'
                          : 'linear-gradient(90deg, #ef4444, #f87171)',
                      }}
                    />
                  </div>
                  <p className="text-[10px] font-mono text-gray-600 text-right">
                    {creditProgressPct.toFixed(0)}% remaining
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* ── Claim Weekly Credit Card ─────────────────────── */}
          <div className="glassmorphism rounded-2xl border-white/[0.04] overflow-hidden">
            <div className="px-5 py-4 border-b border-white/[0.04]">
              <h3 className="font-display font-bold text-white flex items-center gap-2">
                <TrendingUp className="h-5 w-5" style={{ color: 'var(--color-trado-accent)' }} />
                Claim Weekly Credit
              </h3>
            </div>

            <div className="p-5 space-y-4">
              {/* Status indicator */}
              {canClaim ? (
                <div className="p-3 rounded-xl border border-emerald-500/15 bg-emerald-950/15 flex items-center gap-2 text-xs text-emerald-400 font-mono">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  Wallet eligible — balance below ₹1,00,000
                </div>
              ) : (
                <div className="p-3 rounded-xl border border-amber-500/15 bg-amber-950/10 flex items-start gap-2 text-xs text-amber-400/80 font-mono leading-relaxed">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  Claiming is disabled while wallet balance is ₹1,00,000 or above.
                </div>
              )}

              {/* Claim form */}
              <form onSubmit={handleClaimCredit} className="space-y-3">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono text-gray-500 uppercase tracking-wider">Amount (₹)</label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    placeholder={`Max ${formatCurrency(weeklyCreditRemaining)}`}
                    value={claimAmount}
                    onChange={e => setClaimAmount(e.target.value)}
                    disabled={!canClaim || claimLoading}
                    className="w-full bg-[#0d0d0d] border border-white/[0.07] focus:border-[rgba(79,107,255,0.5)] focus:outline-none rounded-xl py-2.5 px-3.5 text-sm text-gray-200 font-mono transition disabled:opacity-40 disabled:cursor-not-allowed placeholder-gray-700"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!canClaim || claimLoading || weeklyCreditRemaining <= 0}
                  className="w-full py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  style={canClaim && !claimLoading && weeklyCreditRemaining > 0
                    ? { background: 'var(--color-trado-accent)', boxShadow: '0 0 15px rgba(79,107,255,0.2)' }
                    : { background: 'rgba(79,107,255,0.2)' }}
                >
                  {claimLoading
                    ? <><Loader2 className="h-4 w-4 animate-spin" /> Claiming...</>
                    : 'Claim Credit'
                  }
                </button>
              </form>

              {/* Helper text */}
              <p className="text-[10px] text-gray-600 font-mono leading-relaxed">
                You can claim weekly simulator credit only when your wallet balance is below ₹1,00,000.
              </p>

              {/* Remaining quota display */}
              <div className="pt-1 border-t border-white/[0.03] flex justify-between">
                <span className="text-[10px] font-mono text-gray-600 uppercase">Credit Quota Left</span>
                <span className="text-xs font-mono font-semibold text-gray-400">
                  {formatCurrency(weeklyCreditRemaining)}
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
