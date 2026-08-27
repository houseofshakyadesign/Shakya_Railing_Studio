import { createFileRoute, Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  MessageCircle,
  Send,
  ArrowRight,
  Layers,
  CornerDownRight,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { AnimatedTotal } from "@/components/AnimatedTotal";
import { errorInputClass, Field, inputClass } from "@/components/FormField";
import { EASE, Reveal } from "@/components/Reveal";
import { STORAGE_KEYS } from "@/config/settings";
import { readJSON, writeJSON } from "@/utils/localStorage";
import { useStudio, type Enquiry } from "@/hooks/useStudio";
import { calculateRailingEstimate, formatArea, type RailingTypeSlug } from "@/utils/calculations";
import { formatNPR } from "@/utils/currency";
import { openWhatsApp } from "@/utils/whatsapp";

const title = "Price Calculator | Metal Work Nepal";
const description =
  "Instant area and price calculation for Balcony and Staircase boundary railings from Metal Work Nepal.";

export const Route = createFileRoute("/calculator")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "/images/railings/hero.jpg" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: "/images/railings/hero.jpg" },
      { rel: "canonical", href: "https://shakya-railing-studio.vercel.app/calculator" },
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

const LENGTH_PRESETS = [10, 20, 30, 40, 50, 60];

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
  projectType: "Residential",
  additionalRequirements: "",
};

type Errors = Partial<
  Record<"customerName" | "phone" | "email" | "location" | "projectType" | "length", string>
>;

const PHONE_RE = /^(?:\+?977[-\s]?)?9[678]\d{8}$/;

function CalculatorPage() {
  const {
    selectedProduct,
    selectedId,
    selectProduct,
    products,
    ready,
    settings,
    addEnquiry,
    storageOk,
    railingType,
    setRailingType,
    currentStandardHeight,
    railingTypes,
  } = useStudio();

  const lengthInputRef = useRef<HTMLInputElement>(null);
  const enquirySectionRef = useRef<HTMLDivElement>(null);

  // Length input initialized from localStorage or default (20 ft)
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

  const [showFormula, setShowFormula] = useState(false);

  // Form State
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState<Enquiry | null>(null);

  // Focus length input when product or railing type changes
  useEffect(() => {
    if (selectedId) {
      setTimeout(() => {
        lengthInputRef.current?.focus();
      }, 300);
    }
  }, [selectedId, railingType]);

  const numLength = parseFloat(length);
  const isCustom = Boolean(
    selectedProduct?.isCustom ||
    selectedProduct?.pricePerSqft === null ||
    selectedProduct?.pricePerSqft === undefined ||
    selectedProduct?.pricePerSqft === 0,
  );

  // Clean calculation: Area = Length × Standard Height, Price = Area × Rate
  const estimate = useMemo(() => {
    const validLength = Number.isFinite(numLength) && numLength > 0 ? numLength : 0;
    const rate = selectedProduct?.pricePerSqft ?? 0;
    const typeLabel = railingType === "staircase" ? "Staircase Railing" : "Balcony Railing";

    return calculateRailingEstimate(validLength, currentStandardHeight, rate, isCustom, typeLabel);
  }, [numLength, currentStandardHeight, selectedProduct, isCustom, railingType]);

  const setField = (k: keyof FormState, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: "" }));
  };

  // Steps Progress State
  const currentStep = useMemo(() => {
    if (!selectedProduct) return 1;
    if (submitted) return 4;
    if (estimate.length > 0) return 3;
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
      railingType: railingType === "staircase" ? "Staircase Railing" : "Balcony Railing",
      productId: selectedProduct.id,
      productCode: selectedProduct.code,
      productName: selectedProduct.name,
      material: selectedProduct.material,
      isCustom,
      lengthFt: estimate.length,
      heightFt: currentStandardHeight,
      estimatedAreaSqft: estimate.area,
      rate: isCustom ? 0 : (selectedProduct.pricePerSqft ?? 0),
      estimatedPrice: isCustom ? 0 : estimate.total,
      estimatedTotal: isCustom ? 0 : estimate.total,
      additionalRequirements: form.additionalRequirements.trim(),
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
      toast.success("Enquiry recorded successfully", {
        description: "Send it via WhatsApp so our team receives it instantly.",
      });
    }
  };

  const scrollToEnquiry = () => {
    enquirySectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
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
            Browse our curated collection and choose an architectural railing design to calculate
            your estimate.
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
            { num: "02", name: "MEASURE", completed: estimate.length > 0 },
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
        <p className="label-xs text-bronze">Metal Work Nepal — Railing Studio</p>
        <h1 className="mt-3 text-3xl leading-[1.1] tracking-tight md:text-5xl">
          CALCULATE YOUR RAILING ESTIMATE
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-base">
          Choose your application type and enter the length. We automatically determine standard
          heights, calculate your square footage, and estimate your project rate.
        </p>
      </div>

      <div className="mt-12 grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
        {/* LEFT COLUMN: Application Type + Measurements Input + Enquiry Form */}
        <div className="space-y-10">
          {/* STEP 01: APPLICATION TYPE SELECTOR */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <span className="label-xs text-bronze">STEP 01</span>
              <span className="text-[0.65rem] tracking-widest text-muted-foreground uppercase">
                Select Application
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Balcony Railing Option */}
              <button
                type="button"
                onClick={() => {
                  setRailingType("balcony");
                  toast.success("Selected Balcony Railing", {
                    description: "Standard height: 3 ft",
                  });
                }}
                className={`relative flex flex-col p-5 text-left transition-all ${
                  railingType === "balcony"
                    ? "border-2 border-bronze bg-bronze/5 shadow-sm"
                    : "border border-hairline bg-card hover:border-foreground/30"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold tracking-wider uppercase text-foreground">
                    BALCONY RAILING
                  </span>
                  {railingType === "balcony" && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-bronze text-ivory">
                      <Check className="h-3 w-3 stroke-[3]" />
                    </span>
                  )}
                </div>
                <p className="mt-2 text-xs text-muted-foreground">Standard height: 3 ft</p>
              </button>

              {/* Staircase Railing Option */}
              <button
                type="button"
                onClick={() => {
                  setRailingType("staircase");
                  toast.success("Selected Staircase Railing", {
                    description: "Standard height: 2.8 ft",
                  });
                }}
                className={`relative flex flex-col p-5 text-left transition-all ${
                  railingType === "staircase"
                    ? "border-2 border-bronze bg-bronze/5 shadow-sm"
                    : "border border-hairline bg-card hover:border-foreground/30"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold tracking-wider uppercase text-foreground">
                    STAIRCASE RAILING
                  </span>
                  {railingType === "staircase" && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-bronze text-ivory">
                      <Check className="h-3 w-3 stroke-[3]" />
                    </span>
                  )}
                </div>
                <p className="mt-2 text-xs text-muted-foreground">Standard height: 2.8 ft</p>
              </button>
            </div>
          </div>

          {/* STEP 02: SELECTED RAILING CARD */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <span className="label-xs text-bronze">STEP 02</span>
              <span className="text-[0.65rem] tracking-widest text-muted-foreground uppercase">
                Selected Railing Design
              </span>
            </div>

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
                    {railingType === "staircase" ? "Staircase" : "Balcony"}
                  </span>
                </div>
                {selectedProduct.nepaliName ? (
                  <p className="mt-1 text-xs font-medium text-bronze">
                    {selectedProduct.nepaliName}
                  </p>
                ) : null}
                <h2 className="mt-0.5 font-serif text-lg tracking-tight truncate">
                  {selectedProduct.displayName || selectedProduct.name}
                </h2>
                <p className="mt-1 text-xs text-muted-foreground truncate">
                  {selectedProduct.material}
                </p>
                <div className="mt-3 flex items-center justify-between border-t border-hairline pt-3">
                  <span className="text-xs font-medium text-foreground">
                    {isCustom
                      ? "Price on Request"
                      : `${formatNPR(selectedProduct.pricePerSqft, settings.currency)} / sq.ft.`}
                  </span>
                  <Link
                    to="/collection"
                    className="text-[0.65rem] tracking-[0.15em] text-bronze uppercase underline-offset-4 hover:underline"
                  >
                    Change Railing
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* STEP 03: MEASUREMENT INPUTS */}
          <div className="border border-hairline bg-card p-6 md:p-8">
            <div className="mb-6 flex items-center justify-between">
              <span className="label-xs text-bronze">STEP 03</span>
              <span className="text-[0.65rem] tracking-widest text-muted-foreground uppercase">
                Enter Dimensions
              </span>
            </div>

            <div className="space-y-6">
              {/* Length Input */}
              <div>
                <label
                  htmlFor="railing-length"
                  className="mb-2 block text-xs tracking-wider text-muted-foreground uppercase"
                >
                  Length in Feet *
                </label>
                <div className="relative">
                  <input
                    ref={lengthInputRef}
                    id="railing-length"
                    type="number"
                    min="1"
                    max="10000"
                    step="0.5"
                    value={length}
                    onChange={(e) => setLength(e.target.value)}
                    placeholder="20"
                    className={`w-full border bg-background px-4 py-3.5 font-mono text-lg transition-colors focus:border-bronze focus:outline-none ${
                      errors.length ? "border-destructive" : "border-hairline"
                    }`}
                  />
                  <span className="absolute top-1/2 right-4 -translate-y-1/2 text-xs tracking-wider text-muted-foreground uppercase">
                    FT
                  </span>
                </div>
                {errors.length && (
                  <p className="mt-1.5 text-xs text-destructive">{errors.length}</p>
                )}
              </div>

              {/* Quick Length Preset Buttons */}
              <div className="flex flex-wrap gap-2 pt-1">
                {LENGTH_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => {
                      setLength(preset.toString());
                      toast.success(`Set length to ${preset} ft`);
                    }}
                    className={`border px-3.5 py-1.5 font-mono text-xs transition-colors ${
                      length === preset.toString()
                        ? "border-bronze bg-bronze/10 text-bronze font-semibold"
                        : "border-hairline bg-background text-muted-foreground hover:border-foreground/40 hover:text-foreground"
                    }`}
                  >
                    {preset} ft
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* STEP 04: ENQUIRY / SUBMISSION FORM */}
          <div ref={enquirySectionRef} className="border border-hairline bg-card p-6 md:p-8">
            <div className="mb-6 flex items-center justify-between">
              <span className="label-xs text-bronze">STEP 04</span>
              <span className="text-[0.65rem] tracking-widest text-muted-foreground uppercase">
                Send Your Requirement
              </span>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit(false);
              }}
              className="space-y-4"
            >
              <Field id="enquiry-name" label="Full Name *" error={errors.customerName}>
                <input
                  id="enquiry-name"
                  type="text"
                  value={form.customerName}
                  onChange={(e) => setField("customerName", e.target.value)}
                  placeholder="e.g. Bipin Shakya"
                  className={errors.customerName ? errorInputClass : inputClass}
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field id="enquiry-phone" label="Phone Number *" error={errors.phone}>
                  <input
                    id="enquiry-phone"
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setField("phone", e.target.value)}
                    placeholder="98XXXXXXXX"
                    className={errors.phone ? errorInputClass : inputClass}
                  />
                </Field>

                <Field id="enquiry-email" label="Email Address" error={errors.email}>
                  <input
                    id="enquiry-email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setField("email", e.target.value)}
                    placeholder="name@example.com"
                    className={errors.email ? errorInputClass : inputClass}
                  />
                </Field>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field id="enquiry-location" label="Project Location *" error={errors.location}>
                  <input
                    id="enquiry-location"
                    type="text"
                    value={form.location}
                    onChange={(e) => setField("location", e.target.value)}
                    placeholder="e.g. Baneshwor, Kathmandu"
                    className={errors.location ? errorInputClass : inputClass}
                  />
                </Field>

                <Field id="enquiry-project-type" label="Project Type *" error={errors.projectType}>
                  <select
                    id="enquiry-project-type"
                    value={form.projectType}
                    onChange={(e) => setField("projectType", e.target.value)}
                    className={errors.projectType ? errorInputClass : inputClass}
                  >
                    {PROJECT_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              <Field id="enquiry-notes" label="Additional Requirements">
                <textarea
                  id="enquiry-notes"
                  rows={3}
                  value={form.additionalRequirements}
                  onChange={(e) => setField("additionalRequirements", e.target.value)}
                  placeholder="Mention site access, color preference, glass thickness or specific deadline..."
                  className={inputClass}
                />
              </Field>

              <div className="flex flex-col gap-3 pt-4 sm:flex-row">
                <button
                  id="submit-enquiry-btn"
                  type="submit"
                  className="flex flex-1 items-center justify-center gap-2 bg-charcoal px-6 py-4 text-[0.72rem] tracking-[0.2em] text-ivory uppercase transition-colors hover:bg-bronze"
                >
                  <Send className="h-4 w-4" />
                  Save Enquiry
                </button>

                <button
                  id="whatsapp-enquiry-btn"
                  type="button"
                  onClick={() => handleSubmit(true)}
                  className="flex flex-1 items-center justify-center gap-2 border border-foreground bg-transparent px-6 py-4 text-[0.72rem] tracking-[0.2em] text-foreground uppercase transition-colors hover:bg-foreground hover:text-background"
                >
                  <MessageCircle className="h-4 w-4" />
                  Send via WhatsApp
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* RIGHT COLUMN: Live Estimate & Summary Card */}
        <div className="lg:sticky lg:top-32 lg:self-start space-y-6">
          {/* Main Live Estimate Card */}
          <div className="border border-hairline bg-card p-6 md:p-8">
            <div className="flex items-center justify-between border-b border-hairline pb-4">
              <span className="label-xs text-bronze">YOUR ESTIMATE</span>
              <span className="text-[0.65rem] tracking-wider text-muted-foreground uppercase">
                {railingType === "staircase" ? "Staircase Railing" : "Balcony Railing"}
              </span>
            </div>

            {/* Estimated Area Display */}
            <div className="mt-6 border-b border-hairline pb-6">
              <span className="text-[0.68rem] tracking-[0.2em] text-muted-foreground uppercase">
                ESTIMATED AREA
              </span>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-3xl font-light tracking-tight text-foreground md:text-4xl">
                  {formatArea(estimate.area)}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {estimate.length} ft length × {currentStandardHeight} ft height
              </p>
            </div>

            {/* Estimated Price Display */}
            <div className="mt-6 border-b border-hairline pb-6">
              <span className="text-[0.68rem] tracking-[0.2em] text-muted-foreground uppercase">
                ESTIMATED PRICE
              </span>
              <div className="mt-2">
                {isCustom ? (
                  <div>
                    <span className="text-2xl font-medium tracking-tight text-bronze uppercase">
                      PRICE ON REQUEST
                    </span>
                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                      Pricing will be confirmed based on the project dimensions, configuration and
                      site requirements.
                    </p>
                  </div>
                ) : (
                  <div>
                    <div className="text-3xl font-serif tracking-tight text-foreground md:text-4xl">
                      <AnimatedTotal value={estimate.total} currency={settings.currency} />
                    </div>
                    <p className="mt-1.5 text-xs text-muted-foreground">
                      Calculated at {formatNPR(selectedProduct.pricePerSqft, settings.currency)} /
                      sq.ft.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Detailed Summary Breakdown */}
            <div className="mt-6 space-y-3 text-xs">
              <div className="flex justify-between py-1 border-b border-hairline/60">
                <span className="text-muted-foreground">Railing Type</span>
                <span className="font-medium text-foreground">
                  {railingType === "staircase" ? "Staircase Railing" : "Balcony Railing"}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-hairline/60">
                <span className="text-muted-foreground">Selected Railing</span>
                <span className="font-medium text-foreground truncate max-w-[200px]">
                  {selectedProduct.code} — {selectedProduct.name}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-hairline/60">
                <span className="text-muted-foreground">Length</span>
                <span className="font-medium text-foreground">{estimate.length} ft</span>
              </div>
              <div className="flex justify-between py-1 border-b border-hairline/60">
                <span className="text-muted-foreground">Standard Height</span>
                <span className="font-medium text-foreground">{currentStandardHeight} ft</span>
              </div>
              <div className="flex justify-between py-1 border-b border-hairline/60">
                <span className="text-muted-foreground">Estimated Area</span>
                <span className="font-medium text-foreground">{formatArea(estimate.area)}</span>
              </div>
              {!isCustom && (
                <div className="flex justify-between py-1 border-b border-hairline/60">
                  <span className="text-muted-foreground">Rate</span>
                  <span className="font-medium text-foreground">
                    {formatNPR(selectedProduct.pricePerSqft, settings.currency)} / sq.ft.
                  </span>
                </div>
              )}
            </div>

            {/* Collapsible Formula Explanation */}
            <div className="mt-5 border-t border-hairline pt-4">
              <button
                type="button"
                onClick={() => setShowFormula(!showFormula)}
                aria-expanded={showFormula}
                className="flex w-full items-center justify-between text-left text-xs tracking-wider text-muted-foreground hover:text-foreground"
              >
                <span>How is this calculated?</span>
                {showFormula ? (
                  <ChevronUp className="h-3.5 w-3.5" />
                ) : (
                  <ChevronDown className="h-3.5 w-3.5" />
                )}
              </button>
              <AnimatePresence>
                {showFormula && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden pt-3 text-xs leading-relaxed text-muted-foreground"
                  >
                    <p>
                      <strong>Area:</strong> {estimate.length} ft × {currentStandardHeight} ft ={" "}
                      {formatArea(estimate.area)}
                    </p>
                    {!isCustom && (
                      <p className="mt-1">
                        <strong>Price:</strong> {formatArea(estimate.area)} ×{" "}
                        {formatNPR(selectedProduct.pricePerSqft, settings.currency)} ={" "}
                        {formatNPR(estimate.total, settings.currency)}
                      </p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Disclaimer */}
            <div className="mt-6 bg-muted/40 p-4 text-[0.72rem] leading-relaxed text-muted-foreground">
              <p className="font-semibold text-foreground tracking-wider uppercase text-[0.65rem] mb-1">
                ESTIMATE ONLY
              </p>
              Final pricing and measurements will be confirmed by Metal Work Nepal after reviewing
              the project and taking final site measurements.
            </div>

            {/* Primary Action Button */}
            <button
              type="button"
              onClick={scrollToEnquiry}
              className="mt-6 flex w-full items-center justify-center gap-2 bg-charcoal py-4 text-[0.72rem] tracking-[0.22em] text-ivory uppercase transition-colors hover:bg-bronze"
            >
              CONTINUE TO QUOTE
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
