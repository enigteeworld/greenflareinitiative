'use client';
import {useEffect,useMemo,useState} from 'react';
import Link from 'next/link';
import {ArrowRight,Check,ChevronRight,Info,Recycle,ScanLine,TrendingUp,ChartNoAxesColumnIncreasing} from 'lucide-react';
import BrandMark from '@/app/components/BrandMark';
import GreenShell from '@/app/components/GreenShell';
import {useStudent} from '@/app/lib/useStudent';
import {supabase} from '@/lib/supabaseClient';

type Action={id:string;created_at:string;points:number};
const MONTHLY_GOAL=30;
const lagosDay=(date:Date)=>new Intl.DateTimeFormat('en-CA',{timeZone:'Africa/Lagos',year:'numeric',month:'2-digit',day:'2-digit'}).format(date);
const lagosMonth=(date:Date)=>lagosDay(date).slice(0,7);

export default function Dashboard(){
 const {userId,profile,loading}=useStudent();
 const [score,setScore]=useState(0);
 const [actions,setActions]=useState<Action[]>([]);
 const [fetching,setFetching]=useState(true);
 const [error,setError]=useState('');
 useEffect(()=>{
   if(!userId)return;
   let live=true;
   void(async()=>{
     const [wallet,history]=await Promise.all([
       supabase.from('gf_wallets').select('lifetime_points').eq('user_id',userId).maybeSingle(),
       supabase.from('gf_actions').select('id,created_at,points').eq('user_id',userId).order('created_at',{ascending:false}).limit(1500)
     ]);
     if(!live)return;
     if(wallet.data)setScore(Number(wallet.data.lifetime_points)||0);
     if(history.data)setActions(history.data as Action[]);
     if(wallet.error||history.error)setError('We could not refresh your activity. Check your connection and retry.');
     setFetching(false);
   })();
   return()=>{live=false};
 },[userId]);
 const now=new Date();
 const currentMonth=lagosMonth(now);
 const lastMonthDate=new Date(Date.UTC(Number(currentMonth.slice(0,4)),Number(currentMonth.slice(5,7))-2,12));
 const lastMonth=lagosMonth(lastMonthDate);
 const thisMonth=actions.filter(a=>lagosMonth(new Date(a.created_at))===currentMonth);
 const priorMonth=actions.filter(a=>lagosMonth(new Date(a.created_at))===lastMonth);
 const monthActions=thisMonth.length;
 const progress=Math.min(100,Math.round(monthActions/MONTHLY_GOAL*100));
 const earnedThisMonth=thisMonth.reduce((sum,a)=>sum+Number(a.points||0),0);
 const earnedLastMonth=priorMonth.reduce((sum,a)=>sum+Number(a.points||0),0);
 const trend=earnedLastMonth>0?Math.round((earnedThisMonth-earnedLastMonth)/earnedLastMonth*100):null;
 const next=score<100?100:score<500?500:score<1000?1000:score<2500?2500:Math.ceil((score+1)/1000)*1000;
 const scorePercent=Math.min(100,Math.max(0,Math.round(score/next*100)));
 const days=useMemo(()=>Array.from({length:7},(_,index)=>{const date=new Date();date.setDate(date.getDate()-(6-index));return {key:lagosDay(date),label:new Intl.DateTimeFormat('en',{weekday:'short',timeZone:'Africa/Lagos'}).format(date)};}),[]);
 const activeDays=new Set(actions.map(a=>lagosDay(new Date(a.created_at))));
 const weeklyDays=days.filter(d=>activeDays.has(d.key)).length;
 const firstName=(profile?.full_name||profile?.username||'there').trim().split(' ')[0];
 const hour=Number(new Intl.DateTimeFormat('en-GB',{hour:'2-digit',hour12:false,timeZone:'Africa/Lagos'}).format(now));
 const greeting=hour<12?'Good morning':hour<17?'Good afternoon':'Good evening';
 const busy=loading||fetching;
 return <GreenShell><div className="gf-home gf-reference-home" aria-busy={busy}>
   <header className="gf-ref-greeting">
     <div><h1>{greeting}, {firstName}</h1><p>Greener habits today for<br/>a brighter tomorrow.</p></div>
     <div className="gf-ref-landscape" aria-hidden="true"><i/><i/><i/><i/></div>
   </header>
   {error&&<p className="gf-error" role="alert">{error}</p>}
   <section className="gf-ref-card gf-ref-score" aria-labelledby="gf-green-score-title">
     <div className="gf-ref-card-header"><span className="gf-ref-icon gf-ref-icon-forest"><BrandMark/></span><div><h2 id="gf-green-score-title">Green Score <Info size={17} aria-label="Lifetime points earned from eligible actions"/></h2><p>Your overall recycling activity</p></div></div>
     <div className="gf-ref-score-layout">
       <div className="gf-ref-score-ring" style={{'--score-angle':`${scorePercent}%`} as React.CSSProperties} role="progressbar" aria-label="Green Score progress toward your next milestone" aria-valuemin={0} aria-valuemax={next} aria-valuenow={Math.min(score,next)}>
         <div className="gf-ref-score-core"><BrandMark/><strong>{busy?'—':score.toLocaleString()}</strong><small>of {next.toLocaleString()}</small></div>
       </div>
       <div className="gf-ref-score-copy">
         <span className={'gf-ref-trend '+(trend!==null&&trend<0?'is-down':'')}><TrendingUp size={16}/>{busy?'Loading…':trend===null?'Your journey':`${trend>0?'+':''}${trend}%`}</span>
         <small>{trend===null?'Build your first month':'vs. last month'}</small>
         <h3>{score===0?'A fresh start.':scorePercent>=75?'Great progress!':'Keep it going!'}</h3>
         <p>{score===0?'Your first scan starts your Green Score.':`You're making a difference. ${Math.max(0,next-score).toLocaleString()} points to your next milestone.`}</p>
       </div>
     </div>
   </section>
   <Link href="/activity" className="gf-ref-card gf-ref-recycling" aria-label="View recycling activity details">
     <div className="gf-ref-card-header"><span className="gf-ref-icon gf-ref-icon-blue"><Recycle size={25}/></span><div><h2>Recycling Progress</h2><p>Actions recorded this month</p></div><ChevronRight className="gf-ref-card-chevron" size={22}/></div>
     <div className="gf-ref-recycle-data"><div className="gf-ref-recycle-count"><strong>{busy?'—':monthActions}</strong><span>of {MONTHLY_GOAL} actions</span></div><div className="gf-ref-recycle-bar"><b>{progress}%</b><span className="gf-ref-progress-rail"><i style={{width:`${progress}%`}}/></span></div></div>
     <svg className="gf-ref-bottle-art" viewBox="0 0 180 160" fill="none" aria-hidden="true"><circle cx="143" cy="133" r="95" fill="#DCECF0" opacity=".56"/><circle cx="178" cy="116" r="56" fill="#C7DFDA" opacity=".65"/><path d="M79 143 118 44c2-6 6-8 12-5l20 8c6 2 8 7 6 12l-38 100" fill="#CDE8F4" fillOpacity=".58" stroke="#85C0D8" strokeWidth="3"/><path d="m120 31 8-20 20 8-8 20Z" fill="#C7DFF0" stroke="#89C4DA" strokeWidth="3"/><path d="m132 15 20 8" stroke="#77AAC0" strokeWidth="2"/><path d="m93 125 25-66M103 133l25-66" stroke="white" strokeOpacity=".7" strokeWidth="4"/><path d="m89 151 55-120" stroke="#C7E4EB" strokeWidth="1"/></svg>
   </Link>
   <section className="gf-ref-card gf-ref-week" aria-labelledby="gf-this-week-title">
     <div className="gf-ref-card-header"><span className="gf-ref-icon gf-ref-icon-amber"><ChartNoAxesColumnIncreasing size={23}/></span><div><h2 id="gf-this-week-title">This Week</h2><p>A quick look at your activity</p></div><Link className="gf-ref-week-link" href="/activity">See details <ChevronRight size={18}/></Link></div>
     <div className="gf-ref-week-days">{days.map((day,index)=><div className="gf-ref-day" key={day.key}><span className={'gf-ref-day-dot '+(activeDays.has(day.key)?index===6?'amber':index===5?'blue':'done':'')}>{activeDays.has(day.key)?<Check size={19} strokeWidth={2.7}/>:null}</span><small>{day.label}</small></div>)}</div>
     <span className="sr-only">{weeklyDays} days with recycling activity in the past seven days.</span>
   </section>
   <Link href="/scan" className="gf-ref-cta"><ScanLine size={27}/><strong>Scan to recycle</strong><span><ArrowRight size={23}/></span></Link>
   <p className="gf-ref-tagline">TURN EVERYDAY ACTIONS INTO LASTING CHANGE</p>
 </div></GreenShell>
}
