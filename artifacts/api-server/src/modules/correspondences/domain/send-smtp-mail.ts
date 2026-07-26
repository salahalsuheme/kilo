import nodemailer from "nodemailer";
import {
  buildNotificationMailHeaders,
  NOTIFICATION_SMTP_CONNECTION_TIMEOUT_MS,
  NOTIFICATION_SMTP_GREETING_TIMEOUT_MS,
  NOTIFICATION_SMTP_SEND_TIMEOUT_MS,
  NOTIFICATION_SMTP_SOCKET_TIMEOUT_MS,
  resolveNotificationMailIdentity,
  resolveNotificationSmtpTransport,
} from "@workspace/settings-domain";
import type { SendCorrespondenceMailInput } from "./send-mail.js";

function withAsyncTimeout<T>(promise: Promise<T>, ms: number, message: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error(message)), ms);
    promise
      .then((value) => {
        clearTimeout(timer);
        resolve(value);
      })
      .catch((error: unknown) => {
        clearTimeout(timer);
        reject(error);
      });
  });
}

export async function sendCorrespondenceViaSmtp(
  input: SendCorrespondenceMailInput,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const to = input.toEmail.trim();
  const host = input.settings.smtpHost!;
  const port = input.settings.smtpPort!;
  const user = input.settings.smtpUser!;
  const pass = input.smtpPassword!;
  const mailIdentity = resolveNotificationMailIdentity(input.settings);
  const transport = resolveNotificationSmtpTransport(input.settings);

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: transport.secure,
    requireTLS: transport.requireTLS,
    auth: { user, pass },
    connectionTimeout: NOTIFICATION_SMTP_CONNECTION_TIMEOUT_MS,
    greetingTimeout: NOTIFICATION_SMTP_GREETING_TIMEOUT_MS,
    socketTimeout: NOTIFICATION_SMTP_SOCKET_TIMEOUT_MS,
  });

  const inlineAttachments =
    input.inlineImages?.map((image) => ({
      filename: image.cid,
      content: image.content,
      contentType: image.contentType,
      cid: image.cid,
    })) ?? [];

  try {
    await withAsyncTimeout(
      transporter.sendMail({
        from: mailIdentity.from,
        replyTo: mailIdentity.replyTo,
        to,
        subject: input.subject,
        text: input.text,
        html: input.html,
        headers: buildNotificationMailHeaders(mailIdentity.replyTo),
        attachments: [
          ...inlineAttachments,
          ...input.attachments.map((file) => ({
            filename: file.fileName,
            content: file.content,
            contentType: file.contentType,
          })),
        ],
      }),
      NOTIFICATION_SMTP_SEND_TIMEOUT_MS,
      "انتهت مهلة إرسال البريد. تحقق من إعدادات SMTP ومن أن الاستضافة تسمح بالاتصال الصادر على المنفذ المحدد.",
    );
    return { ok: true };
  } catch (error) {
    const message =
      error instanceof Error && error.message.trim()
        ? error.message.trim()
        : "تعذر إرسال البريد";
    return { ok: false, reason: message };
  }
}
