import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "../ui/card";
import { getAuthSession } from "@/lib/nextauth";
import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import History from "../History";
type Props = {};

const ResentActivities = async (props: Props) => {
  const session = await getAuthSession();
  if (!session?.user) {
    return redirect("/");
  }
  const games_count = await prisma.game.count({
    where: {
      userId: session.user.id
    }
  });
  return (
    <Card className="col-span-4 lg:col-span-3">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Recent Activities</CardTitle>
        <CardDescription>
          You have played a total of {games_count} games
        </CardDescription>
      </CardHeader>
      <CardContent className="max-h-[580px] overflow-scroll">
        <History limit={10} userId={session.user.id} />
      </CardContent>
    </Card>
  );
};

export default ResentActivities;
