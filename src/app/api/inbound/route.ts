import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { categorizeNewsletter } from "@/lib/categorize";

export async function POST(request: NextRequest) {
  // SendGrid Inbound Parse sends multipart form data
  const formData = await request.formData();

  const to = (formData.get("to") as string) || "";
  const from = (formData.get("from") as string) || "";
  const subject = (formData.get("subject") as string) || "";
  const html = (formData.get("html") as string) || "";
  const text = (formData.get("text") as string) || "";

  // Extract the ingest email address from the "to" field
  const ingestMatch = to.match(/([a-f0-9]+@onedigest\.com)/i);
  if (!ingestMatch) {
    return Response.json({ error: "Unknown recipient" }, { status: 404 });
  }

  const ingestEmail = ingestMatch[1].toLowerCase();

  // Find the user by their ingest email
  const user = await prisma.user.findUnique({ where: { ingestEmail } });
  if (!user) {
    return Response.json({ error: "User not found" }, { status: 404 });
  }

  // Extract sender email
  const senderMatch = from.match(/<(.+?)>/) || [null, from.trim()];
  const senderEmail = (senderMatch[1] || from).toLowerCase().trim();

  // Find or create the newsletter
  let newsletter = await prisma.newsletter.findUnique({ where: { senderEmail } });

  if (!newsletter) {
    const senderName = from.replace(/<.*>/, "").trim().replace(/"/g, "") || senderEmail;
    const category = categorizeNewsletter(senderName, subject, text || html);

    newsletter = await prisma.newsletter.create({
      data: {
        name: senderName,
        senderEmail,
        category,
      },
    });
  }

  // Check if user is subscribed (auto-subscribe on first email)
  let subscription = await prisma.subscription.findUnique({
    where: { userId_newsletterId: { userId: user.id, newsletterId: newsletter.id } },
  });

  if (!subscription) {
    subscription = await prisma.subscription.create({
      data: { userId: user.id, newsletterId: newsletter.id, active: true },
    });
  }

  // Store the inbound email
  await prisma.inboundEmail.create({
    data: {
      userId: user.id,
      newsletterId: newsletter.id,
      fromEmail: senderEmail,
      subject,
      htmlBody: html || text,
      textBody: text,
    },
  });

  return Response.json({ success: true });
}
