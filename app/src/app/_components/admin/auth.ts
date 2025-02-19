import {
  type AuthProvider,
  createAuthHttpClient,
  createAuthProvider,
  type HTTPClient,
} from "tushan";

export const authStorageKey = "tailchat:admin:auth";

export const authProvider: AuthProvider = createAuthProvider({
  authStorageKey,
  loginUrl: "/admin/api/login",
});

export const authHTTPClient: HTTPClient = createAuthHttpClient(authStorageKey);
