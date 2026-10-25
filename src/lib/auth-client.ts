import { createAuthClient } from "better-auth/react";

/** Login from the browser: talks to /api/auth on this site. */
export const authClient = createAuthClient();
