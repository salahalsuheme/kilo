export type Locale = "ar" | "en";

export type LocalizedText = Record<Locale, string>;

export type PageId = "home" | "about" | "fleet" | "faq";

export type NavItem = {
  id: PageId;
  label: LocalizedText;
  path: LocalizedText;
};

export type FeatureItem = {
  title: LocalizedText;
  description: LocalizedText;
};

export type StepItem = {
  title: LocalizedText;
  description: LocalizedText;
};

export type FaqItem = {
  question: LocalizedText;
  answer: LocalizedText;
  whatsappLinkAnswer?: {
    linkText: LocalizedText;
    suffix: LocalizedText;
  };
};

export type FleetVehicle = {
  id: string;
  name: LocalizedText;
  description: LocalizedText;
  highlights: LocalizedText[];
  image?: {
    src: string;
    alt: LocalizedText;
    width: number;
    height: number;
  };
};

export type PageMeta = {
  title: LocalizedText;
  description: LocalizedText;
  path: LocalizedText;
};
