"use client";

import Link from "next/link";
import { useState, type FormEvent, type ReactNode } from "react";
import {
  ArrowRight, ArrowUpRight, Bell, Boxes, Check, ChevronDown,
  CircleHelp, Clock3, CreditCard, LayoutDashboard, Menu, MessageCircle, Package, Plus, Radio,
  Search, Settings2, ShoppingBag, Store, Tags, UsersRound, X,
} from "lucide-react";
import { apiRequest, clearTokens } from "@/lib/api";
import { ChannelCenter } from "@/components/channel-center";
import { useVendorWorkspace, type WorkspaceCustomer, type WorkspaceOrder, type WorkspaceProduct } from "@/lib/use-vendor-workspace";

type View = "Overview" | "Conversations" | "Channels" | "Products" | "Categories" | "Inventory" | "Orders" | "Customers" | "Payments" | "Store setup";
type Product = WorkspaceProduct;
type Order = WorkspaceOrder;

const navItems: { label: View; icon: typeof LayoutDashboard; group: string }[] = [
  { label: "Overview", icon: LayoutDashboard, group: "Workspace" },
  { label: "Conversations", icon: MessageCircle, group: "Engage" },
  { label: "Channels", icon: Radio, group: "Engage" },
  { label: "Products", icon: Package, group: "Catalog" },
  { label: "Categories", icon: Tags, group: "Catalog" },
  { label: "Inventory", icon: Boxes, group: "Catalog" },
  { label: "Orders", icon: ShoppingBag, group: "Sales" },
  { label: "Customers", icon: UsersRound, group: "Sales" },
  { label: "Payments", icon: CreditCard, group: "Sales" },
  { label: "Store setup", icon: Settings2, group: "Manage" },
];

const initialProducts = [
  { name: "Everyday linen shirt", sku: "LIN-014", category: "Clothing", price: 28500, stock: 34, color: "#dbe6dc" },
  { name: "Sculpted ceramic mug", sku: "HOM-008", category: "Home goods", price: 12400, stock: 8, color: "#eadcc8" },
  { name: "Market tote, natural", sku: "ACC-021", category: "Accessories", price: 16000, stock: 21, color: "#dce2ed" },
  { name: "Botanical body oil", sku: "CARE-003", category: "Wellness", price: 9800, stock: 4, color: "#e9dada" },
  { name: "Woven table runner", sku: "HOM-011", category: "Home goods", price: 22000, stock: 16, color: "#eadfd1" },
];

const initialOrders: Order[] = [
  { id: "VD-2041", customer: "Aisha Kalu", date: "Today, 10:42 am", total: 44500, status: "Paid" },
  { id: "VD-2040", customer: "Bola Adeyemi", date: "Today, 9:18 am", total: 28500, status: "Processing" },
  { id: "VD-2039", customer: "Chinedu Okafor", date: "Yesterday", total: 38000, status: "Shipped" },
  { id: "VD-2038", customer: "Mary James", date: "Yesterday", total: 12400, status: "Pending" },
];

const customers = [
  { name: "Aisha Kalu", email: "aisha.kalu@email.com", orders: 8, spent: 178400, initials: "AK", color: "#e9d8ca" },
  { name: "Bola Adeyemi", email: "bola.a@email.com", orders: 5, spent: 112000, initials: "BA", color: "#d5e5d8" },
  { name: "Chinedu Okafor", email: "chinedu.o@email.com", orders: 3, spent: 76800, initials: "CO", color: "#dce2ed" },
  { name: "Mary James", email: "mary.j@email.com", orders: 2, spent: 32800, initials: "MJ", color: "#eadada" },
];

const categories = [
  { name: "Clothing", count: 18, color: "#dce9df" },
  { name: "Home goods", count: 12, color: "#eee5d7" },
  { name: "Accessories", count: 9, color: "#dfe5ef" },
  { name: "Wellness", count: 6, color: "#f0e1dc" },
];

const formatPrice = (amount: number) => `₦${amount.toLocaleString("en-NG")}`;

export default function Dashboard() {
  const [view, setView] = useState<View>("Overview");
  const workspace = useVendorWorkspace({
    storeName: "Sunday Market",
    products: initialProducts.map((product, index) => ({ ...product, id: `demo-product-${index}`, categoryId: null, status: "ACTIVE" })),
    categories: categories.map((category, index) => ({ ...category, id: `demo-category-${index}` })),
    orders: initialOrders,
    customers,
  });
  const { storeId, storeName, products, setProducts, orders, setOrders } = workspace;
  const categoryList = workspace.categories;
  const setCategoryList = workspace.setCategories;
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [modal, setModal] = useState<"product" | "category" | null>(null);
  const [toast, setToast] = useState("");
  const [connectBusy, setConnectBusy] = useState(false);
  const [connectError, setConnectError] = useState("");
  const [transfersEnabled, setTransfersEnabled] = useState(false);

  function notify(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2800);
  }

  async function startBachsSetup() {
    setConnectBusy(true);
    setConnectError("");
    try {
      const result = await apiRequest<{ transfersEnabled?: boolean; onboardingUrl?: string }>(
        "/payments/connect/onboarding",
        { method: "POST", body: JSON.stringify({ country: "NG", entityType: "company" }) },
        true,
      );
      if (result.transfersEnabled === true) {
        setTransfersEnabled(true);
        notify("Bachs Connect is verified and ready.");
      } else if (result.onboardingUrl) {
        window.location.assign(result.onboardingUrl);
      } else {
        setConnectError("Bachs has not confirmed transfers yet. Complete onboarding and check again.");
      }
    } catch (cause) {
      setConnectError(cause instanceof Error ? cause.message : "Bachs onboarding is unavailable.");
    } finally {
      setConnectBusy(false);
    }
  }

  async function addProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const name = String(values.get("name"));
    const sku = String(values.get("sku") || "");
    const categoryName = String(values.get("category") || "Uncategorised");
    const category = categoryList.find((item) => item.name === categoryName);
    const price = Number(values.get("price"));
    const stock = Number(values.get("stock"));
    try {
      if (storeId && !workspace.isDemo) {
        const created = await apiRequest<{
          id: string; name: string; sku: string | null; categoryId: string | null; price: string;
          status: string; category?: { name: string } | null; inventory?: { quantity: number } | null;
        }>(`/stores/${storeId}/products`, {
          method: "POST",
          body: JSON.stringify({ name, sku, categoryId: category?.id, price: String(Math.round(price * 100)), quantity: stock }),
        }, true);
        setProducts((current) => [...current, {
          id: created.id, name: created.name, sku: created.sku ?? "", category: created.category?.name ?? categoryName,
          categoryId: created.categoryId, price: Number(created.price) / 100, stock: created.inventory?.quantity ?? stock,
          color: "#e8def8", status: created.status,
        }]);
      } else {
        setProducts((current) => [...current, {
          id: crypto.randomUUID(), name, sku: sku || "NEW-001", category: categoryName, categoryId: category?.id ?? null,
          price, stock, color: "#e8def8", status: "ACTIVE",
        }]);
      }
      setModal(null);
      notify(workspace.isDemo ? "Product added to this demo workspace." : "Product saved.");
    } catch (cause) {
      setConnectError(cause instanceof Error ? cause.message : "Could not create product.");
    }
  }

  async function addCategory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name"));
    const description = String(form.get("description") ?? "");
    try {
      const created = storeId && !workspace.isDemo
        ? await apiRequest<{ id: string; name: string }>(`/stores/${storeId}/categories`, { method: "POST", body: JSON.stringify({ name, description }) }, true)
        : { id: crypto.randomUUID(), name };
      setCategoryList((current) => [...current, { ...created, count: 0, color: "#e4def5" }]);
      setModal(null);
      notify(workspace.isDemo ? "Category added to this demo workspace." : "Category saved.");
    } catch (cause) {
      setConnectError(cause instanceof Error ? cause.message : "Could not create category.");
    }
  }

  const filteredProducts = products.filter((item) => `${item.name} ${item.sku} ${item.category}`.toLowerCase().includes(query.toLowerCase()));
  const filteredOrders = orders.filter((item) => `${item.id} ${item.customer} ${item.status}`.toLowerCase().includes(query.toLowerCase()));
  const filteredCustomers = workspace.customers.filter((item) => `${item.name} ${item.email}`.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="min-h-screen bg-[#f5f6f2] text-[#202723]">
      <aside className={`fixed inset-y-0 left-0 z-30 flex w-[248px] flex-col bg-[#173d31] text-white transition-transform lg:translate-x-0 ${menuOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-[76px] items-center justify-between border-b border-white/10 px-6">
          <Link href="/dashboard" className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-lg bg-[#d8a66b] text-[#18382d]"><Store size={18} /></span><span className="text-sm font-bold tracking-[0.13em]">VENDORA</span></Link>
          <button aria-label="Close navigation" onClick={() => setMenuOpen(false)} className="grid size-8 place-items-center rounded-md text-white/70 hover:bg-white/10 lg:hidden"><X size={18} /></button>
        </div>
        <button onClick={() => setView("Store setup")} className="mx-4 mt-5 flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.07] p-3 text-left hover:bg-white/10">
          <span className="grid size-9 place-items-center rounded-md bg-[#c68b55] text-sm font-semibold text-white">{storeName.slice(0, 1).toUpperCase()}</span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium">{storeName}</span><span className="mt-0.5 block text-xs text-white/55">Vendor store</span></span><ChevronDown size={15} className="text-white/55" />
        </button>
        <nav className="mt-7 flex-1 overflow-y-auto px-3">
          {(["Workspace", "Engage", "Catalog", "Sales", "Manage"] as const).map((group) => <div key={group} className="mb-6"><p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/40">{group}</p><div className="space-y-1">{navItems.filter((item) => item.group === group).map(({ label, icon: Icon }) => <button key={label} onClick={() => { setView(label); setMenuOpen(false); }} className={`flex h-10 w-full items-center gap-3 rounded-md px-3 text-left text-[13px] transition ${view === label ? "bg-[#e3eee6] font-semibold text-[#173d31]" : "text-white/75 hover:bg-white/10 hover:text-white"}`}><Icon size={17} strokeWidth={1.8} /><span>{label}</span>{label === "Orders" && <span className="ml-auto rounded bg-[#c68b55] px-1.5 py-0.5 text-[10px] font-semibold text-white">4</span>}</button>)}</div></div>)}
        </nav>
        <div className="border-t border-white/10 p-4"><button className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left text-sm text-white/75 hover:bg-white/10"><CircleHelp size={17} />Help & support</button><div className="mt-3 flex items-center gap-3 border-t border-white/10 px-2 pt-4"><span className="grid size-9 place-items-center rounded-full bg-[#d9e4dc] text-xs font-semibold text-[#1e5a43]">{storeName.slice(0, 1).toUpperCase()}</span><span className="min-w-0 flex-1"><span className="block truncate text-xs font-medium">{workspace.isDemo ? "Demo vendor" : "Store owner"}</span><span className="mt-0.5 block truncate text-[11px] text-white/50">{storeName}</span></span><Link href="/sign-in" onClick={clearTokens} title={workspace.isDemo ? "Sign in" : "Sign out"} className="text-[11px] text-white/55 hover:text-white">{workspace.isDemo ? "Sign in" : "Sign out"}</Link></div></div>
      </aside>

      {menuOpen && <button aria-label="Close menu overlay" onClick={() => setMenuOpen(false)} className="fixed inset-0 z-20 bg-black/30 lg:hidden" />}
      <main className="min-h-screen lg:pl-[248px]">
        <header className="sticky top-0 z-10 flex h-[76px] items-center gap-3 border-b border-[#e5e9e2] bg-[#f9faf7]/95 px-4 backdrop-blur sm:px-7">
          <button aria-label="Open navigation" onClick={() => setMenuOpen(true)} className="grid size-9 shrink-0 place-items-center rounded-md text-[#57645b] hover:bg-[#edf0e9] lg:hidden"><Menu size={19} /></button>
          <div className="flex min-w-0 flex-1 items-center gap-2 text-sm"><span className="hidden text-[#8b958e] sm:inline">{storeName}</span><span className="hidden text-[#b0b8b1] sm:inline">/</span><span className="truncate font-semibold">{view}</span></div>
          <label className="hidden h-9 w-56 items-center gap-2 rounded-md border border-[#e1e5de] bg-white px-3 text-[#7a857d] md:flex"><Search size={15} /><input aria-label="Search dashboard" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search..." className="w-full bg-transparent text-xs text-[#27342c] outline-none placeholder:text-[#9aa39c]" /><kbd className="rounded border border-[#e5e9e2] px-1 py-0.5 text-[9px]">/</kbd></label>
          <Link href="/sign-in" onClick={clearTokens} className="hidden rounded-md px-2.5 py-2 text-xs font-medium text-[#57645b] hover:bg-[#edf0e9] sm:inline-flex">{workspace.isDemo ? "Sign in" : "Sign out"}</Link>
          <button aria-label="Notifications" title="Notifications" className="relative grid size-9 place-items-center rounded-md text-[#66736b] hover:bg-[#edf0e9]"><Bell size={17} /><span className="absolute right-[7px] top-[7px] size-1.5 rounded-full bg-[#cf765f]" /></button>
        </header>
        <div className="mx-auto max-w-[1440px] px-4 py-6 sm:px-7 sm:py-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs text-[#818c83]">{new Intl.DateTimeFormat("en-NG", { dateStyle: "full" }).format(new Date())}</p><h1 className="mt-1 text-[25px] font-semibold tracking-tight">{view === "Overview" ? `${storeName} overview` : view}</h1></div><span className="inline-flex items-center gap-1.5 rounded-md border border-[#e3e7df] bg-white px-2.5 py-1.5 text-[10px] font-medium text-[#78837b]"><span className="size-1.5 rounded-full bg-[#c68b55]" />{workspace.isDemo ? "Sample workspace" : "Live store"}</span></div>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs text-[#818c83]">{new Intl.DateTimeFormat("en-NG", { dateStyle: "full" }).format(new Date())}</p><h1 className="mt-1 text-[25px] font-semibold tracking-tight">{view === "Overview" ? `${storeName} overview` : view}</h1></div><span className="inline-flex items-center gap-1.5 rounded-md border border-[#e3e7df] bg-white px-2.5 py-1.5 text-[10px] font-medium text-[#78837b]"><span className="size-1.5 rounded-full bg-[#c68b55]" />{workspace.isDemo ? "Sample workspace" : "Live store"}</span></div>
                    {workspace.loading && <p role="status" className="mb-4 rounded-md border border-violet-100 bg-white px-3 py-2 text-xs text-slate-600">Loading your store data...</p>}
                    {workspace.error && <p role="alert" className="mb-4 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800">Could not load live store data: {workspace.error}</p>}
                    {connectError && view !== "Payments" && <p role="alert" className="mb-4 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800">{connectError}</p>}
                    {view === "Overview" && <Overview products={products} orders={orders} customers={workspace.customers} isDemo={workspace.isDemo} go={setView} />}
          {view === "Conversations" && <ChannelCenter view="Conversations" storeId={storeId} isDemo={workspace.isDemo} />}
          {view === "Channels" && <ChannelCenter view="Channels" storeId={storeId} isDemo={workspace.isDemo} />}
          {view === "Products" && <Products products={filteredProducts} open={() => setModal("product")} />}
          {view === "Categories" && <Categories data={categoryList} open={() => setModal("category")} />}
          {view === "Inventory" && <Inventory products={products} setProducts={setProducts} storeId={storeId} isDemo={workspace.isDemo} onError={setConnectError} />}
          {view === "Orders" && <Orders data={filteredOrders} setOrders={setOrders} isDemo={workspace.isDemo} onError={setConnectError} />}
          {view === "Customers" && <Customers data={filteredCustomers} />}
          {view === "Payments" && <Payments enabled={transfersEnabled} busy={connectBusy} error={connectError} connect={startBachsSetup} />}
          {view === "Store setup" && <StoreSetup go={setView} />}
        </div>
      </main>

      {toast && <div role="status" className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-lg bg-[#173d31] px-4 py-3 text-sm font-medium text-white shadow-xl"><Check size={16} />{toast}</div>}
      {modal && <Modal title={modal === "product" ? "Add a product" : "New category"} close={() => setModal(null)}><form onSubmit={modal === "product" ? addProduct : addCategory} className="space-y-4">
        <FormField label="Name" name="name" required />
        {modal === "product" ? <><div className="grid grid-cols-2 gap-3"><FormField label="SKU" name="sku" /><FormField label="Category" name="category" /></div><div className="grid grid-cols-2 gap-3"><FormField label="Price (NGN)" name="price" type="number" required /><FormField label="Stock on hand" name="stock" type="number" required /></div></> : <FormField label="Description" name="description" />}
        <button className="flex h-10 w-full items-center justify-center gap-2 rounded-md bg-[#216a50] text-sm font-semibold text-white hover:bg-[#185740]">{modal === "product" ? "Add product" : "Create category"}<ArrowRight size={15} /></button>
      </form></Modal>}
    </div>
  );
}

function Overview({ products, orders, customers: workspaceCustomers, isDemo, go }: { products: Product[]; orders: Order[]; customers: WorkspaceCustomer[]; isDemo: boolean; go: (view: View) => void }) {
  const recordedValue = orders.reduce((total, order) => total + order.total, 0);
  const orderCount = orders.length;
  const averageOrder = orderCount ? recordedValue / orderCount : 0;
  const stockUnits = products.reduce((total, product) => total + product.stock, 0);
  return <div className="entrance space-y-5">
    <p className={`rounded-md border px-3 py-2 text-xs ${isDemo ? "border-amber-200 bg-amber-50 text-amber-900" : "border-violet-100 bg-white text-slate-600"}`}>{isDemo ? "Demo figures only. Sign in to see your store records." : "Figures below summarize the latest records returned by the API; historical analytics endpoints are not available yet."}</p>
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{[
      { label: "Recorded order value", value: formatPrice(recordedValue) },
      { label: "Orders loaded", value: String(orderCount) },
      { label: "Customers loaded", value: String(workspaceCustomers.length) },
      { label: "Average loaded order", value: formatPrice(averageOrder) },
    ].map((stat) => <article key={stat.label} className="rounded-lg border border-[#e5e9e2] bg-white p-4"><p className="text-xs font-medium text-[#758077]">{stat.label}</p><p className="mt-4 text-[25px] font-semibold tracking-tight">{stat.value}</p></article>)}</section>
    <section className="grid gap-5 xl:grid-cols-[minmax(0,1.65fr)_minmax(290px,0.9fr)]">
      <article className="rounded-lg border border-[#e5e9e2] bg-white p-4 sm:p-5"><h2 className="text-sm font-semibold">Inventory snapshot</h2><p className="mt-1 text-xs text-[#818c83]">Units in {products.length} loaded products</p><div className="mt-5 flex items-end gap-3"><p className="text-3xl font-semibold">{stockUnits.toLocaleString("en-NG")}</p><span className="mb-1 text-xs text-slate-500">units available</span></div><div className="mt-5 h-2 overflow-hidden rounded-full bg-violet-100"><div className="h-full rounded-full bg-violet-600" style={{ width: `${products.length ? Math.min(products.filter((product) => product.stock > 0).length / products.length * 100, 100) : 0}%` }} /></div><p className="mt-2 text-[10px] text-slate-500">{products.filter((product) => product.stock <= 8).length} products at or below 8 units</p></article>
      <ConversationSummary go={go} />
    </section>
    <section className="grid gap-5 xl:grid-cols-[minmax(0,1.5fr)_minmax(290px,0.9fr)]"><article className="overflow-hidden rounded-lg border border-[#e5e9e2] bg-white"><div className="flex items-center justify-between border-b border-[#edf0eb] px-4 py-4 sm:px-5"><div><h2 className="text-sm font-semibold">Recent orders</h2><p className="mt-1 text-xs text-[#818c83]">The latest from your store</p></div><button onClick={() => go("Orders")} className="text-xs font-medium text-[#216a50] hover:underline">View all</button></div><OrderTable data={orders.slice(0, 4)} compact /></article><article className="rounded-lg border border-[#e5e9e2] bg-white p-4 sm:p-5"><div className="flex items-center justify-between"><div><h2 className="text-sm font-semibold">Stock to watch</h2><p className="mt-1 text-xs text-[#818c83]">Items at or below 8 units</p></div><button onClick={() => go("Inventory")} className="text-xs font-medium text-[#216a50] hover:underline">Inventory</button></div><div className="mt-4 space-y-3">{products.filter((product) => product.stock <= 8).map((product) => <div key={product.sku} className="flex items-center gap-3"><ProductMark product={product} /><div className="min-w-0 flex-1"><p className="truncate text-xs font-medium">{product.name}</p><p className="mt-0.5 text-[10px] text-[#818c83]">{product.sku}</p></div><span className="rounded bg-[#fff2e8] px-2 py-1 text-[10px] font-semibold text-[#aa6740]">{product.stock} left</span></div>)}</div></article></section>
  </div>;
}

function Products({ products, open }: { products: Product[]; open: () => void }) {
  return <div className="entrance space-y-4"><div className="flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-[#707a73]">Manage product details, prices, and availability.</p><button onClick={open} className="inline-flex h-9 items-center gap-2 rounded-md bg-[#216a50] px-3 text-xs font-semibold text-white hover:bg-[#185740]"><Plus size={15} /> Add product</button></div><div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-[#e5e9e2] bg-white p-3"><div className="flex gap-2">{["All products", "Active", "Drafts"].map((tab, index) => <button key={tab} className={`rounded-md px-3 py-1.5 text-xs ${index === 0 ? "bg-[#e7efe8] font-semibold text-[#216a50]" : "text-[#758077] hover:bg-[#f3f5f1]"}`}>{tab}</button>)}</div><span className="text-xs text-[#818c83]">{products.length} items</span></div><div className="overflow-x-auto rounded-lg border border-[#e5e9e2] bg-white"><table className="w-full min-w-[700px] text-left text-xs"><thead className="bg-[#f8f9f6] text-[10px] uppercase tracking-wide text-[#818c83]"><tr>{["Product", "SKU", "Category", "Price", "Stock", "Status", ""].map((label) => <th key={label} className="px-4 py-3 font-semibold">{label}</th>)}</tr></thead><tbody>{products.map((product) => <tr key={product.sku} className="border-t border-[#edf0eb] hover:bg-[#fbfcfa]"><td className="px-4 py-3"><div className="flex items-center gap-3"><ProductMark product={product} /><span className="font-medium">{product.name}</span></div></td><td className="px-4 py-3 text-[#77827a]">{product.sku}</td><td className="px-4 py-3 text-[#59665d]">{product.category}</td><td className="px-4 py-3 font-medium">{formatPrice(product.price)}</td><td className="px-4 py-3">{product.stock}</td><td className="px-4 py-3"><StatusPill label={product.stock === 0 ? "Out of stock" : "Active"} /></td><td className="px-4 py-3 text-right"><button title={`Edit ${product.name}`} className="rounded p-1 text-[#77827a] hover:bg-[#edf0eb]">•••</button></td></tr>)}</tbody></table></div></div>;
}

function Categories({ data, open }: { data: typeof categories; open: () => void }) {
  return <div className="entrance space-y-4"><div className="flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-[#707a73]">Organise products so customers can browse your catalogue.</p><button onClick={open} className="inline-flex h-9 items-center gap-2 rounded-md bg-[#216a50] px-3 text-xs font-semibold text-white hover:bg-[#185740]"><Plus size={15} /> Add category</button></div><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{data.map((category) => <article key={category.name} className="flex items-center gap-4 rounded-lg border border-[#e5e9e2] bg-white p-4"><span className="grid size-11 place-items-center rounded-md" style={{ backgroundColor: category.color }}><Tags size={18} className="text-[#42614f]" /></span><div className="min-w-0 flex-1"><h2 className="truncate text-sm font-semibold">{category.name}</h2><p className="mt-1 text-xs text-[#818c83]">{category.count} products</p></div><button title={`Manage ${category.name}`} className="grid size-8 place-items-center rounded-md text-[#818c83] hover:bg-[#f1f3ef]">•••</button></article>)}</div><article className="rounded-lg border border-dashed border-[#ccd5cc] bg-[#f8faf6] p-5"><h2 className="text-sm font-semibold">Keep your catalogue easy to browse</h2><p className="mt-1 text-xs leading-5 text-[#758077]">Use a small set of clear categories to help customers find products faster.</p></article></div>;
}

function Inventory({ products, setProducts, storeId, isDemo, onError }: {
  products: Product[];
  setProducts: (value: (items: Product[]) => Product[]) => void;
  storeId: string;
  isDemo: boolean;
  onError: (message: string) => void;
}) {
  async function adjustStock(product: Product, change: number) {
    const quantity = Math.max(0, product.stock + change);
    try {
      if (storeId && !isDemo) {
        await apiRequest(`/products/${product.id}/inventory`, {
          method: "PATCH",
          body: JSON.stringify({ quantity }),
        }, true);
      }
      setProducts((items) => items.map((item) => item.id === product.id ? { ...item, stock: quantity } : item));
    } catch (cause) {
      onError(cause instanceof Error ? cause.message : "Could not update inventory.");
    }
  }

  return <div className="entrance space-y-4">
    <div className="flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-[#707a73]">A quick read on stock across your store.</p><button disabled className="inline-flex h-9 items-center gap-2 rounded-md border border-[#dfe5dd] bg-white px-3 text-xs font-medium text-[#45534a] disabled:cursor-not-allowed disabled:opacity-60"><ArrowUpRight size={14} /> Export coming soon</button></div>
    <div className="grid gap-3 sm:grid-cols-3"><Summary label="Total products" value={String(products.length)} note="Across all categories" /><Summary label="Low stock" value={String(products.filter((product) => product.stock <= 8).length)} note="At or below 8 units" /><Summary label="Units in stock" value={String(products.reduce((total, product) => total + product.stock, 0))} note="Available to sell" /></div>
    <div className="overflow-x-auto rounded-lg border border-[#e5e9e2] bg-white"><table className="w-full min-w-[620px] text-left text-xs"><thead className="bg-[#f8f9f6] text-[10px] uppercase tracking-wide text-[#818c83]"><tr><th className="px-4 py-3">Product</th><th className="px-4 py-3">SKU</th><th className="px-4 py-3">Stock level</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Adjust</th></tr></thead><tbody>{products.map((product) => <tr key={product.id} className="border-t border-[#edf0eb]"><td className="px-4 py-3"><div className="flex items-center gap-3"><ProductMark product={product} /><span className="font-medium">{product.name}</span></div></td><td className="px-4 py-3 text-[#77827a]">{product.sku}</td><td className="px-4 py-3"><div className="flex items-center gap-3"><span className="w-6 font-semibold">{product.stock}</span><span className="h-1.5 w-24 overflow-hidden rounded-full bg-[#edf0eb]"><span className={`block h-full rounded-full ${product.stock <= 8 ? "bg-[#c98753]" : "bg-[#4b8a67]"}`} style={{ width: `${Math.min(product.stock * 2.5, 100)}%` }} /></span></div></td><td className="px-4 py-3"><StatusPill label={product.stock <= 8 ? "Restock soon" : "In stock"} /></td><td className="px-4 py-3"><div className="flex items-center gap-2"><button aria-label={`Remove one ${product.name}`} onClick={() => void adjustStock(product, -1)} className="grid size-7 place-items-center rounded border border-[#e1e6df] text-sm hover:bg-[#f2f4f0]">−</button><button aria-label={`Add one ${product.name}`} onClick={() => void adjustStock(product, 1)} className="grid size-7 place-items-center rounded border border-[#e1e6df] text-sm hover:bg-[#f2f4f0]">+</button></div></td></tr>)}</tbody></table></div>
  </div>;
}

function Orders({ data, setOrders, isDemo, onError }: {
  data: Order[];
  setOrders: (value: (items: Order[]) => Order[]) => void;
  isDemo: boolean;
  onError: (message: string) => void;
}) {
  async function updateStatus(id: string, status: Order["status"]) {
    const apiStatus: Record<Order["status"], string> = {
      Pending: "PENDING", Paid: "PAID", Processing: "PROCESSING", Shipped: "SHIPPED", Delivered: "DELIVERED", Cancelled: "CANCELLED",
    };
    try {
      if (!isDemo) {
        await apiRequest(`/orders/${id}/status`, { method: "PATCH", body: JSON.stringify({ status: apiStatus[status] }) }, true);
      }
      setOrders((items) => items.map((order) => order.id === id ? { ...order, status } : order));
    } catch (cause) {
      onError(cause instanceof Error ? cause.message : "Could not update order.");
    }
  }

  return <div className="entrance space-y-4"><div className="flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-[#707a73]">Track fulfilment and keep every order moving.</p><div className="flex gap-2"><select aria-label="Filter orders" className="h-9 rounded-md border border-[#dfe5dd] bg-white px-2 text-xs"><option>All orders</option><option>Pending</option><option>Processing</option><option>Shipped</option><option>Delivered</option><option>Cancelled</option></select><button disabled title="Orders are created through customer checkout" className="inline-flex h-9 items-center gap-2 rounded-md bg-[#216a50] px-3 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"><Plus size={15} /> From checkout</button></div></div><div className="overflow-x-auto rounded-lg border border-[#e5e9e2] bg-white"><OrderTable data={data} onStatusChange={updateStatus} /></div></div>;
}

function OrderTable({ data, compact = false, onStatusChange }: { data: Order[]; compact?: boolean; onStatusChange?: (id: string, status: Order["status"]) => void }) {
  return <table className="w-full min-w-[590px] text-left text-xs"><thead className="bg-[#f8f9f6] text-[10px] uppercase tracking-wide text-[#818c83]"><tr><th className="px-4 py-3">Order</th><th className="px-4 py-3">Customer</th>{!compact && <th className="px-4 py-3">Date</th>}<th className="px-4 py-3">Total</th><th className="px-4 py-3">Status</th></tr></thead><tbody>{data.map((order) => <tr key={order.id} className="border-t border-[#edf0eb] hover:bg-[#fbfcfa]"><td className="px-4 py-3 font-semibold text-[#334038]">{order.id}</td><td className="px-4 py-3">{order.customer}</td>{!compact && <td className="px-4 py-3 text-[#818c83]">{order.date}</td>}<td className="px-4 py-3 font-medium">{formatPrice(order.total)}</td><td className="px-4 py-3">{onStatusChange ? <select aria-label={`Update ${order.id} status`} value={order.status} onChange={(event) => onStatusChange(order.id, event.target.value as Order["status"])} className="rounded border border-[#e1e6df] bg-white px-2 py-1 text-[10px]">{["Paid", "Processing", "Shipped", "Pending"].map((status) => <option key={status}>{status}</option>)}</select> : <StatusPill label={order.status} />}</td></tr>)}</tbody></table>;
}

function Customers({ data }: { data: typeof customers }) {
  return <div className="entrance space-y-4"><div className="flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-[#707a73]">Customer relationships and order history.</p><button className="inline-flex h-9 items-center gap-2 rounded-md border border-[#dfe5dd] bg-white px-3 text-xs font-medium text-[#45534a] hover:bg-[#f8faf6]"><ArrowUpRight size={14} /> Export customers</button></div><div className="overflow-x-auto rounded-lg border border-[#e5e9e2] bg-white"><table className="w-full min-w-[650px] text-left text-xs"><thead className="bg-[#f8f9f6] text-[10px] uppercase tracking-wide text-[#818c83]"><tr>{["Customer", "Orders", "Total spent", "Last activity", ""].map((label) => <th key={label} className="px-4 py-3">{label}</th>)}</tr></thead><tbody>{data.map((customer) => <tr key={customer.email} className="border-t border-[#edf0eb] hover:bg-[#fbfcfa]"><td className="px-4 py-3"><div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-full text-[10px] font-semibold text-[#3d5848]" style={{ backgroundColor: customer.color }}>{customer.initials}</span><span><span className="block font-medium">{customer.name}</span><span className="mt-1 block text-[10px] text-[#818c83]">{customer.email}</span></span></div></td><td className="px-4 py-3">{customer.orders}</td><td className="px-4 py-3 font-medium">{formatPrice(customer.spent)}</td><td className="px-4 py-3 text-[#818c83]">Today</td><td className="px-4 py-3 text-right"><button className="rounded px-2 py-1 text-[10px] font-medium text-[#216a50] hover:bg-[#edf3ee]">View</button></td></tr>)}</tbody></table></div></div>;
}

function Payments({ enabled, busy, error, connect }: { enabled: boolean; busy: boolean; error: string; connect: () => void }) {
  const providers = [
    { name: "Bachs", detail: "Online checkout and vendor transfers", ready: true },
    { name: "Paystack", detail: "Online checkout", ready: false },
    { name: "Flutterwave", detail: "Online checkout", ready: false },
    { name: "Bank transfer", detail: "Manual payment confirmation", ready: false },
    { name: "Cash on delivery", detail: "Collect payment at fulfillment", ready: false },
  ];

  return <div className="entrance max-w-5xl space-y-5">
    <div><p className="text-sm text-[#707a73]">Payment providers are interchangeable integrations, not a Vendora lock-in.</p></div>
    <article className="rounded-lg border border-[#e5e9e2] bg-white p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div><h2 className="text-sm font-semibold">Provider availability</h2><p className="mt-1 max-w-2xl text-xs leading-5 text-[#818c83]">This API currently exposes Bachs onboarding and checkout. Other listed methods are part of the product plan but are not yet wired to backend adapters.</p></div>
        <span className="rounded-md bg-violet-50 px-2.5 py-1.5 text-[10px] font-semibold text-violet-800">Provider setup</span>
      </div>
      <div className="mt-5 divide-y divide-[#eeeaf4] border-y border-[#eeeaf4]">
        {providers.map((provider) => <div key={provider.name} className="flex flex-wrap items-center gap-3 py-3.5">
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-violet-50 text-violet-700"><CreditCard size={16} /></span>
          <div className="min-w-0 flex-1"><p className="text-xs font-semibold">{provider.name}{provider.ready && <span className="ml-2 rounded bg-violet-100 px-1.5 py-0.5 text-[9px] font-medium text-violet-800">Current API provider</span>}</p><p className="mt-1 text-[10px] text-[#818c83]">{provider.detail}</p></div>
          <span className={`rounded-md px-2 py-1 text-[10px] font-medium ${provider.ready ? enabled ? "bg-[#e5f2e8] text-[#27714f]" : "bg-[#f4eee5] text-[#946941]" : "bg-slate-100 text-slate-500"}`}>{provider.ready ? enabled ? "Transfers enabled" : "Setup required" : "Not integrated"}</span>
          {provider.ready && <button onClick={connect} disabled={busy || enabled} className="h-8 rounded-md bg-[#216a50] px-3 text-[10px] font-semibold text-white hover:bg-[#185740] disabled:cursor-not-allowed disabled:opacity-55">{busy ? "Checking..." : enabled ? "Connected" : "Set up"}</button>}
        </div>)}
      </div>
      <p className="mt-4 flex items-start gap-2 text-[11px] leading-5 text-[#818c83]"><Clock3 size={14} className="mt-0.5 shrink-0" />Payment checkout remains unavailable until the selected provider confirms readiness. Bachs only enables after its API response explicitly returns <code className="rounded bg-violet-50 px-1 text-violet-800">transfersEnabled: true</code>.</p>
      {error && <p role="alert" className="mt-4 rounded-md border border-[#efc7c1] bg-[#fff4f1] px-3 py-2 text-xs text-[#9a4035]">{error} {error.toLowerCase().includes("unauthorized") && <Link href="/sign-in" className="font-semibold underline">Sign in</Link>}</p>}
    </article>
  </div>;
}

function ConversationSummary({ go }: { go: (view: View) => void }) {
  return <article className="overflow-hidden rounded-lg border border-violet-100 bg-white">
    <div className="flex items-center justify-between border-b border-violet-100 px-4 py-4 sm:px-5"><div><h2 className="text-sm font-semibold">Recent conversations</h2><p className="mt-1 text-xs text-slate-500">Customer activity from connected channels</p></div><button onClick={() => go("Conversations")} className="text-xs font-semibold text-violet-700 hover:underline">Open inbox</button></div>
    <div className="divide-y divide-violet-50">{[
      ["AK", "Aisha Kalu", "Do you have the linen shirt in blue?", "WhatsApp", "2"],
      ["BA", "Bola Adeyemi", "I would like to check my order status.", "WhatsApp", ""],
      ["CO", "Chinedu Okafor", "Thanks, I have received the delivery.", "WhatsApp", ""],
    ].map(([initials, name, message, channel, unread]) => <button key={name} onClick={() => go("Conversations")} className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-violet-50/50 sm:px-5"><span className="grid size-9 shrink-0 place-items-center rounded-full bg-violet-100 text-[10px] font-semibold text-violet-800">{initials}</span><span className="min-w-0 flex-1"><span className="flex items-center justify-between gap-2"><span className="text-xs font-semibold">{name}</span><span className="text-[10px] text-slate-400">{channel}</span></span><span className="mt-1 block truncate text-[11px] text-slate-500">{message}</span></span>{unread && <span className="grid size-5 place-items-center rounded-full bg-violet-700 text-[10px] font-semibold text-white">{unread}</span>}</button>)}</div>
    <p className="border-t border-violet-100 bg-violet-50/50 px-4 py-2 text-[10px] text-violet-800">Sample conversation data</p>
  </article>;
}

function StoreSetup({ go }: { go: (view: View) => void }) {
  return <div className="entrance grid gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(270px,0.8fr)]"><article className="rounded-lg border border-[#e5e9e2] bg-white p-5 sm:p-6"><div className="flex items-start justify-between"><div><h2 className="text-sm font-semibold">Store profile</h2><p className="mt-1 text-xs text-[#818c83]">Public details for your shop.</p></div><span className="rounded-md bg-[#f4eee5] px-2 py-1 text-[10px] font-semibold text-[#946941]">Sample data</span></div><dl className="mt-6 divide-y divide-[#edf0eb]">{[["Store name", "Sunday Market"], ["Store URL", "vendora.store/sunday-market"], ["Currency", "NGN · Nigerian naira"], ["Store status", "Open"]].map(([key, value]) => <div key={key} className="flex flex-wrap justify-between gap-2 py-4 text-xs"><dt className="text-[#818c83]">{key}</dt><dd className="font-medium">{value}</dd></div>)}</dl><button onClick={() => go("Store setup")} className="mt-4 h-9 rounded-md border border-[#dfe5dd] px-3 text-xs font-medium text-[#45534a] hover:bg-[#f8faf6]">Edit store details</button></article><article className="rounded-lg border border-[#e5e9e2] bg-white p-5"><h2 className="text-sm font-semibold">Get started</h2><p className="mt-1 text-xs leading-5 text-[#818c83]">Create an account and add your store details through the API setup flow.</p><div className="mt-5 space-y-3"><Link href="/register" className="flex h-10 items-center justify-center gap-2 rounded-md bg-[#216a50] text-xs font-semibold text-white hover:bg-[#185740]">Create vendor account<ArrowRight size={14} /></Link><Link href="/store-setup" className="flex h-10 items-center justify-center rounded-md border border-[#dfe5dd] text-xs font-medium text-[#45534a] hover:bg-[#f8faf6]">Open store setup</Link></div></article></div>;
}

function ProductMark({ product }: { product: Product }) {
  return <span className="grid size-9 shrink-0 place-items-center rounded-md" style={{ backgroundColor: product.color }}><Package size={16} className="text-[#546b59]" strokeWidth={1.7} /></span>;
}

function StatusPill({ label }: { label: string }) {
  const positive = ["Paid", "Shipped", "Active", "In stock"].includes(label);
  const warning = ["Processing", "Pending", "Restock soon"].includes(label);
  return <span className={`inline-flex items-center gap-1.5 rounded px-2 py-1 text-[10px] font-medium ${positive ? "bg-[#e7f1e8] text-[#31724f]" : warning ? "bg-[#f6efe4] text-[#986d40]" : "bg-[#f3e6e3] text-[#a05143]"}`}><span className={`size-1.5 rounded-full ${positive ? "bg-[#4b8a67]" : warning ? "bg-[#c68b55]" : "bg-[#bd6656]"}`} />{label}</span>;
}

function Summary({ label, value, note }: { label: string; value: string; note: string }) {
  return <article className="rounded-lg border border-[#e5e9e2] bg-white p-4"><p className="text-xs text-[#758077]">{label}</p><p className="mt-3 text-2xl font-semibold">{value}</p><p className="mt-1 text-[10px] text-[#929b94]">{note}</p></article>;
}

function FormField({ label, name, type = "text", required = false }: { label: string; name: string; type?: string; required?: boolean }) {
  return <label className="block text-xs font-medium text-[#46534a]">{label}<input name={name} type={type} required={required} min={type === "number" ? "0" : undefined} className="mt-1.5 h-10 w-full rounded-md border border-[#dce2da] px-3 text-sm outline-none focus:border-[#438367] focus:ring-2 focus:ring-[#d5e9dc]" /></label>;
}

function Modal({ title, close, children }: { title: string; close: () => void; children: ReactNode }) {
  return <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#14241d]/40 p-4" onClick={close}><section role="dialog" aria-modal="true" aria-label={title} className="w-full max-w-md rounded-lg border border-[#e5e9e2] bg-white p-5 shadow-2xl" onClick={(event) => event.stopPropagation()}><div className="mb-5 flex items-center justify-between"><h2 className="text-base font-semibold">{title}</h2><button aria-label="Close dialog" onClick={close} className="grid size-8 place-items-center rounded-md text-[#758077] hover:bg-[#f1f3ef]"><X size={17} /></button></div>{children}</section></div>;
}