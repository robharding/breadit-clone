import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

export default async function PATCH(req: Request) {
  const url = new URL(req.url);
  const session = await getAuthSession();

  if (!session?.user)
    return new Response("You must be logged in to do that", { status: 400 });

  const usernameValidator = z.object({
    username: z.string(),
  });

  try {
    const { username } = usernameValidator.parse({
      username: url.searchParams.get("username"),
    });

    // check if taken
    const taken = await db.user.findFirst({
      where: {
        username,
      },
    });
    if (taken) return new Response("That username is taken", { status: 409 });

    await db.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        username,
      },
    });

    return new Response("OK");
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response("Invalid request data passed", { status: 422 });
    }
    return new Response("Could not change username", { status: 500 });
  }
}
