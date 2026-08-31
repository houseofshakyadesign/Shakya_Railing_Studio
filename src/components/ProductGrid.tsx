import { Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Layers, MessageCircle, Sparkles } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@/data/products";
import { useStudio } from "@/hooks/useStudio";
import { ProductCard, isRailingProduct } from "./ProductCard";
import { ProductModal } from "./ProductModal";
import { EASE } from "./Reveal";

export type MasterCategory = "all" | "railings" | "grilles" | "gates" | "metal_glass" | "custom";
export type RailingFilter = "all_railings" | "staircase" | "balcony_loft";

export const MASTER_CATEGORIES: { id: MasterCategory; label: string }[] = [
  { id: "all", label: "ALL" },
  { id: "railings", label: "RAILINGS" },
  { id: "grilles", label: "GRILLES" },
  { id: "gates", label: "GATES" },
  { id: "metal_glass", label: "METAL & GLASS ENCLOSED ROOMS" },
  { id: "custom", label: "CUSTOM" },
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

  const baseProducts = limit ? activeProducts.slice(0, limit) : activeProducts;

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

    if (activeCategory === "grilles") {
      return baseProducts.filter((p) => {
        const cat = (p.category || "").toLowerCase();
        const name = (p.name || "").toLowerCase();
        const nepali = p.nepaliName || "";
        const apps = (p.applications || []).map((a) => a.toLowerCase());
        return (
          cat === "grilles" ||
          cat.includes("grille") ||
          name.includes("grille") ||
          name.includes("jali") ||
          nepali.includes("जाली") ||
          apps.some((a) => a.includes("grille") || a.includes("jali"))
        );
      });
    }

    if (activeCategory === "gates") {
      return baseProducts.filter((p) => {
        const cat = (p.category || "").toLowerCase();
        const name = (p.name || "").toLowerCase();
        const nepali = p.nepaliName || "";
        const apps = (p.applications || []).map((a) => a.toLowerCase());
        return (
          cat === "gates" ||
          cat.includes("gate") ||
          name.includes("gate") ||
          name.includes("dhoka") ||
          nepali.includes("ढोका") ||
          apps.some((a) => a.includes("gate") || a.includes("dhoka"))
        );
      });
    }

    if (activeCategory === "metal_glass") {
      return baseProducts.filter((p) => {
        const cat = (p.category || "").toLowerCase();
        const name = (p.name || "").toLowerCase();
        const apps = (p.applications || []).map((a) => a.toLowerCase());
        return (
          cat.includes("enclosed") ||
          cat.includes("glass") ||
          p.application === "metal_glass" ||
          p.id.startsWith("mg") ||
          apps.some((a) => a.includes("room") || a.includes("sunroom") || a.includes("glass")) ||
          name.includes("room") ||
          name.includes("sunroom")
        );
      });
    }

    if (activeCategory === "custom") {
      return baseProducts.filter((p) => {
        const cat = (p.category || "").toLowerCase();
        return p.isCustom || cat.includes("custom");
      });
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

  if (baseProducts.length === 0) {
    return (
      <div className="border border-dashed border-hairline px-6 py-24 text-center">
        <p className="label-xs text-bronze uppercase tracking-[0.2em]">CATALOGUE</p>
        <h3 className="mt-4 text-2xl tracking-tight font-extrabold">Collection expanding</h3>
        <p className="mt-3 text-sm text-muted-foreground max-w-md mx-auto">
          Designs are being published by our Sita Complex studio. Please check back shortly or
          contact our team directly.
        </p>
      </div>
    );
  }

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

            {/* Result Counter */}
            <p className="shrink-0 text-[0.68rem] tracking-[0.2em] uppercase text-muted-foreground font-mono">
              {String(filteredProducts.length).padStart(2, "0")}{" "}
              {filteredProducts.length === 1 ? "DESIGN" : "DESIGNS"}
            </p>
          </div>

          {/* ── 02 SUPPORTING STATEMENT FOR METAL & GLASS ENCLOSED ROOMS ── */}
          {activeCategory === "metal_glass" && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 flex items-center gap-3 border-l-2 border-bronze bg-sand/25 px-4 py-2.5"
            >
              <p className="text-xs sm:text-sm font-medium text-foreground/85 tracking-wide">
                Hand-built steel-frame glass rooms, finished in black matt deco paint.
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

      {/* ── 04 PRODUCT & SHOWCASE GRID ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${activeCategory}-${activeRailingFilter}`}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3, ease: EASE }}
        >
          {filteredProducts.length > 0 ? (
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

              {/* Showcase Highlight for Custom */}
              {activeCategory === "custom" && (
                <div className="flex flex-col justify-between border border-hairline bg-sand/60 p-8">
                  <div>
                    <span className="label-xs text-bronze font-semibold uppercase tracking-[0.24em]">
                      BESPOKE FABRICATION
                    </span>
                    <h3 className="mt-4 text-2xl font-extrabold tracking-tight sm:text-3xl uppercase leading-tight">
                      SOMETHING SPECIFIC IN MIND?
                    </h3>
                    <p className="mt-4 text-xs leading-relaxed text-muted-foreground sm:text-sm">
                      From custom curved centerpieces and arched entry gates to one-off sculptural
                      metal elements — our Sita Complex craftsmen fabricate bespoke architectural
                      projects from scratch.
                    </p>
                  </div>
                  <div className="mt-8 flex flex-col gap-3">
                    <Link
                      to="/contact"
                      className="flex w-full items-center justify-between bg-charcoal px-6 py-3.5 text-[0.7rem] font-bold tracking-[0.2em] text-ivory uppercase transition-colors hover:bg-bronze"
                    >
                      <span>START A PROJECT</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* ── REFINED EMPTY / EXPANDING STATE ── */
            <div className="border border-hairline bg-sand/30 p-10 sm:p-16 text-center max-w-2xl mx-auto">
              <span className="inline-grid h-12 w-12 place-items-center rounded-full bg-sand text-bronze mb-4">
                <Layers className="h-6 w-6" />
              </span>
              <p className="label-xs text-bronze font-semibold uppercase tracking-[0.22em]">
                EXPANDING ARCHIVE
              </p>
              <h3 className="mt-3 text-2xl font-extrabold tracking-tight sm:text-3xl">
                THIS COLLECTION IS CURRENTLY BEING EXPANDED.
              </h3>
              <p className="mt-4 text-xs leading-relaxed text-muted-foreground sm:text-sm max-w-md mx-auto">
                Our master artisans fabricate custom grilles, gates, metal + glass rooms, and
                architectural metalwork on a bespoke project basis.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handleCustomQuote}
                  className="inline-flex items-center gap-2 bg-charcoal px-6 py-3.5 text-[0.7rem] font-bold tracking-[0.2em] text-ivory uppercase transition-colors hover:bg-bronze"
                >
                  <MessageCircle className="h-4 w-4" />
                  ENQUIRE ABOUT CUSTOM WORK →
                </button>
                <button
                  type="button"
                  onClick={() => setActiveCategory("railings")}
                  className="inline-flex items-center gap-2 border border-hairline px-6 py-3.5 text-[0.7rem] font-bold tracking-[0.18em] uppercase transition-colors hover:border-bronze hover:text-bronze"
                >
                  VIEW RAILINGS CATALOGUE
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* ── 04 MODAL ── */}
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
