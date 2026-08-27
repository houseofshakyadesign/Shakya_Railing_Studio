import { useNavigate } from "@tanstack/react-router";
import { useCallback, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import type { Product } from "@/data/products";
import { useStudio } from "@/hooks/useStudio";
import { ProductCard } from "./ProductCard";
import { ProductModal } from "./ProductModal";
import { EASE } from "./Reveal";

export type ApplicationFilter = "all" | "staircase" | "balcony_loft" | "grilles_gates";

export const APPLICATION_FILTERS: { id: ApplicationFilter; label: string }[] = [
  { id: "all", label: "ALL" },
  { id: "staircase", label: "STAIRCASE" },
  { id: "balcony_loft", label: "BALCONY / LOFT" },
  { id: "grilles_gates", label: "GRILLES & GATES" },
];

export function ProductGrid({
  limit,
  showFilter,
  onAfterSelect,
}: {
  limit?: number;
  showFilter?: boolean;
  onAfterSelect?: (product: Product) => void;
}) {
  const shouldShowFilter = showFilter !== undefined ? showFilter : !limit;
  const { activeProducts, selectedId, selectProduct, settings } = useStudio();
  const [openProduct, setOpenProduct] = useState<Product | null>(null);
  const [activeFilter, setActiveFilter] = useState<ApplicationFilter>("all");
  const navigate = useNavigate();

  const baseProducts = limit ? activeProducts.slice(0, limit) : activeProducts;

  // Filter products based on selected application classification
  const filteredProducts = useMemo(() => {
    if (!shouldShowFilter || activeFilter === "all") return baseProducts;
    return baseProducts.filter((p) => p.application === activeFilter);
  }, [baseProducts, activeFilter, shouldShowFilter]);

  const handleSelect = useCallback((p: Product, close = false) => {
    selectProduct(p.id);
    if (close) setOpenProduct(null);
  }, [selectProduct]);

  const handleCardSelect = useCallback((p: Product) => {
    if (p.id === selectedId) {
      selectProduct(null);
      toast.success(`${p.code} deselected`);
      return;
    }
    handleSelect(p);
    if (onAfterSelect) {
      onAfterSelect(p);
    } else {
      toast.success(`${p.code} selected`, { description: p.name });
      navigate({ to: "/calculator" });
    }
  }, [selectedId, selectProduct, handleSelect, onAfterSelect, navigate]);

  if (baseProducts.length === 0) {
    return (
      <div className="border border-dashed border-hairline px-6 py-24 text-center">
        <p className="label-xs text-bronze">Empty collection</p>
        <h3 className="mt-4 text-2xl tracking-tight">No railings available</h3>
        <p className="mt-3 text-sm text-muted-foreground">
          Railing designs will appear here once they are published by the studio.
        </p>
      </div>
    );
  }

  return (
    <div>
      {/* ── SHOP BY APPLICATION FILTER ── */}
      {shouldShowFilter && (
        <div className="mb-10 sm:mb-12">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between border-b border-hairline pb-5">
            <div>
              <p className="label-xs text-bronze font-semibold uppercase tracking-[0.22em]">
                SHOP BY APPLICATION
              </p>
              <div className="mt-3 flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
                {APPLICATION_FILTERS.map((f) => {
                  const isActive = activeFilter === f.id;
                  return (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => setActiveFilter(f.id)}
                      className={`shrink-0 px-4 py-2.5 text-[0.68rem] tracking-[0.18em] uppercase transition-all duration-300 font-medium ${isActive
                          ? "bg-charcoal text-ivory shadow-sm border border-charcoal"
                          : "bg-transparent text-foreground/75 border border-hairline hover:border-foreground/40 hover:text-foreground"
                        }`}
                    >
                      {f.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Result Count */}
            <p className="shrink-0 text-[0.68rem] tracking-[0.2em] uppercase text-muted-foreground font-mono">
              {String(filteredProducts.length).padStart(2, "0")} {filteredProducts.length === 1 ? "PRODUCT" : "PRODUCTS"}
            </p>
          </div>
        </div>
      )}

      {/* ── PRODUCT GRID WITH SMOOTH TRANSITION ── */}
      {filteredProducts.length === 0 ? (
        <div className="border border-dashed border-hairline px-6 py-20 text-center">
          <p className="label-xs text-bronze uppercase tracking-[0.2em]">NO PRODUCTS FOUND</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Please check another application.
          </p>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={activeFilter}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.32, ease: EASE }}
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8"
          >
            {filteredProducts.map((p, i) => (
              <ProductCard
                key={p.id}
                product={p}
                index={i}
                selected={p.id === selectedId}
                currency={settings.currency}
                onView={setOpenProduct}
                onSelect={handleCardSelect}
              />
            ))}
          </motion.div>
        </AnimatePresence>
      )}

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
