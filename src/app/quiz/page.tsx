import React from "react";
import prisma from "@/lib/db";
import { getAuthSession } from "@/lib/nextauth";
import { redirect } from "next/navigation";
import CreateQuiz from "@/components/CreateQuiz";
type Props = {};

const page = async (props: Props) => {
  const session = await getAuthSession();
  if (!session?.user) {
    redirect("/");
  }
  return <CreateQuiz />;
};

export default page;
