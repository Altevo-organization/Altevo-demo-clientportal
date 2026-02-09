import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession, getSessionCookieName } from "@/lib/auth";

export async function POST() {
  try {
    const session = await getSession();

    if (session) {
      // Revoke the session
      await prisma.session.update({
        where: { token: session.sessionId },
        data: { revokedAt: new Date() },
      });

      // Log the logout
      await prisma.auditLog.create({
        data: {
          organizationId: session.organizationId,
          actorId: session.clientAccountId,
          action: "logout",
          entityType: "session",
        },
      });
    }

    const response = NextResponse.json({ success: true });
    response.cookies.delete(getSessionCookieName());
    return response;
  } catch {
    const response = NextResponse.json({ success: true });
    response.cookies.delete(getSessionCookieName());
    return response;
  }
}
