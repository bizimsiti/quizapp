import prisma from "@/lib/db";
import { getAuthSession } from "@/lib/nextauth";
import { createQuizSchema } from "@/schemas/form/quiz";
import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import axios from "axios";

type mcqQuestion = {
  question: string;
  answer: string;
  option1: string;
  option2: string;
  option3: string;
};
type openEndedQuestion = {
  question: string;
  answer: string;
};
export const POST = async (req: NextRequest, res: NextResponse) => {
  try {
    const session = await getAuthSession();
    if (!session?.user) {
      return NextResponse.json(
        {
          error: "You must be logged in first!"
        },
        {
          status: 401
        }
      );
    }
    const body = await req.json();
    const { amount, topic, type, language } = createQuizSchema.parse(body);
    const game = await prisma.game.create({
      data: {
        gameType: type,
        timeStarted: new Date(),
        topic: topic,
        language: language,
        userId: session.user.id
      }
    });
    await prisma.topicCount.upsert({
      where: {
        topic
      },
      create: {
        topic,
        count: 1
      },
      update: {
        count: {
          increment: 1
        }
      }
    });
    const { data } = await axios.post(
      `${process.env.BASE_API_ENDPOINT}/api/questions`,
      {
        amount,
        topic,
        type,
        language
      }
    );

    if (type === "mcq") {
      let datas = data.questions.map((question: mcqQuestion) => {
        let options = [
          question.answer,
          question.option1,
          question.option2,
          question.option3
        ];
        options = options.sort(() => Math.random() - 0.5);
        return {
          question: question.question,
          answer: question.answer,
          options: JSON.stringify(options),
          gameId: game.id,
          questionType: type
        };
      });
      await prisma.question.createMany({
        data: datas
      });
    } else if (type === "open_ended") {
      let datas = data.questions.map((question: openEndedQuestion) => {
        return {
          question: question.question,
          answer: question.answer,
          gameId: game.id,
          questionType: type
        };
      });
      await prisma.question.createMany({
        data: datas
      });
    }
    return NextResponse.json({
      gameId: game.id
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        {
          error: error.issues
        },
        {
          status: 400
        }
      );
    } else {
      console.log("elle gpt error", error);
      return NextResponse.json(
        {
          error: "An unexpected error."
        },
        {
          status: 500
        }
      );
    }
  }
};
