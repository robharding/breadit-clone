import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { CommentVoteValidator } from "@/lib/validators/vote";
import { z } from "zod";

export async function PATCH(req: Request) {
  try {
    const session = await getAuthSession();

    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { commentId, voteType } = CommentVoteValidator.parse(body);

    const comment = await db.comment.findFirst({
      where: {
        id: commentId,
      },
      include: {
        author: true,
        votes: true,
      },
    });

    if (!comment) {
      return new Response("Comment not found", { status: 404 });
    }

    const voteData = {
      userId: session.user.id,
      commentId,
    };

    // check if user has voted already
    const userVote = await db.commentVote.findFirst({ where: voteData });

    if (userVote) {
      if (userVote.type === voteType) {
        await db.commentVote.delete({
          where: {
            userId_commentId: voteData,
          },
        });
        return new Response("OK");
      } else {
        await db.commentVote.update({
          where: {
            userId_commentId: voteData,
          },
          data: {
            type: voteType,
          },
        });
      }
    } else {
      await db.commentVote.create({
        data: {
          type: voteType,
          ...voteData,
        },
      });
    }

    return new Response("OK");
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response("Invalid request data passed", { status: 422 });
    }
    return new Response("Could not create vote", { status: 500 });
  }
}
