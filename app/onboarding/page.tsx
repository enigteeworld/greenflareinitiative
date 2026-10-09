import OnboardingPageClient from "./OnboardingPageClient";

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  const next = params.next || "/account";

  return <OnboardingPageClient next={next} />;
}