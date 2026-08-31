import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState, useCallback, useRef } from "react";
import { EASE } from "./Reveal";
import { useReducedMotion } from "@/hooks/useFocusTrap";

export interface HeroSlide {
  id: string;
  num: string;
  category: string;
  image: string;
  alt: string;
}

export const HERO_SLIDES: HeroSlide[] = [
  {
    id: "railings",
    num: "01",
    category: "RAILINGS",
    image: "/images/railings/hero.jpg",
    alt: "Handcrafted architectural steel staircase railing by Metal Work Nepal",
  },
  {
    id: "structures",
    num: "02",
    category: "METAL & GLASS STRUCTURES",
    image: "/images/rooms/kausi_ghar.jpg",
    alt: "Bespoke steel frame glass rooftop room and architectural enclosure",
  },
  {
    id: "furniture",
    num: "03",
    category: "METAL FURNITURE",
    image: "/images/furniture/hero_furniture.jpg",
    alt: "Custom handcrafted architectural metal and wood furniture",
  },
];

const SLIDE_DURATION = 2400; // ~2.4 seconds per slide for smooth cinematic pacing

export function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const reducedMotion = useReducedMotion();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  }, []);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  // Synchronized automatic slider loop
  useEffect(() => {
    if (isPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      nextSlide();
    }, SLIDE_DURATION);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPaused, nextSlide]);

  const activeSlideData: HeroSlide = HERO_SLIDES[currentSlide] ?? {
    id: "railings",
    num: "01",
    category: "RAILINGS",
    image: "/images/railings/hero.jpg",
    alt: "Handcrafted architectural steel staircase railing by Metal Work Nepal",
  };

  return (
    <section
      aria-label="Metal Work Nepal Hero"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative min-h-[92vh] sm:min-h-screen w-full overflow-hidden bg-charcoal select-none"
    >
      {/* ── 01 CINEMATIC BACKGROUND SLIDER ── */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence initial={false} mode="sync">
          <motion.div
            key={activeSlideData.id}
            initial={{ opacity: 0 }}
            animate={{
              opacity: 1,
              scale: reducedMotion.current ? 1 : [1.0, 1.025],
            }}
            exit={{ opacity: 0 }}
            transition={{
              opacity: { duration: 0.85, ease: EASE },
              scale: { duration: SLIDE_DURATION / 1000 + 0.8, ease: "linear" },
            }}
            className="absolute inset-0 h-full w-full"
          >
            <img
              src={activeSlideData.image}
              alt={activeSlideData.alt}
              className="h-full w-full object-cover object-center"
              loading={currentSlide === 0 ? "eager" : "lazy"}
              fetchPriority={currentSlide === 0 ? "high" : "low"}
            />
          </motion.div>
        </AnimatePresence>

        {/* Cinematic Multi-Layer Overlays (Ensures Navbar & Editorial Text Legibility) */}
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/95 via-charcoal/60 to-charcoal/30 sm:bg-gradient-to-r sm:from-charcoal/92 sm:via-charcoal/65 sm:to-charcoal/20" />
        <div className="absolute inset-0 bg-gradient-to-b from-charcoal/70 via-transparent to-transparent pointer-events-none" />
      </div>

      {/* Hidden preloads for next slides */}
      <div className="hidden" aria-hidden="true">
        {HERO_SLIDES.map((slide) => (
          <img key={slide.id} src={slide.image} alt="" />
        ))}
      </div>

      {/* ── 02 STABLE EDITORIAL CONTENT ── */}
      <div className="relative z-10 mx-auto flex min-h-[92vh] sm:min-h-screen max-w-[1440px] flex-col justify-end px-5 pt-32 pb-16 sm:pb-20 md:px-10 lg:px-16 md:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-end">
          {/* Main Brand Messaging (Left Column on Desktop) */}
          <div className="lg:col-span-8 flex flex-col justify-end">
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: EASE }}
              className="label-xs text-bronze-soft font-semibold tracking-[0.24em] uppercase"
            >
              METAL WORK NEPAL
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: EASE }}
              className="mt-4 max-w-3xl text-4xl leading-[1.04] tracking-tight text-ivory sm:text-6xl lg:text-7xl font-extrabold uppercase"
            >
              ARCHITECTURAL
              <br />
              <span className="font-serif italic font-normal text-bronze-soft lowercase">
                metalwork
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.35, ease: EASE }}
              className="mt-4 text-base sm:text-lg font-medium text-ivory/90 tracking-wide"
            >
              Crafted in Nepal. Built for remarkable spaces.
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.45, ease: EASE }}
              className="mt-3 max-w-xl text-xs sm:text-sm leading-relaxed text-ivory/75 font-normal"
            >
              Handcrafted railings, metal & glass structures, and bespoke furniture designed and
              fabricated for contemporary spaces.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.55, ease: EASE }}
              className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center"
            >
              <Link
                to="/collection"
                className="bg-ivory px-8 py-4 text-center text-[0.72rem] font-bold tracking-[0.22em] text-charcoal uppercase shadow-lift transition-all duration-300 hover:bg-bronze hover:text-ivory"
              >
                EXPLORE OUR WORK →
              </Link>
              <Link
                to="/contact"
                className="border border-ivory/35 bg-ivory/5 backdrop-blur-xs px-8 py-4 text-center text-[0.72rem] font-bold tracking-[0.22em] text-ivory uppercase transition-all duration-300 hover:border-ivory hover:bg-ivory/15"
              >
                START A PROJECT →
              </Link>
            </motion.div>
          </div>

          {/* ── 03 MINIMAL CATEGORY & PROGRESS INDICATOR (Right Column on Desktop) ── */}
          <div className="lg:col-span-4 flex flex-col justify-end lg:items-end">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.6, ease: EASE }}
              className="w-full max-w-xs border-t border-hairline/40 pt-4"
            >
              {/* Category Indicator Text */}
              <div className="flex items-center justify-between gap-4">
                <span className="text-[0.66rem] font-bold font-mono tracking-[0.2em] text-bronze-soft uppercase">
                  {activeSlideData.num} / {String(HERO_SLIDES.length).padStart(2, "0")}
                </span>
                <AnimatePresence mode="wait">
                  <motion.span
                    key={activeSlideData.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.25, ease: EASE }}
                    className="text-[0.68rem] font-bold tracking-[0.22em] text-ivory uppercase text-right truncate"
                  >
                    {activeSlideData.category}
                  </motion.span>
                </AnimatePresence>
              </div>

              {/* Synchronized Progress Indicator Bars */}
              <div className="mt-3 grid grid-cols-3 gap-1.5 w-full">
                {HERO_SLIDES.map((slide, idx) => {
                  const isActive = currentSlide === idx;
                  const isPast = currentSlide > idx;

                  return (
                    <button
                      key={slide.id}
                      type="button"
                      onClick={() => goToSlide(idx)}
                      aria-label={`Jump to slide ${slide.num}: ${slide.category}`}
                      className="group relative h-1 w-full overflow-hidden bg-ivory/20 transition-colors hover:bg-ivory/40"
                    >
                      {isActive ? (
                        <motion.div
                          key={`progress-${currentSlide}`}
                          initial={{ width: "0%" }}
                          animate={{ width: "100%" }}
                          transition={{
                            duration: SLIDE_DURATION / 1000,
                            ease: "linear",
                          }}
                          className="h-full bg-bronze-soft"
                        />
                      ) : (
                        <div
                          className={`h-full ${isPast ? "bg-ivory/60" : "bg-transparent"} transition-all`}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
