import { z } from "zod";

const localizedTextSchema = z.object({
  ar: z.string().min(1),
  en: z.string().min(1),
});

export const featureItemSchema = z.object({
  title: localizedTextSchema,
  description: localizedTextSchema,
});

export const stepItemSchema = z.object({
  title: localizedTextSchema,
  description: localizedTextSchema,
});

export const faqItemSchema = z.object({
  question: localizedTextSchema,
  answer: localizedTextSchema,
});

export const fleetVehicleSchema = z.object({
  id: z.string().min(1),
  name: localizedTextSchema,
  description: localizedTextSchema,
  highlights: z.array(localizedTextSchema).min(1),
});
