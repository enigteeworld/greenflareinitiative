import Link from "next/link";

export default function Home() {
  return (
    <main className="bg-white text-gray-900">
      {/* HERO SECTION */}
      <section className="bg-green-50">
        <div className="max-w-6xl mx-auto px-6 py-20 text-center">
          <h1 className="text-4xl md:text-5xl font-bold leading-tight">
            GreenFlare 🌱🔥
          </h1>

          <p className="mt-6 text-lg md:text-xl text-gray-700 max-w-3xl mx-auto">
            A community-led environmental initiative turning real-world actions
            like tree planting, recycling, and cleanups into
            <span className="font-semibold"> transparent, on-chain impact </span>
            powered by Flare.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/submit"
              className="px-6 py-3 rounded-md bg-green-600 text-white font-semibold hover:bg-green-700 
transition"
            >
              Submit an Action
            </Link>

            <Link
              href="/admin"
              className="px-6 py-3 rounded-md border border-gray-300 font-semibold hover:bg-gray-100 
transition"
            >
              Admin Panel
            </Link>
          </div>

          <p className="mt-6 text-sm text-gray-500">
            MVP running on Flare Coston2 testnet
          </p>
        </div>
      </section>

      {/* WHAT WE DO */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-bold text-center">
          What GreenFlare Supports
        </h2>

        <div className="mt-12 grid gap-8 md:grid-cols-3">
          <div className="p-6 rounded-lg border text-center">
            <div className="text-4xl">🌳</div>
            <h3 className="mt-4 font-semibold text-xl">Tree Planting</h3>
            <p className="mt-2 text-gray-600">
              Support and verify community-led tree planting initiatives that
              improve air quality and restore ecosystems.
            </p>
          </div>

          <div className="p-6 rounded-lg border text-center">
            <div className="text-4xl">♻️</div>
            <h3 className="mt-4 font-semibold text-xl">Recycling</h3>
            <p className="mt-2 text-gray-600">
              Encourage responsible waste recycling by rewarding verified
              recycling actions with transparent tracking.
            </p>
          </div>

          <div className="p-6 rounded-lg border text-center">
            <div className="text-4xl">🧹</div>
            <h3 className="mt-4 font-semibold text-xl">Community Cleanups</h3>
            <p className="mt-2 text-gray-600">
              Empower local communities to organize cleanups and prove their
              impact with verifiable records.
            </p>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="bg-gray-50">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <h2 className="text-3xl font-bold text-center">
            How It Works
          </h2>

          <div className="mt-12 grid gap-10 md:grid-cols-3 text-center">
            <div>
              <div className="text-3xl font-bold text-green-600">1</div>
              <h3 className="mt-3 font-semibold text-lg">Take Action</h3>
              <p className="mt-2 text-gray-600">
                Plant a tree, recycle waste, or join a community cleanup in
                your area.
              </p>
            </div>

            <div>
              <div className="text-3xl font-bold text-green-600">2</div>
              <h3 className="mt-3 font-semibold text-lg">Submit Proof</h3>
              <p className="mt-2 text-gray-600">
                Upload photos or evidence of your action directly on the
                GreenFlare platform.
              </p>
            </div>

            <div>
              <div className="text-3xl font-bold text-green-600">3</div>
              <h3 className="mt-3 font-semibold text-lg">Verify On-Chain</h3>
              <p className="mt-2 text-gray-600">
                Approved actions are permanently recorded on Flare, creating
                transparent and trusted impact data.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* WHY FLARE */}
      <section className="max-w-6xl mx-auto px-6 py-16 text-center">
        <h2 className="text-3xl font-bold">
          Why On-Chain Verification?
        </h2>

        <p className="mt-6 max-w-3xl mx-auto text-gray-700 text-lg">
          Environmental initiatives often struggle with trust and transparency.
          GreenFlare solves this by anchoring verified impact data on
          <span className="font-semibold"> Flare’s blockchain</span>, ensuring
          records are immutable, auditable, and openly verifiable.
        </p>
      </section>

    </main>
  );
}

