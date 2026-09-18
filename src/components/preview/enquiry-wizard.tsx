"use client";

import Link from "next/link";
import { useEffect, useRef, useState, useSyncExternalStore, type ChangeEvent, type FormEvent } from "react";
import { previewFilesError, previewPhonePattern } from "@/lib/preview-validation";
import { enquiryOptions } from "@/lib/enquiries/options";

type Journey = "installation" | "complete";
type Answers = Record<string, string>;
const steps = ["Your project", "The details", "Contact", "Review"];
const initialAnswers: Answers = { supplier: "", removal: "", delivery: "", start: "", stage: "", style: "", budget: "", trades: "", notes: "", visit: "", time: "", name: "", postcode: "", address: "", phone: "", email: "", contact: "Phone" };

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return <label className="form-field"><span>{label}</span>{hint ? <small>{hint}</small> : null}{children}</label>;
}

function londonToday() {
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date());
  return ["year", "month", "day"].map(key => parts.find(part => part.type === key)?.value).join("-");
}

function subscribeToDay(onChange: () => void) {
  const timer = setInterval(onChange, 60_000);
  return () => clearInterval(timer);
}
function serverDay() { return ""; }

const wixInvisibleRecaptchaKey = "6LdoPaUfAAAAAJphvHoUoOob7mx0KDlXyXlgrx5v";

declare global {
  interface Window { grecaptcha?: { enterprise?: { ready: (callback: () => void) => void; execute: (siteKey: string, options: { action: string }) => Promise<string> } } }
}

function getCaptchaToken(): Promise<string> {
  const execute = () => new Promise<string>((resolve, reject) => {
    const enterprise = window.grecaptcha?.enterprise;
    if (!enterprise) { reject(new Error("CAPTCHA_UNAVAILABLE")); return; }
    enterprise.ready(() => enterprise.execute(wixInvisibleRecaptchaKey, { action: "kitchen3d_enquiry" }).then(resolve, reject));
  });
  if (window.grecaptcha?.enterprise) return execute();
  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-k3d-recaptcha="1"]');
    const script = existing || document.createElement("script");
    const settle = () => execute().then(resolve, reject);
    script.addEventListener("load", settle, { once: true });
    script.addEventListener("error", () => reject(new Error("CAPTCHA_UNAVAILABLE")), { once: true });
    if (!existing) { script.src = "https://www.google.com/recaptcha/enterprise.js?render=" + encodeURIComponent(wixInvisibleRecaptchaKey); script.async = true; script.dataset.k3dRecaptcha = "1"; document.head.appendChild(script); }
    else if (window.grecaptcha?.enterprise) settle();
  });
}

export function EnquiryWizard({ journey, live = false }: { journey: Journey; live?: boolean }) {
  const installation = journey === "installation";
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>(initialAnswers);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState("");
  const [complete, setComplete] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState("");
  const today = useSyncExternalStore(subscribeToDay, londonToday, serverDay);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const previousStep = useRef(0);

  useEffect(() => {
    if (previousStep.current !== step || complete) headingRef.current?.focus();
    previousStep.current = step;
  }, [step, complete]);

  function bind(name: string) {
    return { name, value: answers[name], onChange: (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setAnswers(current => ({ ...current, [name]: event.target.value })) };
  }

  function selectFiles(event: ChangeEvent<HTMLInputElement>) {
    const chosen = Array.from(event.target.files || []);
    const error = previewFilesError(chosen);
    if (error) {
      setFileError(error);
    } else {
      setFiles(chosen);
      setFileError("");
    }
    event.target.value = "";
  }

  function next(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (step < 3) setStep(current => current + 1);
  }

  function reset() {
    setAnswers(initialAnswers); setSelectedServices([]); setFiles([]); setFileError(""); setSubmissionError(""); setStep(0); setComplete(false);
    headingRef.current?.focus();
  }

  async function submitLive() {
    if (submitting || fileError || files.length) return;
    setSubmitting(true); setSubmissionError("");
    try {
      const captchaToken = await getCaptchaToken();
      const input = {
        journey, ...(installation ? { supplier: answers.supplier, removal: answers.removal, delivery: answers.delivery, start: answers.start } : { stage: answers.stage, style: answers.style, budget: answers.budget, start: answers.start }),
        selectedServices, trades: answers.trades, files: [], visit: answers.visit, time: answers.time, notes: answers.notes,
        name: answers.name, postcode: answers.postcode, address: answers.address, phone: answers.phone, email: answers.email, contact: answers.contact,
      };
      const response = await fetch("/api/enquiries", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ input, captchaToken }), credentials: "same-origin" });
      if (!response.ok || (await response.json() as { status?: unknown }).status !== "received") throw new Error("NOT_RECEIVED");
      setAnswers(initialAnswers); setSelectedServices([]); setFiles([]); setComplete(true);
    } catch { setSubmissionError("We could not confirm receipt of your enquiry. Please call Reza on 07882 116 895 or email kitchen3dltd@gmail.com."); }
    finally { setSubmitting(false); }
  }

  const reviewRows = installation
    ? [["Supplier", answers.supplier], ["Existing kitchen", answers.removal], ["Expected delivery", answers.delivery], ["Preferred installation start", answers.start]]
    : [["Planning stage", answers.stage], ["Style", answers.style], ["Budget guide", answers.budget], ["Preferred project timing", answers.start]];

  return <section className="enquiry-section container">
    <Link href="/#your-kitchen" className="back-link">← Back to your kitchen options</Link>
    <div className="enquiry-layout">
      <aside className="enquiry-aside"><p className="eyebrow">{installation ? "01 / READY TO FIT" : "02 / FROM THE BEGINNING"}</p><h1>{installation ? <>Your kitchen.<br /><em>Let’s get it fitted.</em></> : <>Your ideas.<br /><em>A fresh beginning.</em></>}</h1><p>{installation ? "Tell Reza what you’ve chosen and what you need help with. You can add your plans, dates and any finishing touches." : "You don’t need a finished design. Share what you have in mind and we’ll start with a conversation about your space."}</p><div className="visit-card"><span className="visit-icon" aria-hidden="true">↗</span><h2>Let’s see the possibilities.</h2><p>A free, no-obligation site visit.<br />Up to 45 minutes at your property.</p><span>Discuss · Measure · Explore</span></div><p className="aside-help">Prefer to talk it through?<br /><a href="tel:07882116895">Call Reza · 07882 116 895</a></p></aside>
      <div className="wizard-panel">
        {live ? <div className="form-preview-note"><strong>Send your enquiry securely.</strong> A preferred visit date is a request, not a confirmed booking.</div> : <div className="form-preview-note"><strong>Try the journey with sample details.</strong> Nothing is sent or uploaded. Entries stay in this page’s memory, not browser storage.</div>}
        {!complete ? <>
          <ol className="wizard-progress" aria-label="Enquiry progress">{steps.map((name, index) => <li key={name} aria-current={step === index ? "step" : undefined} className={step > index ? "finished" : ""}><span>{step > index ? "✓" : index + 1}</span><small>{name}</small></li>)}</ol>
          <div className="wizard-heading"><p className="eyebrow">STEP {step + 1} OF 4</p><h2 tabIndex={-1} ref={headingRef}>{[installation ? "What have you chosen?" : "What do you have in mind?", "A few helpful details.", "How can Reza reach you?", "Does everything look right?"][step]}</h2><p>{["Required fields are marked *. The rest can wait.", "Share what you know. It’s fine if some details are still undecided.", live ? "Your contact details are used only to respond to this enquiry." : "Use sample details for this preview, not personal information.", live ? "Send only when the details are ready. This does not book an appointment." : "This is a local review only. No request has been sent."][step]}</p></div>
          <noscript><p className="form-error">JavaScript is required to try this local preview. No submission service is connected.</p></noscript>
          <form onSubmit={next} method="post" autoComplete="off">
            <fieldset disabled={!today} className="wizard-fields">
              <legend className="sr-only">{steps[step]}</legend>
              {step === 0 ? <div className="fields-stack">
                {installation ? <>
                  <Field label="Where is your kitchen from? *" hint="Supplier names identify your kitchen, not a partnership with us."><select {...bind("supplier")} required><option value="">Choose your supplier</option>{enquiryOptions.supplier.map(value => <option key={value}>{value}</option>)}</select></Field>
                  <Field label="Does the existing kitchen need removing? *"><select {...bind("removal")} required><option value="">Choose an option</option>{enquiryOptions.removal.map(value => <option key={value}>{value}</option>)}</select></Field>
                  <div className="field-pair"><Field label="Expected kitchen delivery" hint="Optional · leave blank if unknown"><input type="date" {...bind("delivery")} /></Field><Field label="Preferred installation start" hint="Optional · subject to availability"><input type="date" min={today} {...bind("start")} /></Field></div>
                </> : <>
                  <Field label="Where are you with your plans? *"><select {...bind("stage")} required><option value="">Choose an option</option>{enquiryOptions.stage.map(value => <option key={value}>{value}</option>)}</select></Field>
                  <Field label="What style feels like you?" hint="Optional · this is a starting point, not a commitment"><select {...bind("style")}><option value="">Help me explore</option>{enquiryOptions.style.map(value => <option key={value}>{value}</option>)}</select></Field>
                  <Field label="Any budget you’d like us to work around?" hint="Optional · a guide only; final price follows an agreed scope"><input type="text" maxLength={120} {...bind("budget")} placeholder="e.g. a range, or ‘please advise’" /></Field>
                  <Field label="When would you like the project to start?" hint="Optional"><select {...bind("start")}><option value="">I’m flexible</option>{enquiryOptions.timing.map(value => <option key={value}>{value}</option>)}</select></Field>
                </>}
              </div> : null}

              {step === 1 ? <div className="fields-stack">
                <fieldset className="service-options" aria-describedby="service-guidance"><legend>What would you like help with? <span>(optional)</span></legend><div>{enquiryOptions.services.map(service => <label key={service}><input type="checkbox" checked={selectedServices.includes(service)} onChange={event => setSelectedServices(current => event.target.checked ? [...current, service] : current.filter(value => value !== service))} /><span>{service}</span></label>)}</div></fieldset>
                <p id="service-guidance" className="inline-note">Choose any that apply. Specialist trades and appliance connections are coordinated where needed, with responsibilities and scope agreed in your quotation.</p>
                <Field label="How would you like to arrange specialist trades?" hint="Plumbing, electrics, gas work, tiling or plastering where needed."><select {...bind("trades")}><option value="">Let’s discuss what’s needed</option>{enquiryOptions.trades.map(value => <option key={value}>{value}</option>)}</select></Field>
                {!live ? <div className="upload-field"><label htmlFor="project-files"><strong>Add plans, photos or inspiration</strong><span>Optional · Up to 5 JPG, PNG, WebP or PDF files. Max 10 MB each / 20 MB total.</span></label><input id="project-files" type="file" accept={enquiryOptions.fileTypes.join(",")} multiple onChange={selectFiles} aria-describedby="file-guidance file-error" /><small id="file-guidance">Local selection only. Files stay in memory and are never uploaded. Choosing again replaces the selection.</small>{fileError ? <p id="file-error" role="alert" className="form-error">{fileError}</p> : <span id="file-error" />}{files.length ? <ul className="file-list">{files.map((file, index) => <li key={`${file.name}-${index}`}><span>{file.name}</span><button type="button" aria-label={`Remove ${file.name}`} onClick={() => setFiles(current => current.filter((_, fileIndex) => fileIndex !== index))}>Remove</button></li>)}</ul> : null}</div> : <p className="inline-note">Plans and photos can be shared with Reza after he responds to your enquiry.</p>}
                <div className="field-pair"><Field label="Preferred site-visit date" hint="Optional · a request, not a booking"><input type="date" min={today} {...bind("visit")} /></Field><Field label="Preferred time of day" hint="Optional · not live availability"><select {...bind("time")}><option value="">I’m flexible</option>{enquiryOptions.time.map(value => <option key={value}>{value}</option>)}</select></Field></div>
                <p className="inline-note">Free visits cover all Greater Manchester, Monday–Saturday, 9 am–6 pm (UK time), for up to 45 minutes. Reza allows an hour between visits. Your preferred date is a request, not a reservation; this preview does not check live calendar availability.</p>
                <Field label="Anything else on your mind?" hint="Optional · layouts, colours, access, delivery or questions"><textarea rows={4} maxLength={2000} {...bind("notes")} placeholder="Tell us what would help make this kitchen yours…" /></Field>
              </div> : null}

              {step === 2 ? <div className="fields-stack">
                <Field label="Your name *"><input type="text" required pattern=".*\S.*" title="Enter a name, not just spaces" maxLength={100} {...bind("name")} /></Field>
                <div className="field-pair"><Field label="Project postcode *" hint="For your property in Greater Manchester"><input type="text" required maxLength={10} pattern="([Gg][Ii][Rr] 0[Aa]{2}|[A-Za-z]{1,2}[0-9][A-Za-z0-9]? ?[0-9][A-Za-z]{2})" title="Enter a UK postcode, for example M1 1AA" {...bind("postcode")} /></Field><Field label="Preferred contact method *"><select {...bind("contact")} required>{enquiryOptions.contact.map(value => <option key={value}>{value}</option>)}</select></Field></div>
                <Field label="Project address *" hint="Visits take place at your property, by arrangement"><textarea rows={2} required maxLength={300} {...bind("address")} /></Field>
                <div className="field-pair"><Field label={`Phone number${answers.contact === "Phone" ? " *" : " (optional)"}`}><input type="tel" inputMode="tel" required={answers.contact === "Phone"} maxLength={25} pattern={previewPhonePattern} title="Enter at least 7 digits, with optional +, spaces or brackets" {...bind("phone")} /></Field><Field label={`Email address${answers.contact === "Email" ? " *" : " (optional)"}`}><input type="email" required={answers.contact === "Email"} maxLength={254} {...bind("email")} /></Field></div>
                <p className="inline-note">Preview privacy: these details are not stored in a database, browser storage or a URL. No marketing consent or live enquiry submission is collected here.</p>
              </div> : null}

              {step === 3 ? <div className="review-content"><dl>{[...reviewRows, ["Help needed", selectedServices.join(", ")], ["Trade arrangement", answers.trades], ["Preferred visit", [answers.visit, answers.time].filter(Boolean).join(" · ")], ["Files selected locally", files.map(file => file.name).join(", ")], ["Your notes", answers.notes], ["Name", answers.name], ["Project address", `${answers.address}, ${answers.postcode}`], ["Preferred contact", answers.contact], ["Phone", answers.phone], ["Email", answers.email]].map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value || "To discuss"}</dd></div>)}</dl><div className="inline-note"><strong>{installation ? "Your installation, clearly agreed." : "Your complete project, clearly agreed."}</strong><p>{installation ? "The work, any additional materials, specialist responsibilities and final price must be agreed in your quotation and contract." : "Kitchen3D supplies the materials and agreed additional items in your project specification. The scope and final price are agreed by both parties before work proceeds."}</p><p>No appointment is reserved by reviewing these details.</p></div></div> : null}

              {submissionError ? <p role="alert" className="form-error">{submissionError}</p> : null}<div className="wizard-actions">{step > 0 ? <button type="button" className="button button-outline" onClick={() => setStep(current => current - 1)}>← Back</button> : <span />} {step === 3 ? <button type="button" disabled={submitting} className="button button-dark" onClick={() => live ? void submitLive() : (setAnswers(initialAnswers), setSelectedServices([]), setFiles([]), setFileError(""), setComplete(true))}>{live ? (submitting ? "Sending…" : "Send enquiry") : "Finish preview"} <span aria-hidden="true">→</span></button> : <button type="submit" className="button button-dark">{step === 2 ? "Review your details" : "Continue"} <span aria-hidden="true">→</span></button>}</div>
            </fieldset>
          </form>
        </> : <div className="preview-complete"><span className="complete-symbol" aria-hidden="true">✓</span><p className="eyebrow">{live ? "ENQUIRY RECEIVED" : "LOCAL PREVIEW COMPLETE"}</p><h2 ref={headingRef} tabIndex={-1}>{live ? "Thank you." : "That’s the journey."}</h2><p>{live ? "Reza will contact you to discuss the next step. Your preferred visit time is a request, not a confirmed appointment." : "No enquiry was sent and no appointment was booked. Your sample details and selected files have been cleared."}</p>{!live ? <p>In the live version, this step will connect to the approved Wix enquiry and booking workflow.</p> : null}<div className="complete-actions"><button type="button" onClick={reset} className="button button-dark">{live ? "Send another enquiry" : "Try again ↻"}</button><Link href="/" className="text-link">Back to the homepage →</Link></div></div>}
      </div>
    </div>
  </section>;
}
