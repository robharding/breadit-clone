import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { PostDeleteValidator } from "@/lib/validators/post";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();

    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { id } = PostDeleteValidator.parse(body);

    const post = await db.post.findFirst({
      where: {
        id,
      },
    });

    if (post?.authorId != session.user.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    await db.post.delete({
      where: {
        id,
      },
    });

    // TODO: DELETE IN CACHE

    return new Response("OK");
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response("Invalid request data passed", { status: 422 });
    }
    return new Response("Could not delete post", { status: 500 });
  }
}
