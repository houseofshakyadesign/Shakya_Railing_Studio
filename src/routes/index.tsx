import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { FinalCTA } from "@/components/FinalCTA";
import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";
import { ProductGrid } from "@/components/ProductGrid";
import { Reveal, SectionHeading } from "@/components/Reveal";
import { TrustSection } from "@/components/TrustSection";

const title = "Metal Work Nepal | Architectural Metalwork Studio";
const description =
  "Metal Work Nepal is an architectural metalwork studio creating hand-forged railings, grilles, gates, metal structures and glass enclosures for contemporary spaces in Nepal.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:image", content: "/images/railings/hero.jpg" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://shakya-railing-studio.vercel.app/" }],
  }),
  component: Index,
});

function Index() {
  return (
    <>
      <Hero />

      <section id="collection" className="mx-auto max-w-[1440px] px-5 py-20 md:px-10 md:py-32">
        <div className="flex flex-wrap items-end justify-between gap-8">
          <SectionHeading
            label="Disciplines & Work"
            title="Railings & Architectural Metalwork."
            intro="Metal Work Nepal is an architectural metalwork studio creating crafted metal elements for homes, interiors and architectural spaces. Explore our flagship railing systems below, with custom grilles, gates, metal rooms and glass enclosures fabricated to specification."
          />
          <Reveal delay={0.1}>
            <Link
              to="/collection"
              className="group flex items-center gap-3 border-b border-foreground/25 pb-2 text-[0.72rem] font-bold tracking-[0.2em] uppercase transition-colors hover:border-bronze hover:text-bronze"
            >
              View all designs
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </Reveal>
        </div>

        <Reveal delay={0.15}>
          <div className="mt-8 flex flex-wrap items-center gap-2 sm:gap-3 border-y border-hairline py-3.5 text-[0.66rem] sm:text-[0.7rem] font-bold tracking-[0.18em] uppercase text-muted-foreground">
            <span className="text-bronze font-semibold">Disciplines:</span>
            <span>Railings</span>
            <span className="text-muted-foreground/30">•</span>
            <span>Grilles</span>
            <span className="text-muted-foreground/30">•</span>
            <span>Gates</span>
            <span className="text-muted-foreground/30">•</span>
            <span>Metal Rooms</span>
            <span className="text-muted-foreground/30">•</span>
            <span>Glass Enclosures</span>
            <span className="text-muted-foreground/30">•</span>
            <span>Custom Metalwork</span>
          </div>
        </Reveal>

        <div className="mt-14">
          <ProductGrid limit={6} />
        </div>
      </section>

      <HowItWorks />
      <TrustSection />
      <FinalCTA />
    </>
  );
}
