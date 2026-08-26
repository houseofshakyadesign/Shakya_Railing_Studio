import { useState, useMemo } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Maximize2,
  MapPin,
  Sparkles,
  Play,
  Video as VideoIcon,
} from "lucide-react";
import { useStudio } from "@/hooks/useStudio";
import { Reveal, SectionHeading, EASE } from "@/components/Reveal";
import { Lightbox } from "@/components/Lightbox";
import { FinalCTA } from "@/components/FinalCTA";

export const Route = createFileRoute("/projects/$slug")({
  component: ProjectDetailPage,
});

function ProjectDetailPage() {
  const { slug } = Route.useParams();
  const { activeProjects } = useStudio();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Find project by slug
  const project = useMemo(() => {
    return activeProjects.find((p) => p.slug === slug) || null;
  }, [activeProjects, slug]);

  if (!project) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-[1440px] flex-col items-center justify-center px-5 pt-36 text-center">
        <h1 className="text-3xl font-light tracking-tight">Project Not Found</h1>
        <p className="mt-4 text-sm text-muted-foreground">
          The requested portfolio project could not be found.
        </p>
        <Link
          to="/projects"
          className="mt-8 inline-flex items-center gap-2 bg-charcoal px-6 py-3 text-[0.72rem] font-bold tracking-[0.2em] text-ivory uppercase hover:bg-bronze"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Projects</span>
        </Link>
      </div>
    );
  }

  const mediaList = project.media || [];
  const videoMedia = mediaList.find((m) => m.mediaType === "video");
  const imageMedia = mediaList.filter((m) => m.mediaType === "image");

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  return (
    <>
      {/* 1. CINEMATIC HERO */}
      <section className="relative min-h-[75vh] overflow-hidden bg-charcoal">
        <div className="absolute inset-0">
          <img
            src={project.coverImage}
            alt={project.title}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/50 to-charcoal/20" />
        </div>

        <div className="relative mx-auto flex min-h-[75vh] max-w-[1440px] flex-col justify-end px-5 pt-36 pb-16 md:px-10 md:pb-24">
          <Link
            to="/projects"
            className="group mb-8 inline-flex items-center gap-2 text-[0.68rem] font-bold tracking-[0.2em] text-ivory/80 uppercase hover:text-bronze-soft"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-x-1" />
            <span>All Projects</span>
          </Link>

          <div className="flex flex-wrap items-center gap-3">
            {project.location ? (
              <span className="flex items-center gap-1.5 border border-white/20 bg-charcoal/60 px-3 py-1 text-[0.68rem] font-bold tracking-[0.2em] text-bronze-soft uppercase backdrop-blur-md">
                <MapPin className="h-3 w-3" />
                {project.location}
              </span>
            ) : null}
            <span className="border border-white/20 bg-charcoal/60 px-3 py-1 text-[0.68rem] font-bold tracking-[0.2em] text-ivory uppercase backdrop-blur-md">
              {project.projectType}
            </span>
          </div>

          <h1 className="mt-4 max-w-4xl text-3xl font-light tracking-tight text-ivory sm:text-5xl lg:text-6xl">
            {project.title}
          </h1>
        </div>
      </section>

      {/* 2. PROJECT METADATA & OVERVIEW */}
      <section className="mx-auto max-w-[1440px] px-5 py-16 md:px-10 md:py-24">
        <div className="grid gap-12 lg:grid-cols-12">
          {/* Metadata Sidebar */}
          <div className="lg:col-span-4 border border-hairline bg-card p-8">
            <span className="label-xs text-bronze uppercase">Project Specifications</span>
            <dl className="mt-6 space-y-4 text-sm">
              <div className="border-b border-hairline pb-3">
                <dt className="label-xs text-muted-foreground uppercase">Project</dt>
                <dd className="mt-1 font-semibold text-foreground">{project.title}</dd>
              </div>

              {project.location && (
                <div className="border-b border-hairline pb-3">
                  <dt className="label-xs text-muted-foreground uppercase">Location</dt>
                  <dd className="mt-1 font-semibold text-foreground">{project.location}, Nepal</dd>
                </div>
              )}

              <div className="border-b border-hairline pb-3">
                <dt className="label-xs text-muted-foreground uppercase">Category</dt>
                <dd className="mt-1 font-semibold text-foreground">{project.projectType}</dd>
              </div>

              <div className="border-b border-hairline pb-3">
                <dt className="label-xs text-muted-foreground uppercase">Railing Installation</dt>
                <dd className="mt-1 font-semibold text-foreground">{project.railingType}</dd>
              </div>

              <div>
                <dt className="label-xs text-muted-foreground uppercase">Fabrication Studio</dt>
                <dd className="mt-1 font-semibold text-foreground">Metal Work Nepal</dd>
              </div>
            </dl>

            <div className="mt-8 border-t border-hairline pt-6">
              <Link
                to="/calculator"
                className="block w-full bg-charcoal py-3.5 text-center text-[0.72rem] font-bold tracking-[0.2em] text-ivory uppercase transition-colors hover:bg-bronze"
              >
                Estimate This Style
              </Link>
            </div>
          </div>

          {/* Architectural Description */}
          <div className="lg:col-span-8 flex flex-col justify-center">
            <span className="label-xs text-bronze uppercase">Architectural Narrative</span>
            <h2 className="mt-2 text-2xl font-light tracking-tight md:text-3xl">
              Precision metalwork tailored for modern living.
            </h2>
            <p className="mt-6 text-base leading-relaxed text-muted-foreground">
              {project.description}
            </p>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Every connection point, anchor plate, and welded seam in this project was fabricated
              at our specialized facility in Mahalaxmi and installed with on-site calibration to ensure
              flawless structural integrity and minimalist sightlines.
            </p>
          </div>
        </div>
      </section>

      {/* 3. PROJECT VIDEO SHOWCASE (IF APPLICABLE) */}
      {videoMedia && (
        <section className="bg-charcoal text-ivory py-20">
          <div className="mx-auto max-w-[1440px] px-5 md:px-10">
            <div className="flex items-center gap-2 text-bronze-soft">
              <VideoIcon className="h-4 w-4" />
              <span className="label-xs uppercase">Live Installation Video</span>
            </div>
            <h2 className="mt-2 text-2xl font-light tracking-tight md:text-3xl text-ivory">
              Finished Walkthrough
            </h2>

            <div className="mt-8 relative aspect-video max-w-5xl overflow-hidden rounded-none border border-white/20 bg-charcoal/50">
              <video
                key={videoMedia.id || videoMedia.mediaUrl}
                poster={videoMedia.thumbnailUrl || project.coverImage}
                controls
                playsInline
                preload="metadata"
                className="h-full w-full object-cover"
              >
                <source src={videoMedia.mediaUrl} type="video/mp4" />
                <source src={videoMedia.mediaUrl.replace(/\.mov$/, ".mp4")} type="video/mp4" />
                <source src={videoMedia.mediaUrl} type="video/quicktime" />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        </section>
      )}

      {/* 4. EDITORIAL PHOTO GALLERY */}
      {imageMedia.length > 0 && (
        <section className="mx-auto max-w-[1440px] px-5 py-20 md:px-10 md:py-28">
          <SectionHeading
            label="Gallery & Details"
            title="Architectural photo documentation."
            intro="Explore high-resolution angles, structural details, and materiality from the installation."
          />

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {imageMedia.map((m, index) => {
              const fullIndex = mediaList.findIndex((item) => item.id === m.id);
              const isWide = index % 3 === 0;
              return (
                <Reveal key={m.id} delay={(index % 3) * 0.08} className={isWide ? "sm:col-span-2 lg:col-span-2" : ""}>
                  <div
                    onClick={() => openLightbox(fullIndex !== -1 ? fullIndex : index)}
                    className="group relative cursor-pointer overflow-hidden border border-hairline bg-card aspect-[4/3]"
                  >
                    <img
                      src={m.mediaUrl}
                      alt={m.caption || project.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                    />
                    <div className="absolute inset-0 bg-charcoal/0 transition-colors duration-300 group-hover:bg-charcoal/30" />
                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-ivory opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                      <span className="text-xs font-medium tracking-wide drop-shadow">
                        {m.caption || "View Full Resolution"}
                      </span>
                      <div className="grid h-8 w-8 place-items-center bg-charcoal/80 text-ivory">
                        <Maximize2 className="h-4 w-4" />
                      </div>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </section>
      )}

      {/* 5. INTERESTED IN A SIMILAR RAILING? CTA */}
      <section className="border-t border-hairline bg-sand">
        <div className="mx-auto max-w-[1440px] px-5 py-20 md:px-10 md:py-28">
          <div className="max-w-3xl">
            <span className="label-xs text-bronze uppercase">Custom Railing Fabrication</span>
            <h2 className="mt-3 text-3xl font-light tracking-tight md:text-5xl">
              Interested in a similar <span className="display-serif italic font-normal">railing?</span>
            </h2>
            <p className="mt-5 text-sm leading-relaxed text-muted-foreground md:text-base">
              Calculate an instant estimate based on your boundary length or discuss bespoke
              customization with our design engineering team.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                to="/calculator"
                className="inline-flex items-center gap-2 bg-charcoal px-7 py-4 text-[0.72rem] font-bold tracking-[0.2em] text-ivory uppercase transition-colors hover:bg-bronze"
              >
                <span>Get a Quote</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link
                to="/projects"
                className="inline-flex items-center gap-2 border border-foreground bg-transparent px-7 py-4 text-[0.72rem] font-bold tracking-[0.2em] text-foreground uppercase transition-colors hover:bg-foreground hover:text-background"
              >
                <span>View More Projects</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Fullscreen Lightbox */}
      <Lightbox
        media={mediaList}
        currentIndex={lightboxIndex}
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onNavigate={(idx) => setLightboxIndex(idx)}
      />

      <FinalCTA />
    </>
  );
}
