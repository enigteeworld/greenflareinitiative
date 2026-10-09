'use client';
import Link from 'next/link';
import {useParams} from 'next/navigation';
import {ArrowLeft,ArrowRight,BookOpen,CheckCircle2,Clock3,Recycle} from 'lucide-react';
import GreenShell from '@/app/components/GreenShell';
import {getLearnArticle} from '@/app/lib/learnContent';
export default function LearnArticlePage(){
 const {slug}=useParams<{slug:string}>();const article=getLearnArticle(slug);
 if(!article)return <GreenShell><main className="gf-screen gf-v3-page"><Link href="/learn" className="gf-v3-back"><ArrowLeft size={18}/> Back to Learn</Link><div className="gf-v3-empty"><BookOpen size={32}/><h1>Guide not found</h1><p>Try another guide in the Learn library.</p></div></main></GreenShell>;
 return <GreenShell><article className="gf-screen gf-v3-page gf-v3-guide"><Link href="/learn" className="gf-v3-back"><ArrowLeft size={18}/> All guides</Link><header className={'gf-v3-guide-hero '+article.theme}><span className="gf-v3-eyebrow">{article.category.toUpperCase()} · {article.readTime} MIN READ</span><h1>{article.title}</h1><p>{article.subtitle}</p><span className="gf-v3-guide-art" aria-hidden="true"><Recycle size={100} strokeWidth={1.1}/></span></header><div className="gf-v3-guide-body"><p className="gf-v3-guide-intro">{article.intro}</p>{article.sections.map((s,i)=><section key={s.title}><span className="gf-v3-section-num">0{i+1}</span><h2>{s.title}</h2><p>{s.body}</p>{s.tips&&<div className="gf-v3-tip-list"><strong>Put it into practice</strong>{s.tips.map(t=><p key={t}><CheckCircle2 size={17}/>{t}</p>)}</div>}</section>)}<Link href="/learn" className="gf-v3-guide-more">Explore more guides <ArrowRight size={18}/></Link></div></article></GreenShell>;
}
