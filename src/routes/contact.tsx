import { createFileRoute, Link } from "@tanstack/react-router";
import { Instagram, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { Reveal, SectionHeading } from "@/components/Reveal";
import { useStudio } from "@/hooks/useStudio";

const title = "Contact | House of Shakya Railing Studio";
const description =
  "Talk to House of Shakya about your railing project — WhatsApp, phone or email. Imadole, Mahalaxmi based design, fabrication and installation.";

export const Route = createFileRoute("/contact")({
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
  component: ContactPage,
});

function ContactPage() {
  const { settings } = useStudio();
  const wa = `https://wa.me/${settings.whatsappNumber.replace(/\D/g, "")}`;

  const items = [
    { icon: MessageCircle, label: "WhatsApp", value: settings.phone, href: wa },
    { icon: Phone, label: "Phone", value: settings.phone, href: `tel:${settings.phone}` },
    { icon: Mail, label: "Email", value: settings.email, href: `mailto:${settings.email}` },
    { icon: MapPin, label: "Studio", value: settings.address, href: undefined },
    { icon: Instagram, label: "Instagram", value: "@houseofshakya", href: settings.instagram },
  ];

  return (
    <section className="mx-auto max-w-[1440px] px-5 pt-36 pb-24 md:px-10 md:pt-48 md:pb-32">
      <SectionHeading
        label="Contact"
        title="Let's talk about your railing."
        intro="Send a calculated requirement through the studio, or reach us directly — we usually reply the same day."
      />

      <div className="mt-16 grid gap-px border border-hairline bg-hairline sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, i) => (
          <Reveal key={item.label} delay={i * 0.06} className="bg-background p-8">
            <item.icon className="h-4 w-4 text-bronze" />
            <p className="label-xs mt-5 text-muted-foreground">{item.label}</p>
            {item.href ? (
              <a
                href={item.href}
                target={item.href.startsWith("http") ? "_blank" : undefined}
                rel="noreferrer"
                className="mt-2 block text-sm hover:text-bronze"
              >
                {item.value}
              </a>
            ) : (
              <p className="mt-2 text-sm">{item.value}</p>
            )}
          </Reveal>
        ))}
        <Reveal delay={0.3} className="bg-charcoal p-8">
          <p className="label-xs text-bronze-soft">Fastest route</p>
          <p className="mt-4 text-sm leading-relaxed text-ivory/70">
            Calculate your estimate first — your enquiry then arrives complete.
          </p>
          <Link
            to="/calculator"
            className="mt-6 inline-block border border-ivory/35 px-6 py-3 text-[0.68rem] tracking-[0.2em] text-ivory uppercase transition-colors hover:bg-ivory/10"
          >
            Get a Quote
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
