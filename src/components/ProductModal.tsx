import { AnimatePresence, motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { useEffect } from "react";
import type { Product } from "@/data/products";
import { formatNPR } from "@/utils/currency";
import { EASE } from "./Reveal";
import { useFocusTrap } from "@/hooks/useFocusTrap";

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

  return (
    <AnimatePresence>
      {product ? (
        <motion.div
          className="fixed inset-0 z-[70] flex items-start justify-center overflow-y-auto bg-charcoal/55 p-0 backdrop-blur-sm sm:p-6 md:items-center"
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
            className="relative w-full max-w-5xl bg-background shadow-lift"
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Close details"
              className="absolute top-4 right-4 z-10 grid h-10 w-10 place-items-center bg-background/85 backdrop-blur-sm transition-colors hover:bg-sand"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="grid md:grid-cols-2">
              <div className="aspect-[4/5] overflow-hidden bg-sand md:aspect-auto md:h-full">
                <img
                  src={product.image}
                  alt={product.name}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>

              <div className="flex flex-col p-7 md:p-12">
                <p className="label-xs text-bronze">{product.code}</p>
                <h2 className="mt-4 text-2xl leading-tight tracking-tight md:text-4xl">
                  {product.name}
                </h2>
                <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
                  {product.description}
                </p>

                <div className="mt-8 grid gap-7 border-t border-hairline pt-7 sm:grid-cols-2">
                  <div>
                    <p className="label-xs text-muted-foreground">Material</p>
                    <p className="mt-2 text-sm">{product.material}</p>
                  </div>
                  <div>
                    <p className="label-xs text-muted-foreground">Application</p>
                    <ul className="mt-2 space-y-1 text-sm">
                      {product.applications.map((a) => (
                        <li key={a}>{a}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="label-xs text-muted-foreground">Features</p>
                    <ul className="mt-2 space-y-1.5 text-sm">
                      {product.features.map((f) => (
                        <li key={f} className="flex gap-2.5">
                          <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-bronze" />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="mt-8 border-t border-hairline pt-7">
                  <p className="label-xs text-muted-foreground">Price</p>
                  <p className="mt-2 text-2xl font-semibold tracking-tight">
                    {product.isCustom ? (
                      "Custom Quote"
                    ) : (
                      <>
                        {formatNPR(product.pricePerSqft, currency)}
                        <span className="text-base font-normal text-muted-foreground">
                          {" "}
                          / sq.ft.
                        </span>
                      </>
                    )}
                  </p>
                </div>

                <div className="mt-8 flex flex-col gap-3">
                  <button
                    type="button"
                    onClick={() => onSelect(product)}
                    className="w-full bg-charcoal px-8 py-4 text-[0.72rem] tracking-[0.22em] text-ivory uppercase transition-colors duration-300 hover:bg-bronze"
                  >
                    {selected ? "Selected — Calculate Price →" : "Select & Calculate →"}
                  </button>
                  {selected && onDeselect ? (
                    <button
                      type="button"
                      onClick={() => onDeselect(product)}
                      className="w-full border border-destructive/40 px-8 py-3 text-[0.7rem] tracking-[0.2em] text-destructive uppercase transition-colors hover:bg-destructive/10"
                    >
                      Deselect Railing
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
