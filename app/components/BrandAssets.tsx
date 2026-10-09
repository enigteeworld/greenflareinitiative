'use client';

import { useEffect, useState } from 'react';
import BrandMark from './BrandMark';

export type BrandSettings = {
  logo_url: string | null;
  favicon_url: string | null;
  preloader_url: string | null;
  _ready?: boolean;
};

const fallback: BrandSettings = {
  logo_url: null,
  favicon_url: null,
  preloader_url: null,
  _ready: false,
};

let cached: BrandSettings | null = null;

export function useBrandSettings() {
  const [settings, setSettings] = useState<BrandSettings>(cached || fallback);

  useEffect(() => {
    if (cached) {
      setSettings(cached);
      return;
    }

    let active = true;
    const controller = new AbortController();
    const cutoff = setTimeout(() => controller.abort(), 5000);

    fetch('/api/branding', {
      cache: 'no-store',
      signal: controller.signal,
    })
      .then((response) => (response.ok ? response.json() : fallback))
      .catch(() => fallback)
      .then((result) => {
        if (active) {
          const updatedSettings: BrandSettings = {
            ...fallback,
            ...result,
            _ready: true,
          };
          cached = updatedSettings;
          setSettings(updatedSettings);
        }
      })
      .finally(() => clearTimeout(cutoff));

    return () => {
      active = false;
      clearTimeout(cutoff);
      controller.abort();
    };
  }, []);

  return settings;
}

export function BrandFavicon() {
  const { favicon_url } = useBrandSettings();

  useEffect(() => {
    let link = document.querySelector<HTMLLinkElement>('link[data-gf-favicon]');
    if (!favicon_url) {
      if (link) link.remove();
      return;
    }
    if (!link) {
      link = document.createElement('link');
      link.rel = 'icon';
      link.dataset.gfFavicon = 'true';
      document.head.append(link);
    }
    link.href = favicon_url;
  }, [favicon_url]);

  return null;
}

export function BrandLogo({ className = '' }: { className?: string }) {
  const { logo_url, _ready } = useBrandSettings();

  if (!_ready) {
    return <span className="gf-brand-loading" aria-label="Loading GreenFlare logo" />;
  }

  return logo_url ? (
    <img className={'gf-uploaded-logo ' + className} src={logo_url} alt="GreenFlare" />
  ) : (
    <span className={'gf-fallback-brand ' + className}>
      <BrandMark className="gf-brand-symbol" />
      <span className="gf-fallback-name">GreenFlare</span>
    </span>
  );
}
