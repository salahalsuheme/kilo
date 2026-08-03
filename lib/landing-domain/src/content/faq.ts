import type { FaqItem } from "../types.js";
import { faqItemSchema } from "../schemas/content.schema.js";

export const FAQ_SECTION = {
  title: {
    ar: "الأسئلة الشائعة",
    en: "Frequently asked questions",
  },
};

export const FAQ_ITEMS: FaqItem[] = faqItemSchema.array().parse([
  {
    question: {
      ar: "ما أنواع المركبات المتوفرة لدى كيلو؟",
      en: "What vehicle types does Kilo offer?",
    },
    answer: {
      ar: "نوفر حالياً سوزوكي فان مبرد وسوزوكي فان جاف ب أحدث الموديلات.",
      en: "We currently offer Suzuki refrigerated van and Suzuki dry van in the latest models.",
    },
  },
  {
    question: {
      ar: "هل المركبات المبردة متوافقة مع هيئة الغذاء والدواء؟",
      en: "Are refrigerated vehicles SFDA compliant?",
    },
    answer: {
      ar: "نعم، مركباتنا المبردة متوافقة مع متطلبات هيئة الغذاء والدواء وتتميز بتبريد ممتاز وعزل حراري عالي الجودة.",
      en: "Yes. Our refrigerated vehicles comply with SFDA requirements and feature excellent cooling and high-quality thermal insulation.",
    },
  },
  {
    question: {
      ar: "هل كيلو تقدم خدمة توصيل الطلبات ؟",
      en: "Does Kilo offer order delivery service?",
    },
    answer: {
      ar: "نعم . كيلو لديها قسم خاص لتوصيل طلباتك بسهولة الى العميل وبسرعة حسب أعلى معايير توصيل الميل الأخير",
      en: "Yes. Kilo has a dedicated department to deliver your orders to customers easily and quickly, according to the highest last-mile delivery standards.",
    },
  },
  {
    question: {
      ar: "هل كيلو تقدم خدمة التأجير؟",
      en: "Does Kilo offer rental service?",
    },
    answer: {
      ar: "نعم . كيلو لديها ايضا قسم خاص بتأجير مركبات النقل الخفيف الى الشركات والمؤسسات ويشمل التأمين والصيانة المجانية والتوصيل المجاني وتتبع المركبات المجاني ايضا",
      en: "Yes. Kilo also has a dedicated department for renting light commercial vehicles to companies and institutions. It includes free insurance, free maintenance, free delivery, and free vehicle tracking.",
    },
  },
  {
    question: {
      ar: "كيف أطلب الخدمة ؟",
      en: "How do I request the service?",
    },
    answer: {
      ar: "اضغط هنا لطلب اي خدمة تريد من كيلو",
      en: "Click here to request any service you need from Kilo",
    },
    whatsappLinkAnswer: {
      linkText: {
        ar: "اضغط هنا",
        en: "Click here",
      },
      suffix: {
        ar: " لطلب اي خدمة تريد من كيلو",
        en: " to request any service you need from Kilo",
      },
    },
  },
]);
