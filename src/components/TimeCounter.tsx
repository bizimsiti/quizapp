import { formatTimeDelta } from "@/lib/utils";
import { differenceInSeconds } from "date-fns";
import { Timer } from "lucide-react";
import React from "react";

type Props = {
  now: Date;
  gameTimeStarted: Date;
};

const TimeCounter = ({ now, gameTimeStarted }: Props) => {
  return (
    <div className="flex self-start mt-3 text-slate-400">
      <Timer className="mr-2" />
      {formatTimeDelta(differenceInSeconds(now, gameTimeStarted))}
    </div>
  );
};

export default TimeCounter;
