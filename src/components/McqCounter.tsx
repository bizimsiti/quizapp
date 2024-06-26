import React from "react";
import { Card } from "./ui/card";
import { CheckCircle2, XCircle } from "lucide-react";
import { Separator } from "@radix-ui/react-separator";

type Props = {
  correctAnswer: number;
  wrongAnswer: number;
};

function McqCounter({ correctAnswer, wrongAnswer }: Props) {
  return (
    <Card className="flex flex-row items-center justify-center p-2">
      <CheckCircle2 color="green" size={30} />
      <span className="mx-3 text-2xl text-[green]">{correctAnswer}</span>

      <Separator orientation="vertical" />

      <span className="mx-3 text-2xl text-[red]">{wrongAnswer}</span>
      <XCircle color="red" size={30} />
    </Card>
  );
}

export default McqCounter;
