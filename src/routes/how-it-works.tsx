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
      { property: "og:image", content: "/images/railings/hero.jpg" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:image", content: "/images/railings/hero.jpg" },
      { rel: "canonical", href: "https://shakya-railing-studio.vercel.app/how-it-works" },
    ],
  }),
  component: HowItWorksPage,
});

const FAQ = [
  {
    q: "How is railing area calculated?",
    a: "Area is calculated automatically as Length × Standard Height in square feet. For Balcony railings, standard height is 3 ft (e.g., 20 ft × 3 ft = 60 sq.ft.). For Staircase railings, standard height is 2.8 ft (e.g., 20 ft × 2.8 ft = 56 sq.ft.).",
  },
  {
    q: "How do I measure my staircase railing length?",
    a: "For staircase railings, simply measure the approximate running length along the slope of the railing itself from start to finish.",
  },
  {
    q: "Is the calculated price final?",
    a: "It is an accurate architectural estimate based on estimated area × rate per sq.ft. Final quotation is confirmed after site inspection and review of site requirements.",
  },
  {
    q: "What happens after I send my requirement via WhatsApp?",
    a: "Your enquiry reaches our engineering team with the chosen railing model, application type, dimensions, and estimate attached. We respond promptly with a formal schedule.",
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
