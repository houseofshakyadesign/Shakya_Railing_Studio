import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { type Product, DEFAULT_PRODUCTS } from "@/data/products";
import { type Project, type ProjectMedia, INITIAL_PROJECTS } from "@/data/projects";
import { DEFAULT_SETTINGS, STORAGE_KEYS, type Settings } from "@/config/settings";
import { isStorageAvailable, readJSON, writeJSON } from "@/utils/localStorage";
import {
  DEFAULT_RAILING_TYPES,
  type RailingTypeConfig,
  type RailingTypeSlug,
} from "@/utils/calculations";
import { api } from "@/lib/api";
import { isRailingProduct } from "@/components/ProductCard";

export type { Project, ProjectMedia };

export const ENQUIRY_STATUSES = ["new", "in_review", "quoted", "confirmed", "archived"] as const;

export type EnquiryStatus = (typeof ENQUIRY_STATUSES)[number];

export const ENQUIRY_STATUS_LABELS: Record<EnquiryStatus, string> = {
  new: "New",
  in_review: "In Review",
  quoted: "Quoted",
  confirmed: "Confirmed",
  archived: "Archived",
};

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
  projects: Project[];
  activeProjects: Project[];
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
  duplicateProduct: (id: string) => Promise<Product | null>;
  resetProducts: () => void;
  saveProject: (p: Project) => Promise<boolean>;
  deleteProject: (id: string) => Promise<boolean>;
  addEnquiry: (e: Omit<Enquiry, "id" | "createdAt" | "status">) => Enquiry;
  updateEnquiryStatus: (id: string, status: EnquiryStatus) => Promise<boolean>;
  clearEnquiries: () => void;
  updateSettings: (s: Partial<Settings>) => Promise<boolean>;
  refreshFromCloud: () => Promise<void>;
};

const StudioContext = createContext<StudioValue | null>(null);

function mergeWithDefaults(current: Product[]): Product[] {
  if (!Array.isArray(current) || current.length === 0) return DEFAULT_PRODUCTS;
  const defaultMap = new Map<string, Product>(DEFAULT_PRODUCTS.map((p) => [p.id, p]));

  const merged: Product[] = current.map((p) => {
    const def = defaultMap.get(p.id);
    if (def) {
      const isCalculable = def.isCalculable ?? p.isCalculable ?? (def.contentType === "PRODUCT" || (def.pricePerSqft !== null && def.pricePerSqft > 0));
      const item: Product = {
        ...def,
        ...p,
        category: def.category || p.category || "Railings",
        isCalculable,
        pricePerSqft:
          p.pricePerSqft !== undefined && p.pricePerSqft !== null ? p.pricePerSqft : def.pricePerSqft,
        contentType: def.contentType || (def.pricePerSqft ? "PRODUCT" : p.contentType || "PRODUCT"),
      };
      return item;
    }
    return p;
  });

  const currentIds = new Set(merged.map((p) => p.id));
  const missing = DEFAULT_PRODUCTS.filter((p) => !currentIds.has(p.id));
  return missing.length > 0 ? [...merged, ...missing] : merged;
}

export function StudioProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [isCloudConnected, setIsCloudConnected] = useState(true);
  const storageOk = useMemo(() => isStorageAvailable(), []);

  const [products, setProducts] = useState<Product[]>(() => {
    return mergeWithDefaults(readJSON<Product[]>(STORAGE_KEYS.products, DEFAULT_PRODUCTS));
  });

  const [projects, setProjects] = useState<Project[]>(() => {
    return readJSON<Project[]>(STORAGE_KEYS.projects, INITIAL_PROJECTS);
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
      setProducts(mergeWithDefaults(readJSON<Product[]>(STORAGE_KEYS.products, DEFAULT_PRODUCTS)));
      setProjects(readJSON<Project[]>(STORAGE_KEYS.projects, INITIAL_PROJECTS));
      setSettings(readJSON<Settings>(STORAGE_KEYS.settings, DEFAULT_SETTINGS));
      setEnquiries(readJSON<Enquiry[]>(STORAGE_KEYS.enquiries, []));
      const savedType = readJSON<RailingTypeSlug>(STORAGE_KEYS.railingType, "balcony");
      setRailingTypeState(savedType === "staircase" ? "staircase" : "balcony");
      const savedSelectedId = readJSON<string | null>(STORAGE_KEYS.selected, null);
      if (savedSelectedId) {
        setSelectedId(savedSelectedId);
      }
    }
    setReady(true);
  }, [storageOk]);

  // 2. Fetch live data from Express + MySQL backend (parallelized)
  const refreshFromCloud = useCallback(async () => {
    const hasAdminToken = Boolean(
      typeof window !== "undefined" &&
      (localStorage.getItem("metalWorkNepal_adminToken") ||
        sessionStorage.getItem("metalWorkNepal_adminToken")),
    );

    const results = await Promise.allSettled([
      api.railingTypes.list(),
      api.products.list(),
      api.projects.list(true),
      api.settings.get(),
      hasAdminToken ? api.enquiries.list().catch(() => null) : Promise.resolve(null),
    ]);

    const [typesResult, productsResult, projectsResult, settingsResult, enquiriesResult] = results;

    if (
      typesResult.status === "fulfilled" &&
      Array.isArray(typesResult.value) &&
      typesResult.value.length > 0
    ) {
      setRailingTypes(typesResult.value);
    }

    if (
      productsResult.status === "fulfilled" &&
      Array.isArray(productsResult.value) &&
      productsResult.value.length > 0
    ) {
      const merged = mergeWithDefaults(productsResult.value);
      setProducts(merged);
      writeJSON(STORAGE_KEYS.products, merged);
    }

    if (
      projectsResult.status === "fulfilled" &&
      Array.isArray(projectsResult.value) &&
      projectsResult.value.length > 0
    ) {
      setProjects(projectsResult.value);
      writeJSON(STORAGE_KEYS.projects, projectsResult.value);
    }

    if (
      settingsResult.status === "fulfilled" &&
      settingsResult.value &&
      settingsResult.value.companyName
    ) {
      const fullSettings: Settings = {
        ...DEFAULT_SETTINGS,
        ...settingsResult.value,
      };
      setSettings(fullSettings);
      writeJSON(STORAGE_KEYS.settings, fullSettings);
    }

    if (enquiriesResult.status === "fulfilled" && Array.isArray(enquiriesResult.value)) {
      setEnquiries(enquiriesResult.value);
      writeJSON(STORAGE_KEYS.enquiries, enquiriesResult.value);
    }

    const anyFulfilled = results.some((r) => r.status === "fulfilled");
    setIsCloudConnected(anyFulfilled);
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
      try {
        const exists = products.some((x) => x.id === p.id);
        let savedProd: Product;
        if (exists) {
          savedProd = await api.products.update(p.id, p);
        } else {
          savedProd = await api.products.create(p);
        }
        setProducts((prev) => {
          const next = prev.some((x) => x.id === (savedProd?.id || p.id))
            ? prev.map((x) => (x.id === (savedProd?.id || p.id) ? (savedProd || p) : x))
            : [...prev, savedProd || p];
          writeJSON(STORAGE_KEYS.products, next);
          return next;
        });
        return true;
      } catch (err) {
        console.error("saveProduct error:", err);
        // Fallback update to local state so user doesn't lose form work in offline/local mode
        setProducts((prev) => {
          const exists = prev.some((x) => x.id === p.id);
          const next = exists ? prev.map((x) => (x.id === p.id ? p : x)) : [...prev, p];
          writeJSON(STORAGE_KEYS.products, next);
          return next;
        });
        return false;
      }
    },
    [products],
  );

  const duplicateProduct = useCallback(async (id: string): Promise<Product | null> => {
    try {
      const duplicated = await api.products.duplicate(id);
      if (duplicated) {
        setProducts((prev) => {
          const next = [...prev, duplicated];
          writeJSON(STORAGE_KEYS.products, next);
          return next;
        });
        return duplicated;
      }
      return null;
    } catch (err) {
      console.error("duplicateProduct error:", err);
      return null;
    }
  }, []);

  const deleteProduct = useCallback(async (id: string): Promise<boolean> => {
    setProducts((prev) => {
      const next = prev.filter((x) => x.id !== id);
      writeJSON(STORAGE_KEYS.products, next);
      return next;
    });
    setSelectedId((cur) => (cur === id ? null : cur));

    try {
      await api.products.delete(id);
      return true;
    } catch {
      /* silent */
      return false;
    }
  }, []);

  const resetProducts = useCallback(() => {
    void refreshFromCloud();
  }, [refreshFromCloud]);

  const saveProject = useCallback(
    async (p: Project): Promise<boolean> => {
      setProjects((prev) => {
        const exists = prev.some((x) => x.id === p.id);
        const next = exists ? prev.map((x) => (x.id === p.id ? p : x)) : [...prev, p];
        writeJSON(STORAGE_KEYS.projects, next);
        return next;
      });

      try {
        const exists = projects.some((x) => x.id === p.id);
        if (exists) {
          await api.projects.update(p.id, p);
        } else {
          await api.projects.create(p);
        }
        return true;
      } catch {
        /* silent */
        return false;
      }
    },
    [projects],
  );

  const deleteProject = useCallback(async (id: string): Promise<boolean> => {
    setProjects((prev) => {
      const next = prev.filter((x) => x.id !== id);
      writeJSON(STORAGE_KEYS.projects, next);
      return next;
    });

    try {
      await api.projects.delete(id);
      return true;
    } catch {
      /* silent */
      return false;
    }
  }, []);

  const addEnquiry = useCallback<StudioValue["addEnquiry"]>((data) => {
    const estimatedPrice = data.estimatedPrice || data.estimatedTotal || 0;
    const enquiry: Enquiry = {
      ...data,
      railingType: data.railingType || "Balcony Railing",
      estimatedPrice,
      estimatedTotal: estimatedPrice,
      id: `enq_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      createdAt: new Date().toISOString(),
      status: "new",
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
          setEnquiries((prev) => prev.map((item) => (item.id === enquiry.id ? created : item)));
        }
      } catch {
        /* silent */
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
      } catch {
        /* silent */
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
    } catch {
      /* silent */
      return false;
    }
  }, []);

  const activeProducts = useMemo(() => {
    return products
      .filter((p) => p.isActive)
      .sort((a, b) => {
        const aIsRailing = isRailingProduct(a);
        const bIsRailing = isRailingProduct(b);
        if (aIsRailing && !bIsRailing) return -1;
        if (!aIsRailing && bIsRailing) return 1;
        return (a.displayOrder || 0) - (b.displayOrder || 0);
      });
  }, [products]);

  const activeProjects = useMemo(() => {
    return projects
      .filter((p) => p.isActive)
      .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
  }, [projects]);

  const selectedProduct = useMemo(() => {
    if (!selectedId) return null;
    return products.find((p) => p.id === selectedId) ?? null;
  }, [products, selectedId]);

  const value: StudioValue = useMemo(
    () => ({
      ready,
      isCloudConnected,
      storageOk,
      products,
      activeProducts,
      projects,
      activeProjects,
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
      duplicateProduct,
      resetProducts,
      saveProject,
      deleteProject,
      addEnquiry,
      updateEnquiryStatus,
      clearEnquiries,
      updateSettings,
      refreshFromCloud,
    }),
    [
      ready,
      isCloudConnected,
      storageOk,
      products,
      activeProducts,
      projects,
      activeProjects,
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
      saveProject,
      deleteProject,
      addEnquiry,
      updateEnquiryStatus,
      clearEnquiries,
      updateSettings,
      refreshFromCloud,
    ],
  );

  return <StudioContext.Provider value={value}>{children}</StudioContext.Provider>;
}

export function useStudio() {
  const ctx = useContext(StudioContext);
  if (!ctx) {
    throw new Error("useStudio must be used within a StudioProvider");
  }
  return ctx;
}
