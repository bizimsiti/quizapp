import { NextRequest, NextResponse } from "next/server";
import { checkAnswerSchema } from "@/schemas/form/quiz";
import { ZodError } from "zod";
import prisma from "@/lib/db";
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
