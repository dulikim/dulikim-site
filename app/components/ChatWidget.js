"use client";

// This is a CLIENT component ("use client" above). That tells Next.js this code
// runs in the visitor's browser — needed here because we use React state and
// respond to clicks/typing. (Most files are SERVER components by default, which
// is what lets us safely hide secrets like API keys later.)

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

// Canned replies for now — purely fake, written in Duli's first-person voice.
// In a later session, sending a message will instead call our /api/chat route,
// which talks to Claude. See the TODO marked below for the exact swap point.
const FAKE_REPLIES = [
  "good to hear from you! (quick note: this reply is a placeholder for now — the real chat goes live in a later build.)",
  "love it. once i'm wired up to Claude i'll actually answer this properly.",
  "noted! right now i'm just echoing canned lines so we can get the look right first.",
];

// Format a Date as a short local time like "9:34 AM" — uses the visitor's own
// timezone and locale automatically.
function formatTime(date) {
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

// How long a SENT message sits on "Delivered" before flipping to "Read".
// 800ms glance/"Delivered" beat + 40ms/char (~25 chars/sec ≈ a fluent reading
// pace). e.g. "check this out" (14) ≈ 1.4s; a long paragraph (~118) ≈ 5.5s.
function readDelay(text) {
  return Math.min(8000, 800 + text.length * 40);
}

// How long Duli appears to be "typing" before the reply lands.
// 1500ms "thinking" beat + 20ms/char. e.g. a short reply ≈ 1.8s; a long
// placeholder reply ≈ 3.9s.
function typingDelay(text) {
  return Math.min(7000, 1500 + text.length * 20);
}

// Beat between a message turning "Read" and Duli starting to respond — keeps it
// from looking like the reply fires the instant the message is read.
const READ_TO_REPLY_GAP = 400;

// Duli's profile photo, cropped to a circle. We size a round, clipped box and
// let the image `fill` it with `object-cover` (center-crops the landscape photo
// into the circle). `scale-110` zooms in slightly; high quality + a generous
// fetch size keep it crisp on retina screens. next/image auto-rotates per EXIF.
function Avatar({ size = "sm" }) {
  const dim = size === "lg" ? "w-16 h-16" : "w-8 h-8";
  return (
    <span
      className={`relative ${dim} shrink-0 rounded-full overflow-hidden select-none`}
    >
      <Image
        src="/duli-pfp.JPG"
        alt="Duli"
        fill
        sizes="128px"
        quality={95}
        className="object-cover scale-110"
      />
    </span>
  );
}

function Bubble({ from, isLastInGroup, status, time, children }) {
  const isUser = from === "user";

  if (isUser) {
    return (
      <div className="flex flex-col items-end">
        {/* Only the LAST bubble of a run gets the tail; earlier ones in the run
            stay as plain rounded pills — like iMessage. */}
        <div
          className={`max-w-[75%] px-4 py-2.5 text-[17px] leading-snug bg-imessage-blue text-white rounded-bubble ${
            isLastInGroup ? "imsg-tail-out" : ""
          }`}
        >
          {children}
        </div>
        {/* Delivered / Read status under the most recent sent message.
            `key={status}` makes the text re-run its fade when it flips. */}
        {status && (
          <span
            key={status}
            className="status-fade text-[12px] text-ios-subtle mt-1 pr-1"
          >
            {status === "read" ? (
              <>
                <span className="font-semibold">Read</span> {formatTime(time)}
              </>
            ) : (
              "Delivered"
            )}
          </span>
        )}
      </div>
    );
  }

  // Incoming (from Duli): avatar + tail show only on the last bubble of the run.
  return (
    <div className="flex justify-start items-end gap-2">
      {isLastInGroup ? <Avatar /> : <span className="w-8 shrink-0" />}
      <div
        className={`max-w-[75%] px-4 py-2.5 text-[17px] leading-snug bg-imessage-gray text-ios-text rounded-bubble ${
          isLastInGroup ? "imsg-tail-in" : ""
        }`}
      >
        {children}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex justify-start items-end gap-2">
      <Avatar />
      <div className="bg-imessage-gray rounded-bubble px-4 py-3.5 flex items-center gap-1">
        <span className="typing-dot w-2 h-2 rounded-full bg-ios-subtle" />
        <span
          className="typing-dot w-2 h-2 rounded-full bg-ios-subtle"
          style={{ animationDelay: "0.15s" }}
        />
        <span
          className="typing-dot w-2 h-2 rounded-full bg-ios-subtle"
          style={{ animationDelay: "0.3s" }}
        />
      </div>
    </div>
  );
}

export default function ChatWidget() {
  // Seeded conversation the visitor lands on. It reads as if a text thread with
  // Duli is already underway (first person — they're talking to Duli directly).
  // "what's your name?" is intentionally NOT seeded: it stays hidden until the
  // visitor first interacts, then gets "typed out" (see revealConversation).
  // Seeded messages carry no status — Delivered/Read only appears on the
  // visitor's own messages.
  const [messages, setMessages] = useState([
    {
      id: 0,
      from: "bot",
      text: "hey, i'm duli 👋 want to work together? or just want to chat? send me a message right here — for real, i read these.",
    },
    { id: 1, from: "user", text: "sounds good 🙏" },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // Monotonic id source for new messages (seeded ones used 0–1).
  const nextIdRef = useRef(2);
  const nextId = () => nextIdRef.current++;

  // The "Today <time>" header. We compute it on the client (in an effect) rather
  // than during render so the server and browser don't disagree on the time —
  // that mismatch would otherwise cause a React hydration warning.
  const [todayTime, setTodayTime] = useState(null);
  useEffect(() => {
    setTodayTime(formatTime(new Date()));
  }, []);

  // Scroll + interaction state. Until the visitor interacts we stay at the TOP
  // (showing the intro) and "what's your name?" is hidden.
  const [hasInteracted, setHasInteracted] = useState(false);
  const [scrollbarVisible, setScrollbarVisible] = useState(false);
  const scrollRef = useRef(null);
  const autoScrollingRef = useRef(false);
  const hideBarTimerRef = useRef(null);
  const revealedRef = useRef(false);
  const timersRef = useRef([]);

  // Clear any pending timers if the widget unmounts.
  useEffect(() => {
    const timers = timersRef.current;
    return () => timers.forEach(clearTimeout);
  }, []);

  // Start at the top on mount (show the intro, not the bottom of the thread).
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, []);

  // Once interacted, scroll to the newest message using the browser's NATIVE
  // smooth scroll (feels natural, not robotic). While this auto-scroll runs we
  // flag it so the scrollbar stays hidden — it should only appear on manual
  // scrolling, not when the thread jumps down after sending.
  useEffect(() => {
    if (!hasInteracted) return;
    const el = scrollRef.current;
    if (!el) return;
    autoScrollingRef.current = true;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
    const t = setTimeout(() => {
      autoScrollingRef.current = false;
    }, 700);
    return () => clearTimeout(t);
  }, [messages, isTyping, hasInteracted]);

  // Show the scrollbar only while the visitor is scrolling MANUALLY (e.g.
  // scrolling back up to re-read) — never during the auto-scroll after sending.
  // It fades back out shortly after they stop.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    function onScroll() {
      if (autoScrollingRef.current) return;
      setScrollbarVisible(true);
      clearTimeout(hideBarTimerRef.current);
      hideBarTimerRef.current = setTimeout(
        () => setScrollbarVisible(false),
        1200
      );
    }
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll);
      clearTimeout(hideBarTimerRef.current);
    };
  }, []);

  // First interaction anywhere in the widget: reveal the thread AND have Duli
  // "type out" the opening question (hidden until now). Guarded so it runs once.
  function revealConversation() {
    if (revealedRef.current) return;
    revealedRef.current = true;
    setHasInteracted(true);

    const question = "what's your name?";
    timersRef.current.push(
      setTimeout(() => setIsTyping(true), 500),
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          { id: nextId(), from: "bot", text: question },
        ]);
        setIsTyping(false);
      }, 500 + typingDelay(question))
    );
  }

  function handleSend(e) {
    e.preventDefault();
    const text = input.trim();
    if (!text || isTyping) return;

    const id = nextId();
    const sentAt = new Date();
    // New message starts as "Delivered" (no typing dots yet — that comes after
    // it's been "Read", which feels more natural).
    setMessages((prev) => [
      ...prev,
      { id, from: "user", text, status: "delivered", time: sentAt },
    ]);
    setInput("");

    const reply = FAKE_REPLIES[Math.floor(Math.random() * FAKE_REPLIES.length)];
    const readAt = readDelay(text);
    const typingStartAt = readAt + READ_TO_REPLY_GAP;
    const replyAt = typingStartAt + typingDelay(reply);

    timersRef.current.push(
      // Delivered -> Read
      setTimeout(() => {
        setMessages((prev) =>
          prev.map((m) => (m.id === id ? { ...m, status: "read" } : m))
        );
      }, readAt),
      // A beat after Read, Duli starts typing…
      setTimeout(() => setIsTyping(true), typingStartAt),
      // ────────────────────────────────────────────────────────────────────
      // TODO (Session 4): replace this fake reply with a real call:
      //   const res = await fetch("/api/chat", { method: "POST", body: ... });
      // and drive `setIsTyping` off the real request's start/finish.
      // ────────────────────────────────────────────────────────────────────
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          { id: nextId(), from: "bot", text: reply },
        ]);
        setIsTyping(false);
      }, replyAt)
    );
  }

  // Only the most recent sent message shows a status label (iMessage behavior).
  const lastUserIndex = messages.map((m) => m.from).lastIndexOf("user");

  return (
    <section
      onClick={revealConversation}
      className="bg-ios-card rounded-ios shadow-ios overflow-hidden"
    >
      {/* Header — iMessage conversation style: back chevron, centered avatar +
          name, and a FaceTime video icon on the right. */}
      <header className="relative flex items-center justify-center px-5 py-4 border-b border-ios-hairline">
        {/* Back chevron (decorative for now) */}
        <span className="absolute left-4 text-imessage-blue" aria-hidden="true">
          <svg width="14" height="24" viewBox="0 0 14 24" fill="none">
            <path
              d="M11 3L3 12l8 9"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>

        {/* Centered profile pic + name */}
        <div className="flex flex-col items-center gap-1.5">
          <Avatar size="lg" />
          <p className="text-[19px] font-medium text-ios-text">Duli</p>
        </div>

        {/* FaceTime / video icon — TODO: link this to a Calendly booking page. */}
        <button
          type="button"
          aria-label="Schedule a call"
          title="Schedule a call (Calendly — coming later)"
          className="absolute right-4 text-imessage-blue"
        >
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <rect
              x="2.5"
              y="6.5"
              width="12"
              height="11"
              rx="2.5"
              stroke="currentColor"
              strokeWidth="1.8"
            />
            <path
              d="M14.5 10l5-3v10l-5-3"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </header>

      {/* Message thread (scrollable). Starts at the top showing the intro.
          `chat-scroll` hides the scrollbar; `show-bar` (toggled while manually
          scrolling) reveals it. */}
      <div
        ref={scrollRef}
        className={`px-4 py-4 space-y-2.5 h-80 overflow-y-auto chat-scroll ${
          scrollbarVisible ? "show-bar" : ""
        }`}
      >
        {/* "Today <time>" — the moment the visitor opened the page. */}
        {todayTime && (
          <p className="text-center text-[12px] text-ios-subtle mb-2">
            <span className="font-semibold">Today</span> {todayTime}
          </p>
        )}

        {messages.map((m, i) => {
          // A message is "last in its group" if it's the final message or the
          // next one is from the other person — that's the one that gets the
          // tail + avatar (iMessage grouping).
          const isLastInGroup =
            i === messages.length - 1 || messages[i + 1].from !== m.from;
          // Show the status label only under the most recent sent message.
          const status = i === lastUserIndex ? m.status : undefined;
          return (
            <Bubble
              key={m.id}
              from={m.from}
              isLastInGroup={isLastInGroup}
              status={status}
              time={m.time}
            >
              {m.text}
            </Bubble>
          );
        })}
        {isTyping && <TypingIndicator />}
      </div>

      {/* Input row — a single iMessage-style pill with the send button tucked
          inside on the right. No divider, no extra icons. */}
      <form onSubmit={handleSend} className="px-4 pt-2 pb-4">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onFocus={revealConversation}
            placeholder="iMessage"
            aria-label="Type a message"
            className="w-full bg-transparent border border-ios-hairline rounded-full pl-5 pr-12 py-2.5 text-[17px] outline-none focus:border-imessage-blue placeholder:text-ios-subtle"
          />
          <button
            type="submit"
            aria-label="Send message"
            disabled={!input.trim() || isTyping}
            className={`absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center text-white transition-colors ${
              input.trim() && !isTyping ? "bg-imessage-blue" : "bg-ios-subtle"
            }`}
          >
            {/* up-arrow send icon */}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 19V5M12 5l-6 6M12 5l6 6"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </form>
    </section>
  );
}
