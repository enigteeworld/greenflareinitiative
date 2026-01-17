"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

type ActionType = "TREE" | "RECYCLE" | "CLEANUP";

type FeedItem = {
  id: string;
  action_type: string;
  location_cell: string | null;
  created_at: string;
  points: number | null;
};

function actionLabel(actionType?: string | null) {
  switch (actionType) {
    case "TREE":
      return "🌳 Tree Planting";
    case "RECYCLE":
      return "♻️ Recycling";
    case "CLEANUP":
      return "🧹 Community Cleanup";
    default:
      return "🌱 Impact Action";
  }
}

export default function SubmitPage() {
  const [wallet, setWallet] = useState("");
  const [actionType, setActionType] = useState<ActionType>("TREE");
  const [locationCell, setLocationCell] = useState("");
  const [description, setDescription] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const [recent, setRecent] = useState<FeedItem[]>([]);
  const [loadingRecent, setLoadingRecent] = useState(true);

  const walletOk = useMemo(() => /^0x[a-fA-F0-9]{40}$/.test(wallet.trim()), [wallet]);

  useEffect(() => {
    async function loadRecent() {
      setLoadingRecent(true);
      const { data } = await supabase
        .from("submissions")
        .select("id, action_type, location_cell, created_at, points")
        .eq("status", "approved")
        .order("created_at", { ascending: false })
        .limit(6);

      setRecent((data || []) as FeedItem[]);
      setLoadingRecent(false);
    }

    loadRecent();
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);

    if (!walletOk) {
      setMsg("❌ Please enter a valid wallet address (0x...)");
      return;
    }

    if (!proofFile) {
      setMsg("❌ Please upload a proof image for the MVP.");
      return;
    }

    try {
      setSubmitting(true);

      // 1) upload proof to supabase storage
      const ext = proofFile.name.split(".").pop() || "jpg";
      const filePath = `proofs/${Date.now()}_${Math.random().toString(16).slice(2)}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("proofs")
        .upload(filePath, proofFile, { upsert: false });

      if (uploadError) throw new Error(uploadError.message);

      const { data: pub } = supabase.storage.from("proofs").getPublicUrl(filePath);
      const proofUrl = pub?.publicUrl;

      // 2) send to API
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_address: wallet.trim(),
          action_type: actionType,
          location_cell: locationCell.trim(),
          description: description.trim(),
          proof_url: proofUrl,
        }),
      });

      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || "Submission failed");

      setMsg("✅ Submitted! Your action is pending verification.");
      setWallet("");
      setActionType("TREE");
      setLocationCell("");
      setDescription("");
      setProofFile(null);
    } catch (err: any) {
      setMsg(`❌ ${err?.message || "Something went wrong"}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ background: "var(--bg)", color: "var(--text)" }}>
      <div className="mx-auto max-w-6xl px-4 py-10">
        {/* Header */}
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <div
              className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs"
              style={{
                borderColor: "var(--border)",
                background: "var(--panel2)",
                color: "var(--muted)",
              }}
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{
                  background: "var(--accent)",
                  boxShadow: "0 0 18px rgba(52,211,153,0.45)",
                }}
              />
              Submit impact proof • Nigeria • Flare Coston2
            </div>

            <h1 className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight">
              Submit an Impact Action
            </h1>
            <p className="mt-2 text-sm md:text-base max-w-2xl" style={{ color: "var(--muted)" }}>
              Plant a tree, recycle, or clean up your community. Upload proof — we verify and record approved impact on-chain.
            </p>
          </div>

          <div className="flex gap-2">
            <Link
              href="/"
              className="rounded-xl px-4 py-2 text-sm font-semibold transition"
              style={{
                border: "1px solid var(--border)",
                background: "var(--panel)",
                color: "var(--text)",
              }}
            >
              ← Home
            </Link>
            <Link
              href="/verify"
              className="rounded-xl px-4 py-2 text-sm font-semibold transition"
              style={{
                border: "1px solid var(--border)",
                background: "var(--panel)",
                color: "var(--text)",
              }}
            >
              Verify On-chain
            </Link>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-12">
          {/* Form */}
          <div
            className="md:col-span-7 rounded-2xl p-6"
            style={{
              border: "1px solid var(--border)",
              background: "var(--panel)",
              boxShadow: "var(--shadow)",
            }}
          >
            <form onSubmit={onSubmit} className="space-y-4">
              <Field label="Wallet Address (test wallet is fine)">
                <input
                  value={wallet}
                  onChange={(e) => setWallet(e.target.value)}
                  placeholder="0x..."
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                  style={{
                    border: "1px solid var(--border)",
                    background: "var(--panel2)",
                    color: "var(--text)",
                  }}
                />
                <div className="mt-2 text-xs" style={{ color: wallet.length ? (walletOk ? "var(--muted)" : "#ef4444") : "var(--muted2)" }}>
                  {wallet.length ? (walletOk ? "Looks good ✅" : "Not a valid address ❌") : "Tip: you can paste any test wallet address for MVP."}
                </div>
              </Field>

              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Action Type">
                  <select
                    value={actionType}
                    onChange={(e) => setActionType(e.target.value as ActionType)}
                    className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                    style={{
                      border: "1px solid var(--border)",
                      background: "var(--panel2)",
                      color: "var(--text)",
                    }}
                  >
                    <option value="TREE">🌳 Tree Planting</option>
                    <option value="RECYCLE">♻️ Recycling</option>
                    <option value="CLEANUP">🧹 Community Cleanup</option>
                  </select>
                </Field>

                <Field label="Location Cell (optional)">
                  <input
                    value={locationCell}
                    onChange={(e) => setLocationCell(e.target.value)}
                    placeholder="e.g. Lagos Mainland • Ikeja"
                    className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                    style={{
                      border: "1px solid var(--border)",
                      background: "var(--panel2)",
                      color: "var(--text)",
                    }}
                  />
                </Field>
              </div>

              <Field label="Short Description (optional)">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What did you do? What was collected/cleared/planted?"
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none min-h-[110px]"
                  style={{
                    border: "1px solid var(--border)",
                    background: "var(--panel2)",
                    color: "var(--text)",
                  }}
                />
              </Field>

              <Field label="Upload Proof (image)">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                  className="block w-full text-sm"
                  style={{ color: "var(--muted)" }}
                />
                <div className="mt-2 text-xs" style={{ color: "var(--muted2)" }}>
                  For MVP: one clear image is enough. Stronger verification is on the roadmap.
                </div>
              </Field>

              <div className="pt-2 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-xl px-5 py-3 text-sm font-semibold transition disabled:opacity-60"
                  style={{
                    background: "var(--accent)",
                    color: "var(--accentText)",
                  }}
                >
                  {submitting ? "Submitting..." : "Submit Action"}
                </button>

                <div
                  className="text-sm"
                  style={{ color: msg?.startsWith("❌") ? "#ef4444" : "var(--muted)" }}
                >
                  {msg}
                </div>
              </div>
            </form>
          </div>

          {/* Right Column: Guidance + Activity */}
          <div className="md:col-span-5 grid gap-4">
            <Card title="Submission Checklist">
              <ul className="mt-3 space-y-2 text-sm" style={{ color: "var(--muted)" }}>
                <li>• Choose the correct action type.</li>
                <li>• Upload one clear proof image.</li>
                <li>• Add location notes if possible.</li>
                <li>• Keep description short and honest.</li>
              </ul>
            </Card>

            <Card title="Recent Verified Activity">
              <div className="mt-3 space-y-3">
                {loadingRecent ? (
                  <>
                    <SkeletonRow />
                    <SkeletonRow />
                    <SkeletonRow />
                  </>
                ) : recent.length === 0 ? (
                  <div className="text-sm" style={{ color: "var(--muted)" }}>
                    No verified actions yet.
                  </div>
                ) : (
                  recent.map((r) => (
                    <div
                      key={r.id}
                      className="rounded-xl p-4"
                      style={{
                        border: "1px solid var(--border)",
                        background: "var(--panel2)",
                      }}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-sm font-semibold">{actionLabel(r.action_type)}</div>
                        <div className="text-xs" style={{ color: "var(--muted2)" }}>
                          {new Date(r.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="mt-1 text-xs" style={{ color: "var(--muted)" }}>
                        {r.location_cell || "Unknown location"}
                      </div>
                      <div className="mt-2 text-xs" style={{ color: "var(--muted2)" }}>
                        Points: {r.points ?? 0}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-sm font-semibold" style={{ color: "var(--text)" }}>
        {label}
      </div>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      className="rounded-2xl p-6"
      style={{
        border: "1px solid var(--border)",
        background: "var(--panel)",
        boxShadow: "var(--shadow)",
      }}
    >
      <div className="text-sm font-semibold">{title}</div>
      {children}
    </div>
  );
}

function SkeletonRow() {
  return (
    <div
      className="rounded-xl p-4"
      style={{
        border: "1px solid var(--border)",
        background: "var(--panel2)",
      }}
    >
      <div className="h-4 w-2/3 rounded" style={{ background: "rgba(255,255,255,0.12)" }} />
      <div className="mt-2 h-3 w-full rounded" style={{ background: "rgba(255,255,255,0.10)" }} />
    </div>
  );
}

