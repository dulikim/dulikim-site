import ChatWidget from "../components/ChatWidget";
import EmailWidget from "../components/EmailWidget";
import ResumeWidget from "../components/ResumeWidget";

export default function ContactPage() {
  return (
    <main className="px-4 pb-16">
      <div className="mx-auto w-full max-w-2xl flex flex-col gap-7">
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
