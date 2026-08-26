import { Link } from "@tanstack/react-router";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { EASE } from "./Reveal";
import { useReducedMotion } from "@/hooks/useFocusTrap";

export function Hero() {
  const ref = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const reducedMotion = useReducedMotion();
  const y = useTransform(scrollYProgress, [0, 1], ["0%", reducedMotion.current ? "0%" : "12%"]);

  return (
    <section ref={ref} className="relative min-h-[92vh] overflow-hidden bg-charcoal">
      <motion.div
        className="absolute inset-0"
        style={{ y }}
        initial={{ scale: 1.08, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.6, ease: EASE }}
      >
        <img
          src="/images/railings/hero.jpg"
          alt="Minimal black steel staircase railing in a warm ivory interior"
          width={1920}
          height={1200}
          className="h-[112%] w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-charcoal/85 via-charcoal/45 to-charcoal/10" />
      </motion.div>

      <div className="relative mx-auto flex min-h-[92vh] max-w-[1440px] flex-col justify-end px-5 pt-32 pb-20 md:px-10 md:pb-28">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15, ease: EASE }}
          className="label-xs text-bronze-soft"
        >
          Metal Work Nepal · Railing Studio
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.25, ease: EASE }}
          className="mt-6 max-w-4xl text-4xl leading-[1.02] tracking-tight text-ivory sm:text-6xl lg:text-7xl"
        >
          Railings, designed to
          <span className="display-serif italic"> define </span>
          your space.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4, ease: EASE }}
          className="mt-7 max-w-xl text-base leading-relaxed text-ivory/70"
        >
          Explore contemporary railing systems, choose your preferred design, calculate your
          estimated cost and send your requirement directly to our team.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5, ease: EASE }}
          className="mt-10 flex flex-col gap-3 sm:flex-row"
        >
          <Link
            to="/collection"
            className="bg-ivory px-9 py-4 text-center text-[0.72rem] tracking-[0.22em] text-charcoal uppercase transition-colors duration-300 hover:bg-bronze hover:text-ivory"
          >
            Explore Collection
          </Link>
          <Link
            to="/calculator"
            className="border border-ivory/35 px-9 py-4 text-center text-[0.72rem] tracking-[0.22em] text-ivory uppercase transition-colors duration-300 hover:border-ivory hover:bg-ivory/10"
          >
            Calculate Price
          </Link>
        </motion.div>
      </div>

      <motion.div
        aria-hidden="true"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1, duration: 0.6 }}
        className="absolute right-5 bottom-8 hidden flex-col items-center gap-3 md:right-10 md:flex"
      >
        <span className="text-[0.6rem] tracking-[0.3em] text-ivory/70 uppercase">Scroll</span>
        <div className="h-16 w-px overflow-hidden bg-ivory/20">
          <motion.div
            className="h-6 w-px bg-bronze-soft"
            animate={{ y: [-24, 64] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </motion.div>
    </section>
  );
}
