import Link from "next/link";

import { auth } from "@/server/auth";
import { HydrateClient } from "@/trpc/server";

const guideItems = [
  {
    title: "1. Create or choose a Project",
    description:
      "Open Admin, use the project switcher, then manage the selected project from Setting.",
    href: "/admin/setting",
    action: "Project Setting",
  },
  {
    title: "2. Prepare Channels",
    description:
      "Default and production are created automatically. Add extra channels like staging when you need them.",
    href: "/admin/channel",
    action: "Manage Channels",
  },
  {
    title: "3. Connect the CLI",
    description:
      "Copy your API key and initialize the CLI with the selected project id.",
    href: "/admin/apikey",
    action: "Get API Key",
  },
  {
    title: "4. Upload and promote",
    description:
      "Upload deployments from the CLI, then promote a deployment to the target channel in Admin.",
    href: "/admin/deployment",
    action: "View Deployments",
  },
];

export default async function Home() {
  const session = await auth();

  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
        <div className="container flex flex-col items-center gap-10 px-4 py-16">
          <h1 className="text-center text-5xl font-extrabold tracking-tight sm:text-[5rem]">
            <div>
              Expo <span className="text-[hsl(280,100%,70%)]">Custom</span>
            </div>
            <div>Updates System</div>
          </h1>
          <div className="flex flex-col items-center gap-2">
            <div className="flex flex-col items-center justify-center gap-4">
              <p className="text-center text-2xl text-white">
                {session && <span>Logged in as {session.user.name}</span>}
              </p>
              <Link
                href={session ? "/api/auth/signout" : "/api/auth/signin"}
                className="rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20"
              >
                {session ? "Sign out" : "Sign in"}
              </Link>
            </div>
          </div>

          {session?.user && (
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/admin"
                className="group rounded-md bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20"
              >
                Open Admin
                <span className="ml-1 transition-all group-hover:ml-2">
                  {"->"}
                </span>
              </Link>
            </div>
          )}

          <section className="grid w-full max-w-5xl gap-3 md:grid-cols-2">
            {guideItems.map((item) => (
              <div
                key={item.title}
                className="rounded-md border border-white/10 bg-white/10 p-5 shadow-lg shadow-black/10"
              >
                <h2 className="text-lg font-semibold">{item.title}</h2>
                <p className="mt-2 text-sm leading-6 text-white/75">
                  {item.description}
                </p>
                <Link
                  href={item.href}
                  className="mt-4 inline-flex rounded-md bg-white px-4 py-2 text-sm font-semibold text-[#15162c] no-underline transition hover:bg-white/90"
                >
                  {item.action}
                </Link>
              </div>
            ))}
          </section>

          <div className="w-full max-w-5xl rounded-md border border-white/10 bg-black/20 p-5">
            <div className="text-sm font-semibold text-white/80">
              CLI initialization
            </div>
            <pre className="mt-3 overflow-x-auto rounded-md bg-black/30 p-4 text-sm text-white/85">
              <code>
                {
                  "ecus init --url <server-url> --projectId <project-id> --apikey <api-key>"
                }
              </code>
            </pre>
          </div>
        </div>
      </main>
    </HydrateClient>
  );
}
