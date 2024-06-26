"use client";

import React from "react";
import { Button } from "./ui/button";
import { signIn } from "next-auth/react";

type Props = {
  provider: string;
};

const SignInButton = ({ provider }: Props) => {
  return (
    <>
      <Button
        className="mb-3"
        onClick={() => {
          if (provider === "google") {
            signIn("google").catch(console.error);
          } else {
            signIn("github").catch(console.error);
          }
        }}
      >
        {`Sign in with ${provider}`}
      </Button>
    </>
  );
};

export default SignInButton;
