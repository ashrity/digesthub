import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { deliveryTime: true, timezone: true, ingestEmail: true },
  });

  return Response.json(user);
}

export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;
  const { deliveryTime, timezone } = await request.json();

  const data: Record<string, string> = {};
  if (deliveryTime) data.deliveryTime = deliveryTime;
  if (timezone) data.timezone = timezone;

  const user = await prisma.user.update({
    where: { id: userId },
    data,
    select: { deliveryTime: true, timezone: true, ingestEmail: true },
  });

  return Response.json(user);
}
