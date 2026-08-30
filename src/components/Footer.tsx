import { Link } from "@tanstack/react-router";
import { useStudio } from "@/hooks/useStudio";

export function Footer() {
  const { settings } = useStudio();
  const waHref = `https://wa.me/${settings.whatsappNumber.replace(/\D/g, "")}`;

  return (
    <footer className="border-t border-hairline bg-sand">
      <div className="mx-auto grid max-w-[1440px] gap-12 px-5 py-16 md:grid-cols-[1.4fr_1fr_1fr] md:px-10 md:py-24">
        <div>
          <div className="flex items-center gap-4">
            <img
              src="/logo/house-of-shakya-logo-dark.png"
              alt="Metal Work Nepal — Architectural Metalwork Studio"
              className="h-14 w-14 md:h-16 md:w-16 shrink-0 rounded-sm object-contain"
            />
            <div>
              <p className="text-[0.98rem] md:text-base font-extrabold tracking-[0.24em] uppercase">
                Metal Work Nepal
              </p>
              <p className="mt-0.5 text-[0.66rem] font-bold tracking-[0.24em] text-bronze uppercase">
                Architectural Metalwork Studio
              </p>
            </div>
          </div>
          <p className="mt-6 max-w-sm text-sm leading-relaxed text-muted-foreground">
            Hand-forged and fabricated metalwork for contemporary architecture.
          </p>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
            {settings.address} · {settings.phone}
          </p>
        </div>

        <nav aria-label="Footer" className="flex flex-col gap-3 text-sm">
          <p className="label-xs mb-2 text-muted-foreground">Studio</p>
          <Link to="/collection" className="w-fit hover:text-bronze">
            Collection
          </Link>
          <Link to="/projects" className="w-fit hover:text-bronze">
            Projects
          </Link>
          <Link to="/how-it-works" className="w-fit hover:text-bronze">
            How It Works
          </Link>
          <Link to="/about" className="w-fit hover:text-bronze">
            About
          </Link>
          <Link to="/contact" className="w-fit hover:text-bronze">
            Contact
          </Link>
        </nav>

        <div className="flex flex-col gap-3 text-sm">
          <p className="label-xs mb-2 text-muted-foreground">Connect</p>
          <a href={waHref} target="_blank" rel="noreferrer" className="w-fit hover:text-bronze">
            WhatsApp
          </a>
          <a
            href={settings.instagram}
            target="_blank"
            rel="noreferrer"
            className="w-fit hover:text-bronze"
          >
            Instagram
          </a>
          <a
            href={settings.tiktok}
            target="_blank"
            rel="noreferrer"
            className="w-fit hover:text-bronze"
          >
            TikTok
          </a>
          <a
            href={settings.website}
            target="_blank"
            rel="noreferrer"
            className="w-fit hover:text-bronze"
          >
            Website
          </a>
        </div>
      </div>
      <div className="border-t border-hairline">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-2 px-5 py-6 text-[0.7rem] tracking-[0.14em] text-muted-foreground uppercase md:flex-row md:items-center md:justify-between md:px-10">
          <p>© {new Date().getFullYear()} Metal Work Nepal. All rights reserved.</p>
          <p>Estimates are indicative and confirmed after site review.</p>
        </div>
      </div>
    </footer>
  );
}
