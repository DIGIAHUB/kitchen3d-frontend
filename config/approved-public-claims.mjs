/**
 * Hash-locked owner-confirmed copy reviewed on 17 September 2026.
 *
 * The initial scanner deliberately treated every Kitchen3D identity, service,
 * area and contact reference as held. The owner subsequently confirmed the
 * business direction, direct/coordinated services, Greater Manchester coverage,
 * contact route and visit wording recorded in the referenced handovers.
 *
 * This is deliberately not a blanket exemption. A changed file no longer
 * matches its hash and returns to the hold queue until its exact wording is
 * reviewed again. Trust, ratings, qualifications and supplier partnership
 * claims are never allowed here.
 *
 * Evidence: SERVICE_CONTENT_COVERAGE_2026-09-05.md,
 * ENQUIRY_INTEGRATION_STAGE_2_HANDOVER_2026-09-05.md,
 * NATIVE_ENQUIRY_FORMS_2026-09-17.md.
 */
const ownerBriefRules = Object.freeze([
  "HELD_BUSINESS_FACT",
  "HELD_SERVICE_AREA",
  "HELD_COMMERCIAL_OFFER",
  "HELD_SERVICE_CAPABILITY",
]);

const reviewedFiles = Object.freeze({
  "src/app/[slug]/page.tsx": "9efab8e540fd1d90ee906a6254bd54fe12cf263971b42d92a166cedec7395b7d",
  "src/app/about/page.tsx": "b2adabc23c4dad04491cf9793f1340ef6107185136caf142055509589884e6cd",
  "src/app/blogs/page.tsx": "cb9569001cab27d1ace06f5e6f5067cbd06eb28bae72006765819a666c07d541",
  "src/app/contact/page.tsx": "b5171b4f613eb112fdbdc95a642318b1e999f8d5b205947a1d9ae3d6de8bb3ca",
  "src/app/faqs/page.tsx": "63f284be41826eb879b555790f819cea9434b75692c5b73dc0fbebc19b2f2cae",
  "src/app/installation-enquiry/page.tsx": "41eee3b2d6a5da80ba6296b14d037457cffe92ff2e53143755518b2fc68b5093",
  "src/app/layout.tsx": "ba9e99c8e47339e93754d05bcd5c6d81430b5f3d88a09821dfbef2db0def58cd",
  "src/app/not-found.tsx": "ca563dfbd6b6f684ee51693acd57d6e88755e47fb2e89109f2316beb74a1517a",
  "src/app/services/page.tsx": "e21d7aa2b4bb723699f2ffe0ccb6660f7adfcd50639d8f465614921eb07ee186",
  "src/app/thank-you/page.tsx": "a7670334e84b05b849d56a9d4825541f5f7ac9c0ebf67e991d4c44b4a0dcf507",
  "src/components/enquiry-unavailable.tsx": "7b464c86ea360e1760591e6ae5ea3ef02525a04aafffc58094e53dc5f7b69fd5",
  "src/components/information-page.tsx": "6d4d15b1c0aaf16eafd0db8104e56aecb57d70d40486ac6b16d0889e6d71d3b9",
  "src/components/preview/enquiry-wizard.tsx": "5fc9bc92c714cdf6cc8b8612f60fac0148a8bc389374d1f5a7fc9caf1585422f",
  "src/components/preview/home.tsx": "40bc56398c467313a851b7849c6d20bfdcbe36096858e0cb9464918f8a54e823",
  "src/components/preview/site-shell.tsx": "3090e65dcad5d2ddbebecb273acb8c518498ece170f0c8bb69d126614858a0c6",
  "src/lib/articles.ts": "958b366e6cb10ab0167b9555576045293a0a4f9e0df3d24f9352de02b6948243",
  "src/lib/migration-routes.ts": "b92a9644db6557a8a2675a49916ce892f52fa8d36bf6d7df6c268b9458ce119d",
  "src/lib/seo-preparation.ts": "f497c23d85b74de822892047f7d9c2608a8ed0f286aa2fc3eb17f6e1abd6e307",
  "src/lib/service-pages.ts": "7f09e260530f143e517a5f39942e83a8871c8bcd6b35039c577cf3979da3d7f0",
  "src/lib/wix.ts": "f5445ad3f58ada9c79231dde238e3d3274bbbfaec2460cf4b0eb267e95c90080",
});

const reviewedSelectorFiles = Object.freeze({
  // Supplier choices are customer input options, not partnership endorsements.
  "src/lib/enquiries/options.ts": "0be1224c5c8daa0ccaf9034409e9cde90d2f5537f5256f8f12944d81b1f1f419",
});

export function approvedPublicClaim(relativePath, sourceHash, rule) {
  return (ownerBriefRules.includes(rule) && reviewedFiles[relativePath] === sourceHash)
    || (["UNVERIFIED_TRUST", "HELD_SERVICE_CAPABILITY"].includes(rule)
      && reviewedSelectorFiles[relativePath] === sourceHash);
}
