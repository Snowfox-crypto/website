"use server";
import { auth, signIn } from "@/auth";
import { createAccount } from "@/lib/evoverses/fetch";
import { Provider } from "@/types/auth";
import { cookies } from "next/headers";

export const linkAccount = async (provider: Provider) => {
  const session = await auth();
  if (session !== null) {
    switch (provider) {
      case "twitch":
      case "google":
        cookies().set({
          name: "link-provider",
          value: JSON.stringify({
            provider,
            sessionTicket: session.playFab.SessionTicket,
          }),
        });
        await signIn(provider);

      // await linkTwitch(session.playFab.SessionTicket, session.account.access_token);
    }
  }

};

export const createAccountAction = async (accountId: string) => {
  return createAccount(accountId);
};
