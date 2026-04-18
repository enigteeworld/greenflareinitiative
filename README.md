GreenFlare Initiative

GreenFlare is a real-world impact tracking and verification platform that enables users to submit environmental actions (recycling, cleanup, tree planting) and builds a structured, verifiable record of sustainability activity.

It combines:

📸 Proof-based submissions
🧠 Trust & verification logic (Supabase-backed)
🏫 Location + bin-based tracking (UNIBEN pilot)
🏆 Future-ready reward + leaderboard system
🚀 Overview

GreenFlare turns physical environmental actions into digital records.

Users can:

Submit actions with image proof
Select action types (Recycle, Cleanup, Tree Planting)
Tag submissions to designated bins (pilot infrastructure)
Build a verifiable impact history

This project is the frontend + product layer for a broader impact system.

🧱 Tech Stack
Frontend: Next.js (App Router)
Language: TypeScript
Backend: Supabase (Auth, DB, Storage)
Styling: Tailwind + CSS variables
Deployment: Vercel-ready
🧩 Core Features
📝 1. Impact Submission
Upload proof images
Select action type
Optional bin-linked submissions
Location tagging
API-powered submission flow
🏫 2. Bin-Based Tracking (Pilot System)
Predefined bins (e.g. Hall 4 UNIBEN)
Each bin has:
Code
Category (Plastic, Sachet, General Waste)
Default action + location

➡️ Enables structured, verifiable recycling flows

🔐 3. Authentication System
Email/password auth (Supabase)
Login / Signup flow
Redirect-based navigation (?next= support)
Session detection
👤 4. Onboarding System
First-time profile creation
Stores:
Full name
Display name
Campus / hostel
Determines:
Whether user is fully onboarded
Where to route after login
📊 5. Verified Activity Feed
Displays recent approved submissions
Includes:
Action type
Location
Bin (if used)
Points (future scoring system)
🏆 6. Leaderboard (in progress)
Ranking users by impact
Will integrate with trust + reward system
📁 Project Structure
app/
  ├── submit/           # Impact submission flow
  ├── auth/             # Login / signup
  ├── onboarding/       # Profile setup
  ├── leaderboard/      # Rankings
  ├── api/submit/       # Submission API route
  ├── components/       # Shared UI components

lib/
  ├── supabaseClient.ts
  ├── supabaseServer.ts

public/
⚙️ Getting Started
1. Clone repo
git clone https://github.com/enigteeworld/greenflareinitiative.git
cd greenflareinitiative
2. Install dependencies
npm install
3. Setup environment variables

Create .env.local:

NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
4. Run dev server
npm run dev

Open:

http://localhost:3000
🧠 Architecture Notes
🔹 Server + Client Split (Next.js 16)
Pages use server components
Interactive logic lives in *Client.tsx files
Query params handled server-side → passed as props

This avoids:

useSearchParams() build errors
🔹 Submission Flow
User uploads proof
Image stored in Supabase Storage
API route /api/submit is called
Record stored in submissions table
Status = pending
Admin / system later verifies
🔹 Data Model (Simplified)

submissions

id
user_address
action_type
location_cell
proof_url
bin_code
status
points

profiles

auth_user_id
full_name
display_name
onboarding_completed
🌍 Vision

GreenFlare is not just a form — it’s building toward:

🧾 Verifiable environmental activity records
🧠 Trust scoring for participants
💰 Reward systems (tokens / sponsorships)
🏙️ Smart infrastructure (bins + QR systems)
🌐 Public impact dashboards
🧪 Current Status
✅ Submission flow working
✅ Supabase integration live
✅ Auth + onboarding complete
✅ Bin system integrated (Hall 4 pilot)
⚠️ Leaderboard partial
🚧 Rewards + trust scoring upcoming
🔮 Roadmap
 Admin verification dashboard
 Trust score engine
 QR-based bin scanning
 Tokenized rewards
 Public impact explorer
 Mobile optimization
🤝 Contributing

This is an early-stage project. Contributions are welcome.

# fork → clone → branch → PR
📄 License

MIT License

✨ Author

Built by @enigteeworld

🧭 Final Note

GreenFlare sits at the intersection of:

Climate action 🌱
Digital identity 🧠
Real-world verification 📸
Incentive systems 💰

This repo is the first operational layer of that system.