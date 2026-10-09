import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { getAdmin } from "@/app/lib/adminServer";

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char] || char);
}

export async function GET(req: Request) {
  const { db, user } = await getAdmin(req);
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const code = new URL(req.url).searchParams.get("code") || "";
  const { data, error } = await db.from("gf_bins")
    .select("code,name,hostel,material").eq("code", code).maybeSingle();
  if (error) return NextResponse.json({ error: "Bin lookup failed" }, { status: 500 });
  if (!data) return NextResponse.json({ error: "Bin not found" }, { status: 404 });
  const target = new URL("/scan?bin=" + encodeURIComponent(data.code), req.url).toString();
  const qr = await QRCode.toDataURL(target, { errorCorrectionLevel: "H", width: 320, margin: 2 });
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>GreenFlare Bin Sticker</title><style>body{font-family:Arial,sans-serif;text-align:center;max-width:440px;margin:30px auto;color:#104437}.sticker{border:4px solid #115e4c;border-radius:24px;padding:30px}h1{margin-bottom:2px}.qr{width:min(100%,320px);height:auto}small{color:#58756c;overflow-wrap:anywhere}button{margin:20px;padding:12px 20px;border-radius:8px;cursor:pointer}@media print{button{display:none}body{margin:0 auto}}</style></head><body><div class="sticker"><h1>GreenFlare.</h1><h2>${escapeHtml(data.name)}</h2><img class="qr" alt="QR code for ${escapeHtml(data.code)}" src="${qr}"><h3>SCAN TO RECYCLE</h3><p>${escapeHtml(data.hostel)} · ${escapeHtml(data.material)}</p><small>${escapeHtml(data.code)}</small></div><button onclick="window.print()">Print sticker</button></body></html>`;
  return new NextResponse(html, { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff", "Content-Security-Policy": "default-src 'none'; style-src 'unsafe-inline'; img-src data:; script-src 'unsafe-inline'; base-uri 'none'; frame-ancestors 'none'" } });
}
