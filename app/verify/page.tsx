"use client";

import { useState } from "react";

function isAddress(v: string) {
  return /^0x[a-fA-F0-9]{40}$/.test(v.trim());
}

export default function VerifyPage() {
  const [addr, setAddr] = useState("");

  const trimmed = addr.trim();
  const ok = isAddress(trimmed);

  const walletUrl = ok
    ? `https://coston2-explorer.flare.network/address/${trimmed}`
    : null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-semibold">Verify On-chain</h1>
      <p className="mt-3 text-sm text-white/70">
        Enter a wallet address to view its activity on Flare Coston2 Explorer.
        Approved GreenFlare actions will be visible via contract transactions/events.
      </p>

      <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5">
        <label className="text-sm font-semibold">Wallet address</label>
        <input
          value={addr}
          onChange={(e) => setAddr(e.target.value)}
          placeholder="0x..."
          className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none"
        />

        <div className="mt-4 flex flex-col sm:flex-row gap-3">
          <a
            href={walletUrl || "#"}
            target="_blank"
            rel="noreferrer"
            className={`rounded-xl px-5 py-3 text-sm font-semibold text-center border border-white/10 ${
              ok ? "bg-white/10 hover:bg-white/15" : "bg-white/5 opacity-50 pointer-events-none"
            }`}
          >
            View on Explorer ↗
          </a>

          <a
            href="https://coston2-explorer.flare.network/"
            target="_blank"
            rel="noreferrer"
            className="rounded-xl px-5 py-3 text-sm font-semibold text-center border border-white/10 bg-white/5 hover:bg-white/10"
          >
            Open Coston2 Explorer ↗
          </a>
        </div>

        {!ok && trimmed.length > 0 ? (
          <p className="mt-3 text-xs text-white/60">
            Please enter a valid address starting with 0x and 40 hex characters.
          </p>
        ) : null}
      </div>
    </div>
  );
}

