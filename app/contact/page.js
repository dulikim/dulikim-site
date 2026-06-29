import ChatWidget from "../components/ChatWidget";
import EmailWidget from "../components/EmailWidget";
import ResumeWidget from "../components/ResumeWidget";

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
          <EmailWidget />
          <ResumeWidget />
        </div>
      </div>
    </main>
  );
}
