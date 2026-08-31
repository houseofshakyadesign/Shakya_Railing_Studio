import { Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Armchair, Hammer, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@/data/products";
import { useStudio } from "@/hooks/useStudio";
import {
  ProductCard,
  isRailingProduct,
  isMetalStructureProduct,
  isFurnitureProduct,
} from "./ProductCard";
import { ProductModal } from "./ProductModal";
import { EASE } from "./Reveal";

export type MasterCategory = "all" | "railings" | "metal_structures" | "furniture" | "custom";
export type RailingFilter = "all_railings" | "staircase" | "balcony_loft";

export const MASTER_CATEGORIES: { id: MasterCategory; label: string }[] = [
  { id: "all", label: "ALL" },
  { id: "railings", label: "RAILINGS" },
  { id: "metal_structures", label: "METAL STRUCTURES" },
  { id: "furniture", label: "FURNITURE" },
  { id: "custom", label: "CUSTOM METALWORK" },
];

export const RAILING_FILTERS: { id: RailingFilter; label: string }[] = [
  { id: "all_railings", label: "ALL RAILINGS" },
  { id: "staircase", label: "STAIRCASE" },
  { id: "balcony_loft", label: "BALCONY / LOFT" },
];

export function ProductGrid({
  limit,
  showFilter,
  initialCategory = "all",
  onAfterSelect,
}: {
  limit?: number;
  showFilter?: boolean;
  initialCategory?: MasterCategory;
  onAfterSelect?: (product: Product) => void;
}) {
  const shouldShowFilter = showFilter !== undefined ? showFilter : !limit;
  const { activeProducts, selectedId, selectProduct, settings } = useStudio();
  const [openProduct, setOpenProduct] = useState<Product | null>(null);
  const [activeCategory, setActiveCategory] = useState<MasterCategory>(initialCategory);
  const [activeRailingFilter, setActiveRailingFilter] = useState<RailingFilter>("all_railings");
  const navigate = useNavigate();

  // Prioritize Railings first, then Metal Structures, then Furniture
  const prioritizedProducts = useMemo(() => {
    return [...activeProducts].sort((a, b) => {
      const aIsRailing = isRailingProduct(a);
      const bIsRailing = isRailingProduct(b);
      if (aIsRailing && !bIsRailing) return -1;
      if (!aIsRailing && bIsRailing) return 1;
      return (a.displayOrder || 0) - (b.displayOrder || 0);
    });
  }, [activeProducts]);

  const baseProducts = limit ? prioritizedProducts.slice(0, limit) : prioritizedProducts;

  // Filter products based on Master Catalogue category & Railing secondary filter
  const filteredProducts = useMemo(() => {
    if (!shouldShowFilter) return baseProducts;

    if (activeCategory === "all") {
      return baseProducts;
    }

    if (activeCategory === "railings") {
      const railings = baseProducts.filter((p) => isRailingProduct(p));
      if (activeRailingFilter === "all_railings") return railings;
      if (activeRailingFilter === "staircase") {
        return railings.filter(
          (p) =>
            p.application === "staircase" ||
            p.applications?.some((a) => a.toLowerCase().includes("staircase")),
        );
      }
      if (activeRailingFilter === "balcony_loft") {
        return railings.filter(
          (p) =>
            p.application === "balcony" ||
            p.application === "balcony_loft" ||
            p.applications?.some(
              (a) => a.toLowerCase().includes("balcony") || a.toLowerCase().includes("loft"),
            ),
        );
      }
      return railings;
    }

    if (activeCategory === "metal_structures") {
      return baseProducts.filter((p) => isMetalStructureProduct(p));
    }

    if (activeCategory === "furniture") {
      return baseProducts.filter((p) => isFurnitureProduct(p));
    }

    if (activeCategory === "custom") {
      return [];
    }

    return baseProducts;
  }, [baseProducts, activeCategory, activeRailingFilter, shouldShowFilter]);

  const handleSelect = useCallback(
    (p: Product, close = false) => {
      selectProduct(p.id);
      if (close) setOpenProduct(null);
    },
    [selectProduct],
  );

  const handleCardSelect = useCallback(
    (p: Product) => {
      handleSelect(p);
      if (onAfterSelect) {
        onAfterSelect(p);
      } else {
        toast.success(`${p.code} selected for calculation`, {
          description: p.displayName || p.name,
        });
        navigate({ to: "/calculator" });
      }
    },
    [handleSelect, onAfterSelect, navigate],
  );

  const handleCardDeselect = useCallback(
    (p: Product) => {
      selectProduct(null);
      toast.info(`${p.code || p.name} deselected`);
    },
    [selectProduct],
  );

  const handleCardView = useCallback(
    (p: Product) => {
      navigate({
        to: "/collection/$slug",
        params: { slug: p.slug || p.id },
      });
    },
    [navigate],
  );

  const handleCustomQuote = () => {
    const text = encodeURIComponent(
      "Hello Metal Work Nepal, I would like to enquire about a custom architectural metalwork project. Could we schedule a consultation or quote review?",
    );
    const cleanNumber = settings.whatsappNumber.replace(/\D/g, "");
    window.open(`https://wa.me/${cleanNumber}?text=${text}`, "_blank");
  };

  return (
    <div>
      {/* ── 01 MAIN CATEGORY FILTER ── */}
      {shouldShowFilter && (
        <div className="mb-10 sm:mb-14">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between border-b border-hairline pb-6">
            <div className="w-full sm:w-auto">
              <p className="label-xs text-bronze font-semibold uppercase tracking-[0.22em]">
                DISCIPLINES & CATEGORIES
              </p>
              {/* Horizontal scroll container for mobile */}
              <div
                role="tablist"
                aria-label="Master Catalogue Categories"
                className="mt-3.5 flex items-center gap-2 overflow-x-auto no-scrollbar py-1"
              >
                {MASTER_CATEGORIES.map((c) => {
                  const isActive = activeCategory === c.id;
                  return (
                    <button
                      key={c.id}
                      role="tab"
                      aria-selected={isActive}
                      type="button"
                      onClick={() => setActiveCategory(c.id)}
                      className={`shrink-0 px-4 py-2.5 text-[0.7rem] tracking-[0.18em] uppercase transition-all duration-300 font-bold ${
                        isActive
                          ? "bg-charcoal text-ivory shadow-sm border border-charcoal"
                          : "bg-transparent text-foreground/75 border border-hairline hover:border-foreground/40 hover:text-foreground hover:bg-sand/30"
                      }`}
                    >
                      {c.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Result Counter (Only if not Custom Metalwork) */}
            {activeCategory !== "custom" && activeCategory !== "furniture" && (
              <p className="shrink-0 text-[0.68rem] tracking-[0.2em] uppercase text-muted-foreground font-mono">
                {String(filteredProducts.length).padStart(2, "0")}{" "}
                {filteredProducts.length === 1 ? "DESIGN" : "DESIGNS"}
              </p>
            )}
          </div>

          {/* ── 02 SUPPORTING STATEMENT FOR METAL STRUCTURES ── */}
          {activeCategory === "metal_structures" && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 flex items-center gap-3 border-l-2 border-bronze bg-sand/25 px-4 py-2.5"
            >
              <p className="text-xs sm:text-sm font-medium text-foreground/85 tracking-wide">
                Handcrafted architectural structures, glass sunrooms and ornamental entrance installations.
              </p>
            </motion.div>
          )}

          {/* ── 03 SECONDARY APPLICATION FILTER (ONLY FOR RAILINGS) ── */}
          {activeCategory === "railings" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: EASE }}
              className="mt-4 flex flex-wrap items-center gap-2 pt-2"
            >
              <span className="text-[0.66rem] font-bold tracking-[0.18em] uppercase text-muted-foreground mr-1">
                APPLICATION:
              </span>
              {RAILING_FILTERS.map((rf) => {
                const isSelected = activeRailingFilter === rf.id;
                return (
                  <button
                    key={rf.id}
                    type="button"
                    onClick={() => setActiveRailingFilter(rf.id)}
                    className={`px-3.5 py-1.5 text-[0.64rem] font-bold tracking-[0.16em] uppercase transition-all duration-200 ${
                      isSelected
                        ? "bg-sand text-bronze border border-bronze/40"
                        : "bg-transparent text-muted-foreground border border-hairline hover:border-foreground/30 hover:text-foreground"
                    }`}
                  >
                    {rf.label}
                  </button>
                );
              })}
            </motion.div>
          )}
        </div>
      )}

      {/* ── 04 PRODUCT, SHOWCASE OR CUSTOM PATHWAY ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${activeCategory}-${activeRailingFilter}`}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3, ease: EASE }}
        >
          {/* CUSTOM METALWORK PATHWAY */}
          {activeCategory === "custom" ? (
            <div className="border border-hairline bg-card p-8 sm:p-14 lg:p-16 max-w-4xl mx-auto shadow-soft">
              <div className="max-w-2xl">
                <span className="label-xs text-bronze font-semibold uppercase tracking-[0.24em]">
                  CUSTOM METALWORK
                </span>
                <h3 className="mt-4 text-3xl font-extrabold tracking-tight sm:text-4xl text-foreground uppercase leading-tight">
                  Have something different in mind?
                </h3>
                <p className="mt-2 font-serif italic text-lg sm:text-xl text-bronze font-normal">
                  Your idea doesn't have to fit a catalogue.
                </p>
                <p className="mt-5 text-sm sm:text-base leading-relaxed text-muted-foreground">
                  Tell us what you're planning — dimensions, sketches, materials, photographs or simply an idea. Our team can discuss a custom metalwork solution with you.
                </p>

                <div className="mt-10 flex flex-wrap items-center gap-4">
                  <Link
                    to="/contact"
                    search={{
                      category: "Custom Metalwork",
                      product: "Bespoke Metalwork Project",
                    }}
                    className="inline-flex items-center gap-3 bg-charcoal px-8 py-4 text-[0.72rem] font-bold tracking-[0.2em] text-ivory uppercase shadow-lift transition-all hover:bg-bronze hover:scale-[1.01]"
                  >
                    <span>START A CUSTOM PROJECT</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>

                  <button
                    type="button"
                    onClick={handleCustomQuote}
                    className="inline-flex items-center gap-2.5 border border-foreground/30 bg-transparent px-7 py-4 text-[0.72rem] font-bold tracking-[0.18em] text-foreground uppercase transition-colors hover:border-bronze hover:text-bronze"
                  >
                    <MessageCircle className="h-4 w-4 text-bronze" />
                    <span>WHATSAPP DIRECT</span>
                  </button>
                </div>
              </div>
            </div>
          ) : activeCategory === "furniture" && filteredProducts.length === 0 ? (
            /* FURNITURE COMING SOON EMPTY STATE */
            <div className="border border-hairline bg-card p-10 sm:p-16 text-center max-w-2xl mx-auto shadow-soft">
              <span className="inline-grid h-14 w-14 place-items-center rounded-full bg-sand text-bronze mb-5 border border-hairline">
                <Armchair className="h-7 w-7" />
              </span>
              <p className="label-xs text-bronze font-semibold uppercase tracking-[0.22em]">
                BESPOKE FURNITURE
              </p>
              <h3 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl text-foreground uppercase">
                Furniture collection coming soon.
              </h3>
              <p className="mt-4 text-xs sm:text-sm leading-relaxed text-muted-foreground max-w-md mx-auto">
                Our bespoke metal furniture collection is currently being developed. New pieces will appear here as they are added.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <Link
                  to="/contact"
                  search={{
                    category: "Furniture",
                    product: "Bespoke Metal Furniture Inquiry",
                  }}
                  className="inline-flex items-center gap-2 bg-charcoal px-6 py-3.5 text-[0.7rem] font-bold tracking-[0.2em] text-ivory uppercase transition-colors hover:bg-bronze"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>ENQUIRE ABOUT CUSTOM WORK →</span>
                </Link>
                <button
                  type="button"
                  onClick={() => setActiveCategory("railings")}
                  className="inline-flex items-center gap-2 border border-hairline px-6 py-3.5 text-[0.7rem] font-bold tracking-[0.18em] uppercase transition-colors hover:border-bronze hover:text-bronze"
                >
                  <span>VIEW RAILINGS CATALOGUE</span>
                </button>
              </div>
            </div>
          ) : filteredProducts.length > 0 ? (
            /* NORMAL PRODUCT & SHOWCASE GRID */
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
              {filteredProducts.map((p, i) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  index={i}
                  selected={p.id === selectedId}
                  currency={settings.currency}
                  onView={handleCardView}
                  onSelect={handleCardSelect}
                  onDeselect={handleCardDeselect}
                />
              ))}
            </div>
          ) : (
            /* GENERAL EMPTY STATE */
            <div className="border border-hairline bg-sand/30 p-10 sm:p-16 text-center max-w-2xl mx-auto">
              <span className="inline-grid h-12 w-12 place-items-center rounded-full bg-sand text-bronze mb-4">
                <Hammer className="h-6 w-6" />
              </span>
              <p className="label-xs text-bronze font-semibold uppercase tracking-[0.22em]">
                EXPANDING ARCHIVE
              </p>
              <h3 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl">
                THIS COLLECTION IS CURRENTLY BEING EXPANDED.
              </h3>
              <p className="mt-4 text-xs leading-relaxed text-muted-foreground sm:text-sm max-w-md mx-auto">
                Our master artisans fabricate handcrafted railings, metal structures, and bespoke furniture to specification.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handleCustomQuote}
                  className="inline-flex items-center gap-2 bg-charcoal px-6 py-3.5 text-[0.7rem] font-bold tracking-[0.2em] text-ivory uppercase transition-colors hover:bg-bronze"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>ENQUIRE ABOUT CUSTOM WORK →</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCategory("railings")}
                  className="inline-flex items-center gap-2 border border-hairline px-6 py-3.5 text-[0.7rem] font-bold tracking-[0.18em] uppercase transition-colors hover:border-bronze hover:text-bronze"
                >
                  <span>VIEW RAILINGS CATALOGUE</span>
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* ── 05 MODAL ── */}
      <ProductModal
        product={openProduct}
        selected={openProduct?.id === selectedId}
        currency={settings.currency}
        onClose={() => setOpenProduct(null)}
        onDeselect={(p) => {
          selectProduct(null);
          setOpenProduct(null);
          toast.success(`${p.code} deselected`);
        }}
        onSelect={(p) => {
          handleSelect(p, true);
          if (onAfterSelect) {
            onAfterSelect(p);
          } else {
            navigate({ to: "/calculator" });
          }
        }}
      />
    </div>
  );
}
