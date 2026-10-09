'use client';
import {useEffect,useState} from 'react';
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {House,Trophy,Gamepad2,UserRound,ScanLine,Bell} from 'lucide-react';
import {BrandLogo} from './BrandAssets';
import {useStudent} from '@/app/lib/useStudent';
import {supabase} from '@/lib/supabaseClient';

const links=[{href:'/account',label:'Home',Icon:House},{href:'/leaderboard',label:'Rankings',Icon:Trophy},{href:'/garden',label:'My World',Icon:Gamepad2},{href:'/profile',label:'Profile',Icon:UserRound}];

export default function GreenShell({children}:{children:React.ReactNode}){
 const path=usePathname();
 const {userId,profile,refresh}=useStudent(false);
 const [unread,setUnread]=useState(0);
 const [hasScrolled,setHasScrolled]=useState(false);
 useEffect(()=>{const listener=()=>void refresh();window.addEventListener('gf:avatar-updated',listener);return()=>window.removeEventListener('gf:avatar-updated',listener)},[refresh]);
 useEffect(()=>{
  const onScroll=()=>setHasScrolled(window.scrollY>100);
  onScroll();window.addEventListener('scroll',onScroll,{passive:true});
  return()=>window.removeEventListener('scroll',onScroll);
 },[path]);
 useEffect(()=>{
  if(!userId)return;
  let live=true;
  const update=async()=>{const {count,error}=await supabase.from('gf_notifications').select('id',{count:'exact',head:true}).eq('user_id',userId).is('read_at',null);if(live&&!error)setUnread(count||0)};
  void update();const onFocus=()=>void update();const interval=setInterval(onFocus,60000);
  window.addEventListener('focus',onFocus);window.addEventListener('gf:notifications-updated',onFocus);
  return()=>{live=false;clearInterval(interval);window.removeEventListener('focus',onFocus);window.removeEventListener('gf:notifications-updated',onFocus)};
 },[userId,path]);
 const actions=<div className="gf-header-actions">
  <Link className={'gf-alert-btn '+(path==='/notifications'?'is-selected':'')} href="/notifications" aria-label={unread?`${unread} unread notifications`:'Notifications'}><Bell size={20} strokeWidth={1.9}/>{unread>0&&<span className="gf-notification-dot" aria-hidden="true"/>}</Link>
  <Link href="/profile" className="gf-account-link" aria-label="View your profile"><span className="gf-avatar">{profile?.avatar_url?<img src={profile.avatar_url} alt="" className="gf-user-avatar-image"/>:<UserRound size={23} strokeWidth={1.75}/>}</span></Link>
 </div>;
 return <div className="gf-app-frame gf-reference-frame"><div className="gf-shell">
  <header className="gf-top gf-app-header gf-ref-header" aria-label="GreenFlare header">
   <Link className="gf-brand" href="/account" aria-label="GreenFlare home"><BrandLogo/><span className="gf-brand-tagline">SMALL CHOICES. BRIGHTER TOMORROWS.</span></Link>
   <nav aria-label="Desktop navigation" className="gf-desktop-nav">{links.map(l=><Link href={l.href} key={l.href} className={path===l.href?'active':''}>{l.label}</Link>)}<Link className="gf-desktop-scan" href="/scan"><ScanLine size={17}/> Scan</Link></nav>
   {actions}
  </header>
  {/* Hidden at page top. A compact, frosted header appears after the user scrolls past the normal header. */}
  <div className={'gf-scroll-header '+(hasScrolled?'is-visible':'')} aria-hidden={!hasScrolled} inert={!hasScrolled}>
    <div className="gf-scroll-header-inner"><Link href="/account" className="gf-scroll-brand" aria-label="GreenFlare home"><BrandLogo/></Link>{actions}</div>
  </div>
  <main className="gf-app-main">{children}</main>
  <nav className="gf-bottom gf-floating-nav gf-ref-bottom gf-five-nav" aria-label="Mobile navigation">
   {links.slice(0,2).map(({href,label,Icon})=><Link href={href} key={href} className={path===href?'active':''} aria-current={path===href?'page':undefined}><Icon size={23} strokeWidth={path===href?2.5:1.8}/><span>{label}</span></Link>)}
   <Link href="/scan" className={'gf-center-scan '+(path==='/scan'?'active':'')} aria-label="Open QR scanner" aria-current={path==='/scan'?'page':undefined}><span className="gf-center-scan-circle"><ScanLine size={26} strokeWidth={2.3}/></span><span className="gf-center-scan-caption">Scan</span></Link>
   {links.slice(2).map(({href,label,Icon})=><Link href={href} key={href} className={path===href?'active':''} aria-current={path===href?'page':undefined}><Icon size={23} strokeWidth={path===href?2.5:1.8}/><span>{label}</span></Link>)}
  </nav>
  <footer className="gf-footer">GreenFlare · Small choices. Brighter tomorrows.</footer>
 </div></div>;
}
