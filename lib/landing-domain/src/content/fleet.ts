import type { FleetVehicle, PageMeta } from "../types.js";
import { fleetVehicleSchema } from "../schemas/content.schema.js";

export const FLEET_META: PageMeta = {
  title: {
    ar: "أسطول كيلو | مركبات مبردة وجافة",
    en: "Kilo Fleet | Refrigerated and Dry Vehicles",
  },
  description: {
    ar: "استعرض أسطول كيلو: سوزوكي فان مبرد وسوزوكي فان جاف لتأجير الشركات والمؤسسات.",
    en: "Explore Kilo fleet: Suzuki refrigerated van and Suzuki dry van for corporate rental.",
  },
  path: {
    ar: "/fleet.html",
    en: "/fleet-en.html",
  },
};

export const FLEET_SECTION = {
  title: {
    ar: "أسطولنا",
    en: "Our fleet",
  },
  subtitle: {
    ar: "مركبات نقل خفيف جاهزة للتشغيل بعقود شهرية",
    en: "Light commercial vehicles ready for operation on monthly contracts",
  },
};

export const FLEET_VEHICLES: FleetVehicle[] = fleetVehicleSchema.array().parse([
  {
    id: "suzuki-van-refrigerated",
    name: {
      ar: "سوزوكي فان مبرد",
      en: "Suzuki Van — Refrigerated",
    },
    description: {
      ar: "مركبة نقل خفيف مبردة مناسبة لتوزيع المنتجات الحساسة حراريًا، مع تبريد موثوق وعزل ممتاز.",
      en: "A refrigerated light commercial vehicle for temperature-sensitive distribution with reliable cooling and strong insulation.",
    },
    image: {
      src: "/fleet-suzuki-refrigerated.webp",
      alt: {
        ar: "سوزوكي فان مبرد — مركبة نقل خفيف مبردة من كيلو",
        en: "Suzuki refrigerated van — Kilo light commercial refrigerated vehicle",
      },
      width: 480,
      height: 292,
    },
    highlights: [
      {
        ar: "متوافقة مع متطلبات هيئة الغذاء والدواء",
        en: "Compliant with SFDA requirements",
      },
      {
        ar: "تبريد ممتاز وعزل حراري عالي الجودة",
        en: "Excellent cooling and high-quality thermal insulation",
      },
      {
        ar: "مناسبة لشركات الأغذية والأدوية والتموين",
        en: "Ideal for food, pharmaceutical, and catering companies",
      },
      {
        ar: "صيانة مجانية",
        en: "Free maintenance",
      },
      {
        ar: "تتبع مركبات مجاني",
        en: "Free vehicle tracking",
      },
      {
        ar: "عقود شهرية وسنوية مرنة",
        en: "Flexible monthly and annual contracts",
      },
    ],
  },
  {
    id: "suzuki-van-dry",
    name: {
      ar: "سوزوكي فان جاف",
      en: "Suzuki Van — Dry",
    },
    description: {
      ar: "مركبة نقل خفيف جافة اقتصادية وعملية للبضائع غير الحساسة حراريًا والتوزيع اليومي.",
      en: "A practical dry light commercial vehicle for non-temperature-sensitive goods and daily distribution.",
    },
    image: {
      src: "/fleet-suzuki-dry.webp",
      alt: {
        ar: "سوزوكي فان جاف — مركبة نقل خفيف جافة من كيلو",
        en: "Suzuki dry van — Kilo light commercial dry vehicle",
      },
      width: 480,
      height: 256,
    },
    highlights: [
      {
        ar: "تشغيل اقتصادي للمسارات اليومية",
        en: "Cost-efficient for daily routes",
      },
      {
        ar: "مساحة شحن مناسبة للبضائع العامة",
        en: "Practical cargo space for general goods",
      },
      {
        ar: "خيار مثالي للشركات والمؤسسات",
        en: "A strong option for companies and institutions",
      },
      {
        ar: "صيانة مجانية",
        en: "Free maintenance",
      },
      {
        ar: "تتبع مركبات مجاني",
        en: "Free vehicle tracking",
      },
      {
        ar: "عقود شهرية وسنوية مرنة",
        en: "Flexible monthly and annual contracts",
      },
    ],
  },
]);
