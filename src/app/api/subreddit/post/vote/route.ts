import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { redis } from "@/lib/redis";
import { PostVoteValidator } from "@/lib/validators/vote";
import { CachedPost } from "@/types/redis";
import { z } from "zod";

const CACHE_AFTER_UPVOTES = 1;

export async function PATCH(req: Request) {
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
      if (userVote.type === voteType) {
        await db.vote.delete({
          where: {
            userId_postId: voteData,
          },
        });
        return new Response("OK");
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

    const post = await db.post.findFirst({
      where: {
        id: postId,
      },
      include: {
        author: true,
        votes: true,
      },
    });

    if (!post) {
      return new Response("Post not found", { status: 404 });
    }

    // recount the votes
    const votesAmt = post.votes.reduce(
      (acc, vote) => (vote.type == "UP" ? acc + 1 : acc - 1),
      0
    );

    // cache high engagement posts
    if (Math.abs(votesAmt) >= CACHE_AFTER_UPVOTES) {
      const cachePayload: CachedPost = {
        id: post.id,
        title: post.title,
        authorUsername: post.author.username ?? "",
        authorId: post.authorId,
        content: JSON.stringify(post.content),
        createdAt: post.createdAt,
      };

      await redis.hset(`posts:${postId}`, cachePayload);
    }

    return new Response("OK");
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response("Invalid request data passed", { status: 422 });
    }
    return new Response("Could not create vote", { status: 500 });
  }
}
