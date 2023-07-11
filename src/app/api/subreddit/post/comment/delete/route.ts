import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { CommentDeleteValidator } from "@/lib/validators/comment";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();

    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { id } = CommentDeleteValidator.parse(body);

    const comment = await db.comment.findFirst({
      where: {
        id,
      },
    });

    if (comment?.authorId != session.user.id) {
      return new Response("Unauthorized", { status: 401 });
    }

    await db.comment.updateMany({
      where: {
        replyToId: id,
      },
      data: {
        replyToId: null,
      },
    });

    await db.comment.delete({
      where: {
        id,
      },
    });

    return new Response("OK");
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response("Invalid request data passed", { status: 422 });
    }
    return new Response("Could not delete comment", { status: 500 });
  }
}
