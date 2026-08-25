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

// All product specifications and designs are dynamically stored and fetched from the Supabase database.
export const DEFAULT_PRODUCTS: Product[] = [];
