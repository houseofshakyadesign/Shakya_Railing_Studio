import { AnimatePresence, motion } from "framer-motion";
import { Check, MessageCircle, Phone, Sparkles, X } from "lucide-react";
import { useEffect } from "react";
import type { Product } from "@/data/products";
import { formatNPR } from "@/utils/currency";
import { EASE } from "./Reveal";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { isRailingProduct } from "./ProductCard";
import { useStudio } from "@/hooks/useStudio";

export function ProductModal({
  product,
  selected,
  onClose,
  onSelect,
  onDeselect,
  currency = "NPR",
}: {
  product: Product | null;
  selected: boolean;
  onClose: () => void;
  onSelect: (p: Product) => void;
  onDeselect?: (p: Product) => void;
  currency?: string;
}) {
  const { settings } = useStudio();
  const trapRef = useFocusTrap(!!product);

  useEffect(() => {
    if (!product) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [product, onClose]);

  const isRailing = product ? isRailingProduct(product) : false;

  const handleWhatsAppEnquiry = () => {
    if (!product) return;
    const text = encodeURIComponent(
      `Hello Metal Work Nepal, I would like to request a quote for ${product.nepaliName ? `${product.nepaliName} / ` : ""}${product.displayName || product.name}${product.code ? ` (${product.code})` : ""}. Could you please share quotation requirements and fabrication details?`,
    );
    const cleanNumber = settings.whatsappNumber.replace(/\D/g, "");
    window.open(`https://wa.me/${cleanNumber}?text=${text}`, "_blank");
  };

  return (
    <AnimatePresence>
      {product ? (
        <motion.div
          className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-charcoal/60 p-0 backdrop-blur-md sm:p-6 md:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label={product.name}
        >
          <motion.div
            ref={trapRef}
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.97, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 8 }}
            transition={{ duration: 0.32, ease: EASE }}
            className="relative w-full max-w-5xl bg-background shadow-lift border border-hairline overflow-hidden"
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Close details"
              className="absolute top-4 right-4 z-10 grid h-10 w-10 place-items-center bg-background/90 backdrop-blur-md border border-hairline transition-colors hover:bg-sand"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="grid md:grid-cols-2">
              {/* Product Image */}
              <div className="relative aspect-[4/5] overflow-hidden bg-sand md:aspect-auto md:h-full min-h-[320px]">
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/40 via-transparent to-transparent opacity-60" />
                <span className="absolute bottom-4 left-4 bg-background/90 backdrop-blur-md px-3 py-1.5 text-[0.62rem] font-bold tracking-[0.2em] uppercase text-foreground border border-hairline/80">
                  {product.code}
                </span>
              </div>

              {/* Product Details */}
              <div className="flex flex-col p-6 sm:p-8 md:p-10 overflow-y-auto max-h-[85vh]">
                <div className="flex items-center justify-between">
                  <span className="label-xs text-bronze font-semibold uppercase tracking-[0.2em]">
                    {isRailing
                      ? product.application?.toUpperCase() || "RAILING SYSTEM"
                      : product.category?.toUpperCase() || "SHOWCASE DESIGN"}
                  </span>
                  {isRailing ? (
                    <span className="inline-flex items-center gap-1 bg-sand px-2.5 py-1 text-[0.6rem] font-bold tracking-[0.14em] uppercase text-bronze border border-hairline">
                      <Sparkles className="h-2.5 w-2.5" />
                      INSTANT ESTIMATE
                    </span>
                  ) : null}
                </div>

                <div className="mt-3">
                  {product.nepaliName ? (
                    <p className="text-xl font-bold tracking-wide text-bronze font-serif">
                      {product.nepaliName}
                    </p>
                  ) : null}
                  <h2 className="mt-1 text-2xl sm:text-3xl leading-tight tracking-tight font-extrabold text-foreground">
                    {product.displayName || product.name}
                  </h2>
                  {product.englishName &&
                  product.englishName !== (product.displayName || product.name) ? (
                    <p className="mt-1 text-xs uppercase tracking-[0.2em] font-semibold text-muted-foreground">
                      {product.englishName}
                    </p>
                  ) : null}
                </div>

                {/* Price Display for Railings Only */}
                {isRailing ? (
                  <div className="mt-5 border-y border-hairline py-4 bg-sand/30 px-4">
                    <p className="label-xs text-muted-foreground uppercase tracking-[0.18em]">
                      INDICATIVE RATE
                    </p>
                    <p className="mt-1 text-2xl font-extrabold tracking-tight text-foreground">
                      {product.pricePerSqft ? (
                        <>
                          {formatNPR(product.pricePerSqft, currency)}
                          <span className="text-sm font-normal text-muted-foreground"> / SQ.FT</span>
                        </>
                      ) : (
                        "Price on Request"
                      )}
                    </p>
                  </div>
                ) : null}

                {/* ABOUT THE DESIGN */}
                <div className="mt-6">
                  <p className="label-xs text-muted-foreground uppercase tracking-widest font-semibold">
                    ABOUT THE DESIGN
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-foreground/90">
                    {product.description}
                  </p>
                </div>

                {/* SPECIFICATIONS GRID */}
                <div className="mt-6 grid gap-4 border-t border-hairline pt-6 sm:grid-cols-2 text-xs">
                  <div>
                    <p className="label-xs text-muted-foreground uppercase tracking-widest font-semibold">
                      MATERIAL
                    </p>
                    <div className="mt-1.5 space-y-1 text-foreground/90 font-medium">
                      {product.material.includes(",") ? (
                        product.material.split(/,\s*(?=[0-9"'])/).map((item, idx) => (
                          <p key={idx} className="leading-snug">
                            {item.trim()}
                          </p>
                        ))
                      ) : (
                        <p className="leading-snug">{product.material}</p>
                      )}
                    </div>
                  </div>

                  {product.primer ? (
                    <div>
                      <p className="label-xs text-muted-foreground uppercase tracking-widest font-semibold">
                        PRIMER
                      </p>
                      <p className="mt-1.5 text-foreground/90 font-medium">{product.primer}</p>
                    </div>
                  ) : null}

                  {product.finish ? (
                    <div>
                      <p className="label-xs text-muted-foreground uppercase tracking-widest font-semibold">
                        FINISH
                      </p>
                      <p className="mt-1.5 text-foreground/90 font-medium">{product.finish}</p>
                    </div>
                  ) : null}

                  {product.applications && product.applications.length > 0 ? (
                    <div>
                      <p className="label-xs text-muted-foreground uppercase tracking-widest font-semibold">
                        APPLICATION
                      </p>
                      <ul className="mt-1.5 space-y-1 text-foreground/90 font-medium">
                        {product.applications.map((a) => (
                          <li key={a}>{a}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>

                {/* VIDEO PREVIEW IF AVAILABLE */}
                {product.video ? (
                  <div className="mt-6 border border-hairline bg-card p-4">
                    <p className="label-xs text-bronze uppercase tracking-widest font-semibold">
                      ARCHITECTURAL VIDEO / WALKTHROUGH
                    </p>
                    <div className="mt-2 overflow-hidden bg-charcoal">
                      {product.video.endsWith(".mp4") ||
                      product.video.endsWith(".webm") ||
                      product.video.startsWith("/videos/") ? (
                        <video
                          src={product.video}
                          controls
                          className="w-full max-h-56 object-cover"
                          preload="metadata"
                        />
                      ) : (
                        <a
                          href={product.video}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-between p-3 text-xs text-ivory hover:text-bronze"
                        >
                          <span>Watch video walkthrough</span>
                          <span>↗</span>
                        </a>
                      )}
                    </div>
                  </div>
                ) : null}

                {/* IMPORTANT NOTE */}
                {product.note ? (
                  <div className="mt-6 border border-bronze/30 bg-sand/40 p-4">
                    <p className="label-xs text-bronze uppercase tracking-widest font-semibold">
                      NOTE
                    </p>
                    <p className="mt-1 text-xs leading-relaxed text-foreground/80">
                      {product.note}
                    </p>
                  </div>
                ) : null}

                {/* ACTIONS */}
                <div className="mt-8 flex flex-col gap-3 pt-4 border-t border-hairline">
                  {isRailing ? (
                    <>
                      <button
                        type="button"
                        onClick={() => onSelect(product)}
                        className="w-full bg-charcoal px-8 py-4 text-[0.72rem] font-bold tracking-[0.22em] text-ivory uppercase transition-colors duration-300 hover:bg-bronze"
                      >
                        SELECT & CALCULATE →
                      </button>
                      <button
                        type="button"
                        onClick={handleWhatsAppEnquiry}
                        className="flex w-full items-center justify-center gap-2 border border-hairline bg-sand/30 px-8 py-3.5 text-[0.7rem] font-bold tracking-[0.2em] uppercase transition-colors hover:border-bronze hover:text-bronze"
                      >
                        <MessageCircle className="h-4 w-4" />
                        ASK ABOUT THIS DESIGN →
                      </button>
                      {selected && onDeselect ? (
                        <button
                          type="button"
                          onClick={() => onDeselect(product)}
                          className="w-full border border-destructive/30 px-8 py-2.5 text-[0.68rem] tracking-[0.18em] text-destructive uppercase transition-colors hover:bg-destructive/10"
                        >
                          Deselect Railing
                        </button>
                      ) : null}
                    </>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={handleWhatsAppEnquiry}
                        className="flex w-full items-center justify-center gap-2 bg-charcoal px-8 py-4 text-[0.72rem] font-bold tracking-[0.22em] text-ivory uppercase transition-colors duration-300 hover:bg-bronze"
                      >
                        <MessageCircle className="h-4 w-4" />
                        REQUEST A QUOTE →
                      </button>
                      <button
                        type="button"
                        onClick={handleWhatsAppEnquiry}
                        className="flex w-full items-center justify-center gap-2 border border-hairline bg-sand/30 px-8 py-3.5 text-[0.7rem] font-bold tracking-[0.2em] uppercase transition-colors hover:border-bronze hover:text-bronze"
                      >
                        <MessageCircle className="h-4 w-4" />
                        WHATSAPP THE STUDIO →
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
