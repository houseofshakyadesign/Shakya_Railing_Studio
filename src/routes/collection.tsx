import { createFileRoute, Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { Check, MessageCircle, Minus, Plus, Send, ArrowRight } from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { AnimatedTotal } from "@/components/AnimatedTotal";
import { FinalCTA } from "@/components/FinalCTA";
import { errorInputClass, Field, inputClass } from "@/components/FormField";
import { ProductGrid } from "@/components/ProductGrid";
import { EASE, Reveal, SectionHeading } from "@/components/Reveal";
import type { Product } from "@/data/products";
import { useStudio, type Enquiry } from "@/hooks/useStudio";
import { calculateEstimate } from "@/utils/calculations";
import { formatNPR } from "@/utils/currency";
import { openWhatsApp } from "@/utils/whatsapp";

const title = "Railing Collection | House of Shakya";
const description =
  "Browse 13 architectural railing designs — steel, glass, cable, wood and bespoke systems — with transparent per sq.ft. pricing from House of Shakya.";

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
  projectType: "",
  additionalRequirements: "",
};

type Errors = Partial<
  Record<"customerName" | "phone" | "email" | "location" | "projectType" | "quantity" | "area", string>
>;

const PHONE_RE = /^(?:\+?977[-\s]?)?9[678]\d{8}$/;

function CollectionPage() {
  const { selectedProduct, selectProduct, settings, addEnquiry, storageOk } = useStudio();
  const calcRef = useRef<HTMLElement>(null);
  const areaInputRef = useRef<HTMLInputElement>(null);
  const [justSelected, setJustSelected] = useState(false);

  // Calculator state
  const [quantity, setQuantity] = useState("1");
  const [area, setArea] = useState("");
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState<Enquiry | null>(null);

  const isCustom = Boolean(selectedProduct?.isCustom);
  const numericQty = Number(quantity);
  const numericArea = Number(area);
  const estimate = useMemo(
    () => calculateEstimate(numericQty, numericArea, selectedProduct?.pricePerSqft ?? 0),
    [numericQty, numericArea, selectedProduct],
  );

  // Called when a product card's "Select & Calculate" is clicked
  const handleAfterSelect = useCallback((_product: Product) => {
    // Reset calculator for the new selection
    setQuantity("1");
    setArea("");
    setErrors({});
    setSubmitted(null);

    // Show the inline confirmation
    setJustSelected(true);
    setTimeout(() => setJustSelected(false), 4000);

    // Smooth-scroll to calculator section after a short delay for the selection animation
    setTimeout(() => {
      calcRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      // Focus the area input after scroll finishes
      setTimeout(() => {
        areaInputRef.current?.focus();
      }, 600);
    }, 150);
  }, []);

  const setField = (k: keyof FormState, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: "" }));
  };

  const incrementQty = () => {
    const next = Math.max(1, Math.floor(numericQty) + 1);
    setQuantity(String(next));
    setErrors((e) => ({ ...e, quantity: "" }));
  };
  const decrementQty = () => {
    const next = Math.max(1, Math.floor(numericQty) - 1);
    setQuantity(String(next));
    setErrors((e) => ({ ...e, quantity: "" }));
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
    if (!isCustom) {
      if (!quantity.trim() || !Number.isFinite(numericQty) || numericQty < 1)
        next.quantity = "Enter at least 1.";
      else if (numericQty > 500) next.quantity = "Please contact us for quantities above 500.";
      if (!area.trim() || !Number.isFinite(numericArea) || numericArea <= 0)
        next.area = "Enter an area greater than 0 sq.ft.";
      else if (numericArea > 100000) next.area = "Please contact us directly for areas this large.";
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
    const qty = isCustom ? Number(quantity) || 1 : Math.floor(numericQty);
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
      quantity: qty,
      area: isCustom ? Number(area) || 0 : numericArea,
      totalArea: isCustom ? 0 : estimate.totalArea,
      rate: isCustom ? 0 : selectedProduct.pricePerSqft,
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
      toast.success("Requirement recorded", {
        description: "Send it via WhatsApp so our team receives it instantly.",
      });
    }
  };

  return (
    <>
      {/* ── COLLECTION GRID ── */}
      <section className="mx-auto max-w-[1440px] px-5 pt-36 pb-16 md:px-10 md:pt-48">
        <SectionHeading
          label="Collection"
          title="Our railing collection."
          intro="Select a design below — you'll be taken straight to the calculator."
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
              <p className="label-xs text-bronze">Calculator</p>
              <h2 className="mt-5 text-3xl tracking-tight md:text-4xl">
                Select a railing to begin
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                Choose any design above — your calculator will appear here instantly.
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
                        Great choice. Now enter your required area.
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {selectedProduct.code} — {selectedProduct.name}
                      </p>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>

              <div className="max-w-3xl">
                <p className="label-xs text-bronze">Instant estimate</p>
                <h2 className="mt-5 text-4xl leading-[1.05] tracking-tight md:text-5xl">
                  Calculate your railing.
                </h2>
              </div>

              <div className="mt-14 grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
                {/* LEFT: selected railing + calc + form */}
                <div>
                  {/* Selected railing card */}
                  <div className="flex gap-5 border border-hairline bg-background p-5">
                    <img
                      src={selectedProduct.image}
                      alt={selectedProduct.name}
                      loading="lazy"
                      className="h-28 w-24 shrink-0 object-cover"
                    />
                    <div className="min-w-0">
                      <p className="label-xs text-bronze">{selectedProduct.code}</p>
                      <h3 className="mt-2 text-lg leading-snug tracking-tight">{selectedProduct.name}</h3>
                      <p className="mt-1.5 text-xs text-muted-foreground">{selectedProduct.material}</p>
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

                  {/* Calculator inputs */}
                  {isCustom ? (
                    <div className="mt-8 border border-bronze/40 bg-background p-8">
                      <p className="label-xs text-bronze">Custom Quote</p>
                      <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                        Pricing depends on design complexity, materials, dimensions and fabrication
                        requirements.
                      </p>
                      <div className="mt-6 grid gap-6 sm:grid-cols-2">
                        <Field id="calc-qty" label="Quantity (optional)" hint="Number of railing sections">
                          <input
                            id="calc-qty"
                            inputMode="numeric"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value)}
                            placeholder="e.g. 4"
                            className={inputClass}
                          />
                        </Field>
                        <Field id="calc-area" label="Approximate area per unit (optional)" hint="sq.ft., if known">
                          <input
                            ref={areaInputRef}
                            id="calc-area"
                            inputMode="decimal"
                            value={area}
                            onChange={(e) => setArea(e.target.value)}
                            placeholder="e.g. 250"
                            className={inputClass}
                          />
                        </Field>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-8 border border-hairline bg-background p-7 md:p-9">
                      <div className="grid gap-6 sm:grid-cols-2">
                        <Field
                          id="calc-qty"
                          label="Quantity"
                          required
                          error={errors.quantity}
                          hint="Number of railing sections needed."
                        >
                          <div className="flex items-stretch">
                            <button
                              type="button"
                              onClick={decrementQty}
                              aria-label="Decrease quantity"
                              className="grid w-12 place-items-center border border-r-0 border-hairline bg-sand transition-colors hover:bg-bronze/15 active:bg-bronze/25"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <input
                              id="calc-qty"
                              inputMode="numeric"
                              value={quantity}
                              onChange={(e) => {
                                setQuantity(e.target.value);
                                setErrors((x) => ({ ...x, quantity: "" }));
                              }}
                              placeholder="1"
                              className={`${errors.quantity ? errorInputClass : inputClass} flex-1 text-center`}
                              aria-invalid={Boolean(errors.quantity)}
                            />
                            <button
                              type="button"
                              onClick={incrementQty}
                              aria-label="Increase quantity"
                              className="grid w-12 place-items-center border border-l-0 border-hairline bg-sand transition-colors hover:bg-bronze/15 active:bg-bronze/25"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </Field>

                        <Field
                          id="calc-area"
                          label="Area per unit"
                          required
                          error={errors.area}
                          hint="Length × height in square feet."
                        >
                          <input
                            ref={areaInputRef}
                            id="calc-area"
                            inputMode="decimal"
                            value={area}
                            onChange={(e) => {
                              setArea(e.target.value);
                              setErrors((x) => ({ ...x, area: "" }));
                            }}
                            placeholder="Enter sq.ft. — e.g. 50"
                            className={errors.area ? errorInputClass : inputClass}
                            aria-invalid={Boolean(errors.area)}
                          />
                        </Field>
                      </div>

                      {/* Calculation breakdown */}
                      <div className="mt-8 border-t border-hairline pt-8">
                        <p className="label-xs text-muted-foreground">Breakdown</p>
                        <div className="mt-5 grid grid-cols-[1fr_auto_1fr_auto_1fr] items-end gap-3 text-center">
                          <div>
                            <p className="text-[0.62rem] tracking-[0.18em] text-muted-foreground uppercase">Qty</p>
                            <p className="mt-2 text-lg font-semibold tabular-nums">{estimate.quantity || 0}</p>
                          </div>
                          <span className="pb-2 text-muted-foreground">×</span>
                          <div>
                            <p className="text-[0.62rem] tracking-[0.18em] text-muted-foreground uppercase">Area / unit</p>
                            <p className="mt-2 text-lg font-semibold tabular-nums">{estimate.area || 0} <span className="text-xs font-normal text-muted-foreground">sq.ft.</span></p>
                          </div>
                          <span className="pb-2 text-muted-foreground">×</span>
                          <div>
                            <p className="text-[0.62rem] tracking-[0.18em] text-muted-foreground uppercase">Rate</p>
                            <p className="mt-2 text-lg font-semibold tabular-nums">{formatNPR(selectedProduct.pricePerSqft, settings.currency)}</p>
                          </div>
                        </div>
                        <div className="mt-4 flex items-center justify-between border-t border-dashed border-hairline pt-4">
                          <p className="text-[0.62rem] tracking-[0.18em] text-muted-foreground uppercase">Total area</p>
                          <p className="text-sm font-medium tabular-nums">{estimate.totalArea || 0} sq.ft.</p>
                        </div>
                      </div>

                      <div className="mt-8 border-t border-hairline pt-8">
                        <p className="label-xs text-muted-foreground">Estimated total</p>
                        <p className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">
                          <AnimatedTotal value={estimate.total} currency={settings.currency} />
                        </p>
                      </div>

                      <div className="mt-8 border-t border-hairline pt-6">
                        <p className="label-xs text-bronze">Estimated price</p>
                        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                          Final pricing may vary depending on site conditions, final dimensions, material
                          selection, fabrication requirements, installation conditions and final
                          measurements. House of Shakya will confirm the final quotation after reviewing the
                          project.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* CUSTOMER FORM */}
                  <div className="mt-14">
                    <h3 className="text-2xl tracking-tight md:text-3xl">Request a quotation</h3>
                    <div className="mt-8 grid gap-6 sm:grid-cols-2">
                      <Field id="calc-name" label="Full name" required error={errors.customerName}>
                        <input
                          id="calc-name"
                          value={form.customerName}
                          onChange={(e) => setField("customerName", e.target.value)}
                          maxLength={100}
                          className={errors.customerName ? errorInputClass : inputClass}
                          placeholder="Your name"
                        />
                      </Field>
                      <Field id="calc-phone" label="Phone number" required error={errors.phone}>
                        <input
                          id="calc-phone"
                          inputMode="tel"
                          value={form.phone}
                          onChange={(e) => setField("phone", e.target.value)}
                          maxLength={20}
                          className={errors.phone ? errorInputClass : inputClass}
                          placeholder="98XXXXXXXX"
                        />
                      </Field>
                      <Field id="calc-email" label="Email" error={errors.email}>
                        <input
                          id="calc-email"
                          type="email"
                          value={form.email}
                          onChange={(e) => setField("email", e.target.value)}
                          maxLength={255}
                          className={errors.email ? errorInputClass : inputClass}
                          placeholder="you@example.com"
                        />
                      </Field>
                      <Field id="calc-location" label="Project location" required error={errors.location}>
                        <input
                          id="calc-location"
                          value={form.location}
                          onChange={(e) => setField("location", e.target.value)}
                          maxLength={120}
                          className={errors.location ? errorInputClass : inputClass}
                          placeholder="Kathmandu"
                        />
                      </Field>
                      <Field id="calc-projectType" label="Project type" required error={errors.projectType}>
                        <select
                          id="calc-projectType"
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
                        <Field id="calc-notes" label="Additional requirements">
                          <textarea
                            id="calc-notes"
                            rows={4}
                            maxLength={1000}
                            value={form.additionalRequirements}
                            onChange={(e) => setField("additionalRequirements", e.target.value)}
                            className={`${inputClass} resize-y`}
                            placeholder="Finish preference, timeline, site details…"
                          />
                        </Field>
                      </div>
                    </div>
                  </div>
                </div>

                {/* RIGHT: sticky summary */}
                <aside className="lg:sticky lg:top-28 lg:self-start">
                  <div className="border border-hairline bg-background p-7 md:p-9">
                    <h3 className="text-xl tracking-tight">Your selection</h3>

                    <dl className="mt-7 space-y-4 text-sm">
                      <Row label="Railing" value={`${selectedProduct.code} — ${selectedProduct.name}`} />
                      <Row label="Material" value={selectedProduct.material} />
                      <Row label="Quantity" value={isCustom ? (numericQty > 0 ? String(Math.floor(numericQty)) : "To be confirmed") : String(estimate.quantity || 0)} />
                      <Row
                        label="Area / unit"
                        value={isCustom ? "To be confirmed" : `${estimate.area || 0} sq.ft.`}
                      />
                      <Row
                        label="Total area"
                        value={isCustom ? "To be confirmed" : `${estimate.totalArea || 0} sq.ft.`}
                      />
                      <Row
                        label="Rate"
                        value={
                          isCustom
                            ? "Custom"
                            : `${formatNPR(selectedProduct.pricePerSqft, settings.currency)} / sq.ft.`
                        }
                      />
                      <Row label="Customer" value={form.customerName || "—"} />
                      <Row label="Phone" value={form.phone || "—"} />
                      <Row label="Location" value={form.location || "—"} />
                      <Row label="Project type" value={form.projectType || "—"} />
                    </dl>

                    <div className="mt-7 border-t border-hairline pt-7">
                      <p className="label-xs text-muted-foreground">Estimated total</p>
                      <p className="mt-2 text-3xl font-semibold tracking-tight">
                        {isCustom ? (
                          <span className="text-2xl">Custom Quote</span>
                        ) : (
                          <AnimatedTotal value={estimate.total} currency={settings.currency} />
                        )}
                      </p>
                    </div>

                    <div className="mt-8 flex flex-col gap-3">
                      <button
                        type="button"
                        onClick={() => handleSubmit(true)}
                        className="flex items-center justify-center gap-2.5 bg-charcoal px-7 py-4 text-[0.72rem] tracking-[0.2em] text-ivory uppercase transition-colors duration-300 hover:bg-bronze"
                      >
                        <MessageCircle className="h-4 w-4" />
                        {isCustom ? "Request Custom Quote" : "Send via WhatsApp"}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSubmit(false)}
                        className="flex items-center justify-center gap-2.5 border border-hairline px-7 py-4 text-[0.72rem] tracking-[0.2em] uppercase transition-colors duration-300 hover:border-foreground/40"
                      >
                        <Send className="h-3.5 w-3.5" />
                        Send Request
                      </button>
                    </div>

                    <p className="mt-5 text-[0.7rem] leading-relaxed text-muted-foreground">
                      Enquiries are stored on this device. WhatsApp is the fastest way to reach our team.
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
                          <Check className="h-4 w-4" strokeWidth={2.5} />
                        </motion.span>
                        <div>
                          <p className="text-sm tracking-tight">Requirement recorded</p>
                          <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                            Reference {submitted.id.slice(-6).toUpperCase()} · saved on this device. Our
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
                  Estimated price. Final pricing may vary depending on site conditions, final dimensions,
                  material selection, fabrication requirements, installation conditions and final
                  measurements.
                </p>
              </Reveal>
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
    <div className="flex items-start justify-between gap-6 border-b border-hairline pb-3 last:border-0">
      <dt className="label-xs shrink-0 text-muted-foreground">{label}</dt>
      <dd className="text-right text-sm">{value}</dd>
    </div>
  );
}
