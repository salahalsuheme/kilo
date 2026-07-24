import {
  CONTRACT_ORG_SIGNATURE_LINE,
  CONTRACT_ORG_STAMP_LINE,
  contractOrgMediaKindFromImgOnlyLine,
} from "./contract-template-org-media.js";

/**
 * rendered_content يخزّن نصاً فقط مع علامات [[kilo:org-*]] — لا HTML صور.
 * يحوّل أي سطور img قديمة (من قوالب سابقة) إلى علامات عند الحفظ.
 */
export function normalizeRenderedContractContentForStorage(content: string): string {
  return content
    .split(/\r?\n/)
    .map((line) => {
      const kind = contractOrgMediaKindFromImgOnlyLine(line);
      if (kind === "stamp") {
        return CONTRACT_ORG_STAMP_LINE;
      }
      if (kind === "signature") {
        return CONTRACT_ORG_SIGNATURE_LINE;
      }
      return line;
    })
    .join("\n");
}
