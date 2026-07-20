import type { NavItem } from "../types.js";

export const NAV_ITEMS: NavItem[] = [
  {
    id: "home",
    label: { ar: "الرئيسية", en: "Home" },
    path: { ar: "/", en: "/landpage-en.html" },
  },
  {
    id: "fleet",
    label: { ar: "الأسطول", en: "Fleet" },
    path: { ar: "/fleet.html", en: "/fleet-en.html" },
  },
  {
    id: "faq",
    label: { ar: "الأسئلة الشائعة", en: "FAQ" },
    path: { ar: "/landpage.html#faq", en: "/landpage-en.html#faq" },
  },
  {
    id: "about",
    label: { ar: "حول كيلو", en: "About Kilo" },
    path: { ar: "/about.html", en: "/about-en.html" },
  },
];
