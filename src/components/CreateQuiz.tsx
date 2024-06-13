"use client";
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "./ui/card";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { createQuizSchema } from "@/schemas/form/quiz";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "./ui/form";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { BookOpen, CopyCheck, Copy } from "lucide-react";
import { Separator } from "./ui/separator";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useRouter } from "next/navigation";
type Props = {};

type Input = z.infer<typeof createQuizSchema>;

const CreateQuiz = (props: Props) => {
  const router = useRouter();
  const { mutate: getQuestions, isPending } = useMutation({
    mutationFn: async ({ amount, topic, type }: Input) => {
      const response = await axios.post("/api/game", {
        amount,
        topic,
        type
      });
      return response.data;
    }
  });
  const form = useForm<Input>({
    resolver: zodResolver(createQuizSchema),
    defaultValues: {
      amount: 3,
      topic: "",
      type: "open_ended"
    }
  });
  function onSubmit(input: Input) {
    getQuestions(
      {
        amount: input.amount,
        topic: input.topic,
        type: input.type
      },
      {
        onSuccess({ gameId }) {
          if (input.type === "mcq") {
            router.push(`/play/mcq/${gameId}`);
          } else {
            router.push(`/play/open-ended/${gameId}`);
          }
        }
      }
    );
  }
  form.watch();
  return (
    <div className="absolute -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2">
      <Card>
        <CardHeader>
          <CardTitle className="font-bold text-2xl">Create Quiz</CardTitle>
          <CardDescription>Choose Topic</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="topic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Topic</FormLabel>
                    <FormControl>
                      <Input placeholder="topic..." {...field} />
                    </FormControl>
                    <FormDescription>
                      {" "}
                      Please provide any topic you would like to be quizzed on
                      here.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        onChange={(e) => {
                          form.setValue("amount", parseInt(e.target.value));
                        }}
                        placeholder="Enter an amount"
                        type="number"
                        min={1}
                        max={10}
                      />
                    </FormControl>
                    <FormDescription>Questions amount</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-between">
                <Button
                  type="button"
                  onClick={() => {
                    form.setValue("type", "mcq");
                  }}
                  className="w-1/2 rounded-none rounded-l-lg"
                  variant={
                    form.getValues("type") === "mcq" ? "default" : "secondary"
                  }
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Multiple Choise
                </Button>
                <Separator orientation="vertical" />
                <Button
                  type="button"
                  onClick={() => {
                    form.setValue("type", "open_ended");
                  }}
                  className="w-1/2 rounded-none rounded-r-lg"
                  variant={
                    form.getValues("type") === "open_ended"
                      ? "default"
                      : "secondary"
                  }
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  Open Ended
                </Button>
              </div>
              <Button disabled={isPending} type="submit">
                Submit
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateQuiz;
