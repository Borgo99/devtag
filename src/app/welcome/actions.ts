"use server";

import { redirect } from "next/navigation";
import { currentAccount } from "@/lib/session";
import { createProfile, sourceOfVisitor } from "@/lib/store";
import { usernameError } from "@/lib/usernames";
import { visitor } from "@/lib/visits";

/** Claims the chosen name for the signed-in user and creates their page, starting from the name their sign-in provider gave. */
export async function claimAction(form: FormData) {
  const account = await currentAccount();
  if (!account) redirect("/login");
  if (account.profile) redirect("/admin");

  const username = String(form.get("username") ?? "")
    .trim()
    .toLowerCase();
  const back = (error: string) => redirect(`/welcome?${new URLSearchParams({ username, error })}`);

  const error = usernameError(username);
  if (error) back(error);

  // Where the user came from: their visit to the main site today, matched by its daily hash (api/hit).
  const who = await visitor();
  const source = who && (await sourceOfVisitor(who));

  const created = await createProfile(
    account.user.id,
    username,
    { profile: { name: account.user.name ?? "", role: "" }, skills: [] },
    source,
  );
  if (!created) back("This name is already taken.");
  redirect("/admin");
}
