import { useRef, useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Video as VideoIcon } from "lucide-react";
import type { Project } from "@/data/projects";

type ProjectCardProps = {
  project: Project;
};

export function ProjectCard({ project }: ProjectCardProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [videoError, setVideoError] = useState(false);

  // Check if project has a video in its media array
  const videoMedia = project.media?.find((m) => m.mediaType === "video");

  useEffect(() => {
    if (!videoMedia || videoError || !videoRef.current || !containerRef.current) return;

    const vid = videoRef.current;
    vid.defaultMuted = true;
    vid.muted = true;

    const startPlayback = () => {
      const playPromise = vid.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          /* Autoplay handled */
        });
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;

        if (entry.isIntersecting) {
          startPlayback();
        } else {
          vid.pause();
        }
      },
      { threshold: 0.1, rootMargin: "80px" },
    );

    observer.observe(containerRef.current);
    startPlayback();

    return () => observer.disconnect();
  }, [videoMedia, videoError]);

  return (
    <article ref={containerRef} className="group flex flex-col">
      <Link
        to="/projects/$slug"
        params={{ slug: project.slug }}
        className="block focus:outline-none focus:ring-2 focus:ring-bronze"
        aria-label={`View ${project.title}`}
      >
        {/* Strict 4:3 Media Frame Container with Hardware Acceleration */}
        <div className="relative w-full aspect-[4/3] overflow-hidden bg-charcoal/10 border border-hairline/60 transform-gpu">
          {videoMedia && !videoError ? (
            <video
              ref={videoRef}
              key={videoMedia.id || videoMedia.mediaUrl}
              poster={project.coverImage || videoMedia.thumbnailUrl}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              onError={() => setVideoError(true)}
              className="h-full w-full object-cover object-center transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]"
            >
              <source src={videoMedia.mediaUrl} type="video/mp4" />
              <source src={videoMedia.mediaUrl.replace(/\.mov$/, ".mp4")} type="video/mp4" />
            </video>
          ) : (
            <img
              src={project.coverImage}
              alt={project.title}
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover object-center transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]"
            />
          )}

          {/* Subtle dark tint on hover */}
          <div className="absolute inset-0 bg-charcoal/15 opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none" />

          {/* Video Indicator Badge */}
          {videoMedia && (
            <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 border border-white/20 bg-charcoal/85 px-2.5 py-1 text-[0.62rem] font-bold tracking-[0.16em] text-ivory uppercase backdrop-blur-md transition-transform duration-300 group-hover:scale-105">
              <VideoIcon className="h-3 w-3 text-bronze" />
              <span>Video</span>
            </div>
          )}
        </div>

        {/* Consistent Editorial Metadata Block */}
        <div className="mt-5 flex flex-col justify-between">
          <div>
            <p className="text-[0.68rem] font-bold tracking-[0.22em] text-bronze uppercase">
              {project.location ? project.location : project.projectType}
              {project.railingType && (
                <span className="text-muted-foreground font-normal ml-2">
                  · {project.railingType}
                </span>
              )}
            </p>
            <h3 className="mt-2 text-xl font-bold tracking-tight text-foreground uppercase md:text-2xl">
              {project.title}
            </h3>
          </div>

          <div className="mt-4 flex items-center gap-2 text-[0.72rem] font-bold tracking-[0.2em] text-foreground uppercase transition-colors group-hover:text-bronze">
            <span>View Project</span>
            <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 ease-out group-hover:translate-x-1.5" />
          </div>
        </div>
      </Link>
    </article>
  );
}
