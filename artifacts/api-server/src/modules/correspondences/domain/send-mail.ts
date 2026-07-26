import nodemailer from "nodemailer";
import {
  buildNotificationMailHeaders,
  resolveNotificationMailIdentity,
  resolveNotificationSmtpTransport,
  validateSettingsNotificationEmail,
} from "@workspace/settings-domain";
import type { NotificationEmailSettings } from "@workspace/settings-domain";

export interface CorrespondenceMailAttachment {
  fileName: string;
  content: Buffer;
  contentType: string;
}

export interface CorrespondenceInlineImage {
  cid: string;
  content: Buffer;
  contentType: string;
}

export interface SendCorrespondenceMailInput {
  enabled: boolean;
  settings: NotificationEmailSettings;
  smtpPassword: string | null;
  toEmail: string;
  subject: string;
  text: string;
  html: string;
  attachments: CorrespondenceMailAttachment[];
  inlineImages?: CorrespondenceInlineImage[];
}

export async function sendCorrespondenceMail(
  input: SendCorrespondenceMailInput,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  if (!input.enabled) {
    return { ok: false, reason: "إشعارات البريد غير مفعّلة في الإعدادات" };
  }

  const configError = validateSettingsNotificationEmail(
    true,
    input.settings,
    input.smtpPassword,
    undefined,
  );
  if (configError) {
    return { ok: false, reason: configError };
  }

  const to = input.toEmail.trim();
  if (!to) {
    return { ok: false, reason: "لا يوجد بريد إلكتروني للمنشأة" };
  }

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
  });

  const inlineAttachments =
    input.inlineImages?.map((image) => ({
      filename: image.cid,
      content: image.content,
      contentType: image.contentType,
      cid: image.cid,
    })) ?? [];

  try {
    await transporter.sendMail({
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
    });
    return { ok: true };
  } catch (error) {
    const message =
      error instanceof Error && error.message.trim()
        ? error.message.trim()
        : "تعذر إرسال البريد";
    return { ok: false, reason: message };
  }
}
