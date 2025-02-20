"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import React from "react";

interface RedirectProps {
  to: string;
}

export const Redirect: React.FC<RedirectProps> = React.memo((props) => {
  const router = useRouter();

  router.replace(props.to);

  return null;
});
Redirect.displayName = "Redirect";

export const ClientRedirect: React.FC<RedirectProps> = React.memo((props) => {
  const router = useRouter();

  useEffect(() => {
    router.replace(props.to);
  }, [props.to, router]);

  return null;
});
ClientRedirect.displayName = "ClientRedirect";
