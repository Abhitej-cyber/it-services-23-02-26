import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token;
        const path = req.nextUrl.pathname;

        // Skip middleware for API routes just to be safe
        if (path.startsWith("/api")) return NextResponse.next();

        // Role-based access control
        const roleAccess: Record<string, string[]> = {
            "/dashboard/dean": ["DEAN"],
            "/dashboard/hod": ["HOD"],
            "/dashboard/admin": ["ADMIN"],
            "/dashboard/lab-incharge": ["LAB_INCHARGE"],
            "/allocate": ["DEAN"],
        };

        // Check if the path requires role-based access
        for (const [route, allowedRoles] of Object.entries(roleAccess)) {
            if (path.startsWith(route)) {
                if (!token?.role || !allowedRoles.includes(token.role as string)) {
                    // Redirect to unauthorized page
                    return NextResponse.redirect(new URL("/unauthorized", req.url));
                }
            }
        }

        return NextResponse.next();
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
    // Better matcher: match all dashboard routes and main routes, 
    // but explicitly excluding internal next and api routes if they were somehow caught
    matcher: [
        "/dashboard/:path*",
        "/assets/:path*",
        "/departments/:path*",
        "/labs/:path*",
        "/notifications/:path*",
        "/settings/:path*",
        "/tickets/:path*",
        "/users/:path*",
        "/allocate/:path*",
        "/allocate"
    ],
};


