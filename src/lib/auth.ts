import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import EmailProvider from "next-auth/providers/email";
import { prisma } from "./db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    EmailProvider({
      server: {
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
    }),
  ],
  pages: {
    signIn: "/login",
    verifyRequest: "/verify",
  },
  callbacks: {
    session: ({ session, user }) => ({
      ...session,
      user: {
        ...session.user,
        id: user.id,
      },
    }),
    redirect: ({ url, baseUrl }) => {
      console.log(`🔄 Redirect callback - url: ${url}, baseUrl: ${baseUrl}`);

      // Always redirect to /dashboard after successful authentication
      if (url.startsWith(baseUrl)) {
        const redirectUrl = `${baseUrl}/dashboard`;
        console.log(`✅ Redirecting to: ${redirectUrl}`);
        return redirectUrl;
      }

      console.log(`✅ Redirecting to baseUrl: ${baseUrl}`);
      return baseUrl;
    },
  },
  debug: true,
});
