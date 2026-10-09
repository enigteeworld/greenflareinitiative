'use client';
import {useEffect,useMemo,useState} from 'react';
import Link from 'next/link';
import {ArrowRight,Crown,Earth,Info,Medal,Trophy,Users,UserRound} from 'lucide-react';
import GreenShell from '@/app/components/GreenShell';
import {useStudent} from '@/app/lib/useStudent';
import {supabase} from '@/lib/supabaseClient';

type Person={id:string;username:string|null;hostel:string|null;score:number;avatar_url?:string|null};
type Period='all'|'month'|'week';
const periods:{id:Period;label:string}[]=[{id:'week',label:'This Week'},{id:'month',label:'This Month'},{id:'all',label:'All Time'}];
function PersonAvatar({person,size='small'}:{person:Person;size?:'small'|'large'}){return <span className={'gf-v3-person-avatar '+(size==='large'?'big':'')}>{person.avatar_url?<img src={person.avatar_url} alt=""/>:<span>{(person.username||'G').slice(0,1).toUpperCase()}</span>}</span>}
export default function Leaderboard(){
 const {userId}=useStudent();
 const [people,setPeople]=useState<Person[]>([]);
 const [view,setView]=useState<'people'|'communities'>('people');
 const [period,setPeriod]=useState<Period>('all');
 const [pending,setPending]=useState(true),[error,setError]=useState(''),[periodsAvailable,setPeriodsAvailable]=useState(true);
 useEffect(()=>{let active=true;setPending(true);setError('');
   void(async()=>{
     // New RPC exposes only public ranking fields; direct access to other users' action records remains denied.
     let result=await supabase.rpc('gf_public_rankings',{p_period:period});
     if(result.error&&/gf_public_rankings|schema cache|function .* does not exist/i.test(result.error.message)){
       if(period!=='all'){if(active){setPeriodsAvailable(false);setPeriod('all')}return}
       result=await supabase.rpc('gf_leaderboard');
       if(active)setPeriodsAvailable(false);
     }
     if(!active)return;
     if(result.error){setError('Rankings are temporarily unavailable. Please try again.');setPeople([])}
     else setPeople(((result.data||[]) as Person[]).map(p=>({...p,score:Number(p.score)||0})).sort((a,b)=>b.score-a.score));
     setPending(false);
   })();return()=>{active=false};
 },[period]);
 const groups=useMemo(()=>Object.entries(people.reduce<Record<string,{total:number;count:number}>>((out,p)=>{
   const name=p.hostel?.trim();if(!name)return out;out[name]??={total:0,count:0};out[name].total+=p.score;out[name].count+=1;return out;
 },{})).map(([name,r])=>({name,members:r.count,average:Math.round(r.total/r.count)})).sort((a,b)=>b.average-a.average),[people]);
 const podium=people.slice(0,3);
 const myPosition=people.findIndex(p=>p.id===userId);
 return <GreenShell><div className="gf-screen gf-v3-page gf-v3-rankings">
  <header className="gf-v3-page-heading"><span className="gf-v3-eyebrow">THE LEADERBOARD</span><h1>Community<br/>standings<span className="gf-v3-title-period">.</span></h1><p>Real actions. Bigger impact. See how our community is doing.</p><div className="gf-v3-globe-art" aria-hidden="true"><Earth size={110} strokeWidth={1.1}/><i/><i/></div></header>
  <div className="gf-v3-segment" role="group" aria-label="Ranking type"><button type="button" className={view==='people'?'selected':''} aria-pressed={view==='people'} onClick={()=>setView('people')}><Users size={17}/>People</button><button type="button" className={view==='communities'?'selected':''} aria-pressed={view==='communities'} onClick={()=>setView('communities')}><Earth size={17}/>Communities</button></div>
  <div className="gf-v3-periods" role="group" aria-label="Ranking time period">{periods.map(p=><button type="button" key={p.id} className={period===p.id?'active':''} aria-pressed={period===p.id} disabled={!periodsAvailable&&p.id!=='all'} onClick={()=>setPeriod(p.id)}>{p.label}</button>)}</div>
  {!periodsAvailable&&<p className="gf-v3-info-line"><Info size={14}/> All-time rankings are ready. Apply the included ranking-period SQL migration to enable weekly and monthly results.</p>}
  {error&&<div className="gf-error" role="alert">{error}</div>}
  {pending?<div className="gf-v3-loading">Updating rankings…</div>:view==='people'?<>
   {podium.length>0&&<div className="gf-v3-podium" aria-label="Top three people">{[1,0,2].map((index)=>{const p=podium[index];if(!p)return <div key={index} className="gf-v3-podium-placeholder"/>;return <div key={p.id} className={'gf-v3-podium-person gf-v3-place-'+(index+1)}>{index===0&&<Crown size={24} className="gf-v3-crown" fill="currentColor"/>}<span className="gf-v3-place-number">#{index+1}</span><PersonAvatar person={p} size="large"/><strong className="gf-v3-podium-name">{p.username||'GreenFlare member'}</strong><small>{p.hostel||'Community member'}</small><b>{p.score.toLocaleString()}</b><span>pts</span></div>})}</div>}
   {people.length>0&&<div className="gf-v3-leaderboard-list"><div className="gf-v3-list-head"><span>RANK / MEMBER</span><span>GREEN SCORE</span></div>{people.slice(podium.length).map((p,i)=><div className={'gf-v3-person-row '+(p.id===userId?'is-you':'')} key={p.id}><span className="gf-v3-row-rank">{i+podium.length+1}</span><PersonAvatar person={p}/><span className="gf-v3-row-name"><strong>{p.username||'GreenFlare member'} {p.id===userId&&<em>· You</em>}</strong><small>{p.hostel||'Community member'}</small></span><b>{p.score.toLocaleString()}<small> pts</small></b></div>)}</div>}
   {people.length>0&&myPosition>=0&&<div className="gf-v3-my-rank"><Trophy size={17}/><span>Your current standing</span><strong>#{myPosition+1}</strong></div>}
   {!people.length&&<div className="gf-v3-empty"><Medal size={34}/><h3>The leaderboard starts with us.</h3><p>Rankings appear as people complete eligible recycling actions.</p><Link href="/scan">Record your first action <ArrowRight size={16}/></Link></div>}
  </>:<>
   <div className="gf-v3-community-feature"><div><span className="gf-v3-eyebrow">COMMUNITY RANKINGS</span><h2>Stronger together<br/>for a cleaner planet.</h2><p>Compare communities by average earned score per participating member.</p></div><div className="gf-v3-community-art" aria-hidden="true"><Earth size={76} strokeWidth={1.1}/><span/></div></div>
   {groups.length?<div className="gf-v3-community-table"><div className="gf-v3-community-labels"><span>#</span><span>COMMUNITY</span><span>MEMBERS</span><span>AVG SCORE</span></div>{groups.map((g,i)=><div key={g.name} className={'gf-v3-community-row '+(i===0?'winner':'')}><b className="gf-v3-community-rank">{i+1}</b><span className="gf-v3-community-name"><span className="gf-v3-community-mark"><Users size={18}/></span><strong>{g.name}</strong></span><span>{g.members}</span><b>{g.average.toLocaleString()}</b></div>)}</div>:<div className="gf-v3-empty"><Users size={34}/><h3>Communities will show up here.</h3><p>Add a community to your profile and record eligible actions to take part.</p></div>}
   <div className="gf-v3-community-cta"><span className="gf-v3-community-cta-icon"><Trophy size={27}/></span><div><strong>Every community has a part to play.</strong><p>Build good habits together. Your actions add to your community's progress.</p></div></div>
  </>}
  <p className="gf-v3-disclaimer"><Info size={14}/> Rankings reflect recorded eligible actions, not a measured weight of recovered waste. Communities are ranked by average points per participating member.</p>
 </div></GreenShell>;
}
