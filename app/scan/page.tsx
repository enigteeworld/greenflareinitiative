"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {Camera,ScanLine,ShieldCheck,CheckCircle2,ArrowRight} from "lucide-react";
import type { Html5Qrcode } from "html5-qrcode";
import GreenShell from "@/app/components/GreenShell";
import { useStudent } from "@/app/lib/useStudent";
import { supabase } from "@/lib/supabaseClient";

type Bin = { name: string; hostel: string; material: string; points: number };
type Reward = { earned: number; credits: number; lifetime_points: number };
const READER_ID = "greenflare-qr-reader";

function Scanner() {
  const { loading } = useStudent();
  const params = useSearchParams();
  const router = useRouter();
  const [code, setCode] = useState((params.get("bin") || "").trim().toUpperCase());
  const [bin, setBin] = useState<Bin | null>(null);
  const [lookingUp, setLookingUp] = useState(false);
  const [busy, setBusy] = useState(false);
  const [camera, setCamera] = useState(false);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<Reward | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scanLockedRef = useRef(false);
  const cameraRequestRef = useRef(false);

  const stopCamera = useCallback(async () => {
    cameraRequestRef.current = false;
    const scanner = scannerRef.current;
    scannerRef.current = null;
    if (scanner) {
      try { if (scanner.isScanning) await scanner.stop(); } catch { /* already stopped */ }
      try { scanner.clear(); } catch { /* unmounted */ }
    }
    setCamera(false);
    setStarting(false);
  }, []);

  useEffect(() => { return () => {
    cameraRequestRef.current = false;
    const scanner = scannerRef.current;
    scannerRef.current = null;
    if (scanner) {
      void (async () => {
        try { if (scanner.isScanning) await scanner.stop(); } catch { /* ignore */ }
        try { scanner.clear(); } catch { /* ignore */ }
      })();
    }
  }; }, []);

  useEffect(() => {
    let alive = true;
    if (!code) { setBin(null); setLookingUp(false); return; }
    setLookingUp(true);
    setBin(null);
    void (async () => {
      const { data } = await supabase.from("gf_bins")
        .select("name,hostel,material,points").eq("code", code).eq("active", true).maybeSingle();
      if (alive) { setBin(data as Bin | null); setLookingUp(false); }
    })();
    return () => { alive = false; };
  }, [code]);

  const acceptScan = useCallback((raw: string) => {
    if (scanLockedRef.current) return;
    let value = raw.trim();
    try {
      const url = new URL(value);
      if (url.origin !== window.location.origin || url.pathname.replace(/\/$/, "") !== "/scan") {
        setError("This QR code does not belong to a GreenFlare bin on this website.");
        return;
      }
      value = url.searchParams.get("bin") || "";
    } catch { /* direct bin codes are also accepted */ }
    value = value.trim().toUpperCase();
    if (!/^GF-[A-Z0-9-]{5,90}$/.test(value)) {
      setError("Invalid QR code. Scan the sticker on an official GreenFlare recycling bin.");
      return;
    }
    scanLockedRef.current = true;
    setError("");
    setCode(value);
    setSuccess(null);
    router.replace("/scan?bin=" + encodeURIComponent(value));
    void stopCamera();
  }, [router, stopCamera]);

  async function startCamera() {
    if (starting || cameraRequestRef.current || scannerRef.current) return;
    setError("");
    scanLockedRef.current = false;
    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
      setError("Camera scanning requires HTTPS (or localhost) and a browser with camera access.");
      return;
    }
    cameraRequestRef.current = true;
    setStarting(true);
    setCamera(true);
    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      if (!cameraRequestRef.current) return;
      // Wait for React to mount the scanner target before opening the camera.
      await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
      if (!cameraRequestRef.current) return;
      const scanner = new Html5Qrcode(READER_ID, { verbose: false });
      scannerRef.current = scanner;
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: (width, height) => {
          const size = Math.max(160, Math.min(270, width - 32, height - 32));
          return { width: size, height: size };
        } },
        decodedText => acceptScan(decodedText),
        () => { /* no QR in this frame */ },
      );
      if (!cameraRequestRef.current) await stopCamera();
      else setStarting(false);
    } catch (cause) {
      await stopCamera();
      const message = cause instanceof Error ? cause.message : String(cause);
      setError(/permission|denied|notallowed/i.test(message)
        ? "Camera permission was denied. Enable camera access for this site in your browser settings."
        : "Couldn't start the camera. Close other camera apps, allow permission, and retry. " + message);
    }
  }

  async function confirm() {
    if (!bin || busy || loading) return;
    setBusy(true);
    setError("");
    try {
      const { data, error: rpcError } = await supabase.rpc("gf_record_recycling", { p_code: code });
      if (rpcError) throw rpcError;
      setSuccess(data as Reward);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not record recycling action");
    } finally { setBusy(false); }
  }

  return <GreenShell><div className="gf-screen gf-scan-screen"><header className="gf-screen-intro"><span className="gf-kicker">SCAN A COLLECTION POINT</span><h1>Make this action count.</h1><p>Open your camera, scan a registered bin and confirm your recycling action.</p></header>
    <section className="gf-panel gf-scan-panel"><div className="gf-camera-stage">
      {camera ? <div id={READER_ID} style={{width:'100%',minHeight:235,overflow:'hidden',borderRadius:16}} aria-label="QR camera scanner" /> : <div><ScanLine size={64} strokeWidth={1.5}/><p>Ready when you are</p></div>}
    </div>
    {loading?<p className="gf-muted">Checking your account…</p>:success?<div className="gf-scan-success"><CheckCircle2 size={42} color="#258457"/><strong>+{success.earned}</strong><h2>Action recorded!</h2><p>Green Score: {success.lifetime_points.toLocaleString()} · Credits: {success.credits.toLocaleString()}</p><Link className="gf-button dark" href="/account">View your progress <ArrowRight size={17}/></Link></div>:<>
      <div className="gf-scanner-actions">{!camera?<button className="gf-button dark" type="button" onClick={()=>void startCamera()} disabled={starting}><Camera size={19}/> Open QR camera</button>:<button className="gf-button secondary" type="button" disabled={starting} onClick={()=>void stopCamera()}>{starting?'Opening camera…':'Stop camera'}</button>}</div>
      <div className="gf-scanner-bin"><label className="gf-label" htmlFor="gf-bin-code">Bin code</label><input id="gf-bin-code" className="gf-field" value={code} onChange={e=>{setCode(e.target.value.trim().toUpperCase());setSuccess(null)}} placeholder="Scan or enter a registered bin code" />
      {lookingUp?<p className="gf-muted">Looking up the collection point…</p>:bin?<div className="gf-success"><b>{bin.name}</b><div>{bin.hostel} · {bin.material} · +{bin.points} Green Score</div></div>:code.length>4?<div className="gf-error">Unknown or inactive bin. Check the code and try again.</div>:null}</div>
      {error&&<div className="gf-error" role="alert">{error}</div>}
      <button className="gf-button dark" type="button" style={{width:'100%',marginTop:10}} disabled={!bin||busy||lookingUp} onClick={()=>void confirm()}>{busy?'Recording…':'Confirm recycling action'} <ArrowRight size={18}/></button>
    </>}
    </section><p className="gf-scan-note"><ShieldCheck size={16} style={{verticalAlign:'middle'}}/> For the pilot, rewarded scans are limited to one every 10 minutes and up to 12 each day. Scans are participation records, not independent proof of deposited material.</p>
   </div></GreenShell>;

}
export default function Page() { return <Suspense fallback={<p>Opening scanner…</p>}><Scanner /></Suspense>; }
