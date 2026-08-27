import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { FinalCTA } from "@/components/FinalCTA";
import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";
import { ProductGrid } from "@/components/ProductGrid";
import { Reveal, SectionHeading } from "@/components/Reveal";
import { TrustSection } from "@/components/TrustSection";

const title = "Metal Work Nepal | Architectural Metalwork & Railings";
const description =
  "Explore architectural metalwork and premium railing systems by Metal Work Nepal. Select a railing design, calculate your instant estimate and send your requirement directly to our team.";

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
            label="The Collection"
            title="Our railing collection."
            intro="A curated selection of architectural railing systems for residential, commercial and hospitality spaces."
          />
          <Reveal delay={0.1}>
            <Link
              to="/collection"
              className="group flex items-center gap-3 border-b border-foreground/25 pb-2 text-[0.72rem] tracking-[0.2em] uppercase transition-colors hover:border-bronze hover:text-bronze"
            >
              View all designs
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </Reveal>
        </div>

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
