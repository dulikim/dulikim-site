"use client";

import { useState } from "react";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Small spinner shown inside the CTA while the request is in-flight.
function Spinner() {
  return (
    <span
      className="w-4 h-4 rounded-full border-2 border-[#0b93f6] border-t-transparent animate-spin"
      aria-hidden="true"
    />
  );
}

// Inline PDF-document icon for the top-right "View Resume" button.
// Same 18×18 fill="white" treatment as the Notion glyph in EmailWidget.
function PdfIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      {/* Page outline */}
      <path
        d="M6 2h9l4 4v16a1 1 0 01-1 1H6a1 1 0 01-1-1V3a1 1 0 011-1z"
        stroke="white"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Folded corner */}
      <path
        d="M14 2v5h5"
        stroke="white"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Two content lines */}
      <path d="M9 13h6M9 17h4" stroke="white" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

export default function ResumeWidget() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSend(e) {
    e.preventDefault();

    // Client-side guard — avoids a round-trip for obviously bad input.
    if (!email.trim() || !EMAIL_REGEX.test(email.trim())) {
      setStatus("error");
      setErrorMsg("Enter a valid email address.");
      return;
    }

    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setStatus("error");
        setErrorMsg(data.error || "Something went wrong — try again.");
      } else {
        setStatus("success");
      }
    } catch {
      setStatus("error");
      setErrorMsg("Couldn't reach the server — check your connection and try again.");
    }
  }

  return (
    // Mirrors EmailWidget's card exactly: white base, dark on hover/focus-within,
    // smooth color transition, group utilities propagate state to children.
    <div className="group rounded-ios shadow-ios p-5 bg-white hover:bg-[#1c1c1e] focus-within:bg-[#1c1c1e] transition-colors duration-300">

      {/* ── Zone 1: Header row ─────────────────────────────────────────────────
          Identical structure to EmailWidget: title + subtitle left, icon button right. */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="font-bold text-[18px] leading-tight text-ios-text group-hover:text-white group-focus-within:text-white transition-colors duration-300">
            Get My Resume
          </p>
          {status === "success" ? (
            <p className="text-sm text-ios-subtle group-hover:text-[#8e8e93] group-focus-within:text-[#8e8e93] mt-0.5 transition-colors duration-300">
              didn&apos;t get it? check spam, or{" "}
              <a
                href="mailto:dulikim@umich.edu"
                className="underline underline-offset-2"
              >
                email me directly
              </a>
            </p>
          ) : (
            <p className="text-sm text-ios-subtle group-hover:text-[#8e8e93] group-focus-within:text-[#8e8e93] mt-0.5 transition-colors duration-300">
              View it, or get it sent to your inbox
            </p>
          )}
        </div>

        {/* "View Resume" action — styled like EmailWidget's calendar icon button.
            Opens /resume.pdf in a new tab. Will 404 until the PDF is added to /public. */}
        <a
          href="/resume.pdf"
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          aria-label="View resume (PDF)"
          title="View resume (opens in new tab)"
          className="w-10 h-10 rounded-[9px] bg-black flex items-center justify-center flex-shrink-0 hover:opacity-80 transition-opacity cursor-pointer"
        >
          <PdfIcon />
        </a>
      </div>

      {/* ── Zone 2: Email capture (blue accent bar) ────────────────────────────
          Mirrors EmailWidget's compose area structure. Collapses to confirmation
          on success. */}
      {status === "success" ? (
        <div className="border-l-[3px] border-[#0b93f6] pl-3 mb-5 py-1.5">
          <p className="text-sm font-semibold text-ios-text group-hover:text-white group-focus-within:text-white transition-colors duration-300">
            Sent! Check your inbox ✓
          </p>
        </div>
      ) : (
        <form onSubmit={handleSend}>
          <div className="border-l-[3px] border-[#0b93f6] pl-3 mb-5">
            {/* "To" row — mirrors the static "To: dulikim@umich.edu" row in EmailWidget */}
            <div className="flex items-center gap-3 py-1.5 border-b border-ios-hairline group-hover:border-[#2c2c2e] group-focus-within:border-[#2c2c2e] transition-colors duration-300">
              <span className="text-xs text-ios-subtle group-hover:text-[#636366] group-focus-within:text-[#636366] w-5 flex-shrink-0 transition-colors duration-300">
                To
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (status === "error") { setStatus("idle"); setErrorMsg(""); }
                }}
                placeholder="you@email.com"
                aria-label="Your email address"
                disabled={status === "loading"}
                className="w-full bg-transparent text-sm text-ios-text group-hover:text-white group-focus-within:text-white placeholder:text-ios-subtle outline-none caret-[#0b93f6] transition-colors duration-300 disabled:opacity-60"
              />
            </div>

            {/* Inline error — iOS system red, readable on both light and dark card */}
            {status === "error" && errorMsg && (
              <p className="text-[13px] text-[#ff453a] mt-1.5">{errorMsg}</p>
            )}
          </div>

          {/* ── Zone 3: CTA — rounded-full, mirrors "Email Me ↗" button ── */}
          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full border border-ios-hairline group-hover:border-[#3a3a3c] group-focus-within:border-[#3a3a3c] rounded-full py-2.5 flex items-center justify-center gap-1.5 transition-colors duration-300 cursor-pointer disabled:cursor-default disabled:opacity-70"
          >
            {status === "loading" ? (
              <>
                <Spinner />
                <span className="text-sm font-medium text-ios-text group-hover:text-white group-focus-within:text-white transition-colors duration-300">
                  Sending…
                </span>
              </>
            ) : (
              <>
                <span className="text-sm font-medium text-ios-text group-hover:text-white group-focus-within:text-white transition-colors duration-300">
                  Send My Resume
                </span>
                <span
                  className="text-sm text-ios-text group-hover:text-white group-focus-within:text-white transition-colors duration-300"
                  aria-hidden="true"
                >
                  →
                </span>
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
