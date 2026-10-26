"use server";

import { redirect } from "next/navigation";
import { currentUser, signOut } from "@/lib/session";
import { saveMatching } from "@/lib/store";

export async function signOutAction() {
  await signOut();
  redirect("/");
}

const LOCATION_MAX = 80;

/** The editor's private "Companies" section. Returns false when it couldn't save. */
export async function saveMatchingAction(input: { consent: boolean; location: string }) {
  const user = await currentUser();
  if (!user) return false;
  const location =
    typeof input?.location === "string"
      ? input.location
          .replace(/[\p{Cc}\p{Cf}]/gu, "")
          .replace(/\s+/g, " ")
          .trim()
          .slice(0, LOCATION_MAX)
      : "";
  return Boolean(await saveMatching(user.id, input?.consent === true, location || undefined));
}
