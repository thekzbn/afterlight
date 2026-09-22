import { createFileRoute } from "@tanstack/react-router";
import { Clock3, ImagePlus, Rewind, Send, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState, type CSSProperties, type ChangeEvent, type DragEvent } from "react";
import type { User } from "@supabase/supabase-js";

import { Button } from "@/components/ui/button";
import { lovable } from "@/integrations/lovable";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Afterlight — memories for the future" },
    { name: "description", content: "A quiet place to release private memories into your future." },
    { property: "og:title", content: "Afterlight — memories for the future" },
    { property: "og:description", content: "A quiet place to release private memories into your future." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
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
function horizon(value: string) { const days = Math.ceil((new Date(value).getTime() - Date.now()) / dayMs); if (days <= 0) return "arrived"; if (days === 1) return "tomorrow"; if (days < 45) return `in ${days} days`; if (days < 730) return `in ${Math.round(days / 30)} months`; return `in ${Math.round(days / 365)} years`; }

function parseDateText(value: string, base: Date) {
  const clean = value.trim().replace(/(\d)(st|nd|rd|th)/gi, "$1");
  const parsed = new Date(clean);
  if (Number.isNaN(parsed.getTime())) return null;
  parsed.setHours(base.getHours(), base.getMinutes(), 0, 0);
  return parsed;
}

function parseTimeText(value: string, base: Date) {
  const match = value.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/i);
  if (!match) return null;
  let hours = Number(match[1]); const minutes = Number(match[2] ?? 0); const meridiem = match[3]?.toLowerCase();
  if (minutes > 59 || hours > (meridiem ? 12 : 23)) return null;
  if (meridiem === "pm" && hours < 12) hours += 12;
  if (meridiem === "am" && hours === 12) hours = 0;
  const parsed = new Date(base); parsed.setHours(hours, minutes, 0, 0); return parsed;
}

function LiquidFilter() { return <svg className="liquid-filter" aria-hidden="true"><defs><filter id="afterlight-liquid" x="-40%" y="-80%" width="180%" height="260%"><feTurbulence type="fractalNoise" baseFrequency="0.014" numOctaves="2" seed="8" result="noise" /><feDisplacementMap in="SourceGraphic" in2="noise" scale="176" xChannelSelector="R" yChannelSelector="B" /></filter></defs></svg>; }

function MemoryOrb({ memory, index, unlocked, entering, onOpen }: { memory: Memory; index: number; unlocked: boolean; entering: boolean; onOpen: (origin?: { x: number; y: number; width: number; height: number }) => void }) {
  const [whispering, setWhispering] = useState(false);
  const orbRef = useRef<HTMLButtonElement>(null);
  const style = { "--x": `${12 + ((index * 29) % 76)}%`, "--y": `${14 + ((index * 37) % 68)}%`, "--size": `${4.4 + (index % 4) * 1.35}rem`, "--delay": `${index * -4.1}s`, "--depth": `${0.5 + (index % 3) * 0.2}` } as CSSProperties;
  
  const handleClick = () => {
    if (unlocked) {
      if (orbRef.current) {
        const rect = orbRef.current.getBoundingClientRect();
        onOpen({
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2,
          width: rect.width,
          height: rect.height,
        });
      } else {
        onOpen();
      }
    } else {
      setWhispering((value) => !value);
    }
  };

  return <button ref={orbRef} type="button" className={`memory-orb memory-${hues[index % hues.length]} ${unlocked ? "memory-unlocked" : ""} ${entering ? "memory-entering" : ""}`} style={style} onClick={handleClick} onBlur={() => setWhispering(false)} aria-label={unlocked ? "Open memory" : `Sealed until ${longDate(memory.delivery_at)}`}><span className="orb-core" />{unlocked ? <span className="orb-open-hint">open</span> : <span className={`orb-whisper ${whispering ? "is-visible" : ""}`}>{horizon(memory.delivery_at)} · {longDate(memory.delivery_at)}</span>}</button>;
}

function Index() {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [mode, setMode] = useState<"future" | "recalled">("future");
  const [roomTransitioning, setRoomTransitioning] = useState(false);
  const [message, setMessage] = useState("");
  const [delivery, setDelivery] = useState(() => localDateTime(new Date(Date.now() + dayMs)));
  const [dateText, setDateText] = useState(() => longDate(localDateTime(new Date(Date.now() + dayMs))));
  const [timeText, setTimeText] = useState(() => clockTime(localDateTime(new Date(Date.now() + dayMs))));
  const [timeOpen, setTimeOpen] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [dragging, setDragging] = useState(false);
  const [enteringId, setEnteringId] = useState<string | null>(null);
  const [focused, setFocused] = useState<{ memory: Memory; hue: string; origin?: { x: number; y: number; width: number; height: number } } | null>(null);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [error, setError] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);
  const previewUrls = useMemo(() => files.map((file) => URL.createObjectURL(file)), [files]);
  useEffect(() => () => previewUrls.forEach(URL.revokeObjectURL), [previewUrls]);
  const future = useMemo(() => memories.filter((item) => item.id === enteringId || new Date(item.delivery_at).getTime() > Date.now()), [memories, enteringId]);
  const recalled = useMemo(() => memories.filter((item) => new Date(item.delivery_at).getTime() <= Date.now()), [memories]);

  async function loadMemories(currentUser: User) { const { data } = await supabase.from("memories").select("*").eq("user_id", currentUser.id).order("delivery_at"); setMemories(data ?? []); }
  useEffect(() => { let active = true; supabase.auth.getUser().then(({ data }) => { if (!active) return; setUser(data.user); setAuthReady(true); if (data.user) void loadMemories(data.user); }); const { data: listener } = supabase.auth.onAuthStateChange((event, session) => { if (!["SIGNED_IN", "SIGNED_OUT", "USER_UPDATED"].includes(event)) return; setUser(session?.user ?? null); if (session?.user) void loadMemories(session.user); else setMemories([]); }); return () => { active = false; listener.subscription.unsubscribe(); }; }, []);
  useEffect(() => { const move = (event: PointerEvent) => { document.documentElement.style.setProperty("--pointer-x", `${(event.clientX / window.innerWidth - .5) * 1.2}rem`); document.documentElement.style.setProperty("--pointer-y", `${(event.clientY / window.innerHeight - .5) * 1.2}rem`); }; window.addEventListener("pointermove", move, { passive: true }); return () => window.removeEventListener("pointermove", move); }, []);

  async function signIn() { setError(""); const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: window.location.origin, extraParams: { prompt: "select_account" } }); if (result.error) setError("The door did not open. Please try once more."); }
  function acceptFiles(items: File[]) { setFiles(items.filter((file) => file.type.startsWith("image/")).slice(0, 2)); setDragging(false); }
  function chooseImages(event: ChangeEvent<HTMLInputElement>) { acceptFiles(Array.from(event.target.files ?? [])); }
  function onDrop(event: DragEvent) { event.preventDefault(); acceptFiles(Array.from(event.dataTransfer.files)); }
  function applyDate() { const parsed = parseDateText(dateText, new Date(delivery)); if (!parsed) { setError("That date is still out of focus."); return; } setDelivery(localDateTime(parsed)); setDateText(longDate(localDateTime(parsed))); setError(""); }
  function applyTime() { const parsed = parseTimeText(timeText, new Date(delivery)); if (!parsed) { setError("That time is still out of focus."); return; } setDelivery(localDateTime(parsed)); setTimeText(clockTime(localDateTime(parsed))); setError(""); }

  async function release() {
    if (!user || !message.trim() || enteringId) return;
    const target = new Date(delivery); const isTest = /<<\/?test>>/i.test(message);
    if (!isTest && (target.getTime() < Date.now() + dayMs || target.getTime() > Date.now() + 50 * 365.25 * dayMs)) { setError("Choose a moment from tomorrow to fifty years ahead."); return; }
    if (Number.isNaN(target.getTime())) { setError("The delivery moment is still out of focus."); return; }
    const memoryId = crypto.randomUUID(); const words = message.trim(); const paths: string[] = []; setError("");
    try {
      for (const [index, file] of files.entries()) { const extension = file.name.split(".").pop()?.replace(/[^a-zA-Z0-9]/g, "") || "jpg"; const path = `${user.id}/${memoryId}/${index}.${extension}`; const { error: uploadError } = await supabase.storage.from("memory-images").upload(path, file); if (uploadError) throw uploadError; paths.push(path); }
      const createdAt = new Date().toISOString(); const { error: insertError } = await supabase.from("memories").insert({ id: memoryId, user_id: user.id, message: words, delivery_at: target.toISOString(), image_paths: paths }); if (insertError) throw insertError;
      const newMemory: Memory = { id: memoryId, user_id: user.id, message: words, delivery_at: target.toISOString(), image_paths: paths, created_at: createdAt };
      setEnteringId(memoryId); setMemories((current) => [...current, newMemory].sort((a, b) => a.delivery_at.localeCompare(b.delivery_at))); setMessage(""); setFiles([]); if (fileInput.current) fileInput.current.value = "";
      window.setTimeout(() => setEnteringId(null), 1900);
    } catch { if (paths.length) await supabase.storage.from("memory-images").remove(paths); setError("This memory could not be released. Please try again."); setEnteringId(null); }
  }
  async function openMemory(memory: Memory, hue: string, origin?: { x: number; y: number; width: number; height: number }) {
    setFocused({ memory, hue, origin });
    if (!memory.image_paths.length) {
      setPhotoUrls([]);
      return;
    }
    const { data } = await supabase.storage.from("memory-images").createSignedUrls(memory.image_paths, 600);
    setPhotoUrls((data ?? []).flatMap((item) => (item.signedUrl ? [item.signedUrl] : [])));
  }
  function changeRoom() {
    if (roomTransitioning) return;
    setFocused(null); setRoomTransitioning(true);
    window.setTimeout(() => setMode((value) => value === "future" ? "recalled" : "future"), 360);
    window.setTimeout(() => setRoomTransitioning(false), 760);
  }
  if (!authReady) return <main className="afterlight-room"><LiquidFilter /></main>;

  return <main className="afterlight-room" onClick={() => focused && setFocused(null)}>
    <LiquidFilter />
    {user && <Button type="button" variant="ghost" size="icon" className={`rewind-button ${mode === "recalled" ? "is-active" : ""}`} onClick={(event) => { event.stopPropagation(); changeRoom(); }} disabled={roomTransitioning} aria-label={mode === "future" ? "Open arrived memories" : "Return to future memories"} title={mode === "future" ? "Recollections" : "Return"}><span className="liquid-layer" /><Rewind strokeWidth={1.35} /></Button>}
    <div className={`room-scene ${roomTransitioning ? "is-transitioning" : ""}`}>
    <div className="constellation" aria-hidden={!user}>{(mode === "future" ? future : recalled).map((memory, index) => <MemoryOrb key={memory.id} memory={memory} index={index} unlocked={mode === "recalled"} entering={memory.id === enteringId} onOpen={(origin) => void openMemory(memory, hues[index % hues.length] ?? "violet", origin)} />)}</div>
    {mode === "future" && <section className={`composer-shell ${user ? "is-composer" : "is-gate"} ${dragging ? "is-dragging" : ""} ${files.length ? "has-images" : ""}`} onDragEnter={(event) => { event.preventDefault(); setDragging(true); }} onDragOver={(event) => event.preventDefault()} onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDragging(false); }} onDrop={onDrop} aria-label={user ? "Release a memory" : "Enter Afterlight"}>
      <span className="liquid-layer" />
      {!user ? <Button type="button" className="google-button" onClick={() => void signIn()}><span className="google-mark" aria-hidden="true">G</span>Continue with Google</Button> : <div className="composer-content">
        {previewUrls.length > 0 && <div className="composer-previews">{previewUrls.map((url, index) => <div className="composer-preview" key={url}><img src={url} alt={`Attachment ${index + 1}`} /><Button type="button" variant="ghost" size="icon" onClick={() => setFiles((current) => current.filter((_, fileIndex) => fileIndex !== index))} aria-label={`Remove attachment ${index + 1}`}><X /></Button></div>)}</div>}
        <div className={`composer-line${timeOpen ? " is-time-open" : ""}`}><input className="message-field" value={message} onChange={(event) => setMessage(event.target.value)} placeholder={dragging ? "Let it fall here…" : "Leave something here…"} maxLength={4000} aria-label="Memory" />
          <div className={`time-slide${timeOpen ? " is-open" : ""}`}><input type="text" value={dateText} onChange={(event) => setDateText(event.target.value)} onBlur={applyDate} onKeyDown={(event) => event.key === "Enter" && applyDate()} aria-label="Delivery date" /><input type="text" value={timeText} onChange={(event) => setTimeText(event.target.value)} onBlur={applyTime} onKeyDown={(event) => event.key === "Enter" && applyTime()} aria-label="Delivery time" /></div>
          <input ref={fileInput} className="file-input" type="file" accept="image/*" multiple onChange={chooseImages} aria-label="Attach up to two images" />
          <Button type="button" variant="ghost" size="icon" className={`glass-icon clock-icon${timeOpen ? " is-active" : ""}`} onClick={() => setTimeOpen((value) => !value)} aria-label="Set delivery time" title="Set delivery time"><Clock3 strokeWidth={1.35} /></Button>
          <Button type="button" variant="ghost" size="icon" className="glass-icon" onClick={() => fileInput.current?.click()} aria-label="Attach images" title="Attach images"><ImagePlus strokeWidth={1.35} /></Button>
          <Button type="button" size="icon" className="release-button" onClick={() => void release()} disabled={!message.trim() || Boolean(enteringId)} aria-label="Release memory" title="Release"><Send strokeWidth={1.35} /></Button>
        </div>
      </div>}
      {error && <p className="quiet-error" role="alert">{error}</p>}
    </section>}
    </div>
    {focused && <article className={`recollection memory-${focused.hue}`} style={{ "--origin-x": `${focused.origin?.x ?? window.innerWidth / 2}px`, "--origin-y": `${focused.origin?.y ?? window.innerHeight / 2}px`, "--origin-w": `${focused.origin?.width ?? 80}px`, "--origin-h": `${focused.origin?.height ?? 80}px` } as CSSProperties} onClick={(event) => event.stopPropagation()}><span className="liquid-layer" /><Button type="button" variant="ghost" size="icon" className="memory-close" onClick={() => setFocused(null)} aria-label="Close memory"><X strokeWidth={1.25} /></Button><div className="recollection-scroll"><p>{focused.memory.message}</p>{photoUrls.length > 0 && <div className={`memory-photos photos-${photoUrls.length}`}>{photoUrls.map((url) => <img key={url} src={url} alt="Attached recollection" />)}</div>}<time>{longDate(focused.memory.created_at)}</time></div></article>}
  </main>;
}
