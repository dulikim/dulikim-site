import { redirect } from "next/navigation";

// The root URL "/" simply forwards to /contact, which is our real landing page.
// (Per PROJECT_CONTEXT.md: the site's default page is Contact, not a homepage.)
export default function RootPage() {
  redirect("/contact");
}
