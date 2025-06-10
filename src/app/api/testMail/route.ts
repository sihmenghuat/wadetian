import { sendMail } from "@/app/lib/sendMail";

export async function GET() {
  const testRecipient = process.env.TEST_EMAIL || "your@email.com";
  try {
    await sendMail({
      to: testRecipient,
      subject: "Test Email from bbit App",
      text: "This is a test email to confirm your sendMail environment setup is working.",
    });
    return Response.json({ message: `Test email sent to ${testRecipient}` });
  } catch (e) {
    console.error("Test sendMail error:", e);
    return Response.json({ error: "Failed to send test email." }, { status: 500 });
  }
}
