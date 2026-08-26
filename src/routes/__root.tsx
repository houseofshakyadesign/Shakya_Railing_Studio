import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { MobileSelectionBar } from "@/components/MobileSelectionBar";
import { StudioProvider } from "@/hooks/useStudio";
import { Toaster } from "@/components/ui/sonner";


function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

NotFoundComponent.head = () => ({
  meta: [{ name: "robots", content: "noindex" }],
});

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Metal Work Nepal | Railing Studio" },
      {
        name: "description",
        content:
          "Explore architectural metalwork and bespoke railing systems by Metal Work Nepal. Select a design, calculate your instant estimate and connect directly with our studio.",
      },
      { name: "author", content: "Metal Work Nepal" },
      { name: "theme-color", content: "#f6f3ec" },
      { property: "og:site_name", content: "Metal Work Nepal — Railing Studio" },
      { property: "og:type", content: "website" },
      { property: "og:title", content: "Metal Work Nepal | Railing Studio" },
      {
        property: "og:description",
        content:
          "Explore architectural metalwork and bespoke railing systems by Metal Work Nepal.",
      },
      { property: "og:image", content: "/images/railings/hero.jpg" },
      { property: "og:url", content: "https://shakya-railing-studio.vercel.app" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Metal Work Nepal | Railing Studio" },
      {
        name: "twitter:description",
        content:
          "Explore architectural metalwork and bespoke railing systems by Metal Work Nepal.",
      },
      { name: "twitter:image", content: "/images/railings/hero.jpg" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;800&family=Fraunces:ital,opsz,wght@1,9..144,300;1,9..144,400&display=swap",
      },
      { rel: "icon", href: "/logo/house-of-shakya-logo-dark.png", type: "image/png" },
      { rel: "apple-touch-icon", href: "/logo/house-of-shakya-logo-dark.png" },
      { rel: "canonical", href: "https://shakya-railing-studio.vercel.app" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
    window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <StudioProvider>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:z-[200] focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-foreground focus:outline-none focus:ring-2 focus:ring-bronze"
        >
          Skip to main content
        </a>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              name: "Metal Work Nepal",
              description: "Architectural metalwork and bespoke railing systems",
              url: "https://shakya-railing-studio.vercel.app",
              telephone: "+977-984-3935689",
              address: {
                "@type": "PostalAddress",
                streetAddress: "Imadole",
                addressLocality: "Mahalaxmi",
                addressCountry: "NP",
              },
              sameAs: [
                "https://www.instagram.com/metalwork.nepal",
                "https://www.tiktok.com/@metalworknepal",
              ],
            }),
          }}
        />
        <Navbar />
        <main id="main-content" className="min-h-screen pb-20 lg:pb-0">
          <Outlet />
        </main>
        <Footer />
        <MobileSelectionBar />
        <Toaster position="top-center" />
      </StudioProvider>
    </QueryClientProvider>
  );
}

