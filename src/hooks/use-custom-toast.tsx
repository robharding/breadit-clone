import Link from "next/link";
import { toast } from "./use-toast";
import { buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

export const useCustomToast = () => {
  const pathName = usePathname();

  const loginToast = () => {
    const { dismiss } = toast({
      title: "Login required.",
      description: "You need to be logged in to do that.",
      variant: "destructive",
      action: (
        <Link
          href={{
            pathname: "/sign-in",
            query: { redirect: pathName },
          }}
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
