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
      ar: "نوفر حالياً سوزوكي فان مبرد وسوزوكي فان جاف لتأجير الشركات والمؤسسات.",
      en: "We currently offer Suzuki refrigerated van and Suzuki dry van for corporate rental.",
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
      ar: "ماذا يشمل العقد الشهري؟",
      en: "What is included in the monthly contract?",
    },
    answer: {
      ar: "يشمل العقد الصيانة والتأمين وسيارة بديلة عند التعطل ونظام تتبع للمركبات.",
      en: "The monthly contract includes maintenance, insurance, a replacement vehicle during breakdowns, and fleet tracking.",
    },
  },
  {
    question: {
      ar: "لمن تقدمون خدمات التأجير؟",
      en: "Who is your rental service for?",
    },
    answer: {
      ar: "نخدم كل الشركات والمؤسسات التي تحتاج مركبات نقل خفيف مبردة او جافة.",
      en: "We serve all companies and institutions that need refrigerated or dry light commercial vehicles.",
    },
  },
  {
    question: {
      ar: "كم أسعار التأجير ؟",
      en: "What are the rental prices?",
    },
    answer: {
      ar: "تبدأ الأسعار من 2600 ريال شامل الضريبة للعقد الشهري الواحد. وتختلف الاسعار حسب نوع السيارة.",
      en: "Prices start from SAR 2,600 including VAT per monthly contract. Prices vary depending on the vehicle type.",
    },
  },
  {
    question: {
      ar: "كيف أطلب الخدمة ؟",
      en: "How do I request the service?",
    },
    answer: {
      ar: "اضغط هنا للطلب الفوري للتأجير",
      en: "Click here for an instant rental request",
    },
    whatsappLinkAnswer: {
      linkText: {
        ar: "اضغط هنا",
        en: "Click here",
      },
      suffix: {
        ar: " للطلب الفوري للتأجير",
        en: " for an instant rental request",
      },
    },
  },
]);
