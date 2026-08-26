import type { Enquiry, EnquiryStatus } from "@/hooks/useStudio";
import type { Product } from "@/data/products";
import type { Settings } from "@/config/settings";

const API_BASE = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/+$/, "");

function getAuthHeader(): Record<string, string> {
  try {
    const token =
      localStorage.getItem("metalWorkNepal_adminToken") ||
      sessionStorage.getItem("metalWorkNepal_adminToken");
    if (token) {
      return { Authorization: `Bearer ${token}` };
    }
  } catch {
    /* ignore storage errors */
  }
  return {};
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE}${endpoint.startsWith("/") ? "" : "/"}${endpoint}`;
  const headers = {
    "Content-Type": "application/json",
    ...getAuthHeader(),
    ...(options.headers || {}),
  };

  const res = await fetch(url, {
    ...options,
    headers,
  });

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

  settings: {
    get: () => request<Settings>("/settings"),
    update: (data: Partial<Settings>) =>
      request<Settings>("/settings", {
        method: "PUT",
        body: JSON.stringify(data),
      }),
  },

  upload: {
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
  },
};
