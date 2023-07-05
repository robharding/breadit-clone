"use client";

import { useCustomToast } from "@/hooks/use-custom-toast";
import { usePrevious } from "@mantine/hooks";
import { VoteType } from "@prisma/client";
import { FC, useState } from "react";
import { Button } from "../ui/Button";
import { ArrowBigDown, ArrowBigUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { PostVoteRequest } from "@/lib/validators/vote";
import axios, { AxiosError } from "axios";
import { toast } from "@/hooks/use-toast";

interface PostVoteClientProps {
  postId: string;
  initialVotesAmt: number;
  initialVote?: VoteType | null;
  onFeed?: boolean;
}

const PostVoteClient: FC<PostVoteClientProps> = ({
  postId,
  initialVotesAmt,
  initialVote,
  onFeed,
}) => {
  const { loginToast } = useCustomToast();
  const [votesAmt, setVotesAmt] = useState<number>(initialVotesAmt);
  const [currentVote, setCurrentVote] = useState(initialVote);
  const previousVote = usePrevious(currentVote);

  const { mutate: vote } = useMutation({
    mutationFn: async (type: VoteType) => {
      const payload: PostVoteRequest = {
        postId,
        voteType: type,
      };

      await axios.patch("/api/subreddit/post/vote", payload);
    },
    onError: (err, voteType) => {
      if (err instanceof AxiosError && err.response?.status === 401) {
        loginToast();
      } else {
        toast({
          title: "Something went wrong",
          description:
            "There was an error submitting your vote. Please try again.",
          variant: "destructive",
        });
      }
      setCurrentVote(previousVote);
      setVotesAmt((prev) => prev - (voteType === "UP" ? 1 : -1));
    },
    onMutate: (voteType) => {
      // optomistic update
      if (currentVote === voteType) {
        setVotesAmt((prev) => prev - (voteType === "UP" ? 1 : -1));
        setCurrentVote(undefined);
      } else {
        setVotesAmt(
          (prev) =>
            prev +
            (voteType === "UP" ? (currentVote ? 2 : 1) : currentVote ? -2 : -1)
        );
        setCurrentVote(voteType);
      }
    },
  });

  return (
    <div
      className={cn(
        "flex gap-4 sm:gap-0 pr-6 sm:w-20 pb-4 sm:pb-0",
        onFeed ? "flex-col" : "sm:flex-col"
      )}
    >
      <Button
        size="sm"
        variant="ghost"
        aria-label="upvote"
        onClick={() => vote("UP")}
      >
        <ArrowBigUp
          className={cn("h-5 w-5 text-zinc-700", {
            "text-emerald-500 fill-emerald-500": currentVote === "UP",
          })}
        />
      </Button>

      <p className="text-center py-2 font-medium text-sm text-zinc-900">
        {votesAmt}
      </p>

      <Button
        size="sm"
        variant="ghost"
        aria-label="downvote"
        onClick={() => vote("DOWN")}
      >
        <ArrowBigDown
          className={cn("h-5 w-5 text-zinc-700", {
            "text-red-500 fill-red-500": currentVote === "DOWN",
          })}
        />
      </Button>
    </div>
  );
};

export default PostVoteClient;
