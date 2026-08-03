import type { FeatureItem, PageMeta } from "../types.js";
import { featureItemSchema } from "../schemas/content.schema.js";

export const HOME_META: PageMeta = {
  title: {
    ar: "كيلو لتأجير مركبات الشركات",
    en: "Kilo — Corporate Vehicle Rental",
  },
  description: {
    ar: "تأجير مركبات للشركات والمؤسسات وتأجير مركبات مبردة",
    en: "Vehicle rental for companies and institutions, including refrigerated fleet vehicles.",
  },
  path: {
    ar: "/",
    en: "/landpage-en.html",
  },
};

export const HOME_HERO = {
  line1: {
    ar: "خدماتك اللوجستية",
    en: "Your logistics",
  },
  line2: {
    ar: "أسهل و أقرب !",
    en: "made easier and closer!",
  },
  cta: {
    ar: "أطلب خدمة الآن",
    en: "Request service now",
  },
};

export const WHY_KILO_SECTION = {
  title: {
    ar: "لماذا كيلو؟",
    en: "Why Kilo?",
  },
  subtitle: {
    ar: "حلول التوصيل و تأجير مركبات نقل خفيف مصممة لاحتياجات الشركات والمؤسسات",
    en: "Delivery and light commercial vehicle rental solutions built for corporate and institutional needs",
  },
};

export const WHY_KILO_ITEMS: FeatureItem[] = featureItemSchema.array().parse([
  {
    title: {
      ar: "خدمة توصيل كيلو",
      en: "Kilo delivery service",
    },
    description: {
      ar: "نقدم لك أسطول جاهز لتوصيل طلباتك مع سائقين مدربين على توصيل الطلبات اليومية",
      en: "We provide a ready fleet to deliver your orders with drivers trained for daily order delivery.",
    },
  },
  {
    title: {
      ar: "خدمة تأجير كيلو",
      en: "Kilo rental service",
    },
    description: {
      ar: "نقدم لك أسطول مركبات للتأجير لتتمكن من أستخدامه في شركتك",
      en: "We provide a vehicle fleet for rental so your company can use it for your operations.",
    },
  },
]);
