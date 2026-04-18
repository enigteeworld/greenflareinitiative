import SubmitPageClient from "./SubmitPageClient";

export default async function SubmitPage({
  searchParams,
}: {
  searchParams: Promise<{ bin?: string }>;
}) {
  const params = await searchParams;
  const initialBin = typeof params.bin === "string" ? params.bin : "";

  return <SubmitPageClient initialBin={initialBin} />;
}