"use client";

import { useState } from "react";

export default function EmailWidget() {
  const [subject, setSubject] = useState("Let's Chat");
  const [body, setBody] = useState("");

  function handleSend() {
    const url = `mailto:dulikim@umich.edu?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    globalThis.location.href = url;
  }

  return (
    // focus-within: keeps the card dark while the visitor is actively typing,
    // not just while hovering. group-focus-within: propagates that to children.
    <div className="group rounded-ios shadow-ios p-5 bg-white hover:bg-[#1c1c1e] focus-within:bg-[#1c1c1e] transition-colors duration-300">
      {/* Name + availability — icon slot on the right reserved for calendar link */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="font-bold text-[18px] leading-tight text-ios-text group-hover:text-white group-focus-within:text-white transition-colors duration-300">
            Duli Kim
          </p>
          <p className="text-sm text-ios-subtle group-hover:text-[#8e8e93] group-focus-within:text-[#8e8e93] mt-0.5 transition-colors duration-300">
            Send me an email!
          </p>
        </div>
      </div>

      {/* Compose area with left accent bar */}
      <div className="border-l-[3px] border-[#0b93f6] pl-3 mb-5">
        {/* To — static */}
        <div className="flex items-center gap-3 py-1.5 border-b border-ios-hairline group-hover:border-[#2c2c2e] group-focus-within:border-[#2c2c2e] transition-colors duration-300">
          <span className="text-xs text-ios-subtle group-hover:text-[#636366] group-focus-within:text-[#636366] w-5 flex-shrink-0 transition-colors duration-300">
            To
          </span>
          <span className="text-sm text-ios-text group-hover:text-white group-focus-within:text-white transition-colors duration-300">
            dulikim@umich.edu
          </span>
        </div>

        {/* Subject — editable, pre-filled */}
        <div className="py-1.5 border-b border-ios-hairline group-hover:border-[#2c2c2e] group-focus-within:border-[#2c2c2e] transition-colors duration-300">
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full bg-transparent text-sm text-ios-text group-hover:text-white group-focus-within:text-white placeholder:text-ios-subtle outline-none caret-[#0b93f6] transition-colors duration-300"
          />
        </div>

        {/* Body — editable */}
        <div className="pt-1.5">
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="type your message here - clicking Email Me opens your mail app with everything already filled out ✉️"
            rows={3}
            className="w-full bg-transparent text-sm text-ios-text group-hover:text-white group-focus-within:text-white placeholder:text-ios-subtle resize-none outline-none caret-[#0b93f6] transition-colors duration-300"
          />
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={handleSend}
        className="w-full border border-ios-hairline group-hover:border-[#3a3a3c] group-focus-within:border-[#3a3a3c] rounded-full py-2.5 flex items-center justify-center gap-1.5 transition-colors duration-300 cursor-pointer"
      >
        <span className="text-sm font-medium text-ios-text group-hover:text-white group-focus-within:text-white transition-colors duration-300">
          Email Me
        </span>
        <span
          className="text-sm text-ios-text group-hover:text-white group-focus-within:text-white transition-colors duration-300"
          aria-hidden="true"
        >
          ↗
        </span>
      </button>
    </div>
  );
}
