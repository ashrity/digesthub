import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY || "");

interface DigestSection {
  category: string;
  newsletters: {
    name: string;
    subject: string;
    htmlBody: string;
  }[];
}

export async function sendDigestEmail(
  toEmail: string,
  sections: DigestSection[]
) {
  const htmlSections = sections
    .map(
      (section) => `
      <div style="margin-bottom: 32px;">
        <h2 style="color: #6366f1; border-bottom: 2px solid #6366f1; padding-bottom: 8px; font-size: 22px;">
          ${section.category}
        </h2>
        ${section.newsletters
          .map(
            (nl) => `
          <div style="margin: 16px 0; padding: 16px; background: #f8fafc; border-radius: 8px; border-left: 4px solid #6366f1;">
            <h3 style="margin: 0 0 4px; color: #1e293b; font-size: 18px;">${nl.name}</h3>
            <p style="margin: 0 0 12px; color: #64748b; font-size: 14px;">${nl.subject}</p>
            <div style="color: #334155; font-size: 14px; line-height: 1.6;">
              ${nl.htmlBody}
            </div>
          </div>
        `
          )
          .join("")}
      </div>
    `
    )
    .join("");

  const html = `
    <div style="max-width: 680px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 24px;">
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="color: #1e293b; font-size: 28px; margin: 0;">Your Daily Digest</h1>
        <p style="color: #64748b; margin: 8px 0 0;">
          ${new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </div>
      ${htmlSections}
      <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #94a3b8; font-size: 12px;">
        Sent by OneDigest
      </div>
    </div>
  `;

  await sgMail.send({
    to: toEmail,
    from: process.env.SENDGRID_FROM_EMAIL || "digest@onedigest.com",
    subject: `Your Daily Digest - ${new Date().toLocaleDateString()}`,
    html,
  });
}
