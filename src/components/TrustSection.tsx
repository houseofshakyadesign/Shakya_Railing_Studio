import { Reveal } from "./Reveal";

const CAPABILITIES = [
  "Design",
  "Fabrication",
  "Construction",
  "Installation",
  "Project Execution",
];

export function TrustSection() {
  return (
    <section className="border-y border-hairline bg-sand">
      <div className="mx-auto grid max-w-[1440px] items-center gap-12 px-5 py-20 md:grid-cols-2 md:gap-20 md:px-10 md:py-32">
        <Reveal>
          <div className="overflow-hidden">
            <img
              src="/images/railings/craft.jpg"
              alt="Metal Work Nepal craftsman fabricating an architectural steel frame"
              loading="lazy"
              width={1400}
              height={1000}
              className="h-full w-full object-cover"
            />
          </div>
        </Reveal>

        <div>
          <Reveal>
            <p className="label-xs text-bronze">Crafted by</p>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="mt-5 text-3xl leading-[1.05] tracking-tight sm:text-4xl md:text-5xl">
              Crafted by Metal Work Nepal.
            </h2>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground">
              Metal Work Nepal specializes in precision architectural metal fabrication, engineering,
              and execution. Every project is custom engineered, fabricated in-house, and installed with
              rigorous quality standards.
            </p>
          </Reveal>
          <ul className="mt-10 grid gap-px border border-hairline bg-hairline sm:grid-cols-2">
            {CAPABILITIES.map((c, i) => (
              <Reveal
                as="li"
                key={c}
                delay={0.05 * i}
                className="bg-sand px-6 py-5 text-[0.72rem] tracking-[0.2em] uppercase"
              >
                {c}
              </Reveal>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
