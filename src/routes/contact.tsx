import { createFileRoute, Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  Clock,
  ExternalLink,
  Instagram,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  Sparkles,
  Video,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { FinalCTA } from "@/components/FinalCTA";
import { errorInputClass, Field, inputClass } from "@/components/FormField";
import { EASE, Reveal, SectionHeading } from "@/components/Reveal";
import { useStudio, type Enquiry } from "@/hooks/useStudio";
import { openWhatsApp } from "@/utils/whatsapp";

const title = "Contact & Enquiry | Metal Work Nepal";
const description =
  "Contact Metal Work Nepal for bespoke architectural metalwork, custom railings, staircases, and gates. Studio & workshop located at Sita Complex, Imadole, Lalitpur.";

type ContactSearch = {
  type?: string | undefined;
};

export const Route = createFileRoute("/contact")({
  validateSearch: (search: Record<string, unknown>): ContactSearch => ({
    type: typeof search["type"] === "string" ? (search["type"] as string) : undefined,
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
      { rel: "canonical", href: "https://shakya-railing-studio.vercel.app/contact" },
    ],
  }),
  component: ContactPage,
});

const PROJECT_TYPE_OPTIONS = [
  "Staircase Railing",
  "Balcony / Loft Railing",
  "Gate",
  "Grille",
  "Other Architectural Metalwork",
] as const;

type FormState = {
  fullName: string;
  phone: string;
  projectType: string;
  location: string;
  message: string;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

function ContactPage() {
  const { settings, addEnquiry } = useStudio();
  const search = Route.useSearch();

  const [form, setForm] = useState<FormState>({
    fullName: "",
    phone: "",
    projectType:
      search.type === "staircase"
        ? "Staircase Railing"
        : search.type === "balcony"
        ? "Balcony / Loft Railing"
        : "Staircase Railing",
    location: "",
    message: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedEnquiry, setSubmittedEnquiry] = useState<Enquiry | null>(null);

  const waHref = `https://wa.me/${settings.whatsappNumber.replace(/\D/g, "")}`;
  const mapSearchHref = "https://www.google.com/maps/search/?api=1&query=Sita+Complex+Imadole+Lalitpur+Nepal";
  const mapEmbedUrl = "https://maps.google.com/maps?q=Sita%20Complex%2C%20Imadole%2C%20Lalitpur%2C%20Nepal&t=&z=16&ie=UTF8&iwloc=&output=embed";

  const directChannels = [
    {
      icon: MessageCircle,
      channel: "WHATSAPP",
      title: "Direct WhatsApp",
      value: settings.phone,
      action: "Message the studio →",
      href: waHref,
      target: "_blank",
      badge: "Fastest response",
    },
    {
      icon: Phone,
      channel: "PHONE",
      title: "Direct Phone",
      value: settings.phone,
      action: "Call the studio →",
      href: `tel:${settings.phone}`,
      target: undefined,
      badge: "Sun – Fri",
    },
    {
      icon: Mail,
      channel: "EMAIL",
      title: "Official Email",
      value: settings.email,
      action: "Send an email →",
      href: `mailto:${settings.email}`,
      target: undefined,
      badge: "Formal Quotes",
    },
    {
      icon: MapPin,
      channel: "STUDIO",
      title: "Workshop & Studio",
      value: "Sita Complex, Imadole, Lalitpur",
      action: "View on map →",
      href: mapSearchHref,
      target: "_blank",
      badge: "Visits Welcome",
    },
    {
      icon: Instagram,
      channel: "INSTAGRAM",
      title: "Instagram",
      value: "@metalwork.nepal",
      action: "Follow studio reels →",
      href: settings.instagram,
      target: "_blank",
      badge: "Portfolio",
    },
    {
      icon: Video,
      channel: "TIKTOK",
      title: "TikTok",
      value: "@metalworknepal",
      action: "Watch workshop forge →",
      href: settings.tiktok,
      target: "_blank",
      badge: "Behind scenes",
    },
  ];

  const setField = (field: keyof FormState, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: "" }));
  };

  const validate = (): boolean => {
    const nextErrors: FormErrors = {};

    if (!form.fullName.trim()) {
      nextErrors.fullName = "Please enter your full name.";
    }

    if (!form.phone.trim()) {
      nextErrors.phone = "Please enter your phone or WhatsApp number.";
    } else {
      const cleanPhone = form.phone.trim().replace(/\s|-/g, "");
      if (cleanPhone.length < 7) {
        nextErrors.phone = "Please enter a valid phone number (e.g. 9843935689).";
      }
    }

    if (!form.projectType) {
      nextErrors.projectType = "Please select a project type.";
    }

    if (!form.location.trim()) {
      nextErrors.location = "Please enter the project location.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("Please fill in the required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const height = form.projectType.toLowerCase().includes("staircase") ? 2.8 : 3.0;

      const enquiryData = {
        customerName: form.fullName.trim(),
        phone: form.phone.trim(),
        email: "",
        location: form.location.trim(),
        projectType: form.projectType,
        railingType: form.projectType,
        productId: "custom",
        productCode: "ENQUIRY",
        productName: form.projectType,
        material: "Hand-forged Wrought Iron",
        isCustom: true,
        lengthFt: 0,
        heightFt: height,
        estimatedAreaSqft: 0,
        rate: 0,
        estimatedPrice: 0,
        estimatedTotal: 0,
        additionalRequirements: form.message.trim(),
      };

      const recorded = addEnquiry(enquiryData);
      setSubmittedEnquiry(recorded);
      toast.success("Enquiry sent successfully", {
        description: `Reference #${recorded.id.slice(-6).toUpperCase()} saved to studio database.`,
      });
    } catch {
      toast.error("Failed to submit enquiry. Please try WhatsApp directly.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* ── 01 HERO / INTRODUCTION ── */}
      <section className="mx-auto max-w-[1440px] px-5 pt-36 pb-12 md:px-10 md:pt-48 md:pb-16">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8">
          <div className="max-w-3xl">
            <p className="label-xs text-bronze font-semibold uppercase tracking-[0.24em]">
              01 CONTACT & ENQUIRY
            </p>
            <h1 className="mt-4 text-4xl font-extrabold tracking-tight leading-[1.08] sm:text-5xl md:text-6xl uppercase">
              LET'S TALK ABOUT
              <br />
              <span className="font-serif italic font-normal text-bronze lowercase">your</span> NEXT RAILING.
            </h1>
            <p className="mt-6 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base md:text-lg">
              Tell us what you're planning. We'll help you choose the right design, calculate an accurate estimate, and coordinate fabrication from our Sita Complex studio.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <span className="inline-flex items-center gap-2 border border-hairline bg-sand/60 px-3.5 py-2 text-xs font-semibold text-foreground">
              <MapPin className="h-3.5 w-3.5 text-bronze" />
              Sita Complex, Imadole
            </span>
            <span className="inline-flex items-center gap-2 border border-hairline bg-sand/60 px-3.5 py-2 text-xs font-semibold text-foreground">
              <ShieldCheck className="h-3.5 w-3.5 text-bronze" />
              Direct Workshop
            </span>
          </div>
        </div>
      </section>

      {/* ── 02 PRIMARY ENQUIRY FORM & STUDIO MAP (ON TOP) ── */}
      <section className="border-t border-hairline bg-sand/30 py-16 md:py-24">
        <div className="mx-auto max-w-[1440px] px-5 md:px-10">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-[1.18fr_0.82fr] lg:gap-12 xl:gap-16 items-start">
            
            {/* LEFT COLUMN: PRIMARY ENQUIRY FORM */}
            <div>
              <div className="border border-hairline bg-background p-7 sm:p-10 md:p-12 shadow-soft">
                <AnimatePresence mode="wait">
                  {submittedEnquiry ? (
                    /* ── SUCCESS STATE ── */
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -12 }}
                      transition={{ duration: 0.4, ease: EASE }}
                      className="py-6 text-center sm:py-10"
                    >
                      <motion.div
                        initial={{ scale: 0.6 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.35, ease: EASE }}
                        className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-success/15 text-success"
                      >
                        <Check className="h-8 w-8 stroke-[2.5]" />
                      </motion.div>

                      <p className="label-xs mt-6 text-bronze uppercase tracking-[0.22em]">
                        01 ENQUIRY RECEIVED
                      </p>
                      <h2 className="mt-3 text-3xl font-extrabold tracking-tight md:text-4xl">
                        Thank you, {submittedEnquiry.customerName}.
                      </h2>
                      <p className="mx-auto mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
                        We've received your project enquiry and will get back to you shortly with next steps and fabrication details.
                      </p>

                      <div className="mx-auto mt-8 max-w-sm border border-hairline bg-card p-4 text-left text-xs">
                        <div className="flex justify-between border-b border-hairline pb-2">
                          <span className="text-muted-foreground uppercase">Reference</span>
                          <span className="font-mono font-bold">
                            #{submittedEnquiry.id.slice(-6).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex justify-between border-b border-hairline py-2">
                          <span className="text-muted-foreground uppercase">Project Type</span>
                          <span className="font-semibold">{submittedEnquiry.projectType}</span>
                        </div>
                        <div className="flex justify-between border-b border-hairline py-2">
                          <span className="text-muted-foreground uppercase">Location</span>
                          <span>{submittedEnquiry.location}</span>
                        </div>
                        <div className="flex justify-between pt-2">
                          <span className="text-muted-foreground uppercase">Status</span>
                          <span className="text-bronze font-bold uppercase">{submittedEnquiry.status}</span>
                        </div>
                      </div>

                      <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                          to="/collection"
                          className="w-full sm:w-auto bg-charcoal px-8 py-4 text-[0.72rem] font-bold tracking-[0.2em] text-ivory uppercase transition-colors hover:bg-bronze"
                        >
                          Back to Collection
                        </Link>
                        <button
                          type="button"
                          onClick={() => openWhatsApp(submittedEnquiry, settings.whatsappNumber, settings.currency)}
                          className="w-full sm:w-auto flex items-center justify-center gap-2.5 border border-hairline px-8 py-4 text-[0.72rem] font-bold tracking-[0.2em] uppercase transition-colors hover:border-bronze hover:text-bronze"
                        >
                          <MessageCircle className="h-4 w-4" />
                          Chat on WhatsApp
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setSubmittedEnquiry(null);
                          setForm({
                            fullName: "",
                            phone: "",
                            projectType: "Staircase Railing",
                            location: "",
                            message: "",
                          });
                        }}
                        className="mt-8 text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
                      >
                        Submit another enquiry
                      </button>
                    </motion.div>
                  ) : (
                    /* ── ENQUIRY FORM ── */
                    <motion.div
                      key="form"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <p className="label-xs text-bronze uppercase tracking-[0.22em]">
                            START YOUR PROJECT
                          </p>
                          <Link
                            to="/calculator"
                            className="text-[0.68rem] font-bold tracking-wider text-bronze uppercase underline underline-offset-4 hover:text-foreground"
                          >
                            Calculate Estimate →
                          </Link>
                        </div>
                        <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
                          Send an Enquiry
                        </h2>
                        <p className="mt-2 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                          Fill out the essential project details below or use our calculator to get an instant estimate.
                        </p>
                      </div>

                      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                        <div className="grid gap-6 sm:grid-cols-2">
                          {/* Full Name */}
                          <Field id="contact-name" label="Full Name" required error={errors.fullName}>
                            <input
                              id="contact-name"
                              value={form.fullName}
                              onChange={(e) => setField("fullName", e.target.value)}
                              maxLength={100}
                              className={errors.fullName ? errorInputClass : inputClass}
                              placeholder="Your Full Name"
                            />
                          </Field>

                          {/* Phone / WhatsApp */}
                          <Field id="contact-phone" label="Phone / WhatsApp" required error={errors.phone}>
                            <input
                              id="contact-phone"
                              type="tel"
                              inputMode="tel"
                              value={form.phone}
                              onChange={(e) => setField("phone", e.target.value)}
                              maxLength={25}
                              className={errors.phone ? errorInputClass : inputClass}
                              placeholder="e.g. 98XXXXXXXX"
                            />
                          </Field>
                        </div>

                        <div className="grid gap-6 sm:grid-cols-2">
                          {/* Project Type */}
                          <Field id="contact-type" label="Project Type" required error={errors.projectType}>
                            <select
                              id="contact-type"
                              value={form.projectType}
                              onChange={(e) => setField("projectType", e.target.value)}
                              className={errors.projectType ? errorInputClass : inputClass}
                            >
                              {PROJECT_TYPE_OPTIONS.map((opt) => (
                                <option key={opt} value={opt}>
                                  {opt}
                                </option>
                              ))}
                            </select>
                          </Field>

                          {/* Project Location */}
                          <Field id="contact-loc" label="Project Location" required error={errors.location}>
                            <input
                              id="contact-loc"
                              value={form.location}
                              onChange={(e) => setField("location", e.target.value)}
                              maxLength={120}
                              className={errors.location ? errorInputClass : inputClass}
                              placeholder="Project Location / Area"
                            />
                          </Field>
                        </div>

                        {/* Project Details / Message */}
                        <Field id="contact-msg" label="Project Details / Notes" hint="Optional — design preference, length in ft, or questions">
                          <textarea
                            id="contact-msg"
                            rows={4}
                            maxLength={1000}
                            value={form.message}
                            onChange={(e) => setField("message", e.target.value)}
                            className={`${inputClass} resize-y`}
                            placeholder="Tell us about the design style, approximate length, or anything specific..."
                          />
                        </Field>

                        {/* Submit Button & Actions */}
                        <div className="pt-2">
                          <button
                            type="submit"
                            disabled={isSubmitting}
                            className="group flex w-full items-center justify-center gap-3 bg-charcoal px-8 py-4 text-[0.74rem] font-bold tracking-[0.22em] text-ivory uppercase transition-all duration-300 hover:bg-bronze disabled:opacity-50"
                          >
                            {isSubmitting ? (
                              <span>SENDING...</span>
                            ) : (
                              <>
                                <span>SEND ENQUIRY</span>
                                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                              </>
                            )}
                          </button>

                          {/* Secondary WhatsApp CTA */}
                          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-hairline/60 pt-4 text-xs text-muted-foreground">
                            <span>Prefer to message directly?</span>
                            <a
                              href={waHref}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 font-bold tracking-wider text-bronze uppercase hover:underline"
                            >
                              <MessageCircle className="h-3.5 w-3.5" />
                              CHAT ON WHATSAPP →
                            </a>
                          </div>
                        </div>
                      </form>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* RIGHT COLUMN: STUDIO INFO & INTERACTIVE MAP */}
            <div className="flex flex-col space-y-6 w-full">
              
              {/* Studio Information Box */}
              <div className="border border-hairline bg-background p-7 sm:p-8">
                <div className="flex items-center gap-2.5">
                  <MapPin className="h-4 w-4 text-bronze" />
                  <p className="label-xs text-bronze font-semibold uppercase tracking-[0.2em]">
                    VISIT THE STUDIO
                  </p>
                </div>

                <h3 className="mt-3 text-2xl font-bold tracking-tight">
                  Sita Complex Studio & Workshop
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                  Sita Complex, Imadole, Lalitpur, Nepal
                </p>

                <div className="mt-6 space-y-3 border-t border-hairline pt-5 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2.5">
                    <Clock className="h-3.5 w-3.5 text-bronze" />
                    <span>Sunday – Friday: 9:00 AM – 6:00 PM</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Phone className="h-3.5 w-3.5 text-bronze" />
                    <span>Direct line: {settings.phone}</span>
                  </div>
                </div>

                <div className="mt-6">
                  <a
                    href={mapSearchHref}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 bg-sand px-5 py-3 text-[0.68rem] font-bold tracking-[0.18em] text-foreground uppercase transition-colors hover:bg-bronze hover:text-ivory"
                  >
                    VIEW ON GOOGLE MAPS →
                  </a>
                </div>
              </div>

              {/* Embedded Interactive Map in full color */}
              <div className="relative min-h-[300px] sm:min-h-[340px] flex-1 overflow-hidden border border-hairline bg-card shadow-soft">
                <iframe
                  title="Metal Work Nepal Studio Location at Sita Complex, Imadole"
                  src={mapEmbedUrl}
                  className="absolute inset-0 h-full w-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  aria-label="Map location of Metal Work Nepal at Sita Complex, Imadole, Lalitpur"
                />
              </div>

              {/* Studio Craft Trust Note */}
              <div className="border border-hairline/70 bg-sand/50 p-5">
                <div className="flex items-start gap-3">
                  <Sparkles className="h-4 w-4 text-bronze shrink-0 mt-0.5" />
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    All hand-forged scrollwork, custom fitting, red-oxide primer, and matt deco finishes are fabricated in-house at our Sita Complex facility.
                  </p>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* ── 03 DIRECT CHANNELS & SOCIAL MEDIA (SHIFTED DOWN) ── */}
      <section className="mx-auto max-w-[1440px] px-5 py-20 md:px-10 md:py-28">
        <SectionHeading
          label="Direct Channels"
          title="Connect with the studio directly."
          intro="Choose your preferred channel for instant chat, inquiries, formal quote requests, or to explore our craft on social media."
        />

        <div className="mt-14 grid gap-px border border-hairline bg-hairline sm:grid-cols-2 lg:grid-cols-3">
          {directChannels.map((c, i) => (
            <Reveal
              key={c.channel}
              delay={i * 0.05}
              className="group relative flex flex-col justify-between bg-background p-7 transition-all duration-300 hover:bg-sand/40 sm:p-8"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="label-xs font-semibold tracking-[0.2em] text-bronze uppercase">
                    {c.channel}
                  </span>
                  <span className="text-[0.62rem] font-bold tracking-[0.14em] uppercase text-muted-foreground/80 bg-sand px-2 py-0.5">
                    {c.badge}
                  </span>
                </div>

                <h4 className="mt-4 text-lg font-bold tracking-tight text-foreground">
                  {c.title}
                </h4>

                <p className="mt-1 text-sm font-semibold tracking-tight text-muted-foreground sm:text-base">
                  {c.value}
                </p>
              </div>

              <div className="mt-6 border-t border-hairline/60 pt-4">
                <a
                  href={c.href}
                  target={c.target}
                  rel={c.target ? "noreferrer" : undefined}
                  className="inline-flex items-center gap-2 text-[0.7rem] font-bold tracking-[0.18em] text-bronze uppercase transition-colors hover:text-foreground"
                >
                  {c.action}
                  {c.target && <ExternalLink className="h-3 w-3" />}
                </a>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── 04 "FASTEST ROUTE" CALCULATOR CTA ── */}
      <section className="mx-auto max-w-[1440px] px-5 pb-20 md:px-10 md:pb-28">
        <div className="relative overflow-hidden border border-hairline bg-charcoal p-8 sm:p-12 md:p-16 text-ivory">
          <div className="relative z-10 max-w-2xl">
            <p className="label-xs text-bronze-soft font-semibold uppercase tracking-[0.24em]">
              FASTEST ROUTE
            </p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl uppercase leading-tight">
              CALCULATE FIRST.
              <br />
              ENQUIRE WITH CONFIDENCE.
            </h2>
            <p className="mt-5 text-sm leading-relaxed text-ivory/70 sm:text-base">
              Enter your railing type and approximate length to get an instant per-sq.ft. price breakdown before sending your enquiry.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                to="/calculator"
                className="inline-flex items-center gap-2.5 bg-ivory px-8 py-4 text-[0.72rem] font-bold tracking-[0.2em] text-charcoal uppercase transition-all duration-300 hover:bg-bronze hover:text-ivory"
              >
                CALCULATE YOUR ESTIMATE →
              </Link>
              <Link
                to="/collection"
                className="inline-flex items-center gap-2 border border-ivory/30 px-6 py-4 text-[0.72rem] font-bold tracking-[0.18em] text-ivory uppercase transition-colors hover:border-ivory"
              >
                Browse Collection
              </Link>
            </div>
          </div>

          {/* Subtle architectural background accent */}
          <div className="pointer-events-none absolute -right-16 -bottom-16 h-64 w-64 rounded-full bg-bronze/10 blur-3xl" />
        </div>
      </section>

      {/* ── 05 FINAL CTA ── */}
      <FinalCTA />
    </>
  );
}
