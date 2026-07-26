import { resolveNotificationMailIdentity } from "@workspace/settings-domain";
import type {
  CorrespondenceInlineImage,
  CorrespondenceMailAttachment,
  SendCorrespondenceMailInput,
} from "./send-mail.js";

const RESEND_SEND_TIMEOUT_MS = 120_000;

interface ResendErrorBody {
  message?: string;
  name?: string;
}

function buildResendAttachments(
  inlineImages: CorrespondenceInlineImage[],
  files: CorrespondenceMailAttachment[],
): { filename: string; content: string; content_id?: string }[] {
  const inline = inlineImages.map((image) => ({
    filename: `${image.cid}.img`,
    content: image.content.toString("base64"),
    content_id: image.cid,
  }));
  const regular = files.map((file) => ({
    filename: file.fileName,
    content: file.content.toString("base64"),
  }));
  return [...inline, ...regular];
}

export async function sendCorrespondenceViaResend(
  input: SendCorrespondenceMailInput & { apiKey: string },
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const mailIdentity = resolveNotificationMailIdentity(input.settings);
  const attachments = buildResendAttachments(input.inlineImages ?? [], input.attachments);

  const payload = {
    from: mailIdentity.from,
    to: [input.toEmail.trim()],
    subject: input.subject,
    html: input.html,
    text: input.text,
    reply_to: [mailIdentity.replyTo],
    ...(attachments.length > 0 ? { attachments } : {}),
  };

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${input.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(RESEND_SEND_TIMEOUT_MS),
    });

    if (!response.ok) {
      let reason = `تعذر الإرسال عبر Resend (${response.status})`;
      try {
        const body = (await response.json()) as ResendErrorBody;
        if (body.message?.trim()) {
          reason = body.message.trim();
        }
      } catch {
        const text = await response.text();
        if (text.trim()) {
          reason = text.trim();
        }
      }
      return { ok: false, reason };
    }

    return { ok: true };
  } catch (error) {
    const message =
      error instanceof Error && error.message.trim()
        ? error.message.trim()
        : "تعذر الإرسال عبر Resend";
    return { ok: false, reason: message };
  }
}
