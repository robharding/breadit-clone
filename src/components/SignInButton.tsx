"use client";

import Link from "next/link";
import { FC } from "react";
import { buttonVariants } from "./ui/Button";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface SignInButtonProps {}

const SignInButton: FC<SignInButtonProps> = ({}) => {
  const pathName = usePathname();

  return (
    <Link
      href={{
        pathname: "/sign-in",
        query: { redirect: pathName },
      }}
      className={cn(buttonVariants(), "min-w-fit")}
    >
      Sign In
    </Link>
  );
};

export default SignInButton;
