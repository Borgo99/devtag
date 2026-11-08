import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { auth } from "./auth";
import { getProfileOfUser } from "./store";

/** devtag's own team, for admin/stats and admin/report: the verified emails in STATS_EMAILS, comma-separated. */
const TEAM = (process.env.STATS_EMAILS ?? "")
  .split(",")
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean);

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

/** For devtag's own pages: anyone but the team gets a 404. On the dev server (`next dev`) anyone gets in. */
export async function requireTeam() {
  if (process.env.NODE_ENV === "development") return;
  const user = await currentUser();
  if (!user?.emailVerified || !TEAM.includes(user.email.toLowerCase())) notFound();
}

export async function signOut() {
  await auth.api.signOut({ headers: await headers() });
}
