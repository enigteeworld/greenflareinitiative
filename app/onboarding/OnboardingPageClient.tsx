"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Props = {
  next: string;
};

export default function OnboardingPageClient({ next }: Props) {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [campus, setCampus] = useState("University of Benin");
  const [hostel, setHostel] = useState("");
  const [phone, setPhone] = useState("");

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleContinue(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    if (username.trim().length < 2) {
      setMessage("Please enter a valid username.");
      return;
    }

    try {
      setSaving(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/auth?mode=login&next=/onboarding");
        return;
      }

      const payload = {
        id: user.id,
        auth_user_id: user.id,
        username: username.trim().toLowerCase().replace(/\s+/g, "_"),
        campus: campus.trim(),
        hostel: hostel.trim() || null,
        phone: phone.trim() || null,
        onboarding_complete: true,
        onboarding_completed: true,
      };

      const { error } = await supabase.from("profiles").upsert(payload);

      if (error) {
        setMessage(error.message);
        return;
      }

      router.push(next || "/account");
      router.refresh();
    } catch {
      setMessage("Unable to save onboarding right now.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main
      className="min-h-screen"
      style={{
        background: "#f4f1ec",
        color: "#14532d",
      }}
    >
      <section className="mx-auto w-full max-w-[860px] px-6 pb-16 pt-28 sm:px-8 sm:pb-20 sm:pt-32">
        <div className="mx-auto max-w-[740px]">
          <div className="text-center">
            <h1
              className="font-serif text-[34px] leading-tight sm:text-[52px]"
              style={{ color: "#14532d" }}
            >
              Complete your profile
            </h1>

            <p
              className="mx-auto mt-4 max-w-[560px] text-[16px] leading-[1.7] sm:text-[18px]"
              style={{ color: "#5c5650" }}
            >
              This helps GreenFlare connect submissions, QR/bin actions, and future
              trust score to a real participant profile.
            </p>
          </div>

          <form onSubmit={handleContinue} className="mt-12 space-y-6 sm:mt-14 sm:space-y-8">
            <Field label="Username">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Pick a username"
                className="h-16 w-full rounded-[16px] border px-6 text-[17px] outline-none sm:h-[72px] sm:rounded-[18px] sm:px-7 sm:text-[18px]"
                style={inputStyle}
              />
            </Field>

            <Field label="Campus">
              <input
                type="text"
                value={campus}
                onChange={(e) => setCampus(e.target.value)}
                placeholder="Your campus"
                className="h-16 w-full rounded-[16px] border px-6 text-[17px] outline-none sm:h-[72px] sm:rounded-[18px] sm:px-7 sm:text-[18px]"
                style={inputStyle}
              />
            </Field>

            <Field label="Hostel (optional)">
              <input
                type="text"
                value={hostel}
                onChange={(e) => setHostel(e.target.value)}
                placeholder="e.g. Hall 4"
                className="h-16 w-full rounded-[16px] border px-6 text-[17px] outline-none sm:h-[72px] sm:rounded-[18px] sm:px-7 sm:text-[18px]"
                style={inputStyle}
              />
            </Field>

            <Field label="Phone (optional)">
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Your phone number"
                className="h-16 w-full rounded-[16px] border px-6 text-[17px] outline-none sm:h-[72px] sm:rounded-[18px] sm:px-7 sm:text-[18px]"
                style={inputStyle}
              />
            </Field>

            {message ? (
              <div
                className="rounded-[16px] border px-4 py-3 text-sm sm:rounded-[18px] sm:px-5 sm:py-4 sm:text-base"
                style={{
                  background: "#ede7df",
                  borderColor: "#d8cfc3",
                  color: "#7f1d1d",
                }}
              >
                {message}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={saving}
              className="h-16 w-full rounded-[16px] text-[18px] font-medium transition disabled:opacity-70 sm:h-[72px] sm:rounded-[18px] sm:text-[20px]"
              style={{
                background: "#0b0b10",
                color: "#f8f6f2",
              }}
            >
              {saving ? "Saving..." : "Continue"}
            </button>
          </form>

          <div
            className="mt-12 rounded-[24px] px-6 py-6 sm:mt-16 sm:rounded-[28px] sm:px-10 sm:py-10"
            style={{ background: "#eae3db" }}
          >
            <h2
              className="text-[20px] font-semibold sm:text-[24px]"
              style={{ color: "#14532d" }}
            >
              Why onboarding matters
            </h2>

            <ul className="mt-5 space-y-4 sm:mt-6 sm:space-y-5">
              <Bullet>Your submissions become tied to your real participant record.</Bullet>
              <Bullet>Bin scans can later map cleanly to campus and hostel context.</Bullet>
              <Bullet>This prepares the system for dashboard, trust score, and rewards.</Bullet>
            </ul>
          </div>
        </div>
      </section>
    </main>
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
      <label
        className="mb-3 block text-[18px] font-semibold sm:mb-4 sm:text-[24px]"
        style={{ color: "#14532d" }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

function Bullet({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-4">
      <span
        className="mt-2.5 h-3 w-3 shrink-0 rounded-full sm:mt-3 sm:h-4 sm:w-4"
        style={{ background: "#d3912c" }}
      />
      <span
        className="text-[16px] leading-[1.7] sm:text-[20px] sm:leading-[1.6]"
        style={{ color: "#5c5650" }}
      >
        {children}
      </span>
    </li>
  );
}

const inputStyle: React.CSSProperties = {
  background: "#ddd7ce",
  borderColor: "#cbc2b7",
  color: "#3f3a35",
};