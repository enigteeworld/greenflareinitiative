'use client';
import {useEffect,useMemo,useState} from 'react';
import Link from 'next/link';
import GreenShell from '@/app/components/GreenShell';
import {useStudent} from '@/app/lib/useStudent';
import {supabase} from '@/lib/supabaseClient';
import {Activity,ArrowRight,CalendarDays,CheckCircle2,Recycle,ScanLine} from 'lucide-react';
type Action={id:string;created_at:string;points:number;bin_id:string};
type Bin={id:string;name:string;material:string;hostel:string};
export default function ActivityPage(){
 const {userId}=useStudent();
 const [actions,setActions]=useState<Action[]>([]),[bins,setBins]=useState<Record<string,Bin>>({}),[loading,setLoading]=useState(true),[error,setError]=useState('');
 useEffect(()=>{if(!userId)return;let live=true;void(async()=>{
  const {data,error:fetchError}=await supabase.from('gf_actions').select('id,created_at,points,bin_id').eq('user_id',userId).order('created_at',{ascending:false}).limit(500);
  if(!live)return;
  if(fetchError){setError('Unable to load your activity history.');setLoading(false);return}
  const list=(data||[]) as Action[];setActions(list);
  const ids=[...new Set(list.map(a=>a.bin_id))];
  if(ids.length){const {data:binData}=await supabase.from('gf_bins').select('id,name,material,hostel').in('id',ids);if(live&&binData)setBins(Object.fromEntries((binData as Bin[]).map(b=>[b.id,b])))}
  if(live)setLoading(false);
 })();return()=>{live=false}},[userId]);
 const week=useMemo(()=>Array.from({length:7},(_,i)=>{const date=new Date();date.setDate(date.getDate()-(6-i));return {key:new Intl.DateTimeFormat('en-CA',{timeZone:'Africa/Lagos',year:'numeric',month:'2-digit',day:'2-digit'}).format(date),label:new Intl.DateTimeFormat('en',{timeZone:'Africa/Lagos',weekday:'short'}).format(date)}}),[]);
 const dayCounts:Record<string,number>=Object.fromEntries(week.map(d=>[d.key,0]));
 for(const action of actions){const day=new Intl.DateTimeFormat('en-CA',{timeZone:'Africa/Lagos',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(action.created_at));if(day in dayCounts)dayCounts[day]++}
 const peak=Math.max(1,...Object.values(dayCounts));const total=actions.reduce((sum,a)=>sum+Number(a.points||0),0);
 return <GreenShell><div className="gf-screen gf-reference-screen gf-activity-screen">
 <header className="gf-screen-intro"><span className="gf-kicker">YOUR ACTIVITY</span><h1>Every action adds up.</h1><p>Your progress, your pace. Explore the recycling actions you've recorded.</p></header>
 <div className="gf-ref-activity-highlights"><div className="gf-ref-card"><span className="gf-ref-icon gf-ref-icon-blue"><Recycle/></span><strong>{loading?'—':actions.length.toLocaleString()}</strong><small>Recent actions</small></div><div className="gf-ref-card"><span className="gf-ref-icon gf-ref-icon-forest"><Activity/></span><strong>{loading?'—':total.toLocaleString()}</strong><small>Score in records shown</small></div></div>
 <section className="gf-ref-card gf-ref-secondary-panel"><div className="gf-panel-title"><div><span className="gf-kicker">YOUR RHYTHM</span><h2>This week</h2></div><span className="gf-ref-minor"><CalendarDays size={17}/> Past 7 days</span></div><div className="gf-ref-week-bars">{week.map((day,i)=><div className="gf-ref-bar-col" key={day.key}><strong>{dayCounts[day.key]||''}</strong><span><i style={{height:`${Math.max(5,(dayCounts[day.key]/peak)*100)}%`}} className={i===6?'latest':''}/></span><small>{day.label}</small></div>)}</div></section>
 <section className="gf-ref-card gf-ref-secondary-panel"><div className="gf-panel-title"><div><span className="gf-kicker">YOUR HISTORY</span><h2>Recent recycling</h2></div><Link href="/scan" className="gf-ref-small-button"><ScanLine size={16}/> Scan</Link></div>{error&&<p className="gf-error" role="alert">{error}</p>}
 {loading?<div className="gf-ref-loading-row">Loading recycling history…</div>:actions.length?<div className="gf-ref-history">{actions.map(a=><article key={a.id}><span className="gf-ref-icon gf-ref-icon-blue"><CheckCircle2 size={21}/></span><div><strong>{bins[a.bin_id]?.name||'Recycling action'}</strong><small>{new Date(a.created_at).toLocaleString('en-NG',{dateStyle:'medium',timeStyle:'short'})}{bins[a.bin_id]?.material?` · ${bins[a.bin_id].material}`:''}</small></div><b>+{a.points}</b></article>)}</div>:<div className="gf-ref-empty"><span><Recycle size={34}/></span><h3>Your history starts with a scan.</h3><p>Scan a registered collection bin to record your first eligible recycling action.</p><Link href="/scan" className="gf-button dark">Start scanning <ArrowRight size={16}/></Link></div>}</section>
 </div></GreenShell>
}
