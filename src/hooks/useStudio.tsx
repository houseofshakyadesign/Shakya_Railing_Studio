import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { DEFAULT_PRODUCTS, type Product } from "@/data/products";
import { DEFAULT_SETTINGS, STORAGE_KEYS, type Settings } from "@/config/settings";
import { isStorageAvailable, readJSON, writeJSON } from "@/utils/localStorage";

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
};

const StudioContext = createContext<StudioValue | null>(null);

export function StudioProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [storageOk, setStorageOk] = useState(true);
  const [products, setProducts] = useState<Product[]>(DEFAULT_PRODUCTS);
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Hydrate from localStorage after mount (SSR-safe).
  useEffect(() => {
    const ok = isStorageAvailable();
    setStorageOk(ok);
    if (ok) {
      const storedProducts = readJSON<Product[] | null>(STORAGE_KEYS.products, null);
      if (storedProducts && Array.isArray(storedProducts) && storedProducts.length) {
        setProducts(storedProducts);
      } else {
        writeJSON(STORAGE_KEYS.products, DEFAULT_PRODUCTS);
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
      // Clean up any previously stored selection so refreshing starts fresh
      try {
        localStorage.removeItem(STORAGE_KEYS.selected);
      } catch {
        /* ignore */
      }
    }
    setReady(true);
  }, []);

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

  const saveProduct = useCallback(
    (p: Product) => {
      setProducts((prev) => {
        const exists = prev.some((x) => x.id === p.id);
        const next = exists ? prev.map((x) => (x.id === p.id ? p : x)) : [...prev, p];
        writeJSON(STORAGE_KEYS.products, next);
        return next;
      });
    },
    [],
  );

  const deleteProduct = useCallback((id: string) => {
    setProducts((prev) => {
      const next = prev.filter((x) => x.id !== id);
      writeJSON(STORAGE_KEYS.products, next);
      return next;
    });
    setSelectedId((cur) => (cur === id ? null : cur));
  }, []);

  const resetProducts = useCallback(() => persistProducts(DEFAULT_PRODUCTS), [persistProducts]);

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
    return enquiry;
  }, []);

  const updateEnquiryStatus = useCallback((id: string, status: EnquiryStatus) => {
    setEnquiries((prev) => {
      const next = prev.map((e) => (e.id === id ? { ...e, status } : e));
      writeJSON(STORAGE_KEYS.enquiries, next);
      return next;
    });
  }, []);

  const clearEnquiries = useCallback(() => persistEnquiries([]), [persistEnquiries]);

  const updateSettings = useCallback((s: Partial<Settings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...s };
      writeJSON(STORAGE_KEYS.settings, next);
      return next;
    });
  }, []);

  const value = useMemo<StudioValue>(() => {
    const activeProducts = products.filter((p) => p.isActive);
    return {
      ready,
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
  ]);

  return <StudioContext.Provider value={value}>{children}</StudioContext.Provider>;
}

export function useStudio(): StudioValue {
  const ctx = useContext(StudioContext);
  if (!ctx) throw new Error("useStudio must be used within StudioProvider");
  return ctx;
}
