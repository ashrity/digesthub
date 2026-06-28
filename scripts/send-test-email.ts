import "dotenv/config";
import { sendDigestEmail } from "../src/lib/email";

const TO_EMAIL = "ashrity@gmail.com";

const sections = [
  {
    category: "Technology",
    newsletters: [
      {
        name: "The Verge",
        subject: "Apple Vision Pro 2 leaked ahead of WWDC",
        htmlBody:
          "<p>New reports suggest Apple is preparing a lighter, cheaper Vision Pro with an M4 chip and improved passthrough cameras. The headset is expected to launch at $2,499, down from the original $3,499 price point.</p>",
      },
      {
        name: "TLDR Tech",
        subject: "GitHub Copilot now writes entire PRs",
        htmlBody:
          "<p>GitHub announced Copilot Workspace can now autonomously create pull requests from issue descriptions, including tests and documentation. Early users report a 40% reduction in time-to-merge.</p>",
      },
    ],
  },
  {
    category: "Business & Finance",
    newsletters: [
      {
        name: "Morning Brew",
        subject: "Fed holds rates steady, markets rally",
        htmlBody:
          "<p>The Federal Reserve kept interest rates unchanged at 4.25%, signaling potential cuts in September. The S&P 500 rose 1.2% on the news, while the Nasdaq hit a new all-time high.</p>",
      },
    ],
  },
  {
    category: "Science",
    newsletters: [
      {
        name: "Nature Briefing",
        subject: "CRISPR breakthrough reverses aging in mice",
        htmlBody:
          "<p>Researchers at Stanford demonstrated a new gene therapy approach that restored muscle and cognitive function in aged mice. Clinical trials in humans could begin as early as 2027.</p>",
      },
      {
        name: "Space Explorer",
        subject: "SpaceX Starship completes first orbital refueling test",
        htmlBody:
          "<p>SpaceX successfully transferred propellant between two Starship vehicles in orbit, a critical milestone for NASA's Artemis lunar landing program.</p>",
      },
    ],
  },
];

async function main() {
  if (!process.env.SENDGRID_API_KEY || process.env.SENDGRID_API_KEY.startsWith("SG.your")) {
    console.error("ERROR: Set SENDGRID_API_KEY in .env first");
    process.exit(1);
  }
  if (!process.env.SENDGRID_FROM_EMAIL) {
    console.error("ERROR: Set SENDGRID_FROM_EMAIL in .env first");
    process.exit(1);
  }

  console.log(`Sending test digest to ${TO_EMAIL}...`);
  await sendDigestEmail(TO_EMAIL, sections);
  console.log("Sent successfully! Check your inbox.");
}

main().catch((err) => {
  console.error("Failed to send:", err);
  process.exit(1);
});
