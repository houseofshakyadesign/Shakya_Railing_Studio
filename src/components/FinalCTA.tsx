import { Link } from "@tanstack/react-router";
import { Reveal } from "./Reveal";

export function FinalCTA() {
  return (
    <section className="bg-charcoal">
      <div className="mx-auto max-w-[1440px] px-5 py-24 md:px-10 md:py-40">
        <Reveal>
          <h2 className="text-4xl leading-[1.02] tracking-tight text-ivory sm:text-6xl lg:text-7xl">
            Found your railing?
          </h2>
        </Reveal>
        <Reveal delay={0.08}>
          <p className="display-serif mt-2 text-4xl leading-[1.02] tracking-tight text-bronze-soft italic sm:text-6xl lg:text-7xl">
            Let's build it.
          </p>
        </Reveal>
        <Reveal delay={0.16}>
          <p className="mt-8 max-w-lg text-base leading-relaxed text-ivory/65">
            Choose your preferred railing, calculate your estimated requirement and send it directly
            to our team.
          </p>
        </Reveal>
        <Reveal delay={0.22}>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Link
              to="/collection"
              className="bg-ivory px-9 py-4 text-center text-[0.72rem] tracking-[0.22em] text-charcoal uppercase transition-colors duration-300 hover:bg-bronze hover:text-ivory"
            >
              Explore Collection
            </Link>
            <Link
              to="/calculator"
              className="border border-ivory/35 px-9 py-4 text-center text-[0.72rem] tracking-[0.22em] text-ivory uppercase transition-colors duration-300 hover:border-ivory hover:bg-ivory/10"
            >
              Get a Quote
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
