import {
  deriveInvoiceType,
  normalizeTaxNumber,
  validateCustomerTaxInput,
  type InvoiceType,
} from "@workspace/customers-domain";
import type { EstablishmentType } from "./types.js";

export function deriveEstablishmentInvoiceType(
  clientType: EstablishmentType,
  hasTaxNumber: boolean,
  taxNumber: string | null | undefined,
): InvoiceType {
  return deriveInvoiceType(clientType, hasTaxNumber, taxNumber);
}

export function validateEstablishmentTaxInput(
  hasTaxNumber: boolean,
  taxNumber: string | null | undefined,
): string | null {
  return validateCustomerTaxInput(hasTaxNumber, taxNumber);
}

export function resolveEstablishmentTaxFields(body: {
  hasTaxNumber: boolean;
  taxNumber?: string | null;
  clientType: EstablishmentType;
}) {
  const hasTaxNumber = body.hasTaxNumber;
  const taxNumber = hasTaxNumber ? normalizeTaxNumber(body.taxNumber) : null;
  const invoiceType = deriveEstablishmentInvoiceType(
    body.clientType,
    hasTaxNumber,
    taxNumber,
  );
  return { hasTaxNumber, taxNumber, invoiceType };
}
