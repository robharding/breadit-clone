import { z } from "zod";

export const CommentValidator = z.object({
  postId: z.string(),
  text: z.string(),
  replyToId: z.string().optional(),
});

export type CommentCreationRequest = z.infer<typeof CommentValidator>;

export const CommentDeleteValidator = z.object({
  id: z.string(),
});

export type CommentDeletionRequest = z.infer<typeof CommentDeleteValidator>;
