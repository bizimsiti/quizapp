"use client";
import { cn, formatTimeDelta } from "@/lib/utils";
import { Game, Question } from "@prisma/client";
import { differenceInSeconds } from "date-fns";
import { BarChart, ChevronRight, Loader2, Timer } from "lucide-react";
import React from "react";
import { Card, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button, buttonVariants } from "./ui/button";
import { useToast } from "./ui/use-toast";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import axios from "axios";
import BlankAnswerInput from "./BlankAnswerInput";
import { checkAnswerSchema, endGameSchema } from "@/schemas/questions";
import Link from "next/link";
import dynamic from "next/dynamic";

const TimeCounter = dynamic(() => import("./TimeCounter"), { ssr: false });
type Props = {
  game: Game & { questions: Pick<Question, "id" | "answer" | "question">[] };
};

const OpenEnded = ({ game }: Props) => {
  const [isEnded, setIsEnded] = React.useState<boolean>(false);
  const [questionIndex, setQuestionIndex] = React.useState(0);
  const [blankAnswer, setBlankAnswer] = React.useState<string>("");
  const startDate = React.useRef(new Date());
  const [now, setNow] = React.useState(startDate.current);
  const { toast } = useToast();

  // current question
  const currentQuestion = React.useMemo(() => {
    return game.questions[questionIndex];
  }, [questionIndex, game.questions]);

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

  //mutation
  const { mutate: checkAnswer, isPending } = useMutation({
    mutationFn: async () => {
      let filledAnswer = blankAnswer;
      document.querySelectorAll("#user-blank-input").forEach((input) => {
        filledAnswer = filledAnswer.replace("_____", input.value);
        input.value = "";
      });
      const payload: z.infer<typeof checkAnswerSchema> = {
        questionId: currentQuestion.id,
        userAnswer: filledAnswer
      };
      const response = await axios.post("/api/checkanswer", payload);
      return response.data;
    }
  });

  // time counter
  React.useEffect(() => {
    const interval = setInterval(() => {
      if (!isEnded) {
        setNow(new Date());
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isEnded]);

  //handle next question
  const handleNext = React.useCallback(() => {
    if (isPending) return;
    checkAnswer(undefined, {
      onSuccess: ({ percentageSimilar }) => {
        toast({
          title: `Your answer is ${percentageSimilar}% similar to the correct answer.`,
          description: "answers are matched based on similarity comparisons"
        });
        if (questionIndex === game.questions.length - 1) {
          endGame();
          setIsEnded(true);
          return;
        }
        setQuestionIndex((prev) => prev + 1);
      }
    });
  }, [
    checkAnswer,
    toast,
    game.questions.length,
    questionIndex,
    blankAnswer,
    endGame
  ]);

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
  }

  return (
    <div className="absolute -translate-x-1/2 -translate-y-1/2 md:w-[80vw] max-w-4xl w-[90vw] top-1/2 left-1/2">
      <div className="flex flex-row justify-between">
        <div className="flex flex-col">
          {/* topic */}
          <p>
            <span className="text-slate-400">Topic</span> &nbsp;
            <span className="px-2 py-1 text-white rounded-lg bg-slate-800">
              {game.topic}
            </span>
          </p>

          <TimeCounter now={now} gameTimeStarted={game.timeStarted} />
        </div>
        {/* <OpenEndedPercentage percentage={averagePercentage} /> */}
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
        <BlankAnswerInput
          setBlankAnswer={setBlankAnswer}
          answer={currentQuestion.answer}
        />
        <Button
          variant="outline"
          className="mt-4"
          disabled={isPending || isEnded}
          onClick={() => {
            handleNext();
          }}
        >
          {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Next <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default OpenEnded;
