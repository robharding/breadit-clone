import { Post, Vote, VoteType } from "@prisma/client";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import PostVoteClient from "./PostVoteClient";
import { getAuthSession } from "@/lib/auth";

interface PostVoteServerProps {
  postId: string;
  initialVotesAmt?: number;
  initialVote?: VoteType | null;
  getData?: () => Promise<(Post & { votes: Vote[] }) | null>;
}

const PostVoteServer = async ({
  postId,
  initialVotesAmt,
  initialVote,
  getData,
}: PostVoteServerProps) => {
  const session = await getAuthSession();

  let _votesAmt: number = 0;
  let _currentVote: Vote["type"] | null | undefined = undefined;

  if (getData) {
    const post = await getData();
    if (!post) return notFound();

    _votesAmt = post.votes.reduce(
      (acc, vote) => (vote.type === "UP" ? acc + 1 : acc - 1),
      0
    );

    // current vote not working
    _currentVote = post.votes.find(
      (vote) => vote.userId == session?.user?.id
    )?.type;
  } else {
    _votesAmt = initialVotesAmt ?? 0;
    _currentVote = initialVote;
  }

  return (
    <PostVoteClient
      initialVotesAmt={_votesAmt}
      initialVote={_currentVote}
      postId={postId}
    />
  );
};

export default PostVoteServer;
