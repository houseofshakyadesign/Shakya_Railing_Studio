import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { EASE } from "@/components/Reveal";
import type { ProjectMedia } from "@/data/projects";

type LightboxProps = {
  media: ProjectMedia[];
  currentIndex: number;
  open: boolean;
  onClose: () => void;
  onNavigate: (index: number) => void;
};

export function Lightbox({
  media,
  currentIndex,
  open,
  onClose,
  onNavigate,
}: LightboxProps) {
  const current = media[currentIndex];

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") {
        onNavigate((currentIndex - 1 + media.length) % media.length);
      }
      if (e.key === "ArrowRight") {
        onNavigate((currentIndex + 1) % media.length);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open, currentIndex, media.length, onClose, onNavigate]);

  return (
    <AnimatePresence>
      {open && current && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Media Lightbox"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.28, ease: EASE }}
          onClick={onClose}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-charcoal/95 p-4 backdrop-blur-md md:p-8"
        >
          {/* Top Controls Bar */}
          <div className="absolute top-4 right-4 z-20 flex items-center gap-4 md:top-6 md:right-8">
            <span className="text-[0.72rem] font-bold tracking-[0.2em] text-ivory/60 uppercase">
              {currentIndex + 1} / {media.length}
            </span>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close Lightbox"
              className="grid h-10 w-10 place-items-center rounded-none border border-hairline/20 bg-charcoal/80 text-ivory transition-colors hover:border-bronze hover:text-bronze"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation: Prev Button */}
          {media.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onNavigate((currentIndex - 1 + media.length) % media.length);
              }}
              aria-label="Previous Media"
              className="absolute left-4 top-1/2 z-20 -translate-y-1/2 grid h-12 w-12 place-items-center border border-hairline/20 bg-charcoal/80 text-ivory transition-colors hover:border-bronze hover:text-bronze md:left-8"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}

          {/* Media Content Container */}
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative flex max-h-[85vh] max-w-[90vw] flex-col items-center justify-center"
          >
            {current.mediaType === "video" ? (
              <video
                key={current.id || current.mediaUrl}
                poster={current.thumbnailUrl}
                controls
                autoPlay
                playsInline
                preload="metadata"
                className="max-h-[75vh] max-w-full object-contain shadow-lift"
              >
                <source src={current.mediaUrl} type="video/mp4" />
                <source src={current.mediaUrl.replace(/\.mov$/, ".mp4")} type="video/mp4" />
                <source src={current.mediaUrl} type="video/quicktime" />
                Your browser does not support the video tag.
              </video>
            ) : (
              <motion.img
                key={current.id}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.28, ease: EASE }}
                src={current.mediaUrl}
                alt={current.caption || "Project photo"}
                className="max-h-[75vh] max-w-full object-contain shadow-lift"
              />
            )}

            {/* Caption */}
            {current.caption && (
              <p className="mt-4 max-w-xl text-center text-xs tracking-wider text-ivory/80">
                {current.caption}
              </p>
            )}
          </div>

          {/* Navigation: Next Button */}
          {media.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onNavigate((currentIndex + 1) % media.length);
              }}
              aria-label="Next Media"
              className="absolute right-4 top-1/2 z-20 -translate-y-1/2 grid h-12 w-12 place-items-center border border-hairline/20 bg-charcoal/80 text-ivory transition-colors hover:border-bronze hover:text-bronze md:right-8"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
