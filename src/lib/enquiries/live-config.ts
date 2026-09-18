import { expectedEnquiryTargets, KITCHEN3D_ENQUIRY_SITE_ID, type EnquiryFormBinding } from "./wix-submission-adapter";
import type { EnquiryJourney } from "./contract";

/** Server-owned bindings for the two Kitchen3D forms saved in the exact Wix site.
 * They are never accepted from a browser request. */
export const liveEnquiryBindings: Readonly<Record<EnquiryJourney, EnquiryFormBinding>> = Object.freeze({
  installation: Object.freeze({
    siteId: KITCHEN3D_ENQUIRY_SITE_ID,
    journey: "installation",
    formId: "d1cd3c08-6d65-4000-9ef0-d65081a506fe",
    namespace: "wix.form_app.form",
    fieldTypes: { ...expectedEnquiryTargets.installation },
  }),
  complete: Object.freeze({
    siteId: KITCHEN3D_ENQUIRY_SITE_ID,
    journey: "complete",
    formId: "0d5b3e9d-085a-4c62-90b1-07c4794382d8",
    namespace: "wix.form_app.form",
    fieldTypes: { ...expectedEnquiryTargets.complete },
  }),
});

export function wixFormsAuthorization(): string | null {
  const value = process.env.WIX_FORMS_API_KEY;
  return typeof value === "string" && value.trim() === value && value.length > 0 ? value : null;
}

/** Server-only credential for the private Kitchen3D CMS enquiry inbox. */
export function wixCmsAuthorization(): string | null {
  const value = process.env.WIX_API_KEY;
  return typeof value === "string" && value.trim() === value && value.length > 0 ? value : null;
}
