import { FC } from "react";
import { Label } from "./ui/Label";
import { Textarea } from "./ui/textarea";

interface CreateCommentProps {}

const CreateComment: FC<CreateCommentProps> = ({}) => {
  return (
    <div className="grid w-full gap-1.5">
      <Label htmlFor="comment">Your comment:</Label>
      <div className="mt-2">
        <Textarea id="comment" />
      </div>
    </div>
  );
};

export default CreateComment;
