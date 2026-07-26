export const CORRESPONDENCE_EMAIL_FOOTER_TAGLINE_AR = "وجهتك لإسطول مميز لشركتك";
export const CORRESPONDENCE_EMAIL_FOOTER_ADDRESS_AR = "Saudi Arabia - Riyadh";

const FOOTER_ROW_CELLS = `                  <td style="vertical-align:middle;padding-inline-end:12px;width:44px;">
                    {{logo_footer}}
                  </td>
                  <td style="vertical-align:middle;width:1px;padding:0 12px;">
                    <div style="width:1px;height:28px;background-color:#D1D5DB;"></div>
                  </td>
                  <td style="vertical-align:middle;font-size:13px;font-weight:400;color:#9CA3AF;line-height:1.4;">
                    {{footer_tagline}}
                  </td>`;

const EMAIL_RESPONSIVE_STYLES = `<style>
  @media only screen and (max-width: 620px) {
    .email-outer { padding: 16px 20px !important; }
    .email-card { width: 100% !important; max-width: 100% !important; }
    .email-body { padding: 28px 20px 20px !important; }
    .email-footer { padding: 20px !important; }
    .email-header { padding: 20px !important; }
  }
</style>`;

/** Targa-style branded shell — Arabic correspondence (welcome-email layout). */
export const CORRESPONDENCE_BRANDED_EMAIL_HTML_SHELL = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{{heading}}</title>
  ${EMAIL_RESPONSIVE_STYLES}
</head>
<body style="margin:0;padding:0;background-color:#F5F5F5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" class="email-outer" style="background-color:#F5F5F5;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" class="email-card" style="width:100%;max-width:600px;background:#FFFFFF;border-radius:12px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
          <tr>
            <td class="email-header" style="background:#000000;padding:24px 32px;text-align:center;">
              {{logo_header}}
            </td>
          </tr>
          <tr>
            <td class="email-body" style="padding:40px 32px 24px;" dir="rtl">
              <h1 style="margin:0 0 24px;font-size:28px;font-weight:700;color:#111827;text-align:center;line-height:1.3;">{{heading}}</h1>
              <p style="margin:0 0 24px;font-size:15px;color:#374151;line-height:1.6;">مرحباً {{establishment_name}}،</p>
              {{content_box}}
            </td>
          </tr>
          <tr>
            <td class="email-footer" style="padding:24px 32px;border-top:1px solid #E0E0E0;" dir="rtl">
              <table role="presentation" cellspacing="0" cellpadding="0">
                <tr>
${FOOTER_ROW_CELLS}
                </tr>
              </table>
            </td>
          </tr>
        </table>
        <p style="margin:24px 0 0;font-size:11px;color:#9CA3AF;text-align:center;line-height:1.5;" dir="rtl">
          {{footer_address}}
        </p>
      </td>
    </tr>
  </table>
</body>
</html>`;
