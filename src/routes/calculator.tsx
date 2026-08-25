import { createFileRoute, Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, ChevronUp, HelpCircle, MessageCircle, Send, ArrowRight } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { AnimatedTotal } from "@/components/AnimatedTotal";
import { errorInputClass, Field, inputClass } from "@/components/FormField";
import { EASE, Reveal } from "@/components/Reveal";
import { STORAGE_KEYS } from "@/config/settings";
import { readJSON, writeJSON } from "@/utils/localStorage";
import { useStudio, type Enquiry } from "@/hooks/useStudio";
import { calculateRailingEstimate, formatArea, formatPanels } from "@/utils/calculations";
import { formatNPR } from "@/utils/currency";
import { openWhatsApp } from "@/utils/whatsapp";

const title = "Railing Price Calculator | House of Shakya";
const description =
  "Enter the approximate length and height of your boundary railing. Instant area, estimated panels, and pricing calculation from House of Shakya.";

export const Route = createFileRoute("/calculator")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CalculatorPage,
});

const PROJECT_TYPES = [
  "Residential",
  "Commercial",
  "Restaurant / Cafe",
  "Hotel",
  "Office",
  "Retail",
  "Other",
];

type FormState = {
  customerName: string;
  phone: string;
  email: string;
  location: string;
  projectType: string;
  additionalRequirements: string;
};

const EMPTY_FORM: FormState = {
  customerName: "",
  phone: "",
  email: "",
  location: "",
  projectType: "",
  additionalRequirements: "",
};

type Errors = Partial<
  Record<
    | "customerName"
    | "phone"
    | "email"
    | "location"
    | "projectType"
    | "length"
    | "height",
    string
  >
>;

const PHONE_RE = /^(?:\+?977[-\s]?)?9[678]\d{8}$/;

function CalculatorPage() {
  const { selectedProduct, selectedId, selectProduct, products, ready, settings, addEnquiry, storageOk } = useStudio();
  const lengthInputRef = useRef<HTMLInputElement>(null);

  // Measurements initialized from localStorage or defaults
  const [length, setLength] = useState<string>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = readJSON<string | null>(STORAGE_KEYS.length, null);
        if (stored) return stored;
      } catch {
        /* ignore */
      }
    }
    return "20";
  });

  const [height, setHeight] = useState<string>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = readJSON<string | null>(STORAGE_KEYS.height, null);
        if (stored) return stored;
      } catch {
        /* ignore */
      }
    }
    return "3.5";
  });

  const [showFormula, setShowFormula] = useState(false);

  // Form State
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState<Enquiry | null>(null);

  // Update height and focus length when product changes
  useEffect(() => {
    if (selectedProduct) {
      const storedHeight = readJSON<string | null>(STORAGE_KEYS.height, null);
      if (!storedHeight) {
        const stdH = selectedProduct.standardHeight || 3.5;
        setHeight(String(stdH));
        writeJSON(STORAGE_KEYS.height, String(stdH));
      }
      setTimeout(() => {
        lengthInputRef.current?.focus();
      }, 300);
    }
  }, [selectedProduct?.id]);

  const numLength = parseFloat(length);
  const numHeight = parseFloat(height);
  const isCustom = Boolean(selectedProduct?.isCustom);

  const estimate = useMemo(() => {
    const validLength = Number.isFinite(numLength) && numLength > 0 ? numLength : 0;
    const validHeight = Number.isFinite(numHeight) && numHeight > 0 ? numHeight : 3.5;
    const rate = selectedProduct?.pricePerSqft ?? 0;
    const moduleWidth = selectedProduct?.standardModuleWidth ?? 4;

    return calculateRailingEstimate(
      validLength,
      validHeight,
      rate,
      moduleWidth,
      isCustom,
    );
  }, [numLength, numHeight, selectedProduct, isCustom]);

  const setField = (k: keyof FormState, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: "" }));
  };

  // Steps Progress State
  const currentStep = useMemo(() => {
    if (!selectedProduct) return 1;
    if (submitted) return 4;
    if (estimate.length > 0 && estimate.height > 0) return 3;
    return 2;
  }, [selectedProduct, submitted, estimate]);

  function validate(): boolean {
    const next: Errors = {};
    if (!form.customerName.trim()) next.customerName = "Please enter your full name.";
    if (!form.phone.trim()) next.phone = "Please enter your phone number.";
    else if (!PHONE_RE.test(form.phone.trim().replace(/\s/g, "")))
      next.phone = "Enter a valid Nepalese number, e.g. 9801234567.";
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim()))
      next.email = "Enter a valid email address.";
    if (!form.location.trim()) next.location = "Please enter the project location.";
    if (!form.projectType) next.projectType = "Please choose a project type.";

    if (!length.trim() || isNaN(numLength) || numLength <= 0) {
      next.length = "Please enter a valid length greater than 0 ft.";
    } else if (numLength > 10000) {
      next.length = "For lengths over 10,000 ft, please contact us directly.";
    }

    if (!height.trim() || isNaN(numHeight) || numHeight <= 0) {
      next.height = "Please enter a valid height greater than 0 ft.";
    }

    setErrors(next);
    if (Object.keys(next).length) {
      toast.error("Please review the highlighted fields");
      return false;
    }
    return true;
  }

  function buildEnquiry(): Omit<Enquiry, "id" | "createdAt" | "status"> | null {
    if (!selectedProduct) return null;
    return {
      customerName: form.customerName.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      location: form.location.trim(),
      projectType: form.projectType,
      productId: selectedProduct.id,
      productCode: selectedProduct.code,
      productName: selectedProduct.name,
      material: selectedProduct.material,
      isCustom,
      lengthFt: estimate.length,
      heightFt: estimate.height,
      estimatedAreaSqft: estimate.area,
      estimatedPanelQuantity: estimate.panels,
      standardModuleWidthFt: estimate.standardModuleWidth,
      rate: isCustom ? 0 : selectedProduct.pricePerSqft,
      estimatedTotal: isCustom ? 0 : estimate.total,
      additionalRequirements: form.additionalRequirements.trim(),
      quantity: estimate.panels,
      area: estimate.area,
      totalArea: estimate.area,
    };
  }

  const handleSubmit = (viaWhatsApp: boolean) => {
    if (!validate()) return;
    const data = buildEnquiry();
    if (!data) {
      toast.error("Select a railing first");
      return;
    }
    const enquiry = addEnquiry(data);
    setSubmitted(enquiry);
    if (!storageOk) {
      toast.warning("Local storage unavailable — your enquiry was not saved on this device.");
    }
    if (viaWhatsApp) {
      const ok = openWhatsApp(enquiry, settings.whatsappNumber, settings.currency);
      if (!ok) {
        toast.error("WhatsApp could not be opened", {
          description: "Please call or email us — your details are saved on this device.",
        });
      }
    } else {
      toast.success("Requirement recorded", {
        description: "Send it via WhatsApp so our team receives it instantly.",
      });
    }
  };

  if (selectedId && !selectedProduct && (!ready || products.length === 0)) {
    return (
      <section className="mx-auto max-w-[1440px] px-5 pt-36 pb-32 md:px-10 md:pt-48">
        <div className="mx-auto max-w-xl border border-hairline bg-card p-12 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-bronze border-t-transparent" />
          <p className="mt-4 text-xs tracking-[0.2em] text-bronze uppercase">
            Loading your railing selection...
          </p>
        </div>
      </section>
    );
  }

  if (!selectedProduct) {
    return (
      <section className="mx-auto max-w-[1440px] px-5 pt-36 pb-32 md:px-10 md:pt-48">
        <div className="mx-auto max-w-xl border border-dashed border-hairline px-8 py-20 text-center">
          <p className="label-xs text-bronze">01 SELECT</p>
          <h1 className="mt-5 text-3xl tracking-tight md:text-4xl">Select a railing to begin</h1>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Browse our collection and choose an architectural railing design to calculate your estimate.
          </p>
          <Link
            to="/collection"
            className="mt-9 inline-block bg-charcoal px-9 py-4 text-[0.72rem] tracking-[0.22em] text-ivory uppercase transition-colors hover:bg-bronze"
          >
            Explore Collection
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-[1440px] px-5 pt-32 pb-28 md:px-10 md:pt-40">
      {/* 4-Step Progress Stepper */}
      <div className="mb-10 border-b border-hairline pb-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {[
            { num: "01", name: "SELECT", completed: Boolean(selectedProduct) },
            { num: "02", name: "MEASURE", completed: estimate.length > 0 && estimate.height > 0 },
            { num: "03", name: "ESTIMATE", completed: estimate.area > 0 },
            { num: "04", name: "SEND", completed: Boolean(submitted) },
          ].map((step, idx) => {
            const isActive =
              (idx === 0 && currentStep === 1) ||
              (idx === 1 && currentStep === 2) ||
              (idx === 2 && currentStep === 3) ||
              (idx === 3 && currentStep === 4);

            return (
              <div key={step.name} className="flex items-center gap-3">
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-[0.62rem] font-medium tracking-wider transition-colors ${
                    step.completed
                      ? "bg-bronze text-ivory"
                      : isActive
                        ? "border border-foreground text-foreground"
                        : "border border-hairline text-muted-foreground"
                  }`}
                >
                  {step.completed ? <Check className="h-3 w-3 stroke-[2.5]" /> : step.num}
                </span>
                <span
                  className={`text-[0.7rem] tracking-[0.2em] uppercase transition-colors ${
                    isActive
                      ? "font-semibold text-foreground"
                      : step.completed
                        ? "text-foreground/90"
                        : "text-muted-foreground"
                  }`}
                >
                  {step.name}
                </span>
                {idx < 3 && <span className="hidden text-hairline sm:inline">→</span>}
              </div>
            );
          })}
        </div>
      </div>

      <div className="max-w-3xl">
        <p className="label-xs text-bronze">Boundary Railing Configurator</p>
        <h1 className="mt-3 text-3xl leading-[1.1] tracking-tight md:text-5xl">
          TELL US YOUR RAILING DIMENSIONS
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-base">
          Enter the approximate length and height of your boundary railing. We'll calculate the
          estimated area and price for you.
        </p>
      </div>

      <div className="mt-12 grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
        {/* LEFT COLUMN: Railing Card + Measurements Inputs + Quotation Form */}
        <div>
          {/* Selected Railing Summary Card */}
          <div className="flex gap-5 border border-hairline bg-card p-5">
            <img
              src={selectedProduct.image}
              alt={selectedProduct.name}
              loading="lazy"
              className="h-28 w-24 shrink-0 object-cover"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <p className="label-xs text-bronze">{selectedProduct.code}</p>
                <span className="text-[0.62rem] tracking-wider text-muted-foreground uppercase">
                  Module: {selectedProduct.standardModuleWidth || 4} ft
                </span>
              </div>
              <h2 className="mt-1 text-lg leading-snug tracking-tight">{selectedProduct.name}</h2>
              <p className="mt-1 text-xs text-muted-foreground">{selectedProduct.material}</p>
              <p className="mt-3 text-sm font-semibold text-foreground">
                {isCustom
                  ? "Custom Quote"
                  : `${formatNPR(selectedProduct.pricePerSqft, settings.currency)} / sq.ft.`}
              </p>
              <div className="mt-3 flex items-center gap-4">
                <Link
                  to="/collection"
                  className="text-[0.68rem] tracking-[0.18em] text-muted-foreground uppercase underline-offset-4 hover:text-bronze hover:underline"
                >
                  Change railing
                </Link>
                <span className="text-hairline">|</span>
                <button
                  type="button"
                  onClick={() => selectProduct(null)}
                  className="text-[0.68rem] tracking-[0.18em] text-destructive/70 uppercase underline-offset-4 hover:text-destructive hover:underline"
                >
                  Deselect
                </button>
              </div>
            </div>
          </div>

          {/* DIMENSION MEASUREMENT CARDS */}
          <div className="mt-8 border border-hairline bg-card p-7 md:p-9">
            <div className="grid gap-6 sm:grid-cols-2">
              {/* Length Input */}
              <div className="flex flex-col justify-between border border-hairline bg-background p-5">
                <div>
                  <label
                    htmlFor="railing-length"
                    className="block text-[0.72rem] font-medium tracking-[0.16em] text-foreground uppercase"
                  >
                    HOW LONG IS YOUR RAILING?
                  </label>
                  <p className="mt-1 text-[0.7rem] text-muted-foreground">
                    Total boundary or perimeter length in feet.
                  </p>
                </div>
                <div className="mt-4">
                  <div className="relative flex items-center">
                    <input
                      id="railing-length"
                      ref={lengthInputRef}
                      type="number"
                      step="any"
                      min="0.1"
                      inputMode="decimal"
                      value={length}
                      onChange={(e) => {
                        setLength(e.target.value);
                        setErrors((x) => ({ ...x, length: "" }));
                      }}
                      placeholder="e.g. 20"
                      className={`w-full border bg-card px-4 py-3.5 pr-12 text-xl font-medium tracking-tight tabular-nums outline-none transition-colors ${
                        errors.length
                          ? "border-destructive focus:border-destructive"
                          : "border-hairline focus:border-bronze"
                      }`}
                    />
                    <span className="pointer-events-none absolute right-4 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                      ft
                    </span>
                  </div>
                  {errors.length ? (
                    <p className="mt-2 text-xs text-destructive">{errors.length}</p>
                  ) : null}
                </div>
              </div>

              {/* Height Input */}
              <div className="flex flex-col justify-between border border-hairline bg-background p-5">
                <div>
                  <label
                    htmlFor="railing-height"
                    className="block text-[0.72rem] font-medium tracking-[0.16em] text-foreground uppercase"
                  >
                    HOW HIGH IS YOUR RAILING?
                  </label>
                  <p className="mt-1 text-[0.7rem] text-bronze/90">
                    Standard height is pre-filled. Change it if needed.
                  </p>
                </div>
                <div className="mt-4">
                  <div className="relative flex items-center">
                    <input
                      id="railing-height"
                      type="number"
                      step="any"
                      min="0.1"
                      inputMode="decimal"
                      value={height}
                      onChange={(e) => {
                        setHeight(e.target.value);
                        setErrors((x) => ({ ...x, height: "" }));
                      }}
                      placeholder="3.5"
                      className={`w-full border bg-card px-4 py-3.5 pr-12 text-xl font-medium tracking-tight tabular-nums outline-none transition-colors ${
                        errors.height
                          ? "border-destructive focus:border-destructive"
                          : "border-hairline focus:border-bronze"
                      }`}
                    />
                    <span className="pointer-events-none absolute right-4 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                      ft
                    </span>
                  </div>
                  {errors.height ? (
                    <p className="mt-2 text-xs text-destructive">{errors.height}</p>
                  ) : null}
                </div>
              </div>
            </div>

            {/* Expandable "How is this calculated?" formula */}
            <div className="mt-6 border-t border-hairline pt-4">
              <button
                type="button"
                onClick={() => setShowFormula((s) => !s)}
                className="flex items-center gap-2 text-[0.68rem] tracking-[0.16em] text-muted-foreground uppercase hover:text-foreground"
              >
                <HelpCircle className="h-3.5 w-3.5 text-bronze" />
                How is this calculated?
                {showFormula ? (
                  <ChevronUp className="h-3.5 w-3.5" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5" />
                )}
              </button>

              <AnimatePresence>
                {showFormula ? (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25, ease: EASE }}
                    className="mt-3 overflow-hidden rounded-none border border-dashed border-hairline bg-sand/30 p-4 text-xs leading-relaxed text-muted-foreground"
                  >
                    <p>
                      <strong>Area Formula:</strong> {estimate.length || 0} ft (Length) ×{" "}
                      {estimate.height || 0} ft (Height) ={" "}
                      <strong>{formatArea(estimate.area)}</strong>
                    </p>
                    <p className="mt-1.5">
                      <strong>Panel Estimate:</strong> {estimate.length || 0} ft ÷{" "}
                      {estimate.standardModuleWidth} ft module ={" "}
                      <strong>{formatPanels(estimate.panels)}</strong>
                    </p>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          </div>

          {/* QUOTATION REQUEST FORM */}
          <div className="mt-14">
            <h2 className="text-2xl tracking-tight md:text-3xl">Request a quotation</h2>
            <p className="mt-2 text-xs text-muted-foreground">
              Provide your project details to receive a formal quotation and installation schedule.
            </p>
            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              <Field id="name" label="Full name" required error={errors.customerName}>
                <input
                  id="name"
                  value={form.customerName}
                  onChange={(e) => setField("customerName", e.target.value)}
                  maxLength={100}
                  className={errors.customerName ? errorInputClass : inputClass}
                  placeholder="Your name"
                />
              </Field>
              <Field id="phone" label="Phone number" required error={errors.phone}>
                <input
                  id="phone"
                  inputMode="tel"
                  value={form.phone}
                  onChange={(e) => setField("phone", e.target.value)}
                  maxLength={20}
                  className={errors.phone ? errorInputClass : inputClass}
                  placeholder="98XXXXXXXX"
                />
              </Field>
              <Field id="email" label="Email (optional)" error={errors.email}>
                <input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => setField("email", e.target.value)}
                  maxLength={255}
                  className={errors.email ? errorInputClass : inputClass}
                  placeholder="you@example.com"
                />
              </Field>
              <Field id="location" label="Project location" required error={errors.location}>
                <input
                  id="location"
                  value={form.location}
                  onChange={(e) => setField("location", e.target.value)}
                  maxLength={120}
                  className={errors.location ? errorInputClass : inputClass}
                  placeholder="Kathmandu"
                />
              </Field>
              <Field id="projectType" label="Project type" required error={errors.projectType}>
                <select
                  id="projectType"
                  value={form.projectType}
                  onChange={(e) => setField("projectType", e.target.value)}
                  className={errors.projectType ? errorInputClass : inputClass}
                >
                  <option value="">Select project type</option>
                  {PROJECT_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </Field>
              <div className="sm:col-span-2">
                <Field id="notes" label="Additional requirements">
                  <textarea
                    id="notes"
                    rows={4}
                    maxLength={1000}
                    value={form.additionalRequirements}
                    onChange={(e) => setField("additionalRequirements", e.target.value)}
                    className={`${inputClass} resize-y`}
                    placeholder="Finish preference, corner details, timeline, site address…"
                  />
                </Field>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: YOUR ESTIMATE (Sticky Summary) */}
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="border border-hairline bg-card p-7 md:p-9">
            <p className="label-xs text-bronze">YOUR ESTIMATE</p>
            <h2 className="mt-2 text-2xl tracking-tight">Configuration Summary</h2>

            {/* ESTIMATED AREA (Prominent) */}
            <div className="mt-7 border-t border-hairline pt-6">
              <p className="text-[0.68rem] tracking-[0.18em] text-muted-foreground uppercase">
                ESTIMATED AREA
              </p>
              <p className="mt-1.5 text-3xl font-semibold tracking-tight tabular-nums">
                {formatArea(estimate.area)}
              </p>
            </div>

            {/* ESTIMATED PANELS (Secondary) */}
            <div className="mt-5 border-t border-hairline pt-5">
              <div className="flex items-baseline justify-between">
                <p className="text-[0.68rem] tracking-[0.18em] text-muted-foreground uppercase">
                  ESTIMATED PANELS
                </p>
                <p className="text-base font-medium tabular-nums text-foreground">
                  {formatPanels(estimate.panels)}
                </p>
              </div>
              <p className="mt-2 text-[0.68rem] leading-relaxed text-muted-foreground">
                Approximate panel count based on a {estimate.standardModuleWidth} ft standard module.
                Final quantity may vary depending on final site measurements, post spacing, corners
                and fabrication details.
              </p>
            </div>

            {/* ESTIMATED PRICE */}
            <div className="mt-6 border-t border-hairline pt-6">
              <p className="text-[0.68rem] tracking-[0.18em] text-muted-foreground uppercase">
                ESTIMATED PRICE
              </p>
              <div className="mt-2">
                {isCustom ? (
                  <div>
                    <span className="text-2xl font-semibold tracking-tight text-foreground">
                      CUSTOM QUOTE
                    </span>
                    <p className="mt-2 text-[0.7rem] leading-relaxed text-muted-foreground">
                      Pricing depends on the final design, materials, dimensions and fabrication
                      requirements.
                    </p>
                  </div>
                ) : (
                  <div className="text-3xl font-semibold tracking-tight md:text-4xl">
                    <AnimatedTotal value={estimate.total} currency={settings.currency} />
                  </div>
                )}
              </div>
            </div>

            {/* Detailed Parameters List */}
            <dl className="mt-7 space-y-3 border-t border-hairline pt-6 text-sm">
              <Row label="Railing" value={`${selectedProduct.code} — ${selectedProduct.name}`} />
              <Row label="Material" value={selectedProduct.material} />
              <Row label="Length" value={`${estimate.length || 0} ft`} />
              <Row label="Height" value={`${estimate.height || 0} ft`} />
              <Row
                label="Rate"
                value={
                  isCustom
                    ? "Custom Quote"
                    : `${formatNPR(selectedProduct.pricePerSqft, settings.currency)} / sq.ft.`
                }
              />
              <Row label="Customer" value={form.customerName || "—"} />
              <Row label="Phone" value={form.phone || "—"} />
              <Row label="Location" value={form.location || "—"} />
            </dl>

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-col gap-3">
              <button
                type="button"
                onClick={() => handleSubmit(true)}
                className="flex items-center justify-center gap-2.5 bg-charcoal px-7 py-4 text-[0.72rem] tracking-[0.2em] text-ivory uppercase transition-colors duration-300 hover:bg-bronze"
              >
                <MessageCircle className="h-4 w-4" />
                {isCustom ? "Request Custom Quote →" : "Send via WhatsApp"}
              </button>
              <button
                type="button"
                onClick={() => handleSubmit(false)}
                className="flex items-center justify-center gap-2.5 border border-hairline px-7 py-4 text-[0.72rem] tracking-[0.2em] uppercase transition-colors duration-300 hover:border-foreground/40"
              >
                <Send className="h-3.5 w-3.5" />
                Record Enquiry
              </button>
            </div>

            <p className="mt-5 text-[0.68rem] leading-relaxed text-muted-foreground">
              Directly connected to House of Shakya Supabase studio database. WhatsApp opens
              with your customized calculation pre-filled.
            </p>
          </div>

          <AnimatePresence>
            {submitted ? (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: EASE }}
                className="mt-6 flex items-start gap-4 border border-success/40 bg-card p-6"
                role="status"
              >
                <motion.span
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.35, ease: EASE }}
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-success/15 text-success"
                >
                  <Check className="h-4 w-4 stroke-[2.5]" />
                </motion.span>
                <div>
                  <p className="text-sm font-medium tracking-tight">Requirement recorded</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    Reference #{submitted.id.slice(-6).toUpperCase()} · saved to Supabase cloud. Our
                    team will confirm the final quotation.
                  </p>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </aside>
      </div>

      <Reveal>
        <p className="mt-20 max-w-3xl text-xs leading-relaxed text-muted-foreground">
          Estimated price and panel counts are approximate. Final pricing may vary depending on
          site conditions, structural anchoring, post spacing, corners, fabrication details, and
          final site measurements. House of Shakya will confirm the final quotation after review.
        </p>
      </Reveal>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-6 border-b border-hairline pb-2.5 last:border-0">
      <dt className="label-xs shrink-0 text-muted-foreground">{label}</dt>
      <dd className="text-right text-sm">{value}</dd>
    </div>
  );
}
