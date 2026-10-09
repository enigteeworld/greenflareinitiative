import Link from "next/link";
import { Leaf } from "lucide-react";

const footerLinks = {
  platform: [
    { label: "Submit Action", href: "/submit" },
    { label: "View Leaderboard", href: "/leaderboard" },
    { label: "Review Impact", href: "/verify" },
    { label: "My Account", href: "/account" },
  ],
  community: [
    { label: "About", href: "/#about" },
    { label: "How It Works", href: "/#how-it-works" },
    { label: "Impact Areas", href: "/#impact" },
    { label: "Log In", href: "/auth" },
  ],
  connect: [
    { label: "X (Twitter)", href: "#" },
    { label: "Telegram", href: "#" },
    { label: "contact@greenflare.org", href: "mailto:contact@greenflare.org" },
  ],
};

export default function Footer() {
  return (
    <footer
      className="relative w-full overflow-hidden"
      style={{ backgroundColor: "#104634" }}
    >
      <div
        className="pointer-events-none absolute top-10 left-12 hidden select-none font-serif text-[80px] lg:block"
        style={{ color: "rgba(245, 243, 239, 0.04)" }}
      >
        GreenFlare
      </div>

      <div className="relative mx-auto max-w-[1400px] px-5 py-16 md:px-12 md:py-20">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          <div>
            <Link href="/" className="flex items-center gap-2">
              <Leaf className="h-5 w-5 text-[#F5F3EF]" />
              <span className="font-serif text-[22px] text-[#F5F3EF]">
                GreenFlare
              </span>
            </Link>

            <p className="mt-3 font-sans text-[15px] leading-relaxed text-[rgba(245,243,239,0.60)]">
              Verified real-world impact since 2025.
            </p>
          </div>

          <div>
            <h4 className="mb-4 font-sans text-[15px] font-medium text-[#F5F3EF]">
              Platform
            </h4>
            <ul className="space-y-3">
              {footerLinks.platform.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="font-sans text-[15px] text-[rgba(245,243,239,0.60)] transition-colors duration-200 hover:text-[#F5F3EF]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-sans text-[15px] font-medium text-[#F5F3EF]">
              Community
            </h4>
            <ul className="space-y-3">
              {footerLinks.community.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="font-sans text-[15px] text-[rgba(245,243,239,0.60)] transition-colors duration-200 hover:text-[#F5F3EF]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 font-sans text-[15px] font-medium text-[#F5F3EF]">
              Connect
            </h4>
            <ul className="space-y-3">
              {footerLinks.connect.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="font-sans text-[15px] text-[rgba(245,243,239,0.60)] transition-colors duration-200 hover:text-[#F5F3EF]"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-[rgba(245,243,239,0.10)] pt-6 sm:flex-row">
          <p className="font-sans text-[13px] text-[rgba(245,243,239,0.40)]">
            &copy; 2026 GreenFlare. All rights reserved.
          </p>
          <p className="font-sans text-[13px] text-[rgba(245,243,239,0.40)]">
            Nigeria
          </p>
        </div>
      </div>
    </footer>
  );
}