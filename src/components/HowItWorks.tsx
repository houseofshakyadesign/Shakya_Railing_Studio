import { Reveal, SectionHeading } from "./Reveal";

const STEPS = [
  { n: "01", title: "Select", copy: "Browse our railing designs and choose your preferred model." },
  {
    n: "02",
    title: "Measure",
    copy: "Enter your boundary length in feet — standard height is already pre-filled.",
  },
  {
    n: "03",
    title: "Estimate",
    copy: "Instant automatic calculation of area, estimated panels, and transparent pricing.",
  },
  { n: "04", title: "Send", copy: "Send your custom requirement straight to Metal Work Nepal via WhatsApp." },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="mx-auto max-w-[1440px] px-5 py-20 md:px-10 md:py-32">
      <SectionHeading
        label="The Process"
        title="Four steps from design to quotation."
        intro="No complicated math or manual sq.ft. guesswork. Choose, enter length, and send — in under two minutes."
      />
      <ol className="mt-14 grid gap-px border border-hairline bg-hairline sm:grid-cols-2 lg:grid-cols-4">
        {STEPS.map((s, i) => (
          <Reveal as="li" key={s.n} delay={i * 0.08} className="bg-background p-8 md:p-10">
            <span className="display-serif text-4xl text-bronze/45">{s.n}</span>
            <h3 className="mt-6 text-sm tracking-[0.2em] uppercase">{s.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{s.copy}</p>
          </Reveal>
        ))}
      </ol>
    </section>
  );
}
