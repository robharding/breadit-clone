import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { UsernameValidator } from "@/lib/validators/username";
import { z } from "zod";

export async function PATCH(req: Request) {
  const session = await getAuthSession();

  if (!session?.user)
    return new Response("You must be logged in to do that", { status: 400 });

  try {
    const body = await req.json();
    const { username } = UsernameValidator.parse(body);

    // check if taken
    const taken = await db.user.findFirst({
      where: {
        username,
      },
    });
    if (taken && taken.id == session.user.id)
      return new Response("You already have that username", { status: 409 });
    if (taken) return new Response("That username is taken", { status: 409 });

    await db.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        username,
      },
    });

    return new Response(username);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response("Invalid request data passed", { status: 422 });
    }
    return new Response("Could not change username", { status: 500 });
  }
}
