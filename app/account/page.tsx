"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, Trophy, Send, User } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

type Profile = {
  id: string;
  auth_user_id: string | null;
  email: string | null;
  full_name: string | null;
  display_name: string | null;
  phone: string | null;
  campus: string | null;
  hostel: string | null;
  role: string | null;
  trust_score: number | null;
  onboarding_complete: boolean | null;
  onboarding_completed: boolean | null;
};

const nextSteps = [
  "Link submissions to authenticated user IDs",
  "View submission history",
  "Track trust score and reputation tier",
  "Access sponsor-backed rewards",
];

export default function AccountPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    async function loadAccount() {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.user) {
        router.replace("/auth?next=/account");
        return;
      }

      setEmail(session.user.email || null);

      let data: Profile | null = null;

      const byAuthUserId = await supabase
        .from("profiles")
        .select("*")
        .eq("auth_user_id", session.user.id)
        .maybeSingle();

      if (byAuthUserId.data) {
        data = byAuthUserId.data as Profile;
      } else {
        const byId = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .maybeSingle();

        if (byId.data) {
          data = byId.data as Profile;
        }
      }

      const hasCompletedOnboarding =
        data?.onboarding_completed === true || data?.onboarding_complete === true;

      if (!data || !hasCompletedOnboarding) {
        router.replace("/onboarding?next=/account");
        return;
      }

      setProfile(data);
      setLoading(false);
    }

    loadAccount();
  }, [router]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/");
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f3ee] text-[#173126]">
        <div className="mx-auto max-w-6xl px-5 pb-20 pt-32 md:px-12">
          <div className="rounded-xl border border-[rgba(23,49,38,0.08)] bg-[#fcfaf7] p-6 shadow-sm">
            <div className="text-lg font-semibold">Loading account…</div>
          </div>
        </div>
      </div>
    );
  }

  const profileData = [
    { label: "Full Name", value: profile?.full_name || "Not set" },
    { label: "Display Name", value: profile?.display_name || "Not set" },
    { label: "Email", value: profile?.email || email || "Not set" },
    { label: "Phone", value: profile?.phone || "Not set" },
    { label: "Campus", value: profile?.campus || "Not set" },
    { label: "Hostel / Hall", value: profile?.hostel || "Not set" },
    { label: "Role", value: profile?.role || "user" },
    {
      label: "Trust Score",
      value:
        profile?.trust_score !== null && profile?.trust_score !== undefined
          ? String(profile.trust_score)
          : "Coming soon",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f5f3ee]">
      <div className="px-5 pb-10 pt-32 md:px-12 md:pb-12">
        <div className="mx-auto max-w-6xl">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[rgba(15,81,50,0.10)]">
              <User className="h-6 w-6 text-[#0f5132]" />
            </div>

            <div>
              <h1 className="font-serif text-4xl leading-tight text-[#0f5132] md:text-[56px]">
                My Account
              </h1>
            </div>
          </div>

          <p className="text-[17px] text-[rgba(23,49,38,0.70)]">
            Your GreenFlare participant profile.
          </p>
        </div>
      </div>

      <div className="px-5 pb-20 md:px-12">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <div className="rounded-xl border border-[rgba(23,49,38,0.08)] bg-[#fcfaf7] p-6 shadow-sm md:p-8">
                <h2 className="mb-2 font-serif text-3xl text-[#0f5132]">
                  Profile Information
                </h2>

                <p className="mb-6 text-[15px] text-[rgba(23,49,38,0.60)]">
                  Manage your GreenFlare identity and settings.
                </p>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {profileData.map((field) => (
                    <div
                      key={field.label}
                      className="rounded-lg bg-[rgba(234,227,219,0.45)] p-3"
                    >
                      <p className="mb-1 text-[11px] font-medium uppercase tracking-[0.08em] text-[rgba(95,102,72,0.95)]">
                        {field.label}
                      </p>
                      <p className="text-[16px] text-[#0f5132]">{field.value}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    href="/submit"
                    className="inline-flex h-10 items-center gap-2 rounded-full bg-[#11131a] px-5 text-sm font-medium text-[#f5f3ee] transition-colors duration-300 hover:bg-[#0f5132]"
                  >
                    <Send className="h-4 w-4" />
                    <span>Submit Action</span>
                  </Link>

                  <Link
                    href="/leaderboard"
                    className="inline-flex h-10 items-center gap-2 rounded-full border border-[rgba(23,49,38,0.10)] bg-[#fcfaf7] px-5 text-sm font-medium text-[#0f5132] transition-colors duration-300 hover:border-[#d49333]"
                  >
                    <Trophy className="h-4 w-4" />
                    <span>Leaderboard</span>
                  </Link>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="inline-flex h-10 items-center gap-2 rounded-full border border-[rgba(23,49,38,0.10)] bg-[#fcfaf7] px-5 text-sm font-medium text-[rgba(23,49,38,0.65)] transition-colors duration-300 hover:text-[#173126]"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4">
              <div className="rounded-xl border border-[rgba(23,49,38,0.08)] bg-[#fcfaf7] p-6 shadow-sm lg:sticky lg:top-24">
                <h3 className="mb-4 text-[22px] font-medium text-[#0f5132]">
                  Next Steps
                </h3>

                <ul className="space-y-3">
                  {nextSteps.map((step) => (
                    <li key={step} className="flex items-start gap-3">
                      <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#d49333]" />
                      <span className="text-[15px] text-[rgba(23,49,38,0.70)]">
                        {step}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}