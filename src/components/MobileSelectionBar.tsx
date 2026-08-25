import { Link, useRouterState } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, X } from "lucide-react";
import { useStudio } from "@/hooks/useStudio";
import { EASE } from "./Reveal";

export function MobileSelectionBar() {
  const { selectedProduct, selectProduct } = useStudio();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const hidden = pathname.startsWith("/calculator") || pathname.startsWith("/admin");

  return (
    <AnimatePresence>
      {selectedProduct && !hidden ? (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.32, ease: EASE }}
          className="fixed inset-x-0 bottom-0 z-40 border-t border-hairline bg-background/95 backdrop-blur-xl lg:hidden"
        >
          <div className="flex items-center justify-between gap-3 px-5 py-3">
            <div className="flex min-w-0 items-center gap-2.5">
              <button
                type="button"
                onClick={() => selectProduct(null)}
                aria-label="Deselect railing"
                className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-hairline bg-sand/60 text-muted-foreground hover:bg-destructive/15 hover:text-destructive"
              >
                <X className="h-3.5 w-3.5" />
              </button>
              <div className="min-w-0">
                <p className="text-[0.68rem] tracking-[0.2em] text-bronze uppercase">
                  {selectedProduct.code} Selected
                </p>
                <p className="truncate text-xs text-muted-foreground">{selectedProduct.name}</p>
              </div>
            </div>
            <Link
              to="/calculator"
              className="flex shrink-0 items-center gap-2 bg-charcoal px-5 py-3.5 text-[0.68rem] tracking-[0.2em] text-ivory uppercase"
            >
              Calculate <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
