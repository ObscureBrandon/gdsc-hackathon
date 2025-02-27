import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { auth } from "~/server/auth/index";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const session = await auth();

  const { pathname } = req.nextUrl;

  // If the user is logged in and tries to access the home page, redirect to /dashboard
  if (pathname === "/" && token && session) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  // Allow the request to proceed
  return NextResponse.next();
}

export const config = {
  matcher: ["/"],
};
