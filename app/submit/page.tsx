"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

const ACTIONS = [
  { value: "TREE", label: "🌳 Tree Planting" },
  { value: "RECYCLE", label: "♻️ Recycling" },
  { value: "CLEANUP", label: "🧹 Community Cleanup" },
];

export default function SubmitPage() {
  const [userAddress, setUserAddress] = useState("");
  const [actionType, setActionType] = useState("TREE");
  const [description, setDescription] = useState("");
  const [locationCell, setLocationCell] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  async function uploadProof(file: File): Promise<string> {
    const ext = file.name.split(".").pop() || "jpg";
    const fileName = `${crypto.randomUUID()}.${ext}`;
    const filePath = `proofs/${fileName}`;

    const { error } = await supabase.storage
      .from("proofs")
      .upload(filePath, file);

    if (error) throw new Error(error.message);

    const { data } = supabase.storage
      .from("proofs")
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  async function submit() {
    try {
      setLoading(true);
      setMsg("");

      if (!userAddress.trim()) throw new Error("Wallet address is required");
      if (!file) throw new Error("Please upload a proof image");

      const proofUrl = await uploadProof(file);

      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_address: userAddress.trim(),
          action_type: actionType,
          description,
          proof_url: proofUrl,
          location_cell: locationCell,
        }),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Submission failed");

      setMsg("✅ Action submitted! Awaiting verification.");
      setDescription("");
      setLocationCell("");
      setFile(null);
    } catch (e: any) {
      setMsg(`❌ ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold">Submit an Environmental Action</h1>
      <p className="mt-3 text-gray-600">
        Upload proof of your environmental action. Once verified, it will be
        permanently recorded on-chain via Flare.
      </p>

      <div className="mt-8 space-y-5">
        <div>
          <label className="text-sm font-medium">Wallet Address</label>
          <input
            className="mt-1 w-full border rounded-md p-3"
            placeholder="0x..."
            value={userAddress}
            onChange={(e) => setUserAddress(e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm font-medium">Action Type</label>
          <select
            className="mt-1 w-full border rounded-md p-3"
            value={actionType}
            onChange={(e) => setActionType(e.target.value)}
          >
            {ACTIONS.map((a) => (
              <option key={a.value} value={a.value}>
                {a.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-medium">Location</label>
          <input
            className="mt-1 w-full border rounded-md p-3"
            placeholder="e.g. Lagos – Yaba"
            value={locationCell}
            onChange={(e) => setLocationCell(e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm font-medium">Description (optional)</label>
          <textarea
            className="mt-1 w-full border rounded-md p-3"
            rows={4}
            placeholder="Briefly describe what you did"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm font-medium">Upload Proof</label>
          <input
            type="file"
            className="mt-1"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
          />
          <p className="text-xs text-gray-500 mt-1">
            Photo or short video showing your action
          </p>
        </div>

        <button
          onClick={submit}
          disabled={loading}
          className="w-full mt-4 px-6 py-3 rounded-md bg-green-600 text-white font-semibold 
hover:bg-green-700 disabled:opacity-60"
        >
          {loading ? "Submitting..." : "Submit Action"}
        </button>

        {msg && <p className="text-sm mt-3">{msg}</p>}
      </div>
    </main>
  );
}

