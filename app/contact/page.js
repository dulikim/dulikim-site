import ChatWidget from "../components/ChatWidget";

// This page lives at /contact. The root URL "/" redirects here (see app/page.js),
// so dulikim.com lands visitors on Contact — the project's intended landing page.

// Small placeholder card so the three-widget layout is visible now, without
// building Widget 2/3 functionality yet (those are their own sessions).
function PlaceholderWidget({ title, note }) {
  return (
    <section className="bg-ios-card rounded-ios shadow-ios p-7 flex flex-col items-center justify-center text-center gap-1.5 min-h-[170px] border border-dashed border-ios-hairline">
      <p className="text-lg font-semibold">{title}</p>
      <p className="text-base text-ios-subtle">{note}</p>
    </section>
  );
}

export default function ContactPage() {
  return (
    <main className="px-4 pb-16">
      <div className="mx-auto w-full max-w-2xl flex flex-col gap-7">
        {/* Centered heading (iOS-style: centered layout throughout) */}
        <header className="text-center mb-2">
          <h1 className="text-4xl font-bold tracking-tight">Get in touch</h1>
          <p className="text-lg text-ios-subtle mt-2">
            Chat with my assistant, email me, or grab my resume.
          </p>
        </header>

        {/* Widget 1 — the AI chatbot (currently a static shell) */}
        <ChatWidget />

        {/* Widgets 2 & 3 — side by side below the chat (marco.fyi layout).
            Stacks to one column on small screens. */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <PlaceholderWidget
            title="Email Me"
            note="Widget 2 (mailto) — coming in a later session"
          />
          <PlaceholderWidget
            title="Get My Resume"
            note="Widget 3 (resume auto-send) — coming in a later session"
          />
        </div>
      </div>
    </main>
  );
}
