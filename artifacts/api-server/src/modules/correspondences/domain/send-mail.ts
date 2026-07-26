import { validateCorrespondenceEmailBeforeSend } from "@workspace/settings-domain";
import type { NotificationEmailSettings } from "@workspace/settings-domain";
import { getResendApiKey } from "../../../env.js";
import { getCorrespondenceEmailDeliveryStatus } from "../../settings/domain/correspondence-email-delivery-runtime.js";
import { sendCorrespondenceViaResend } from "./send-resend-mail.js";
import { sendCorrespondenceViaSmtp } from "./send-smtp-mail.js";

export interface CorrespondenceMailAttachment {
  fileName: string;
  content: Buffer;
  contentType: string;
}

export interface CorrespondenceInlineImage {
  cid: string;
  content: Buffer;
  contentType: string;
  filename: string;
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
  const delivery = getCorrespondenceEmailDeliveryStatus();

  const configError = validateCorrespondenceEmailBeforeSend({
    deliveryMode: delivery.correspondenceEmailDeliveryMode,
    enabled: input.enabled,
    settings: input.settings,
    smtpPassword: input.smtpPassword,
    resendApiKeyConfigured: delivery.resendApiKeyConfigured,
  });
  if (configError) {
    return { ok: false, reason: configError };
  }

  if (!input.toEmail.trim()) {
    return { ok: false, reason: "لا يوجد بريد إلكتروني للمنشأة" };
  }

  if (delivery.correspondenceEmailDeliveryMode === "resend") {
    const apiKey = getResendApiKey();
    if (!apiKey) {
      return {
        ok: false,
        reason: "مفتاح Resend غير مضبوط على الخادم (RESEND_API_KEY).",
      };
    }
    return sendCorrespondenceViaResend({ ...input, apiKey });
  }

  return sendCorrespondenceViaSmtp(input);
}
