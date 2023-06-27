import { FC } from "react";
import { Label } from "./ui/Label";

interface CreateCommentProps {}

const CreateComment: FC<CreateCommentProps> = ({}) => {
  return (
    <div className="grid w-full gap-1.5">
      <Label>Hello</Label>
    </div>
  );
};

export default CreateComment;
