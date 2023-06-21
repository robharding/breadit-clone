import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

const auth = (req: Request) => ({ id: "fakeId" });

export const imageFileRouter = {
  imageUploader: f({ image: { maxFileSize: "4MB" } })
    .middleware(async (req) => {
      const user = await auth(req);

      if (!user) throw new Error("Unauthorized");

      return { userId: user.id };
    })
    .onUploadComplete(async ({}) => {}),
} satisfies FileRouter;

export type ImageFileRouter = typeof imageFileRouter;
