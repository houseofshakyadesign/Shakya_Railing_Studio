import { useMemo } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  MapPin,
  MessageCircle,
  Video as VideoIcon,
} from "lucide-react";
import { useStudio } from "@/hooks/useStudio";

export const Route = createFileRoute("/projects/$slug")({
  component: ProjectDetailPage,
});

function ProjectDetailPage() {
  const { slug } = Route.useParams();
  const { activeProjects, settings } = useStudio();

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
          className="mt-8 inline-flex items-center gap-2 bg-charcoal px-6 py-3 text-[0.72rem] font-bold tracking-[0.2em] text-ivory uppercase hover:bg-bronze transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Projects</span>
        </Link>
      </div>
    );
  }

  const mediaList = project.media || [];
  const videoMedia = mediaList.find((m) => m.mediaType === "video");
  const waHref = `https://wa.me/${settings.whatsappNumber.replace(/\D/g, "")}?text=${encodeURIComponent(
    `Hello Metal Work Nepal, I'm interested in the ${project.title} project (${project.location || "Nepal"}).`
  )}`;

  return (
    <div className="min-h-screen bg-background pt-28 pb-20 md:pt-36 md:pb-28">
      <div className="mx-auto max-w-5xl px-5 md:px-10">
        
        {/* Navigation Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-hairline pb-6">
          <Link
            to="/projects"
            className="group inline-flex items-center gap-2 text-[0.72rem] font-bold tracking-[0.2em] text-muted-foreground uppercase transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5 transition-transform duration-300 group-hover:-translate-x-1" />
            <span>Back to Projects</span>
          </Link>

          {project.location ? (
            <div className="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-bronze uppercase">
              <MapPin className="h-3.5 w-3.5" />
              <span>{project.location}</span>
            </div>
          ) : null}
        </div>

        {/* Project Title */}
        <div className="mt-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl md:text-5xl uppercase">
            {project.title}
          </h1>
        </div>

        {/* Dedicated Video Player Space */}
        <div className="mt-8 overflow-hidden border border-hairline bg-charcoal shadow-lift">
          {videoMedia ? (
            <div className="relative aspect-video w-full bg-black">
              <video
                key={videoMedia.id || videoMedia.mediaUrl}
                poster={videoMedia.thumbnailUrl || project.coverImage}
                controls
                autoPlay
                playsInline
                preload="auto"
                className="h-full w-full object-contain"
              >
                <source src={videoMedia.mediaUrl} type="video/mp4" />
                <source src={videoMedia.mediaUrl.replace(/\.mov$/, ".mp4")} type="video/mp4" />
                <source src={videoMedia.mediaUrl} type="video/quicktime" />
                Your browser does not support the video tag.
              </video>
            </div>
          ) : (
            <div className="relative aspect-video w-full overflow-hidden bg-charcoal">
              <img
                src={project.coverImage}
                alt={project.title}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-charcoal/40 text-ivory p-6 text-center">
                <VideoIcon className="h-10 w-10 text-bronze-soft opacity-80 mb-2" />
                <p className="text-sm font-semibold tracking-wide">Photo Preview</p>
              </div>
            </div>
          )}
        </div>

        {/* Minimal Action Footer */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-hairline pt-6">
          <a
            href={waHref}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 bg-charcoal px-6 py-3.5 text-[0.72rem] font-bold tracking-[0.2em] text-ivory uppercase transition-colors hover:bg-bronze"
          >
            <MessageCircle className="h-4 w-4 text-bronze-soft" />
            <span>WhatsApp Inquiry</span>
          </a>

          <Link
            to="/projects"
            className="text-xs font-semibold tracking-wider text-muted-foreground uppercase underline underline-offset-4 hover:text-foreground"
          >
            Browse Other Projects →
          </Link>
        </div>

      </div>
    </div>
  );
}
