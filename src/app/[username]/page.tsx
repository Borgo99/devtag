import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProfilePage } from "@/components/profile/ProfilePage";
import { Unclaimed } from "@/components/Unclaimed";
import { profileMetadata } from "@/lib/metadata";
import { profileBase, publishedProfile, requestOrigin } from "@/lib/profiles";
import { DISPLAY_DOMAIN } from "@/lib/site";
import { getProfile } from "@/lib/store";
import { usernameError } from "@/lib/usernames";

/** A user's page: andrea.devtag.io (rewritten here by proxy.ts) or devtag.io/andrea. */

interface Props {
  params: Promise<{ username: string }>;
}

/** Nobody has this name yet: the page invites the visitor to take it. */
const isFree = async (username: string) => !usernameError(username) && !(await getProfile(username));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const published = await publishedProfile(username);
  if (!published) return { title: `${username}.${DISPLAY_DOMAIN}` };
  return profileMetadata(published.config, {
    base: await profileBase(username),
    origin: await requestOrigin(),
    version: published.version,
  });
}

export default async function UserPage({ params }: Props) {
  const { username } = await params;
  const published = await publishedProfile(username);
  if (published) return <ProfilePage config={published.config} base={await profileBase(username)} />;
  if (await isFree(username)) return <Unclaimed username={username} />;
  notFound();
}
