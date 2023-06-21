import Link from "next/link";
import { toast } from "./use-toast";
import { buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export const useCustomToast = () => {
  const loginToast = () => {
    const { dismiss } = toast({
      title: "Login required.",
      description: "You need to be logged in to do that.",
      variant: "destructive",
      action: (
        <Link
          href="/sign-in"
          onClick={() => dismiss()}
          className={cn(buttonVariants({ variant: "outline" }), "text-xs")}
        >
          Sign in
        </Link>
      ),
    });
  };

  return { loginToast };
};
