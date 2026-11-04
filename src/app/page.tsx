const metrics = [
  { value: "3.4x", label: "more orders from chat-based sales" },
  { value: "4.7 hrs", label: "saved per week by automating replies" },
  { value: "24/7", label: "AI storefront coverage across channels" },
];

const channels = ["WhatsApp", "Instagram", "Telegram", "Website"];

const features = [
  {
    title: "Smart catalog + inventory",
    copy:
      "Keep products, prices, and stock aligned with your store while AI answers questions using live data.",
  },
  {
    title: "Conversation-first checkout",
    copy:
      "Turn chats into orders, payments, and receipts without breaking the buying flow.",
  },
  {
    title: "Vendor operations dashboard",
    copy:
      "Track sales, conversations, and fulfillment from one clean workspace built for growing sellers.",
  },
];

const products = [
  { name: "Satin Luxe Set", price: "₦24,900", tag: "Best seller" },
  { name: "Glow Serum", price: "₦12,450", tag: "New drop" },
  { name: "Workday Tote", price: "₦18,200", tag: "Low stock" },
  { name: "Bamboo Bottle", price: "₦9,800", tag: "Staff pick" },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f8f7ff] text-slate-900">
      <div className="mx-auto max-w-7xl px-6 pb-20 pt-6 lg:px-8">
        <header className="mb-10 flex items-center justify-between rounded-full border border-violet-100 bg-white/90 px-4 py-3 shadow-[0_8px_30px_rgba(109,61,242,0.06)] backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-violet-400 text-sm font-bold text-white shadow-lg shadow-violet-200">
              V
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-violet-600">
                Vendora
              </p>
            </div>
          </div>

          <nav className="hidden items-center gap-8 text-sm text-slate-600 md:flex">
            <a href="#platform" className="transition hover:text-violet-700">Platform</a>
            <a href="#features" className="transition hover:text-violet-700">Features</a>
            <a href="#store" className="transition hover:text-violet-700">Storefront</a>
            <a href="#pricing" className="transition hover:text-violet-700">Pricing</a>
          </nav>

          <a
            href="/dashboard"
            className="rounded-full border border-violet-200 bg-violet-50 px-4 py-2 text-sm font-medium text-violet-700 transition hover:bg-violet-100"
          >
            Open dashboard
          </a>
        </header>

        <section className="grid items-center gap-10 pb-16 pt-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-violet-700">
              AI commerce for modern sellers
            </div>
            <h1 className="max-w-xl text-4xl font-black leading-tight tracking-[-0.04em] text-slate-950 md:text-6xl">
              Sell through chat, not just a storefront.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
              Vendora helps businesses manage products, customer conversations, and order payments from one premium AI-powered commerce workflow across WhatsApp, Instagram, Telegram, and web.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a
                href="/dashboard"
                className="rounded-full bg-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-200 transition hover:bg-violet-500"
              >
                Start free trial
              </a>
              <a
                href="#features"
                className="rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:border-violet-200 hover:text-violet-700"
              >
                See platform
              </a>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-6 text-sm text-slate-500">
              {channels.map((channel) => (
                <span key={channel} className="rounded-full border border-slate-200 bg-white px-3 py-1.5 shadow-sm">
                  {channel}
                </span>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-violet-100 bg-white p-5 shadow-[0_30px_70px_rgba(109,61,242,0.12)]">
            <div className="rounded-[1.5rem] border border-violet-100 bg-[#faf7ff] p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-500">Live overview</p>
                  <h2 className="mt-2 text-2xl font-bold text-slate-950">June performance</h2>
                </div>
                <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                  +18.2%
                </span>
              </div>

              <div className="space-y-4">
                <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
                  <div className="flex items-center justify-between text-sm text-slate-600">
                    <span>Revenue</span>
                    <span className="font-semibold text-slate-900">₦842,500</span>
                  </div>
                  <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-violet-100">
                    <div className="h-full w-[72%] rounded-full bg-gradient-to-r from-violet-500 to-violet-400" />
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
                    <p className="text-sm text-slate-500">Orders</p>
                    <p className="mt-3 text-2xl font-bold text-slate-950">1,246</p>
                  </div>
                  <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
                    <p className="text-sm text-slate-500">Customers</p>
                    <p className="mt-3 text-2xl font-bold text-slate-950">8,210</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="platform" className="grid gap-5 border-t border-slate-200 py-10 md:grid-cols-3">
          {metrics.map((item) => (
            <div key={item.label} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-3xl font-black text-slate-950">{item.value}</p>
              <p className="mt-2 text-sm text-slate-600">{item.label}</p>
            </div>
          ))}
        </section>

        <section id="features" className="py-16">
          <div className="mb-8 max-w-2xl">
            <p className="text-sm font-medium uppercase tracking-[0.25em] text-violet-600">Built for operators</p>
            <h2 className="mt-3 text-3xl font-bold text-slate-950 md:text-5xl">Everything a growing seller needs.</h2>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {features.map((feature, index) => (
              <div key={feature.title} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-100 font-bold text-violet-700">
                  {index + 1}
                </div>
                <h3 className="text-xl font-semibold text-slate-950">{feature.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{feature.copy}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="store" className="py-8">
          <div className="mb-8 flex items-end justify-between gap-6">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.25em] text-violet-600">Featured store</p>
              <h2 className="mt-3 text-3xl font-bold text-slate-950 md:text-5xl">Curated for your next best seller.</h2>
            </div>
            <a href="/dashboard" className="hidden text-sm font-medium text-violet-700 hover:text-violet-800 md:block">
              View dashboard →
            </a>
          </div>

          <div className="grid gap-5 md:grid-cols-4">
            {products.map((product) => (
              <article key={product.name} className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <div className="h-48 bg-[radial-gradient(circle_at_top,_rgba(167,139,250,0.22),_transparent_25%),linear-gradient(135deg,#f5f3ff,#ede9fe)]" />
                <div className="p-5">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <span className="rounded-full bg-violet-100 px-2 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-violet-700">
                      {product.tag}
                    </span>
                    <span className="text-sm text-slate-500">In stock</span>
                  </div>
                  <h3 className="text-lg font-semibold text-slate-950">{product.name}</h3>
                  <div className="mt-5 flex items-center justify-between">
                    <p className="text-lg font-bold text-violet-700">{product.price}</p>
                    <button className="rounded-full bg-slate-950 px-3 py-2 text-xs font-semibold text-white transition hover:bg-violet-600">
                      Add to cart
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section id="pricing" className="py-20">
          <div className="rounded-[2rem] border border-violet-200 bg-[linear-gradient(135deg,#ffffff_0%,#faf5ff_40%,#f4f0ff_100%)] p-8 shadow-[0_24px_80px_rgba(109,61,242,0.08)] md:p-12">
            <div className="grid items-center gap-8 md:grid-cols-[1.2fr_0.8fr]">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.25em] text-violet-600">Ready to launch</p>
                <h2 className="mt-4 text-3xl font-bold text-slate-950 md:text-5xl">Turn your store into a sales engine.</h2>
              </div>
              <div className="rounded-3xl border border-violet-200 bg-white p-5 text-center shadow-sm">
                <p className="text-sm uppercase tracking-[0.22em] text-slate-500">From</p>
                <p className="mt-3 text-4xl font-black text-slate-950">₦0</p>
                <p className="mt-2 text-base text-slate-600">with a guided MVP setup</p>
                <a
                  href="/dashboard"
                  className="mt-5 inline-flex rounded-full bg-violet-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-500"
                >
                  Launch your store
                </a>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
