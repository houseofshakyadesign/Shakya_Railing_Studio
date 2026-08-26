import { useState, useMemo, useRef } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowDown, ArrowRight, ArrowUpRight, Sparkles } from "lucide-react";
import { useStudio } from "@/hooks/useStudio";
import { Reveal, SectionHeading, EASE } from "@/components/Reveal";
import { ProjectCard } from "@/components/ProjectCard";
import { FinalCTA } from "@/components/FinalCTA";

const title = "Completed Projects | House of Shakya Railing Studio";
const description =
  "Explore completed railing and architectural metalwork projects crafted by House of Shakya across Nepal. High-end balcony, staircase, and custom fabrication installations.";

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
  const [selectedFilter, setSelectedFilter] = useState<string>("ALL");
  const gridRef = useRef<HTMLElement | null>(null);

  // Derive available categories dynamically from existing projects
  const categories = useMemo(() => {
    const set = new Set<string>(["ALL"]);
    for (const p of activeProjects) {
      if (p.projectType) set.add(p.projectType.toUpperCase());
      if (p.railingType) {
        if (p.railingType.toLowerCase().includes("balcony")) set.add("BALCONY");
        if (p.railingType.toLowerCase().includes("staircase")) set.add("STAIRCASE");
        if (p.railingType.toLowerCase().includes("boundary")) set.add("BOUNDARY");
      }
    }
    return Array.from(set);
  }, [activeProjects]);

  // Featured Project (prefer featured=true or first)
  const featuredProject = useMemo(() => {
    return activeProjects.find((p) => p.featured) || activeProjects[0] || null;
  }, [activeProjects]);

  // Filtered projects
  const filteredProjects = useMemo(() => {
    if (selectedFilter === "ALL") return activeProjects;
    return activeProjects.filter((p) => {
      const matchType = p.projectType?.toUpperCase() === selectedFilter;
      const matchRailing = p.railingType?.toUpperCase().includes(selectedFilter);
      return matchType || matchRailing;
    });
  }, [activeProjects, selectedFilter]);

  const scrollToGrid = () => {
    gridRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      {/* 1. CINEMATIC HERO */}
      <section className="relative min-h-[85vh] overflow-hidden bg-charcoal">
        <div className="absolute inset-0">
          <img
            src="/images/railings/hero.jpg"
            alt="House of Shakya Completed Projects"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/60 to-charcoal/20" />
        </div>

        <div className="relative mx-auto flex min-h-[85vh] max-w-[1440px] flex-col justify-end px-5 pt-36 pb-20 md:px-10 md:pb-28">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: EASE }}
            className="flex items-center gap-2 text-bronze-soft"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span className="label-xs uppercase">Portfolio & Executions</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: EASE }}
            className="mt-5 max-w-4xl text-4xl leading-[1.04] font-light tracking-tight text-ivory sm:text-6xl lg:text-7xl"
          >
            Our <span className="display-serif italic font-normal">Projects</span>.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.35, ease: EASE }}
            className="mt-6 max-w-xl text-sm leading-relaxed text-ivory/70 sm:text-base"
          >
            Selected railing installations and architectural metalwork crafted by House of Shakya
            across private residences, commercial landmarks, and modern spaces.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5, ease: EASE }}
            className="mt-10"
          >
            <button
              type="button"
              onClick={scrollToGrid}
              className="group inline-flex items-center gap-3 border border-ivory/30 bg-ivory/10 px-6 py-3.5 text-[0.72rem] font-bold tracking-[0.2em] text-ivory uppercase backdrop-blur-md transition-colors hover:border-bronze hover:bg-bronze hover:text-ivory"
            >
              <span>Explore Projects</span>
              <ArrowDown className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-y-1" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* 2. FEATURED PROJECT HIGHLIGHT */}
      {featuredProject && (
        <section className="mx-auto max-w-[1440px] px-5 py-20 md:px-10 md:py-28">
          <SectionHeading
            label="Featured Execution"
            title="Signature architectural installation."
            intro="A closer look at one of our benchmark railing projects engineered with precision joinery."
          />

          <Reveal delay={0.1} className="mt-12">
            <div className="grid gap-8 border border-hairline bg-card lg:grid-cols-12 lg:items-center">
              {/* Media on Left */}
              <div className="relative aspect-[16/10] overflow-hidden lg:col-span-7 bg-charcoal/5">
                <img
                  src={featuredProject.coverImage}
                  alt={featuredProject.title}
                  className="h-full w-full object-cover transition-transform duration-700 hover:scale-102"
                />
                <div className="absolute top-4 left-4 border border-white/20 bg-charcoal/80 px-3 py-1 text-[0.62rem] font-bold tracking-[0.2em] text-ivory uppercase backdrop-blur-md">
                  Featured Project
                </div>
              </div>

              {/* Information on Right */}
              <div className="p-8 md:p-12 lg:col-span-5 flex flex-col justify-center">
                {featuredProject.location && (
                  <p className="label-xs text-bronze uppercase">{featuredProject.location}</p>
                )}
                <h2 className="mt-2 text-2xl font-bold tracking-tight md:text-3xl">
                  {featuredProject.title}
                </h2>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                  {featuredProject.description}
                </p>

                <dl className="mt-6 space-y-2 border-t border-hairline pt-4 text-xs">
                  <div className="flex justify-between py-1">
                    <dt className="text-muted-foreground uppercase tracking-wider">Type</dt>
                    <dd className="font-medium text-foreground">{featuredProject.projectType}</dd>
                  </div>
                  <div className="flex justify-between py-1">
                    <dt className="text-muted-foreground uppercase tracking-wider">Railing</dt>
                    <dd className="font-medium text-foreground">{featuredProject.railingType}</dd>
                  </div>
                </dl>

                <div className="mt-8">
                  <Link
                    to="/projects/$slug"
                    params={{ slug: featuredProject.slug }}
                    className="inline-flex items-center gap-2 bg-charcoal px-6 py-3.5 text-[0.72rem] font-bold tracking-[0.2em] text-ivory uppercase transition-colors hover:bg-bronze"
                  >
                    <span>View Project Details</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>
        </section>
      )}

      {/* 3. PROJECT FILTERS & EDITORIAL GRID */}
      <section ref={gridRef} id="projects-grid" className="mx-auto max-w-[1440px] px-5 py-12 md:px-10 md:py-20">
        <div className="flex flex-col justify-between gap-6 border-b border-hairline pb-6 md:flex-row md:items-end">
          <div>
            <span className="label-xs text-bronze uppercase">Portfolio Catalogue</span>
            <h2 className="mt-1 text-2xl font-light tracking-tight md:text-3xl">
              Completed <span className="display-serif italic font-normal">Works</span>
            </h2>
          </div>

          {/* Horizontal scrollable category filter bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((cat) => {
              const isActive = selectedFilter === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedFilter(cat)}
                  className={`shrink-0 border px-4 py-2 text-[0.68rem] font-bold tracking-[0.18em] uppercase transition-colors ${
                    isActive
                      ? "border-bronze bg-bronze text-ivory"
                      : "border-hairline bg-card text-muted-foreground hover:border-foreground hover:text-foreground"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Dynamic Project Grid */}
        <AnimatePresence mode="wait">
          {filteredProjects.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="my-20 text-center"
            >
              <p className="text-base text-muted-foreground">
                No projects found in this category.
              </p>
              <Link
                to="/collection"
                className="mt-6 inline-flex items-center gap-2 border border-foreground px-6 py-3 text-[0.72rem] font-bold tracking-[0.2em] uppercase hover:bg-foreground hover:text-background"
              >
                <span>Explore Our Railings</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </motion.div>
          ) : (
            <motion.div
              key={selectedFilter}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35, ease: EASE }}
              className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3"
            >
              {filteredProjects.map((p, idx) => {
                // Editorial layout: Make every 4th project span full width on large screens
                const isWide = idx % 4 === 0 && filteredProjects.length > 2;
                return (
                  <div key={p.id} className={isWide ? "sm:col-span-2 lg:col-span-2" : ""}>
                    <Reveal delay={(idx % 3) * 0.08}>
                      <ProjectCard project={p} layoutVariant={isWide ? "large" : "standard"} />
                    </Reveal>
                  </div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* 4. BOTTOM PROJECT CTA */}
      <section className="border-t border-hairline bg-sand">
        <div className="mx-auto max-w-[1440px] px-5 py-20 md:px-10 md:py-28">
          <div className="max-w-3xl">
            <span className="label-xs text-bronze uppercase">Design & Consultation</span>
            <h2 className="mt-3 text-3xl font-light tracking-tight md:text-5xl">
              Like what you <span className="display-serif italic font-normal">see?</span>
            </h2>
            <p className="mt-5 text-sm leading-relaxed text-muted-foreground md:text-base">
              Explore our contemporary railing collection or get an instant architectural estimate
              for your home or project.
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
                to="/calculator"
                className="inline-flex items-center gap-2 border border-foreground bg-transparent px-7 py-4 text-[0.72rem] font-bold tracking-[0.2em] text-foreground uppercase transition-colors hover:bg-foreground hover:text-background"
              >
                <span>Get a Quote</span>
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
