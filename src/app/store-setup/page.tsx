"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ArrowLeft, ArrowRight, Store } from "lucide-react";
import { apiRequest } from "@/lib/api";

export default function StoreSetupPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setBusy(true);
    const values = Object.fromEntries(new FormData(event.currentTarget).entries());
    try {
      await apiRequest("/stores", { method: "POST", body: JSON.stringify(values) }, true);
      router.push("/dashboard");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not create your store.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="grid min-h-screen bg-[#f5f6f2] lg:grid-cols-[0.85fr_1.15fr]">
      <aside className="flex flex-col justify-between bg-[#173d31] px-8 py-8 text-white sm:px-14"><Link href="/dashboard" className="flex w-fit items-center gap-3 text-sm font-semibold tracking-wide"><span className="grid size-10 place-items-center rounded-xl bg-[#d8a66b] text-[#18382d]"><Store size={19} /></span> VENDORA</Link><div className="max-w-sm py-12"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#c3d6ca]">First things first</p><h1 className="mt-5 text-4xl font-semibold leading-tight">Give your store a home.</h1><p className="mt-4 text-sm leading-7 text-[#d2ded6]">Set the essentials now. You can update these details at any time.</p></div><p className="text-xs text-[#b8ccc0]">Store setup</p></aside>
      <section className="flex items-center justify-center px-6 py-12 sm:px-12"><div className="entrance w-full max-w-lg"><Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-[#66736b]"><ArrowLeft size={16} /> Dashboard</Link><h2 className="mt-9 text-3xl font-semibold">Set up your store</h2><p className="mt-2 text-sm text-[#707a73]">Add the details customers will see.</p>
        <form onSubmit={submit} className="mt-8 space-y-5">
          <label className="block text-sm font-medium text-[#39463e]">Store name<input required name="name" minLength={2} maxLength={100} placeholder="e.g. Sunday Market" className="mt-2 h-11 w-full rounded-lg border border-[#dce2da] bg-white px-3 outline-none focus:border-[#438367] focus:ring-2 focus:ring-[#d5e9dc]" /></label>
          <label className="block text-sm font-medium text-[#39463e]">Store URL<input required name="slug" pattern="[a-z0-9]+(?:-[a-z0-9]+)*" placeholder="sunday-market" className="mt-2 h-11 w-full rounded-lg border border-[#dce2da] bg-white px-3 outline-none focus:border-[#438367] focus:ring-2 focus:ring-[#d5e9dc]" /><span className="mt-1 block text-xs font-normal text-[#89918b]">Lowercase letters, numbers, and hyphens.</span></label>
          <label className="block text-sm font-medium text-[#39463e]">Description <span className="font-normal text-[#89918b]">(optional)</span><textarea name="description" rows={3} placeholder="A short introduction to your shop" className="mt-2 w-full resize-y rounded-lg border border-[#dce2da] bg-white px-3 py-2 outline-none focus:border-[#438367] focus:ring-2 focus:ring-[#d5e9dc]" /></label>
          <label className="block text-sm font-medium text-[#39463e]">Currency<select name="currency" defaultValue="NGN" className="mt-2 h-11 w-full rounded-lg border border-[#dce2da] bg-white px-3 outline-none focus:border-[#438367]"><option value="NGN">NGN · Nigerian naira</option><option value="GHS">GHS · Ghanaian cedi</option><option value="KES">KES · Kenyan shilling</option><option value="USD">USD · US dollar</option></select></label>
          {error && <p role="alert" className="rounded-lg border border-[#efc7c1] bg-[#fff4f1] px-3 py-2 text-sm text-[#9a4035]">{error}</p>}
          <button disabled={busy} className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#216a50] px-4 text-sm font-semibold text-white hover:bg-[#185740] disabled:opacity-60">{busy ? "Creating store..." : "Create store"}<ArrowRight size={16} /></button>
        </form>
      </div></section>
    </main>
  );
}