# Project Context — dulikim.com Portfolio Site (Contact Page First)

> Read this entire file before starting work. This is a multi-session project — refer back to this doc each time context is lost or a new session starts.

## Who this is for

I'm Duli Kim, a student actively job hunting for **Product Management (PM)** roles. I'm building a personal portfolio website at **dulikim.com** for recruiting purposes. I'm a **coding beginner** — please explain new concepts (especially backend/API concepts) as you introduce them, don't assume I know them already. Use plain language, not jargon, when explaining what code does and why.

## Domain & site map (full site, for context — we're only building Contact right now)

- Domain: **dulikim.com**, registering through **Cloudflare Registrar** (quoted at ~$10.46/month from a checkout flow — verify actual pricing before purchase; Cloudflare registrar is normally at-cost/no-markup and typically billed annually per year, not monthly, so double-check the actual billing cadence before paying)
- Full site navigation, in order: **Contact → Home (nihao) → About → Blog (thoughts)**
- URL structure:
  - Contact (first/landing page): `dulikim.com` → redirects to or is `dulikim.com/contact`
  - Home: `dulikim.com/nihao`
  - About: `dulikim.com/about`
  - Blog: `dulikim.com/thoughts`
- **Important:** the site's first/default page (what loads at the root domain) is the **Contact** page, not a traditional homepage. "Home" is a separate nav item at `/nihao`, not the root.
- We are building the **Contact page only** right now, as its own standalone project, before the rest of the site exists. Do not build Home/About/Blog pages yet — flag it if asked to expand scope before I confirm.

## Design direction (confirmed references)

- **Visual/UI style:** Centered headings and layout throughout. Strongly inspired by **iOS-style UI** — I want this iOS look and feel maintained across the whole page, not just the chat widget. Think: rounded corners, iOS-native-feeling spacing, system-font-adjacent typography, soft shadows — the page should feel like an Apple-designed interface.
- **Primary reference:** marco.fyi/contact — specifically the **iMessage-style chat widget look** (bubble shapes, tails, "Delivered" labels, dark/light bubble contrast). Note from earlier research in this project: marco.fyi's version is fully scripted/fake (no real AI) — we are explicitly building something smarter (see Widget 1 below), but the VISUAL execution of the iMessage look is what we're copying/matching.
- Replicate marco.fyi's general **widget layout concept** for the contact page (multiple distinct contact "widgets" arranged on the page, each a self-contained card), but with our own three specific widgets (below) instead of marco's.

## Contact Page — the three widgets

### Widget 1 (main/primary widget): AI Chatbot
- Styled as an iMessage conversation (per Design Direction above)
- **Real LLM-backed, not scripted** — this is the centerpiece of the page
- Must actually respond intelligently to varied user questions/commands, not a fixed script
- See full chatbot spec below (carried over from earlier planning) — Claude Haiku 4.5, persona-grounded, on-topic guardrails, rate limited, API key server-side only

### Widget 2: Mailto widget
- Simple "Email Me" style widget
- Mailto target: **dulikim@umich.edu**
- This can be a simple `mailto:` link/button — no backend needed for this one

### Widget 3: Resume capture + auto-send widget
- Visitor enters their email address into a field
- On submit, two things happen:
  1. **Save the submitted email** to a simple data store (e.g. a spreadsheet, simple database, or basic logging service) so I can review who's reached out, for my own records
  2. **Automatically send my resume** to that email address immediately (confirmed: automated, not a manual "I'll email it later" step)
- This is more involved than a simple mailto link — requires:
  - A backend API route to receive the submitted email
  - An email-sending service (e.g. **Resend** or **SendGrid** — pick one; Resend is generally simpler for beginners and has a generous free tier) to actually send the resume as an attachment or download link
  - Storage for the captured emails (start simple — even a basic database table or a logged spreadsheet-style store is fine for v1, doesn't need to be fancy)
  - My resume file needs to be ready as a PDF, stored somewhere the backend can access it to attach/send
- **Flag:** this widget is a separate, slightly bigger scope than Widgets 1 and 2 — treat it as its own build session (see Build Sequence below), don't bundle it into the chatbot work

## What we're building right now

The **contact page** of my portfolio site — the first page we're building, as a standalone project before the rest of the site exists. It's not just a contact form. It's three widgets: the AI chatbot (main focus), a mailto widget, and a resume-capture-and-autosend widget — all styled in an iOS/iMessage-inspired visual language.

## Chatbot (Widget 1) — detailed requirements

1. **Visual style:** iMessage-inspired chat bubbles (rounded rectangles, tail on the bot's bubbles, light gray bot bubbles / blue or accent-colored my bubbles — visual polish can be refined later, function first).
2. **Real AI, not scripted:** Connects to the **Anthropic Claude API** (NOT OpenAI or Gemini — we chose Claude).
3. **Model:** Use **Claude Haiku 4.5** (model string: `claude-haiku-4-5-20251001`) — it's the cheapest current-generation model and plenty capable for this use case. Do not use Opus or Sonnet unless I explicitly ask to upgrade.
4. **Grounded in real content:** The bot must answer using a persona/system prompt built from my real story bank (background, case studies, FAQs) — not generic "AI assistant" behavior. The system prompt should instruct the model to speak as if representing me, in first person, and to stay accurate to the provided info rather than inventing details.
5. **On-topic guardrails:** The bot should politely redirect if asked something unrelated to my professional background (no open-ended general assistant behavior, no answering unrelated trivia, no being tricked into off-brand statements).
6. **Security:** The Anthropic API key must NEVER appear in any client-side/browser-facing code. It lives only in a server-side environment variable, accessed only inside the API route.
7. **Rate limiting:** Basic protection so a single visitor/IP can't spam the endpoint and run up API costs. Doesn't need to be sophisticated for v1 — simple per-IP or per-session limiting is fine.
8. **"Typing..." indicator:** Three animated dots shown while waiting for the real API response (not a fake delay — show it for as long as the actual API call takes).

## Tech stack (decided, don't change without asking me)

- **Framework:** Next.js (App Router), since I need a backend API route to safely call the Claude API
- **Language:** JavaScript is fine — TypeScript optional, ask me first if you want to switch
- **Styling:** Tailwind CSS (or plain CSS if simpler for a beginner to follow — your call, but explain the choice)
- **AI:** Anthropic Claude API via the official `@anthropic-ai/sdk` npm package
- **Deployment target:** Vercel (decided, not yet done — we'll get there in a later session)
- **Domain:** Already planning to buy via Cloudflare Registrar (not yet purchased), will point DNS at Vercel once deployed

## What's already decided — don't relitigate these

- Claude over GPT/Gemini for the API (already chosen)
- Next.js over plain HTML/JS (needed for the secure API route)
- Haiku 4.5 as the model for cost reasons (~$0.003 per message exchange, effectively free at portfolio scale)
- Real AI over a scripted fake chatbot for Widget 1 (the whole point is that it's genuinely smarter than the marco.fyi-style competitors)
- Three widgets, confirmed: (1) AI chatbot, (2) mailto to dulikim@umich.edu, (3) resume capture + auto-send
- Resume widget auto-sends the resume immediately on email submission — not a manual follow-up
- This is page 1 of a larger site-to-be-built-later (Home at /nihao, About, Blog at /thoughts) — don't scope creep into building other pages unless I ask

## What's NOT decided yet / still needs my input

- Exact visual design details (colors, fonts, exact bubble styling, exact widget arrangement/order on the page) — default to something clean, iOS-inspired, and iMessage-accurate for Widget 1; I'll give feedback once built
- My actual persona/story bank content (case studies, FAQs) for the chatbot — I will provide this as a separate file (`persona.md` or similar) before the API route can be meaningfully wired up. If this doesn't exist yet when you reach that step, ask me for it / help me draft it rather than inventing placeholder content that sounds like real claims about me
- Specific rate-limit numbers (requests per minute/hour) for the chatbot — suggest a reasonable default, I can adjust
- Resume PDF file itself — I need to provide this before Widget 3's send functionality can be tested end-to-end
- Which email-sending service (Resend vs SendGrid) — lean Resend by default for simplicity, confirm with me before setting up an account
- Where captured emails get stored (simplest possible option for v1 — e.g. a lightweight database like a Vercel-compatible Postgres/SQLite option, or even just appending to a file/sheet) — propose the simplest option that works with our Next.js + Vercel stack, confirm with me before building

## Build sequence (do these roughly in order, one focused session at a time)

1. **Scaffold:** New Next.js app, basic project structure, confirm `npm run dev` works
2. **Static chat UI (Widget 1 shell):** Build the visual iMessage-style chat interface with hardcoded/fake bot replies first — get the UI feeling right before adding real AI
3. **Persona content:** Once I provide my story bank, help structure it into a system prompt for the chatbot
4. **Real chatbot API route:** Build `/api/chat`, wire up the Anthropic SDK, use env var for the key, test it actually responds intelligently
5. **Connect chatbot frontend to backend:** Replace fake replies with real calls to `/api/chat`, wire up the typing indicator to real latency
6. **Chatbot guardrails:** On-topic system prompt instructions + basic rate limiting
7. **Widget 2 (mailto):** Simple, should be quick — a styled button/card with a `mailto:dulikim@umich.edu` link
8. **Widget 3 (resume capture + auto-send) — separate session:** Build the email capture form, set up the email-sending service, set up simple storage for captured emails, wire up automatic resume sending on submit
9. **Overall page layout:** Arrange all three widgets together in the centered, iOS-styled page layout
10. **Deploy:** Push to Vercel, set environment variables there (Anthropic key + email service key), connect dulikim.com domain

## Working style preferences

- Explain new concepts as you introduce them (especially: API routes, environment variables, server vs. client code, npm packages, email-sending services, databases) — assume I haven't seen these before
- Actually run the dev server and test your own code before telling me it's done — catch errors yourself when possible
- If you hit an error, show me the exact error text if you need my help, don't just describe it vaguely
- Keep scope tight to what's listed above — flag it explicitly if you think we should deviate, don't just go expand scope silently
- This is a portfolio piece for PM job applications — code quality and clarity matter, but perfection isn't the goal; a working, polished v1 beats a half-finished "ideal" build
