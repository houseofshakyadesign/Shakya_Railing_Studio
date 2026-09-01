import { createFileRoute } from "@tanstack/react-router";
import { CatalogueDetail } from "@/components/CatalogueDetail";

export const Route = createFileRoute("/collection/$slug")({
  head: (ctx) => {
    const rawSlug = ctx?.params?.slug;
    const slug = typeof rawSlug === "string" ? rawSlug : "Design";
    const formatted = slug
      .split("-")
      .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

    const title = `${formatted} | Metal Work Nepal`;
    const description = `Architectural metalwork design specifications and fabrication details for ${formatted} by Metal Work Nepal studio.`;

    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "product" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: CatalogueDetailPage,
});

function CatalogueDetailPage() {
  const { slug } = Route.useParams();
  return <CatalogueDetail productSlugOrId={slug} />;
}
