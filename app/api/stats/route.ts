import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET /api/stats - Get dashboard statistics
export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const role = session.user.role;
        const userId = session.user.id;

        // Dean - Global stats
        if (role === "DEAN") {
            const [
                totalSystemsCount,
                workingSystems,
                underMaintenanceCount,
                damagedCount,
                openMaintenanceTickets,
                departments,
                labs,
                pendingRequests,
            ] = await Promise.all([
                prisma.asset.count({ where: { type: { in: ["DESKTOP", "LAPTOP", "SERVER"] } } }),
                prisma.asset.count({ where: { status: "ACTIVE", type: { in: ["DESKTOP", "LAPTOP", "SERVER"] } } }),
                prisma.asset.count({ where: { status: "UNDER_MAINTENANCE", type: { in: ["DESKTOP", "LAPTOP", "SERVER"] } } }),
                prisma.asset.count({ where: { status: "DAMAGED", type: { in: ["DESKTOP", "LAPTOP", "SERVER"] } } }),
                prisma.ticket.count({ where: { status: { not: "RESOLVED" } } }),
                prisma.department.count(),
                prisma.lab.count(),
                prisma.request.count({ where: { status: "PENDING" } }),
            ]);

            // Balanced calculation: Ready + Service = Total
            const serviceCount = underMaintenanceCount + damagedCount;
            const readyCount = workingSystems;
            const priorityCount = openMaintenanceTickets + pendingRequests;

            return NextResponse.json({
                totalSystems: totalSystemsCount,
                readyForUse: readyCount,
                service: serviceCount,
                priorityTasks: priorityCount,
                departments,
                labs,
                pendingRequests,
                lastSync: new Date().toISOString()
            });
        }

        // HOD - Department stats
        if (role === "HOD") {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { departmentId: true },
            });

            if (!user?.departmentId) {
                return NextResponse.json({ error: "No department assigned" }, { status: 400 });
            }

            const [
                totalSystems,
                workingSystems,
                underMaintenance,
                myRequests,
                pendingRequests,
                approvedRequests,
            ] = await Promise.all([
                prisma.asset.count({ where: { departmentId: user.departmentId } }),
                prisma.asset.count({ where: { departmentId: user.departmentId, status: "ACTIVE" } }),
                prisma.asset.count({ where: { departmentId: user.departmentId, status: "UNDER_MAINTENANCE" } }),
                prisma.request.count({ where: { createdById: userId } }),
                prisma.request.count({ where: { createdById: userId, status: "PENDING" } }),
                prisma.request.count({ where: { createdById: userId, status: "APPROVED" } }),
            ]);

            return NextResponse.json({
                totalSystems,
                workingSystems,
                underMaintenance,
                myRequests,
                pendingRequests,
                approvedRequests,
            });
        }

        // Admin - Global inventory stats
        if (role === "ADMIN") {
            const [
                totalSystems,
                totalServers,
                totalRouters,
                pendingTickets,
                inProgressTickets,
                completedToday,
            ] = await Promise.all([
                prisma.asset.count({ where: { type: { in: ["DESKTOP", "LAPTOP"] } } }),
                prisma.asset.count({ where: { type: "SERVER" } }),
                prisma.asset.count({ where: { type: { in: ["ROUTER", "SWITCH"] } } }),
                prisma.ticket.count({ where: { status: { in: ["SUBMITTED", "APPROVED", "QUEUED"] } } }),
                prisma.ticket.count({ where: { status: "PROCESSING" } }),
                prisma.ticket.count({
                    where: {
                        status: "DEPLOYED",
                        resolvedAt: {
                            gte: new Date(new Date().setHours(0, 0, 0, 0)),
                        },
                    },
                }),
            ]);

            return NextResponse.json({
                totalSystems,
                totalServers,
                totalRouters,
                pendingTickets,
                inProgressTickets,
                completedToday,
            });
        }

        // Lab Incharge - Lab stats
        if (role === "LAB_INCHARGE") {
            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { labId: true, managedLab: { select: { id: true } } },
            });

            const labId = user?.labId || user?.managedLab?.id;

            if (!labId) {
                return NextResponse.json({ error: "No lab assigned" }, { status: 400 });
            }

            const [
                totalSystems,
                workingSystems,
                issues,
                myTickets,
                pendingTickets,
            ] = await Promise.all([
                prisma.asset.count({ where: { labId: user.labId } }),
                prisma.asset.count({ where: { labId: user.labId, status: "ACTIVE" } }),
                prisma.asset.count({ where: { labId: user.labId, status: { not: "ACTIVE" } } }),
                prisma.ticket.count({ where: { createdById: userId } }),
                prisma.ticket.count({ where: { createdById: userId, status: { in: ["SUBMITTED", "APPROVED"] } } }),
            ]);

            return NextResponse.json({
                totalSystems,
                workingSystems,
                issues,
                myTickets,
                pendingTickets,
            });
        }

        return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    } catch (error) {
        console.error("Error fetching stats:", error);
        return NextResponse.json(
            { error: "Failed to fetch statistics" },
            { status: 500 }
        );
    }
}
