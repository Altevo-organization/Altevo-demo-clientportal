import { prisma } from "./db";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";
import crypto from "crypto";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret";
const SESSION_COOKIE = process.env.SESSION_COOKIE_NAME || "altevo_session";
const SESSION_MAX_AGE = (parseInt(process.env.SESSION_MAX_AGE_DAYS || "7")) * 24 * 60 * 60 * 1000;

export interface SessionPayload {
  sessionId: string;
  clientAccountId: string;
  organizationId: string;
  role: string;
}

export async function createSession(
  clientAccountId: string,
  ipAddress?: string,
  userAgent?: string
): Promise<string> {
  const token = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE);

  await prisma.session.create({
    data: {
      clientAccountId,
      token,
      ipAddress,
      userAgent,
      expiresAt,
    },
  });

  const account = await prisma.clientAccount.findUnique({
    where: { id: clientAccountId },
    select: { organizationId: true, role: true },
  });

  const maxAgeSec = parseInt(process.env.SESSION_MAX_AGE_DAYS || "7", 10) * 86400;
  const jwtToken = jwt.sign(
    {
      sessionId: token,
      clientAccountId,
      organizationId: account!.organizationId,
      role: account!.role,
    } satisfies SessionPayload,
    JWT_SECRET,
    { expiresIn: maxAgeSec }
  );

  return jwtToken;
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) return null;

  try {
    const payload = jwt.verify(token, JWT_SECRET) as SessionPayload;

    // Verify session is still valid in DB
    const session = await prisma.session.findUnique({
      where: { token: payload.sessionId },
    });

    if (!session || session.revokedAt || session.expiresAt < new Date()) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export async function getSessionWithAccount() {
  const session = await getSession();
  if (!session) return null;

  const account = await prisma.clientAccount.findUnique({
    where: { id: session.clientAccountId },
    include: { organization: true },
  });

  if (!account || !account.isActive) return null;

  return { session, account };
}

export function getSessionCookieName() {
  return SESSION_COOKIE;
}

export function getSessionMaxAge() {
  return SESSION_MAX_AGE;
}
