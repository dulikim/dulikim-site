"use client";

import { useState } from "react";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Small spinner shown inside the CTA while the request is in-flight. White so it
// reads on the filled-blue button.
function Spinner() {
  return (
    <span
      className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"
      aria-hidden="true"
    />
  );
}

// A skeuomorphic mini "resume page" built entirely from divs (no image needed).
// White paper with a soft shadow + faint border so it stands out on BOTH the
// white card and the dark hover state. A blue dot + short lines reads as a
// name/avatar header; the gray lines below read as body text. The slight tilt
// straightens on hover for a little life.
function ResumePageGraphic() {
  return (
    <div className="w-[72px] h-[92px] rounded-lg bg-white shadow-[0_6px_18px_rgba(0,0,0,0.16)] border border-black/5 p-2.5 flex flex-col gap-1.5 -rotate-2 group-hover:rotate-0 transition-transform duration-300">
      {/* header: avatar dot + name/title lines */}
      <div className="flex items-center gap-1 mb-0.5">
        <span className="w-2.5 h-2.5 rounded-full bg-imessage-blue shrink-0" />
        <div className="flex flex-col gap-0.5 flex-1">
          <span className="h-1 w-3/4 rounded-full bg-ios-text/60" />
          <span className="h-1 w-1/2 rounded-full bg-ios-hairline" />
        </div>
      </div>
      {/* body text lines */}
      <span className="h-1 w-full rounded-full bg-ios-hairline" />
      <span className="h-1 w-full rounded-full bg-ios-hairline" />
      <span className="h-1 w-4/5 rounded-full bg-ios-hairline" />
      <span className="h-1 w-full rounded-full bg-ios-hairline" />
      <span className="h-1 w-2/3 rounded-full bg-ios-hairline" />
    </div>
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
    // Same iOS card base + dark-on-hover behavior as EmailWidget, but a full-height
    // flex column so the hero region absorbs the extra row height and the form pins
    // to the bottom (no empty gap under the button).
    <div className="group rounded-ios shadow-ios p-5 bg-white hover:bg-[#1c1c1e] focus-within:bg-[#1c1c1e] transition-colors duration-300 flex flex-col h-full">

      {/* ── Hero region: resume graphic + centered title/subtitle.
          flex-1 makes it grow to fill, centering its contents and pushing the
          form down to the card's bottom edge. ── */}
      <div className="flex-1 flex flex-col items-center justify-center text-center gap-3 py-2">
        <ResumePageGraphic />
        <div>
          <p className="font-bold text-[18px] leading-tight text-ios-text group-hover:text-white group-focus-within:text-white transition-colors duration-300">
            Get My Resume
          </p>
          {status === "success" ? (
            <p className="text-sm text-ios-subtle group-hover:text-[#8e8e93] group-focus-within:text-[#8e8e93] mt-0.5 transition-colors duration-300">
              Sent! Check your inbox ✓
            </p>
          ) : (
            <p className="text-sm text-ios-subtle group-hover:text-[#8e8e93] group-focus-within:text-[#8e8e93] mt-0.5 transition-colors duration-300">
              Sent straight to your inbox
            </p>
          )}
        </div>
      </div>

      {/* ── Bottom region: pill input + filled-blue CTA (or success note) ── */}
      {status === "success" ? (
        <div className="mt-4 flex flex-col gap-2.5">
          <a
            href="/resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-imessage-blue text-white rounded-full py-2.5 flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity cursor-pointer"
          >
            <span className="text-sm font-medium">View Resume</span>
            <span className="text-sm" aria-hidden="true">→</span>
          </a>
          <p className="text-[13px] text-center text-ios-subtle group-hover:text-[#8e8e93] group-focus-within:text-[#8e8e93] transition-colors duration-300">
            didn&apos;t get it? check spam, or{" "}
            <a href="mailto:dulikim@umich.edu" className="underline underline-offset-2">
              email me directly
            </a>
          </p>
        </div>
      ) : (
        <form onSubmit={handleSend} className="mt-4 flex flex-col gap-2.5">
          {/* Pill email input — distinct from EmailWidget's underlined "To" row */}
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
            className="w-full bg-transparent text-center text-sm text-ios-text group-hover:text-white group-focus-within:text-white placeholder:text-ios-subtle border border-ios-hairline group-hover:border-[#3a3a3c] rounded-full px-4 py-2.5 outline-none caret-[#0b93f6] focus:border-imessage-blue transition-colors duration-300 disabled:opacity-60"
          />

          {/* Inline error — iOS system red, readable on both light and dark card */}
          {status === "error" && errorMsg && (
            <p className="text-[13px] text-center text-[#ff453a] -mt-0.5">{errorMsg}</p>
          )}

          {/* Filled-blue CTA — the primary capture action (vs. EmailWidget's outline pill) */}
          <button
            type="submit"
            disabled={status === "loading"}
            className="w-full bg-imessage-blue text-white rounded-full py-2.5 flex items-center justify-center gap-1.5 hover:opacity-90 transition-opacity cursor-pointer disabled:cursor-default disabled:opacity-70"
          >
            {status === "loading" ? (
              <>
                <Spinner />
                <span className="text-sm font-medium">Sending…</span>
              </>
            ) : (
              <>
                <span className="text-sm font-medium">Send My Resume</span>
                <span className="text-sm" aria-hidden="true">→</span>
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
