import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { type Product } from "@/data/products";
import { DEFAULT_SETTINGS, STORAGE_KEYS, type Settings } from "@/config/settings";
import { isStorageAvailable, readJSON, writeJSON } from "@/utils/localStorage";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export const ENQUIRY_STATUSES = [
  "NEW",
  "CONTACTED",
  "QUOTATION SENT",
  "CONFIRMED",
  "COMPLETED",
  "CANCELLED",
] as const;

export type EnquiryStatus = (typeof ENQUIRY_STATUSES)[number];

export type Enquiry = {
  id: string;
  createdAt: string;
  customerName: string;
  phone: string;
  email: string;
  location: string;
  projectType: string;
  productId: string;
  productCode: string;
  productName: string;
  material: string;
  isCustom: boolean;
  quantity: number;
  area: number;
  totalArea: number;
  rate: number;
  estimatedTotal: number;
  additionalRequirements: string;
  status: EnquiryStatus;
};

type StudioValue = {
  ready: boolean;
  isCloudConnected: boolean;
  storageOk: boolean;
  products: Product[];
  activeProducts: Product[];
  settings: Settings;
  enquiries: Enquiry[];
  selectedId: string | null;
  selectedProduct: Product | null;
  selectProduct: (id: string | null) => void;
  saveProduct: (p: Product) => void;
  deleteProduct: (id: string) => void;
  resetProducts: () => void;
  addEnquiry: (e: Omit<Enquiry, "id" | "createdAt" | "status">) => Enquiry;
  updateEnquiryStatus: (id: string, status: EnquiryStatus) => void;
  clearEnquiries: () => void;
  updateSettings: (s: Partial<Settings>) => void;
  refreshFromCloud: () => Promise<void>;
};

const StudioContext = createContext<StudioValue | null>(null);

// Database record mappers
function mapDbProductToProduct(row: any): Product {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    description: row.description,
    material: row.material,
    pricePerSqft: Number(row.price_per_sqft) || 0,
    isCustom: Boolean(row.is_custom),
    image: row.image,
    gallery: Array.isArray(row.gallery) ? row.gallery : [row.image],
    features: Array.isArray(row.features) ? row.features : [],
    applications: Array.isArray(row.applications) ? row.applications : [],
    isActive: row.is_active ?? true,
  };
}

function mapProductToDbProduct(p: Product) {
  return {
    id: p.id,
    code: p.code,
    name: p.name,
    description: p.description,
    material: p.material,
    price_per_sqft: p.pricePerSqft,
    is_custom: p.isCustom,
    image: p.image,
    features: p.features,
    applications: p.applications,
    is_active: p.isActive,
    updated_at: new Date().toISOString(),
  };
}

function mapDbEnquiryToEnquiry(row: any): Enquiry {
  return {
    id: String(row.id),
    createdAt: row.created_at || new Date().toISOString(),
    customerName: row.customer_name || "",
    phone: row.phone || "",
    email: row.email || "",
    location: row.location || "",
    projectType: row.project_type || "",
    productId: row.product_id || "",
    productCode: row.product_code || "",
    productName: row.product_name || "",
    material: row.material || "",
    isCustom: Boolean(row.is_custom),
    quantity: Number(row.quantity) || 1,
    area: Number(row.area) || 0,
    totalArea: Number(row.total_area) || 0,
    rate: Number(row.rate) || 0,
    estimatedTotal: Number(row.estimated_total) || 0,
    additionalRequirements: row.additional_requirements || "",
    status: row.status || "NEW",
  };
}

function mapEnquiryToDbEnquiry(e: Enquiry) {
  return {
    customer_name: e.customerName,
    phone: e.phone,
    email: e.email,
    location: e.location,
    project_type: e.projectType,
    product_id: e.productId,
    product_code: e.productCode,
    product_name: e.productName,
    material: e.material,
    is_custom: e.isCustom,
    quantity: e.quantity,
    area: e.area,
    total_area: e.totalArea,
    rate: e.rate,
    estimated_total: e.estimatedTotal,
    status: e.status,
    additional_requirements: e.additionalRequirements,
  };
}

export function StudioProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [storageOk, setStorageOk] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // 1. Initial hydration from local cache
  useEffect(() => {
    const ok = isStorageAvailable();
    setStorageOk(ok);
    if (ok) {
      const storedProducts = readJSON<Product[] | null>(STORAGE_KEYS.products, null);
      if (storedProducts && Array.isArray(storedProducts) && storedProducts.length) {
        setProducts(storedProducts);
      }
      const loadedSettings = readJSON<Partial<Settings>>(STORAGE_KEYS.settings, {});
      if (loadedSettings.whatsappNumber === "9779800000000") {
        loadedSettings.whatsappNumber = DEFAULT_SETTINGS.whatsappNumber;
      }
      if (loadedSettings.phone === "+977 980-0000000") {
        loadedSettings.phone = DEFAULT_SETTINGS.phone;
      }
      if (loadedSettings.address === "Kathmandu, Nepal") {
        loadedSettings.address = DEFAULT_SETTINGS.address;
      }
      setSettings({ ...DEFAULT_SETTINGS, ...loadedSettings });
      setEnquiries(readJSON<Enquiry[]>(STORAGE_KEYS.enquiries, []));
      try {
        localStorage.removeItem(STORAGE_KEYS.selected);
      } catch {
        /* ignore */
      }
    }
    setReady(true);
  }, []);

  const refreshFromCloud = useCallback(async () => {
    if (!isSupabaseConfigured || !supabase) return;
    try {
      // Fetch products dynamically from Supabase database
      const { data: dbProducts, error: prodErr } = await supabase
        .from("products")
        .select("*")
        .order("display_order", { ascending: true });

      if (!prodErr && dbProducts) {
        const mapped = dbProducts.map(mapDbProductToProduct);
        setProducts(mapped);
        writeJSON(STORAGE_KEYS.products, mapped);
      }

      // Fetch enquiries dynamically from Supabase database
      const { data: dbEnquiries, error: enqErr } = await supabase
        .from("enquiries")
        .select("*")
        .order("created_at", { ascending: false });

      if (!enqErr && dbEnquiries) {
        const mapped = dbEnquiries.map(mapDbEnquiryToEnquiry);
        setEnquiries(mapped);
        writeJSON(STORAGE_KEYS.enquiries, mapped);
      }

      // Fetch settings dynamically from Supabase database
      const { data: dbSettings, error: setErr } = await supabase
        .from("settings")
        .select("*")
        .eq("id", "default")
        .single();

      if (!setErr && dbSettings) {
        const mapped: Settings = {
          companyName: dbSettings.company_name || DEFAULT_SETTINGS.companyName,
          studioName: dbSettings.studio_name || DEFAULT_SETTINGS.studioName,
          whatsappNumber: dbSettings.whatsapp_number || DEFAULT_SETTINGS.whatsappNumber,
          phone: dbSettings.phone || DEFAULT_SETTINGS.phone,
          email: dbSettings.email || DEFAULT_SETTINGS.email,
          address: dbSettings.address || DEFAULT_SETTINGS.address,
          currency: dbSettings.currency || DEFAULT_SETTINGS.currency,
          currencyLocale: dbSettings.currency_locale || DEFAULT_SETTINGS.currencyLocale,
          instagram: dbSettings.instagram || DEFAULT_SETTINGS.instagram,
          website: dbSettings.website || DEFAULT_SETTINGS.website,
          adminPassword: DEFAULT_SETTINGS.adminPassword,
        };
        setSettings(mapped);
        writeJSON(STORAGE_KEYS.settings, mapped);
      }
    } catch (err) {
      console.error("Supabase sync error:", err);
    }
  }, []);

  // 2. Fetch live data from Supabase on mount
  useEffect(() => {
    refreshFromCloud();
  }, [refreshFromCloud]);

  const persistProducts = useCallback((next: Product[]) => {
    setProducts(next);
    writeJSON(STORAGE_KEYS.products, next);
  }, []);

  const persistEnquiries = useCallback((next: Enquiry[]) => {
    setEnquiries(next);
    writeJSON(STORAGE_KEYS.enquiries, next);
  }, []);

  const selectProduct = useCallback((id: string | null) => {
    setSelectedId(id);
  }, []);

  const saveProduct = useCallback((p: Product) => {
    setProducts((prev) => {
      const exists = prev.some((x) => x.id === p.id);
      const next = exists ? prev.map((x) => (x.id === p.id ? p : x)) : [...prev, p];
      writeJSON(STORAGE_KEYS.products, next);
      return next;
    });

    if (supabase && isSupabaseConfigured) {
      void supabase.from("products").upsert(mapProductToDbProduct(p));
    }
  }, []);

  const deleteProduct = useCallback((id: string) => {
    setProducts((prev) => {
      const next = prev.filter((x) => x.id !== id);
      writeJSON(STORAGE_KEYS.products, next);
      return next;
    });
    setSelectedId((cur) => (cur === id ? null : cur));

    if (supabase && isSupabaseConfigured) {
      void supabase.from("products").delete().eq("id", id);
    }
  }, []);

  const resetProducts = useCallback(() => {
    if (supabase && isSupabaseConfigured) {
      void refreshFromCloud();
    }
  }, [refreshFromCloud]);

  const addEnquiry = useCallback<StudioValue["addEnquiry"]>((data) => {
    const enquiry: Enquiry = {
      ...data,
      id: `enq_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      createdAt: new Date().toISOString(),
      status: "NEW",
    };

    setEnquiries((prev) => {
      const next = [enquiry, ...prev];
      writeJSON(STORAGE_KEYS.enquiries, next);
      return next;
    });

    if (supabase && isSupabaseConfigured) {
      void (async () => {
        try {
          const { data: created, error } = await supabase!
            .from("enquiries")
            .insert(mapEnquiryToDbEnquiry(enquiry))
            .select()
            .single();

          if (!error && created) {
            setEnquiries((prev) =>
              prev.map((e) => (e.id === enquiry.id ? mapDbEnquiryToEnquiry(created) : e)),
            );
          }
        } catch (err) {
          console.error("Supabase insert error:", err);
        }
      })();
    }

    return enquiry;
  }, []);

  const updateEnquiryStatus = useCallback((id: string, status: EnquiryStatus) => {
    setEnquiries((prev) => {
      const next = prev.map((e) => (e.id === id ? { ...e, status } : e));
      writeJSON(STORAGE_KEYS.enquiries, next);
      return next;
    });

    if (supabase && isSupabaseConfigured) {
      void supabase.from("enquiries").update({ status }).eq("id", id);
    }
  }, []);

  const clearEnquiries = useCallback(() => {
    persistEnquiries([]);
    if (supabase && isSupabaseConfigured) {
      void supabase.from("enquiries").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    }
  }, [persistEnquiries]);

  const updateSettings = useCallback((s: Partial<Settings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...s };
      writeJSON(STORAGE_KEYS.settings, next);
      return next;
    });

    if (supabase && isSupabaseConfigured) {
      void supabase
        .from("settings")
        .upsert({
          id: "default",
          company_name: s.companyName,
          studio_name: s.studioName,
          whatsapp_number: s.whatsappNumber,
          phone: s.phone,
          email: s.email,
          address: s.address,
          currency: s.currency,
          currency_locale: s.currencyLocale,
          instagram: s.instagram,
          website: s.website,
          updated_at: new Date().toISOString(),
        });
    }
  }, []);

  const value = useMemo<StudioValue>(() => {
    const activeProducts = products.filter((p) => p.isActive);
    return {
      ready,
      isCloudConnected: isSupabaseConfigured,
      storageOk,
      products,
      activeProducts,
      settings,
      enquiries,
      selectedId,
      selectedProduct: products.find((p) => p.id === selectedId && p.isActive) ?? null,
      selectProduct,
      saveProduct,
      deleteProduct,
      resetProducts,
      addEnquiry,
      updateEnquiryStatus,
      clearEnquiries,
      updateSettings,
      refreshFromCloud,
    };
  }, [
    ready,
    storageOk,
    products,
    settings,
    enquiries,
    selectedId,
    selectProduct,
    saveProduct,
    deleteProduct,
    resetProducts,
    addEnquiry,
    updateEnquiryStatus,
    clearEnquiries,
    updateSettings,
    refreshFromCloud,
  ]);

  return <StudioContext.Provider value={value}>{children}</StudioContext.Provider>;
}

export function useStudio(): StudioValue {
  const ctx = useContext(StudioContext);
  if (!ctx) throw new Error("useStudio must be used within StudioProvider");
  return ctx;
}
