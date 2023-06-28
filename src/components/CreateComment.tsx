"use client";

import { FC, useState } from "react";
import { Label } from "./ui/Label";
import { Textarea } from "./ui/Textarea";
import { Button } from "./ui/Button";
import { useMutation } from "@tanstack/react-query";
import { CommentCreationRequest } from "@/lib/validators/comment";
import axios, { AxiosError } from "axios";
import { useCustomToast } from "@/hooks/use-custom-toast";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

interface CreateCommentProps {
  postId: string;
}

const CreateComment: FC<CreateCommentProps> = ({ postId }) => {
  const [input, setInput] = useState<string>("");
  const { loginToast } = useCustomToast();
  const router = useRouter();

  const { mutate: submitComment, isLoading } = useMutation({
    mutationFn: async ({ postId, text, replyToId }: CommentCreationRequest) => {
      const payload: CommentCreationRequest = {
        postId,
        text,
        replyToId,
      };

      const { data } = await axios.patch(
        "/api/subreddit/post/comment",
        payload
      );

      return data;
    },
    onError(err) {
      if (err instanceof AxiosError) {
        if (err.response?.status === 401) {
          return loginToast();
        } else if (err.response?.status == 400) {
          return toast({
            title: "You must be subscribed.",
            description:
              "You must be subscribed to this subreddit to comment on this post.",
            variant: "destructive",
          });
        }
      }

      return toast({
        title: "There was a problem.",
        description: "Something went wrong. please try again later",
        variant: "destructive",
      });
    },
    onSuccess() {
      router.refresh();
    },
  });

  return (
    <div className="grid w-full gap-1.5">
      <Label htmlFor="comment">Your comment:</Label>
      <div className="mt-2">
        <Textarea
          id="comment"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={1}
          style={{ minHeight: "auto" }}
          placeholder="What are your thoughts?"
        />

        <div className="mt-2 flex justify-end">
          <Button
            isLoading={isLoading}
            disabled={input.length == 0}
            onClick={() =>
              submitComment({
                postId,
                text: input,
                replyToId: undefined,
              })
            }
          >
            Post
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateComment;
