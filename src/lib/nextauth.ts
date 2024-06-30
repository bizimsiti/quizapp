import { DefaultSession, getServerSession, NextAuthOptions } from "next-auth";
import prisma from "./db";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}
declare module "next-auth/jwt" {
  interface JWT {
    id: string;
  }
}

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt"
  },
  secret: process.env.NEXTAUTH_SECRET,
  adapter: PrismaAdapter(prisma),
  callbacks: {
    jwt: async ({ token }) => {
      const user = await prisma.user.findFirst({
        where: {
          email: token.email
        }
      });
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    session: async ({ session, token }) => {
      if (token) {
        (session.user.id = token.id),
          (session.user.name = token.name),
          (session.user.email = token.email),
          (session.user.image = token.picture);
      }
      return session;
    }
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_ID as string,
      clientSecret: process.env.GITHUB_SECRET as string
    }),
    CredentialsProvider({
      // The name to display on the sign in form (e.g. "Sign in with...")
      name: "Credentials",
      // `credentials` is used to generate a form on the sign in page.
      // You can specify which fields should be submitted, by adding keys to the `credentials` object.
      // e.g. domain, username, password, 2FA token, etc.
      // You can pass any HTML attribute to the <input> tag through the object.
      credentials: {},
      async authorize(credentials, req) {
        console.log(credentials);

        // Add logic here to look up the user from the credentials supplied
        const user = { id: "1", name: "ali" };

        if (user) {
          // Any object returned will be saved in `user` property of the JWT
          return user;
        } else {
          // If you return null then an error will be displayed advising the user to check their details.
          return null;

          // You can also Reject this callback with an Error thus the user will be sent to the error page with the error message as a query parameter
        }
      }
    })
  ]
};

export const getAuthSession = () => {
  return getServerSession(authOptions);
};
