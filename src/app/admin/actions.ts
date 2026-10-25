"use server";

import { redirect } from "next/navigation";
import { signOut } from "@/lib/session";

export async function signOutAction() {
  await signOut();
  redirect("/");
}
