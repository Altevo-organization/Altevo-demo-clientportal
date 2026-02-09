import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createSession, getSessionCookieName, getSessionMaxAge } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email et mot de passe requis" },
        { status: 400 }
      );
    }

    const account = await prisma.clientAccount.findUnique({
      where: { email: email.toLowerCase() },
      include: { organization: true },
    });

    if (!account) {
      return NextResponse.json(
        { error: "Identifiants invalides" },
        { status: 401 }
      );
    }

    if (!account.isActive) {
      return NextResponse.json(
        { error: "Ce compte est désactivé. Contactez votre administrateur." },
        { status: 403 }
      );
    }

    const validPassword = await bcrypt.compare(password, account.passwordHash);
    if (!validPassword) {
      return NextResponse.json(
        { error: "Identifiants invalides" },
        { status: 401 }
      );
    }

    const ip = request.headers.get("x-forwarded-for") || "127.0.0.1";
    const userAgent = request.headers.get("user-agent") || "";

    const token = await createSession(account.id, ip, userAgent);

    // Log the login
    await prisma.auditLog.create({
      data: {
        organizationId: account.organizationId,
        actorId: account.id,
        action: "login",
        entityType: "session",
        ipAddress: ip,
        userAgent,
      },
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: account.id,
        name: account.name,
        email: account.email,
        role: account.role,
        organizationName: account.organization.name,
      },
    });

    response.cookies.set(getSessionCookieName(), token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: getSessionMaxAge() / 1000,
      path: "/",
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: "Erreur interne du serveur" },
      { status: 500 }
    );
  }
}
