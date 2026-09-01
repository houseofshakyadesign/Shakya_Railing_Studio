import { Link, useNavigate } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Calculator,
  Compass,
  FileText,
  Hammer,
  Maximize2,
  MessageCircle,
  Phone,
  Sparkles,
  X,
  ChevronRight,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { EASE } from "@/components/Reveal";
import { isRailingProduct, isMetalStructureProduct, isFurnitureProduct } from "@/components/ProductCard";
import type { Product } from "@/data/products";
import { useStudio } from "@/hooks/useStudio";
import { formatNPR } from "@/utils/currency";
import { calculateRailingEstimate, formatArea } from "@/utils/calculations";
import { AnimatedTotal } from "@/components/AnimatedTotal";

export function CatalogueDetail({
  productSlugOrId,
}: {
  productSlugOrId: string;
}) {
  const { activeProducts, ready, settings, selectProduct, setRailingType } = useStudio();
  const navigate = useNavigate();

  // Find product by slug or id (case-insensitive)
  const product = useMemo(() => {
    if (!productSlugOrId) return null;
    const normalized = productSlugOrId.trim().toLowerCase();
    return (
      activeProducts.find(
        (p) =>
          (p.slug && p.slug.toLowerCase() === normalized) ||
          p.id.toLowerCase() === normalized,
      ) || null
    );
  }, [activeProducts, productSlugOrId]);

  // Gallery and active media state
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [showMobileStickyCta, setShowMobileStickyCta] = useState(false);

  // Live inline estimator state for railings
  const [calcLength, setCalcLength] = useState<string>("20");
  const [calcType, setCalcType] = useState<"balcony" | "staircase">("balcony");

  useEffect(() => {
    if (product) {
      if (
        product.application === "balcony" ||
        product.application === "balcony_loft" ||
        product.applications?.some(
          (a) =>
            a.toLowerCase().includes("balcony") ||
            a.toLowerCase().includes("loft") ||
            a.toLowerCase().includes("grille") ||
            a.toLowerCase().includes("window"),
        )
      ) {
        setCalcType("balcony");
      } else if (
        product.application === "staircase" ||
        product.applications?.some((a) => a.toLowerCase().includes("staircase"))
      ) {
        setCalcType("staircase");
      } else {
        setCalcType("balcony");
      }
    }
  }, [product]);

  const numCalcLength = parseFloat(calcLength);
  const liveEstimate = useMemo(() => {
    if (!product || !product.pricePerSqft) return null;
    const validL = Number.isFinite(numCalcLength) && numCalcLength > 0 ? numCalcLength : 0;
    const h = calcType === "staircase" ? 2.8 : 3.0;
    const typeLabel = calcType === "staircase" ? "Staircase Railing" : "Balcony Railing";
    return calculateRailingEstimate(validL, h, product.pricePerSqft, false, typeLabel);
  }, [product, numCalcLength, calcType]);

  // Scroll listener for mobile sticky CTA
  useEffect(() => {
    const handleScroll = () => {
      if (typeof window !== "undefined") {
        setShowMobileStickyCta(window.scrollY > 480);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [lightboxOpen]);

  // Loading skeleton while studio context hydrates
  if (!ready) {
    return <DetailSkeleton />;
  }

  // Refined 404 / unpublished state
  if (!product || product.isActive === false) {
    return (
      <div className="min-h-[75vh] flex flex-col items-center justify-center px-5 pt-36 pb-20 text-center bg-background">
        <div className="inline-grid h-16 w-16 place-items-center rounded-full bg-sand text-bronze mb-6 border border-hairline">
          <Compass className="h-7 w-7" />
        </div>
        <p className="label-xs text-bronze uppercase tracking-[0.24em] font-semibold">
          ARCHIVE NOT FOUND
        </p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground uppercase">
          DESIGN NOT FOUND
        </h1>
        <p className="mt-4 max-w-md text-sm text-muted-foreground leading-relaxed">
          This catalogue item may have been moved, archived, or is currently undergoing studio curation.
        </p>
        <Link
          to="/collection"
          className="mt-8 inline-flex items-center gap-2 bg-charcoal px-7 py-3.5 text-[0.72rem] font-bold tracking-[0.2em] text-ivory uppercase transition-colors hover:bg-bronze"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>BACK TO COLLECTION</span>
        </Link>
      </div>
    );
  }

  const isRailing = isRailingProduct(product);

  // Build media list (hero image + optional gallery items)
  const allImages = useMemo(() => {
    const list: string[] = [];
    if (product.image) list.push(product.image);
    if (Array.isArray(product.gallery)) {
      product.gallery.forEach((img) => {
        if (img && !list.includes(img)) list.push(img);
      });
    }
    return list;
  }, [product]);

  const currentImage = allImages[activeMediaIndex] || product.image;

  // Category & Application labels
  const applicationLabel =
    product.application === "staircase" ||
    product.applications?.some((a) => a.toLowerCase().includes("staircase"))
      ? "STAIRCASE"
      : product.application === "balcony" ||
          product.application === "balcony_loft" ||
          product.applications?.some(
            (a) => a.toLowerCase().includes("balcony") || a.toLowerCase().includes("loft"),
          )
        ? "BALCONY / LOFT"
        : product.applications?.[0]?.toUpperCase() || product.category?.toUpperCase() || "RAILING SYSTEM";

  const isFurniture = isFurnitureProduct(product);
  const disciplineCategory = isRailing
    ? "RAILINGS"
    : isFurniture
      ? "FURNITURE"
      : "METAL STRUCTURES";

  // Related products query (3-4 items from active catalogue, prefer same content type / category)
  const relatedProducts = useMemo(() => {
    return activeProducts
      .filter((p) => p.id !== product.id && p.isActive !== false)
      .filter((p) => {
        if (isRailing) return isRailingProduct(p);
        const cat = (p.category || "").toLowerCase();
        const curCat = (product.category || "").toLowerCase();
        return !isRailingProduct(p) || cat.includes(curCat) || curCat.includes(cat);
      })
      .slice(0, 3);
  }, [activeProducts, product, isRailing]);

  // Handoff Handlers
  const handleCalculateRailing = () => {
    selectProduct(product.id);
    toast.success(`${product.displayName || product.name} selected for calculation`, {
      description: "Transferring to studio calculator with dimensions.",
    });
    navigate({ to: "/calculator" });
  };

  const handleAskAboutDesign = () => {
    navigate({
      to: "/contact",
      search: {
        product: product.displayName || product.name,
        code: product.code,
        category: isRailing ? `Railing (${applicationLabel})` : disciplineCategory,
        type: product.application === "staircase" ? "staircase" : "balcony",
      },
    });
  };

  const handleRequestQuote = () => {
    navigate({
      to: "/contact",
      search: {
        product: product.displayName || product.name,
        code: product.code,
        category: disciplineCategory,
      },
    });
  };

  const handleWhatsApp = () => {
    const cleanNumber = settings.whatsappNumber.replace(/\D/g, "");
    let text = "";
    if (isRailing) {
      text = `Hello Metal Work Nepal, I am interested in the ${product.nepaliName ? `${product.nepaliName} / ` : ""}${product.displayName || product.name}${product.code ? ` (${product.code})` : ""}. I would like to know more about this design and request quotation details.`;
    } else {
      text = `Hello Metal Work Nepal, I am interested in the ${product.nepaliName ? `${product.nepaliName} / ` : ""}${product.displayName || product.name} (${product.name || disciplineCategory}). I would like to know more about this design and request a quotation.`;
    }
    window.open(`https://wa.me/${cleanNumber}?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-background pt-28 pb-24 md:pt-36 md:pb-32 selection:bg-bronze selection:text-ivory">
      {/* ── 01 MINIMAL ARCHITECTURAL BREADCRUMB & BACK LINK ── */}
      <div className="mx-auto max-w-[1440px] px-5 md:px-10 lg:px-16">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-hairline pb-5">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-2 text-[0.68rem] font-bold tracking-[0.2em] text-muted-foreground uppercase"
          >
            <Link
              to="/collection"
              className="transition-colors hover:text-foreground"
            >
              COLLECTION
            </Link>
            <ChevronRight className="h-3 w-3 text-hairline stroke-[2]" />
            <span className="text-muted-foreground">
              {isRailing ? "RAILINGS" : disciplineCategory}
            </span>
            <ChevronRight className="h-3 w-3 text-hairline stroke-[2]" />
            <span className="text-foreground truncate max-w-[200px] sm:max-w-none">
              {product.englishName || product.displayName || product.name}
            </span>
          </nav>

          <Link
            to="/collection"
            className="group inline-flex items-center gap-2 text-[0.7rem] font-bold tracking-[0.2em] text-muted-foreground uppercase transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-x-1" />
            <span>BACK TO COLLECTION</span>
          </Link>
        </div>
      </div>

      {/* ── 02 ASYMMETRICAL HERO SECTION ── */}
      <section className="mx-auto max-w-[1440px] px-5 pt-8 md:px-10 lg:px-16 md:pt-12">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-14 xl:gap-20 items-start">
          {/* LEFT: HERO MEDIA & GALLERY (7 cols on Desktop) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE }}
            className="lg:col-span-7 flex flex-col gap-4"
          >
            {/* Main Stage Media Container */}
            <div className="group relative aspect-[4/3] sm:aspect-[16/11] w-full overflow-hidden border border-hairline bg-sand shadow-soft">
              <img
                src={currentImage}
                alt={`${product.displayName || product.name} — Metal Work Nepal`}
                className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/30 via-transparent to-transparent pointer-events-none" />

              {/* Code & Category Tag */}
              <div className="absolute top-4 left-4 flex items-center gap-2 pointer-events-none">
                <span className="bg-background/90 backdrop-blur-md px-3 py-1.5 text-[0.64rem] font-bold tracking-[0.22em] text-foreground uppercase border border-hairline shadow-sm">
                  {product.code || "MWN"}
                </span>
                <span className="bg-sand/90 backdrop-blur-md px-3 py-1.5 text-[0.62rem] font-bold tracking-[0.2em] text-bronze uppercase border border-hairline shadow-sm">
                  {isRailing ? applicationLabel : disciplineCategory}
                </span>
              </div>

              {/* Lightbox / Zoom Action */}
              <button
                type="button"
                onClick={() => setLightboxOpen(true)}
                aria-label="Enlarge view"
                className="absolute bottom-4 right-4 inline-flex items-center gap-1.5 bg-background/90 backdrop-blur-md px-3 py-2 text-[0.62rem] font-bold tracking-[0.18em] text-foreground uppercase border border-hairline shadow-sm transition-all hover:bg-bronze hover:text-ivory"
              >
                <Maximize2 className="h-3.5 w-3.5" />
                <span>EXPAND</span>
              </button>
            </div>

            {/* Video Player (if video asset exists) */}
            {product.video ? (
              <div className="mt-2 overflow-hidden border border-hairline bg-charcoal shadow-soft">
                <div className="relative aspect-video w-full bg-black">
                  <video
                    key={product.video}
                    poster={product.image}
                    controls
                    playsInline
                    preload="metadata"
                    className="h-full w-full object-contain"
                  >
                    <source src={product.video} type="video/mp4" />
                    <source src={product.video.replace(/\.mov$/, ".mp4")} type="video/mp4" />
                    Your browser does not support HTML5 video.
                  </video>
                </div>
              </div>
            ) : null}

            {/* Thumbnail Gallery (rendered ONLY if multiple images exist) */}
            {allImages.length > 1 ? (
              <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-2">
                {allImages.map((img, idx) => (
                  <button
                    key={`${img}-${idx}`}
                    type="button"
                    onClick={() => setActiveMediaIndex(idx)}
                    className={`relative h-20 w-24 shrink-0 overflow-hidden border transition-all duration-200 ${
                      activeMediaIndex === idx
                        ? "border-bronze ring-1 ring-bronze shadow-sm"
                        : "border-hairline opacity-75 hover:opacity-100"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Thumbnail ${idx + 1}`}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            ) : null}
          </motion.div>

          {/* RIGHT: EDITORIAL PRODUCT METADATA & CTAS (5 cols on Desktop) */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: EASE }}
            className="lg:col-span-5 flex flex-col justify-start"
          >
            {/* Discipline Tag */}
            <div className="flex items-center gap-2">
              <span className="label-xs text-bronze uppercase tracking-[0.24em] font-semibold">
                {isRailing ? `RAILING SYSTEM • ${applicationLabel}` : disciplineCategory}
              </span>
            </div>

            {/* Dual Name Hierarchy */}
            <div className="mt-3">
              {product.nepaliName ? (
                <p className="text-2xl font-normal tracking-wide text-bronze font-serif md:text-3xl">
                  {product.nepaliName}
                </p>
              ) : null}

              <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl uppercase leading-[1.08]">
                {product.englishName || product.displayName || product.name}
              </h1>

              {product.name &&
              product.name !== (product.englishName || product.displayName) ? (
                <p className="mt-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                  {product.name}
                </p>
              ) : null}
            </div>

            {/* Application Strip (Railings Only) */}
            {isRailing ? (
              <div className="mt-5 flex items-center gap-2">
                <span className="text-[0.66rem] font-bold tracking-[0.2em] uppercase text-muted-foreground">
                  APPLICATION:
                </span>
                <span className="bg-sand px-3 py-1 text-[0.68rem] font-bold tracking-[0.18em] uppercase text-foreground border border-hairline">
                  {applicationLabel}
                </span>
              </div>
            ) : null}

            {/* Price & Live Calculation Area (Railings Only with valid price from MySQL) */}
            {isRailing ? (
              <div className="mt-6 border border-hairline bg-card p-5 sm:p-6 shadow-soft">
                <div className="flex items-baseline justify-between border-b border-hairline pb-3">
                  <span className="text-[0.68rem] font-bold tracking-[0.2em] uppercase text-muted-foreground">
                    UNIT PRICE (RATE)
                  </span>
                  <span className="inline-flex items-center gap-1 text-[0.62rem] font-bold tracking-[0.16em] uppercase text-bronze">
                    <Sparkles className="h-3 w-3" />
                    LIVE ESTIMATE
                  </span>
                </div>

                <div className="mt-3 flex items-baseline gap-2">
                  {product.pricePerSqft ? (
                    <>
                      <span className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
                        {formatNPR(product.pricePerSqft, settings.currency)}
                      </span>
                      <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                        / SQ.FT
                      </span>
                    </>
                  ) : (
                    <span className="text-lg font-bold text-foreground uppercase">
                      Custom Quote Basis
                    </span>
                  )}
                </div>

                {product.pricePerSqft && liveEstimate ? (
                  <div className="mt-5 border-t border-hairline/80 pt-4 space-y-4">
                    {/* Dimension inputs */}
                    <div>
                      <div className="flex items-center justify-between text-xs mb-2">
                        <label
                          htmlFor="detail-length"
                          className="font-semibold text-muted-foreground uppercase tracking-wider text-[0.68rem]"
                        >
                          Enter Running Length:
                        </label>
                        <span className="font-medium text-foreground text-xs">
                          {calcType === "staircase"
                            ? "2.8 ft H (Staircase)"
                            : "3.0 ft H (Balcony/Grille)"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                          <input
                            id="detail-length"
                            type="number"
                            min="1"
                            max="10000"
                            step="0.5"
                            value={calcLength}
                            onChange={(e) => setCalcLength(e.target.value)}
                            placeholder="20"
                            className="w-full border border-hairline bg-background px-3 py-2 text-sm font-mono focus:border-bronze focus:outline-none"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[0.65rem] font-bold text-muted-foreground uppercase">
                            FT
                          </span>
                        </div>
                        <div className="flex gap-1">
                          {["10", "20", "30", "50"].map((preset) => (
                            <button
                              key={preset}
                              type="button"
                              onClick={() => setCalcLength(preset)}
                              className={`border px-2.5 py-2 text-xs font-mono transition-colors ${
                                calcLength === preset
                                  ? "border-bronze bg-bronze/10 text-bronze font-semibold"
                                  : "border-hairline bg-sand/30 text-muted-foreground hover:text-foreground"
                              }`}
                            >
                              {preset}ft
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Calculated Amount Breakdown according to Unit Price */}
                    <div className="border border-bronze/20 bg-bronze/5 p-3.5 space-y-1.5 text-xs">
                      <div className="flex justify-between text-muted-foreground">
                        <span>Estimated Area:</span>
                        <span className="font-medium text-foreground font-mono">
                          {formatArea(liveEstimate.area)} ({liveEstimate.length}ft ×{" "}
                          {liveEstimate.height}ft)
                        </span>
                      </div>
                      <div className="flex justify-between items-baseline pt-1 border-t border-hairline/60">
                        <span className="text-[0.7rem] font-bold tracking-wider uppercase text-bronze">
                          ESTIMATED AMOUNT:
                        </span>
                        <span className="text-xl font-bold font-serif text-foreground">
                          <AnimatedTotal value={liveEstimate.total} currency={settings.currency} />
                        </span>
                      </div>
                      <p className="text-[0.65rem] text-muted-foreground text-right">
                        Calculated at {formatNPR(product.pricePerSqft, settings.currency)} / sq.ft.
                      </p>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : null}

            {/* Description Lead */}
            <div className="mt-6">
              <p className="text-sm leading-relaxed text-foreground/85 md:text-base font-normal">
                {product.description}
              </p>
            </div>

            {/* Primary & Secondary CTAs */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              {isRailing ? (
                <>
                  <button
                    type="button"
                    onClick={handleCalculateRailing}
                    className="flex-1 inline-flex items-center justify-center gap-2 bg-charcoal px-7 py-4 text-[0.72rem] font-bold tracking-[0.2em] text-ivory uppercase shadow-lift transition-all hover:bg-bronze hover:scale-[1.01]"
                  >
                    <Calculator className="h-4 w-4" />
                    <span>CALCULATE THIS RAILING →</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleAskAboutDesign}
                    className="inline-flex items-center justify-center gap-2 border border-foreground/30 bg-transparent px-6 py-4 text-[0.72rem] font-bold tracking-[0.18em] text-foreground uppercase transition-colors hover:border-bronze hover:text-bronze"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>ASK ABOUT DESIGN</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleRequestQuote}
                    className="flex-1 inline-flex items-center justify-center gap-2 bg-charcoal px-7 py-4 text-[0.72rem] font-bold tracking-[0.2em] text-ivory uppercase shadow-lift transition-all hover:bg-bronze hover:scale-[1.01]"
                  >
                    <span>REQUEST A QUOTE →</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>

                  <button
                    type="button"
                    onClick={handleWhatsApp}
                    className="inline-flex items-center justify-center gap-2 border border-foreground/30 bg-transparent px-6 py-4 text-[0.72rem] font-bold tracking-[0.18em] text-foreground uppercase transition-colors hover:border-bronze hover:text-bronze"
                  >
                    <MessageCircle className="h-4 w-4 text-bronze" />
                    <span>WHATSAPP DESIGN</span>
                  </button>
                </>
              )}
            </div>

            {/* Direct WhatsApp Quick Trigger */}
            <div className="mt-4 flex items-center justify-between border-t border-hairline/60 pt-4">
              <span className="text-[0.66rem] font-bold tracking-[0.18em] uppercase text-muted-foreground">
                DIRECT STUDIO HOTLINE:
              </span>
              <a
                href={`tel:${settings.phone}`}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground hover:text-bronze transition-colors"
              >
                <Phone className="h-3 w-3 text-bronze" />
                <span>{settings.phone}</span>
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── 03 TECHNICAL SPECIFICATION & ARCHITECTURAL DETAILS ── */}
      <section className="mx-auto max-w-[1440px] px-5 pt-16 md:px-10 lg:px-16 md:pt-24">
        <div className="border-t border-hairline pt-12">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-14">
            {/* Left Column: ABOUT THE DESIGN */}
            <div className="lg:col-span-6 flex flex-col justify-start">
              <div className="flex items-center gap-2 text-bronze">
                <FileText className="h-4 w-4" />
                <span className="label-xs uppercase tracking-[0.24em] font-semibold">
                  ABOUT THE DESIGN
                </span>
              </div>
              <h2 className="mt-3 text-2xl font-bold tracking-tight text-foreground uppercase sm:text-3xl">
                CRAFTED BY MASTER SITA COMPLEX KARIGARS
              </h2>
              <div className="mt-6 space-y-4 text-sm leading-relaxed text-foreground/80 md:text-base">
                <p>{product.description}</p>
                {product.note ? (
                  <div className="border-l-2 border-bronze bg-sand/40 p-4 text-xs italic text-muted-foreground">
                    {product.note}
                  </div>
                ) : null}
              </div>

              {/* Showcase highlights for steel & glass enclosed rooms */}
              {!isRailing && (
                <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-4 border-t border-hairline pt-6">
                  <div className="bg-sand/30 p-4 border border-hairline">
                    <p className="text-[0.64rem] font-bold tracking-[0.2em] uppercase text-bronze">
                      FRAMEWORK
                    </p>
                    <p className="mt-1 text-xs font-semibold text-foreground">Heavy MS Section</p>
                  </div>
                  <div className="bg-sand/30 p-4 border border-hairline">
                    <p className="text-[0.64rem] font-bold tracking-[0.2em] uppercase text-bronze">
                      GLAZING
                    </p>
                    <p className="mt-1 text-xs font-semibold text-foreground">Toughened Glass</p>
                  </div>
                  <div className="bg-sand/30 p-4 border border-hairline">
                    <p className="text-[0.64rem] font-bold tracking-[0.2em] uppercase text-bronze">
                      FINISH
                    </p>
                    <p className="mt-1 text-xs font-semibold text-foreground">Matt Deco Paint</p>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: COMPLETE MATERIAL SPECIFICATION */}
            <div className="lg:col-span-6 flex flex-col justify-start">
              <div className="flex items-center gap-2 text-bronze">
                <Hammer className="h-4 w-4" />
                <span className="label-xs uppercase tracking-[0.24em] font-semibold">
                  MATERIAL & FABRICATION
                </span>
              </div>
              <h2 className="mt-3 text-2xl font-bold tracking-tight text-foreground uppercase sm:text-3xl">
                COMPLETE TECHNICAL SPECIFICATIONS
              </h2>

              <div className="mt-6 border border-hairline bg-card p-6 divide-y divide-hairline">
                {/* Material Specification */}
                <div className="pb-4">
                  <span className="text-[0.66rem] font-bold tracking-[0.2em] uppercase text-muted-foreground">
                    RAW MATERIAL SPECIFICATION
                  </span>
                  <p className="mt-1.5 text-sm font-medium text-foreground leading-relaxed">
                    {product.material || "High-grade Mild Steel (MS) raw section."}
                  </p>
                </div>

                {/* Primer */}
                {product.primer ? (
                  <div className="py-4">
                    <span className="text-[0.66rem] font-bold tracking-[0.2em] uppercase text-muted-foreground">
                      CORROSION PROTECTION
                    </span>
                    <p className="mt-1.5 text-sm font-medium text-foreground leading-relaxed">
                      {product.primer}
                    </p>
                  </div>
                ) : null}

                {/* Finish */}
                {product.finish ? (
                  <div className="py-4">
                    <span className="text-[0.66rem] font-bold tracking-[0.2em] uppercase text-muted-foreground">
                      SURFACE FINISH
                    </span>
                    <p className="mt-1.5 text-sm font-medium text-foreground leading-relaxed">
                      {product.finish}
                    </p>
                  </div>
                ) : null}

                {/* Construction / Structural */}
                {product.construction ? (
                  <div className="py-4">
                    <span className="text-[0.66rem] font-bold tracking-[0.2em] uppercase text-muted-foreground">
                      CONSTRUCTION METHOD
                    </span>
                    <p className="mt-1.5 text-sm font-medium text-foreground leading-relaxed">
                      {product.construction}
                    </p>
                  </div>
                ) : null}

                {/* Standard Module Dimensions */}
                <div className="pt-4 flex flex-wrap items-center justify-between gap-4 text-xs text-muted-foreground">
                  <div>
                    <span className="font-semibold uppercase tracking-wider text-foreground">
                      Module Height:
                    </span>{" "}
                    {product.standardHeight || 3.5} ft standard
                  </div>
                  <div>
                    <span className="font-semibold uppercase tracking-wider text-foreground">
                      Fabrication Studio:
                    </span>{" "}
                    Imadole, Lalitpur
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 04 DYNAMIC RELATED DESIGNS ("YOU MAY ALSO LIKE") ── */}
      {relatedProducts.length > 0 ? (
        <section className="mx-auto max-w-[1440px] px-5 pt-20 md:px-10 lg:px-16 md:pt-28">
          <div className="border-t border-hairline pt-12">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 pb-8">
              <div>
                <span className="label-xs text-bronze uppercase tracking-[0.24em] font-semibold">
                  CURATED ARCHIVE
                </span>
                <h2 className="mt-1 text-2xl font-light tracking-tight text-foreground uppercase sm:text-3xl md:text-4xl">
                  YOU MAY ALSO <span className="display-serif italic font-normal lowercase">like</span>
                </h2>
              </div>
              <Link
                to="/collection"
                className="text-xs font-semibold tracking-wider text-muted-foreground uppercase underline underline-offset-4 hover:text-foreground transition-colors"
              >
                Browse All Catalogue →
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
              {relatedProducts.map((rel) => {
                const relIsRailing = isRailingProduct(rel);
                const relSlug = rel.slug || rel.id;
                return (
                  <article
                    key={rel.id}
                    className="group flex flex-col border border-hairline bg-card shadow-soft hover:border-foreground/30 hover:shadow-lift transition-all duration-300"
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-sand">
                      <img
                        src={rel.image}
                        alt={rel.displayName || rel.name}
                        className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-charcoal/40 via-transparent to-transparent pointer-events-none" />
                      <span className="absolute top-3 left-3 bg-background/90 backdrop-blur-md px-2.5 py-1 text-[0.6rem] font-bold tracking-[0.2em] uppercase text-foreground">
                        {rel.code || "MWN"}
                      </span>
                    </div>

                    <div className="flex flex-1 flex-col p-5">
                      {rel.nepaliName ? (
                        <p className="text-xs font-semibold text-bronze font-serif">
                          {rel.nepaliName}
                        </p>
                      ) : null}
                      <h3 className="mt-1 text-base font-bold tracking-tight text-foreground group-hover:text-bronze transition-colors">
                        {rel.displayName || rel.name}
                      </h3>

                      <p className="mt-2 text-xs leading-relaxed text-muted-foreground line-clamp-2">
                        {rel.description}
                      </p>

                      <div className="mt-auto pt-4 border-t border-hairline/70">
                        <Link
                          to="/collection/$slug"
                          params={{ slug: relSlug }}
                          className="flex w-full items-center justify-between bg-sand/40 border border-hairline px-4 py-2.5 text-[0.68rem] font-bold tracking-[0.18em] uppercase transition-all duration-300 hover:border-bronze hover:bg-charcoal hover:text-ivory"
                        >
                          <span>{relIsRailing ? "VIEW DESIGN →" : "EXPLORE DESIGN →"}</span>
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}

      {/* ── 05 REFINED MOBILE STICKY ACTION BAR ── */}
      <AnimatePresence>
        {showMobileStickyCta ? (
          <motion.aside
            aria-label="Quick Actions"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.25, ease: EASE }}
            className="fixed bottom-0 inset-x-0 z-50 sm:hidden border-t border-hairline bg-background/95 backdrop-blur-lg px-4 py-3 shadow-lift"
          >
            <div className="flex items-center gap-2.5">
              {isRailing ? (
                <>
                  <button
                    type="button"
                    onClick={handleCalculateRailing}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 bg-charcoal py-3.5 px-3 text-[0.68rem] font-bold tracking-[0.16em] uppercase text-ivory shadow-sm active:bg-bronze"
                  >
                    <Calculator className="h-3.5 w-3.5" />
                    <span>CALCULATE THIS RAILING</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleWhatsApp}
                    className="inline-grid h-12 w-12 shrink-0 place-items-center border border-hairline bg-sand active:bg-sand/80"
                    aria-label="WhatsApp enquiry"
                  >
                    <MessageCircle className="h-5 w-5 text-bronze" />
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={handleRequestQuote}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 bg-charcoal py-3.5 px-3 text-[0.68rem] font-bold tracking-[0.16em] uppercase text-ivory shadow-sm active:bg-bronze"
                  >
                    <span>REQUEST A QUOTE</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleWhatsApp}
                    className="inline-grid h-12 w-12 shrink-0 place-items-center border border-hairline bg-sand active:bg-sand/80"
                    aria-label="WhatsApp quote"
                  >
                    <MessageCircle className="h-5 w-5 text-bronze" />
                  </button>
                </>
              )}
            </div>
          </motion.aside>
        ) : null}
      </AnimatePresence>

      {/* ── 06 FULLSCREEN LIGHTBOX ── */}
      <AnimatePresence>
        {lightboxOpen ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightboxOpen(false)}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-md cursor-zoom-out"
          >
            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
              className="absolute top-6 right-6 z-10 grid h-10 w-10 place-items-center bg-white/10 text-white rounded-full transition-colors hover:bg-white/20"
              aria-label="Close fullscreen view"
            >
              <X className="h-5 w-5" />
            </button>
            <motion.img
              initial={{ scale: 0.96 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.96 }}
              src={currentImage}
              alt={product.displayName || product.name}
              className="max-h-[90vh] max-w-[90vw] object-contain shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="min-h-screen bg-background pt-28 pb-24 md:pt-36 md:pb-32 animate-pulse">
      <div className="mx-auto max-w-[1440px] px-5 md:px-10 lg:px-16">
        <div className="h-6 w-48 bg-sand/60 border border-hairline mb-8" />
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-7 aspect-[4/3] bg-sand/60 border border-hairline" />
          <div className="lg:col-span-5 space-y-6">
            <div className="h-4 w-32 bg-sand/70" />
            <div className="h-10 w-3/4 bg-sand/70" />
            <div className="h-24 w-full bg-sand/40" />
            <div className="h-20 w-full bg-sand/50" />
            <div className="h-14 w-full bg-sand/70" />
          </div>
        </div>
      </div>
    </div>
  );
}
