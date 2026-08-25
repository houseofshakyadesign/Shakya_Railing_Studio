import { Reveal, SectionHeading } from "./Reveal";

const STEPS = [
  { n: "01", title: "Explore", copy: "Browse our railing collection." },
  { n: "02", title: "Select", copy: "Choose your preferred railing." },
  {
    n: "03",
    title: "Calculate",
    copy: "Enter your required area and instantly see the estimated price.",
  },
  { n: "04", title: "Enquire", copy: "Send your requirement directly to House of Shakya." },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="mx-auto max-w-[1440px] px-5 py-20 md:px-10 md:py-32">
      <SectionHeading
        label="The Process"
        title="Four steps from design to quotation."
        intro="No accounts, no forms to chase. Choose, calculate and send — in under two minutes."
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
