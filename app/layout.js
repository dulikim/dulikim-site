import "./globals.css";
import NavBar from "./components/NavBar";
import { Analytics } from "@vercel/analytics/next";

// `metadata` is how Next.js sets the browser-tab title and the page description
// (used by search engines / link previews). It lives in the root layout so it
// applies site-wide unless a page overrides it.
export const metadata = {
  title: "Duli Kim — Contact",
  description: "Get in touch with Duli Kim.",
};

// RootLayout wraps every page. `children` is whatever page is being shown
// (right now, just the Contact page at app/page.js).
export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full">
        <NavBar />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
