'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, ArrowUpRight, Check, Recycle, ScanLine, Sparkles } from 'lucide-react';
import { BrandLogo } from './components/BrandAssets';
import { supabase } from '@/lib/supabaseClient';

type Slide = {
  eyebrow: string;
  title: string;
  accent: string;
  description: string;
  image: string;
  imageAlt: string;
  caption: string;
  stat: string;
};

const slides: Slide[] = [
  {
    eyebrow: 'YOUR SMALL ACTIONS MATTER',
    title: 'A better tomorrow',
    accent: 'starts with you.',
    description: 'The simple act of recycling can become a habit that changes everything.',
    image: '/images/recycling-thumb.jpg',
    imageAlt: 'A person recycling a bottle at a designated waste collection station',
    caption: 'Real action, real progress',
    stat: '01 / 02',
  },
  {
    eyebrow: 'SEE THE DIFFERENCE YOU MAKE',
    title: 'Recycle. Earn.',
    accent: 'Make your mark.',
    description: 'Scan a registered bin, build your Green Score and grow alongside your community.',
    image: '/images/aerial-community-event.jpg',
    imageAlt: 'People participating in a community environmental activity',
    caption: 'Your impact, in motion',
    stat: '02 / 02',
  },
];

export default function WelcomePage() {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const dragActive = useRef(false);
  const progressRef = useRef(0);
  const sliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let alive = true;
    void supabase.auth.getSession().then(({ data, error }) => {
      if (alive && !error && data.session?.user) router.replace('/account');
    });
    return () => { alive = false; };
  }, [router]);

  function updateProgress(value: number) {
    const next = Math.max(0, Math.min(100, value));
    progressRef.current = next;
    setProgress(next);
  }

  function nextSlide() {
    updateProgress(0);
    if (index === slides.length - 1) router.push('/auth');
    else setIndex((current) => Math.min(current + 1, slides.length - 1));
  }

  function moveSlider(clientX: number) {
    const rect = sliderRef.current?.getBoundingClientRect();
    if (!rect) return;
    const travel = Math.max(1, rect.width - 74);
    updateProgress(((clientX - rect.left - 36) / travel) * 100);
  }

  function releaseSlider() {
    if (!dragActive.current) return;
    dragActive.current = false;
    if (progressRef.current >= 84) nextSlide();
    else updateProgress(0);
  }

  function goToSlide(target: number) {
    updateProgress(0);
    setIndex(target);
  }

  const slide = slides[index];

  return (
    <main className="gf-entry gf-onboarding" aria-label="Welcome to GreenFlare">
      <div className="gf-onboarding-shell">
        <header className="gf-onboarding-header">
          <Link href="/" className="gf-onboarding-logo" aria-label="GreenFlare home"><BrandLogo /></Link>
          <Link href="/auth" className="gf-onboarding-skip">Skip <ArrowUpRight size={16} /></Link>
        </header>

        <section className="gf-onboarding-main" key={index} aria-live="polite">
          <div className="gf-onboarding-visual">
            <Image src={slide.image} alt={slide.imageAlt} fill priority sizes="(max-width: 750px) 100vw, 52vw" className="gf-onboarding-image" />
            <div className="gf-onboarding-gradient" />
            <div className="gf-onboarding-orbit gf-onboarding-orbit-one" aria-hidden="true" />
            <div className="gf-onboarding-orbit gf-onboarding-orbit-two" aria-hidden="true" />
            <div className="gf-onboarding-topline"><span className="gf-onboarding-live"><span /> LIVE A LITTLE GREENER</span><span>{slide.stat}</span></div>
            <div className="gf-onboarding-image-footer">
              <span className="gf-onboarding-image-icon"><Recycle size={22} strokeWidth={2.2}/></span>
              <span><strong>{slide.caption}</strong><small>GREENFLARE COMMUNITY</small></span>
              <span className="gf-onboarding-image-check"><Check size={17} /></span>
            </div>
          </div>
          <div className="gf-onboarding-text">
            <span className="gf-onboarding-eyebrow"><Sparkles size={13} />{slide.eyebrow}</span>
            <h1>{slide.title}<span>{slide.accent}</span></h1>
            <p>{slide.description}</p>
          </div>
        </section>

        <footer className="gf-onboarding-footer">
          <div className="gf-onboarding-pagination" role="group" aria-label="Welcome slides">
            {slides.map((item, i) => <button key={item.stat} type="button" onClick={() => goToSlide(i)} className={i === index ? 'is-current' : ''} aria-label={`Go to introduction slide ${i + 1}`} aria-current={i === index ? 'step' : undefined} />)}
          </div>

          <div
            ref={sliderRef}
            className="gf-onboarding-slider"
            role="slider"
            tabIndex={0}
            aria-label={index === slides.length - 1 ? 'Slide to sign in' : 'Slide to continue'}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress)}
            aria-valuetext={`${Math.round(progress)} percent`}
            onPointerDown={(event) => {
              if (event.button !== 0) return;
              const rect = event.currentTarget.getBoundingClientRect();
              // Start near the handle: tapping the far end must not bypass the slide.
              if (event.clientX > rect.left + 94 && progressRef.current < 10) return;
              dragActive.current = true;
              event.currentTarget.setPointerCapture(event.pointerId);
              moveSlider(event.clientX);
            }}
            onPointerMove={(event) => { if (dragActive.current) moveSlider(event.clientX); }}
            onPointerUp={releaseSlider}
            onPointerCancel={() => { dragActive.current = false; updateProgress(0); }}
            onLostPointerCapture={releaseSlider}
            onKeyDown={(event) => {
              if (event.key === 'ArrowRight') { event.preventDefault(); updateProgress(progressRef.current + 20); }
              if (event.key === 'ArrowLeft') { event.preventDefault(); updateProgress(progressRef.current - 20); }
              if (event.key === 'Home') { event.preventDefault(); updateProgress(0); }
              if (event.key === 'End') { event.preventDefault(); updateProgress(100); }
              if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); nextSlide(); }
            }}
          >
            <span className="gf-onboarding-slider-fill" style={{ width: `calc(70px + (100% - 70px) * ${progress / 100})` }} />
            <span className="gf-onboarding-slider-label">{index === slides.length - 1 ? 'Slide to get started' : 'Slide to continue'}</span>
            <span className="gf-onboarding-slider-thumb" style={{ left: `calc(5px + (100% - 70px) * ${progress / 100})` }}><ArrowRight size={23}/></span>
          </div>
          <div className="gf-onboarding-bottom-row">
            <span><ScanLine size={14}/> Track what matters</span>
            <Link href="/auth?mode=signup">Create account <ArrowUpRight size={13}/></Link>
          </div>
        </footer>
      </div>
    </main>
  );
}
