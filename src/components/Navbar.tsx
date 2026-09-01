import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, ChevronDown, Menu, Sparkles, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { EASE } from "./Reveal";
import { useFocusTrap } from "@/hooks/useFocusTrap";

const NAV_SIMPLE = [
  { label: "Projects", to: "/projects" },
  { label: "How It Works", to: "/how-it-works" },
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
] as const;

const COLLECTION_CATEGORIES = [
  {
    id: "railings",
    title: "Railings",
    description: "Hand-forged staircase and balcony railings.",
    labels: ["Staircase", "Balcony / Loft"],
    cta: "Explore Railings",
    image: "/images/railings/r11.jpg",
    badge: "INSTANT ESTIMATE",
    accent: true,
  },
  {
    id: "metal_structures",
    title: "Metal Structures",
    description: "Steel-and-glass rooms, sunrooms and architectural structures.",
    labels: ["Kausi Ghar", "Aangan Kausi", "Chhana Jali", "Bagaicha Kausi"],
    cta: "Explore Structures",
    image: "/images/rooms/kausi_ghar.jpg",
    badge: null,
    accent: false,
  },
  {
    id: "furniture",
    title: "Furniture",
    description: "Custom metal furniture and crafted pieces.",
    labels: ["Coming Soon"],
    cta: "Explore Furniture",
    image: null,
    badge: "COMING SOON",
    accent: false,
  },
] as const;

const DROPDOWN_EASE = [0.22, 1, 0.36, 1] as const;

const MOBILE_COLLECTION = [
  {
    label: "Railings",
    desc: "Hand-forged staircase and balcony railings.",
    cat: "railings" as const,
  },
  {
    label: "Metal Structures",
    desc: "Glass rooms, sunrooms and architectural structures.",
    cat: "metal_structures" as const,
  },
  {
    label: "Furniture",
    desc: "Custom metal furniture, coming soon.",
    cat: "furniture" as const,
  },
  {
    label: "Custom Metalwork",
    desc: "Something completely different? Start an enquiry.",
    to: "/contact" as const,
  },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [collectionOpen, setCollectionOpen] = useState(false);
  const [mobileCollectionOpen, setMobileCollectionOpen] = useState(false);

  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const navigate = useNavigate();
  const navRef = useRef<HTMLElement>(null);
  const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const leaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isDarkHero = pathname === "/" && !scrolled;
  const isCollectionActive = pathname.startsWith("/collection");

  useEffect(() => {
    setOpen(false);
    setCollectionOpen(false);
    setMobileCollectionOpen(false);
  }, [pathname]);

  const mobileTrapRef = useFocusTrap(open);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setCollectionOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (collectionOpen && navRef.current && !navRef.current.contains(e.target as Node)) {
        setCollectionOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [collectionOpen]);

  const handleCollectionEnter = useCallback(() => {
    if (leaveTimerRef.current) { clearTimeout(leaveTimerRef.current); leaveTimerRef.current = null; }
    hoverTimerRef.current = setTimeout(() => setCollectionOpen(true), 80);
  }, []);

  const handleCollectionLeave = useCallback(() => {
    if (hoverTimerRef.current) { clearTimeout(hoverTimerRef.current); hoverTimerRef.current = null; }
    leaveTimerRef.current = setTimeout(() => setCollectionOpen(false), 180);
  }, []);

  const handleCategoryNavigate = (catId: string) => {
    setCollectionOpen(false);
    setOpen(false);
    void navigate({ to: "/collection" });
  };

  return (
    <header
      ref={navRef}
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
        {/* ── LOGO ── */}
        <Link
          to="/"
          onClick={() => { if (pathname === "/") window.scrollTo({ top: 0, behavior: "smooth" }); }}
          className="group flex items-center gap-3.5 sm:gap-4 leading-none"
          aria-label="Metal Work Nepal"
        >
          <div
            className={`relative shrink-0 overflow-hidden rounded-sm transition-all duration-300 group-hover:scale-105 ${
              scrolled ? "h-11 w-11 md:h-12 md:w-12" : "h-13 w-13 sm:h-14 sm:w-14 md:h-16 md:w-16"
            }`}
          >
            <img
              src="/logo/house-of-shakya-logo-light.png"
              alt="Metal Work Nepal"
              aria-hidden="true"
              className={`absolute inset-0 h-full w-full object-contain transition-opacity duration-300 ${isDarkHero ? "opacity-100" : "pointer-events-none opacity-0"}`}
            />
            <img
              src="/logo/house-of-shakya-logo-dark.png"
              alt="Metal Work Nepal"
              aria-hidden="true"
              className={`absolute inset-0 h-full w-full object-contain transition-opacity duration-300 ${isDarkHero ? "pointer-events-none opacity-0" : "opacity-100"}`}
            />
          </div>
          <span
            className={`text-[0.92rem] font-extrabold tracking-[0.22em] uppercase transition-colors duration-300 sm:text-[1.02rem] md:text-[1.08rem] sm:tracking-[0.24em] ${
              isDarkHero ? "text-ivory" : "text-foreground"
            }`}
          >
            Metal Work Nepal
          </span>
        </Link>

        {/* ── DESKTOP NAV ── */}
        <nav aria-label="Main" className="hidden items-center gap-9 lg:flex">
          {/* COLLECTION mega-menu trigger */}
          <div
            className="relative"
            onMouseEnter={handleCollectionEnter}
            onMouseLeave={handleCollectionLeave}
          >
            <button
              type="button"
              onClick={() => setCollectionOpen((v) => !v)}
              aria-expanded={collectionOpen}
              aria-haspopup="true"
              className={`group relative flex items-center gap-1.5 py-1 text-[0.8rem] font-bold tracking-[0.16em] uppercase transition-colors duration-300 ${
                isDarkHero
                  ? "text-ivory/90 hover:text-ivory"
                  : isCollectionActive || collectionOpen
                    ? "text-bronze"
                    : "text-foreground/80 hover:text-foreground"
              }`}
            >
              Collection
              <motion.span
                animate={{ rotate: collectionOpen ? 180 : 0 }}
                transition={{ duration: 0.25, ease: DROPDOWN_EASE }}
                className="inline-flex"
              >
                <ChevronDown className="h-3.5 w-3.5 mt-0.5" />
              </motion.span>
              {/* Animated bronze underline */}
              <motion.span
                className={`absolute -bottom-0.5 left-0 h-[2px] ${isDarkHero ? "bg-bronze-soft" : "bg-bronze"}`}
                initial={false}
                animate={{ width: isCollectionActive || collectionOpen ? "100%" : "0%" }}
                transition={{ duration: 0.3, ease: DROPDOWN_EASE }}
              />
            </button>
          </div>

          {/* Other links */}
          {NAV_SIMPLE.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => {
                if (pathname === item.to) window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className={`group relative py-1 text-[0.8rem] font-bold tracking-[0.16em] uppercase transition-colors duration-300 ${
                isDarkHero ? "text-ivory/90 hover:text-ivory" : "text-foreground/80 hover:text-foreground"
              }`}
              activeProps={{ className: isDarkHero ? "text-ivory font-extrabold" : "text-foreground font-extrabold" }}
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

        {/* ── CTA + HAMBURGER ── */}
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

      {/* ── DESKTOP MEGA-MENU ── */}
      <AnimatePresence>
        {collectionOpen && (
          <motion.div
            onMouseEnter={handleCollectionEnter}
            onMouseLeave={handleCollectionLeave}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: DROPDOWN_EASE }}
            className="absolute inset-x-0 top-full hidden border-b border-hairline bg-background/98 shadow-lift backdrop-blur-2xl lg:block"
          >
            <div className="mx-auto max-w-[1440px] px-10 py-8">
              {/* Mega-menu header */}
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.26, delay: 0.04, ease: DROPDOWN_EASE }}
                className="mb-6 flex items-end justify-between"
              >
                <div>
                  <p className="text-[0.6rem] font-bold tracking-[0.28em] uppercase text-bronze mb-1">
                    01 / COLLECTION
                  </p>
                  <h2 className="text-[1.6rem] font-extrabold tracking-tight text-foreground leading-none">
                    What we make
                  </h2>
                  <p className="mt-1.5 text-[0.8rem] text-muted-foreground tracking-wide max-w-sm">
                    Hand-built metalwork for architecture, interiors and everyday spaces.
                  </p>
                </div>
                <Link
                  to="/collection"
                  onClick={() => setCollectionOpen(false)}
                  className="group hidden xl:flex items-center gap-2 text-[0.7rem] font-bold tracking-[0.18em] uppercase text-muted-foreground hover:text-bronze transition-colors duration-300"
                >
                  <span>Full Catalogue</span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </motion.div>

              {/* 3 Category Cards */}
              <div className="grid grid-cols-3 gap-5">
                {COLLECTION_CATEGORIES.map((cat, i) => (
                  <motion.button
                    key={cat.id}
                    type="button"
                    onClick={() => handleCategoryNavigate(cat.id)}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.28, delay: 0.08 + i * 0.06, ease: DROPDOWN_EASE }}
                    className="group relative text-left border border-hairline bg-card hover:border-bronze/50 transition-all duration-350 overflow-hidden"
                  >
                    {/* Image */}
                    <div className="relative h-44 overflow-hidden bg-sand/40">
                      {cat.image ? (
                        <img
                          src={cat.image}
                          alt={cat.title}
                          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                        />
                      ) : (
                        <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-sand to-sand/50">
                          <div className="h-12 w-12 rounded-full border border-hairline grid place-items-center bg-background/60">
                            <Sparkles className="h-5 w-5 text-bronze/60" />
                          </div>
                          <span className="text-[0.62rem] font-bold tracking-[0.2em] uppercase text-muted-foreground">
                            Coming Soon
                          </span>
                        </div>
                      )}
                      {/* Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-charcoal/50 via-transparent to-transparent opacity-45 transition-opacity duration-300 group-hover:opacity-70 pointer-events-none" />

                      {/* Badge */}
                      {cat.badge && (
                        <span
                          className={`absolute top-2.5 left-2.5 px-2 py-0.5 text-[0.54rem] font-bold tracking-[0.2em] uppercase border ${
                            cat.accent
                              ? "bg-bronze text-ivory border-bronze/80"
                              : "bg-background/92 text-bronze border-hairline/60"
                          }`}
                        >
                          {cat.badge}
                        </span>
                      )}

                      {/* Bottom bronze bar on hover */}
                      <div className="absolute bottom-0 left-0 h-[2px] bg-bronze w-0 group-hover:w-full transition-all duration-400 ease-out" />
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <h3 className="text-sm font-extrabold tracking-tight text-foreground group-hover:text-bronze transition-colors duration-300">
                        {cat.title}
                      </h3>
                      <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                        {cat.description}
                      </p>

                      <div className="mt-2.5 flex flex-wrap gap-1.5">
                        {cat.labels.map((lbl) => (
                          <span
                            key={lbl}
                            className="px-1.5 py-0.5 text-[0.54rem] font-bold tracking-[0.14em] uppercase border border-hairline text-muted-foreground"
                          >
                            {lbl}
                          </span>
                        ))}
                      </div>

                      <div className="mt-3 flex items-center justify-between border-t border-hairline pt-3">
                        <span className="text-[0.65rem] font-bold tracking-[0.16em] uppercase text-muted-foreground group-hover:text-bronze transition-colors duration-300">
                          {cat.cta}
                        </span>
                        <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-bronze group-hover:translate-x-1 transition-all duration-300" />
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>

              {/* Custom Metalwork full-width CTA */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.28, delay: 0.26, ease: DROPDOWN_EASE }}
                className="mt-5 flex items-center justify-between border border-hairline bg-sand/20 px-6 py-4 hover:border-bronze/40 hover:bg-sand/35 transition-all duration-300 group"
              >
                <div>
                  <p className="text-[0.58rem] font-bold tracking-[0.24em] uppercase text-bronze mb-0.5">
                    CUSTOM METALWORK
                  </p>
                  <h4 className="text-sm font-extrabold tracking-tight text-foreground">
                    Have something different in mind?
                  </h4>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Tell us about your project and we'll help turn the idea into metal.
                  </p>
                </div>
                <Link
                  to="/contact"
                  onClick={() => setCollectionOpen(false)}
                  className="shrink-0 flex items-center gap-2 bg-charcoal px-5 py-2.5 text-[0.65rem] font-bold tracking-[0.18em] uppercase text-ivory hover:bg-bronze transition-colors duration-300 group/cta"
                >
                  <span>Start an Enquiry</span>
                  <ArrowRight className="h-3 w-3 transition-transform duration-300 group-hover/cta:translate-x-1" />
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MOBILE MENU ── */}
      <AnimatePresence>
        {open ? (
          <motion.div
            ref={mobileTrapRef}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="overflow-hidden border-t border-hairline bg-background/98 shadow-lift backdrop-blur-2xl lg:hidden"
          >
            <nav aria-label="Mobile" className="flex flex-col px-5 py-4">
              {/* COLLECTION accordion */}
              <div className="border-b border-hairline">
                <button
                  type="button"
                  onClick={() => setMobileCollectionOpen((v) => !v)}
                  aria-expanded={mobileCollectionOpen}
                  className="flex w-full items-center justify-between py-4 text-sm font-bold tracking-[0.16em] uppercase text-foreground hover:text-bronze transition-colors duration-200"
                >
                  <span className={isCollectionActive ? "text-bronze" : ""}>Collection</span>
                  <motion.span
                    animate={{ rotate: mobileCollectionOpen ? 180 : 0 }}
                    transition={{ duration: 0.22, ease: DROPDOWN_EASE }}
                    className="inline-flex"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </motion.span>
                </button>

                <AnimatePresence>
                  {mobileCollectionOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: DROPDOWN_EASE }}
                      className="overflow-hidden"
                    >
                      <div className="pb-3 pl-2 flex flex-col gap-0.5">
                        {MOBILE_COLLECTION.map((item) => {
                          if ("to" in item) {
                            return (
                              <Link
                                key={item.label}
                                to={item.to}
                                onClick={() => { setOpen(false); setMobileCollectionOpen(false); }}
                                className="group flex items-start justify-between gap-3 border-l-2 border-hairline hover:border-bronze px-4 py-3 transition-all duration-200"
                              >
                                <div>
                                  <p className="text-xs font-bold tracking-[0.14em] uppercase text-foreground group-hover:text-bronze transition-colors">
                                    {item.label}
                                  </p>
                                  <p className="mt-0.5 text-[0.7rem] text-muted-foreground leading-relaxed">
                                    {item.desc}
                                  </p>
                                </div>
                                <ArrowRight className="h-3.5 w-3.5 shrink-0 mt-0.5 text-muted-foreground group-hover:text-bronze transition-all duration-200" />
                              </Link>
                            );
                          }
                          return (
                            <button
                              key={item.label}
                              type="button"
                              onClick={() => {
                                setOpen(false);
                                setMobileCollectionOpen(false);
                                void navigate({ to: "/collection" });
                              }}
                              className="group flex items-start justify-between gap-3 border-l-2 border-hairline hover:border-bronze px-4 py-3 text-left transition-all duration-200"
                            >
                              <div>
                                <p className="text-xs font-bold tracking-[0.14em] uppercase text-foreground group-hover:text-bronze transition-colors">
                                  {item.label}
                                </p>
                                <p className="mt-0.5 text-[0.7rem] text-muted-foreground leading-relaxed">
                                  {item.desc}
                                </p>
                              </div>
                              <ArrowRight className="h-3.5 w-3.5 shrink-0 mt-0.5 text-muted-foreground group-hover:text-bronze transition-all duration-200" />
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Other mobile links */}
              {NAV_SIMPLE.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => {
                    setOpen(false);
                    if (pathname === item.to) window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="border-b border-hairline py-4 text-sm font-bold tracking-[0.16em] text-foreground uppercase last:border-0 hover:text-bronze transition-colors duration-200"
                >
                  {item.label}
                </Link>
              ))}

              <Link
                to="/calculator"
                onClick={() => setOpen(false)}
                className="mt-4 bg-charcoal px-6 py-4 text-center text-[0.72rem] font-bold tracking-[0.2em] text-ivory uppercase hover:bg-bronze transition-colors duration-200"
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
