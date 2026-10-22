import React, { useState } from 'react';
import {
  X,
  Mail,
  Lock,
  User,
  LogIn,
  UserPlus,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Eye,
  EyeOff,
  Cloud,
  Check
} from 'lucide-react';
import type { Language } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { playClickSound, playTaskCompletionSound } from '../utils/audio';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onAuthSuccess: (user: { id: string; email: string; displayName?: string }) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  language,
  onAuthSuccess
}) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [stayLoggedIn, setStayLoggedIn] = useState(true);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email.trim() || !password.trim()) {
      setErrorMsg(language === 'ar' ? 'يرجى كتابة البريد وكلمة المرور' : 'Email and password are required');
      return;
    }

    if (mode === 'register' && password.length < 6) {
      setErrorMsg(language === 'ar' ? 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' : 'Password must be at least 6 characters');
      return;
    }

    if (mode === 'register' && password !== confirmPassword) {
      setErrorMsg(language === 'ar' ? 'كلمتا المرور غير متطابقتين' : 'Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      if (isSupabaseConfigured() && supabase) {
        if (mode === 'register') {
          const { data, error } = await supabase.auth.signUp({
            email: email.trim(),
            password: password.trim(),
            options: {
              data: {
                display_name: displayName.trim() || email.split('@')[0]
              }
            }
          });

          if (error) throw error;

          if (data.user) {
            playTaskCompletionSound(0.5);
            setSuccessMsg(
              language === 'ar'
                ? 'تم إنشاء الحساب بنجاح! تم تسجيل دخولك وحفظ الجلسة.'
                : 'Account created successfully! Session saved.'
            );
            setTimeout(() => {
              onAuthSuccess({
                id: data.user!.id,
                email: data.user!.email || email,
                displayName: displayName.trim() || email.split('@')[0]
              });
              onClose();
            }, 800);
          }
        } else {
          // Login
          const { data, error } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password: password.trim()
          });

          if (error) throw error;

          if (data.user) {
            playTaskCompletionSound(0.5);
            setSuccessMsg(language === 'ar' ? 'مرحبًا بك مجددًا! جاري المزامنة...' : 'Welcome back! Syncing...');
            setTimeout(() => {
              onAuthSuccess({
                id: data.user.id,
                email: data.user.email || email,
                displayName: data.user.user_metadata?.display_name || email.split('@')[0]
              });
              onClose();
            }, 800);
          }
        }
      } else {
        // Local Account / Demo Auth Fallback if Supabase credentials are not in .env yet
        // Still provides genuine session persistence and user experience
        await new Promise(r => setTimeout(r, 600));

        const mockId = `user_${btoa(email.toLowerCase()).replace(/[^a-zA-Z0-9]/g, '').slice(0, 16)}`;
        const userObj = {
          id: mockId,
          email: email.trim(),
          displayName: displayName.trim() || email.split('@')[0]
        };

        if (stayLoggedIn) {
          localStorage.setItem('mymind_auth_session', JSON.stringify(userObj));
        }

        playTaskCompletionSound(0.5);
        setSuccessMsg(
          language === 'ar'
            ? 'تم تسجيل الدخول بنجاح! تم حفظ جلستك في هذا الجهاز.'
            : 'Logged in successfully! Session preserved.'
        );

        setTimeout(() => {
          onAuthSuccess(userObj);
          onClose();
        }, 800);
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setErrorMsg(err.message || (language === 'ar' ? 'حدث خطأ أثناء المصادقة' : 'Authentication failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-white/10 max-w-md w-full shadow-2xl relative overflow-hidden space-y-6">
        
        {/* Decorative Top Glow */}
        <div className="absolute top-0 right-1/4 w-60 h-60 bg-gradient-to-br from-cyan-500/20 to-purple-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100">
                {mode === 'login'
                  ? language === 'ar'
                    ? 'تسجيل الدخول إلى حسابك'
                    : 'Sign in to My Mind'
                  : language === 'ar'
                  ? 'إنشاء حساب جديد'
                  : 'Create New Account'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {language === 'ar'
                  ? 'مزامنة مهامك وإحصائياتك عبر السحابة'
                  : 'Sync your tasks and statistics across devices'}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              playClickSound();
              onClose();
            }}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-white/5 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex p-1 rounded-2xl bg-slate-900/80 border border-white/5 relative z-10">
          <button
            type="button"
            onClick={() => {
              playClickSound();
              setMode('login');
              setErrorMsg(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
              mode === 'login'
                ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/30 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'تسجيل الدخول' : 'Sign In'}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              playClickSound();
              setMode('register');
              setErrorMsg(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
              mode === 'register'
                ? 'bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 border border-purple-500/30 shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>{language === 'ar' ? 'حساب جديد' : 'Register'}</span>
          </button>
        </div>

        {/* Alerts */}
        {errorMsg && (
          <div className="p-3 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {language === 'ar' ? 'اسم المستخدم (اختياري)' : 'Display Name (Optional)'}
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute top-3 ltr:left-3 rtl:right-3 text-slate-400" />
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder={language === 'ar' ? 'مثال: عمر محمد' : 'e.g. Omar'}
                  className="w-full glass-input text-xs font-medium text-slate-100 placeholder-slate-500 ltr:pl-9 rtl:pr-9 py-2.5 rounded-xl"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {language === 'ar' ? 'البريد الإلكتروني' : 'Email Address'} *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute top-3 ltr:left-3 rtl:right-3 text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="developer@example.com"
                className="w-full glass-input text-xs font-medium text-slate-100 placeholder-slate-500 ltr:pl-9 rtl:pr-9 py-2.5 rounded-xl"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              {language === 'ar' ? 'كلمة المرور' : 'Password'} *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute top-3 ltr:left-3 rtl:right-3 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full glass-input text-xs font-medium text-slate-100 placeholder-slate-500 ltr:pl-9 rtl:pr-9 ltr:pr-9 rtl:pl-9 py-2.5 rounded-xl"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute top-2.5 ltr:right-3 rtl:left-3 text-slate-400 hover:text-slate-200 transition cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                {language === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm Password'} *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute top-3 ltr:left-3 rtl:right-3 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full glass-input text-xs font-medium text-slate-100 placeholder-slate-500 ltr:pl-9 rtl:pr-9 py-2.5 rounded-xl"
                />
              </div>
            </div>
          )}

          {/* Stay Logged In Toggle */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-300">
              <input
                type="checkbox"
                checked={stayLoggedIn}
                onChange={(e) => setStayLoggedIn(e.target.checked)}
                className="w-4 h-4 rounded bg-slate-900 border-white/10 text-cyan-500 focus:ring-0 cursor-pointer"
              />
              <span>{language === 'ar' ? 'البقاء قيد تسجيل الدخول دائمًا' : 'Stay Logged In'}</span>
            </label>

            {isSupabaseConfigured() ? (
              <span className="flex items-center gap-1 text-[10px] text-cyan-400 font-medium">
                <Cloud className="w-3 h-3" />
                <span>Supabase Live</span>
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[10px] text-amber-400/80 font-medium" title="Configure VITE_SUPABASE_URL in .env to link database">
                <Cloud className="w-3 h-3" />
                <span>Local Session</span>
              </span>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 hover:from-cyan-300 hover:to-blue-400 text-slate-950 font-bold text-xs shadow-lg shadow-cyan-500/25 transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span>
                  {mode === 'login'
                    ? language === 'ar'
                      ? 'تسجيل الدخول'
                      : 'Sign In'
                    : language === 'ar'
                    ? 'إنشاء الحساب والبدء'
                    : 'Create Account & Begin'}
                </span>
              </>
            )}
          </button>
        </form>

      </div>
    </div>
  );
};
