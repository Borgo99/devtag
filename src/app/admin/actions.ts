"use server";

import { redirect } from "next/navigation";
import { endGuestPage } from "@/lib/guest";
import { currentUser, signOut } from "@/lib/session";
import { PHONE } from "@/lib/cv/document";
import { saveMatching, savePhone } from "@/lib/store";

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

/** The phone number for the CV as a PDF (editor's PDF panel). Empty removes it. False: not a phone number. */
export async function savePhoneAction(input: string) {
  const user = await currentUser();
  if (!user) return false;
  const phone = typeof input === "string" ? input.replace(/\s+/g, " ").trim() : "";
  if (phone && !PHONE.test(phone)) return false;
  return Boolean(await savePhone(user.id, phone || undefined));
}

/** The editor used the page made from a CV on the landing, or the user turned it down: its copy is deleted. */
export async function endGuestPageAction() {
  const user = await currentUser();
  if (user) await endGuestPage(user.id);
}
