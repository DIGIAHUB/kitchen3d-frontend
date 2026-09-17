/**
 * Permanent inactive-stage boundary. No request parameter, parsing, credentials,
 * environment flag, logging or network writer exists here. Live collection needs
 * a separately reviewed implementation, not an environment-variable change.
 */
export function POST() {
  return Response.json({
    status: "disabled",
    code: "ENQUIRY_COLLECTION_DISABLED",
    message: "Enquiry collection is not enabled. No enquiry has been recorded and no appointment has been booked.",
  }, {
    status: 503,
    headers: { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" },
  });
}
