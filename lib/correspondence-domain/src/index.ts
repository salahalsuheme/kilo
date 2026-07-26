export { CORRESPONDENCE_SEND_STATUS_LABELS, CORRESPONDENCE_RESEND_IN_PROGRESS_LABEL_AR } from "./correspondence-labels.js";
export {
  CORRESPONDENCE_BODY_INVALID,
  CORRESPONDENCE_TEMPLATE_BODY_INVALID,
  CORRESPONDENCE_FIELD_ERRORS,
  CORRESPONDENCE_TEMPLATE_FIELD_ERRORS,
} from "./correspondence-field-errors.js";
export {
  CORRESPONDENCE_SEND_STATUSES,
  isCorrespondenceSendStatus,
  type CorrespondenceSendStatus,
} from "./correspondence-status.js";
export {
  CORRESPONDENCE_ATTACHMENT_MAX_BYTES,
  CORRESPONDENCE_ATTACHMENT_MAX_COUNT,
  CORRESPONDENCE_ATTACHMENT_MIME_TYPES,
  isCorrespondenceAttachmentMimeType,
} from "./correspondence-attachment.js";
export {
  CreateCorrespondenceTemplateBodySchema,
  UpdateCorrespondenceTemplateBodySchema,
  type CreateCorrespondenceTemplateBodyInput,
  type UpdateCorrespondenceTemplateBodyInput,
} from "./correspondence-template-body.schema.js";
export {
  CorrespondenceMessageFieldsSchema,
  parseCorrespondenceMultipartFields,
  type CorrespondenceMessageFieldsInput,
} from "./correspondence-message-body.schema.js";
export {
  buildCorrespondenceTemplateVariables,
  formatCorrespondenceDateTime,
  renderCorrespondenceTemplate,
  type CorrespondenceTemplateContextInput,
  type CorrespondenceTemplateEstablishmentInput,
} from "./correspondence-template.js";
export {
  buildCorrespondenceBrandedEmail,
  type BuildCorrespondenceBrandedEmailInput,
} from "./build-correspondence-branded-email.js";
export { CORRESPONDENCE_EMAIL_HEADER_LOGO_PATH } from "./correspondence-brand-assets.js";
export {
  CORRESPONDENCE_EMAIL_FOOTER_LOGO_CID,
  CORRESPONDENCE_EMAIL_HEADER_LOGO_CID,
  CORRESPONDENCE_EMAIL_HEADER_LOGO_FILENAME,
  buildCorrespondenceEmailLogoImgTag,
  extractUploadPublicPathFromAssetUrl,
  resolveCorrespondenceEmailInlineImageSlots,
  type CorrespondenceEmailLogoDisplay,
  type CorrespondenceInlineImageSlot,
  type CorrespondenceInlineImageSlotKind,
} from "./correspondence-email-inline-images.js";
export {
  CORRESPONDENCE_EMAIL_FOOTER_ADDRESS_AR,
  CORRESPONDENCE_EMAIL_FOOTER_TAGLINE_AR,
  CORRESPONDENCE_BRANDED_EMAIL_HTML_SHELL,
} from "./correspondence-branded-email-shell.js";
export {
  CORRESPONDENCE_DEFAULT_TEMPLATE_BODY,
  CORRESPONDENCE_DEFAULT_TEMPLATE_SUBJECT,
} from "./correspondence-default-template.js";
export {
  buildCorrespondenceEmailLogoHtml,
  renderCorrespondenceBrandedEmailHtml,
  renderCorrespondencePlainTextEmail,
  resolveEmailPublicAssetUrl,
  type RenderCorrespondenceBrandedEmailInput,
} from "./render-correspondence-branded-email.js";
export { renderEmailContentBox, EMAIL_CONTENT_BOX_BACKGROUND } from "./render-email-content-box.js";
export {
  escEmailHtml,
  emailTextToHtml,
  substituteEmailTemplateVars,
} from "./email-template-vars.js";
