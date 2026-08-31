import { memo } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Check, Sparkles, X } from "lucide-react";
import type { Product } from "@/data/products";
import { formatNPR } from "@/utils/currency";
import { EASE } from "./Reveal";

export function isRailingProduct(product: Product): boolean {
  const cat = (product.category || "").toUpperCase();
  const name = (product.name || "").toLowerCase();
  const apps = (product.applications || []).map((a) => a.toLowerCase());
  const id = (product.id || "").toLowerCase();

  // Explicit SHOWCASE check: Metal & Glass Enclosed Rooms and showcase items without pricing
  if (
    id.startsWith("mg") ||
    product.contentType === "SHOWCASE" ||
    cat.includes("GLASS") ||
    cat.includes("ENCLOSED") ||
    cat.includes("ROOM") ||
    product.application === "metal_glass" ||
    apps.some((a) => a.includes("room") || a.includes("sunroom") || a.includes("corridor"))
  ) {
    return false;
  }

  // Gates without price or custom showcase gates
  if ((id === "r09" || name.includes("gate") || cat.includes("GATE")) && !product.pricePerSqft) {
    return false;
  }

  // If item has a valid price per sq.ft, it is a calculable railing product
  if (product.pricePerSqft !== null && product.pricePerSqft > 0) {
    return true;
  }

  if (product.contentType === "PRODUCT") return true;
  if (cat.includes("RAILING")) return true;
  if (
    product.application === "staircase" ||
    product.application === "balcony" ||
    product.application === "balcony_loft"
  ) {
    return true;
  }

  return !product.isCustom;
}

export const ProductCard = memo(function ProductCard({
  product,
  index,
  selected,
  onView,
  onSelect,
  onDeselect,
  currency = "NPR",
}: {
  product: Product;
  index: number;
  selected: boolean;
  onView: (p: Product) => void;
  onSelect: (p: Product) => void;
  onDeselect?: (p: Product) => void;
  currency?: string;
}) {
  const isRailing = isRailingProduct(product);
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
        : product.applications?.[0]?.toUpperCase() || product.category?.toUpperCase() || "RAILING";

  const categoryLabel = !isRailing
    ? product.category?.toUpperCase().includes("ENCLOSED") ||
      product.category?.toUpperCase().includes("GLASS") ||
      product.application === "metal_glass" ||
      product.id.startsWith("mg")
      ? "METAL & GLASS ENCLOSED ROOMS"
      : product.category?.toUpperCase().includes("GATE") ||
          product.applications?.[0]?.toUpperCase().includes("GATE")
        ? "GATES"
        : product.category?.toUpperCase().includes("GRILLE") ||
            product.applications?.[0]?.toUpperCase().includes("GRILLE")
          ? "GRILLES"
          : product.category?.toUpperCase() || "SHOWCASE"
    : applicationLabel;

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: (index % 3) * 0.06, ease: EASE }}
      whileHover={{ y: -5 }}
      onClick={() => onView(product)}
      className={`group relative flex flex-col border bg-card transition-all duration-300 cursor-pointer ${
        selected
          ? "border-bronze shadow-lift ring-1 ring-bronze"
          : "border-hairline shadow-soft hover:border-foreground/30 hover:shadow-lift"
      }`}
    >
      {/* ── IMAGE WRAPPER ── */}
      <div className="relative aspect-[4/5] overflow-hidden bg-sand">
        <img
          src={product.image}
          alt={`${product.displayName || product.name} by Metal Work Nepal`}
          loading="lazy"
          width={1024}
          height={1280}
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/45 via-transparent to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-80" />

        {/* Top Badges */}
        <div className="absolute top-3.5 inset-x-3.5 flex items-center justify-between pointer-events-none">
          <span className="bg-background/90 backdrop-blur-md px-2.5 py-1 text-[0.62rem] font-bold tracking-[0.2em] uppercase text-foreground shadow-sm">
            {isRailing ? applicationLabel : categoryLabel}
          </span>

          {isRailing && !selected ? (
            <span className="inline-flex items-center gap-1 bg-sand/90 backdrop-blur-md px-2.5 py-1 text-[0.58rem] font-bold tracking-[0.16em] uppercase text-bronze border border-hairline/80 shadow-sm">
              <Sparkles className="h-2.5 w-2.5" />
              INSTANT ESTIMATE
            </span>
          ) : null}
        </div>

        {/* Hover Quick Deselect Badge (Top Right when selected) */}
        {selected && onDeselect ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDeselect(product);
            }}
            className="absolute top-3.5 right-3.5 z-20 hidden group-hover:inline-flex items-center gap-1.5 bg-destructive px-2.5 py-1 text-[0.62rem] font-bold tracking-wider text-ivory shadow-lift transition-transform hover:scale-105"
            title="Click to deselect"
            aria-label="Deselect railing"
          >
            <X className="h-3 w-3 stroke-[2.5]" />
            <span>DESELECT</span>
          </button>
        ) : null}

        {/* Selected Check Indicator / Deselect Trigger */}
        {selected ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onDeselect) onDeselect(product);
              else onSelect(product);
            }}
            className="group/badge absolute bottom-3.5 right-3.5 z-10 flex items-center gap-1.5 rounded-full bg-bronze px-2.5 py-1 text-ivory shadow-md transition-all duration-300 hover:bg-destructive hover:scale-105"
            title="Selected — Click to deselect"
            aria-label="Selected — Click to deselect"
          >
            <Check className="h-3.5 w-3.5 stroke-[2.5] group-hover/badge:hidden" />
            <X className="h-3.5 w-3.5 stroke-[2.5] hidden group-hover/badge:block" />
            <span className="text-[0.6rem] font-bold uppercase tracking-wider hidden group-hover/badge:inline">
              DESELECT
            </span>
          </button>
        ) : null}
      </div>

      {/* ── CARD CONTENT ── */}
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div>
          {/* Dual naming: Nepali & English */}
          {product.nepaliName ? (
            <p className="text-sm font-semibold tracking-wide text-bronze font-serif">
              {product.nepaliName}
              {product.englishName && product.englishName !== product.name ? (
                <span className="ml-2 text-xs font-normal text-muted-foreground font-sans uppercase tracking-wider">
                  {product.englishName}
                </span>
              ) : null}
            </p>
          ) : null}

          <h3 className="mt-1 text-lg font-bold leading-snug tracking-tight text-foreground group-hover:text-bronze transition-colors">
            {product.displayName || product.name}
          </h3>

          {!isRailing ? (
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground line-clamp-2">
              {product.description}
            </p>
          ) : null}
        </div>

        {/* Specification & Pricing Strip */}
        <div className="mt-auto pt-5 mt-5 border-t border-hairline">
          {isRailing ? (
            <div className="flex items-baseline justify-between gap-2">
              <span className="text-[0.66rem] font-bold tracking-[0.18em] uppercase text-muted-foreground">
                RATE
              </span>
              <div className="text-right">
                {product.pricePerSqft ? (
                  <p className="text-base font-extrabold tracking-tight text-foreground">
                    {formatNPR(product.pricePerSqft, currency)}
                    <span className="text-xs font-normal text-muted-foreground"> / SQ.FT</span>
                  </p>
                ) : (
                  <p className="text-xs font-bold text-muted-foreground uppercase">Price on Request</p>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span className="text-[0.66rem] font-bold tracking-[0.18em] uppercase">MATERIAL</span>
              <span className="text-[0.72rem] text-foreground font-medium truncate max-w-[170px]">
                {product.material.split(",")[0]}
              </span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-5 pt-3 border-t border-hairline/60 flex items-center gap-2">
          {isRailing ? (
            selected ? (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect(product);
                  }}
                  className="group/sel flex flex-1 items-center justify-center gap-1.5 bg-bronze py-3 px-3 text-[0.68rem] font-bold tracking-[0.16em] uppercase text-ivory transition-all duration-300 hover:bg-charcoal"
                >
                  <Check className="h-3.5 w-3.5" />
                  <span>CALCULATE</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeselect?.(product);
                  }}
                  className="group/desel flex items-center justify-center gap-1 border border-destructive/40 bg-destructive/10 px-3 py-3 text-[0.68rem] font-bold tracking-[0.14em] uppercase text-destructive transition-all duration-300 hover:bg-destructive hover:text-ivory"
                  title="Deselect this railing"
                  aria-label="Deselect railing"
                >
                  <X className="h-3.5 w-3.5 stroke-[2.5]" />
                  <span>DESELECT</span>
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2 w-full">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onView(product);
                  }}
                  className="group/btn flex flex-1 items-center justify-between border border-hairline bg-sand/40 px-3.5 py-3 text-[0.68rem] font-bold tracking-[0.18em] uppercase transition-all duration-300 hover:border-bronze hover:bg-sand hover:text-bronze"
                >
                  <span>VIEW DESIGN</span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover/btn:translate-x-1" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelect(product);
                  }}
                  title="Select and Calculate"
                  aria-label="Calculate this railing"
                  className="group/sel flex items-center justify-center gap-1 bg-charcoal px-3.5 py-3 text-[0.68rem] font-bold tracking-[0.16em] uppercase text-ivory transition-all duration-300 hover:bg-bronze shrink-0"
                >
                  <span>CALCULATE</span>
                </button>
              </div>
            )
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onView(product);
              }}
              className="group/btn flex w-full items-center justify-between border border-hairline bg-sand/40 px-4 py-3 text-[0.68rem] font-bold tracking-[0.18em] uppercase transition-all duration-300 hover:border-bronze hover:bg-sand hover:text-bronze"
            >
              <span>EXPLORE DESIGN</span>
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover/btn:translate-x-1" />
            </button>
          )}
        </div>
      </div>
    </motion.article>
  );
});
