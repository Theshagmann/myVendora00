"use client";

import { useEffect, useState, type FormEvent } from "react";
import { ArrowUpRight, Camera, MessageCircle, Send, ShieldAlert, Smartphone } from "lucide-react";
import { apiRequest } from "@/lib/api";

type ChannelView = "Conversations" | "Channels";
type ChatMessage = { author: "Customer" | "You"; text: string; time: string };
type Conversation = {
  id: string;
  name: string;
  initials: string;
  phone: string;
  preview: string;
  time: string;
  unread: number;
  messages: ChatMessage[];
};
type ApiConversation = {
  id: string;
  channel: string;
  updatedAt: string;
  customer?: { name?: string | null; phone?: string | null } | null;
};
type ApiMessage = { id: string; sender: string; body: string; createdAt: string };

const demoConversations: Conversation[] = [
  {
    id: "c-1", name: "Aisha Kalu", initials: "AK", phone: "+234 803 555 0192",
    preview: "Do you have the linen shirt in blue?", time: "10:42 am", unread: 2,
    messages: [
      { author: "Customer", text: "Hi, I saw the linen shirt on your page.", time: "10:38 am" },
      { author: "You", text: "Hello Aisha, happy to help. What would you like to know?", time: "10:40 am" },
      { author: "Customer", text: "Do you have the linen shirt in blue?", time: "10:42 am" },
    ],
  },
  {
    id: "c-2", name: "Bola Adeyemi", initials: "BA", phone: "+234 806 441 8270",
    preview: "I would like to check my order status.", time: "9:18 am", unread: 0,
    messages: [
      { author: "Customer", text: "I would like to check my order status.", time: "9:18 am" },
      { author: "You", text: "Of course. Please share your order number.", time: "9:20 am" },
    ],
  },
  {
    id: "c-3", name: "Chinedu Okafor", initials: "CO", phone: "+234 809 220 6315",
    preview: "Thanks, I have received the delivery.", time: "Yesterday", unread: 0,
    messages: [
      { author: "You", text: "Your order is out for delivery today.", time: "Yesterday" },
      { author: "Customer", text: "Thanks, I have received the delivery.", time: "Yesterday" },
    ],
  },
];

export function ChannelCenter({ view, storeId, isDemo }: { view: ChannelView; storeId: string; isDemo: boolean }) {
  return view === "Channels" ? <ChannelsView /> : <ConversationsView storeId={storeId} isDemo={isDemo} />;
}

function ConversationsView({ storeId, isDemo }: { storeId: string; isDemo: boolean }) {
  const [conversations, setConversations] = useState(demoConversations);
  const [activeId, setActiveId] = useState(demoConversations[0].id);
  const [messages, setMessages] = useState(demoConversations[0].messages);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");
  const active = conversations.find((conversation) => conversation.id === activeId);

  useEffect(() => {
    if (isDemo || !storeId) return;
    let current = true;
    void apiRequest<ApiConversation[]>(`/stores/${storeId}/conversations`, {}, true)
      .then((records) => {
        if (!current) return;
        const mapped = records.map((record): Conversation => {
          const name = String(record.customer?.name ?? record.customer?.phone ?? "Customer");
          const updated = new Date(record.updatedAt);
          return {
            id: record.id,
            name,
            initials: name.split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase(),
            phone: String(record.customer?.phone ?? ""),
            preview: `Conversation updated ${updated.toLocaleString()}`,
            time: updated.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
            unread: 0,
            messages: [],
          };
        });
        setConversations(mapped);
        setActiveId(mapped[0]?.id ?? "");
        setMessages([]);
        setError("");
      })
      .catch((cause) => {
        if (current) setError(cause instanceof Error ? cause.message : "Could not load conversations.");
      });
    return () => { current = false; };
  }, [isDemo, storeId]);

  useEffect(() => {
    if (isDemo || !activeId) return;
    let current = true;
    void apiRequest<ApiMessage[]>(`/conversations/${activeId}/messages`, {}, true)
      .then((records) => {
        if (!current) return;
        setMessages(records.map((record) => ({
          author: record.sender === "VENDOR" || record.sender === "AI" ? "You" : "Customer",
          text: record.body,
          time: new Date(record.createdAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
        })));
      })
      .catch((cause) => {
        if (current) setError(cause instanceof Error ? cause.message : "Could not load messages.");
      })
      .finally(() => { if (!current) return; });
    return () => { current = false; };
  }, [activeId, isDemo]);

  function selectConversation(conversation: Conversation) {
    setActiveId(conversation.id);
    if (isDemo) setMessages(conversation.messages);
  }

  function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isDemo) return;
    const text = draft.trim();
    if (!text) return;
    setMessages((current) => [...current, { author: "You", text, time: "Now" }]);
    setDraft("");
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3"><p className="text-sm text-slate-600">Customer conversations across your sales channels.</p><span className="rounded-full border border-violet-200 bg-violet-50 px-3 py-1.5 text-xs font-medium text-violet-800">{isDemo ? "Demo inbox" : "Live inbox"}</span></div>
      {error && <p role="alert" className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-800">{error}</p>}
      <section className="grid min-h-[620px] overflow-hidden rounded-xl border border-violet-100 bg-white lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="border-b border-violet-100 lg:border-b-0 lg:border-r">
          <div className="flex items-center justify-between border-b border-violet-100 px-4 py-4"><div><h2 className="text-sm font-semibold text-slate-900">Inbox</h2><p className="mt-1 text-xs text-slate-500">{isDemo ? "3 sample conversations" : `${conversations.length} conversations`}</p></div></div>
          <div className="divide-y divide-violet-50">
            {conversations.map((conversation) => <button key={conversation.id} onClick={() => selectConversation(conversation)} className={`flex w-full gap-3 px-4 py-4 text-left transition ${conversation.id === activeId ? "bg-violet-50" : "hover:bg-slate-50"}`}>
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-violet-100 text-xs font-semibold text-violet-800">{conversation.initials}</span>
              <span className="min-w-0 flex-1"><span className="flex items-center justify-between gap-2"><span className="truncate text-sm font-semibold text-slate-900">{conversation.name}</span><span className="shrink-0 text-[10px] text-slate-400">{conversation.time}</span></span><span className="mt-1 block truncate text-xs text-slate-500">{conversation.preview}</span><span className="mt-2 inline-flex items-center gap-1 text-[10px] text-emerald-700"><MessageCircle size={12} /> {isDemo ? "WhatsApp sample" : "Stored conversation"}</span></span>
              {conversation.unread > 0 && <span className="mt-5 grid size-5 shrink-0 place-items-center rounded-full bg-violet-700 text-[10px] font-semibold text-white">{conversation.unread}</span>}
            </button>)}
          </div>
        </aside>
        <div className="flex min-h-[440px] flex-col">
          {active ? <>
            <header className="flex items-center justify-between border-b border-violet-100 px-4 py-4 sm:px-6"><div className="flex min-w-0 items-center gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-full bg-violet-100 text-xs font-semibold text-violet-800">{active.initials}</span><div className="min-w-0"><h2 className="truncate text-sm font-semibold text-slate-900">{active.name}</h2><p className="mt-0.5 text-xs text-slate-500">{active.phone}</p></div></div><span className="inline-flex items-center gap-1.5 rounded-full bg-violet-50 px-2.5 py-1.5 text-[10px] font-medium text-violet-800"><MessageCircle size={12} /> {isDemo ? "WhatsApp sample" : "Conversation"}</span></header>
            <div className="flex-1 space-y-4 bg-[#fcfbff] px-4 py-5 sm:px-6"><p className="mx-auto w-fit rounded-full border border-violet-100 bg-white px-3 py-1 text-[10px] text-slate-500">{isDemo ? "Today" : "Conversation history"}</p>{messages.map((message, index) => <div key={`${activeId}-${index}`} className={`flex ${message.author === "You" ? "justify-end" : "justify-start"}`}><div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 ${message.author === "You" ? "rounded-br-sm bg-violet-700 text-white" : "rounded-bl-sm border border-violet-100 bg-white text-slate-800"}`}><p className="text-sm leading-5">{message.text}</p><p className={`mt-1 text-right text-[10px] ${message.author === "You" ? "text-violet-200" : "text-slate-400"}`}>{message.time}</p></div></div>)}</div>
            <form onSubmit={sendMessage} className="border-t border-violet-100 bg-white p-3 sm:p-4"><p className="mb-2 flex items-center gap-1.5 text-[10px] text-amber-700"><ShieldAlert size={13} /> {isDemo ? "Preview only. Replies are not sent to WhatsApp." : "Outbound messaging is not connected yet."}</p><div className="flex items-end gap-2"><textarea aria-label="Sample message" value={draft} onChange={(event) => setDraft(event.target.value)} rows={2} disabled={!isDemo} placeholder={isDemo ? "Write a sample reply..." : "Messaging unavailable"} className="min-h-10 flex-1 resize-y rounded-lg border border-violet-100 px-3 py-2 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 disabled:bg-slate-50" /><button type="submit" disabled={!isDemo || !draft.trim()} aria-label="Add sample reply" title="Add sample reply" className="grid size-10 shrink-0 place-items-center rounded-lg bg-violet-700 text-white hover:bg-violet-800 disabled:cursor-not-allowed disabled:bg-violet-200"><Send size={16} /></button></div></form>
+          </> : <div className="grid flex-1 place-items-center p-8 text-center"><div><MessageCircle className="mx-auto text-violet-300" size={28} /><p className="mt-3 text-sm font-medium text-slate-700">No conversations yet</p><p className="mt-1 text-xs text-slate-500">Connected channel messages will appear here.</p></div></div>}
        </div>
      </section>
    </div>
  );
}

function ChannelsView() {
  const channels = [
    { name: "WhatsApp Business", detail: "Connect your business number to receive customer messages and orders.", icon: Smartphone, accent: "bg-emerald-50 text-emerald-700", primary: true },
    { name: "Instagram", detail: "Bring Instagram customer conversations into the Vendora inbox.", icon: Camera, accent: "bg-pink-50 text-pink-700", primary: false },
    { name: "Telegram", detail: "Connect your Telegram bot to the shared commerce inbox.", icon: Send, accent: "bg-sky-50 text-sky-700", primary: false },
  ];

  return <div className="space-y-5"><div><p className="text-sm text-slate-600">Bring every customer conversation into one place.</p></div><div className="grid gap-4 xl:grid-cols-3">{channels.map(({ name, detail, icon: Icon, accent, primary }) => <article key={name} className={`rounded-xl border bg-white p-5 ${primary ? "border-violet-300 ring-1 ring-violet-100" : "border-violet-100"}`}><div className="flex items-start justify-between gap-3"><span className={`grid size-11 place-items-center rounded-xl ${accent}`}><Icon size={20} /></span><span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-medium text-slate-600">Not connected</span></div><h2 className="mt-5 text-base font-semibold text-slate-900">{name}</h2><p className="mt-2 min-h-10 text-xs leading-5 text-slate-500">{detail}</p><div className="mt-5 border-t border-violet-50 pt-4"><p className="text-[11px] leading-5 text-slate-500">Channel connection API is not configured in this backend yet.</p><button disabled className="mt-3 inline-flex h-9 items-center gap-2 rounded-lg border border-violet-100 bg-violet-50 px-3 text-xs font-semibold text-violet-400 disabled:cursor-not-allowed"><ArrowUpRight size={14} /> Connect channel</button></div></article>)}</div><p className="rounded-lg border border-violet-100 bg-violet-50/70 px-4 py-3 text-xs leading-5 text-violet-900">Once connected, WhatsApp, Instagram, and Telegram messages are designed to share the same customer, catalog, inventory, and order context.</p></div>;
}
