"use client";
import { Game, Question } from "@prisma/client";
import { BarChart, ChevronRight, Loader2, Timer } from "lucide-react";
import React, { useMemo, useState } from "react";
import { Card, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button, buttonVariants } from "./ui/button";
import McqCounter from "./McqCounter";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { checkAnswerSchema } from "@/schemas/form/quiz";
import axios from "axios";
import { useToast } from "./ui/use-toast";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Props = {
  game: Game & { questions: Pick<Question, "id" | "options" | "question">[] };
};

const Mcq = ({ game }: Props) => {
  const [questionIndex, setQuestionIndex] = React.useState(0);
  const [selectedChoice, setSelectedChoice] = React.useState<number>(0);
  const [correctAnswers, setCorrectAnswers] = useState<number>(0);
  const [wrongAnswers, setWrongAnswers] = useState<number>(0);
  const currentQuestion = React.useMemo(() => {
    return game.questions[questionIndex];
  }, [questionIndex, game.questions]);
  const options = React.useMemo(() => {
    if (!currentQuestion) return [];
    if (!currentQuestion.options) return [];
    return JSON.parse(currentQuestion.options as string) as string[];
  }, [currentQuestion]);
  const [isEnded, setIsEnded] = useState<boolean>(false);
  const { toast } = useToast();
  const { mutate: checkAnswer, isPending } = useMutation({
    mutationFn: async () => {
      const payload: z.infer<typeof checkAnswerSchema> = {
        questionId: currentQuestion.id,
        userAnswer: options[selectedChoice]
      };
      const response = await axios.post("/api/checkanswer", payload);
      return response.data;
    }
  });
  const handleNext = React.useCallback(() => {
    if (isPending) return;
    checkAnswer(undefined, {
      onSuccess: ({ isCorrect }) => {
        if (isCorrect) {
          toast({
            title: "Correct !",
            variant: "success"
          });
          setCorrectAnswers((prev) => prev + 1);
        } else {
          toast({
            title: "Wrong !",
            variant: "destructive"
          });
          setWrongAnswers((prev) => prev + 1);
        }

        if (questionIndex === game.questions.length - 1) {
          setIsEnded(true);
          return;
        }
        setQuestionIndex((prev) => prev + 1);
      }
    });
  }, [checkAnswer, toast, game.questions.length, questionIndex]);
  if (isEnded) {
    return (
      <div className="absolute flex flex-col justify-center -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
        <div className="px-4 py-2 mt-2 font-semibold text-white bg-green-500 rounded-md whitespace-nowrap">
          You Completed in {"3m 4s"}
        </div>
        <Link
          href={`/statistics/${game.id}`}
          className={cn(buttonVariants({ size: "lg" }), "mt-2")}
        >
          View Statistics
          <BarChart className="w-4 h-4 ml-2" />
        </Link>
      </div>
    );
  }
  return (
    <div className="absolute -translate-x-1/2 -translate-y-1/2 md:w-[80vw] max-w-4xl w-[90vw] top-1/2 left-1/2">
      <div className="flex flex-row justify-between">
        <div className="flex flex-col">
          <p>
            <span className="text-slate-400 mr-2">Topic</span> &nbsp;
            <span className="px-2 py-1 text-white rounded-lg bg-slate-800">
              {game.topic}
            </span>
          </p>
          <div className="flex self-start mt-3 text-slate-400">
            <Timer className="mr-2" />
            <span>{game.timeStarted.toDateString()}</span>
          </div>
        </div>
        <McqCounter correctAnswer={correctAnswers} wrongAnswer={wrongAnswers} />
      </div>
      <Card className="w-full mt-4">
        <CardHeader className="flex flex-row items-center">
          <CardTitle className="mr-5 text-center divide-y divide-zinc-600/50">
            <div>{questionIndex + 1}</div>
            <div className="text-base text-slate-400">
              {game.questions.length}
            </div>
          </CardTitle>
          <CardDescription className="flex-grow text-lg">
            {currentQuestion?.question}
          </CardDescription>
        </CardHeader>
      </Card>
      <div className="flex flex-col items-center justify-center w-full mt-4">
        {options.map((option, index) => {
          return (
            <Button
              variant={selectedChoice === index ? "default" : "secondary"}
              onClick={() => setSelectedChoice(index)}
              key={option}
              className="justify-start w-full py-8 mb-4"
            >
              <div className="flex items-center justify-start">
                <div className="p-2 px-3 mr-5 border rounded-md">
                  {index + 1}
                </div>
                <div className="text-start">{option}</div>
              </div>
            </Button>
          );
        })}
        <Button
          disabled={isPending}
          onClick={() => {
            handleNext();
          }}
          className="mt-2"
        >
          {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Next <ChevronRight className="w-4 h-5 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default Mcq;