'use client';
import {useEffect,useRef,useState} from 'react';
import {useRouter} from 'next/navigation';
import Link from 'next/link';
import {Award,Bell,BookOpen,Camera,ChevronRight,Clock3,Coins,Gamepad2,History,LogOut,ShieldCheck,Trophy,UserRound} from 'lucide-react';
import GreenShell from '@/app/components/GreenShell';
import {useStudent} from '@/app/lib/useStudent';
import {supabase} from '@/lib/supabaseClient';
import BrandMark from '@/app/components/BrandMark';

export default function Profile(){
 const {userId,profile,loading,refresh}=useStudent();const router=useRouter();
 const input=useRef<HTMLInputElement>(null);
 const [wallet,setWallet]=useState({lifetime_points:0,credits:0}),[dates,setDates]=useState<string[]>([]),[count,setCount]=useState(0),[error,setError]=useState(''),[message,setMessage]=useState(''),[uploading,setUploading]=useState(false);
 useEffect(()=>{if(!userId)return;let live=true;void(async()=>{
   const [w,a]=await Promise.all([supabase.from('gf_wallets').select('lifetime_points,credits').eq('user_id',userId).maybeSingle(),supabase.from('gf_actions').select('created_at',{count:'exact'}).eq('user_id',userId).order('created_at',{ascending:false}).limit(700)]);
   if(!live)return;if(w.data)setWallet({lifetime_points:Number(w.data.lifetime_points)||0,credits:Number(w.data.credits)||0});
   setCount(a.count||0);setDates((a.data||[]).map(x=>x.created_at));if(w.error||a.error)setError('Some account statistics could not be loaded.');
 })();return()=>{live=false}},[userId]);
 async function uploadAvatar(file?:File){
   if(!file||!userId||!profile||uploading)return;
   setError('');setMessage('');const types:Record<string,string>={'image/png':'png','image/jpeg':'jpg','image/webp':'webp'};
   if(!types[file.type]){setError('Use a PNG, JPG or WebP picture.');return}
   if(file.size>2*1024*1024){setError('Profile photos must be smaller than 2 MB.');return}
   setUploading(true);const path=`${userId}/avatar-${Date.now()}.${types[file.type]}`;
   const {error:storageError}=await supabase.storage.from('gf_avatars').upload(path,file,{cacheControl:'3600',upsert:false,contentType:file.type});
   if(storageError){setError('Could not upload the photo. Check the included avatar storage migration.');setUploading(false);return}
   const {data}=supabase.storage.from('gf_avatars').getPublicUrl(path);
   const {error:updateError}=await supabase.from('profiles').update({avatar_url:data.publicUrl}).eq('id',profile.id);
   if(updateError){setError('Photo uploaded but the profile could not be updated. Check profile permissions.');setUploading(false);return}
   setMessage('Profile photo updated.');await refresh();window.dispatchEvent(new Event('gf:avatar-updated'));setUploading(false);
 }
 const dayFormat=(dt:Date)=>new Intl.DateTimeFormat('en-CA',{timeZone:'Africa/Lagos',year:'numeric',month:'2-digit',day:'2-digit'}).format(dt);
 const active=new Set(dates.map(d=>dayFormat(new Date(d))));let streak=0;const day=new Date();if(!active.has(dayFormat(day)))day.setDate(day.getDate()-1);
 for(let i=0;i<365;i++){if(!active.has(dayFormat(day)))break;streak++;day.setDate(day.getDate()-1)}
 const level=wallet.lifetime_points<100?'Beginner':wallet.lifetime_points<500?'Explorer':wallet.lifetime_points<1000?'Changer':'Champion';
 const next=wallet.lifetime_points<100?100:wallet.lifetime_points<500?500:wallet.lifetime_points<1000?1000:Math.ceil((wallet.lifetime_points+1)/500)*500;
 const progress=Math.min(100,Math.round(wallet.lifetime_points/next*100));
 const entries=[{href:'/achievements',Icon:Award,label:'Achievements',desc:'See your earned milestones'},{href:'/garden',Icon:Gamepad2,label:'My Green World',desc:'Make something with your credits'},{href:'/activity',Icon:History,label:'Recycling history',desc:'Review your recorded actions'},{href:'/learn',Icon:BookOpen,label:'Learn',desc:'Guides for everyday impact'},{href:'/notifications',Icon:Bell,label:'Notifications',desc:'Updates from GreenFlare'}];
 return <GreenShell><div className="gf-screen gf-v3-page gf-v3-profile">
  <header className="gf-v3-profile-hero"><div className="gf-v3-profile-orbit" aria-hidden="true"><i/><i/><i/></div><div className="gf-v3-profile-picture"><span>{profile?.avatar_url?<img src={profile.avatar_url} alt="Your profile"/>:<UserRound size={50}/>}</span><button onClick={()=>input.current?.click()} type="button" disabled={uploading} aria-label="Upload profile photo"><Camera size={17}/></button><input ref={input} hidden type="file" accept="image/png,image/jpeg,image/webp" onChange={e=>void uploadAvatar(e.target.files?.[0])}/></div><h1>{profile?.username||profile?.full_name||'Your profile'}</h1><p><ShieldCheck size={15}/> GreenFlare member · {level}</p><div className="gf-v3-level"><span><BrandMark/> Level progress</span><span>{wallet.lifetime_points.toLocaleString()} / {next.toLocaleString()} pts</span></div><div className="gf-v3-level-track"><i style={{width:`${progress}%`}}/></div></header>
  {error&&<p className="gf-error" role="alert">{error}</p>}{message&&<p className="gf-success" role="status">{message}</p>}
  <div className="gf-v3-profile-numbers"><div><strong>{loading?'—':wallet.lifetime_points.toLocaleString()}</strong><small>Green Score</small></div><div><strong>{loading?'—':count.toLocaleString()}</strong><small>Items logged</small></div><div><strong>{loading?'—':streak}</strong><small>Day streak</small></div></div>
  <div className="gf-v3-profile-credit"><Coins size={19}/><span><strong>{wallet.credits.toLocaleString()} Green Credits</strong><small>Available to spend in My World</small></span><Link href="/garden" aria-label="Open My World"><ChevronRight size={19}/></Link></div>
  <div className="gf-v3-profile-menu">{entries.map(({href,Icon,label,desc})=><Link key={href} href={href} className="gf-v3-menu-item"><span className="gf-v3-menu-icon"><Icon size={20}/></span><span><strong>{label}</strong><small>{desc}</small></span><ChevronRight size={19}/></Link>)}</div>
  <button type="button" className="gf-v3-signout" onClick={async()=>{await supabase.auth.signOut();router.replace('/auth')}}><LogOut size={18}/> Sign out</button>
  <p className="gf-v3-profile-note"><Clock3 size={14}/> The streak counts consecutive days with recorded eligible actions. Your lifetime Green Score is never reduced by spending credits.</p>
 </div></GreenShell>;
}
