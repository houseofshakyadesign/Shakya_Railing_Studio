import { memo } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import type { Product } from "@/data/products";
import { formatNPR } from "@/utils/currency";
import { EASE } from "./Reveal";

export const ProductCard = memo(function ProductCard({
  product,
  index,
  selected,
  onView,
  onSelect,
  currency = "NPR",
}: {
  product: Product;
  index: number;
  selected: boolean;
  onView: (p: Product) => void;
  onSelect: (p: Product) => void;
  currency?: string;
}) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55, delay: (index % 3) * 0.07, ease: EASE }}
      whileHover={{ y: -6 }}
      className={`group relative flex flex-col border bg-card transition-[border-color,box-shadow] duration-300 ${
        selected
          ? "border-bronze shadow-lift"
          : "border-hairline shadow-soft hover:border-foreground/25 hover:shadow-lift"
      }`}
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-sand">
        <img
          src={product.image}
          alt={`${product.name} by Metal Work Nepal`}
          loading="lazy"
          width={1024}
          height={1280}
          className="h-full w-full object-cover transition-transform duration-[600ms] ease-out group-hover:scale-[1.04]"
        />
        <div className="absolute inset-0 bg-charcoal/0 transition-colors duration-500 group-hover:bg-charcoal/12" />
        <span className="absolute top-4 left-4 bg-background/85 px-3 py-1.5 text-[0.62rem] tracking-[0.22em] backdrop-blur-sm">
          {String(index + 1).padStart(2, "0")} · {product.code}
        </span>
        {selected ? (
          <motion.span
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.28, ease: EASE }}
            className="absolute top-4 right-4 grid h-9 w-9 place-items-center rounded-full bg-bronze text-ivory"
            aria-label="Selected"
          >
            <Check className="h-4 w-4" strokeWidth={2.5} />
          </motion.span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div>
          {product.nepaliName ? (
            <p className="text-sm font-medium tracking-wide text-bronze">
              {product.nepaliName}
            </p>
          ) : null}
          <h3 className="mt-1 text-lg font-medium leading-snug tracking-tight">
            {product.displayName || product.name}
          </h3>
          {product.applications?.length || product.category ? (
            <p className="mt-1.5 text-[0.68rem] font-medium tracking-[0.16em] text-muted-foreground uppercase">
              {product.applications?.[0] || product.category}
            </p>
          ) : null}
        </div>

        <dl className="mt-auto flex items-end justify-between gap-4 border-t border-hairline pt-5 mt-6">
          <div className="min-w-0 flex-1">
            <dt className="label-xs text-muted-foreground">Material</dt>
            <dd className="mt-1.5 text-xs leading-snug text-foreground line-clamp-2" title={product.material}>
              {product.material}
            </dd>
          </div>
          <div className="shrink-0 text-right">
            <dt className="label-xs text-muted-foreground">Rate</dt>
            <dd className="mt-1.5 text-sm font-semibold tracking-tight">
              {product.pricePerSqft === null || product.pricePerSqft === undefined || product.pricePerSqft === 0 || product.isCustom ? (
                "Price on Request"
              ) : (
                <>
                  {formatNPR(product.pricePerSqft, currency)}
                  <span className="font-normal text-muted-foreground"> / sq.ft.</span>
                </>
              )}
            </dd>
          </div>
        </dl>

        <div className="mt-6 flex items-center gap-3">
          <button
            type="button"
            onClick={() => onView(product)}
            className="group/btn flex flex-1 items-center justify-between border border-hairline px-4 py-3 text-[0.68rem] tracking-[0.18em] uppercase transition-colors duration-300 hover:border-foreground/40"
          >
            View Details
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover/btn:translate-x-1" />
          </button>
          <button
            type="button"
            onClick={() => onSelect(product)}
            aria-pressed={selected}
            className={`group/sel flex items-center gap-2 px-5 py-3 text-[0.68rem] tracking-[0.18em] uppercase transition-colors duration-300 ${
              selected
                ? "bg-bronze text-ivory hover:bg-destructive"
                : "bg-charcoal text-ivory hover:bg-bronze"
            }`}
          >
            {selected ? (
              <>
                <Check className="h-3 w-3 transition-transform duration-200 group-hover/sel:hidden" strokeWidth={2.5} />
                <span className="hidden h-3 w-3 items-center justify-center text-[0.6rem] leading-none group-hover/sel:flex">✕</span>
                <span className="group-hover/sel:hidden">Selected</span>
                <span className="hidden group-hover/sel:inline">Deselect</span>
              </>
            ) : (
              <>
                Select & Calculate
                <ArrowRight className="h-3 w-3 transition-transform duration-300 group-hover/sel:translate-x-0.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </motion.article>
  );
});
