export type Locale = "ar" | "en";

export type LocalizedText = Record<Locale, string>;

export type PageId = "home" | "about" | "fleet";

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
};

export type FleetVehicle = {
  id: string;
  name: LocalizedText;
  description: LocalizedText;
  highlights: LocalizedText[];
};

export type PageMeta = {
  title: LocalizedText;
  description: LocalizedText;
  path: LocalizedText;
};
