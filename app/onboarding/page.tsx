import OnboardingPageClient from "./OnboardingPageClient";

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;

  const nextPath =
    typeof params.next === "string" && params.next.trim()
      ? params.next
      : "/account";

  return <OnboardingPageClient initialNextPath={nextPath} />;
}