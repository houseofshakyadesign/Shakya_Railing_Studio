import { Link, useRouterState } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { EASE } from "./Reveal";

const NAV = [
  { label: "Collection", to: "/collection" },
  { label: "How It Works", to: "/how-it-works" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
] as const;

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  // When on home page and not scrolled, the navbar sits on the dark hero background
  const isDarkHero = pathname === "/" && !scrolled;

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "border-b border-hairline bg-background/90 backdrop-blur-xl shadow-soft"
          : isDarkHero
            ? "border-b border-transparent bg-gradient-to-b from-charcoal/80 via-charcoal/30 to-transparent"
            : "border-b border-transparent bg-background/80 backdrop-blur-md"
      }`}
    >
      <div
        className={`mx-auto flex max-w-[1440px] items-center justify-between px-5 transition-all duration-300 md:px-10 ${
          scrolled ? "h-16" : "h-20 md:h-24"
        }`}
      >
        <Link to="/" className="group leading-none" aria-label="House of Shakya — Railing Studio">
          <span
            className={`block text-[0.84rem] font-extrabold tracking-[0.28em] uppercase transition-colors duration-300 ${
              isDarkHero ? "text-ivory" : "text-foreground"
            }`}
          >
            House of Shakya
          </span>
          <span
            className={`mt-1 block text-[0.62rem] font-bold tracking-[0.34em] uppercase transition-colors duration-300 ${
              isDarkHero ? "text-bronze-soft" : "text-bronze"
            }`}
          >
            Railing Studio
          </span>
        </Link>

        <nav aria-label="Main" className="hidden items-center gap-9 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`group relative py-1 text-[0.8rem] font-bold tracking-[0.16em] uppercase transition-colors duration-300 ${
                isDarkHero
                  ? "text-ivory/90 hover:text-ivory"
                  : "text-foreground/80 hover:text-foreground"
              }`}
              activeProps={{
                className: isDarkHero ? "text-ivory font-extrabold" : "text-foreground font-extrabold",
              }}
            >
              {item.label}
              <span
                className={`absolute -bottom-0.5 left-0 h-[2px] w-0 transition-all duration-300 group-hover:w-full ${
                  isDarkHero ? "bg-bronze-soft" : "bg-bronze"
                }`}
              />
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            to="/calculator"
            className={`hidden px-6 py-3 text-[0.72rem] font-bold tracking-[0.2em] uppercase transition-colors duration-300 sm:inline-block ${
              isDarkHero
                ? "bg-ivory text-charcoal hover:bg-bronze hover:text-ivory"
                : "bg-charcoal text-ivory hover:bg-bronze"
            }`}
          >
            Get a Quote
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className={`-mr-2 grid h-11 w-11 place-items-center transition-colors duration-300 lg:hidden ${
              isDarkHero ? "text-ivory hover:text-white" : "text-foreground"
            }`}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="overflow-hidden border-t border-hairline bg-background/98 backdrop-blur-2xl shadow-lift lg:hidden"
          >
            <nav aria-label="Mobile" className="flex flex-col px-5 py-4">
              {NAV.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="border-b border-hairline py-4 text-sm font-bold tracking-[0.16em] text-foreground uppercase last:border-0 hover:text-bronze"
                >
                  {item.label}
                </Link>
              ))}
              <Link
                to="/calculator"
                className="mt-4 bg-charcoal px-6 py-4 text-center text-[0.72rem] font-bold tracking-[0.2em] text-ivory uppercase hover:bg-bronze"
              >
                Get a Quote
              </Link>
            </nav>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
