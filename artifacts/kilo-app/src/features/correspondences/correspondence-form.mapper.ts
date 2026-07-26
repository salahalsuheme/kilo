import type { CreateCorrespondenceMultipartBody } from "@/lib/api-client-react-tenant";
import type { CorrespondenceFormValues } from "@/features/correspondences/correspondence-form.schema";

export function correspondenceFormValuesToBody(
  values: CorrespondenceFormValues,
  attachments: Blob[],
): CreateCorrespondenceMultipartBody {
  const templateId = values.templateId?.trim();
  return {
    establishmentId: Number(values.establishmentId),
    templateId: templateId ? Number(templateId) : undefined,
    subject: values.subject,
    body: values.body,
    attachments: attachments.length > 0 ? attachments : undefined,
  };
}
