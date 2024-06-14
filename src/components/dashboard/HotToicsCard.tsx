import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "../ui/card";
import CustomWordCloud from "../CustomWordCloud";
import prisma from "@/lib/db";

type Props = {};

const HotToicsCard = async (props: Props) => {
  const topics = await prisma.topicCount.findMany({});
  const formatTopics = topics.map((topic) => {
    return {
      text: topic.topic,
      value: topic.count
    };
  });
  return (
    <Card className="col-span-4">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Hot Toics</CardTitle>
        <CardDescription>
          Click on a toic to start a quiz on it!
        </CardDescription>
      </CardHeader>
      <CardContent className="pl-2">
        <CustomWordCloud formatTopics={formatTopics} />
      </CardContent>
    </Card>
  );
};

export default HotToicsCard;
