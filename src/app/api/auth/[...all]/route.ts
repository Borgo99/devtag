import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth";

/** Better Auth's endpoints: Google sign-in and its callback, session, sign-out (/api/auth/...). */
export const { GET, POST } = toNextJsHandler(auth);
