"use server";

import { redirect } from "next/navigation";
import { currentAccount } from "@/lib/session";
import { createProfile } from "@/lib/store";
import { usernameError } from "@/lib/usernames";

/** Claims the chosen name for the signed-in user and creates their page, starting from their Google name. */
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

  const created = await createProfile(account.user.id, username, {
    profile: { name: account.user.name ?? "", role: "" },
    skills: [],
  });
  if (!created) back("This name is already taken.");
  redirect("/admin");
}
