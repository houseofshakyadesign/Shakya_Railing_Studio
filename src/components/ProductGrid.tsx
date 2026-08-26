import { useNavigate } from "@tanstack/react-router";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import type { Product } from "@/data/products";
import { useStudio } from "@/hooks/useStudio";
import { ProductCard } from "./ProductCard";
import { ProductModal } from "./ProductModal";

export function ProductGrid({
  limit,
  onAfterSelect,
}: {
  limit?: number;
  onAfterSelect?: (product: Product) => void;
}) {
  const { activeProducts, selectedId, selectProduct, settings } = useStudio();
  const [openProduct, setOpenProduct] = useState<Product | null>(null);
  const navigate = useNavigate();

  const products = limit ? activeProducts.slice(0, limit) : activeProducts;

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

  if (products.length === 0) {
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
    <>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 lg:gap-8">
        {products.map((p, i) => (
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
      </div>

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
    </>
  );
}
