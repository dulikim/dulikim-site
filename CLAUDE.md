# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev      # start dev server at localhost:3000
npm run build    # production build
npm run lint     # ESLint check
```

No test suite. Verify UI changes by running the dev server.

## Environment

Copy `.env.local.example` to `.env.local` (or create it) with:
```
ANTHROPIC_API_KEY=sk-ant-...
```
The API key is server-only — never referenced in client components.

## Project overview

Personal portfolio site for Duli Kim (PM job hunting). The root URL `/` redirects to `/contact`, which is the intended landing page — not a traditional homepage. The `/nihao` route is the "Home" page.

**Site map:** Contact (`/contact`) → Home (`/nihao`) → About (`/about`) → Blog (`/thoughts`)

Only the Contact page is currently built. The other routes are stubbed; do not expand scope to those pages without explicit instruction.

## Architecture

**Framework:** Next.js 16 App Router, JavaScript (no TypeScript). Server Components by default; client components opt in with `"use client"`.

**Styling:** Tailwind CSS v4 with custom iOS-inspired design tokens defined in `app/globals.css` under `@theme`. Use the token classes (`bg-ios-card`, `text-ios-subtle`, `rounded-ios`, `shadow-ios`, `bg-imessage-blue`, `bg-imessage-gray`, etc.) — don't hardcode colors or radii.

**AI:** `@anthropic-ai/sdk` — model is `claude-haiku-4-5-20251001`. The system prompt is built from `persona.md` at module load time in the route handler.

## Key files

- [app/contact/page.js](app/contact/page.js) — Contact page layout (three widgets)
- [app/components/ChatWidget.js](app/components/ChatWidget.js) — iMessage-style AI chatbot (client component)
- [app/components/EmailWidget.js](app/components/EmailWidget.js) — mailto compose widget (client component)
- [app/api/chat/route.js](app/api/chat/route.js) — server-side Anthropic API route with rate limiting and input validation
- [app/components/NavBar.js](app/components/NavBar.js) — sticky tab nav with sliding highlight indicator
- [app/globals.css](app/globals.css) — design tokens, iMessage tail CSS, typing animation, scrollbar behavior
- [persona.md](persona.md) — Duli's story bank; feeds the chatbot system prompt (do not fabricate content here)

## ChatWidget behavior

The widget starts scrolled to the top showing a seeded 2-message intro. On first interaction (`onClick` or `onFocus`), it calls `revealConversation()` which types out a rundown message then asks for the visitor's name. Subsequent sends go to `/api/chat`.

`toApiMessages()` converts `{ from: "bot"|"user", text }` to `{ role, content }` for the API, drops leading bot messages (API requires user-first), and merges consecutive same-role turns.

Timing is scripted: `readDelay()` controls Delivered→Read, `typingDelay()` scales with reply length (both capped). The real API call fires immediately on send; the typing indicator waits out the remainder once the response arrives.

## API route guardrails

Rate limits (all in-memory, resets on server restart — acceptable for v1):
- **Burst:** 8 requests per IP per 60 seconds
- **Daily per-IP:** 40 requests
- **Global daily:** 800 requests (hard cost backstop)

Input limits: max 1,500 chars per message, 12,000 chars total conversation, 20 messages kept (older messages are dropped).

`sanitizeReply()` strips markdown syntax and replaces em/en dashes with ` - ` before returning to the client (Haiku slips on these despite the system prompt).

## Design rules

- iOS/iMessage visual language throughout: rounded corners, soft shadows, system font stack (`-apple-system` first)
- Centered layout, `max-w-2xl` container
- Widget 1 (ChatWidget) full-width; Widgets 2 & 3 side-by-side in a `sm:grid-cols-2` grid
- Bubble tails use the `.imsg-tail-in` / `.imsg-tail-out` CSS classes — only the last bubble in a consecutive run from the same sender gets a tail (iMessage grouping)
- The FaceTime icon in ChatWidget header and the Notion Calendar icon in EmailWidget are both TODO placeholders for a Calendly link

## Widget 3 (not yet built)

Resume capture + auto-send: visitor submits their email → backend saves it + immediately emails Duli's resume as an attachment. Planned stack: Resend for email sending, simple database for email capture. Treat as a separate build session.
