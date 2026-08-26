import { createFileRoute } from "@tanstack/react-router";
import { FinalCTA } from "@/components/FinalCTA";
import { HowItWorks } from "@/components/HowItWorks";
import { Reveal, SectionHeading } from "@/components/Reveal";

const title = "How It Works | Metal Work Nepal";
const description =
  "Select, measure, estimate and enquire. See how Metal Work Nepal takes you from design to an instant architectural estimation in minutes.";

export const Route = createFileRoute("/how-it-works")({
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
  component: HowItWorksPage,
});

const FAQ = [
  {
    q: "How is boundary railing area calculated?",
    a: "Area is calculated automatically as Length × Height in square feet (e.g., 20 ft × 3.5 ft = 70 sq.ft.). Standard 3.5 ft height is pre-filled for convenience.",
  },
  {
    q: "What does Estimated Panels mean?",
    a: "Estimated panels represent the approximate number of railing modules required along the boundary (e.g., 20 ft / 4 ft module = ~5 panels). Final fabrication quantity is confirmed upon site inspection.",
  },
  {
    q: "Is the calculated price final?",
    a: "It is an accurate architectural estimate based on estimated area × rate per sq.ft. Final quotation is confirmed after site verification and anchor detailing.",
  },
  {
    q: "What happens after I send my requirement via WhatsApp?",
    a: "Your enquiry reaches our technical team with the chosen railing model, dimensions, estimated panels, and estimate attached. We respond promptly with a formal schedule.",
  },
];

function HowItWorksPage() {
  return (
    <>
      <section className="mx-auto max-w-[1440px] px-5 pt-36 pb-4 md:px-10 md:pt-48">
        <SectionHeading
          label="Process"
          title="Select, measure, estimate, enquire."
          intro="A seamless architectural path between a design you love and a precise calculation you can plan around."
        />
      </section>
      <HowItWorks />
      <section className="mx-auto max-w-[1440px] px-5 pb-24 md:px-10 md:pb-32">
        <h2 className="text-2xl tracking-tight md:text-3xl">Common questions</h2>
        <dl className="mt-10 border-t border-hairline">
          {FAQ.map((f, i) => (
            <Reveal key={f.q} delay={i * 0.06}>
              <div className="grid gap-3 border-b border-hairline py-8 md:grid-cols-[1fr_1.4fr] md:gap-10">
                <dt className="text-sm tracking-[0.06em]">{f.q}</dt>
                <dd className="text-sm leading-relaxed text-muted-foreground">{f.a}</dd>
              </div>
            </Reveal>
          ))}
        </dl>
      </section>
      <FinalCTA />
    </>
  );
}
