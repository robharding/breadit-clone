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
          .map((topLevelComment) => {
            const topLevelCommentVotesAmt = topLevelComment.votes.reduce(
              (acc, vote) => (vote.type == "UP" ? acc + 1 : acc - 1),
              0
            );

            const topLevelCommentVote = topLevelComment.votes.find(
              (vote) => vote.userId == session?.user.id
            );

            return (
              <div key={topLevelComment.id} className="flex flex-col">
                <div className="mb-2">
                  <PostComment
                    postId={postId}
                    comment={topLevelComment}
                    votesAmt={topLevelCommentVotesAmt}
                    currentVote={topLevelCommentVote?.type}
                  />
                </div>
                {topLevelComment.replies.map((replyComment) => {
                  const replyCommentVotesAmt = replyComment.votes.reduce(
                    (acc, vote) => (vote.type == "UP" ? acc + 1 : acc - 1),
                    0
                  );

                  const replyCommentVote = replyComment.votes.find(
                    (vote) => vote.userId == session?.user.id
                  );

                  return (
                    <div key={replyComment.id} className="mt-4 ml-6">
                      <PostComment
                        postId={postId}
                        comment={replyComment}
                        votesAmt={replyCommentVotesAmt}
                        currentVote={replyCommentVote?.type}
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
