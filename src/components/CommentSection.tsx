import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import PostComment from "./PostComment";
import CreateComment from "./CreateComment";

interface CommentSectionProps {
  postId: string;
}

const CommentSection = async ({ postId }: CommentSectionProps) => {
  const session = await getAuthSession();

  // fetch the top level comments (comments replying to the post, not other comments)
  const comments = await db.comment.findMany({
    where: {
      postId,
      replyToId: null,
    },
    include: {
      author: true,
      votes: true,
      replies: {
        include: {
          author: true,
          votes: true,
        },
      },
    },
  });

  return (
    <div className="flex flex-col gap-y-4 mt-4">
      <CreateComment postId={postId} />

      <div className="flex flex-col gap-y-6 mt-4">
        {comments
          .filter((comment) => !comment.replyToId)
          .map((comment) => {
            const commentVotesAmt = comment.votes.reduce(
              (acc, vote) => (vote.type == "UP" ? acc + 1 : acc - 1),
              0
            );

            const commentVote = comment.votes.find(
              (vote) => vote.userId == session?.user.id
            );

            return (
              <div key={comment.id} className="flex flex-col">
                <div className="mb-2">
                  <PostComment
                    postId={postId}
                    comment={comment}
                    votesAmt={commentVotesAmt}
                    currentVote={commentVote?.type}
                  />
                </div>
                {comment.replies.map((reply) => {
                  const replyVotesAmt = reply.votes.reduce(
                    (acc, vote) => (vote.type == "UP" ? acc + 1 : acc - 1),
                    0
                  );

                  const replyVote = reply.votes.find(
                    (vote) => vote.userId == session?.user.id
                  );

                  return (
                    <div
                      key={reply.id}
                      className="mt-4 pl-4 border-l-2 border-zinc-200"
                    >
                      <PostComment
                        postId={postId}
                        comment={reply}
                        votesAmt={replyVotesAmt}
                        currentVote={replyVote?.type}
                        reply
                      />
                    </div>
                  );
                })}
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default CommentSection;
