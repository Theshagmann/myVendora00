"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ArrowLeft, ArrowRight, Store } from "lucide-react";
import { apiRequest, saveTokens } from "@/lib/api";

type AuthFormProps = { mode: "sign-in" | "register" };
type AuthResponse = { accessToken: string; refreshToken?: string };

export default function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const isRegister = mode === "register";
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const body = Object.fromEntries(new FormData(event.currentTarget).entries());
    try {
      const response = await apiRequest<AuthResponse>(`/auth/${isRegister ? "register" : "login"}`, {
        method: "POST",
        body: JSON.stringify(body),
      });
      saveTokens(response.accessToken, response.refreshToken);
      router.push(isRegister ? "/store-setup" : "/dashboard");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to sign in right now.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="grid min-h-screen bg-[#f5f6f2] lg:grid-cols-[1fr_0.9fr]">
      <section className="flex min-h-screen flex-col justify-between bg-[#173d31] px-7 py-8 text-white sm:px-12 lg:px-16">
        <Link href="/dashboard" className="flex w-fit items-center gap-3 text-sm font-semibold tracking-wide"><span className="grid size-10 place-items-center rounded-xl bg-[#d8a66b] text-[#18382d]"><Store size={19} /></span> VENDORA</Link>
        <div className="max-w-lg py-12"><p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#c3d6ca]">Your store, in good order</p><h1 className="mt-5 text-4xl font-semibold leading-tight sm:text-5xl">The work behind every good shop.</h1><p className="mt-5 max-w-md text-base leading-7 text-[#d2ded6]">A clear place to manage products, keep stock moving, and take care of every order.</p></div>
        <p className="text-xs text-[#b8ccc0]">Vendora commerce operations</p>
      </section>
      <section className="flex items-center justify-center px-6 py-12 sm:px-12">
        <div className="entrance w-full max-w-md">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-[#66736b] hover:text-[#216a50]"><ArrowLeft size={16} /> Back to dashboard</Link>
          <h2 className="mt-10 text-3xl font-semibold tracking-tight">{isRegister ? "Create your account" : "Welcome back"}</h2>
          <p className="mt-2 text-sm text-[#707a73]">{isRegister ? "Start setting up your Vendora store." : "Sign in to continue to your store."}</p>
          <form onSubmit={submit} className="mt-8 space-y-4">
            {isRegister && <div className="grid gap-4 sm:grid-cols-2"><Field label="First name" name="firstName" required /><Field label="Last name" name="lastName" required /></div>}
            <Field label="Email address" name="email" type="email" required />
            <Field label="Password" name="password" type="password" required minLength={8} />
            {error && <p role="alert" className="rounded-lg border border-[#efc7c1] bg-[#fff4f1] px-3 py-2 text-sm text-[#9a4035]">{error}</p>}
            <button disabled={busy} className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#216a50] px-4 text-sm font-semibold text-white transition hover:bg-[#185740] disabled:opacity-60">{busy ? "Please wait..." : isRegister ? "Create account" : "Sign in"}<ArrowRight size={16} /></button>
          </form>
          <p className="mt-6 text-sm text-[#707a73]">{isRegister ? "Already have an account?" : "New to Vendora?"} <Link className="font-semibold text-[#216a50] hover:underline" href={isRegister ? "/sign-in" : "/register"}>{isRegister ? "Sign in" : "Create an account"}</Link></p>
          <p className="mt-8 text-xs leading-5 text-[#89918b]">Connect to your API by setting <code className="rounded bg-[#e9ece6] px-1 py-0.5">NEXT_PUBLIC_API_BASE_URL</code>.</p>
        </div>
      </section>
    </main>
  );
}

function Field({ label, name, type = "text", required, minLength }: { label: string; name: string; type?: string; required?: boolean; minLength?: number }) {
  return <label className="block text-sm font-medium text-[#39463e]">{label}<input name={name} type={type} required={required} minLength={minLength} className="mt-2 h-11 w-full rounded-lg border border-[#dce2da] bg-white px-3 text-sm outline-none transition placeholder:text-[#a1a9a2] focus:border-[#438367] focus:ring-2 focus:ring-[#d5e9dc]" /></label>;
}