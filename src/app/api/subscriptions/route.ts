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

  const subscriptions = await prisma.subscription.findMany({
    where: { userId },
    include: { newsletter: true },
    orderBy: { newsletter: { category: "asc" } },
  });

  return Response.json(subscriptions);
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;
  const { newsletterId } = await request.json();

  const subscription = await prisma.subscription.upsert({
    where: { userId_newsletterId: { userId, newsletterId } },
    update: { active: true },
    create: { userId, newsletterId, active: true },
  });

  return Response.json(subscription);
}

export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;
  const { newsletterId, active } = await request.json();

  const subscription = await prisma.subscription.update({
    where: { userId_newsletterId: { userId, newsletterId } },
    data: { active },
  });

  return Response.json(subscription);
}

export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = (session.user as { id: string }).id;
  const { newsletterId } = await request.json();

  await prisma.subscription.delete({
    where: { userId_newsletterId: { userId, newsletterId } },
  });

  return Response.json({ success: true });
}
