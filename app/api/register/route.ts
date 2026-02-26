import { NextResponse } from "next/server";
import bcryptjs from "bcryptjs";
const { hash } = bcryptjs;
import { db } from "@/lib/db";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { logActivity } from "@/lib/logger";

const userSchema = z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().min(1, "Email is required").email("Invalid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    role: z.enum(["USER", "HOD", "LAB_INCHARGE"]).optional(),
    departmentId: z.string().optional(),
    departmentName: z.string().optional(),
});

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        const body = await req.json();
        const { email, password, name, role, departmentId, departmentName } = userSchema.parse(body);

        // RBAC: Only DEAN can register someone as ACTIVE with a specialized role
        // Public registration for HOD/LAB_INCHARGE is allowed but will be set to PENDING
        if (role && role !== "USER") {
            const isSelfRegistering = !session || session.user.role !== "DEAN";
            const allowedPublicRoles = ["HOD", "LAB_INCHARGE"];

            if (isSelfRegistering && !allowedPublicRoles.includes(role)) {
                return NextResponse.json(
                    { message: "Unauthorized: Only the Dean can register specialized roles" },
                    { status: 403 }
                );
            }
        }

        const existingUser = await db.user.findUnique({
            where: { email: email },
        });

        if (existingUser) {
            return NextResponse.json(
                { user: null, message: "User with this email already exists" },
                { status: 409 }
            );
        }

        const hashedPassword = await hash(password, 10);
        const targetRole = role || "USER";
        const isApprovalRequired = (targetRole === "HOD" || targetRole === "LAB_INCHARGE") && (!session || session.user.role !== "DEAN");

        // Handle Department Creation/Assignment
        let finalDeptId = departmentId || null;

        if (!finalDeptId && departmentName && targetRole === "HOD") {
            // First check if a department with this name already exists
            const existingDept = await db.department.findFirst({
                where: {
                    name: {
                        equals: departmentName
                    }
                }
            });

            if (existingDept) {
                // Use the existing department ID
                finalDeptId = existingDept.id;
            } else {
                // Create a new department if it truly doesn't exist
                const newDept = await db.department.create({
                    data: {
                        name: departmentName,
                        code: departmentName.substring(0, 5).toUpperCase().replace(/\s/g, '') + Math.floor(10 + Math.random() * 90),
                        description: `Manually registered during HOD onboarding for ${name}`,
                    }
                });
                finalDeptId = newDept.id;
            }
        }

        const newUser = await db.user.create({
            data: {
                email,
                name,
                password: hashedPassword,
                role: targetRole as any,
                status: (isApprovalRequired ? "PENDING" : "ACTIVE") as any,
                departmentId: finalDeptId,
            },
        });

        if (isApprovalRequired) {
            if (!finalDeptId) {
                return NextResponse.json({ message: "Department is required for specialized role registration" }, { status: 400 });
            }

            await db.request.create({
                data: {
                    requestNumber: `REQ-ACC-${Math.floor(1000 + Math.random() * 9000)}`,
                    title: `Account Approval: ${name} (${targetRole})`,
                    description: `A new ${targetRole} account for ${name} (${email}) is pending institutional approval. Department: ${departmentName || 'Existing Department'}.`,
                    type: "ACCOUNT_APPROVAL",
                    priority: "HIGH",
                    status: "PENDING",
                    departmentId: finalDeptId,
                    createdById: newUser.id,
                }
            });
        }

        await logActivity({
            userId: newUser.id,
            action: "CREATE",
            entity: "USER",
            entityId: newUser.id,
            details: `New account registered: ${name} (${email}) as ${targetRole}`,
            departmentId: finalDeptId || undefined
        });

        // Remove password from response
        const { password: newUserPassword, ...rest } = newUser;

        return NextResponse.json(
            {
                user: rest,
                message: isApprovalRequired
                    ? "Account registered. Pending Dean's approval."
                    : "User created successfully"
            },
            { status: 201 }
        );
    } catch (error: any) {
        console.error("Registration error:", error);
        return NextResponse.json(
            { message: error?.message || "Something went wrong" },
            { status: 500 }
        );
    }
}
