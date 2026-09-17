import { randomUUID } from "node:crypto";

// Offline request composition only. This file has no request executor or credentials.
// Template IDs are intentionally absent. Dashboard-created forms are recorded
// in docs/NATIVE_ENQUIRY_FORMS_2026-09-17.md; this is not their saved API schema.
// Source: Wix Form Schemas v4 Create Form / About Form Fields, checked 2026-09-05.
export const kitchen3dSiteId = "543768f5-be18-4f7c-bb3b-380f4b05c925";

function richText(text) {
  return { nodes: [{ type: "PARAGRAPH", id: randomUUID(), nodes: [
    { type: "TEXT", id: "", nodes: [], textData: { text, decorations: [] } },
  ], paragraphData: { textStyle: { textAlignment: "AUTO" } } }] };
}

function input(target, identifier, inputType, options, required = false) {
  return {
    id: randomUUID(), identifier, fieldType: "INPUT", hidden: false,
    inputOptions: { target, inputType, required, readOnly: false, pii: true, ...options },
  };
}

function text(target, label, maxLength, required = false, identifier = "TEXT_INPUT", format = "UNKNOWN_FORMAT") {
  return input(target, identifier, "STRING", {
    stringOptions: { validation: { maxLength, format }, componentType: "TEXT_INPUT", textInputOptions: { label, showLabel: true } },
  }, required);
}

function dropdown(target, label, choices, required = false) {
  return input(target, "DROPDOWN", "STRING", {
    stringOptions: {
      validation: { enum: [...choices] }, componentType: "DROPDOWN",
      dropdownOptions: { label, showLabel: true, options: choices.map(value => ({ id: randomUUID(), label: value, value })) },
    },
  }, required);
}

function date(target, label) {
  return input(target, "DATE_INPUT", "STRING", {
    stringOptions: { validation: { format: "DATE" }, componentType: "DATE_INPUT", dateInputOptions: { label, showLabel: true } },
  });
}

function requirePreferredContact(contact, field) {
  return {
    id: randomUUID(), name: `Require preferred ${contact.toLowerCase()}`,
    expression: { and: { conditions: [{ condition: { target: "k3d_preferred_contact", operator: "EQUAL", value: contact } }] } },
    overrides: [{ entityType: "FIELD", fieldOptions: { fieldId: field.id, propertyType: "REQUIRED", requiredOptions: { required: true } } }],
  };
}

/**
 * Pass the approved contract's enquiryOptions, so native drafts and the local
 * validator share option values. Every invocation produces fresh field/step IDs,
 * not remote form IDs. Do not bind the frontend to this draft.
 */
export function buildWixEnquiryFormDrafts(options) {
  return ["installation", "complete"].map(journey => {
    const project = journey === "installation" ? [
      dropdown("k3d_supplier", "Where is your kitchen from?", options.supplier, true),
      dropdown("k3d_removal", "Does the existing kitchen need removing?", options.removal, true),
      date("k3d_delivery_date", "Expected kitchen delivery"),
      date("k3d_install_start", "Preferred installation start (subject to availability)"),
    ] : [
      dropdown("k3d_planning_stage", "Where are you with your plans?", options.stage, true),
      dropdown("k3d_style", "What style feels like you?", options.style),
      text("k3d_budget_guide", "Budget guide (not a quotation)", 120),
      dropdown("k3d_project_timing", "When would you like the project to start?", options.timing),
    ];
    const details = [
      input("k3d_services", "CHECKBOX_GROUP", "ARRAY", {
        arrayOptions: {
          validation: { maxItems: options.services.length, items: { itemType: "STRING", stringOptions: { enum: [...options.services] } } },
          componentType: "CHECKBOX_GROUP", checkboxGroupOptions: {
            label: "What would you like help with?", showLabel: true, numberOfColumns: "ONE",
            options: options.services.map(value => ({ id: randomUUID(), label: value, value })),
          },
        },
      }),
      dropdown("k3d_trade_arrangement", "How would you like to arrange specialist trades?", options.trades),
      input("k3d_project_files", "FILE_UPLOAD", "WIX_FILE", {
        wixFileOptions: {
          validation: { fileLimit: 5, uploadFileFormats: ["IMAGE", "DOCUMENT"] },
          componentType: "FILE_UPLOAD", fileUploadOptions: { label: "Plans, photos or inspiration", showLabel: true, buttonText: "Choose files" },
        },
      }),
      date("k3d_visit_date", "Preferred site-visit date (a request, not a booking)"),
      dropdown("k3d_visit_time_preference", "Preferred time of day (not live availability)", options.time),
      text("k3d_project_notes", "Anything else on your mind?", 2000, false, "TEXT_AREA"),
    ];
    const phone = input("k3d_contact_phone", "CONTACTS_PHONE", "STRING", {
      contactMapping: { contactField: "PHONE", phoneInfo: { tag: "UNTAGGED" } },
      stringOptions: {
        validation: { format: "PHONE", maxLength: 25 }, componentType: "PHONE_INPUT",
        phoneInputOptions: { label: "Phone number", showLabel: true, defaultCountryCode: "GB" },
      },
    });
    const email = text("k3d_contact_email", "Email address", 254, false, "CONTACTS_EMAIL", "EMAIL");
    email.inputOptions.contactMapping = { contactField: "EMAIL", emailInfo: { tag: "UNTAGGED" } };
    const contact = [
      // No native FULL_NAME enum exists. Preserve the whole name in the enquiry.
      text("k3d_contact_name", "Your name", 100, true),
      text("k3d_project_postcode", "Project postcode", 10, true),
      dropdown("k3d_preferred_contact", "Preferred contact method", options.contact, true),
      text("k3d_project_address", "Project address", 300, true, "TEXT_AREA"),
      phone, email,
    ];
    const notice = {
      id: randomUUID(), identifier: "RICH_TEXT", fieldType: "DISPLAY",
      displayOptions: { displayFieldType: "RICH_CONTENT", richContentOptions: {
        richContent: richText("Setup draft only. Enquiry collection is disabled. A preferred visit date is a request, not a confirmed appointment. Work, materials, agreed additions and final price are subject to the agreed quotation and contract."),
      } },
    };
    // Navigation belongs to each page's layout. Use a distinct field per page;
    // Wix chooses Back/Next/Submit from that page's position in the form.
    // Native saved-schema and rendering verification remain activation holds.
    const groups = [project, details, contact, [notice]].map(fields => [...fields, {
      id: randomUUID(), identifier: "SUBMIT_BUTTON", fieldType: "DISPLAY",
      displayOptions: { displayFieldType: "PAGE_NAVIGATION", pageNavigationOptions: { previousPageText: "Back", nextPageText: "Next", submitText: "Send enquiry" } },
    }]);
    return {
      journey, siteId: kitchen3dSiteId, remoteFormId: null, state: "LOCAL_DRAFT_NOT_CREATED",
      request: { form: {
        name: journey === "installation" ? "Kitchen3D — Installation Enquiry" : "Kitchen3D — Complete Kitchen Enquiry",
        namespace: "wix.form_app.form", enabled: false,
        spamFilterProtectionLevel: "ADVANCED", submissionAccess: "OWNER_AND_COLLABORATORS",
        disabledFormMessage: richText("This enquiry form is not available yet. No enquiry or appointment can be submitted here."),
        formFields: groups.flat(),
        steps: groups.map((fields, index) => ({
          id: randomUUID(), name: ["Your project", "The details", "Contact", "Review"][index], hidden: false,
          layout: { large: { items: fields.map((field, row) => ({ fieldId: field.id, row, column: 0, width: 12, height: 1 })), sections: [] } },
        })),
        formRules: [requirePreferredContact("Phone", phone), requirePreferredContact("Email", email)],
        submitSettings: { submitSuccessAction: "THANK_YOU_MESSAGE", thankYouMessageOptions: {
          durationInSeconds: 8,
          richContent: richText("Your enquiry has been received. Reza will contact you to discuss the next step. Any preferred visit time is a request, not a confirmed appointment."),
        } },
      } },
      activationHolds: [
        "Verify exact-site connector isolation before any remote creation.",
        "Validate native saved schema and dashboard rendering; form must remain explicitly disabled.",
        "Native file categories are broader than approved JPG/PNG/WebP/PDF. Enforce exact MIME, signature and byte limits in a controlled upload path.",
        "Verify private file access, retention and deletion before real uploads.",
        "Verify native conditional required rules and omit blank optional targets when constructing a real submission.",
        "Retain trusted London-date checks in the future server boundary; these fields do not expose availability.",
        "Configure information-use notice, privacy link, rate limits, spam flow and duplicate reconciliation before activation.",
        "No notification automation has been created or enabled.",
        "Live submission tests require a separate controlled activation gate.",
      ],
    };
  });
}
