import { createFileRoute } from "@tanstack/react-router";
import { ImagePlus, Rewind, Send, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type CSSProperties, type ChangeEvent } from "react";
import type { User } from "@supabase/supabase-js";

import { Button } from "@/components/ui/button";
import { lovable } from "@/integrations/lovable";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Afterlight — memories for the future" },
      { name: "description", content: "A quiet place to release private memories into your future." },
      { property: "og:title", content: "Afterlight — memories for the future" },
      { property: "og:description", content: "A quiet place to release private memories into your future." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

type Memory = Tables<"memories">;
const hues = ["fuchsia", "pink", "violet", "rose", "sky", "mint", "azure"] as const;
const dayMs = 86_400_000;

function pad(value: number) { return String(value).padStart(2, "0"); }
function localDateTime(date: Date) { return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`; }
function ordinal(day: number) { return `${day}${day > 3 && day < 21 ? "th" : (["th", "st", "nd", "rd"][day % 10] ?? "th")}`; }
function longDate(value: string) { const date = new Date(value); return `${ordinal(date.getDate())} ${date.toLocaleDateString("en-GB", { month: "long" })}, ${date.getFullYear()}`; }
function clockTime(value: string) { return new Date(value).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }); }
function horizon(value: string) { const days = Math.ceil((new Date(value).getTime() - Date.now()) / dayMs); if (days <= 1) return "tomorrow"; if (days < 45) return `in ${days} days`; if (days < 730) return `in ${Math.round(days / 30)} months`; return `in ${Math.round(days / 365)} years`; }

function LiquidFilter() {
  return <svg className="liquid-filter" aria-hidden="true"><defs><filter id="afterlight-liquid" x="-40%" y="-80%" width="180%" height="260%"><feTurbulence type="fractalNoise" baseFrequency="0.014" numOctaves="2" seed="8" result="noise" /><feDisplacementMap in="SourceGraphic" in2="noise" scale="176" xChannelSelector="R" yChannelSelector="B" /></filter></defs></svg>;
}

function MemoryOrb({ memory, index, unlocked, onOpen }: { memory: Memory; index: number; unlocked: boolean; onOpen: () => void }) {
  const [whispering, setWhispering] = useState(false);
  const style = { "--x": `${12 + ((index * 29) % 76)}%`, "--y": `${14 + ((index * 37) % 68)}%`, "--size": `${5.5 + (index % 4) * 1.7}rem`, "--delay": `${index * -4.7}s`, "--depth": `${0.5 + (index % 3) * 0.2}` } as CSSProperties;
  return <button type="button" className={`memory-orb memory-${hues[index % hues.length]} ${unlocked ? "memory-unlocked" : ""}`} style={style} onClick={() => unlocked ? onOpen() : setWhispering((value) => !value)} onBlur={() => setWhispering(false)} aria-label={unlocked ? "Open memory" : `Sealed until ${longDate(memory.delivery_at)}`}><span className="orb-core" />{!unlocked && <span className={`orb-whisper ${whispering ? "is-visible" : ""}`}>{horizon(memory.delivery_at)} · {longDate(memory.delivery_at)}</span>}</button>;
}

function Index() {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [mode, setMode] = useState<"future" | "recalled">("future");
  const [message, setMessage] = useState("");
  const [delivery, setDelivery] = useState(() => localDateTime(new Date(Date.now() + dayMs)));
  const [files, setFiles] = useState<File[]>([]);
  const [releasing, setReleasing] = useState<string | null>(null);
  const [focused, setFocused] = useState<Memory | null>(null);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [error, setError] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);
  const future = useMemo(() => memories.filter((item) => new Date(item.delivery_at).getTime() > Date.now()), [memories]);
  const recalled = useMemo(() => memories.filter((item) => new Date(item.delivery_at).getTime() <= Date.now()), [memories]);

  async function loadMemories(currentUser: User) { const { data } = await supabase.from("memories").select("*").eq("user_id", currentUser.id).order("delivery_at"); setMemories(data ?? []); }

  useEffect(() => {
    let active = true;
    supabase.auth.getUser().then(({ data }) => { if (!active) return; setUser(data.user); setAuthReady(true); if (data.user) void loadMemories(data.user); });
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => { if (!["SIGNED_IN", "SIGNED_OUT", "USER_UPDATED"].includes(event)) return; setUser(session?.user ?? null); if (session?.user) void loadMemories(session.user); else setMemories([]); });
    return () => { active = false; listener.subscription.unsubscribe(); };
  }, []);

  useEffect(() => { const move = (event: PointerEvent) => { document.documentElement.style.setProperty("--pointer-x", `${(event.clientX / window.innerWidth - .5) * 1.2}rem`); document.documentElement.style.setProperty("--pointer-y", `${(event.clientY / window.innerHeight - .5) * 1.2}rem`); }; window.addEventListener("pointermove", move, { passive: true }); return () => window.removeEventListener("pointermove", move); }, []);

  async function signIn() { setError(""); const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin, extraParams: { prompt: "select_account" } }); if (result.error) setError("The door did not open. Please try once more."); }
  function chooseImages(event: ChangeEvent<HTMLInputElement>) { setFiles(Array.from(event.target.files ?? []).slice(0, 2)); }
  function toggleMeridiem() { const date = new Date(delivery); date.setHours((date.getHours() + 12) % 24); setDelivery(localDateTime(date)); }

  async function release() {
    if (!user || !message.trim() || releasing) return;
    const target = new Date(delivery);
    if (target.getTime() < Date.now() + dayMs || target.getTime() > Date.now() + 50 * 365.25 * dayMs) { setError("Choose a moment from tomorrow to fifty years ahead."); return; }
    const memoryId = crypto.randomUUID(); const words = message.trim(); const paths: string[] = []; setReleasing(words); setError("");
    try {
      for (const [index, file] of files.entries()) { const extension = file.name.split(".").pop()?.replace(/[^a-zA-Z0-9]/g, "") || "jpg"; const path = `${user.id}/${memoryId}/${index}.${extension}`; const { error: uploadError } = await supabase.storage.from("memory-images").upload(path, file); if (uploadError) throw uploadError; paths.push(path); }
      const { error: insertError } = await supabase.from("memories").insert({ id: memoryId, user_id: user.id, message: words, delivery_at: target.toISOString(), image_paths: paths }); if (insertError) throw insertError;
      await new Promise((resolve) => window.setTimeout(resolve, 2100)); setMessage(""); setFiles([]); if (fileInput.current) fileInput.current.value = ""; await loadMemories(user);
    } catch { if (paths.length) await supabase.storage.from("memory-images").remove(paths); setError("This memory could not be released. Please try again."); } finally { setReleasing(null); }
  }

  async function openMemory(memory: Memory) { setFocused(memory); if (!memory.image_paths.length) { setPhotoUrls([]); return; } const { data } = await supabase.storage.from("memory-images").createSignedUrls(memory.image_paths, 600); setPhotoUrls((data ?? []).flatMap((item) => item.signedUrl ? [item.signedUrl] : [])); }

  if (!authReady) return <main className="afterlight-room"><LiquidFilter /></main>;
  return <main className="afterlight-room" onClick={() => focused && setFocused(null)}>
    <LiquidFilter />
    {user && <Button type="button" variant="ghost" size="icon" className={`rewind-button ${mode === "recalled" ? "is-active" : ""}`} onClick={(event) => { event.stopPropagation(); setFocused(null); setMode((value) => value === "future" ? "recalled" : "future"); }} aria-label={mode === "future" ? "Open arrived memories" : "Return to future memories"} title={mode === "future" ? "Recollections" : "Return"}><Rewind strokeWidth={1.35} /></Button>}
    <div className="constellation" aria-hidden={!user}>{(mode === "future" ? future : recalled).map((memory, index) => <MemoryOrb key={memory.id} memory={memory} index={index} unlocked={mode === "recalled"} onOpen={() => void openMemory(memory)} />)}</div>
    {mode === "future" && <section className={`composer-shell ${user ? "is-composer" : "is-gate"}`} aria-label={user ? "Release a memory" : "Enter Afterlight"}>
      <span className="liquid-layer" />
      {!user ? <Button type="button" className="google-button" onClick={() => void signIn()}><span className="google-mark" aria-hidden="true">G</span>Continue with Google</Button> : <div className="composer-content">
        <textarea value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Leave something here…" maxLength={4000} aria-label="Memory" />
        <div className="composer-actions"><div className="date-control">
          <label className="date-face"><span>{longDate(delivery)}</span><input type="date" min={localDateTime(new Date(Date.now() + dayMs)).slice(0, 10)} max={localDateTime(new Date(Date.now() + 50 * 365.25 * dayMs)).slice(0, 10)} value={delivery.slice(0, 10)} onChange={(event) => setDelivery(`${event.target.value}T${delivery.slice(11, 16)}`)} aria-label="Delivery date" /></label>
          <label className="time-face"><span>{clockTime(delivery).slice(0, 5)}</span><input type="time" value={delivery.slice(11, 16)} onChange={(event) => setDelivery(`${delivery.slice(0, 10)}T${event.target.value}`)} aria-label="Delivery time" /></label>
          <Button type="button" variant="ghost" className="meridiem" onClick={toggleMeridiem}>{clockTime(delivery).slice(-2)}</Button>
        </div><input ref={fileInput} className="file-input" type="file" accept="image/*" multiple onChange={chooseImages} aria-label="Attach up to two images" /><Button type="button" variant="ghost" size="icon" className="glass-icon" onClick={() => fileInput.current?.click()} aria-label="Attach images" title="Attach images"><ImagePlus strokeWidth={1.35} /></Button><Button type="button" size="icon" className="release-button" onClick={() => void release()} disabled={!message.trim() || Boolean(releasing)} aria-label="Release memory" title="Release"><Send strokeWidth={1.35} /></Button></div>
        {files.length > 0 && <div className="attachments">{files.map((file) => <span key={file.name}>{file.name}</span>)}</div>}
      </div>}
      {error && <p className="quiet-error" role="alert">{error}</p>}
    </section>}
    {releasing && <div className="release-entity">{releasing}</div>}
    {focused && <article className="recollection" onClick={(event) => event.stopPropagation()}><span className="liquid-layer" /><Button type="button" variant="ghost" size="icon" className="memory-close" onClick={() => setFocused(null)} aria-label="Close memory"><X strokeWidth={1.25} /></Button><p>{focused.message}</p>{photoUrls.length > 0 && <div className={`memory-photos photos-${photoUrls.length}`}>{photoUrls.map((url) => <img key={url} src={url} alt="Attached recollection" />)}</div>}<time>{longDate(focused.created_at)}</time></article>}
  </main>;
}