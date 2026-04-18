import AuthPageClient from "./AuthPageClient";

type AuthMode = "login" | "signup";

export default async function AuthPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; mode?: string }>;
}) {
  const params = await searchParams;

  const nextPath =
    typeof params.next === "string" && params.next.trim()
      ? params.next
      : "/account";

  const initialMode: AuthMode =
    params.mode === "signup" ? "signup" : "login";

  return (
    <AuthPageClient
      initialNextPath={nextPath}
      initialMode={initialMode}
    />
  );
}