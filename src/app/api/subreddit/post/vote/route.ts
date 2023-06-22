import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { PostVoteValidator } from "@/lib/validators/vote";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();

    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { postId, voteType } = PostVoteValidator.parse(body);
    const voteData = {
      userId: session.user.id,
      postId,
    };

    // check if user has voted already
    const userVote = await db.vote.findFirst({ where: voteData });
    if (userVote) {
      if (userVote.type == voteType) {
        await db.vote.delete({
          where: {
            userId_postId: voteData,
          },
        });
      } else {
        await db.vote.update({
          where: {
            userId_postId: voteData,
          },
          data: {
            type: voteType,
          },
        });
      }
    } else {
      await db.vote.create({
        data: {
          type: voteType,
          ...voteData,
        },
      });
    }

    return new Response(voteType);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response("Invalid request data passed", { status: 422 });
    }
    return new Response("Could not create vote", { status: 500 });
  }
}
