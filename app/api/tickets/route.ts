import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { logActivity } from "@/lib/logger";

// GET /api/tickets - Get tickets based on role
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const role = session.user.role;
        const userId = session.user.id;

        let tickets;

        if (role === "ADMIN") {
            // Admin sees all tickets
            tickets = await prisma.ticket.findMany({
                include: {
                    asset: {
                        select: { assetNumber: true, name: true },
                    },
                    department: {
                        select: { name: true, code: true },
                    },
                    lab: {
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
        } else if (role === "LAB_INCHARGE") {
            // Lab Incharge sees only their tickets
            tickets = await prisma.ticket.findMany({
                where: { createdById: userId },
                include: {
                    asset: {
                        select: { assetNumber: true, name: true },
                    },
                    lab: {
                        select: { name: true, code: true },
                    },
                    assignedTo: {
                        select: { name: true, email: true },
                    },
                },
                orderBy: {
                    createdAt: "desc",
                },
            });
        } else if (role === "HOD") {
            // HOD sees tickets from their department
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { departmentId: true },
            });

            if (!user?.departmentId) {
                return NextResponse.json({ error: "No department assigned" }, { status: 400 });
            }

            tickets = await prisma.ticket.findMany({
                where: { departmentId: user.departmentId },
                include: {
                    asset: {
                        select: { assetNumber: true, name: true },
                    },
                    lab: {
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
        } else {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        return NextResponse.json(tickets);
    } catch (error) {
        console.error("Error fetching tickets:", error);
        return NextResponse.json(
            { error: "Failed to fetch tickets" },
            { status: 500 }
        );
    }
}

// POST /api/tickets - Create a new ticket (Lab Incharge only)
export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session || session.user.role !== "LAB_INCHARGE") {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const body = await req.json();
        const { title, description, issueType, priority, assetId, departmentId, labId } = body;

        if (!title || !description || !issueType || !departmentId) {
            return NextResponse.json(
                { error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Generate ticket number
        const count = await prisma.ticket.count();
        const ticketNumber = `TKT-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`;

        const ticket = await prisma.ticket.create({
            data: {
                ticketNumber,
                title,
                description,
                issueType,
                priority: priority || "NORMAL",
                assetId,
                departmentId,
                labId,
                createdById: session.user.id,
            },
            include: {
                asset: {
                    select: { assetNumber: true, name: true },
                },
                lab: {
                    select: { name: true, code: true },
                },
            },
        });

        await logActivity({
            userId: session.user.id,
            action: "CREATE",
            entity: "TICKET",
            entityId: ticket.id,
            details: `Created service request: ${ticket.title} (${ticket.ticketNumber})`,
            departmentId: ticket.departmentId,
            labId: ticket.labId || undefined
        });

        return NextResponse.json(ticket, { status: 201 });
    } catch (error) {
        console.error("Error creating ticket:", error);
        return NextResponse.json(
            { error: "Failed to create ticket" },
            { status: 500 }
        );
    }
}
