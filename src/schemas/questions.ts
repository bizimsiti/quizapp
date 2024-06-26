import { z } from "zod";

export const getQuestionsSchema = z.object({
  topic: z.string(),
  amount: z.number().int().positive().min(1).max(10),
  type: z.enum(["mcq", "open_ended"]),
  language: z.enum(["english", "turkish"])
});

export const checkAnswerSchema = z.object({
  userAnswer: z.string(),
  questionId: z.string()
});

export const endGameSchema = z.object({
  gameId: z.string()
});
