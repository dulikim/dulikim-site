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
            See my availability
          </p>
        </div>

        {/* Notion Calendar icon — swap for <a href="..."> once Calendly/cal.com is set up */}
        <button
          type="button"
          onClick={(e) => e.stopPropagation()}
          aria-label="Schedule a meeting"
          className="w-10 h-10 rounded-[9px] bg-black flex items-center justify-center flex-shrink-0 hover:opacity-80 transition-opacity cursor-pointer"
        >
          {/* Notion "N" wordmark */}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="white" aria-hidden="true">
            <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.046-.326L17.86 1.968c-.42-.326-.981-.7-2.055-.607L3.01 2.295c-.466.046-.56.28-.374.466zm.793 3.08v13.904c0 .747.373 1.027 1.214.98l14.523-.84c.841-.046.935-.56.935-1.167V6.354c0-.606-.233-.933-.748-.887l-15.177.887c-.56.047-.747.327-.747.933zm14.337.745c.093.42 0 .84-.42.888l-.7.14v10.264c-.608.327-1.168.514-1.635.514-.748 0-.935-.234-1.495-.933l-4.577-7.186v6.952L12.21 19s0 .84-1.168.84l-3.222.186c-.093-.186 0-.653.327-.746l.84-.233V9.854L7.822 9.76c-.094-.42.14-1.026.793-1.073l3.456-.233 4.764 7.279v-6.44l-1.215-.14c-.093-.514.28-.887.747-.933zM1.936 1.035l13.31-.98c1.634-.14 2.055-.047 3.082.7l4.249 2.986c.7.513.934.653.934 1.213v16.378c0 1.026-.373 1.634-1.68 1.726l-15.458.934c-.98.047-1.448-.093-1.962-.747l-3.129-4.06c-.56-.747-.793-1.306-.793-1.96V2.667c0-.839.374-1.54 1.447-1.632z"/>
          </svg>
        </button>
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
