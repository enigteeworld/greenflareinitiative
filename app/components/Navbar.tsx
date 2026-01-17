import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="border-b bg-white">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Brand */}
        <Link
          href="/"
          className="text-xl font-bold text-gray-900 hover:text-green-700 transition"
        >
          GreenFlare Initiative <span className="text-green-600"></span>
        </Link>

        {/* Navigation */}
        <div className="flex gap-6 text-sm font-semibold text-gray-800">
          <Link
            href="/"
            className="hover:text-green-700 transition"
          >
            Home
          </Link>

          <Link
            href="/submit"
            className="hover:text-green-700 transition"
          >
            Submit Action
          </Link>

          <Link
            href="/admin"
            className="hover:text-green-700 transition"
          >
            Admin
          </Link>
        </div>
      </div>
    </nav>
  );
}

