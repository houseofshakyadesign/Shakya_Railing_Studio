import type { Enquiry, EnquiryStatus } from "@/hooks/useStudio";
import type { Product } from "@/data/products";
import type { Settings } from "@/config/settings";

const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/+$/, "");

function getAuthHeader(): Record<string, string> {
  try {
    const token =
      (typeof sessionStorage !== "undefined" &&
        sessionStorage.getItem("metalWorkNepal_adminToken")) ||
      (typeof localStorage !== "undefined" && localStorage.getItem("metalWorkNepal_adminToken"));
    if (token) {
      return { Authorization: `Bearer ${token}` };
    }
  } catch {
    /* ignore storage errors */
  }
  return {};
}

async function request<T>(endpoint: string, options: RequestInit = {}, retries = 2): Promise<T> {
  const url = `${API_BASE}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...getAuthHeader(),
    ...((options.headers as Record<string, string>) || {}),
  };

  let lastError: Error | null = null;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const res = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        let errorMsg = `API Error ${res.status}: ${res.statusText}`;
        try {
          const json = await res.json();
          if (json.error) errorMsg = json.error;
        } catch {
          /* ignore json parse error */
        }
        throw new Error(errorMsg);
      }

      return res.json();
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));
      if (
        attempt < retries &&
        !lastError.message.includes("401") &&
        !lastError.message.includes("403")
      ) {
        await new Promise((r) => setTimeout(r, 300 * (attempt + 1)));
        continue;
      }
      throw lastError;
    }
  }
  throw lastError;
}

export const api = {
  auth: {
    login: (email: string, password: string) =>
      request<{ token: string; admin: { id: string; email: string } }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      }),
    me: () => request<{ admin: { id: string; email: string } }>("/auth/me"),
  },

  products: {
    list: () => request<Product[]>("/products"),
    listAll: () => request<Product[]>("/products/all"),
    get: (id: string) => request<Product>(`/products/${id}`),
    create: (data: Partial<Product>) =>
      request<Product>("/products", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: string, data: Partial<Product>) =>
      request<Product>(`/products/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      request<{ success: boolean }>(`/products/${id}`, {
        method: "DELETE",
      }),
    duplicate: (id: string) =>
      request<Product>(`/products/${id}/duplicate`, {
        method: "POST",
      }),
  },

  enquiries: {
    list: () => request<Enquiry[]>("/enquiries"),
    create: (data: Partial<Enquiry>) =>
      request<Enquiry>("/enquiries", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    updateStatus: (id: string, status: EnquiryStatus) =>
      request<Enquiry>(`/enquiries/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }),
    delete: (id: string) =>
      request<{ success: boolean }>(`/enquiries/${id}`, {
        method: "DELETE",
      }),
  },

  railingTypes: {
    list: () =>
      request<
        {
          id: string;
          name: string;
          slug: "balcony" | "staircase";
          standardHeightFt: number;
          description: string;
        }[]
      >("/railing-types"),
  },

  projects: {
    list: (includeAll = false) =>
      request<import("@/data/projects").Project[]>(`/projects${includeAll ? "?all=true" : ""}`),
    getBySlug: (slug: string) => request<import("@/data/projects").Project>(`/projects/${slug}`),
    create: (data: Partial<import("@/data/projects").Project>) =>
      request<import("@/data/projects").Project>("/projects", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    update: (id: string, data: Partial<import("@/data/projects").Project>) =>
      request<import("@/data/projects").Project>(`/projects/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      request<{ success: boolean }>(`/projects/${id}`, {
        method: "DELETE",
      }),
    addMedia: (projectId: string, media: Partial<import("@/data/projects").ProjectMedia>) =>
      request<import("@/data/projects").ProjectMedia>(`/projects/${projectId}/media`, {
        method: "POST",
        body: JSON.stringify(media),
      }),
    deleteMedia: (mediaId: string) =>
      request<{ success: boolean }>(`/projects/media/${mediaId}`, {
        method: "DELETE",
      }),
  },

  settings: {
    get: () => request<Settings>("/settings"),
    update: (data: Partial<Settings>) =>
      request<Settings>("/settings", {
        method: "PUT",
        body: JSON.stringify(data),
      }),
  },

  upload: {
    media: async (
      file: File,
    ): Promise<{
      success: boolean;
      url: string;
      filename: string;
      mediaType: "image" | "video";
    }> => {
      const url = `${API_BASE}/upload`;
      const formData = new FormData();
      formData.append("file", file);

      const headers: Record<string, string> = {
        ...getAuthHeader(),
      };

      const res = await fetch(url, {
        method: "POST",
        headers,
        body: formData,
      });

      if (!res.ok) {
        let errorMsg = `Upload failed: ${res.statusText}`;
        try {
          const json = await res.json();
          if (json.error) errorMsg = json.error;
        } catch {
          /* ignore */
        }
        throw new Error(errorMsg);
      }

      return res.json();
    },
    image: async (file: File): Promise<{ success: boolean; url: string; filename: string }> => {
      const url = `${API_BASE}/upload`;
      const formData = new FormData();
      formData.append("image", file);

      const headers: Record<string, string> = {
        ...getAuthHeader(),
      };

      const res = await fetch(url, {
        method: "POST",
        headers,
        body: formData,
      });

      if (!res.ok) {
        let errorMsg = `Upload failed: ${res.statusText}`;
        try {
          const json = await res.json();
          if (json.error) errorMsg = json.error;
        } catch {
          /* ignore */
        }
        throw new Error(errorMsg);
      }

      return res.json();
    },
    video: async (file: File): Promise<{ success: boolean; url: string; filename: string }> => {
      const url = `${API_BASE}/upload`;
      const formData = new FormData();
      formData.append("video", file);

      const headers: Record<string, string> = {
        ...getAuthHeader(),
      };

      const res = await fetch(url, {
        method: "POST",
        headers,
        body: formData,
      });

      if (!res.ok) {
        let errorMsg = `Video upload failed: ${res.statusText}`;
        try {
          const json = await res.json();
          if (json.error) errorMsg = json.error;
        } catch {
          /* ignore */
        }
        throw new Error(errorMsg);
      }

      return res.json();
    },
  },
};
