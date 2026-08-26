import { createFileRoute, Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, ChevronUp, HelpCircle, MessageCircle, Send, ArrowRight } from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { AnimatedTotal } from "@/components/AnimatedTotal";
import { FinalCTA } from "@/components/FinalCTA";
import { errorInputClass, Field, inputClass } from "@/components/FormField";
import { ProductGrid } from "@/components/ProductGrid";
import { EASE, Reveal, SectionHeading } from "@/components/Reveal";
import { STORAGE_KEYS } from "@/config/settings";
import { readJSON, writeJSON } from "@/utils/localStorage";
import type { Product } from "@/data/products";
import { useStudio, type Enquiry } from "@/hooks/useStudio";
import { calculateRailingEstimate, formatArea } from "@/utils/calculations";
import { formatNPR } from "@/utils/currency";
import { openWhatsApp } from "@/utils/whatsapp";

const title = "Railing Collection | Metal Work Nepal";
const description =
  "Browse 13 architectural railing designs — steel, glass, cable, wood and bespoke systems — with transparent per sq.ft. pricing from Metal Work Nepal.";

export const Route = createFileRoute("/collection")({
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
  component: CollectionPage,
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
  projectType: "Residential",
  additionalRequirements: "",
};

type Errors = Partial<
  Record<
    | "customerName"
    | "phone"
    | "email"
    | "location"
    | "projectType"
    | "length",
    string
  >
>;

const PHONE_RE = /^(?:\+?977[-\s]?)?9[678]\d{8}$/;

function CollectionPage() {
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
  } = useStudio();

  const calcRef = useRef<HTMLElement>(null);
  const lengthInputRef = useRef<HTMLInputElement>(null);
  const [justSelected, setJustSelected] = useState(false);

  // Measurements
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

  // Form state
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState<Enquiry | null>(null);

  const numLength = parseFloat(length);
  const isCustom = Boolean(selectedProduct?.isCustom);

  const estimate = useMemo(() => {
    const validLength = Number.isFinite(numLength) && numLength > 0 ? numLength : 0;
    const rate = selectedProduct?.pricePerSqft ?? 0;
    const typeLabel = railingType === "staircase" ? "Staircase Railing" : "Balcony Railing";

    return calculateRailingEstimate(
      validLength,
      currentStandardHeight,
      rate,
      isCustom,
      typeLabel,
    );
  }, [numLength, currentStandardHeight, selectedProduct, isCustom, railingType]);

  // Called when a product card's "Select & Calculate" is clicked
  const handleAfterSelect = useCallback((p: Product) => {
    setLength("20");
    setErrors({});
    setSubmitted(null);

    // Show inline confirmation
    setJustSelected(true);
    setTimeout(() => setJustSelected(false), 4500);

    // Smooth-scroll to calculator section
    setTimeout(() => {
      calcRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      setTimeout(() => {
        lengthInputRef.current?.focus();
      }, 500);
    }, 150);
  }, []);

  const setField = (k: keyof FormState, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: "" }));
  };

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
    }

    setErrors(next);
    if (Object.keys(next).length) {
      toast.error("Please check the highlighted fields");
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
      rate: isCustom ? 0 : selectedProduct.pricePerSqft,
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

  return (
    <>
      {/* ── COLLECTION GRID ── */}
      <section className="mx-auto max-w-[1440px] px-5 pt-36 pb-16 md:px-10 md:pt-48">
        <SectionHeading
          label="01 SELECT"
          title="Our railing collection."
          intro="Select an architectural railing below — you'll be taken straight to the dimension calculator."
        />
      </section>
      <section className="mx-auto max-w-[1440px] px-5 pb-24 md:px-10 md:pb-32">
        <ProductGrid onAfterSelect={handleAfterSelect} />
      </section>

      {/* ── INLINE CALCULATOR ── */}
      <section
        ref={calcRef}
        id="calculator"
        className="scroll-mt-24 border-t border-hairline bg-sand/40"
      >
        <div className="mx-auto max-w-[1440px] px-5 py-20 md:px-10 md:py-28">
          {!selectedProduct ? (
            /* Empty state: prompt to select */
            <div className="mx-auto max-w-xl border border-dashed border-hairline bg-background px-8 py-20 text-center">
              <p className="label-xs text-bronze">01 SELECT</p>
              <h2 className="mt-5 text-3xl tracking-tight md:text-4xl">
                Select a railing to begin
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                Choose any design above — your dimension calculator will appear here instantly.
              </p>
              <button
                type="button"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="mt-9 inline-flex items-center gap-2 bg-charcoal px-9 py-4 text-[0.72rem] tracking-[0.22em] text-ivory uppercase transition-colors hover:bg-bronze"
              >
                Browse Collection
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <>
              {/* "Great choice" confirmation banner */}
              <AnimatePresence>
                {justSelected ? (
                  <motion.div
                    initial={{ opacity: 0, y: -12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.35, ease: EASE }}
                    className="mb-10 flex items-center gap-4 border border-success/40 bg-background p-5"
                  >
                    <motion.span
                      initial={{ scale: 0.5 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.3, ease: EASE }}
                      className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-success/15 text-success"
                    >
                      <Check className="h-4 w-4" strokeWidth={2.5} />
                    </motion.span>
                    <div>
                      <p className="text-sm font-medium tracking-tight">
                        Great choice. Let's calculate your railing.
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {selectedProduct.code} — {selectedProduct.name}
                      </p>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>

              <div className="max-w-3xl">
                <p className="label-xs text-bronze">02 MEASURE & ESTIMATE</p>
                <h2 className="mt-3 text-3xl leading-[1.1] tracking-tight md:text-5xl">
                  TELL US YOUR RAILING DIMENSIONS
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground md:text-base">
                  Choose your application type and enter the approximate length. We automatically determine standard heights and calculate your estimate.
                </p>
              </div>

              {/* Application Type Selector in Collection Page */}
              <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 max-w-xl">
                <button
                  type="button"
                  onClick={() => setRailingType("balcony")}
                  className={`flex flex-col p-4 text-left transition-all ${
                    railingType === "balcony"
                      ? "border-2 border-bronze bg-background shadow-sm"
                      : "border border-hairline bg-background/60 hover:border-foreground/30"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold tracking-wider uppercase text-foreground">
                      BALCONY RAILING
                    </span>
                    {railingType === "balcony" && (
                      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-bronze text-ivory">
                        <Check className="h-2.5 w-2.5 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-[0.7rem] text-muted-foreground">Standard height: 3 ft</p>
                </button>

                <button
                  type="button"
                  onClick={() => setRailingType("staircase")}
                  className={`flex flex-col p-4 text-left transition-all ${
                    railingType === "staircase"
                      ? "border-2 border-bronze bg-background shadow-sm"
                      : "border border-hairline bg-background/60 hover:border-foreground/30"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold tracking-wider uppercase text-foreground">
                      STAIRCASE RAILING
                    </span>
                    {railingType === "staircase" && (
                      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-bronze text-ivory">
                        <Check className="h-2.5 w-2.5 stroke-[3]" />
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-[0.7rem] text-muted-foreground">Standard height: 2.8 ft</p>
                </button>
              </div>

              <div className="mt-12 grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
                {/* LEFT: selected railing + measurements + form */}
                <div>
                  {/* Selected railing card */}
                  <div className="flex gap-5 border border-hairline bg-background p-5">
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
                      <h3 className="mt-1 text-lg leading-snug tracking-tight">
                        {selectedProduct.name}
                      </h3>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {selectedProduct.material}
                      </p>
                      <p className="mt-3 text-sm font-semibold">
                        {isCustom
                          ? "Custom Quote"
                          : `${formatNPR(selectedProduct.pricePerSqft, settings.currency)} / sq.ft.`}
                      </p>
                      <div className="mt-3 flex items-center gap-4">
                        <button
                          type="button"
                          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                          className="text-[0.68rem] tracking-[0.18em] text-muted-foreground uppercase underline-offset-4 hover:text-bronze hover:underline"
                        >
                          Change railing
                        </button>
                        <span className="text-hairline">|</span>
                        <button
                          type="button"
                          onClick={() => {
                            selectProduct(null);
                            window.scrollTo({ top: 0, behavior: "smooth" });
                            toast.success("Selection cleared");
                          }}
                          className="text-[0.68rem] tracking-[0.18em] text-destructive/70 uppercase underline-offset-4 hover:text-destructive hover:underline"
                        >
                          Deselect
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* DIMENSION MEASUREMENT CARDS */}
                  <div className="mt-8 border border-hairline bg-background p-7 md:p-9">
                    <div className="grid gap-6 sm:grid-cols-2">
                      {/* Length Input */}
                      <div className="flex flex-col justify-between border border-hairline bg-card p-5">
                        <div>
                          <label
                            htmlFor="col-length"
                            className="block text-[0.72rem] font-medium tracking-[0.16em] text-foreground uppercase"
                          >
                            HOW LONG IS YOUR RAILING?
                          </label>
                          <p className="mt-1 text-[0.7rem] text-muted-foreground">
                            {railingType === "staircase"
                              ? "Enter the approximate length along the railing."
                              : "Total boundary length in feet."}
                          </p>
                        </div>
                        <div className="mt-4">
                          <div className="relative flex items-center">
                            <input
                              id="col-length"
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
                              className={`w-full border bg-background px-4 py-3.5 pr-12 text-xl font-medium tracking-tight tabular-nums outline-none transition-colors ${
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

                      {/* Standard Height (Automatic) */}
                      <div className="flex flex-col justify-between border border-hairline bg-card p-5">
                        <div>
                          <label
                            className="block text-[0.72rem] font-medium tracking-[0.16em] text-foreground uppercase"
                          >
                            STANDARD HEIGHT
                          </label>
                          <p className="mt-1 text-[0.7rem] text-bronze/90">
                            Standard height used for this estimate.
                          </p>
                        </div>
                        <div className="mt-4">
                          <div className="flex items-center justify-between border border-hairline bg-background/70 px-4 py-3.5">
                            <span className="text-xl font-medium tracking-tight text-foreground">
                              {currentStandardHeight} ft
                            </span>
                            <span className="text-[0.65rem] tracking-wider text-muted-foreground uppercase">
                              {railingType === "staircase" ? "Staircase" : "Balcony"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Expandable Formula */}
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
                              {currentStandardHeight} ft (Height) ={" "}
                              <strong>{formatArea(estimate.area)}</strong>
                            </p>
                            {!isCustom && (
                              <p className="mt-1.5">
                                <strong>Price:</strong> {formatArea(estimate.area)} × {formatNPR(selectedProduct.pricePerSqft, settings.currency)} = <strong>{formatNPR(estimate.total, settings.currency)}</strong>
                              </p>
                            )}
                          </motion.div>
                        ) : null}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* QUOTATION REQUEST FORM */}
                  <div className="mt-14">
                    <h3 className="text-2xl tracking-tight md:text-3xl">Request a quotation</h3>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Provide your project details to receive a formal quotation and installation schedule.
                    </p>
                    <div className="mt-8 grid gap-6 sm:grid-cols-2">
                      <Field id="col-name" label="Full name" required error={errors.customerName}>
                        <input
                          id="col-name"
                          value={form.customerName}
                          onChange={(e) => setField("customerName", e.target.value)}
                          maxLength={100}
                          className={errors.customerName ? errorInputClass : inputClass}
                          placeholder="Your name"
                        />
                      </Field>
                      <Field id="col-phone" label="Phone number" required error={errors.phone}>
                        <input
                          id="col-phone"
                          inputMode="tel"
                          value={form.phone}
                          onChange={(e) => setField("phone", e.target.value)}
                          maxLength={20}
                          className={errors.phone ? errorInputClass : inputClass}
                          placeholder="98XXXXXXXX"
                        />
                      </Field>
                      <Field id="col-email" label="Email (optional)" error={errors.email}>
                        <input
                          id="col-email"
                          type="email"
                          value={form.email}
                          onChange={(e) => setField("email", e.target.value)}
                          maxLength={255}
                          className={errors.email ? errorInputClass : inputClass}
                          placeholder="you@example.com"
                        />
                      </Field>
                      <Field id="col-loc" label="Project location" required error={errors.location}>
                        <input
                          id="col-loc"
                          value={form.location}
                          onChange={(e) => setField("location", e.target.value)}
                          maxLength={120}
                          className={errors.location ? errorInputClass : inputClass}
                          placeholder="Kathmandu"
                        />
                      </Field>
                      <Field id="col-type" label="Project type" required error={errors.projectType}>
                        <select
                          id="col-type"
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
                      <div className="sm:col-span-2">
                        <Field id="col-notes" label="Additional requirements">
                          <textarea
                            id="col-notes"
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

                {/* RIGHT: YOUR ESTIMATE (Sticky Summary) */}
                <aside className="lg:sticky lg:top-28 lg:self-start">
                  <div className="border border-hairline bg-background p-7 md:p-9 shadow-soft">
                    <p className="label-xs text-bronze">YOUR ESTIMATE</p>
                    <h3 className="mt-2 text-2xl tracking-tight">Configuration Summary</h3>

                    {/* ESTIMATED AREA */}
                    <div className="mt-7 border-t border-hairline pt-6">
                      <p className="text-[0.68rem] tracking-[0.18em] text-muted-foreground uppercase">
                        ESTIMATED AREA
                      </p>
                      <p className="mt-1.5 text-3xl font-semibold tracking-tight tabular-nums">
                        {formatArea(estimate.area)}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {estimate.length} ft × {currentStandardHeight} ft ({railingType === "staircase" ? "Staircase" : "Balcony"})
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
                              Pricing depends on the final design, materials, dimensions and fabrication requirements.
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
                      <Row label="Railing Type" value={railingType === "staircase" ? "Staircase Railing" : "Balcony Railing"} />
                      <Row label="Railing" value={`${selectedProduct.code} — ${selectedProduct.name}`} />
                      <Row label="Material" value={selectedProduct.material} />
                      <Row label="Length" value={`${estimate.length || 0} ft`} />
                      <Row label="Standard Height" value={`${currentStandardHeight} ft`} />
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
                      Directly connected to Metal Work Nepal studio database. WhatsApp opens with your calculation pre-filled.
                    </p>
                  </div>

                  <AnimatePresence>
                    {submitted ? (
                      <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4, ease: EASE }}
                        className="mt-6 flex items-start gap-4 border border-success/40 bg-background p-6"
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
                            Reference #{submitted.id.slice(-6).toUpperCase()} · saved to database.
                            Our team will confirm the final quotation.
                          </p>
                        </div>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </aside>
              </div>
            </>
          )}
        </div>
      </section>

      <FinalCTA />
    </>
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
