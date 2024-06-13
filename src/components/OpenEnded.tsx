import { formatTimeDelta } from "@/lib/utils";
import { Game, Question } from "@prisma/client";
import { differenceInSeconds } from "date-fns";
import { ChevronRight, Loader2, Timer } from "lucide-react";
import React from "react";
import { Card, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { useToast } from "./ui/use-toast";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";

type Props = {
  game: Game & { questions: Pick<Question, "id" | "answer" | "question">[] };
};

const OpenEnded = ({ game }: Props) => {
  const [questionIndex, setQuestionIndex] = React.useState(0);
  const [now, setNow] = React.useState<Date>(new Date());
  const [isEnded, setIsEnded] = React.useState<boolean>(false);
  const { toast } = useToast();

  // current question
  const currentQuestion = React.useMemo(() => {
    return game.questions[questionIndex];
  }, [questionIndex, game.questions]);

  //mutation
  const { mutate: checkAnswer, isPending } = useMutation({
    mutationFn: async () => {
      const payload: z.infer<typeof checkAnswerSchema> = {
        questionId: currentQuestion.id,
        userAnswer: ""
      };
      const response = await axios.post("/api/checkanswer", payload);
      return response.data;
    }
  });

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
          <div className="flex self-start mt-3 text-slate-400">
            <Timer className="mr-2" />
            {formatTimeDelta(differenceInSeconds(now, game.timeStarted))}
          </div>
        </div>
        <OpenEndedPercentage percentage={averagePercentage} />
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
          disabled={isChecking || isEnded}
          onClick={() => {
            handleNext();
          }}
        >
          {isChecking && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Next <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default OpenEnded;
