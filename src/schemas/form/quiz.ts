import { z } from "zod";

export const createQuizSchema = z.object({
  topic: z
    .string()
    .min(4, { message: "Topic must be at least 4 characters long" })
    .max(100),
  type: z.enum(["mcq", "open_ended"]),
  amount: z.number().min(1).max(10)
});
