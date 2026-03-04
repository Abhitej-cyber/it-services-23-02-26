import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { db } from "@/lib/db";
import bcryptjs from "bcryptjs";
const { compare } = bcryptjs;

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(db),
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: "/login",
    },
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                const user = await db.user.findUnique({
                    where: {
                        email: credentials.email,
                    },
                });

                if (!user) {
                    return null;
                }

                if (user.status === "PENDING") {
                    throw new Error("Account pending approval by Dean.");
                }

                if (user.status === "REJECTED") {
                    throw new Error("Account registration rejected.");
                }

                const isPasswordValid = await compare(
                    credentials.password,
                    user.password
                );

                if (!isPasswordValid) {
                    return null;
                }

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                    status: user.status,
                    departmentId: user.departmentId,
                    labId: user.labId,
                    image: (user as any).image
                };
            },
        }),
    ],
    callbacks: {
        async session({ token, session }) {
            if (token) {
                session.user.id = token.id;
                session.user.name = token.name;
                session.user.email = token.email;
                session.user.role = token.role as string;
                session.user.departmentId = token.departmentId as string;
                session.user.labId = token.labId as string;
                session.user.image = token.image as string;
            }
            return session;
        },
        async jwt({ token, user, trigger, session }) {
            if (user) {
                token.id = user.id;
                token.role = (user as any).role;
                token.departmentId = (user as any).departmentId;
                token.labId = (user as any).labId;
                // Store a URL instead of potentially massive base64
                const dbImage = (user as any).image;
                token.image = dbImage ? `/api/users/${user.id}/image?v=${Date.now()}` : null;
            }
            if (trigger === "update" && session) {
                if (session.name) token.name = session.name;
                if (session.email) token.email = session.email;
                if (session.image !== undefined) {
                    // Force cache bust on update if a new image exists
                    token.image = session.image ? `/api/users/${token.id}/image?v=${Date.now()}` : null;
                }
            }
            return token;
        },
    },
};
