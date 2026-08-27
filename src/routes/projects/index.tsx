import { useRef } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowDown, ArrowRight, ArrowUpRight } from "lucide-react";
import { useStudio } from "@/hooks/useStudio";
import { Reveal, EASE } from "@/components/Reveal";
import { ProjectCard } from "@/components/ProjectCard";
import { FinalCTA } from "@/components/FinalCTA";

const title = "Completed Projects | Metal Work Nepal — Railing Studio";
const description =
  "Explore completed railing and architectural metalwork projects crafted by Metal Work Nepal across Nepal. High-end balcony, staircase, and custom fabrication installations.";

export const Route = createFileRoute("/projects/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProjectsPage,
});

function ProjectsPage() {
  const { activeProjects } = useStudio();
  const gridRef = useRef<HTMLElement | null>(null);

  const scrollToGrid = () => {
    gridRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      {/* 1. CINEMATIC HERO */}
      <section className="relative min-h-[70vh] overflow-hidden bg-charcoal">
        <div className="absolute inset-0">
          <img
            src="/images/railings/hero.jpg"
            alt="Metal Work Nepal Completed Projects"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/65 to-charcoal/25" />
        </div>

        <div className="relative mx-auto flex min-h-[70vh] max-w-[1440px] flex-col justify-end px-6 pt-36 pb-16 md:px-10 lg:px-16 md:pb-24">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: EASE }}
            className="flex items-center gap-2 text-bronze-soft"
          >
            <span className="label-xs uppercase tracking-[0.24em]">Portfolio & Executions</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: EASE }}
            className="mt-4 max-w-4xl text-4xl leading-[1.05] font-light tracking-tight text-ivory sm:text-6xl lg:text-7xl uppercase"
          >
            Completed <span className="display-serif italic font-normal lowercase">Projects</span>.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35, ease: EASE }}
            className="mt-5 max-w-xl text-sm leading-relaxed text-ivory/70 sm:text-base"
          >
            Selected architectural metalwork and custom railing installations engineered and executed by
            Metal Work Nepal across private residences and contemporary spaces.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5, ease: EASE }}
            className="mt-8"
          >
            <button
              type="button"
              onClick={scrollToGrid}
              className="group inline-flex items-center gap-3 border border-ivory/30 bg-ivory/10 px-6 py-3.5 text-[0.72rem] font-bold tracking-[0.2em] text-ivory uppercase backdrop-blur-md transition-colors hover:border-bronze hover:bg-bronze hover:text-ivory"
            >
              <span>Explore Catalogue</span>
              <ArrowDown className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-y-1" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* 2. PROJECT CATALOGUE (STRICT 2-COLUMN 4:3 GRID) */}
      <section ref={gridRef} id="projects-grid" className="mx-auto max-w-[1440px] px-6 py-16 md:px-10 lg:px-16 md:py-24">
        <div className="border-b border-hairline pb-6">
          <span className="label-xs text-bronze uppercase tracking-[0.22em]">Selected Works</span>
          <h2 className="mt-1 text-2xl font-light tracking-tight md:text-4xl text-foreground uppercase">
            Project <span className="display-serif italic font-normal lowercase">Catalogue</span>
          </h2>
        </div>

        {/* Strict 2-Column Editorial Grid (Desktop: 2 columns | Mobile: 1 column) */}
        <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-12 lg:gap-14">
          {activeProjects.map((p, idx) => (
            <Reveal key={p.id} delay={(idx % 2) * 0.1}>
              <ProjectCard project={p} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* 3. BOTTOM COMMISSION CTA */}
      <section className="border-t border-hairline bg-sand">
        <div className="mx-auto max-w-[1440px] px-6 py-20 md:px-10 lg:px-16 md:py-28">
          <div className="max-w-3xl">
            <span className="label-xs text-bronze uppercase tracking-[0.22em]">Custom Metalwork & Railings</span>
            <h2 className="mt-3 text-3xl font-light tracking-tight md:text-5xl">
              Commission your <span className="display-serif italic font-normal">installation.</span>
            </h2>
            <p className="mt-5 text-sm leading-relaxed text-muted-foreground md:text-base">
              Explore our contemporary railing catalogue or contact our team for bespoke metalwork tailored to your site.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                to="/collection"
                className="inline-flex items-center gap-2 bg-charcoal px-7 py-4 text-[0.72rem] font-bold tracking-[0.2em] text-ivory uppercase transition-colors hover:bg-bronze"
              >
                <span>Explore Railings</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 border border-foreground bg-transparent px-7 py-4 text-[0.72rem] font-bold tracking-[0.2em] text-foreground uppercase transition-colors hover:bg-foreground hover:text-background"
              >
                <span>Contact Studio</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <FinalCTA />
    </>
  );
}
