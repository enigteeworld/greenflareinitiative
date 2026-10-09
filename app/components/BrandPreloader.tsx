'use client';
import {useBrandSettings,BrandFavicon} from './BrandAssets';
import BrandMark from './BrandMark';
export default function BrandPreloader(){const {preloader_url,_ready}=useBrandSettings();return <><BrandFavicon/><div className={'gf-entry-preloader '+(_ready?'is-ready':'')} aria-hidden="true"><div className="gf-preloader-content"><div className="gf-bouncing-logo">{preloader_url?<img src={preloader_url} alt=""/>:<BrandMark className="gf-loader-mark"/>}</div><strong className="gf-preloader-wordmark">GreenFlare</strong><span className="gf-preloader-caption">SMALL CHOICES. BRIGHTER TOMORROWS.</span><span className="gf-preloader-dots"><i/><i/><i/></span></div></div></>}
