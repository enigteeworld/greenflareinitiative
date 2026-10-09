'use client';
import {useEffect,useState} from 'react';
import GreenShell from '@/app/components/GreenShell';
import {useStudent} from '@/app/lib/useStudent';
import {supabase} from '@/lib/supabaseClient';
import {Bell,CheckCheck,Inbox} from 'lucide-react';

type Notice={id:string;kind:string;subject:string;body:string;created_at:string;read_at:string|null};
export default function Notifications(){
 const {userId}=useStudent();
 const [notices,setNotices]=useState<Notice[]>([]),[loading,setLoading]=useState(true),[busy,setBusy]=useState(false),[error,setError]=useState('');
 useEffect(()=>{
   if(!userId)return;
   let live=true;
   void(async()=>{
     const {data,error}=await supabase.from('gf_notifications').select('id,kind,subject,body,created_at,read_at').eq('user_id',userId).order('created_at',{ascending:false}).limit(100);
     if(!live)return;
     if(error)setError('Notifications could not be loaded.');
     else setNotices((data||[]) as Notice[]);
     setLoading(false);
   })();
   return()=>{live=false};
 },[userId]);
 async function markRead(){
   if(!userId||busy)return;
   const ids=notices.filter(n=>!n.read_at).map(n=>n.id);
   if(!ids.length)return;
   setBusy(true);setError('');
   const time=new Date().toISOString();
   const {error}=await supabase.from('gf_notifications').update({read_at:time}).eq('user_id',userId).in('id',ids);
   if(error)setError('Could not mark notifications as read. Apply the included permissions migration.');
   else{setNotices(current=>current.map(n=>n.read_at?n:{...n,read_at:time}));window.dispatchEvent(new Event('gf:notifications-updated'))}
   setBusy(false);
 }
 const unread=notices.filter(n=>!n.read_at).length;
 return <GreenShell><div className="gf-screen gf-reference-screen gf-notices-screen">
   <header className="gf-screen-intro"><span className="gf-kicker">STAY IN THE LOOP</span><h1>Notifications.</h1><p>Updates about your activities and GreenFlare community.</p></header>
   <section className="gf-ref-card gf-ref-secondary-panel">
     <div className="gf-panel-title gf-notification-heading"><div><span className="gf-ref-icon gf-ref-icon-blue"><Bell size={23}/></span><h2>{unread?`${unread} unread ${unread===1?'update':'updates'}`:'All caught up'}</h2></div><button className="gf-ref-small-button" type="button" onClick={()=>void markRead()} disabled={busy||!unread}><CheckCheck size={17}/>{busy?'Saving…':'Mark all read'}</button></div>
     {error&&<p className="gf-error" role="alert">{error}</p>}
     {loading?<div className="gf-ref-loading-row">Loading your updates…</div>:!notices.length?<div className="gf-ref-empty"><span><Inbox size={36}/></span><h3>Nothing here just yet.</h3><p>Activity updates and announcements will appear here when available.</p></div>:<div className="gf-notification-list">{notices.map(n=><article key={n.id} className={'gf-notification '+(!n.read_at?'unread':'')}><span className="gf-notification-indicator"/><div><strong>{n.subject}</strong><p>{n.body}</p><small>{new Date(n.created_at).toLocaleString('en-NG',{dateStyle:'medium',timeStyle:'short'})}</small></div></article>)}</div>}
   </section>
 </div></GreenShell>;
}
