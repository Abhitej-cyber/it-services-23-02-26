import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { logActivity } from "@/lib/logger";

// GET /api/requests - Get requests based on role
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const role = session.user.role;
        const userId = session.user.id;

        let requests;

        if (role === "DEAN") {
            // Dean sees all requests
            requests = await prisma.request.findMany({
                include: {
                    department: {
                        select: { name: true, code: true },
                    },
                    createdBy: {
                        select: { name: true, email: true },
                    },
                },
                orderBy: {
                    createdAt: "desc",
                },
            });
        } else if (role === "ADMIN") {
            // Admin sees requests approved by Dean or assigned to them
            requests = await prisma.request.findMany({
                where: {
                    OR: [
                        { status: "APPROVED" },
                        { status: "ASSIGNED" },
                        { status: "IN_PROGRESS" },
                        { assignedAdminId: userId }
                    ]
                },
                include: {
                    department: {
                        select: { name: true, code: true },
                    },
                    createdBy: {
                        select: { name: true, email: true },
                    },
                    approvedBy: {
                        select: { name: true, email: true },
                    },
                },
                orderBy: {
                    updatedAt: "desc",
                },
            });
        } else if (role === "HOD") {
            // HOD sees all requests for their department
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { departmentId: true },
            });

            if (!user?.departmentId) {
                return NextResponse.json({ error: "No department assigned" }, { status: 400 });
            }

            requests = await prisma.request.findMany({
                where: {
                    departmentId: user.departmentId,
                    type: { not: "ACCOUNT_APPROVAL" }
                },
                include: {
                    department: {
                        select: { name: true, code: true },
                    },
                    createdBy: {
                        select: { name: true, email: true },
                    },
                    approvedBy: {
                        select: { name: true, email: true },
                    },
                },
                orderBy: {
                    createdAt: "desc",
                },
            });
        } else {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        return NextResponse.json(requests);
    } catch (error) {
        console.error("Error fetching requests:", error);
        return NextResponse.json(
            { error: "Failed to fetch requests" },
            { status: 500 }
        );
    }
}

// POST /api/requests - Create a new request (HOD only)
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== "HOD") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const body = await req.json();
        const { title, description, type, priority, departmentId } = body;

        if (!title || !description || !type || !departmentId) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Generate request number
        const count = await prisma.request.count();
        const requestNumber = `REQ-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`;

        const request = await prisma.request.create({
            data: {
                requestNumber,
                title,
                description,
                type,
                priority: priority || "NORMAL",
                departmentId,
                createdById: session.user.id,
            },
            include: {
                department: {
                    select: { name: true, code: true },
                },
            },
        });

        await logActivity({
            userId: session.user.id,
            action: "CREATE",
            entity: "REQUEST",
            entityId: request.id,
            details: `Created resource request: ${request.title} (${request.requestNumber})`,
            departmentId: request.departmentId
        });

        return NextResponse.json(request, { status: 201 });
    } catch (error) {
        console.error("Error creating request:", error);
        return NextResponse.json(
            { error: "Failed to create request" },
            { status: 500 }
        );
    }
}
