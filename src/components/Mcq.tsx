"use client";
import { Game, Question } from "@prisma/client";
import { BarChart, ChevronRight, Loader2, Timer } from "lucide-react";
import React, { useMemo, useState } from "react";
import { Card, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button, buttonVariants } from "./ui/button";
import McqCounter from "./McqCounter";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { checkAnswerSchema, endGameSchema } from "@/schemas/questions";
import axios from "axios";
import { useToast } from "./ui/use-toast";
import Link from "next/link";
import { cn, formatTimeDelta } from "@/lib/utils";
import { differenceInSeconds } from "date-fns";
import dynamic from "next/dynamic";

const TimeCounter = dynamic(() => import("./TimeCounter"), { ssr: false });
type Props = {
  game: Game & { questions: Pick<Question, "id" | "options" | "question">[] };
};

const Mcq = ({ game }: Props) => {
  const [questionIndex, setQuestionIndex] = React.useState(0);
  const [selectedChoice, setSelectedChoice] = React.useState<number>(0);
  const [correctAnswers, setCorrectAnswers] = useState<number>(0);
  const [wrongAnswers, setWrongAnswers] = useState<number>(0);
  const [now, setNow] = React.useState<Date>(new Date());
  const [isEnded, setIsEnded] = useState<boolean>(false);
  const { toast } = useToast();

  // time counter
  React.useEffect(() => {
    const interval = setInterval(() => {
      if (!isEnded) {
        setNow(new Date());
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isEnded]);

  // current question
  const currentQuestion = React.useMemo(() => {
    return game.questions[questionIndex];
  }, [questionIndex, game.questions]);

  //options
  const options = React.useMemo(() => {
    if (!currentQuestion) return [];
    if (!currentQuestion.options) return [];
    return JSON.parse(currentQuestion.options as string) as string[];
  }, [currentQuestion]);

  //mutation
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

  //end game logic
  const { mutate: endGame } = useMutation({
    mutationFn: async () => {
      const payload: z.infer<typeof endGameSchema> = {
        gameId: game.id
      };
      const res = await axios.post(`/api/end-game`, payload);
      return res.data;
    }
  });

  //handle next question
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
          endGame();
          setIsEnded(true);
          return;
        }
        setQuestionIndex((prev) => prev + 1);
      }
    });
  }, [checkAnswer, toast, game.questions.length, questionIndex, endGame]);

  // if question end
  if (isEnded) {
    return (
      <div className="absolute flex flex-col justify-center -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
        <div className="px-4 py-2 mt-2 font-semibold text-white bg-green-500 rounded-md whitespace-nowrap">
          You Completed in{" "}
          {formatTimeDelta(differenceInSeconds(now, game.timeStarted))}
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
  } // absolute -translate-x-1/2 -translate-y-1/2 md:w-[80vw] max-w-4xl w-[90vw] top-1/2 left-1/2
  return (
    <div className="sm:max-md:w-full mx-auto mt-4 sm:absolute sm:-translate-x-1/2 sm:-translate-y-1/2 sm:top-1/2 sm:left-1/2 md:w-[80vw] max-w-4xl w-[90vw]">
      <div className="flex flex-row justify-between">
        <div className="flex flex-col">
          <div className="flex flex-col sm:flex-row">
            <span className="text-slate-400 mr-2">Topic</span>

            <span className="px-2 py-1 text-white rounded-lg bg-slate-800">
              {game.topic}
            </span>
          </div>
          <TimeCounter now={now} gameTimeStarted={game.timeStarted} />
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
              key={index}
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
