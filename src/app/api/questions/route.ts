import { strict_output } from "@/lib/gptout";
import { getAuthSession } from "@/lib/nextauth";
import { createQuizSchema } from "@/schemas/form/quiz";
import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";

//POST /api/questions
export const POST = async (req: NextRequest, res: NextResponse) => {
  try {
    const session = await getAuthSession();
    const body = await req.json();
    const { amount, type, topic } = createQuizSchema.parse(body);
    let questions: any;
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
    if (type === "open_ended") {
      questions = await strict_output(
        "You are a helpful AI that is able to generate a pair of question and answers, the length of each answer should not be more than 15 words, store all the pairs of answers and questions in a JSON array",
        new Array(amount).fill(
          `You are to generate a random hard open-ended questions about ${topic}`
        ),
        {
          question: "question",
          answer: "answer with max length of 15 words"
        }
      );
    } else if (type === "mcq") {
      questions = await strict_output(
        "You are a helpful AI that is able to generate mcq questions and answers, the length of each answer should not be more than 15 words, store all answers and questions and options in a JSON array",
        new Array(amount).fill(
          `You are to generate a random hard mcq question about ${topic}`
        ),
        {
          question: "question",
          answer: "answer with maxt length of 15 words",
          option1: "option1 with max length of 15 words",
          option2: "option2 with max length of 15 words",
          option3: "option3 with max length of 15 words"
        }
      );
    }
    return NextResponse.json(
      {
        questions: questions
      },
      {
        status: 200
      }
    );
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
