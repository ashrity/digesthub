import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const category = searchParams.get("category");
  const search = searchParams.get("search");

  const where: Record<string, unknown> = {};
  if (category && category !== "ALL") {
    where.category = category;
  }
  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  const session = await getServerSession(authOptions);

  const newsletters = await prisma.newsletter.findMany({
    where,
    include: {
      subscriptions: session?.user
        ? { where: { userId: (session.user as { id: string }).id } }
        : false,
      _count: { select: { subscriptions: true } },
    },
    orderBy: { name: "asc" },
  });

  return Response.json(newsletters);
}
