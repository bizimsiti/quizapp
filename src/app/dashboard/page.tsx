import HotToicsCard from "@/components/dashboard/HotToicsCard";
import OldQuizCard from "@/components/dashboard/OldQuizCard";
import QuizCard from "@/components/dashboard/QuizCard";
import ResentActivities from "@/components/dashboard/ResentActivities";
import { getAuthSession } from "@/lib/nextauth";
import { redirect } from "next/navigation";
import React from "react";

type Props = {};

const Dashboard = async (props: Props) => {
  const session = await getAuthSession();
  if (!session?.user) {
    redirect("/");
  }
  return (
    <main className="p-8 mx-auto max-w-7xl">
      <div className="flex items-center">
        <h2 className="mr-2 text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      <div className="grid gap-4 mt-4 md:grid-cols-2">
        <QuizCard />
        <OldQuizCard />
      </div>
      <div className="grid gap-4 mt-4 md:grid-cols-2 lg:grid-cols-7">
        <HotToicsCard />
        <ResentActivities />
      </div>
    </main>
  );
};

export default Dashboard;
