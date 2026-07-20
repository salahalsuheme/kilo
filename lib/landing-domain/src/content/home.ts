import type { FeatureItem, PageMeta, StepItem } from "../types.js";
import { featureItemSchema, stepItemSchema } from "../schemas/content.schema.js";

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
    ar: "تأجير مركبات",
    en: "Corporate fleet",
  },
  line2: {
    ar: "للشركات بسهولة !",
    en: "rental made easy!",
  },
  cta: {
    ar: "اطلب التأجير الآن",
    en: "Request rental now",
  },
};

export const WHY_KILO_SECTION = {
  title: {
    ar: "لماذا كيلو؟",
    en: "Why Kilo?",
  },
  subtitle: {
    ar: "حلول تأجير مركبات نقل خفيف مصممة لاحتياجات الشركات والمؤسسات",
    en: "Light commercial vehicle rental solutions built for corporate and institutional needs",
  },
};

export const WHY_KILO_ITEMS: FeatureItem[] = featureItemSchema.array().parse([
  {
    title: {
      ar: "عقود شهرية بأسعار تنافسية",
      en: "Competitive monthly contracts",
    },
    description: {
      ar: "باقات شهرية مرنة تناسب احتياج شركتك دون تكاليف مفاجئة.",
      en: "Flexible monthly packages tailored to your operations without surprise costs.",
    },
  },
  {
    title: {
      ar: "شامل الصيانة والتأمين",
      en: "Maintenance and insurance included",
    },
    description: {
      ar: "الصيانة الدورية والتأمين ضمن العقد لتشغيل أسطولك بثقة.",
      en: "Routine maintenance and insurance are included so your fleet stays reliable.",
    },
  },
  {
    title: {
      ar: "سيارة بديلة عند التعطل",
      en: "Replacement vehicle on breakdown",
    },
    description: {
      ar: "نوفر مركبة بديلة عند التعطل لضمان استمرارية عملياتك.",
      en: "We provide a replacement vehicle during downtime to keep your operations running.",
    },
  },
  {
    title: {
      ar: "نظام تتبع متكامل",
      en: "Integrated GPS tracking",
    },
    description: {
      ar: "تتبع المركبات يساعدك على إدارة الأسطول ومراقبة الأداء.",
      en: "Fleet tracking helps you monitor vehicles and improve operational control.",
    },
  },
]);

export const HOW_IT_WORKS_SECTION = {
  title: {
    ar: "كيف يعمل التأجير؟",
    en: "How does rental work?",
  },
};

export const HOW_IT_WORKS_STEPS: StepItem[] = stepItemSchema.array().parse([
  {
    title: { ar: "تواصل معنا", en: "Get in touch" },
    description: {
      ar: "أرسل طلبك عبر واتساب مع تفاصيل احتياج شركتك.",
      en: "Send your request via WhatsApp with your company's fleet requirements.",
    },
  },
  {
    title: { ar: "تحديد الاحتياج", en: "Assess your needs" },
    description: {
      ar: "نحدد معك عدد المركبات ونوعها (مبردة أو جافة) ومدة العقد.",
      en: "We define vehicle count, type (refrigerated or dry), and contract duration with you.",
    },
  },
  {
    title: { ar: "توقيع العقد الشهري", en: "Sign monthly contract" },
    description: {
      ar: "عقد شهري واضح يشمل الصيانة والتأمين والتتبع.",
      en: "A clear monthly contract covering maintenance, insurance, and tracking.",
    },
  },
  {
    title: { ar: "تسليم المركبات", en: "Vehicle delivery" },
    description: {
      ar: "نسلّم المركبات جاهزة للتشغيل.",
      en: "Vehicles are delivered ready for operation according to your schedule.",
    },
  },
]);
