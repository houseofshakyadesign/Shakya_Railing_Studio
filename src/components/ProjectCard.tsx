import { useRef, useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowUpRight, Play, Video as VideoIcon } from "lucide-react";
import type { Project } from "@/data/projects";

type ProjectCardProps = {
  project: Project;
  layoutVariant?: "large" | "standard" | "compact";
};

export function ProjectCard({ project, layoutVariant = "standard" }: ProjectCardProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Check if project has a video in its media array
  const videoMedia = project.media?.find((m) => m.mediaType === "video");

  useEffect(() => {
    if (!videoMedia || !videoRef.current || !containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;
        if (entry.isIntersecting) {
          videoRef.current
            ?.play()
            .then(() => setIsPlaying(true))
            .catch(() => {
              /* Autoplay blocked */
            });
        } else {
          videoRef.current?.pause();
          setIsPlaying(false);
        }
      },
      { threshold: 0.35 }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [videoMedia]);

  const heightClasses =
    layoutVariant === "large"
      ? "aspect-[16/10] md:aspect-[16/9]"
      : layoutVariant === "compact"
        ? "aspect-[4/3]"
        : "aspect-[4/3] md:aspect-[16/11]";

  return (
    <article ref={containerRef} className="group relative block overflow-hidden bg-card border border-hairline/60">
      <Link
        to="/projects/$slug"
        params={{ slug: project.slug }}
        className="block focus:outline-none focus:ring-2 focus:ring-bronze"
        aria-label={`View ${project.title}`}
      >
        {/* Visual Media Container */}
        <div className={`relative w-full overflow-hidden bg-charcoal/5 ${heightClasses}`}>
          {videoMedia ? (
            <video
              ref={videoRef}
              src={videoMedia.mediaUrl}
              poster={project.coverImage || videoMedia.thumbnailUrl}
              muted
              loop
              playsInline
              preload="metadata"
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
            />
          ) : (
            <img
              src={project.coverImage}
              alt={project.title}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
            />
          )}

          {/* Gradient Overlay for Text Legibility on Top Right & Bottom */}
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 via-transparent to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-80" />

          {/* Video Indicator Badge */}
          {videoMedia && (
            <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 border border-white/20 bg-charcoal/70 px-2.5 py-1 text-[0.62rem] font-bold tracking-[0.16em] text-ivory uppercase backdrop-blur-md">
              <VideoIcon className="h-3 w-3 text-bronze" />
              <span>Video</span>
            </div>
          )}

          {/* Quick Details Floating in Card Bottom */}
          <div className="absolute inset-x-0 bottom-0 p-6 md:p-8 text-ivory">
            <div className="flex items-end justify-between gap-4">
              <div>
                {project.location ? (
                  <p className="text-[0.68rem] font-bold tracking-[0.24em] text-bronze-soft uppercase">
                    {project.location}
                  </p>
                ) : (
                  <p className="text-[0.68rem] font-bold tracking-[0.24em] text-bronze-soft uppercase">
                    {project.projectType}
                  </p>
                )}
                <h3 className="mt-1 text-xl font-bold tracking-tight text-ivory md:text-2xl">
                  {project.title}
                </h3>
              </div>

              <div className="flex items-center gap-1 border-b border-ivory/40 pb-1 text-[0.72rem] font-bold tracking-[0.2em] text-ivory uppercase transition-colors group-hover:border-bronze group-hover:text-bronze shrink-0">
                <span>View</span>
                <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </div>
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}
