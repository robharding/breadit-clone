"use client";

import { ExtendedPost } from "@/types/db";
import { FC, useEffect, useRef } from "react";
import { useIntersection } from "@mantine/hooks";
import { useInfiniteQuery } from "@tanstack/react-query";
import { INFINITE_SCROLLING_PAGINATION_RESULTS } from "@/config";
import axios from "axios";
import { Vote } from "@prisma/client";
import Post from "./Post";
import { Loader2 } from "lucide-react";

interface PostFeedProps {
  initialPosts: ExtendedPost[];
  subredditName?: string;
  userId: string | undefined;
}

const PostFeed: FC<PostFeedProps> = ({
  initialPosts,
  subredditName,
  userId,
}) => {
  const lastPostRef = useRef<HTMLElement>(null);
  const { ref, entry } = useIntersection({
    root: lastPostRef.current,
    threshold: 1,
  });

  const { data, fetchNextPage, isFetchingNextPage } = useInfiniteQuery(
    ["infinite-query"],
    async ({ pageParam = 1 }) => {
      const query =
        `/api/posts?limit=${INFINITE_SCROLLING_PAGINATION_RESULTS}&page=${pageParam}` +
        (!!subredditName ? `&subredditName=${subredditName}` : "");

      const { data } = await axios.get(query);
      return data as ExtendedPost[];
    },
    {
      getNextPageParam: (_, pages) => {
        return pages.length + 1;
      },
      initialData: { pages: [initialPosts], pageParams: [1] },
    }
  );

  useEffect(() => {
    if (entry?.isIntersecting) {
      fetchNextPage();
    }
  }, [entry, fetchNextPage]);

  const posts = data?.pages.flatMap((page) => page) ?? initialPosts;

  return (
    <ul className="flex flex-col col-span-2 space-y-6">
      {posts.map((post, index) => {
        const votesAmount = post.votes.reduce(
          (acc, vote) => (vote.type === "UP" ? acc + 1 : acc - 1),
          0
        );

        const currentVote = post.votes.find((vote: Vote) => {
          return vote.userId === userId;
        });

        // if it's the last post, add a ref to it so we can fetch more posts when its in view
        return (
          <li key={post.id} ref={index === posts.length - 1 ? ref : undefined}>
            <Post
              subredditName={post.subreddit.name}
              post={post}
              commentAmt={post.comments.length}
              votesAmt={votesAmount}
              currentVote={currentVote}
            />
          </li>
        );
      })}
      {isFetchingNextPage && (
        <li className="h-10 flex items-center justify-center text-zinc-500">
          <Loader2 className="w-5 h-5 animate-spin" />
        </li>
      )}
    </ul>
  );
};

export default PostFeed;
