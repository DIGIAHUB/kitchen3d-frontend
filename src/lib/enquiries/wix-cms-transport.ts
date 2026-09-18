import { mapEnquiryToLogicalTargets, type EnquiryValidationContext } from "./contract";

const WIX_CMS_ITEM_URL = "https://www.wixapis.com/wix-data/v2/items";
const KITCHEN3D_ENQUIRY_COLLECTION = "Kitchen3DEnquiries";
const REQUEST_TIMEOUT_MS = 10_000;

type CmsWriteState = "CONFIRMED" | "UNCONFIRMED";
export type CmsEnquiryWriteResult = { state: CmsWriteState; automaticRetryAllowed: false };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function validRequestKey(value: unknown): value is string {
  return typeof value === "string"
    && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function validAuthorization(value: unknown): value is string {
  return typeof value === "string" && value.trim() === value && value.length > 0 && value.length <= 8192 && !/[\r\n]/.test(value);
}

/** A human-readable owner view. The structured payload remains private for support only. */
function ownerSummary(journey: string, values: Record<string, string | string[]>): string {
  const pick = (key: string) => {
    const value = values[key];
    return Array.isArray(value) ? value.join(", ") : value || "Not provided";
  };
  const projectDetails: Array<[string, string]> = journey === "installation"
    ? [
        ["Kitchen supplier", "k3d_supplier"],
        ["Existing kitchen removal", "k3d_removal"],
        ["Expected delivery", "k3d_delivery_date"],
        ["Preferred installation start", "k3d_install_start"],
      ]
    : [
        ["Planning stage", "k3d_planning_stage"],
        ["Style", "k3d_style"],
        ["Budget guide", "k3d_budget_guide"],
        ["Preferred project timing", "k3d_project_timing"],
      ];
  const rows: Array<[string, string]> = [
    ["Customer", "k3d_contact_name"],
    ["Phone", "k3d_contact_phone"],
    ["Email", "k3d_contact_email"],
    ["Preferred contact", "k3d_preferred_contact"],
    ["Project address", "k3d_project_address"],
    ["Postcode", "k3d_project_postcode"],
    ...projectDetails,
    ["Services requested", "k3d_services"],
    ["Trade arrangement", "k3d_trade_arrangement"],
    ["Preferred visit date", "k3d_visit_date"],
    ["Preferred visit time", "k3d_visit_time_preference"],
    ["Notes", "k3d_project_notes"],
  ];
  return rows.map(([label, key]) => `${label}: ${pick(key)}`).join("\n");
}

/**
 * Insert one private Wix CMS enquiry record. The caller owns the Wix credential;
 * no browser value can select the collection, site, or authorization header.
 * A returned receipt only confirms storage, never a booking or an appointment.
 */
export async function writeCmsEnquiryOnce(
  input: unknown,
  context: EnquiryValidationContext,
  requestKey: unknown,
  authorization: unknown,
  request: typeof fetch | undefined = undefined,
): Promise<CmsEnquiryWriteResult> {
  const mapped = mapEnquiryToLogicalTargets(input, context);
  if (!mapped.ok || mapped.draft.files.metadata.length > 0 || !validRequestKey(requestKey) || !validAuthorization(authorization) || !request) {
    return { state: "UNCONFIRMED", automaticRetryAllowed: false };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await request(WIX_CMS_ITEM_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authorization,
        "wix-site-id": "543768f5-be18-4f7c-bb3b-380f4b05c925",
      },
      body: JSON.stringify({
        dataCollectionId: KITCHEN3D_ENQUIRY_COLLECTION,
        dataItem: {
          id: requestKey,
          data: {
            journey: mapped.draft.journey,
            status: "NEW",
            receivedAt: new Date().toISOString(),
            ownerSummary: ownerSummary(mapped.draft.journey, mapped.draft.values),
            payload: { values: mapped.draft.values },
          },
        },
      }),
      cache: "no-store",
      redirect: "error",
      signal: controller.signal,
    });
    if (!response.ok) return { state: "UNCONFIRMED", automaticRetryAllowed: false };
    const result: unknown = await response.json();
    if (!isRecord(result) || !isRecord(result.dataItem) || result.dataItem.id !== requestKey || result.dataItem.dataCollectionId !== KITCHEN3D_ENQUIRY_COLLECTION) {
      return { state: "UNCONFIRMED", automaticRetryAllowed: false };
    }
    return { state: "CONFIRMED", automaticRetryAllowed: false };
  } catch {
    return { state: "UNCONFIRMED", automaticRetryAllowed: false };
  } finally {
    clearTimeout(timer);
    controller.abort();
  }
}
