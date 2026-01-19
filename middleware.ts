import { withAuth } from "next-auth/middleware";
import { NextRequest } from "next/server";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default withAuth(
  function middleware(req: NextRequest) {
    return;
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/login",
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*"],
};
