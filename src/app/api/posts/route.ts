import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const session = await getAuthSession();

  const PostsValidator = z.object({
    limit: z.string(),
    page: z.string(),
    subredditName: z.string().nullish().optional(),
  });

  try {
    const { limit, page, subredditName } = PostsValidator.parse({
      subredditName: url.searchParams.get("subredditName"),
      limit: url.searchParams.get("limit"),
      page: url.searchParams.get("page"),
    });

    let whereClause = {};

    if (subredditName) {
      whereClause = {
        subreddit: {
          name: subredditName,
        },
      };
    } else if (session?.user) {
      const followedSubredditIds = await db.subscription
        .findMany({
          where: {
            userId: session.user.id,
          },
          select: {
            subredditId: true,
          },
        })
        .then((subreddits) =>
          subreddits.map((subreddit) => subreddit.subredditId)
        );

      whereClause = {
        subredditId: {
          in: followedSubredditIds,
        },
      };
    }

    const posts = await db.post.findMany({
      take: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit),
      where: whereClause,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        subreddit: true,
        votes: true,
        author: true,
        comments: true,
      },
    });

    return new Response(JSON.stringify(posts));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response("Invalid request data passed", { status: 422 });
    }
    return new Response("Could not fetch posts", { status: 500 });
  }
}
