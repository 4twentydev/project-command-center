function clean(value: string | undefined) {
  const normalized = value?.trim();
  return normalized && normalized !== "[SENSITIVE]" ? normalized : null;
}

const approvedAddress = process.env.BUSINESS_ADDRESS_APPROVED === "true";
const streetAddress = clean(process.env.BUSINESS_STREET_ADDRESS);
const addressLocality = clean(process.env.BUSINESS_ADDRESS_LOCALITY);
const addressRegion = clean(process.env.BUSINESS_ADDRESS_REGION);
const postalCode = clean(process.env.BUSINESS_POSTAL_CODE);
const addressCountry = clean(process.env.BUSINESS_ADDRESS_COUNTRY);

export const publicBusinessDetails = {
  phone: clean(process.env.BUSINESS_PHONE),
  serviceArea: clean(process.env.BUSINESS_SERVICE_AREA),
  address: approvedAddress && streetAddress && addressLocality && addressRegion && postalCode && addressCountry ? {
    "@type": "PostalAddress",
    streetAddress,
    addressLocality,
    addressRegion,
    postalCode,
    addressCountry,
  } : null,
} as const;

export const publicBusinessPhoneHref = publicBusinessDetails.phone ? `tel:${publicBusinessDetails.phone.replace(/[^+\d]/g, "")}` : null;
