// import { auth } from "@/auth";
// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";

// export default auth((req) => {
//   const { pathname } = req.nextUrl;
//   const session = req.auth;

//   // Allow public access to login page and API routes
//   if (pathname === "/login" || pathname.startsWith("/api/auth")) {
//     return NextResponse.next();
//   }

//   // Redirect to login if not authenticated
//   if (!session && pathname !== "/login") {
//     const loginUrl = new URL("/login", req.url);
//     return NextResponse.redirect(loginUrl);
//   }

//   return NextResponse.next();
// });

// export const config = {
//   matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
// };

import { auth } from "@/auth";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  // ⭐ PUBLIC ROUTES - Accessible without login
  const publicRoutes = [
    "/",           // Homepage
    "/login",      // Login page
    "/signup",     // Signup page
    "/products",   // Products page
    "/cart",       // Cart page
  ];

  // Check if current path is public
  const isPublicRoute = publicRoutes.some((route) => {
    if (pathname === route) return true;
    if (pathname.startsWith(route + "/")) return true;
    return false;
  });

  // Always allow API auth routes
  if (pathname. startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // Allow public routes
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Redirect to login if not authenticated (protected routes)
  if (!session) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
