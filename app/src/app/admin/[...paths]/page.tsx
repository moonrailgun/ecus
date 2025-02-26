"use client";

import dynamic from "next/dynamic";

const Admin = dynamic(
  () => import("@/app/_components/admin").then((m) => m.Admin),
  { ssr: false },
);

export default function Page() {
  return <Admin />;
}
