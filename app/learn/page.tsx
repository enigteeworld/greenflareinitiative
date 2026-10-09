'use client';
import {useMemo,useState} from 'react';
import Link from 'next/link';
import {ArrowRight,BookOpen,ChevronRight,Clock3,Lightbulb,Recycle,Search,SlidersHorizontal,Sparkles} from 'lucide-react';
import GreenShell from '@/app/components/GreenShell';
import {learnArticles,type LearnCategory} from '@/app/lib/learnContent';
const categories=['All','Recycling','Everyday habits','Impact'] as const;
const icons={Recycling:Recycle,'Everyday habits':Lightbulb,Impact:Sparkles};
export default function LearnPage(){
 const [category,setCategory]=useState<'All'|LearnCategory>('All'),[query,setQuery]=useState('');
 const list=useMemo(()=>learnArticles.filter(a=>(category==='All'||a.category===category)&&(`${a.title} ${a.subtitle} ${a.category}`).toLowerCase().includes(query.trim().toLowerCase())),[category,query]);
 return <GreenShell><div className="gf-screen gf-v3-page gf-v3-learn">
  <header className="gf-v3-page-heading gf-v3-learn-heading"><span className="gf-v3-eyebrow">DISCOVER WHAT MATTERS</span><h1>Learn<span className="gf-v3-title-period">.</span></h1><p>Small knowledge. Big change.</p></header>
  <div className="gf-v3-learn-search"><Search size={19}/><input aria-label="Search educational articles" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search tips, topics or guides…"/><SlidersHorizontal size={18} color="#799189"/></div>
  <div className="gf-v3-categories" role="group" aria-label="Learning category">{categories.map(c=><button key={c} type="button" className={category===c?'selected':''} onClick={()=>setCategory(c)} aria-pressed={category===c}>{c}</button>)}</div>
  {category==='All'&&!query&&<Link href="/learn/plastic-bottle-journey" className="gf-v3-learn-feature"><div className="gf-v3-learn-feature-decoration" aria-hidden="true"><span className="gf-v3-bottle"><i/><b/><em/></span><i className="gf-v3-water one"/><i className="gf-v3-water two"/><i className="gf-v3-water three"/></div><span className="gf-v3-feature-chip">FEATURED STORY</span><div><h2>The life cycle<br/>of a plastic bottle</h2><p>From waste to new possibilities.</p></div><span className="gf-v3-feature-arrow"><ArrowRight size={22}/></span></Link>}
  <div className="gf-v3-section-heading"><div><span className="gf-v3-eyebrow">A LITTLE EVERY DAY</span><h2>{category==='All'?'More to explore':category}</h2></div><span>{list.length} guides</span></div>
  <div className="gf-v3-articles">{list.map(a=>{const Icon=icons[a.category];return <Link href={'/learn/'+a.slug} key={a.slug} className="gf-v3-article"><span className={'gf-v3-article-icon '+a.theme}><Icon size={23}/></span><span><strong>{a.title}</strong><small>{a.subtitle}</small><em><Clock3 size={12}/>{a.readTime} min read</em></span><ChevronRight size={20}/></Link>})}</div>
  {!list.length&&<div className="gf-v3-empty"><BookOpen size={30}/><h3>No guides found.</h3><p>Try a different topic or category.</p><button type="button" onClick={()=>{setCategory('All');setQuery('')}}>Clear search</button></div>}
  <div className="gf-v3-learn-note"><Lightbulb size={19}/><p>Know more. Do better. When you're ready, find a registered bin and record an eligible recycling action.</p><Link href="/scan" aria-label="Go to QR scanner"><ArrowRight size={19}/></Link></div>
 </div></GreenShell>;
}
