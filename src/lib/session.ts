import { headers } from "next/headers";
import { auth } from "./auth";
import { getProfileOfUser } from "./store";

/** The signed-in user (checked against the session in the database), or undefined. */
export async function currentUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user;
}

/** The signed-in user and their page; the page is undefined until they have claimed a name. */
export async function currentAccount() {
  const user = await currentUser();
  if (!user) return undefined;
  return { user, profile: await getProfileOfUser(user.id) };
}

export async function signOut() {
  await auth.api.signOut({ headers: await headers() });
}
