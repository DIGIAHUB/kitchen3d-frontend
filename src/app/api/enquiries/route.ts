import { readEnquiryJson } from "@/lib/enquiries/request-boundary";
import { wixCmsAuthorization } from "@/lib/enquiries/live-config";
import { writeCmsEnquiryOnce } from "@/lib/enquiries/wix-cms-transport";

const origin = "https://kitchen3d.co.uk";
const headers = { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function londonToday(): string {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/London", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
  return ["year", "month", "day"].map(type => parts.find(part => part.type === type)?.value).join("-");
}

/** One server-side private Wix CMS write. No appointment is created. */
export async function POST(request: Request) {
  const parsed = await readEnquiryJson(request, origin);
  if (!parsed.ok) {
    console.warn("K3D_ENQUIRY_REJECTED", { reason: parsed.error });
    return Response.json({ status: "not_received" }, { status: 400, headers });
  }
  if (!isRecord(parsed.value) || Object.keys(parsed.value).length !== 2
    || !isRecord(parsed.value.input) || typeof parsed.value.requestKey !== "string") {
    console.warn("K3D_ENQUIRY_REJECTED", { reason: "INVALID_ENVELOPE" });
    return Response.json({ status: "not_received" }, { status: 400, headers });
  }
  const authorization = wixCmsAuthorization();
  if (!authorization) {
    console.warn("K3D_ENQUIRY_UNAVAILABLE", { reason: "CMS_AUTHORIZATION_MISSING" });
    return Response.json({ status: "temporarily_unavailable" }, { status: 503, headers });
  }
  const result = await writeCmsEnquiryOnce(parsed.value.input, { today: londonToday() }, parsed.value.requestKey, authorization, fetch);
  if (result.state === "CONFIRMED") return Response.json({ status: "received" }, { status: 201, headers });
  console.warn("K3D_ENQUIRY_UNAVAILABLE", { reason: "CMS_WRITE_UNCONFIRMED" });
  return Response.json({ status: "temporarily_unavailable" }, { status: 503, headers });
}
