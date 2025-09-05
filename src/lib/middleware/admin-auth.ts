import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-config";
import { prisma } from "@/lib/prisma";
import { UserType } from "@/generated/prisma";

export interface AdminAuthResult {
  userId: string;
  user: {
    id: string;
    email: string;
    userType: UserType;
    firstName?: string | null;
    lastName?: string | null;
  };
}

/**
 * Middleware to verify user is an admin
 */
export async function requireAdminAuth(
  request: NextRequest
): Promise<AdminAuthResult | NextResponse> {
  try {
    // Get session
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Unauthorized - Please login" },
        { status: 401 }
      );
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        email: true,
        userType: true,
        firstName: true,
        lastName: true,
        status: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check if user is active
    if (user.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "User account is not active" },
        { status: 403 }
      );
    }

    // Check if user is admin
    if (user.userType !== UserType.ADMIN) {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    return {
      userId: user.id,
      user: {
        id: user.id,
        email: user.email,
        userType: user.userType,
        firstName: user.firstName,
        lastName: user.lastName
      }
    };
  } catch (error) {
    console.error("Admin auth middleware error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Log admin action for audit trail
 */
export async function logAdminAction(
  userId: string,
  action: string,
  tableName: string,
  recordId: string,
  oldValues?: any,
  newValues?: any,
  request?: NextRequest
) {
  try {
    const ipAddress = request?.headers.get("x-forwarded-for") || 
                      request?.headers.get("x-real-ip") || 
                      "unknown";
    const userAgent = request?.headers.get("user-agent") || "unknown";

    await prisma.auditLog.create({
      data: {
        userId,
        action,
        tableName,
        recordId,
        oldValues: oldValues ? JSON.parse(JSON.stringify(oldValues)) : undefined,
        newValues: newValues ? JSON.parse(JSON.stringify(newValues)) : undefined,
        ipAddress,
        userAgent
      }
    });
  } catch (error) {
    console.error("Failed to log admin action:", error);
    // Don't throw error to prevent main operation from failing
  }
}
