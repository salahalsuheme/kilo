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
      ar: "يشمل العقد الصيانة والتأمين وسيارة بديلة عند التعطيل ونظام تتبع للمركبات.",
      en: "The monthly contract includes maintenance, insurance, a replacement vehicle during breakdowns, and fleet tracking.",
    },
  },
  {
    question: {
      ar: "هل تقدمون سيارة بديلة عند التعطيل؟",
      en: "Do you provide a replacement vehicle during breakdowns?",
    },
    answer: {
      ar: "نعم، نوفر سيارة بديلة في حال التعطيل لضمان استمرارية عمليات شركتك.",
      en: "Yes. We provide a replacement vehicle during breakdowns to keep your operations running.",
    },
  },
  {
    question: {
      ar: "لمن تقدمون خدمات التأجير؟",
      en: "Who is your rental service for?",
    },
    answer: {
      ar: "نخدم الشركات والمؤسسات مثل شركات التوزيع الغذائي، والأدوية، والتموين، والتجزئة.",
      en: "We serve companies and institutions such as food distribution, pharmaceutical, catering, and retail businesses.",
    },
  },
  {
    question: {
      ar: "كيف أطلب عرض سعر؟",
      en: "How can I request a quote?",
    },
    answer: {
      ar: "تواصل معنا عبر واتساب مع تفاصيل احتياجك، وسنرد عليك بسرعة بعرض مناسب.",
      en: "Contact us on WhatsApp with your requirements and we will respond promptly with a suitable offer.",
    },
  },
]);
