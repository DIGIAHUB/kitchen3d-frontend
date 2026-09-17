// Dashboard-observed evidence only, recorded 17 September 2026.
// This is intentionally NOT a runtime binding and must never be used to enable
// POST /api/enquiries. It provides a mechanically checked comparison point for
// a later, independently site-isolated saved-schema read.
export const nativeEnquiryFormEvidence = Object.freeze({
  siteId: "543768f5-be18-4f7c-bb3b-380f4b05c925",
  observedAt: "2026-09-17",
  evidenceOnly: true,
  journeys: Object.freeze({
    installation: Object.freeze({
      formId: "d1cd3c08-6d65-4000-9ef0-d65081a506fe",
      required: Object.freeze(["k3d_contact_name", "k3d_project_postcode", "k3d_project_address", "k3d_preferred_contact", "k3d_supplier", "k3d_removal"]),
      conditionalRequired: Object.freeze({ Phone: "k3d_contact_phone", Email: "k3d_contact_email" }),
    }),
    complete: Object.freeze({
      formId: "0d5b3e9d-085a-4c62-90b1-07c4794382d8",
      required: Object.freeze(["k3d_contact_name", "k3d_project_postcode", "k3d_project_address", "k3d_preferred_contact", "k3d_planning_stage"]),
      conditionalRequired: Object.freeze({ Phone: "k3d_contact_phone", Email: "k3d_contact_email" }),
    }),
  }),
});
