import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import { Download, Lock, LogOut, Plus, RefreshCw, ShieldCheck, Trash2, User, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { EASE } from "@/components/Reveal";
import { errorInputClass, Field, inputClass } from "@/components/FormField";
import { STORAGE_KEYS } from "@/config/settings";
import type { Product } from "@/data/products";
import { ENQUIRY_STATUSES, useStudio, type Enquiry, type EnquiryStatus } from "@/hooks/useStudio";
import { formatNPR } from "@/utils/currency";
import { downloadCSV } from "@/utils/csv";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Studio Admin | House of Shakya Railing Studio" },
      {
        name: "description",
        content:
          "Studio admin dashboard for House of Shakya Railing Studio — manage railings, review enquiries, and update cloud settings.",
      },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Studio Admin | House of Shakya" },
      { property: "og:description", content: "Studio admin dashboard for Railing Studio." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AdminPage,
});

type Tab = "overview" | "railings" | "enquiries" | "settings";

function AdminPage() {
  const studio = useStudio();
  const [unlocked, setUnlocked] = useState(false);
  const [email, setEmail] = useState("admin@houseofshakya.com");
  const [pw, setPw] = useState("");
  const [pwError, setPwError] = useState("");
  const [tab, setTab] = useState<Tab>("overview");
  const [syncing, setSyncing] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      try {
        if (sessionStorage.getItem(STORAGE_KEYS.admin) === "1") setUnlocked(true);
      } catch {
        /* ignore */
      }
      return;
    }

    void supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setCurrentUserEmail(session.user.email ?? "admin@houseofshakya.com");
        setUnlocked(true);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setCurrentUserEmail(session.user.email ?? "admin@houseofshakya.com");
        setUnlocked(true);
      } else {
        setCurrentUserEmail(null);
        setUnlocked(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError("");

    if (isSupabaseConfigured && supabase) {
      setLoggingIn(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: pw,
      });
      setLoggingIn(false);

      if (error) {
        setPwError(error.message || "Invalid credentials.");
      } else if (data?.user) {
        setCurrentUserEmail(data.user.email ?? email);
        setUnlocked(true);
        toast.success("Authenticated with Supabase");
      }
    } else {
      if (pw === studio.settings.adminPassword) {
        setUnlocked(true);
        try {
          sessionStorage.setItem(STORAGE_KEYS.admin, "1");
        } catch {
          /* ignore */
        }
        toast.success("Welcome, Studio Admin");
      } else {
        setPwError("Incorrect password.");
      }
    }
  };

  const handleLogout = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    try {
      sessionStorage.removeItem(STORAGE_KEYS.admin);
    } catch {
      /* ignore */
    }
    setCurrentUserEmail(null);
    setUnlocked(false);
    setPw("");
    toast.success("Logged out safely");
  };

  const handleSync = async () => {
    setSyncing(true);
    await studio.refreshFromCloud();
    setSyncing(false);
    toast.success("Cloud data synchronized");
  };

  if (!unlocked) {
    return (
      <section className="mx-auto flex max-w-md flex-col px-5 pt-40 pb-32">
        <div className="border border-hairline bg-card p-8 shadow-sm">
          <div className="flex items-center justify-between">
            <Lock className="h-5 w-5 text-bronze" />
            <span
              className={`inline-flex items-center gap-1.5 border px-2.5 py-1 text-[0.62rem] font-medium tracking-[0.14em] uppercase ${
                studio.isCloudConnected
                  ? "border-success/40 bg-success/10 text-success"
                  : "border-hairline bg-sand/60 text-muted-foreground"
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  studio.isCloudConnected ? "bg-success animate-pulse" : "bg-muted-foreground"
                }`}
              />
              {studio.isCloudConnected ? "Supabase Auth Active" : "Local Mode"}
            </span>
          </div>

          <h1 className="mt-5 text-2xl font-light tracking-tight">Studio Admin Login</h1>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            {studio.isCloudConnected
              ? "Sign in with your verified Supabase administrator credentials."
              : "Prototype access gate. Data lives only in this browser."}
          </p>

          <form className="mt-7 space-y-4" onSubmit={handleLogin}>
            {studio.isCloudConnected ? (
              <Field id="admin-email" label="Administrator Email">
                <input
                  id="admin-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                  placeholder="admin@houseofshakya.com"
                  required
                />
              </Field>
            ) : null}

            <Field id="pw" label="Password" error={pwError}>
              <input
                id="pw"
                type="password"
                value={pw}
                onChange={(e) => setPw(e.target.value)}
                className={pwError ? errorInputClass : inputClass}
                placeholder="••••••••"
                required
              />
            </Field>

            <button
              type="submit"
              disabled={loggingIn}
              className="mt-6 w-full bg-charcoal px-7 py-4 text-[0.72rem] tracking-[0.2em] text-ivory uppercase transition-colors hover:bg-bronze disabled:opacity-50"
            >
              {loggingIn ? "Verifying..." : "Sign In →"}
            </button>
          </form>
        </div>
      </section>
    );
  }

  const tabs: Tab[] = ["overview", "railings", "enquiries", "settings"];

  return (
    <section className="mx-auto max-w-[1440px] px-5 pt-32 pb-28 md:px-10 md:pt-40">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <p className="label-xs text-bronze">Studio admin</p>
            {currentUserEmail ? (
              <span className="flex items-center gap-1 text-[0.68rem] text-muted-foreground">
                • <ShieldCheck className="h-3 w-3 text-bronze" /> {currentUserEmail}
              </span>
            ) : null}
          </div>
          <h1 className="mt-3 text-3xl tracking-tight md:text-4xl">Railing Studio dashboard</h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleSync}
            disabled={syncing}
            className="flex items-center gap-2 border border-hairline bg-card px-3.5 py-2 text-[0.68rem] tracking-[0.16em] uppercase transition-colors hover:border-bronze hover:text-bronze disabled:opacity-50"
            title="Sync with Supabase database"
          >
            <RefreshCw className={`h-3 w-3 ${syncing ? "animate-spin text-bronze" : ""}`} />
            {syncing ? "Syncing..." : "Sync Cloud"}
          </button>
          <span
            className={`inline-flex items-center gap-1.5 border px-3 py-2 text-[0.62rem] font-medium tracking-[0.16em] uppercase ${
              studio.isCloudConnected
                ? "border-success/40 bg-success/10 text-success"
                : "border-hairline bg-sand/60 text-muted-foreground"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                studio.isCloudConnected ? "bg-success animate-pulse" : "bg-muted-foreground"
              }`}
            />
            {studio.isCloudConnected ? "Supabase Connected" : "Local Mode"}
          </span>
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-2 border border-hairline bg-card px-4 py-2 text-[0.68rem] tracking-[0.18em] uppercase transition-colors hover:border-destructive/60 hover:text-destructive"
          >
            <LogOut className="h-3.5 w-3.5" />
            Lock & Log Out
          </button>
        </div>
      </div>

      <nav className="mt-10 flex flex-wrap gap-px border-b border-hairline">
        {tabs.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`relative px-5 py-3 text-[0.7rem] tracking-[0.18em] uppercase transition-colors ${
              tab === t ? "text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {t}
            {tab === t ? (
              <motion.span layoutId="admin-tab" className="absolute inset-x-0 -bottom-px h-px bg-bronze" />
            ) : null}
          </button>
        ))}
      </nav>

      <div className="mt-10">
        {tab === "overview" ? <Overview /> : null}
        {tab === "railings" ? <Railings /> : null}
        {tab === "enquiries" ? <Enquiries /> : null}
        {tab === "settings" ? <SettingsPanel /> : null}
      </div>
    </section>
  );
}

function Overview() {
  const { products, enquiries, settings } = useStudio();
  const value = enquiries.reduce((sum, e) => sum + (e.estimatedTotal || 0), 0);
  const stats = [
    { k: "Total railings", v: String(products.length) },
    { k: "Active railings", v: String(products.filter((p) => p.isActive).length) },
    { k: "Total enquiries", v: String(enquiries.length) },
    { k: "New enquiries", v: String(enquiries.filter((e) => e.status === "NEW").length) },
    { k: "Estimated enquiry value", v: formatNPR(value, settings.currency) },
  ];
  return (
    <div className="grid gap-px border border-hairline bg-hairline sm:grid-cols-2 lg:grid-cols-5">
      {stats.map((s) => (
        <div key={s.k} className="bg-background p-7">
          <p className="label-xs text-muted-foreground">{s.k}</p>
          <p className="mt-4 text-2xl font-semibold tracking-tight">{s.v}</p>
        </div>
      ))}
    </div>
  );
}

const BLANK_PRODUCT: Product = {
  id: "",
  code: "",
  name: "",
  description: "",
  material: "",
  pricePerSqft: 0,
  image: "/images/railings/r01.jpg",
  gallery: [],
  features: [],
  applications: [],
  isCustom: false,
  isActive: true,
};

function Railings() {
  const { products, saveProduct, deleteProduct, settings } = useStudio();
  const [editing, setEditing] = useState<Product | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Product | null>(null);

  return (
    <div>
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() =>
            setEditing({ ...BLANK_PRODUCT, id: `p_${Date.now()}`, gallery: [], features: [], applications: [] })
          }
          className="flex items-center gap-2 bg-charcoal px-6 py-3 text-[0.7rem] tracking-[0.18em] text-ivory uppercase hover:bg-bronze"
        >
          <Plus className="h-3.5 w-3.5" /> Add product
        </button>
      </div>

      {products.length === 0 ? (
        <EmptyState title="No railings yet" copy="Add a railing design to publish it to the collection." />
      ) : (
        <ul className="mt-8 grid gap-px border border-hairline bg-hairline md:grid-cols-2 xl:grid-cols-3">
          {products.map((p) => (
            <li key={p.id} className="flex gap-4 bg-background p-5">
              <img src={p.image} alt="" className="h-24 w-20 shrink-0 object-cover" loading="lazy" />
              <div className="min-w-0 flex-1">
                <p className="label-xs text-bronze">{p.code}</p>
                <p className="mt-1.5 truncate text-sm">{p.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {p.isCustom ? "Custom quote" : `${formatNPR(p.pricePerSqft, settings.currency)} / sq.ft.`}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setEditing(p)}
                    className="border border-hairline px-3 py-1.5 text-[0.62rem] tracking-[0.16em] uppercase hover:border-foreground/40"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      const updated = { ...p, isActive: !p.isActive };
                      const ok = await saveProduct(updated);
                      if (ok) {
                        toast.success(`${p.code} ${updated.isActive ? "activated" : "deactivated"}`);
                      } else {
                        toast.error("Failed to update status in database");
                      }
                    }}
                    className="border border-hairline px-3 py-1.5 text-[0.62rem] tracking-[0.16em] uppercase hover:border-foreground/40"
                  >
                    {p.isActive ? "Deactivate" : "Activate"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(p)}
                    className="border border-destructive/40 px-3 py-1.5 text-[0.62rem] tracking-[0.16em] text-destructive uppercase"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ProductEditor
        product={editing}
        onClose={() => setEditing(null)}
        onSave={async (p) => {
          const ok = await saveProduct(p);
          if (ok) {
            setEditing(null);
            toast.success(`${p.code || "Product"} saved to Supabase`);
          } else {
            toast.error("Failed to save changes to database");
          }
        }}
      />

      <ConfirmDialog
        open={Boolean(confirmDelete)}
        title={`Delete ${confirmDelete?.code ?? ""}?`}
        copy="This permanently removes the railing from the Supabase database and collection."
        onCancel={() => setConfirmDelete(null)}
        onConfirm={async () => {
          if (confirmDelete) {
            const ok = await deleteProduct(confirmDelete.id);
            if (ok) {
              toast.success("Product deleted from database");
            } else {
              toast.error("Failed to delete from database");
            }
          }
          setConfirmDelete(null);
        }}
      />
    </div>
  );
}

function ProductEditor({
  product,
  onClose,
  onSave,
}: {
  product: Product | null;
  onClose: () => void;
  onSave: (p: Product) => Promise<void>;
}) {
  const [draft, setDraft] = useState<Product | null>(product);
  const [saving, setSaving] = useState(false);

  useEffect(() => setDraft(product), [product]);
  if (!product || !draft) return null;

  const set = <K extends keyof Product>(k: K, v: Product[K]) =>
    setDraft((d) => (d ? { ...d, [k]: v } : d));

  const handleFormSave = async () => {
    setSaving(true);
    try {
      await onSave({
        ...draft,
        gallery: draft.gallery.length ? draft.gallery : [draft.image],
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[80] overflow-y-auto bg-charcoal/55 p-4 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          onClick={(e) => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.97, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.3, ease: EASE }}
          className="mx-auto my-10 w-full max-w-2xl bg-background p-7 shadow-lift md:p-10"
        >
          <div className="flex items-start justify-between">
            <h2 className="text-xl tracking-tight">Edit railing</h2>
            <button type="button" onClick={onClose} aria-label="Close">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-7 grid gap-5 sm:grid-cols-2">
            <Field id="p-code" label="Code">
              <input className={inputClass} value={draft.code} onChange={(e) => set("code", e.target.value)} />
            </Field>
            <Field id="p-name" label="Name">
              <input className={inputClass} value={draft.name} onChange={(e) => set("name", e.target.value)} />
            </Field>
            <div className="sm:col-span-2">
              <Field id="p-desc" label="Description">
                <textarea
                  rows={3}
                  className={inputClass}
                  value={draft.description}
                  onChange={(e) => set("description", e.target.value)}
                />
              </Field>
            </div>
            <Field id="p-mat" label="Material">
              <input
                className={inputClass}
                value={draft.material}
                onChange={(e) => set("material", e.target.value)}
              />
            </Field>
            <Field id="p-price" label="Price per sq.ft.">
              <input
                className={inputClass}
                inputMode="decimal"
                value={String(draft.pricePerSqft)}
                onChange={(e) => set("pricePerSqft", Number(e.target.value) || 0)}
              />
            </Field>
            <div className="sm:col-span-2">
              <Field id="p-img" label="Image path" hint="e.g. /images/railings/r04.jpg">
                <input className={inputClass} value={draft.image} onChange={(e) => set("image", e.target.value)} />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field id="p-feat" label="Features" hint="One per line">
                <textarea
                  rows={3}
                  className={inputClass}
                  value={draft.features.join("\n")}
                  onChange={(e) => set("features", e.target.value.split("\n").filter(Boolean))}
                />
              </Field>
            </div>
            <div className="sm:col-span-2">
              <Field id="p-app" label="Applications" hint="One per line">
                <textarea
                  rows={3}
                  className={inputClass}
                  value={draft.applications.join("\n")}
                  onChange={(e) => set("applications", e.target.value.split("\n").filter(Boolean))}
                />
              </Field>
            </div>
            <label className="flex items-center gap-3 text-sm">
              <input
                type="checkbox"
                checked={draft.isCustom}
                onChange={(e) => set("isCustom", e.target.checked)}
              />
              Custom quote only
            </label>
            <label className="flex items-center gap-3 text-sm">
              <input
                type="checkbox"
                checked={draft.isActive}
                onChange={(e) => set("isActive", e.target.checked)}
              />
              Active in collection
            </label>
          </div>

          <div className="mt-9 flex gap-3">
            <button
              type="button"
              disabled={saving}
              onClick={handleFormSave}
              className="bg-charcoal px-7 py-3.5 text-[0.7rem] tracking-[0.2em] text-ivory uppercase hover:bg-bronze disabled:opacity-50"
            >
              {saving ? "Saving to Supabase..." : "Save"}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="border border-hairline px-7 py-3.5 text-[0.7rem] tracking-[0.2em] uppercase disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function Enquiries() {
  const { enquiries, updateEnquiryStatus, settings } = useStudio();
  const [open, setOpen] = useState<Enquiry | null>(null);

  if (enquiries.length === 0) {
    return (
      <EmptyState
        title="No enquiries yet"
        copy="Customer enquiries will appear here once submitted on this device."
      />
    );
  }

  return (
    <div>
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => downloadCSV(enquiries)}
          className="flex items-center gap-2 border border-hairline px-6 py-3 text-[0.7rem] tracking-[0.18em] uppercase hover:border-foreground/40"
        >
          <Download className="h-3.5 w-3.5" /> Export CSV
        </button>
      </div>

      <ul className="mt-8 grid gap-px border border-hairline bg-hairline md:grid-cols-2">
        {enquiries.map((e) => (
          <li key={e.id} className="bg-background p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm tracking-tight">{e.customerName}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {e.productCode} · {e.location} ·{" "}
                  {new Date(e.createdAt).toLocaleDateString(settings.currencyLocale)}
                </p>
              </div>
              <span className="label-xs shrink-0 border border-hairline px-2.5 py-1 text-bronze">
                {e.status}
              </span>
            </div>
            <p className="mt-4 text-lg font-semibold tracking-tight">
              {e.isCustom ? "Custom Quote" : formatNPR(e.estimatedTotal, settings.currency)}
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <select
                value={e.status}
                onChange={(ev) => updateEnquiryStatus(e.id, ev.target.value as EnquiryStatus)}
                className="border border-hairline bg-card px-3 py-2 text-xs"
                aria-label={`Status for ${e.customerName}`}
              >
                {ENQUIRY_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setOpen(e)}
                className="text-[0.66rem] tracking-[0.18em] uppercase underline-offset-4 hover:text-bronze hover:underline"
              >
                View details
              </button>
            </div>
          </li>
        ))}
      </ul>

      <AnimatePresence>
        {open ? (
          <motion.div
            className="fixed inset-0 z-[80] overflow-y-auto bg-charcoal/55 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(null)}
          >
            <motion.div
              onClick={(ev) => ev.stopPropagation()}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.28, ease: EASE }}
              className="mx-auto my-12 w-full max-w-lg bg-background p-8 shadow-lift"
            >
              <div className="flex items-start justify-between">
                <h2 className="text-xl tracking-tight">{open.customerName}</h2>
                <button type="button" onClick={() => setOpen(null)} aria-label="Close">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <dl className="mt-6 space-y-3 text-sm">
                {[
                  ["Date", new Date(open.createdAt).toLocaleString()],
                  ["Phone", open.phone],
                  ["Email", open.email || "—"],
                  ["Location", open.location],
                  ["Project type", open.projectType],
                  ["Railing", `${open.productCode} — ${open.productName}`],
                  ["Material", open.material],
                  ["Quantity", open.isCustom ? (open.quantity ? String(open.quantity) : "To be confirmed") : String(open.quantity)],
                  ["Area / unit", open.isCustom ? (open.area ? `${open.area} sq.ft.` : "To be confirmed") : `${open.area} sq.ft.`],
                  ["Total area", open.isCustom ? "To be confirmed" : `${open.totalArea} sq.ft.`],
                  ["Rate", open.isCustom ? "Custom" : formatNPR(open.rate, settings.currency)],
                  [
                    "Estimated total",
                    open.isCustom ? "Custom Quote" : formatNPR(open.estimatedTotal, settings.currency),
                  ],
                  ["Status", open.status],
                  ["Requirements", open.additionalRequirements || "—"],
                ].map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-6 border-b border-hairline pb-2">
                    <dt className="label-xs text-muted-foreground">{k}</dt>
                    <dd className="text-right">{v}</dd>
                  </div>
                ))}
              </dl>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function SettingsPanel() {
  const { settings, updateSettings, clearEnquiries, resetProducts } = useStudio();
  const [confirm, setConfirm] = useState<"enquiries" | "products" | null>(null);

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <div className="border border-hairline bg-card p-7">
        <h2 className="text-xl tracking-tight">Studio settings</h2>
        <div className="mt-6 grid gap-5">
          <Field id="s-company" label="Company name">
            <input
              className={inputClass}
              value={settings.companyName}
              onChange={(e) => updateSettings({ companyName: e.target.value })}
            />
          </Field>
          <Field id="s-wa" label="WhatsApp number" hint="Country code + number, digits only.">
            <input
              className={inputClass}
              value={settings.whatsappNumber}
              onChange={(e) => updateSettings({ whatsappNumber: e.target.value })}
            />
          </Field>
          <Field id="s-cur" label="Currency">
            <input
              className={inputClass}
              value={settings.currency}
              onChange={(e) => updateSettings({ currency: e.target.value })}
            />
          </Field>
          <Field id="s-loc" label="Currency locale">
            <input
              className={inputClass}
              value={settings.currencyLocale}
              onChange={(e) => updateSettings({ currencyLocale: e.target.value })}
            />
          </Field>
        </div>
      </div>

      <div className="border border-destructive/30 bg-card p-7">
        <h2 className="text-xl tracking-tight">Data</h2>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          These actions affect only this browser. Export enquiries before clearing.
        </p>
        <div className="mt-7 flex flex-col gap-3">
          <button
            type="button"
            onClick={() => setConfirm("enquiries")}
            className="border border-destructive/40 px-6 py-3.5 text-[0.7rem] tracking-[0.2em] text-destructive uppercase"
          >
            Clear enquiries
          </button>
          <button
            type="button"
            onClick={() => setConfirm("products")}
            className="border border-hairline px-6 py-3.5 text-[0.7rem] tracking-[0.2em] uppercase"
          >
            Reset product data
          </button>
        </div>
      </div>

      <ConfirmDialog
        open={confirm !== null}
        title={confirm === "enquiries" ? "Clear all enquiries?" : "Reset product data?"}
        copy={
          confirm === "enquiries"
            ? "All locally stored enquiries will be permanently deleted."
            : "All product edits will be replaced with the original 13 railing designs."
        }
        onCancel={() => setConfirm(null)}
        onConfirm={() => {
          if (confirm === "enquiries") {
            clearEnquiries();
            toast.success("Enquiries cleared");
          } else {
            resetProducts();
            toast.success("Product data reset");
          }
          setConfirm(null);
        }}
      />
    </div>
  );
}

function ConfirmDialog({
  open,
  title,
  copy,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  title: string;
  copy: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[90] grid place-items-center bg-charcoal/55 p-5 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCancel}
          role="alertdialog"
          aria-modal="true"
        >
          <motion.div
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.25, ease: EASE }}
            className="w-full max-w-sm bg-background p-8 shadow-lift"
          >
            <h3 className="text-lg tracking-tight">{title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{copy}</p>
            <div className="mt-8 flex gap-3">
              <button
                type="button"
                onClick={onConfirm}
                className="flex-1 bg-destructive px-5 py-3.5 text-[0.7rem] tracking-[0.2em] text-destructive-foreground uppercase"
              >
                Confirm
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 border border-hairline px-5 py-3.5 text-[0.7rem] tracking-[0.2em] uppercase"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function EmptyState({ title, copy }: { title: string; copy: string }) {
  return (
    <div className="mt-8 border border-dashed border-hairline px-6 py-20 text-center">
      <h3 className="text-xl tracking-tight uppercase">{title}</h3>
      <p className="mx-auto mt-3 max-w-sm text-sm text-muted-foreground">{copy}</p>
    </div>
  );
}
