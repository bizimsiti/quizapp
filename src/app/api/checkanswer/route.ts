import { NextRequest, NextResponse } from "next/server";
import { checkAnswerSchema } from "@/schemas/form/quiz";
import { ZodError } from "zod";
import prisma from "@/lib/db";
import { stringSimilarity } from "string-similarity-js";
export const POST = async (req: NextRequest, res: NextResponse) => {
  try {
    const body = await req.json();
    const { userAnswer, questionId } = checkAnswerSchema.parse(body);
    const question = await prisma.question.findUnique({
      where: { id: questionId }
    });
    if (!question) {
      return NextResponse.json(
        {
          error: "Question is not found!"
        },
        {
          status: 404
        }
      );
    }
    await prisma.question.update({
      where: { id: questionId },
      data: {
        userAnswer
      }
    });
    if (question.questionType === "mcq") {
      const isCorrect =
        question.answer.toLowerCase().trim() ===
        userAnswer.toLocaleLowerCase().trim();
      await prisma.question.update({
        where: { id: questionId },
        data: {
          isCorrect
        }
      });
      return NextResponse.json(
        {
          isCorrect
        },
        {
          status: 200
        }
      );
    } else if (question.questionType === "open_ended") {
      let percentageSimilar = stringSimilarity(
        userAnswer.toLowerCase().trim(),
        question.answer.toLowerCase().trim()
      );
      percentageSimilar = Math.round(percentageSimilar * 100);
      await prisma.question.update({
        where: { id: questionId },
        data: {
          percentageCorrect: percentageSimilar
        }
      });
      return NextResponse.json(
        {
          percentageSimilar
        },
        { status: 200 }
      );
    }
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
    }
  }
};
