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
import { DEFAULT_RAILING_TYPES, type RailingTypeConfig, type RailingTypeSlug } from "@/utils/calculations";
import { api } from "@/lib/api";

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
  railingType: string;
  productId: string;
  productCode: string;
  productName: string;
  material: string;
  isCustom: boolean;
  lengthFt: number;
  heightFt: number;
  estimatedAreaSqft: number;
  rate: number;
  estimatedPrice: number;
  estimatedTotal: number;
  additionalRequirements: string;
  status: EnquiryStatus;
  // Compatibility fields if ever read
  quantity?: number;
  area?: number;
  totalArea?: number;
  estimatedPanelQuantity?: number;
  standardModuleWidthFt?: number;
};

type StudioValue = {
  ready: boolean;
  isCloudConnected: boolean;
  storageOk: boolean;
  products: Product[];
  activeProducts: Product[];
  settings: Settings;
  enquiries: Enquiry[];
  railingTypes: RailingTypeConfig[];
  railingType: RailingTypeSlug;
  setRailingType: (type: RailingTypeSlug) => void;
  currentStandardHeight: number;
  selectedId: string | null;
  selectedProduct: Product | null;
  selectProduct: (id: string | null) => void;
  saveProduct: (p: Product) => Promise<boolean>;
  deleteProduct: (id: string) => Promise<boolean>;
  resetProducts: () => void;
  addEnquiry: (e: Omit<Enquiry, "id" | "createdAt" | "status">) => Enquiry;
  updateEnquiryStatus: (id: string, status: EnquiryStatus) => Promise<boolean>;
  clearEnquiries: () => void;
  updateSettings: (s: Partial<Settings>) => Promise<boolean>;
  refreshFromCloud: () => Promise<void>;
};

const StudioContext = createContext<StudioValue | null>(null);

export function StudioProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [isCloudConnected, setIsCloudConnected] = useState(true);
  const storageOk = useMemo(() => isStorageAvailable(), []);

  const [products, setProducts] = useState<Product[]>(() => {
    return readJSON<Product[]>(STORAGE_KEYS.products, []);
  });

  const [settings, setSettings] = useState<Settings>(() => {
    return readJSON<Settings>(STORAGE_KEYS.settings, DEFAULT_SETTINGS);
  });

  const [enquiries, setEnquiries] = useState<Enquiry[]>(() => {
    return readJSON<Enquiry[]>(STORAGE_KEYS.enquiries, []);
  });

  const [railingTypes, setRailingTypes] = useState<RailingTypeConfig[]>(DEFAULT_RAILING_TYPES);

  const [railingType, setRailingTypeState] = useState<RailingTypeSlug>(() => {
    const saved = readJSON<RailingTypeSlug>(STORAGE_KEYS.railingType, "balcony");
    return saved === "staircase" ? "staircase" : "balcony";
  });

  const [selectedId, setSelectedId] = useState<string | null>(() => {
    return readJSON<string | null>(STORAGE_KEYS.selected, null);
  });

  const setRailingType = useCallback((type: RailingTypeSlug) => {
    setRailingTypeState(type);
    writeJSON(STORAGE_KEYS.railingType, type);
  }, []);

  const currentStandardHeight = useMemo(() => {
    const found = railingTypes.find((t) => t.slug === railingType);
    if (found) return found.standardHeightFt;
    return railingType === "staircase" ? 2.8 : 3.0;
  }, [railingTypes, railingType]);

  // 1. Initial hydration
  useEffect(() => {
    if (storageOk) {
      setProducts(readJSON<Product[]>(STORAGE_KEYS.products, []));
      setSettings(readJSON<Settings>(STORAGE_KEYS.settings, DEFAULT_SETTINGS));
      setEnquiries(readJSON<Enquiry[]>(STORAGE_KEYS.enquiries, []));
      const savedType = readJSON<RailingTypeSlug>(STORAGE_KEYS.railingType, "balcony");
      setRailingTypeState(savedType === "staircase" ? "staircase" : "balcony");
      const savedSel = readJSON<string | null>(STORAGE_KEYS.selected, null);
      if (savedSel) setSelectedId(savedSel);
    }
    setReady(true);
  }, [storageOk]);

  // 2. Fetch live data from Express + MySQL backend
  const refreshFromCloud = useCallback(async () => {
    try {
      // Fetch railing types
      try {
        const types = await api.railingTypes.list();
        if (Array.isArray(types) && types.length > 0) {
          setRailingTypes(types);
        }
      } catch {
        /* fallback to defaults */
      }

      // Fetch products from backend
      const dbProducts = await api.products.list();
      if (Array.isArray(dbProducts) && dbProducts.length > 0) {
        setProducts(dbProducts);
        writeJSON(STORAGE_KEYS.products, dbProducts);
      }

      // Fetch settings from backend
      const dbSettings = await api.settings.get();
      if (dbSettings && dbSettings.companyName) {
        const fullSettings: Settings = {
          ...DEFAULT_SETTINGS,
          ...dbSettings,
        };
        setSettings(fullSettings);
        writeJSON(STORAGE_KEYS.settings, fullSettings);
      }

      // Fetch enquiries if token is present
      try {
        const dbEnquiries = await api.enquiries.list();
        if (Array.isArray(dbEnquiries)) {
          setEnquiries(dbEnquiries);
          writeJSON(STORAGE_KEYS.enquiries, dbEnquiries);
        }
      } catch {
        /* User is unauthenticated, skip admin enquiry list */
      }

      setIsCloudConnected(true);
    } catch (err) {
      console.warn("Backend API sync notice:", err);
      setIsCloudConnected(false);
    }
  }, []);

  useEffect(() => {
    void refreshFromCloud();
  }, [refreshFromCloud]);

  const selectProduct = useCallback((id: string | null) => {
    setSelectedId(id);
    writeJSON(STORAGE_KEYS.selected, id);
  }, []);

  const saveProduct = useCallback(
    async (p: Product): Promise<boolean> => {
      setProducts((prev) => {
        const exists = prev.some((x) => x.id === p.id);
        const next = exists ? prev.map((x) => (x.id === p.id ? p : x)) : [...prev, p];
        writeJSON(STORAGE_KEYS.products, next);
        return next;
      });

      try {
        const exists = products.some((x) => x.id === p.id);
        if (exists) {
          await api.products.update(p.id, p);
        } else {
          await api.products.create(p);
        }
        return true;
      } catch (err) {
        console.error("api.products save error:", err);
        return false;
      }
    },
    [products],
  );

  const deleteProduct = useCallback(
    async (id: string): Promise<boolean> => {
      setProducts((prev) => {
        const next = prev.filter((x) => x.id !== id);
        writeJSON(STORAGE_KEYS.products, next);
        return next;
      });
      setSelectedId((cur) => (cur === id ? null : cur));

      try {
        await api.products.delete(id);
        return true;
      } catch (err) {
        console.error("api.products delete error:", err);
        return false;
      }
    },
    [],
  );

  const resetProducts = useCallback(() => {
    void refreshFromCloud();
  }, [refreshFromCloud]);

  const addEnquiry = useCallback<StudioValue["addEnquiry"]>((data) => {
    const estimatedPrice = data.estimatedPrice || data.estimatedTotal || 0;
    const enquiry: Enquiry = {
      ...data,
      railingType: data.railingType || "Balcony Railing",
      estimatedPrice,
      estimatedTotal: estimatedPrice,
      id: `enq_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      createdAt: new Date().toISOString(),
      status: "NEW",
    };

    setEnquiries((prev) => {
      const next = [enquiry, ...prev];
      writeJSON(STORAGE_KEYS.enquiries, next);
      return next;
    });

    void (async () => {
      try {
        const created = await api.enquiries.create(enquiry);
        if (created && created.id) {
          setEnquiries((prev) =>
            prev.map((e) => (e.id === enquiry.id ? created : e)),
          );
        }
      } catch (err) {
        console.error("api.enquiries.create error:", err);
      }
    })();

    return enquiry;
  }, []);

  const updateEnquiryStatus = useCallback(
    async (id: string, status: EnquiryStatus): Promise<boolean> => {
      setEnquiries((prev) => {
        const next = prev.map((e) => (e.id === id ? { ...e, status } : e));
        writeJSON(STORAGE_KEYS.enquiries, next);
        return next;
      });

      try {
        await api.enquiries.updateStatus(id, status);
        return true;
      } catch (err) {
        console.error("api.enquiries.updateStatus error:", err);
        return false;
      }
    },
    [],
  );

  const clearEnquiries = useCallback(() => {
    setEnquiries([]);
    writeJSON(STORAGE_KEYS.enquiries, []);
  }, []);

  const updateSettings = useCallback(async (patch: Partial<Settings>): Promise<boolean> => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      writeJSON(STORAGE_KEYS.settings, next);
      return next;
    });

    try {
      await api.settings.update(patch);
      return true;
    } catch (err) {
      console.error("api.settings.update error:", err);
      return false;
    }
  }, []);

  const activeProducts = useMemo(() => {
    return products.filter((p) => p.isActive);
  }, [products]);

  const selectedProduct = useMemo(() => {
    if (!selectedId) return activeProducts[0] ?? null;
    return products.find((p) => p.id === selectedId) ?? activeProducts[0] ?? null;
  }, [products, selectedId, activeProducts]);

  const value: StudioValue = {
    ready,
    isCloudConnected,
    storageOk,
    products,
    activeProducts,
    settings,
    enquiries,
    railingTypes,
    railingType,
    setRailingType,
    currentStandardHeight,
    selectedId,
    selectedProduct,
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

  return <StudioContext.Provider value={value}>{children}</StudioContext.Provider>;
}

export function useStudio() {
  const ctx = useContext(StudioContext);
  if (!ctx) {
    throw new Error("useStudio must be used within a StudioProvider");
  }
  return ctx;
}
