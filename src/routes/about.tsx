import { createFileRoute } from "@tanstack/react-router";
import { FinalCTA } from "@/components/FinalCTA";
import { Reveal, SectionHeading } from "@/components/Reveal";
import { TrustSection } from "@/components/TrustSection";

const title = "About | Metal Work Nepal";
const description =
  "Metal Work Nepal specializes in the design, engineering and precision fabrication of architectural metalwork systems — including custom boundary railings, staircases, and bespoke metal elements.";

export const Route = createFileRoute("/about")({
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
  component: AboutPage,
});

const STATS = [
  { k: "In-house", v: "Design & detailing" },
  { k: "Own workshop", v: "Fabrication control" },
  { k: "Site teams", v: "Installation & finishing" },
];

function AboutPage() {
  return (
    <>
      <section className="mx-auto max-w-[1440px] px-5 pt-36 pb-20 md:px-10 md:pt-48 md:pb-28">
        <SectionHeading
          label="About the studio"
          title="We design, fabricate and install — end to end."
          intro="Metal Work Nepal delivers precision architectural metal fabrication. We provide a streamlined digital platform so homeowners, architects, and builders can calculate exact estimates and customize metalwork projects seamlessly."
        />
        <div className="mt-16 grid gap-px border border-hairline bg-hairline sm:grid-cols-3">
          {STATS.map((s, i) => (
            <Reveal key={s.k} delay={i * 0.08} className="bg-background p-8 md:p-10">
              <p className="label-xs text-bronze">{s.k}</p>
              <p className="mt-4 text-lg tracking-tight">{s.v}</p>
            </Reveal>
          ))}
        </div>
      </section>
      <TrustSection />
      <FinalCTA />
    </>
  );
}
