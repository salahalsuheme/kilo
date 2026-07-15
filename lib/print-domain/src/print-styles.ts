export const PRINT_BASE_STYLES = `
  @page { size: A4; margin: 14mm; }
  * { box-sizing: border-box; }
  html, body {
    margin: 0;
    padding: 0;
    font-family: "Segoe UI", Tahoma, Arial, sans-serif;
    font-size: 13px;
    line-height: 1.55;
    color: #111827;
    background: #fff;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }
  body { direction: rtl; }
  .print-doc { max-width: 186mm; margin: 0 auto; }
  .print-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    padding-bottom: 14px;
    border-bottom: 2px solid #111827;
    margin-bottom: 18px;
  }
  .print-header__brand { display: flex; align-items: center; gap: 14px; min-width: 0; }
  .print-header__logo {
    width: 72px;
    height: 72px;
    object-fit: contain;
    flex-shrink: 0;
  }
  .print-header__logo-fallback {
    width: 72px;
    height: 72px;
    border-radius: 12px;
    background: #f3f4f6;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28px;
    font-weight: 700;
    color: #374151;
    flex-shrink: 0;
  }
  .print-header__name {
    font-size: 20px;
    font-weight: 700;
    margin: 0 0 4px;
    line-height: 1.3;
  }
  .print-header__meta {
    margin: 0;
    font-size: 12px;
    color: #4b5563;
    line-height: 1.5;
  }
  .print-header__qr img {
    width: 120px;
    height: 120px;
    display: block;
  }
  .print-title {
    text-align: center;
    margin: 0 0 6px;
    font-size: 18px;
    font-weight: 700;
  }
  .print-subtitle {
    text-align: center;
    margin: 0 0 16px;
    font-size: 12px;
    color: #6b7280;
  }
  .print-meta-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-bottom: 16px;
  }
  .print-box {
    border: 1px solid #d1d5db;
    border-radius: 8px;
    padding: 14px 16px;
    background: #fafafa;
    min-width: 0;
  }
  .print-box__title {
    font-size: 13px;
    font-weight: 700;
    color: #374151;
    margin: 0 0 10px;
    padding-bottom: 6px;
    border-bottom: 1px solid #e5e7eb;
  }
  .print-box p {
    margin: 0 0 6px;
    font-size: 12px;
    line-height: 1.6;
  }
  .print-box p:last-child { margin-bottom: 0; }
  .print-table {
    width: 100%;
    border-collapse: collapse;
    margin: 16px 0;
    font-size: 12px;
  }
  .print-table th,
  .print-table td {
    border: 1px solid #d1d5db;
    padding: 8px 10px;
    text-align: right;
    vertical-align: top;
  }
  .print-table th {
    background: #f3f4f6;
    font-weight: 700;
    color: #374151;
  }
  .print-table .num { direction: ltr; text-align: left; white-space: nowrap; }
  .print-totals {
    margin-top: 12px;
    margin-right: auto;
    width: min(100%, 280px);
    border: 1px solid #d1d5db;
    border-radius: 8px;
    overflow: hidden;
  }
  .print-totals__row {
    display: flex;
    justify-content: space-between;
    gap: 12px;
    padding: 8px 12px;
    border-bottom: 1px solid #e5e7eb;
    font-size: 12px;
  }
  .print-totals__row:last-child {
    border-bottom: none;
    background: #111827;
    color: #fff;
    font-weight: 700;
    font-size: 13px;
  }
  .print-totals__row .num { direction: ltr; }
  .print-contract-body {
    border: 1px solid #d1d5db;
    border-radius: 8px;
    padding: 20px 24px;
    margin-top: 20px;
    background: #fff;
  }
  .print-section-title {
    font-size: 14px;
    font-weight: 700;
    color: #111827;
    margin: 18px 0 10px;
    padding-bottom: 6px;
    border-bottom: 1px solid #e5e7eb;
  }
  .print-section-title:first-child { margin-top: 0; }
  .print-section { margin-bottom: 4px; }
  .print-line {
    margin: 0 0 6px;
    font-size: 13px;
    line-height: 1.75;
    color: #1f2937;
  }
  .print-line:last-child { margin-bottom: 0; }
  .print-footer {
    margin-top: 24px;
    padding-top: 12px;
    border-top: 1px solid #e5e7eb;
    font-size: 11px;
    color: #6b7280;
    text-align: center;
  }
  @media screen {
    body { padding: 20px; background: #f3f4f6; }
    .print-doc { background: #fff; padding: 24px; border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,.08); }
  }
  @media print {
    html, body { width: auto; overflow: visible; }
    body { background: #fff; padding: 0; }
    .print-doc {
      box-shadow: none;
      padding: 0;
      max-width: none;
      width: 100%;
      margin: 0;
    }
  }
`;

/** Styles for server-side PDF rendering (no screen chrome). */
export const PDF_RENDER_STYLES = `${PRINT_BASE_STYLES}
  body { padding: 0 !important; background: #fff !important; }
  .print-doc { max-width: none !important; margin: 0 !important; padding: 0 !important; box-shadow: none !important; }
`;
