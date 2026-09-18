import { readEnquiryJson } from "@/lib/enquiries/request-boundary";
import { liveEnquiryBindings, wixFormsAuthorization } from "@/lib/enquiries/live-config";
import { sendEnquiryOnce } from "@/lib/enquiries/wix-transport";

const origin = "https://kitchen3d.co.uk";
const headers = { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function londonToday(): string {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/London", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
  return ["year", "month", "day"].map(type => parts.find(part => part.type === type)?.value).join("-");
}

/** One server-side Wix Forms submission attempt. No appointment is created. */
export async function POST(request: Request) {
  const parsed = await readEnquiryJson(request, origin);
  if (!parsed.ok || !isRecord(parsed.value) || Object.keys(parsed.value).length !== 1
    || !isRecord(parsed.value.input)) {
    return Response.json({ status: "not_received" }, { status: 400, headers });
  }
  const journey = parsed.value.input.journey;
  if (journey !== "installation" && journey !== "complete") {
    return Response.json({ status: "not_received" }, { status: 400, headers });
  }
  const authorization = wixFormsAuthorization();
  if (!authorization) return Response.json({ status: "temporarily_unavailable" }, { status: 503, headers });
  const result = await sendEnquiryOnce(parsed.value.input, { today: londonToday() }, {
    binding: liveEnquiryBindings[journey], authorization,
  }, fetch);
  if (result.state === "CONFIRMED") return Response.json({ status: "received" }, { status: 201, headers });
  console.warn("K3D Wix Forms delivery unconfirmed", { code: result.code });
  return Response.json({ status: "temporarily_unavailable" }, { status: 503, headers });
}
