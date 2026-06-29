// Server-side Route Handler for the resume-capture widget (Widget 3).
// Accepts a visitor's email, emails them Duli's resume as a PDF attachment
// via Resend, and logs the submission. Never exposes RESEND_API_KEY to the client.
//
// POST /api/resume  { email: string }
// Returns: { success: true } | { error: "friendly message" }

import { Resend } from "resend";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

export const runtime = "nodejs";

// ─── Tunable limits ───────────────────────────────────────────────────────────
const PER_IP_DAY_MAX = 5;   // a single visitor rarely needs more than one send
const GLOBAL_DAY_MAX = 50;  // stay well under Resend's free-tier 100/day cap

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ─── Rate limiting (in-memory, same pattern as /api/chat) ─────────────────────
const ipDaily = new Map(); // ip -> { day, count }
let globalDaily = { day: dayKey(), count: 0 };

function dayKey() {
  return new Date().toISOString().slice(0, 10);
}

function checkRateLimit(ip) {
  const today = dayKey();

  if (globalDaily.day !== today) globalDaily = { day: today, count: 0 };
  if (globalDaily.count >= GLOBAL_DAY_MAX) {
    return { ok: false, status: 503, error: "The resume sender is taking a quick break — email me directly at dulikim@umich.edu." };
  }

  let d = ipDaily.get(ip);
  if (!d || d.day !== today) d = { day: today, count: 0 };
  if (d.count >= PER_IP_DAY_MAX) {
    return { ok: false, status: 429, error: "You've already requested the resume — check your inbox, or email me directly." };
  }

  d.count += 1;
  ipDaily.set(ip, d);
  globalDaily.count += 1;
  return { ok: true };
}

export async function POST(request) {
  const ip = (request.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "local";

  const limit = checkRateLimit(ip);
  if (!limit.ok) return Response.json({ error: limit.error }, { status: limit.status });

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }

  const { email } = body || {};
  if (!email || typeof email !== "string" || !EMAIL_REGEX.test(email.trim())) {
    return Response.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  if (!process.env.RESEND_API_KEY) {
    console.error("RESEND_API_KEY is not set — add it to .env.local");
    return Response.json({ error: "The sender isn't configured yet — email me directly at dulikim@umich.edu." }, { status: 500 });
  }

  // Try to attach the resume PDF. If the file isn't there yet, send a plain-text fallback.
  const resumePath = join(process.cwd(), "public", "resume.pdf");
  const hasPdf = existsSync(resumePath);
  const pdfBuffer = hasPdf ? readFileSync(resumePath) : null;

  const fromAddress = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
  const resend = new Resend(process.env.RESEND_API_KEY);

  const emailPayload = {
    from: fromAddress,
    to: email.trim(),
    subject: "Duli Kim's Resume",
    text: hasPdf
      ? "Hey! Here's my resume, attached as a PDF. Feel free to reach out at dulikim@umich.edu with any questions.\n\n— Duli"
      : "Hey! Thanks for reaching out. My resume will be attached once the site is fully set up — in the meantime, email me directly at dulikim@umich.edu and I'll send it right over.\n\n— Duli",
    ...(pdfBuffer && {
      attachments: [{ filename: "Duli_Kim_Resume.pdf", content: pdfBuffer }],
    }),
  };

  try {
    await resend.emails.send(emailPayload);
    console.log(`[resume] sent to ${email.trim()} at ${new Date().toISOString()}`);
    return Response.json({ success: true });
  } catch (err) {
    console.error("Resend error:", err?.message);
    return Response.json(
      { error: "Something went wrong sending the email — try again, or reach me at dulikim@umich.edu." },
      { status: 500 }
    );
  }
}
