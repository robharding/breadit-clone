"use client";

import { FC } from "react";
import { Button } from "./ui/Button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { PostDeletionRequest } from "@/lib/validators/post";
import { usePathname, useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

interface PostDeleteButtonProps {
  postId: string;
}

const PostDeleteButton: FC<PostDeleteButtonProps> = ({ postId }) => {
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { mutate: deletePost } = useMutation({
    mutationFn: async (payload: PostDeletionRequest) => {
      const { data } = await axios.post("/api/subreddit/post/delete", payload);

      return data;
    },
    onSuccess() {
      const newPathname = pathname.split("/").slice(0, -2).join("/");
      router.push(newPathname);
      queryClient.invalidateQueries({ queryKey: ["infinite-query"] });
      router.refresh();

      return toast({
        description: "your post was deleted",
      });
    },
    onError() {
      return toast({
        description: "something went wrong.",
        variant: "destructive",
      });
    },
  });

  return (
    <Button
      className="absolute right-4 top-4 bg-red-500"
      variant="destructive"
      size="sm"
      onClick={() => deletePost({ id: postId })}
    >
      Delete
    </Button>
  );
};

export default PostDeleteButton;
