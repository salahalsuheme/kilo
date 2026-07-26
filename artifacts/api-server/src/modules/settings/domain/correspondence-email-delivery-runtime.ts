import type { CorrespondenceEmailDeliveryMode } from "@workspace/settings-domain";
import {
  getResendApiKey,
  resolveCorrespondenceEmailDeliveryMode,
} from "../../../env.js";

export function getCorrespondenceEmailDeliveryStatus(): {
  correspondenceEmailDeliveryMode: CorrespondenceEmailDeliveryMode;
  resendApiKeyConfigured: boolean;
} {
  return {
    correspondenceEmailDeliveryMode: resolveCorrespondenceEmailDeliveryMode(),
    resendApiKeyConfigured: Boolean(getResendApiKey()),
  };
}
