export type Product = {
  id: string;
  code: string;
  name: string;
  description: string;
  material: string;
  pricePerSqft: number;
  image: string;
  gallery: string[];
  features: string[];
  applications: string[];
  isCustom: boolean;
  isActive: boolean;
};

const img = (n: string) => `/images/railings/${n}.jpg`;

export const DEFAULT_PRODUCTS: Product[] = [
  {
    id: "r01",
    code: "R-01",
    name: "Minimal Vertical Steel Railing",
    description:
      "Clean vertical steel railing designed for contemporary interiors and exteriors.",
    material: "MS / Mild Steel",
    pricePerSqft: 650,
    image: img("r01"),
    gallery: [img("r01")],
    features: ["Slim 12mm vertical members", "Site-welded frame", "Anti-rust primer + finish"],
    applications: ["Staircases", "Balconies", "Corridors"],
    isCustom: false,
    isActive: true,
  },
  {
    id: "r02",
    code: "R-02",
    name: "Horizontal Linear Railing",
    description:
      "Continuous horizontal lines that widen a space visually and frame the view.",
    material: "MS / Mild Steel",
    pricePerSqft: 700,
    image: img("r02"),
    gallery: [img("r02")],
    features: ["Horizontal linear profile", "Concealed fixings", "Weather-resistant coating"],
    applications: ["Terraces", "Balconies", "Decks"],
    isCustom: false,
    isActive: true,
  },
  {
    id: "r03",
    code: "R-03",
    name: "Modern Black Steel Railing",
    description:
      "Matte black powder-coated steel with a precise, architectural silhouette.",
    material: "Powder-Coated MS",
    pricePerSqft: 750,
    image: img("r03"),
    gallery: [img("r03")],
    features: ["Matte powder-coat finish", "Precision mitred joints", "Low maintenance"],
    applications: ["Staircases", "Mezzanines", "Interiors"],
    isCustom: false,
    isActive: true,
  },
  {
    id: "r04",
    code: "R-04",
    name: "Glass + Steel Railing",
    description:
      "Modern steel structure combined with clear toughened glass for a clean architectural appearance.",
    material: "Powder-Coated MS + Toughened Glass",
    pricePerSqft: 1450,
    image: img("r04"),
    gallery: [img("r04")],
    features: ["10mm toughened glass", "Powder-coated steel frame", "Uninterrupted sightlines"],
    applications: ["Staircases", "Balconies", "Terraces"],
    isCustom: false,
    isActive: true,
  },
  {
    id: "r05",
    code: "R-05",
    name: "Frameless Glass Railing",
    description:
      "A frameless glass balustrade that disappears into the architecture.",
    material: "Toughened Glass + Aluminium/SS fittings",
    pricePerSqft: 1650,
    image: img("r05"),
    gallery: [img("r05")],
    features: ["12mm toughened glass", "Stainless spigot fixings", "Optional slim top rail"],
    applications: ["Balconies", "Terraces", "Hospitality"],
    isCustom: false,
    isActive: true,
  },
  {
    id: "r06",
    code: "R-06",
    name: "MS Box Section Railing",
    description:
      "Economical square-section railing with an honest, structural character.",
    material: "MS Box Section",
    pricePerSqft: 600,
    image: img("r06"),
    gallery: [img("r06")],
    features: ["Square box sections", "Robust welded frame", "Paint or powder-coat finish"],
    applications: ["Terraces", "Exteriors", "Utility areas"],
    isCustom: false,
    isActive: true,
  },
  {
    id: "r07",
    code: "R-07",
    name: "Decorative Vertical Railing",
    description:
      "Vertical members with a crafted decorative rhythm for characterful spaces.",
    material: "MS",
    pricePerSqft: 850,
    image: img("r07"),
    gallery: [img("r07")],
    features: ["Custom decorative detailing", "Hand-finished welds", "Design variations available"],
    applications: ["Staircases", "Residences", "Heritage interiors"],
    isCustom: false,
    isActive: true,
  },
  {
    id: "r08",
    code: "R-08",
    name: "Geometric Pattern Railing",
    description:
      "Laser-cut geometric panels that read as a screen as much as a railing.",
    material: "MS",
    pricePerSqft: 950,
    image: img("r08"),
    gallery: [img("r08")],
    features: ["Laser-cut panels", "Repeating geometry", "Pattern can be customised"],
    applications: ["Balconies", "Facades", "Restaurants"],
    isCustom: false,
    isActive: true,
  },
  {
    id: "r09",
    code: "R-09",
    name: "Cable Railing",
    description:
      "Tensioned stainless cables between slim posts — minimal and view-preserving.",
    material: "SS Cable + Metal Frame",
    pricePerSqft: 1100,
    image: img("r09"),
    gallery: [img("r09")],
    features: ["Tensioned SS cables", "Slim posts", "Excellent visibility"],
    applications: ["Decks", "Terraces", "Cafes"],
    isCustom: false,
    isActive: true,
  },
  {
    id: "r10",
    code: "R-10",
    name: "Wood + Metal Railing",
    description:
      "Warm natural timber handrail paired with a fine metal frame.",
    material: "Natural Wood + MS",
    pricePerSqft: 1250,
    image: img("r10"),
    gallery: [img("r10")],
    features: ["Seasoned hardwood handrail", "Metal sub-frame", "Matt lacquer finish"],
    applications: ["Staircases", "Residences", "Hotels"],
    isCustom: false,
    isActive: true,
  },
  {
    id: "r11",
    code: "R-11",
    name: "Contemporary Designer Railing",
    description:
      "A sculptural, studio-designed profile for signature staircases.",
    material: "Powder-Coated MS",
    pricePerSqft: 1350,
    image: img("r11"),
    gallery: [img("r11")],
    features: ["Studio-designed profile", "Premium finish options", "Curved runs possible"],
    applications: ["Hotels", "Retail", "Premium residences"],
    isCustom: false,
    isActive: true,
  },
  {
    id: "r12",
    code: "R-12",
    name: "Heavy-Duty Exterior Railing",
    description:
      "Built for exposure — heavier sections, deeper protection, longer life.",
    material: "MS",
    pricePerSqft: 800,
    image: img("r12"),
    gallery: [img("r12")],
    features: ["Heavier gauge sections", "Zinc primer + exterior coat", "High load resistance"],
    applications: ["Rooftops", "Industrial", "Public spaces"],
    isCustom: false,
    isActive: true,
  },
  {
    id: "r13",
    code: "R-13",
    name: "Premium Custom Railing",
    description:
      "Fully bespoke railings designed, engineered and fabricated for your project.",
    material: "As specified",
    pricePerSqft: 0,
    image: img("r13"),
    gallery: [img("r13")],
    features: ["Bespoke design development", "Mixed materials", "Full fabrication + installation"],
    applications: ["Signature residences", "Hospitality", "Commercial landmarks"],
    isCustom: true,
    isActive: true,
  },
];
