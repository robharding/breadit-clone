"use client";

import { FC, useRef, useState } from "react";
import UserAvatar from "./UserAvatar";
import { Comment, CommentVote, User, VoteType } from "@prisma/client";
import { formatTimeToNow } from "@/lib/utils";
import CommentVotes from "./CommentVotes";
import { Button } from "./ui/Button";
import { MessageSquare, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import CreateComment from "./CreateComment";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { CommentDeletionRequest } from "@/lib/validators/comment";
import { useToast } from "@/hooks/use-toast";

type ExtendedComment = Comment & {
  author: User;
  votes: CommentVote[];
};

interface PostCommentProps {
  comment: ExtendedComment;
  votesAmt: number;
  currentVote?: VoteType;
  postId: string;
  reply?: boolean;
}

const PostComment: FC<PostCommentProps> = ({
  comment,
  votesAmt,
  currentVote,
  postId,
  reply,
}) => {
  const router = useRouter();
  const pathName = usePathname();
  const { toast } = useToast();

  const { data: session } = useSession();

  const commentRef = useRef<HTMLDivElement>(null);
  const [isReplying, setIsReplying] = useState<boolean>(false);

  const isOwner = session?.user.id == comment.authorId;

  const { mutate: deleteComment } = useMutation({
    mutationFn: async (payload: CommentDeletionRequest) => {
      const { data } = await axios.post(
        "/api/subreddit/post/comment/delete",
        payload
      );

      return data;
    },
    onError() {
      return toast({
        description: "something went wrong.",
        variant: "destructive",
      });
    },
    onSuccess() {
      router.refresh();
      return toast({
        description: "comment deleted",
      });
    },
  });

  return (
    <div ref={commentRef} className="flex flex-col">
      <div className="flex items-center">
        <UserAvatar
          user={{
            name: comment.author.name || null,
            image: comment.author.image || null,
          }}
          className="h-6 w-6"
        />

        <div className="ml-2 flex items-center gap-x-2">
          <p className="text-sm font-medium text-gray-900">
            u/{comment.author.username}
          </p>
          <p className="max-h-40 truncate text-xs text-zinc-500">
            {formatTimeToNow(new Date(comment.createdAt))}
          </p>
        </div>
      </div>

      <p className="text-sm text-zinc-900 mt-2">{comment.text}</p>

      <div className="flex gap-2 items-center">
        <CommentVotes
          commentId={comment.id}
          initialVotesAmt={votesAmt}
          initialVote={currentVote}
        />

        {!reply && (
          <Button
            onClick={() => {
              if (!session) {
                router.push(`/sign-in?redirect=${pathName}`);
              }

              setIsReplying((prev) => !prev);
            }}
            variant="ghost"
            size="xs"
          >
            <MessageSquare className="h-4 w-4 mr-1.5" />
            Reply
          </Button>
        )}
        {isOwner && (
          <Button
            onClick={() => deleteComment({ id: comment.id })}
            variant="destructive"
            className="bg-red-500"
            size="xs"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      {isReplying ? (
        <div className="mt-2 ml-4">
          <CreateComment
            postId={postId}
            replyToId={comment.replyToId ?? comment.id}
            cancelCreate={() => {
              setIsReplying(false);
            }}
          />
        </div>
      ) : null}
    </div>
  );
};

export default PostComment;
