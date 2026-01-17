import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";
import { ethers } from "ethers";

const REGISTRY_ADDRESS = process.env.NEXT_PUBLIC_REGISTRY_ADDRESS as string;
const RPC_URL = process.env.NEXT_PUBLIC_COSTON2_RPC as string;
const ADMIN_PRIVATE_KEY = process.env.ADMIN_PRIVATE_KEY as string;

// Minimal ABI (MUST be on one line)
const ABI = [
  "function recordImpact(address user,uint8 actionType,uint256 points,bytes32 proofHash," +
  "string locationCell)"
];


// Must match enum order in your contract
function actionToEnum(action: string): number {
  if (action === "TREE") return 0;
  if (action === "RECYCLE") return 1;
  return 2; // CLEANUP
}

export async function POST(req: Request) {
  try {
    const { submissionId, points } = await req.json();

    if (!submissionId) {
      return NextResponse.json({ error: "Missing submissionId" }, { status: 400 });
    }

    const pts = Number(points);
    if (!pts || pts <= 0) {
      return NextResponse.json({ error: "Points must be greater than 0" }, { status: 400 });
    }

    if (!REGISTRY_ADDRESS || !RPC_URL || !ADMIN_PRIVATE_KEY) {
      return NextResponse.json(
        { error: "Missing env variables (registry / rpc / admin key)" },
        { status: 500 }
      );
    }

    const sb = supabaseServer();

    // Fetch submission
    const { data: sub, error } = await sb
      .from("submissions")
      .select("*")
      .eq("id", submissionId)
      .single();

    if (error || !sub) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    if (sub.status !== "pending") {
      return NextResponse.json({ error: "Submission not pending" }, { status: 400 });
    }

    // Create proof hash
    const payload = JSON.stringify({
      id: sub.id,
      user_address: sub.user_address,
      action_type: sub.action_type,
      proof_url: sub.proof_url,
      description: sub.description,
      location_cell: sub.location_cell,
      created_at: sub.created_at,
    });

const proofHash = ethers.keccak256(
  ethers.toUtf8Bytes(payload)
);

    // Send transaction to Flare
const provider = new ethers.JsonRpcProvider(RPC_URL);
   const wallet = new ethers.Wallet(ADMIN_PRIVATE_KEY, provider);
    const contract = new ethers.Contract(REGISTRY_ADDRESS, ABI, wallet);

    const tx = await contract.recordImpact(
      sub.user_address,
      actionToEnum(sub.action_type),
      pts,
      proofHash,
      sub.location_cell || ""
    );

    await tx.wait();

    // Update database
    const { error: updateError } = await sb
      .from("submissions")
      .update({
        status: "approved",
        points: pts,
        tx_hash: tx.hash,
      })
      .eq("id", submissionId);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      txHash: tx.hash,
      proofHash,
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || "Server error" },
      { status: 500 }
    );
  }
}

