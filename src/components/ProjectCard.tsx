import { useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Video as VideoIcon, Play } from "lucide-react";
import type { Project } from "@/data/projects";

type ProjectCardProps = {
  project: Project;
};

export function ProjectCard({ project }: ProjectCardProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoError, setVideoError] = useState(false);

  // Check if project has a video in its media array
  const videoMedia = project.media?.find((m) => m.mediaType === "video");

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (videoRef.current && !videoError) {
      videoRef.current.currentTime = 0;
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => setIsPlaying(true))
          .catch(() => {
            /* Handled gracefully */
          });
      }
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setIsPlaying(false);
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  return (
    <article
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="group flex flex-col"
    >
      <Link
        to="/projects/$slug"
        params={{ slug: project.slug }}
        className="block focus:outline-none focus:ring-2 focus:ring-bronze"
        aria-label={`View ${project.title}`}
      >
        {/* Strict 4:3 Media Frame Container with Hardware Acceleration */}
        <div className="relative w-full aspect-[4/3] overflow-hidden bg-charcoal/10 border border-hairline/60 transform-gpu">
          {/* Base High-Resolution Cover Image (Always Fast & Instant) */}
          <img
            src={project.coverImage || videoMedia?.thumbnailUrl}
            alt={project.title}
            loading="lazy"
            decoding="async"
            className={`h-full w-full object-cover object-center transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03] ${
              isPlaying ? "opacity-0" : "opacity-100"
            }`}
          />

          {/* Lazy-Loaded Video Element on Hover (Zero Background Decoding Lag) */}
          {videoMedia && !videoError && isHovered && (
            <video
              ref={videoRef}
              key={videoMedia.id || videoMedia.mediaUrl}
              muted
              loop
              playsInline
              preload="metadata"
              onError={() => setVideoError(true)}
              className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-300 ${
                isPlaying ? "opacity-100" : "opacity-0"
              }`}
            >
              <source src={videoMedia.mediaUrl} type="video/mp4" />
              <source src={videoMedia.mediaUrl.replace(/\.mov$/, ".mp4")} type="video/mp4" />
              <source src={videoMedia.mediaUrl} type="video/quicktime" />
            </video>
          )}

          {/* Subtle dark tint on hover */}
          <div className="absolute inset-0 bg-charcoal/15 opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none" />

          {/* Video Indicator Badge */}
          {videoMedia && (
            <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 border border-white/20 bg-charcoal/85 px-2.5 py-1 text-[0.62rem] font-bold tracking-[0.16em] text-ivory uppercase backdrop-blur-md transition-transform duration-300 group-hover:scale-105">
              <VideoIcon className="h-3 w-3 text-bronze" />
              <span>{isPlaying ? "Live Preview" : "Video"}</span>
            </div>
          )}

          {/* Play Hint Icon on Card Center */}
          {videoMedia && !isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-charcoal/80 text-ivory border border-white/20 backdrop-blur-sm shadow-lift transition-transform duration-300 group-hover:scale-110">
                <Play className="h-4 w-4 ml-0.5 text-bronze fill-bronze" />
              </div>
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
