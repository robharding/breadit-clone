"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import { User } from "next-auth";
import { FC } from "react";
import UserAvatar from "./UserAvatar";
import { DropdownMenuItem, DropdownMenuSeparator } from "./ui/DropdownMenu";
import Link from "next/link";
import { signOut } from "next-auth/react";

interface UserAccountNavProps {
  user: Pick<User, "name" | "image" | "email">;
}

interface MenuItem {
  href: string;
  text: string;
}

const menuItems: MenuItem[] = [
  {
    href: "/",
    text: "Feed",
  },
  {
    href: "/r/create",
    text: "Create community",
  },
  {
    href: "/settings",
    text: "Settings",
  },
];

const UserAccountNav: FC<UserAccountNavProps> = ({ user }) => {
  const handleSignOut = (e: Event) => {
    e.preventDefault();
    signOut({
      callbackUrl: `${window.location.origin}/sign-in`,
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <UserAvatar
          className="h-8 w-8"
          user={{
            name: user.name || null,
            image: user.image || null,
          }}
        />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="bg-white rounded mt-1 p-2 border border-black/[0.05]"
        align="end"
      >
        <div className="flex items-center justify-start p-2">
          <div className="flex flex-col gap-1 leading-none">
            {user.name && <p className="font-medium">{user.name}</p>}
            {user.email && (
              <p className="w-[200px] truncate text-sm text-zinc-700">
                {user.email}
              </p>
            )}
          </div>
        </div>

        <DropdownMenuSeparator className="my-2" />

        <div>
          {menuItems.map((menuItem, i) => (
            <DropdownMenuItem key={i} asChild>
              <Link href={menuItem.href}>{menuItem.text}</Link>
            </DropdownMenuItem>
          ))}
        </div>

        <DropdownMenuSeparator className="my-2" />

        <DropdownMenuItem
          className="cursor-pointer"
          onSelect={(e) => handleSignOut(e)}
        >
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserAccountNav;
