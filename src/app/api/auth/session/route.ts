import { NextResponse } from "next/server";
import { getSessionWithAccount } from "@/lib/auth";

export async function GET() {
  const sessionData = await getSessionWithAccount();

  if (!sessionData) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const { session, account } = sessionData;

  return NextResponse.json({
    authenticated: true,
    user: {
      id: account.id,
      name: account.name,
      email: account.email,
      role: session.role,
      organizationId: session.organizationId,
      organizationName: account.organization.name,
    },
  });
}
