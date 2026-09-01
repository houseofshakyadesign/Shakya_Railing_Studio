import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  MessageCircle,
  Send,
  ArrowRight,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { AnimatedTotal } from "@/components/AnimatedTotal";
import { FinalCTA } from "@/components/FinalCTA";
import { errorInputClass, Field, inputClass } from "@/components/FormField";
import { ProductGrid } from "@/components/ProductGrid";
import { EASE } from "@/components/Reveal";
import type { Product } from "@/data/products";
import { useStudio, type Enquiry } from "@/hooks/useStudio";
import { calculateRailingEstimate, formatArea } from "@/utils/calculations";
import { formatNPR } from "@/utils/currency";
import { openWhatsApp } from "@/utils/whatsapp";
import { isRailingProduct } from "@/components/ProductCard";

const title = "The Collection | Metal Work Nepal";
const description =
  "Explore handcrafted railings, architectural metal structures and bespoke work crafted for contemporary spaces by Metal Work Nepal.";

type CollectionSearch = {
  category?: string | undefined;
};

export const Route = createFileRoute("/collection/")({
  validateSearch: (search: Record<string, unknown>): CollectionSearch => ({
    category: typeof search["category"] === "string" ? (search["category"] as string) : undefined,
  }),
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
      { rel: "canonical", href: "https://shakya-railing-studio.vercel.app/collection" },
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
  Record<"customerName" | "phone" | "email" | "location" | "projectType" | "length", string>
>;

const PHONE_RE = /^(?:\+?977[-\s]?)?9[678]\d{8}$/;

function CollectionPage() {
  const search = Route.useSearch();
  const initialCategory = useMemo(() => {
    const raw = (search.category || "").toLowerCase();
    if (raw === "railings" || raw === "railing") return "railings";
    if (raw.includes("structure") || raw.includes("glass") || raw.includes("gate")) return "metal_structures";
    if (raw.includes("furniture")) return "furniture";
    if (raw.includes("custom")) return "custom";
    return "all";
  }, [search.category]);

  const {
    selectedProduct,
    selectProduct,
    products,
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

  // Active products filter (railings prioritised first)
  const activeProducts = useMemo(() => {
    return products
      .filter((p) => p.isActive !== false)
      .sort((a, b) => {
        const aIsRailing = isRailingProduct(a);
        const bIsRailing = isRailingProduct(b);
        if (aIsRailing && !bIsRailing) return -1;
        if (!aIsRailing && bIsRailing) return 1;
        return (a.displayOrder || 0) - (b.displayOrder || 0);
      });
  }, [products]);

  // Selected railing to use in calculator (null if deselected)
  const productToUse = useMemo(() => {
    return selectedProduct;
  }, [selectedProduct]);

  // Measurements
  const [length, setLength] = useState<string>("20");

  const [showFormula, setShowFormula] = useState(false);

  // Form state
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState<Enquiry | null>(null);

  const numLength = parseFloat(length);
  const isCustom = Boolean(productToUse?.isCustom);

  const estimate = useMemo(() => {
    const validLength = Number.isFinite(numLength) && numLength > 0 ? numLength : 0;
    const rate = productToUse?.pricePerSqft ?? 0;
    const typeLabel = railingType === "staircase" ? "Staircase Railing" : "Balcony Railing";

    return calculateRailingEstimate(validLength, currentStandardHeight, rate, isCustom, typeLabel);
  }, [numLength, currentStandardHeight, productToUse, isCustom, railingType]);

  // Handle #calculator hash navigation on mount or URL change
  useEffect(() => {
    if (typeof window !== "undefined" && window.location.hash === "#calculator") {
      setTimeout(() => {
        const el = document.getElementById("calculator");
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
        setTimeout(() => {
          lengthInputRef.current?.focus();
        }, 400);
      }, 250);
    }
  }, []);

  // Called when a product card's "Select & Calculate" is clicked
  const handleAfterSelect = useCallback(
    (p: Product) => {
      selectProduct(p.id);
      setLength("20");
      setErrors({});
      setSubmitted(null);

      // Show inline confirmation
      setJustSelected(true);
      setTimeout(() => setJustSelected(false), 4500);

      // Smooth-scroll to calculator section
      setTimeout(() => {
        const el = document.getElementById("calculator");
        if (el) {
          el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
        setTimeout(() => {
          lengthInputRef.current?.focus();
        }, 400);
      }, 100);
    },
    [selectProduct],
  );

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
    if (!productToUse) return null;
    return {
      customerName: form.customerName.trim(),
      phone: form.phone.trim(),
      email: form.email.trim(),
      location: form.location.trim(),
      projectType: form.projectType,
      railingType: railingType === "staircase" ? "Staircase Railing" : "Balcony Railing",
      productId: productToUse.id,
      productCode: productToUse.code,
      productName: productToUse.name,
      material: productToUse.material,
      isCustom,
      lengthFt: estimate.length,
      heightFt: currentStandardHeight,
      estimatedAreaSqft: estimate.area,
      rate: isCustom ? 0 : (productToUse.pricePerSqft ?? 0),
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
      {/* ── 01 HERO / INTRODUCTION ── */}
      <section className="mx-auto max-w-[1440px] px-5 pt-36 pb-12 md:px-10 md:pt-48 md:pb-16">
        <div className="max-w-3xl">
          <p className="label-xs text-bronze font-semibold uppercase tracking-[0.24em]">
            THE COLLECTION
          </p>
          <h1 className="mt-4 text-4xl font-extrabold tracking-tight leading-[1.08] sm:text-5xl md:text-6xl uppercase text-foreground">
            Metalwork crafted for
            <br />
            <span className="font-serif italic font-normal text-bronze lowercase">remarkable</span>{" "}
            spaces.
          </h1>
          <p className="mt-6 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base md:text-lg">
            Explore handcrafted railings, architectural metal structures and bespoke work by Metal Work Nepal.
          </p>
        </div>
      </section>

      {/* ── 02 MASTER CATALOGUE GRID ── */}
      <section className="mx-auto max-w-[1440px] px-5 pb-24 md:px-10 md:pb-32">
        <ProductGrid initialCategory={initialCategory} onAfterSelect={handleAfterSelect} />
      </section>

      {/* ── INLINE CALCULATOR ── */}
      <section
        ref={calcRef}
        id="calculator"
        className="scroll-mt-24 border-t border-hairline bg-sand/40"
      >
        <div className="mx-auto max-w-[1440px] px-5 py-20 md:px-10 md:py-28">
          {!productToUse ? (
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
              {/* Selection confirmation banner */}
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
                        Great choice. Configure your railing dimensions below.
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {productToUse.code} — {productToUse.displayName || productToUse.name}
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
                  Choose your application type and enter the approximate length. We automatically
                  determine standard heights and calculate your estimate.
                </p>
              </div>

              {/* Application Type Selector */}
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
                  <p className="mt-1 text-[0.7rem] text-muted-foreground">
                    Standard height: 2.8 ft
                  </p>
                </button>
              </div>

              <div className="mt-12 grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
                {/* LEFT: selected railing + measurements + form */}
                <div>
                  {/* Selected railing card with model switcher */}
                  <div className="flex flex-col gap-4 border border-hairline bg-background p-5 sm:flex-row sm:gap-5">
                    <img
                      src={productToUse.image}
                      alt={productToUse.name}
                      loading="lazy"
                      className="h-28 w-24 shrink-0 object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="label-xs text-bronze">{productToUse.code}</p>
                        <span className="text-[0.62rem] tracking-wider text-muted-foreground uppercase">
                          {railingType === "staircase" ? "Staircase" : "Balcony"}
                        </span>
                      </div>
                      {productToUse.nepaliName ? (
                        <p className="mt-1 text-xs font-medium text-bronze">
                          {productToUse.nepaliName}
                        </p>
                      ) : null}
                      <h3 className="mt-0.5 text-lg leading-snug tracking-tight">
                        {productToUse.displayName || productToUse.name}
                      </h3>
                      <p className="mt-1 text-xs text-muted-foreground">{productToUse.material}</p>
                      <p className="mt-3 text-sm font-semibold">
                        {isCustom
                          ? "Custom Quote"
                          : `${formatNPR(productToUse.pricePerSqft, settings.currency)} / sq.ft.`}
                      </p>

                      {/* In-place Model Switcher */}
                      <div className="mt-4 border-t border-hairline/80 pt-3">
                        <label
                          htmlFor="col-model-select"
                          className="block text-[0.65rem] font-bold tracking-wider uppercase text-muted-foreground"
                        >
                          SWITCH RAILING MODEL:
                        </label>
                        <div className="relative mt-1.5">
                          <select
                            id="col-model-select"
                            value={productToUse.id}
                            onChange={(e) => {
                              selectProduct(e.target.value);
                              setSubmitted(null);
                              toast.success("Railing model switched");
                            }}
                            className="w-full appearance-none border border-hairline bg-sand/30 px-3 py-2.5 pr-8 text-xs font-medium text-foreground focus:border-bronze focus:outline-none"
                          >
                            {activeProducts.filter(isRailingProduct).map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.code} — {p.nepaliName ? `${p.nepaliName} / ` : ""}{p.displayName || p.name} (
                                {p.isCustom
                                  ? "Custom Quote"
                                  : `${formatNPR(p.pricePerSqft, settings.currency)} / sq.ft.`}
                                )
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                        </div>
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
                              className={`w-full border bg-background px-4 py-3.5 pr-12 text-lg font-semibold tracking-tight ${
                                errors.length
                                  ? "border-destructive text-destructive"
                                  : "border-hairline"
                              } focus:border-bronze focus:outline-none`}
                            />
                            <span className="pointer-events-none absolute right-4 text-xs font-medium tracking-wider text-muted-foreground uppercase">
                              FT
                            </span>
                          </div>
                          {errors.length && (
                            <p className="mt-2 text-xs text-destructive">{errors.length}</p>
                          )}
                        </div>
                      </div>

                      {/* Standard Height (Auto-calculated, read-only) */}
                      <div className="flex flex-col justify-between border border-hairline bg-card/60 p-5">
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="block text-[0.72rem] font-medium tracking-[0.16em] text-foreground uppercase">
                              STANDARD HEIGHT
                            </span>
                            <span className="inline-flex items-center gap-1 rounded-sm bg-sand px-2 py-0.5 text-[0.62rem] font-bold tracking-wider text-bronze uppercase">
                              <Check className="h-3 w-3" /> Auto
                            </span>
                          </div>
                          <p className="mt-1 text-[0.7rem] text-muted-foreground">
                            Standard height used for this estimate.
                          </p>
                        </div>
                        <div className="mt-4 flex items-center justify-between border border-hairline/60 bg-background/80 px-4 py-3.5">
                          <span className="text-lg font-semibold tracking-tight text-foreground">
                            {currentStandardHeight}
                          </span>
                          <span className="text-xs font-medium tracking-wider text-muted-foreground uppercase">
                            FT
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Formula Explanation Accordion */}
                    <div className="mt-6 border-t border-hairline pt-4">
                      <button
                        type="button"
                        onClick={() => setShowFormula(!showFormula)}
                        className="flex w-full items-center justify-between text-left text-xs font-medium text-muted-foreground hover:text-foreground"
                      >
                        <span className="inline-flex items-center gap-1.5">
                          <HelpCircle className="h-3.5 w-3.5 text-bronze" />
                          How is the price calculated?
                        </span>
                        {showFormula ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </button>

                      {showFormula && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          className="mt-3 rounded-sm bg-sand/60 p-4 text-xs text-muted-foreground leading-relaxed space-y-2"
                        >
                          <p>
                            <strong>Area Formula:</strong> {estimate.length || 0} ft (Length) ×{" "}
                            {currentStandardHeight} ft (Standard Height) ={" "}
                            <strong>{formatArea(estimate.area)}</strong>
                          </p>
                          {!isCustom && (
                            <p>
                              <strong>Price:</strong> {formatArea(estimate.area)} ×{" "}
                              {formatNPR(productToUse.pricePerSqft, settings.currency)} ={" "}
                              <strong>{formatNPR(estimate.total, settings.currency)}</strong>
                            </p>
                          )}
                          <p className="text-[0.68rem] text-muted-foreground/80 italic">
                            * Final exact measurements and site conditions will be reviewed during
                            site inspection.
                          </p>
                        </motion.div>
                      )}
                    </div>
                  </div>

                  {/* ENQUIRY FORM */}
                  <div className="mt-8 border border-hairline bg-background p-7 md:p-9">
                    <p className="label-xs text-bronze">03 YOUR DETAILS</p>
                    <h3 className="mt-2 text-2xl tracking-tight">Project Information</h3>
                    <p className="mt-2 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                      Enter your details below to receive a formal schedule or enquire instantly on
                      WhatsApp.
                    </p>

                    <div className="mt-8 grid gap-6 sm:grid-cols-2">
                      <Field id="col-name" label="Full name" required error={errors.customerName}>
                        <input
                          id="col-name"
                          type="text"
                          value={form.customerName}
                          onChange={(e) => setField("customerName", e.target.value)}
                          maxLength={80}
                          className={errors.customerName ? errorInputClass : inputClass}
                          placeholder="Your full name"
                        />
                      </Field>
                      <Field id="col-phone" label="Phone" required error={errors.phone}>
                        <input
                          id="col-phone"
                          type="tel"
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
                      <Field id="col-location" label="Project location" required error={errors.location}>
                        <input
                          id="col-location"
                          type="text"
                          value={form.location}
                          onChange={(e) => setField("location", e.target.value)}
                          maxLength={120}
                          className={errors.location ? errorInputClass : inputClass}
                          placeholder="Kathmandu / Area"
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
                      <div className="rounded-sm border border-hairline bg-sand/40 p-4">
                        <span className="block text-[0.68rem] font-bold tracking-[0.18em] text-muted-foreground uppercase">
                          ESTIMATED AREA
                        </span>
                        <p className="mt-1 text-2xl font-light tracking-tight text-foreground sm:text-3xl font-mono">
                          {formatArea(estimate.area)}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {estimate.length} ft × {currentStandardHeight} ft (
                          {railingType === "staircase" ? "Staircase" : "Balcony"})
                        </p>
                      </div>

                      {/* ESTIMATED PRICE */}
                      <div className="mt-4 rounded-sm border border-hairline bg-card p-4">
                        <span className="block text-[0.68rem] font-bold tracking-[0.18em] text-muted-foreground uppercase">
                          ESTIMATED PRICE
                        </span>
                        {isCustom ? (
                          <div className="mt-2">
                            <p className="text-xl font-medium tracking-tight text-bronze">
                              Price on Request
                            </p>
                            <p className="mt-1 text-xs text-muted-foreground">
                              Custom profile fabricated to exact site requirements.
                            </p>
                          </div>
                        ) : (
                          <div className="mt-2">
                            <div className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                              <AnimatedTotal value={estimate.total} currency={settings.currency} />
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                              Calculated at {formatNPR(productToUse.pricePerSqft, settings.currency)} / sq.ft.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Detailed Parameters List */}
                    <dl className="mt-7 space-y-3 border-t border-hairline pt-6 text-sm">
                      <Row
                        label="Railing Type"
                        value={
                          railingType === "staircase" ? "Staircase Railing" : "Balcony Railing"
                        }
                      />
                      <Row
                        label="Railing"
                        value={`${productToUse.code} — ${productToUse.displayName || productToUse.name}`}
                      />
                      <Row label="Material" value={productToUse.material} />
                      <Row label="Length" value={`${estimate.length || 0} ft`} />
                      <Row label="Standard Height" value={`${currentStandardHeight} ft`} />
                      {!isCustom && (
                        <>
                          <Row
                            label="Rate"
                            value={`${formatNPR(productToUse.pricePerSqft, settings.currency)} / sq.ft.`}
                          />
                          <Row
                            label="Estimated Total"
                            value={formatNPR(estimate.total, settings.currency)}
                          />
                        </>
                      )}
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
                      Directly connected to Metal Work Nepal studio database. WhatsApp opens with
                      your calculation pre-filled.
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
