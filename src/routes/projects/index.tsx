import { useState, useMemo, useRef } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowDown, ArrowRight, ArrowUpRight, Video as VideoIcon } from "lucide-react";
import { useStudio } from "@/hooks/useStudio";
import { Reveal, EASE } from "@/components/Reveal";
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

  // Featured video media
  const featuredVideo = featuredProject?.media?.find((m) => m.mediaType === "video");

  // Grid projects (excluding featured if in ALL view, or show all when filtered)
  const gridProjects = useMemo(() => {
    if (selectedFilter === "ALL") {
      // Exclude the featured project from the regular grid to avoid duplicate cards
      return activeProjects.filter((p) => p.id !== featuredProject?.id);
    }
    return activeProjects.filter((p) => {
      const matchType = p.projectType?.toUpperCase() === selectedFilter;
      const matchRailing = p.railingType?.toUpperCase().includes(selectedFilter);
      return matchType || matchRailing;
    });
  }, [activeProjects, selectedFilter, featuredProject]);

  const scrollToGrid = () => {
    gridRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      {/* 1. CINEMATIC HERO */}
      <section className="relative min-h-[75vh] overflow-hidden bg-charcoal">
        <div className="absolute inset-0">
          <img
            src="/images/railings/hero.jpg"
            alt="House of Shakya Completed Projects"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/65 to-charcoal/25" />
        </div>

        <div className="relative mx-auto flex min-h-[75vh] max-w-[1440px] flex-col justify-end px-6 pt-36 pb-16 md:px-10 lg:px-16 md:pb-24">
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
            House of Shakya across private residences and contemporary spaces.
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
              <span>Explore Portfolio</span>
              <ArrowDown className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-y-1" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* 2. FEATURED PROJECT (STRICT 16:9 MEDIA FRAME) */}
      {featuredProject && selectedFilter === "ALL" && (
        <section className="mx-auto max-w-[1440px] px-6 pt-20 pb-12 md:px-10 lg:px-16 md:pt-28 md:pb-16">
          <Reveal>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-hairline pb-5">
              <div>
                <span className="label-xs text-bronze uppercase tracking-[0.22em]">Featured Project</span>
                <h2 className="mt-1 text-2xl font-light tracking-tight md:text-4xl text-foreground uppercase">
                  {featuredProject.title}
                </h2>
              </div>
              <p className="text-[0.7rem] font-bold tracking-[0.2em] uppercase text-muted-foreground">
                {featuredProject.location ? `${featuredProject.location} · ` : ""}
                {featuredProject.railingType}
              </p>
            </div>

            <div className="mt-8 group">
              <Link
                to="/projects/$slug"
                params={{ slug: featuredProject.slug }}
                className="block focus:outline-none focus:ring-2 focus:ring-bronze"
              >
                {/* Strict 16:9 Dominant Visual Frame */}
                <div className="relative w-full aspect-[16/9] overflow-hidden bg-charcoal/10 border border-hairline/60">
                  {featuredVideo ? (
                    <video
                      src={featuredVideo.mediaUrl}
                      poster={featuredProject.coverImage || featuredVideo.thumbnailUrl}
                      muted
                      loop
                      autoPlay
                      playsInline
                      preload="metadata"
                      className="h-full w-full object-cover object-center transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.02]"
                    />
                  ) : (
                    <img
                      src={featuredProject.coverImage}
                      alt={featuredProject.title}
                      className="h-full w-full object-cover object-center transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.02]"
                    />
                  )}

                  <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 border border-white/20 bg-charcoal/80 px-3 py-1 text-[0.62rem] font-bold tracking-[0.2em] text-ivory uppercase backdrop-blur-md">
                    {featuredVideo && <VideoIcon className="h-3 w-3 text-bronze" />}
                    <span>Featured Project</span>
                  </div>

                  {/* Subtle dark tint on hover */}
                  <div className="absolute inset-0 bg-charcoal/20 opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100" />
                </div>

                <div className="mt-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
                    {featuredProject.description}
                  </p>
                  <div className="inline-flex items-center gap-2 bg-charcoal px-7 py-4 text-[0.72rem] font-bold tracking-[0.2em] text-ivory uppercase transition-colors group-hover:bg-bronze shrink-0">
                    <span>View Project</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1.5" />
                  </div>
                </div>
              </Link>
            </div>
          </Reveal>
        </section>
      )}

      {/* 3. PROJECT CATALOGUE: CATEGORY FILTER & 2-COLUMN STRICT 4:3 GRID */}
      <section ref={gridRef} id="projects-grid" className="mx-auto max-w-[1440px] px-6 py-12 md:px-10 lg:px-16 md:py-20">
        <div className="flex flex-col justify-between gap-6 border-b border-hairline pb-6 md:flex-row md:items-end">
          <div>
            <span className="label-xs text-bronze uppercase tracking-[0.22em]">Selected Works</span>
            <h2 className="mt-1 text-2xl font-light tracking-tight md:text-3xl uppercase">
              Project <span className="display-serif italic font-normal lowercase">Catalogue</span>
            </h2>
          </div>

          {/* Minimal architectural category filter bar */}
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

        {/* Strict 2-Column Editorial Grid (Desktop: 2 columns | Mobile: 1 column) */}
        <AnimatePresence mode="wait">
          {gridProjects.length === 0 ? (
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
              className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-12 lg:gap-14"
            >
              {gridProjects.map((p, idx) => (
                <Reveal key={p.id} delay={(idx % 2) * 0.1}>
                  <ProjectCard project={p} />
                </Reveal>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* 4. BOTTOM PROJECT CTA */}
      <section className="border-t border-hairline bg-sand">
        <div className="mx-auto max-w-[1440px] px-6 py-20 md:px-10 lg:px-16 md:py-28">
          <div className="max-w-3xl">
            <span className="label-xs text-bronze uppercase tracking-[0.22em]">Custom Metalwork & Railings</span>
            <h2 className="mt-3 text-3xl font-light tracking-tight md:text-5xl">
              Commission your <span className="display-serif italic font-normal">installation.</span>
            </h2>
            <p className="mt-5 text-sm leading-relaxed text-muted-foreground md:text-base">
              Explore our contemporary railing catalogue or calculate an instant architectural estimate
              tailored to your exact site dimensions.
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
                <span>Get an Estimate</span>
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
