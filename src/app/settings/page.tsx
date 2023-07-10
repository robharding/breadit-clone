import { authOptions, getAuthSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata = {
  title: "Settings",
  description: "Manage account and website settings.",
};

export default async function Settings() {
  const session = await getAuthSession();

  if (!session?.user) {
    redirect(authOptions.pages?.signIn || "/sign-in");
  }

  return <div>Settings</div>;
}
