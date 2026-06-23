"use client";

// Client component: it tracks the current URL and measures tab positions in the
// browser, so it must run client-side.

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

// The four tabs and the URLs they map to (from PROJECT_CONTEXT.md).
const TABS = [
  { label: "Home", href: "/nihao" },
  { label: "About", href: "/about" },
  { label: "Blog", href: "/thoughts" },
  { label: "Contact", href: "/contact" },
];

export default function NavBar() {
  // usePathname() gives the current URL path (e.g. "/contact"), so we can tell
  // which tab is active. It updates on every client-side navigation.
  const pathname = usePathname();
  const matched = TABS.findIndex((t) => pathname.startsWith(t.href));
  // Default to Contact (last tab) when nothing matches — that's the page we're on.
  const activeIndex = matched === -1 ? TABS.length - 1 : matched;

  // We measure each tab's real position/width so the sliding highlight can match
  // tabs of different label lengths exactly.
  const tabRefs = useRef([]);
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });
  // Keep the sliding transition OFF for the very first positioning (so it
  // appears in place instead of animating in from the left on page load).
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    const el = tabRefs.current[activeIndex];
    if (!el) return;
    setIndicator({ left: el.offsetLeft, width: el.offsetWidth });
    // Enable the slide animation only after the first placement.
    const id = requestAnimationFrame(() => setAnimate(true));
    return () => cancelAnimationFrame(id);
  }, [activeIndex]);

  // Re-measure if the window resizes (tab widths can change).
  useEffect(() => {
    function onResize() {
      const el = tabRefs.current[activeIndex];
      if (el) setIndicator({ left: el.offsetLeft, width: el.offsetWidth });
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [activeIndex]);

  return (
    <nav className="flex justify-center pt-8 pb-4">
      <div className="relative flex items-center gap-1 rounded-full bg-ios-card p-1.5 shadow-ios">
        {/* The sliding highlight: a single element that translates/resizes via a
            CSS transition, rather than re-styling each tab. */}
        <span
          aria-hidden="true"
          className={`absolute top-1.5 bottom-1.5 rounded-full bg-white shadow-sm ${
            animate ? "transition-all duration-300 ease-out" : ""
          }`}
          style={{ left: indicator.left, width: indicator.width }}
        />
        {TABS.map((tab, i) => (
          <Link
            key={tab.href}
            href={tab.href}
            ref={(el) => (tabRefs.current[i] = el)}
            aria-current={i === activeIndex ? "page" : undefined}
            className={`relative z-10 rounded-full px-6 py-2.5 text-[15px] font-medium transition-colors ${
              i === activeIndex
                ? "text-ios-text"
                : "text-ios-subtle hover:text-ios-text"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
