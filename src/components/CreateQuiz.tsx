"use client";
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "./ui/card";
import { Checkbox } from "@/components/ui/checkbox";
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
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import Loading from "./Loading";
import { toast } from "./ui/use-toast";
type Props = {};

type Input = z.infer<typeof createQuizSchema>;

const CreateQuiz = (props: Props) => {
  const router = useRouter();
  const [showLoader, setShowLoader] = React.useState<boolean>(false);
  const [finishedLoading, setFinishedLoading] = React.useState(false);
  const { mutate: getQuestions, isPending } = useMutation({
    mutationFn: async ({ amount, topic, type, language }: Input) => {
      const response = await axios.post("/api/game", {
        amount,
        topic,
        type,
        language
      });
      return response.data;
    }
  });
  const form = useForm<Input>({
    resolver: zodResolver(createQuizSchema),
    defaultValues: {
      amount: 3,
      topic: "",
      type: "open_ended",
      language: "english"
    }
  });
  function onSubmit(input: Input) {
    console.log(input);

    setShowLoader(true);
    getQuestions(
      {
        amount: input.amount,
        topic: input.topic,
        type: input.type,
        language: input.language
      },
      {
        onSuccess({ gameId }) {
          setFinishedLoading(true);
          setTimeout(() => {
            if (input.type === "mcq") {
              router.push(`/play/mcq/${gameId}`);
            } else {
              router.push(`/play/open-ended/${gameId}`);
            }
          }, 2000);
        },
        onError: (error) => {
          setShowLoader(false);
          if (error instanceof AxiosError) {
            if (error.response?.status === 500) {
              toast({
                title: "Error",
                description: "Something went wrong. Please try again later.",
                variant: "destructive"
              });
            }
          }
        }
      }
    );
  }
  form.watch();
  if (showLoader) {
    return <Loading finished={finishedLoading} />;
  }
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

              <div className="flex justify-between flex-col">
                <div className="mb-2">
                  <Button
                    type="button"
                    onClick={() => {
                      form.setValue("language", "english");
                    }}
                    className="w-1/2 rounded-none "
                    variant={
                      form.getValues("language") === "english"
                        ? "default"
                        : "secondary"
                    }
                  >
                    English
                  </Button>

                  <Button
                    type="button"
                    onClick={() => {
                      form.setValue("language", "turkish");
                    }}
                    className="w-1/2 rounded-none "
                    variant={
                      form.getValues("language") === "turkish"
                        ? "default"
                        : "secondary"
                    }
                  >
                    Turkish
                  </Button>
                </div>
                <div>
                  <Button
                    type="button"
                    onClick={() => {
                      form.setValue("type", "mcq");
                    }}
                    className="w-1/2 rounded-none "
                    variant={
                      form.getValues("type") === "mcq" ? "default" : "secondary"
                    }
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Multiple Choise
                  </Button>
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
