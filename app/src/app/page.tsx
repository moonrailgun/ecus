import Link from "next/link";

import { auth } from "@/server/auth";
import { HydrateClient } from "@/trpc/server";

export default async function Home() {
  const session = await auth();

  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
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
            <div>
              <Link
                href="/admin"
                className="group rounded-md bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20"
              >
                Entry Admin Platform
                <span className="ml-1 transition-all group-hover:ml-2">
                  {"->"}
                </span>
              </Link>
            </div>
          )}
        </div>
      </main>
    </HydrateClient>
  );
}
