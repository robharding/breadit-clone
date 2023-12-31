import Link from "next/link";
import { Icons } from "./Icons";
import { getAuthSession } from "@/lib/auth";
import UserAccountNav from "./UserAccountNav";
import SignInButton from "./SignInButton";
import SearchBar from "./SearchBar";

const Navbar = async () => {
  const session = await getAuthSession();

  return (
    <div className="fixed top-0 inset-x-0 max-h-max bg-zinc-100 border-b border-zinc-300 z-10 py-2">
      <div className="sm:container max-w-7xl mx-auto flex items-center justify-center px-4 sm:justify-between gap-2">
        {/* logo */}
        <Link href="/" className="flex gap-2 items-center">
          <Icons.logo className="h-8 w-8 sm:h-6 sm:w-6" />
          <p className="hidden text-zinc-700 text-sm font-medium sm:block">
            Breadit
          </p>
        </Link>

        {/* search bar */}
        <SearchBar />

        {session?.user ? (
          <UserAccountNav user={session.user} />
        ) : (
          <SignInButton />
        )}
      </div>
    </div>
  );
};

export default Navbar;
