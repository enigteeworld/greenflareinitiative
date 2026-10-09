'use client';

import {useEffect,useState} from 'react';
import Link from 'next/link';
import {ArrowRight,LockKeyhole} from 'lucide-react';
import {supabase} from '@/lib/supabaseClient';
import {BrandLogo} from '@/app/components/BrandAssets';

export default function ResetPasswordPage(){
 const [ready,setReady]=useState(false),[password,setPassword]=useState(''),[busy,setBusy]=useState(false),[message,setMessage]=useState(''),[done,setDone]=useState(false);
 useEffect(()=>{
   let active=true;
   const {data:{subscription}}=supabase.auth.onAuthStateChange((event)=>{if(event==='PASSWORD_RECOVERY'&&active)setReady(true)});
   void supabase.auth.getSession().then(({data})=>{if(active&&data.session?.user)setReady(true)});
   return()=>{active=false;subscription.unsubscribe()};
 },[]);
 async function submit(e:React.FormEvent<HTMLFormElement>){e.preventDefault();setBusy(true);setMessage('');const {error}=await supabase.auth.updateUser({password});if(error)setMessage(error.message);else{setDone(true);setMessage('Your password was updated. You can now open your dashboard.')}setBusy(false)}
 return <main className="gf-entry gf-auth-v2 gf-reset-page"><div className="gf-reset-card"><Link href="/" className="gf-auth-brand"><BrandLogo/></Link><h1>Reset your password</h1><p>Choose a new password to keep your GreenFlare account secure.</p>{ready&&!done?<form onSubmit={submit} className="gf-auth-fields"><label className="gf-auth-input-wrap"><span>New password</span><div><LockKeyhole size={18}/><input autoComplete="new-password" type="password" minLength={6} required value={password} onChange={e=>setPassword(e.target.value)} placeholder="At least 6 characters"/></div></label><button disabled={busy} className="gf-entry-primary gf-auth-submit" type="submit">{busy?'Updating…':'Update password'} <ArrowRight size={18}/></button></form>:!done?<p className="gf-auth-message">Open this page using the password-reset link emailed to you.</p>:null}{message&&<p role="status" className={'gf-auth-message '+(done?'is-success':'is-error')}>{message}</p>}<Link className="gf-auth-return" href={done?'/account':'/auth'}>{done?'Go to dashboard':'Back to sign in'}</Link></div></main>
}
