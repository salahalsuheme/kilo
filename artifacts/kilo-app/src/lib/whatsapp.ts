function normalizeMobileForWhatsApp(mobile: string): string | null {
  const digits = mobile.replace(/\D/g, "");
  if (!digits) return null;
  if (digits.startsWith("966")) return digits;
  if (digits.startsWith("0")) return `966${digits.slice(1)}`;
  if (digits.length === 9 && digits.startsWith("5")) return `966${digits}`;
  return digits;
}

export function buildWhatsAppUrl(mobile: string, message: string): string | null {
  const phone = normalizeMobileForWhatsApp(mobile);
  if (!phone) return null;
  // api.whatsapp.com مباشرة — wa.me يفسد الإيموجي أثناء إعادة التوجيه
  return `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(message)}`;
}

export function openWhatsAppChat(mobile: string, message: string): boolean {
  const url = buildWhatsAppUrl(mobile, message);
  if (!url) return false;
  window.open(url, "_blank", "noopener,noreferrer");
  return true;
}
