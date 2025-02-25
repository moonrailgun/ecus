import NextAuth, { Session } from "next-auth";
import { cache } from "react";

import { authConfig } from "./config";
import { getUserInfoWithApikey } from "../cache/user";

const { auth: uncachedAuth, handlers, signIn, signOut } = NextAuth(authConfig);

const auth = cache(uncachedAuth);

export async function getSession(headers: Headers) {
  const authorization = headers.get("Authorization");
  let session: Session | null = null;
  if (authorization) {
    const apiKey = authorization.replace("Bearer ", "");
    const userInfo = await getUserInfoWithApikey(apiKey);

    if (userInfo) {
      session = {
        expires: "",
        user: {
          id: userInfo.id,
          name: userInfo.name,
          email: userInfo.email,
          image: userInfo.image,
        },
      };
    } else {
      session = await auth();
    }
  } else {
    session = await auth();
  }

  return session;
}

export { auth, handlers, signIn, signOut };
