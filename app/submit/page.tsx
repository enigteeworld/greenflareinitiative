"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type ActionType = "TREE" | "RECYCLE" | "CLEANUP";

type FeedItem = {
  id: string;
  action_type: string;
  location_cell: string | null;
  created_at: string;
  points: number | null;
  bin_code?: string | null;
};

type BinOption = {
  code: string;
  label: string;
  hall: string;
  category: string;
  defaultAction: ActionType;
  defaultLocation: string;
};

const HALL4_BINS: BinOption[] = [
  {
    code: "GF-UNIBEN-H4-PL-001",
    label: "Hall 4 • Plastic Bin",
    hall: "Hall 4",
    category: "Plastic",
    defaultAction: "RECYCLE",
    defaultLocation: "UNIBEN • Hall 4",
  },
  {
    code: "GF-UNIBEN-H4-SA-001",
    label: "Hall 4 • Sachet Bin",
    hall: "Hall 4",
    category: "Sachet",
    defaultAction: "RECYCLE",
    defaultLocation: "UNIBEN • Hall 4",
  },
  {
    code: "GF-UNIBEN-H4-GW-001",
    label: "Hall 4 • General Waste Bin",
    hall: "Hall 4",
    category: "General Waste",
    defaultAction: "CLEANUP",
    defaultLocation: "UNIBEN • Hall 4",
  },
];

function actionLabel(actionType?: string | null) {
  switch (actionType) {
    case "TREE":
      return "🌳 Tree Planting";
    case "RECYCLE":
      return "♻️ Recycling / Sorted Disposal";
    case "CLEANUP":
      return "🧹 Community Cleanup / Waste Collection";
    default:
      return "🌱 Impact Action";
  }
}

function actionHelp(actionType: ActionType) {
  switch (actionType) {
    case "TREE":
      return "Use this for planting trees or related restoration activity.";
    case "RECYCLE":
      return "Use this for plastic, sachet, or sorted waste disposal — especially with designated bins.";
    case "CLEANUP":
      return "Use this for clearing waste from an area, sweeping, bagging, or general cleanup activity.";
    default:
      return "";
  }
}

export default function SubmitPage() {
  const searchParams = useSearchParams();
  const binFromQuery = searchParams.get("bin") || "";

  const [participantId, setParticipantId] = useState("");
  const [actionType, setActionType] = useState<ActionType>("RECYCLE");
  const [binCode, setBinCode] = useState("");
  const [locationCell, setLocationCell] = useState("");
  const [description, setDescription] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const [recent, setRecent] = useState<FeedItem[]>([]);
  const [loadingRecent, setLoadingRecent] = useState(true);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const selectedBin = useMemo(
    () => HALL4_BINS.find((b) => b.code === binCode) || null,
    [binCode]
  );

  const participantOk = useMemo(
    () => participantId.trim().length >= 3,
    [participantId]
  );

  useEffect(() => {
    if (!binFromQuery) return;

    const matched = HALL4_BINS.find((b) => b.code === binFromQuery);
    if (matched) {
      setBinCode(matched.code);
      setActionType(matched.defaultAction);
      setLocationCell((prev) => prev || matched.defaultLocation);
    }
  }, [binFromQuery]);

  useEffect(() => {
    if (!selectedBin) return;

    if (!locationCell.trim()) {
      setLocationCell(selectedBin.defaultLocation);
    }
  }, [selectedBin, locationCell]);

  useEffect(() => {
    async function loadRecent() {
      setLoadingRecent(true);

      const { data } = await supabase
        .from("submissions")
        .select("id, action_type, location_cell, created_at, points, bin_code")
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

    if (!participantOk) {
      setMsg("❌ Please enter a valid participant ID.");
      return;
    }

    if (!proofFile) {
      setMsg("❌ Please upload a proof image.");
      return;
    }

    try {
      setSubmitting(true);

      const ext = proofFile.name.split(".").pop() || "jpg";
      const filePath = `proofs/${Date.now()}_${Math.random()
        .toString(16)
        .slice(2)}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("proofs")
        .upload(filePath, proofFile, { upsert: false });

      if (uploadError) throw new Error(uploadError.message);

      const { data: pub } = supabase.storage.from("proofs").getPublicUrl(filePath);
      const proofUrl = pub?.publicUrl;

      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_address: participantId.trim(),
          action_type: actionType,
          location_cell: locationCell.trim(),
          description: description.trim(),
          proof_url: proofUrl,
          bin_code: binCode || null,
          submission_mode: binCode ? "bin_drop" : "direct",
        }),
      });

      const j = await res.json();
      if (!res.ok) throw new Error(j?.error || "Submission failed");

      setMsg("✅ Submitted! Your action is pending verification.");
      setParticipantId("");
      setActionType(binCode ? actionType : "RECYCLE");
      setLocationCell(selectedBin?.defaultLocation || "");
      setDescription("");
      setProofFile(null);

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err: any) {
      setMsg(`❌ ${err?.message || "Something went wrong"}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ background: "var(--bg)", color: "var(--text)" }}>
      <div className="mx-auto max-w-7xl px-4 py-8 md:py-10">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
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
              Submit impact proof • UNIBEN pilot • Hall 4 ready
            </div>

            <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
              Submit an Impact Action
            </h1>

            <p
              className="mt-2 max-w-3xl text-sm md:text-base"
              style={{ color: "var(--muted)" }}
            >
              Submit a recycling, cleanup, or tree planting action. Designated
              Hall 4 bins are optional, but they will qualify for stronger
              verification and higher reward weighting.
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
              href="/leaderboard"
              className="rounded-xl px-4 py-2 text-sm font-semibold transition"
              style={{
                border: "1px solid var(--border)",
                background: "var(--panel)",
                color: "var(--text)",
              }}
            >
              Leaderboard
            </Link>
          </div>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-12">
          <div
            className="rounded-2xl p-5 md:p-6 lg:col-span-8"
            style={{
              border: "1px solid var(--border)",
              background: "var(--panel)",
              boxShadow: "var(--shadow)",
            }}
          >
            <form onSubmit={onSubmit} className="space-y-4">
              <Field label="Participant ID">
                <input
                  value={participantId}
                  onChange={(e) => setParticipantId(e.target.value)}
                  placeholder="Your name, nickname, phone, or email"
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                  style={{
                    border: "1px solid var(--border)",
                    background: "var(--panel2)",
                    color: "var(--text)",
                  }}
                />
                <div
                  className="mt-2 text-xs"
                  style={{
                    color: participantId.length
                      ? participantOk
                        ? "var(--muted)"
                        : "#ef4444"
                      : "var(--muted2)",
                  }}
                >
                  {participantId.length
                    ? participantOk
                      ? "Looks good ✅"
                      : "Please enter at least 3 characters ❌"
                    : "Temporary MVP identity until full account system goes live."}
                </div>
              </Field>

              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Designated Bin (optional)">
                  <select
                    value={binCode}
                    onChange={(e) => {
                      const nextCode = e.target.value;
                      setBinCode(nextCode);

                      const matched = HALL4_BINS.find((b) => b.code === nextCode);
                      if (matched) {
                        setActionType(matched.defaultAction);
                        setLocationCell(matched.defaultLocation);
                      }
                    }}
                    className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                    style={{
                      border: "1px solid var(--border)",
                      background: "var(--panel2)",
                      color: "var(--text)",
                    }}
                  >
                    <option value="">No designated bin</option>
                    {HALL4_BINS.map((bin) => (
                      <option key={bin.code} value={bin.code}>
                        {bin.label}
                      </option>
                    ))}
                  </select>
                  <div className="mt-2 text-xs" style={{ color: "var(--muted2)" }}>
                    Using a designated bin is optional, but it qualifies for
                    stronger verification and higher points later.
                  </div>
                </Field>

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
                    <option value="RECYCLE">♻️ Recycling / Sorted Disposal</option>
                    <option value="CLEANUP">🧹 Community Cleanup / Waste Collection</option>
                    <option value="TREE">🌳 Tree Planting / Restoration</option>
                  </select>
                  <div className="mt-2 text-xs" style={{ color: "var(--muted2)" }}>
                    {actionHelp(actionType)}
                  </div>
                </Field>
              </div>

              {selectedBin ? (
                <div
                  className="rounded-xl p-4"
                  style={{
                    border: "1px solid rgba(16,185,129,0.24)",
                    background: "var(--bg2)",
                  }}
                >
                  <div className="text-sm font-semibold">
                    Selected Bin: {selectedBin.label}
                  </div>
                  <div className="mt-1 text-xs" style={{ color: "var(--muted)" }}>
                    Bin Code: {selectedBin.code} • Category: {selectedBin.category}
                  </div>
                </div>
              ) : null}

              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Location Cell (optional)">
                  <input
                    value={locationCell}
                    onChange={(e) => setLocationCell(e.target.value)}
                    placeholder="e.g. UNIBEN • Hall 4"
                    className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                    style={{
                      border: "1px solid var(--border)",
                      background: "var(--panel2)",
                      color: "var(--text)",
                    }}
                  />
                </Field>

                <Field label="Submission Mode">
                  <input
                    value={binCode ? "Designated Bin Drop" : "Direct Submission"}
                    disabled
                    className="w-full rounded-xl px-4 py-3 text-sm outline-none opacity-80"
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
                  placeholder="What did you do? What was collected, cleared, or planted?"
                  className="min-h-[120px] w-full rounded-xl px-4 py-3 text-sm outline-none"
                  style={{
                    border: "1px solid var(--border)",
                    background: "var(--panel2)",
                    color: "var(--text)",
                  }}
                />
              </Field>

              <Field label="Upload Proof (image)">
                <div className="space-y-3">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => setProofFile(e.target.files?.[0] || null)}
                    className="hidden"
                    id="proof-upload"
                  />

                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <label
                      htmlFor="proof-upload"
                      className="inline-flex cursor-pointer items-center justify-center rounded-xl px-4 py-3 text-sm font-semibold transition"
                      style={{
                        border: "1px solid var(--border)",
                        background: "var(--panel2)",
                        color: "var(--text)",
                      }}
                    >
                      Choose Image
                    </label>

                    <div className="text-sm" style={{ color: "var(--muted)" }}>
                      {proofFile ? proofFile.name : "No file selected"}
                    </div>
                  </div>

                  <div className="text-xs" style={{ color: "var(--muted2)" }}>
                    For the Hall 4 pilot, try to include the bin in the photo
                    where possible.
                  </div>
                </div>
              </Field>

              <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
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
                  style={{
                    color: msg?.startsWith("❌") ? "#ef4444" : "var(--muted)",
                  }}
                >
                  {msg}
                </div>
              </div>
            </form>
          </div>

          <div className="grid gap-4 lg:col-span-4">
            <Card title="Submission Checklist">
              <ul className="mt-3 space-y-2 text-sm" style={{ color: "var(--muted)" }}>
                <li>• Choose the correct action type.</li>
                <li>• Select the correct Hall 4 bin if used.</li>
                <li>• Upload one clear proof image.</li>
                <li>• Add location notes if possible.</li>
                <li>• Keep description short and honest.</li>
              </ul>
            </Card>

            <Card title="Hall 4 Pilot Bins">
              <div className="mt-3 space-y-3">
                {HALL4_BINS.map((bin) => (
                  <div
                    key={bin.code}
                    className="rounded-xl p-4"
                    style={{
                      border: "1px solid var(--border)",
                      background: "var(--panel2)",
                    }}
                  >
                    <div className="text-sm font-semibold">{bin.label}</div>
                    <div className="mt-1 text-xs" style={{ color: "var(--muted)" }}>
                      {bin.category} • {bin.code}
                    </div>
                  </div>
                ))}
              </div>
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
                        <div className="text-sm font-semibold">
                          {actionLabel(r.action_type)}
                        </div>
                        <div className="text-xs" style={{ color: "var(--muted2)" }}>
                          {new Date(r.created_at).toLocaleDateString()}
                        </div>
                      </div>

                      <div className="mt-1 text-xs" style={{ color: "var(--muted)" }}>
                        {r.location_cell || "Unknown location"}
                      </div>

                      {r.bin_code ? (
                        <div className="mt-2 text-xs" style={{ color: "var(--muted2)" }}>
                          Bin: {r.bin_code}
                        </div>
                      ) : null}

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

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="text-sm font-semibold" style={{ color: "var(--text)" }}>
        {label}
      </div>
      <div className="mt-2">{children}</div>
    </div>
  );
}

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
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
      <div
        className="h-4 w-2/3 rounded"
        style={{ background: "rgba(255,255,255,0.12)" }}
      />
      <div
        className="mt-2 h-3 w-full rounded"
        style={{ background: "rgba(255,255,255,0.10)" }}
      />
    </div>
  );
}