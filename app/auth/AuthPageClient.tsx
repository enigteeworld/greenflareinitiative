'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, ArrowRight, Eye, EyeOff, LockKeyhole, Mail, UserRound } from 'lucide-react';
import { BrandLogo } from '@/app/components/BrandAssets';
import { supabase } from '@/lib/supabaseClient';

function GoogleSymbol() {
  return <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M21.35 12.25c0-.7-.06-1.2-.2-1.72H12v3.63h5.3a4.5 4.5 0 0 1-1.97 2.96v2.46h3.18c1.86-1.72 2.84-4.25 2.84-7.33Z"/><path fill="#34A853" d="M12 21.75c2.67 0 4.92-.88 6.51-2.4l-3.18-2.46c-.88.59-2.01.94-3.33.94-2.56 0-4.74-1.72-5.52-4.04H3.2v2.54A9.75 9.75 0 0 0 12 21.75Z"/><path fill="#FBBC05" d="M6.48 13.8a5.8 5.8 0 0 1 0-3.6V7.66H3.2a9.73 9.73 0 0 0 0 8.67l3.28-2.53Z"/><path fill="#EA4335" d="M12 6.17c1.46 0 2.77.5 3.8 1.49l2.84-2.84A9.45 9.45 0 0 0 12 2.25 9.75 9.75 0 0 0 3.2 7.66l3.28 2.54C7.26 7.9 9.44 6.17 12 6.17Z"/></svg>;
}
function AppleSymbol() {
  return <svg width="23" height="23" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="M16.37 12.87c.02 2.05 1.79 2.73 1.81 2.74-.02.05-.28.95-.93 1.88-.55.79-1.12 1.58-2.01 1.6-.88.02-1.16-.52-2.17-.52-1.01 0-1.32.5-2.15.54-.87.03-1.53-.87-2.08-1.66-1.13-1.63-1.99-4.6-.83-6.61a3.23 3.23 0 0 1 2.7-1.65c.84-.02 1.64.57 2.16.57.53 0 1.51-.7 2.55-.6.43.02 1.64.17 2.42 1.31-.06.04-1.45.84-1.47 2.4Zm-1.63-4.8a3.11 3.11 0 0 0 .73-2.4 3.15 3.15 0 0 0-2.07 1.14 3 3 0 0 0-.75 2.33c.8.06 1.61-.41 2.09-1.07Z" transform="translate(0,-1)"/></svg>;
}


// Brand icons are SVGs because lucide-react does not ship all social-media logos.
function InstagramSymbol() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="gf-instagram-gradient" x1="0" y1="24" x2="24" y2="0" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FEDA75" />
          <stop offset="0.35" stopColor="#FA7E1E" />
          <stop offset="0.65" stopColor="#D62976" />
          <stop offset="1" stopColor="#4F5BD5" />
        </linearGradient>
      </defs>
      <rect x="2.8" y="2.8" width="18.4" height="18.4" rx="5.2" stroke="url(#gf-instagram-gradient)" strokeWidth="2.4" />
      <circle cx="12" cy="12" r="4.2" stroke="url(#gf-instagram-gradient)" strokeWidth="2.4" />
      <circle cx="17.6" cy="6.5" r="1.3" fill="#D62976" />
    </svg>
  );
}
function FacebookSymbol() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#1877F2" d="M12 2a10 10 0 0 0-1.56 19.88V14.9H7.9V12h2.54V9.79c0-2.51 1.5-3.9 3.8-3.9 1.1 0 2.25.2 2.25.2v2.47h-1.27c-1.25 0-1.64.78-1.64 1.58V12h2.78l-.45 2.9h-2.33v6.98A10 10 0 0 0 12 2Z" />
      <path fill="#FFF" d="M15.91 14.9l.45-2.9h-2.78v-1.86c0-.8.39-1.58 1.64-1.58h1.27V6.09s-1.15-.2-2.25-.2c-2.3 0-3.8 1.39-3.8 3.9V12H7.9v2.9h2.54v6.98c.51.08 1.03.12 1.56.12s1.05-.04 1.58-.12V14.9h2.33Z" />
    </svg>
  );
}

export default function AuthPageClient() {
  const router = useRouter();
  const params = useSearchParams();
  const signup = params.get('mode') === 'signup';
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [resetBusy, setResetBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => { setMessage(''); setSuccess(false); }, [signup]);
  useEffect(() => {
    let alive = true;
    void supabase.auth.getUser().then(({ data }) => {
      if (alive && data.user) router.replace('/account');
    });
    return () => { alive = false; };
  }, [router]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true); setMessage(''); setSuccess(false);
    try {
      if (signup) {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { data: { full_name: fullName.trim() } },
        });
        if (error) throw error;
        if (data.session) router.replace('/onboarding');
        else {
          setSuccess(true);
          setMessage('Account created. Check your email for a verification link, then sign in.');
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) throw error;
        const next = params.get('next');
        router.replace(next?.startsWith('/') && !next.startsWith('//') ? next : '/account');
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Something went wrong. Please try again.');
    } finally { setBusy(false); }
  }

  async function forgotPassword() {
    setMessage(''); setSuccess(false);
    if (!email.trim()) { setMessage('Enter your email address above before requesting a reset.'); return; }
    setResetBusy(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setSuccess(true);
      setMessage('If that email address is registered, a password-reset link is on its way.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not request a password reset.');
    } finally { setResetBusy(false); }
  }

  function socialComingSoon(provider: string) {
    setSuccess(false);
    setMessage(`${provider} sign-in is coming soon. Please use your email and password for now.`);
  }

  return (
    <main className="gf-entry gf-signin">
      <div className="gf-signin-shell">
        <aside className="gf-signin-art" aria-hidden="true">
          <Image src="/images/recycling-thumb.jpg" alt="" fill priority sizes="(min-width: 850px) 45vw, 100vw" />
          <div className="gf-signin-art-overlay" />
          <div className="gf-signin-art-copy"><span>MAKE EVERY ACTION COUNT</span><h2>Small choices.<br/>Brighter tomorrows.</h2><p>Recycling progress you can see, one action at a time.</p></div>
        </aside>
        <section className="gf-signin-panel">
          <div className="gf-signin-navigation">
            <Link href="/" className="gf-signin-back" aria-label="Back to welcome"><ArrowLeft size={18}/></Link>
            <Link href="/" className="gf-signin-brand" aria-label="GreenFlare home"><BrandLogo/></Link>
            <span aria-hidden="true" className="gf-signin-nav-spacer"/>
          </div>

          <div className="gf-signin-form-area">
            <div className="gf-signin-intro">
              <div className="gf-signin-eyebrow">{signup ? 'YOUR JOURNEY STARTS HERE' : 'GOOD TO HAVE YOU BACK'}</div>
              <h1>{signup ? 'Create an account' : 'Welcome back'}</h1>
              <p>{signup ? 'Join GreenFlare and start making your everyday actions count.' : 'Sign in to continue tracking your Green Score and recycling progress.'}</p>
            </div>

            <form onSubmit={submit} className="gf-signin-form">
              {signup && <label className="gf-signin-field"><span>Full name</span><div className="gf-signin-field-inner"><UserRound size={18}/><input required minLength={2} autoComplete="name" value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Enter your full name"/></div></label>}
              <label className="gf-signin-field"><span>Email address</span><div className="gf-signin-field-inner"><Mail size={18}/><input type="email" required autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Enter your email address"/></div></label>
              <label className="gf-signin-field"><span>Password</span><div className="gf-signin-field-inner"><LockKeyhole size={18}/><input type={showPassword ? 'text' : 'password'} required minLength={6} autoComplete={signup ? 'new-password' : 'current-password'} value={password} onChange={(event) => setPassword(event.target.value)} placeholder={signup ? 'Create a password' : 'Enter your password'}/><button type="button" className="gf-signin-eye" onClick={() => setShowPassword(!showPassword)} aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword}>{showPassword ? <EyeOff size={19}/> : <Eye size={19}/>}</button></div></label>

              {!signup && <div className="gf-signin-forgot"><button type="button" onClick={forgotPassword} disabled={busy || resetBusy}>{resetBusy ? 'Sending…' : 'Forgot password?'}</button></div>}

              {message && <p className={`gf-signin-feedback ${success ? 'is-success' : 'is-error'}`} role="status">{message}</p>}

              <button type="submit" className="gf-signin-submit" disabled={busy || resetBusy}>{busy ? 'Please wait…' : signup ? 'Create account' : 'Login'}<ArrowRight size={18}/></button>
            </form>

            <div className="gf-signin-divider"><span/> <span>or continue with</span> <span/></div>
            <div className="gf-signin-socials" role="group" aria-label="Social sign in options — coming soon">
              <button type="button" onClick={() => socialComingSoon('Google')} aria-label="Google sign-in (coming soon)" title="Google sign-in coming soon"><GoogleSymbol/></button>
              <button type="button" onClick={() => socialComingSoon('Apple')} aria-label="Apple sign-in (coming soon)" title="Apple sign-in coming soon"><AppleSymbol/></button>
              <button type="button" onClick={() => socialComingSoon('Instagram')} aria-label="Instagram sign-in (coming soon)" title="Instagram sign-in coming soon"><InstagramSymbol/></button>
              <button type="button" onClick={() => socialComingSoon('Facebook')} aria-label="Facebook sign-in (coming soon)" title="Facebook sign-in coming soon"><FacebookSymbol/></button>
            </div>
            <p className="gf-signin-social-note">Social sign-in coming soon</p>
            <p className="gf-signin-switch">{signup ? 'Already have an account?' : 'Don’t have an account?'} <Link href={signup ? '/auth' : '/auth?mode=signup'}>{signup ? 'Login' : 'Sign up'}</Link></p>
          </div>
          <p className="gf-signin-bottom">SMALL CHOICES. BRIGHTER TOMORROWS.</p>
        </section>
      </div>
    </main>
  );
}
