import { createFileRoute } from "@tanstack/react-router";
import { FinalCTA } from "@/components/FinalCTA";
import { HowItWorks } from "@/components/HowItWorks";
import { Reveal, SectionHeading } from "@/components/Reveal";

const title = "How It Works | House of Shakya Railing Studio";
const description =
  "Discover, select, calculate and enquire. See how the House of Shakya Railing Studio takes you from design to an instant sq.ft. estimate in minutes.";

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
    q: "Is the calculated price final?",
    a: "No. It is an indicative estimate based on area × rate. Final pricing is confirmed after a site visit and final measurements.",
  },
  {
    q: "How is area measured?",
    a: "Railing area is measured as running length × height in square feet. Our team can verify this on site.",
  },
  {
    q: "What happens after I send my requirement?",
    a: "Your enquiry reaches us on WhatsApp with the railing, area and estimate attached. We respond with a formal quotation.",
  },
];

function HowItWorksPage() {
  return (
    <>
      <section className="mx-auto max-w-[1440px] px-5 pt-36 pb-4 md:px-10 md:pt-48">
        <SectionHeading
          label="Process"
          title="Discover, select, calculate, enquire."
          intro="A deliberately short path between a design you like and a number you can plan around."
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
