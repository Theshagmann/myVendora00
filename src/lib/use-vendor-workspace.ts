"use client";

import { useEffect, useState } from "react";
import { apiRequest, getAccessToken } from "@/lib/api";

export type WorkspaceProduct = {
  id: string;
  name: string;
  sku: string;
  category: string;
  categoryId: string | null;
  price: number;
  stock: number;
  color: string;
  status: string;
};

export type WorkspaceCategory = { id: string; name: string; count: number; color: string };
export type WorkspaceOrder = {
  id: string;
  customer: string;
  date: string;
  total: number;
  status: "Paid" | "Processing" | "Shipped" | "Pending" | "Delivered" | "Cancelled";
};
export type WorkspaceCustomer = {
  name: string;
  email: string;
  orders: number;
  spent: number;
  initials: string;
  color: string;
};

const customerColors = ["#e9d8ca", "#d5e5d8", "#dce2ed", "#eadada"];
const orderStatuses: Record<string, WorkspaceOrder["status"]> = {
  PENDING: "Pending",
  PAID: "Paid",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

type ApiProduct = {
  id: string;
  name: string;
  sku: string | null;
  categoryId: string | null;
  price: string | number;
  status: string;
  category?: { name: string } | null;
  inventory?: { quantity: number } | null;
};
type ApiOrder = {
  id: string;
  customerId: string;
  createdAt: string;
  total: string | number;
  status: string;
  customer?: { name?: string | null; phone?: string | null } | null;
};
type ApiCustomer = { id: string; name?: string | null; email?: string | null; phone?: string | null };
type ApiCategory = { id: string; name: string };

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-NG", { dateStyle: "medium" }).format(new Date(value));
}

export function useVendorWorkspace(seed: {
  storeName: string;
  products: WorkspaceProduct[];
  categories: WorkspaceCategory[];
  orders: WorkspaceOrder[];
  customers: WorkspaceCustomer[];
}) {
  const [storeId, setStoreId] = useState("");
  const [storeName, setStoreName] = useState(seed.storeName);
  const [products, setProducts] = useState(seed.products);
  const [categories, setCategories] = useState(seed.categories);
  const [orders, setOrders] = useState(seed.orders);
  const [customers, setCustomers] = useState(seed.customers);
  const [isDemo, setIsDemo] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!getAccessToken()) return;

    let active = true;

    async function load() {
      try {
        const store = await apiRequest<{ id: string; name: string; currency: string }>("/stores/me", {}, true);
        const [apiProducts, apiCategories, apiOrders, apiCustomers] = await Promise.all([
          apiRequest<ApiProduct[]>(`/stores/${store.id}/products`, {}, true),
          apiRequest<ApiCategory[]>(`/stores/${store.id}/categories`, {}, true),
          apiRequest<ApiOrder[]>(`/stores/${store.id}/orders`, {}, true),
          apiRequest<ApiCustomer[]>(`/stores/${store.id}/customers`, {}, true),
        ]);

        if (!active) return;

        setIsDemo(false);
        const mappedProducts: WorkspaceProduct[] = apiProducts.map((product) => ({
          id: String(product.id),
          name: String(product.name),
          sku: String(product.sku ?? ""),
          category: String(product.category?.name ?? "Uncategorised"),
          categoryId: product.categoryId ? String(product.categoryId) : null,
          price: Number(product.price) / 100,
          stock: Number(product.inventory?.quantity ?? 0),
          color: "#e8def8",
          status: String(product.status ?? "ACTIVE"),
        }));
        const mappedOrders: WorkspaceOrder[] = apiOrders.map((order) => ({
          id: String(order.id),
          customer: String(order.customer?.name ?? order.customer?.phone ?? "Customer"),
          date: formatDate(String(order.createdAt)),
          total: Number(order.total) / 100,
          status: orderStatuses[String(order.status)] ?? "Pending",
        }));
        const customerTotals = new Map<string, { orders: number; spent: number }>();
        for (const order of apiOrders) {
          const customerId = String(order.customerId);
          const totals = customerTotals.get(customerId) ?? { orders: 0, spent: 0 };
          totals.orders += 1;
          totals.spent += Number(order.total) / 100;
          customerTotals.set(customerId, totals);
        }

        setStoreId(String(store.id));
        setStoreName(String(store.name));
        setProducts(mappedProducts);
        setCategories(apiCategories.map((category: ApiCategory, index: number) => ({
          id: String(category.id),
          name: String(category.name),
          count: mappedProducts.filter((product) => product.categoryId === String(category.id)).length,
          color: customerColors[index % customerColors.length],
        })));
        setOrders(mappedOrders);
        setCustomers(apiCustomers.map((customer: ApiCustomer, index: number) => {
          const customerName = String(customer.name ?? customer.phone ?? "Customer");
          const totals = customerTotals.get(String(customer.id)) ?? { orders: 0, spent: 0 };
          return {
            name: customerName,
            email: String(customer.email ?? customer.phone ?? "No contact details"),
            orders: totals.orders,
            spent: totals.spent,
            initials: customerName.split(/\s+/).map((part: string) => part[0]).join("").slice(0, 2).toUpperCase(),
            color: customerColors[index % customerColors.length],
          };
        }));
      } catch (cause) {
        if (active) {
          setIsDemo(false);
          setProducts([]);
          setCategories([]);
          setOrders([]);
          setCustomers([]);
          setError(cause instanceof Error ? cause.message : "Could not load your store data.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();
    return () => { active = false; };
  }, []);

  return {
    storeId,
    storeName,
    products,
    setProducts,
    categories,
    setCategories,
    orders,
    setOrders,
    customers,
    isDemo,
    loading,
    error,
  };
}
