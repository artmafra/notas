import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { service } from "@/services";

export const authOptions: import("next-auth").AuthOptions = {
  debug: true,
  session: {
    strategy: "jwt" as import("next-auth").SessionStrategy,
  },
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials) return null;
        const user = await service.user.getUserByEmail(credentials.email);
        if (!user) return null;
        const valid = await service.user.verifyPassword(
          credentials.password,
          user.hashedPassword
        );
        if (!valid) return null;
        return {
          id: String(user.id),
          email: user.email,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({
      token,
      user,
    }: {
      token: import("next-auth/jwt").JWT;
      user?: import("next-auth").User | undefined;
    }) {
      if (user) {
        token.id = (user as any).id;
      }
      return token;
    },
    async session({
      session,
      token,
    }: {
      session: import("next-auth").Session;
      token: import("next-auth/jwt").JWT & { id?: string };
    }) {
      session.user = session.user || {};
      (session.user as any).id = token.id;
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
