import { getAuthSession } from "@/lib/nextauth";
import Link from "next/link";
import React from "react";
import SignInButton from "@/components/SignInButton";
import UserAccountNav from "./UserAccountNav";
import { ThemeToggle } from "./ThemeToggle";

type Props = {};

const Nav = async (props: Props) => {
  const session = await getAuthSession();
  return (
    <div className="bg-white dark:bg-gray-950 z-[10] h-fit border-b border-zinc-300  py-4 ">
      <div className="flex items-center justify-between h-full gap-2 px-8 mx-auto max-w-7xl">
        {/*Logo */}
        <Link href="/" className="flex items-center gap-2">
          <p className="rounded-lg border-2 border-b-4 border-r-4 border-black px-2 py-1 text-xl font-bold transition-all hover:-translate-y-[2px] md:block dark:border-white">
            QuizApp
          </p>
        </Link>
        <div className="flex items-center">
          <ThemeToggle className="mr-4" />
          <div className="flex items-center">
            {session?.user && <UserAccountNav user={session.user} />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Nav;

/*
 const session = await getAuthSession();
  if (session?.user) {
    return <pre>{JSON.stringify(session.user, null, 2)}</pre>;
  }
  return <div>Not sign In</div>;
*/
