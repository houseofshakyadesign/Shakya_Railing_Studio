import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { EASE, Reveal } from "./Reveal";

interface PortalCardItem {
  id: string;
  index: string;
  eyebrow: string;
  title: string;
  description: string;
  ctaText: string;
  href: string;
  image: string;
  alt: string;
}

const PORTAL_CARDS: PortalCardItem[] = [
  {
    id: "products",
    index: "01",
    eyebrow: "01 — COLLECTION",
    title: "OUR PRODUCTS",
    description:
      "Explore our collection of handcrafted metalwork, architectural structures and bespoke pieces.",
    ctaText: "EXPLORE COLLECTION",
    href: "/collection",
    image: "/images/railings/craft.jpg",
    alt: "Metal Work Nepal handcrafted architectural metalwork product collection",
  },
  {
    id: "projects",
    index: "02",
    eyebrow: "02 — PROJECTS",
    title: "OUR PROJECTS",
    description:
      "Explore completed work and custom architectural site installations by Metal Work Nepal.",
    ctaText: "VIEW PROJECTS",
    href: "/projects",
    image: "/images/railings/r01.jpg",
    alt: "Completed architectural metalwork and railing installations by Metal Work Nepal",
  },
];

export function ExplorePortals() {
  return (
    <section
      aria-label="Explore Metal Work Nepal"
      className="relative z-10 mx-auto max-w-[1440px] px-5 py-20 md:px-10 lg:px-16 md:py-32"
    >
      {/* ── 01 SECTION INTRODUCTION ── */}
      <div className="max-w-2xl">
        <Reveal>
          <div className="flex items-center gap-3">
            <span className="label-xs text-bronze font-semibold uppercase tracking-[0.24em]">
              01 EXPLORE METAL WORK NEPAL
            </span>
          </div>
        </Reveal>

        <Reveal delay={0.08}>
          <h2 className="mt-3 text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight uppercase leading-[1.12] text-foreground">
            Explore our work,
            <br />
            <span className="font-serif italic font-normal text-bronze lowercase">from</span>{" "}
            crafted products{" "}
            <span className="font-serif italic font-normal text-bronze lowercase">to</span>{" "}
            completed spaces.
          </h2>
        </Reveal>
      </div>

      {/* ── 02 TWO LARGE BALANCED ARCHITECTURAL CARDS ── */}
      <div className="mt-12 md:mt-16 grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10 items-stretch">
        {PORTAL_CARDS.map((card, idx) => (
          <Reveal key={card.id} delay={0.1 + idx * 0.12} className="h-full">
            <Link
              to={card.href}
              aria-label={`${card.title} - ${card.description}`}
              className="group relative flex flex-col justify-end overflow-hidden border border-hairline bg-charcoal aspect-[4/5] sm:aspect-[16/13] md:aspect-[4/5] w-full transition-all duration-500 hover:border-bronze/60 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-bronze"
            >
              {/* Background Photography with Ken-Burns Hover Zoom */}
              <div className="absolute inset-0 z-0 overflow-hidden">
                <img
                  src={card.image}
                  alt={card.alt}
                  className="h-full w-full object-cover object-center transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
                  loading="lazy"
                />

                {/* Layered Architectural Gradient Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal/95 via-charcoal/50 to-charcoal/15 transition-opacity duration-500 group-hover:opacity-95" />
                <div className="absolute inset-0 bg-charcoal/20 transition-colors duration-500 group-hover:bg-charcoal/35" />
              </div>

              {/* Top Index Badge */}
              <div className="absolute top-6 left-6 sm:top-8 sm:left-8 z-10">
                <span className="text-[0.66rem] font-mono font-bold tracking-[0.24em] text-bronze-soft uppercase bg-charcoal/70 backdrop-blur-xs px-2.5 py-1 border border-hairline/40">
                  {card.index}
                </span>
              </div>

              {/* Bottom Editorial Content */}
              <div className="relative z-10 p-6 sm:p-8 lg:p-10 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-1">
                <p className="label-xs text-bronze-soft font-semibold tracking-[0.22em] uppercase">
                  {card.eyebrow}
                </p>

                <h3 className="mt-2 text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight uppercase text-ivory">
                  {card.title}
                </h3>

                <p className="mt-3 text-xs sm:text-sm leading-relaxed text-ivory/80 max-w-md line-clamp-2">
                  {card.description}
                </p>

                {/* CTA Link with Smooth Animated Arrow */}
                <div className="mt-6 inline-flex items-center gap-2.5 text-[0.72rem] font-bold tracking-[0.2em] uppercase text-ivory transition-colors duration-300 group-hover:text-bronze-soft">
                  <span className="border-b border-ivory/40 pb-0.5 transition-colors duration-300 group-hover:border-bronze-soft">
                    {card.ctaText}
                  </span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:translate-x-1.5" />
                </div>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
