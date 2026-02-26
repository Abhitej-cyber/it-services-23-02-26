import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const limit = parseInt(new URL(req.url).searchParams.get("limit") || "50");
        const role = session.user.role;
        const userId = session.user.id;

        const where: any = {};

        if (role === "HOD") {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { departmentId: true }
            });
            if (user?.departmentId) {
                where.OR = [
                    {
                        departmentId: user.departmentId,
                        details: { not: { contains: "(HOD)" } } // Don't show other HOD approvals
                    },
                    { userId: userId },
                    {
                        departmentId: null,
                        details: { not: { contains: "Account Approval" } }
                    }
                ];
                // Specifically allow seeing their OWN account activities
                where.OR.push({ userId: userId });
            }
        } else if (role === "LAB_INCHARGE") {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { labId: true }
            });
            if (user?.labId) {
                where.OR = [
                    { labId: user.labId },
                    { userId: userId },
                    { labId: null, departmentId: null } // global
                ];
            }
        }

        const activities = await prisma.activityLog.findMany({
            where,
            take: limit,
            orderBy: { createdAt: "desc" },
            include: {
                user: { select: { name: true, role: true } }
            }
        });

        return NextResponse.json(activities);
    } catch (error) {
        console.error("Error fetching activities:", error);
        return NextResponse.json({ error: "Failed to fetch activities" }, { status: 500 });
    }
}
