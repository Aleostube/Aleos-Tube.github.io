import React, { useEffect, useMemo, useState } from "react";
// Futuristic Auto-Adaptive Blog Layout Component
// Single-file React component (default export) using Tailwind CSS
// Features:
// - Responsive, auto-adaptive grid (masonry on wide, single column on mobile)
// - Smart ordering: prioritizes featured / affiliate / trending posts
// - Age-gate for adult stories (simple confirm + DOB fallback)
// - Affiliate cards with disclosure and CTA
// - Lazy loading, IntersectionObserver for images
// - Accessible keyboard interactions
// - Small, modular helpers inside the file for demo purposes

// NOTE: This file is a starting point. Integrate with your app's router, state
// management, and analytics as needed.

// --- Mock data types ---
const MOCK_POSTS = [
  {
    id: "p1",
    type: "post",
    title: "10 Futuristic UI Patterns You Need",
    excerpt: "Design patterns that will define 2030+ interfaces.",
    featured: true,
    affiliate: false,
    adult: false,
    image: "https://picsum.photos/600/400?random=1",
    score: 92,
  },
  {
    id: "a1",
    type: "affiliate",
    title: "Aleo's Tube Store — Pro Camera Kit",
    excerpt: "Best kit for creators on a budget.",
    affiliate: true,
    featured: false,
    adult: false,
    image: "https://picsum.photos/600/800?random=2",
    score: 86,
  },
  {
    id: "s1",
    type: "story",
    title: "Midnight Confessions (Adult)",
    excerpt: "A mature short story exploring intimacy and regret.",
    featured: false,
    affiliate: false,
    adult: true,
    image: "https://picsum.photos/600/700?random=3",
    score: 75,
  },
  // ...more items
];

// --- Utilities ---
function clamp(val, a, b) {
  return Math.max(a, Math.min(b, val));
}

function useViewport() {
  const [vw, setVw] = useState(typeof window !== "undefined" ? window.innerWidth : 1200);
  useEffect(() => {
    const onResize = () => setVw(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return vw;
}

// Age gate helper: persistent via localStorage
const AGE_KEY = "_age_confirmed_v1";
function checkAgeConfirmed() {
  try {
    return localStorage.getItem(AGE_KEY) === "1";
  } catch (e) {
    return false;
  }
}
function setAgeConfirmed() {
  try {
    localStorage.setItem(AGE_KEY, "1");
  } catch (e) {}
}

// Image lazy hook
function useLazyLoadImage(imgRef) {
  useEffect(() => {
    if (!imgRef.current) return;
    const el = imgRef.current;
    if ('loading' in HTMLImageElement.prototype) {
      // browser native lazy loading works
      el.loading = 'lazy';
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          el.src = el.dataset.src;
          io.unobserve(el);
        }
      });
    });
    io.observe(el);
    return () => io.disconnect();
  }, [imgRef]);
}

// Smart ordering algorithm — simple weighted score using metadata + viewport
function smartOrder(items, viewportWidth) {
  // weights: featured > affiliate > score > recency (not in mock)
  const wFeatured = viewportWidth > 900 ? 3 : 2;
  const wAffiliate = 1.6;
  const wAdult = 0.6; // deprioritize adult content slightly on mixed feeds

  return [...items].sort((a, b) => {
    const sa = (a.featured ? wFeatured : 0) + (a.affiliate ? wAffiliate : 0) + (a.score || 0) * 0.01 + (a.adult ? -wAdult : 0);
    const sb = (b.featured ? wFeatured : 0) + (b.affiliate ? wAffiliate : 0) + (b.score || 0) * 0.01 + (b.adult ? -wAdult : 0);
    return sb - sa;
  });
}

// --- UI components ---
function AgeGateModal({ onConfirm, onCancel }) {
  const [dob, setDob] = useState("");
  const [error, setError] = useState("");

  function submit() {
    if (!dob) return setError("Masukkan tanggal lahir atau konfirmasi umur.");
    const d = new Date(dob);
    if (isNaN(d.getTime())) return setError("Tanggal tidak valid.");
    const age = (Date.now() - d.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    if (age >= 18) {
      setAgeConfirmed();
      onConfirm();
    } else {
      setError("Anda harus berusia 18+ untuk melihat konten ini.");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} />
      <div className="relative bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <h3 className="text-xl font-semibold">Konten Dewasa</h3>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">Konfirmasi bahwa Anda berusia 18 tahun atau lebih untuk melanjutkan.</p>
        <div className="mt-4">
          <label className="block text-xs font-medium">Tanggal lahir</label>
          <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} className="mt-1 w-full rounded-md border p-2" />
        </div>
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        <div className="mt-4 flex gap-2 justify-end">
          <button onClick={onCancel} className="px-3 py-2 rounded-md border">Batal</button>
          <button onClick={submit} className="px-3 py-2 rounded-md bg-indigo-600 text-white">Konfirmasi</button>
        </div>
      </div>
    </div>
  );
}

function PostCard({ item, onOpen }) {
  const imgRef = React.useRef(null);
  useLazyLoadImage(imgRef);

  return (
    <article className={`rounded-2xl overflow-hidden shadow-lg bg-white dark:bg-gray-800`} tabIndex={0} aria-labelledby={`title-${item.id}`}>  
      <div className={`relative ${item.featured ? "h-56 md:h-64" : "h-48"}`}>  
        <img ref={imgRef} data-src={item.image} alt={item.title} className="w-full h-full object-cover" src={item.image} />
        {item.affiliate && (
          <span className="absolute top-3 left-3 bg-yellow-400 text-black px-2 py-1 rounded-md text-xs font-semibold">Affiliate</span>
        )}
        {item.adult && (
          <span className="absolute top-3 right-3 bg-red-600 text-white px-2 py-1 rounded-md text-xs font-semibold">18+</span>
        )}
      </div>
      <div className="p-4">
        <h4 id={`title-${item.id}`} className="font-semibold text-lg">{item.title}</h4>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{item.excerpt}</p>
        <div className="mt-3 flex items-center justify-between">
          <div className="text-xs text-gray-500">Score: {item.score}</div>
          <div>
            {item.affiliate ? (
              <a href="#" onClick={(e) => { e.preventDefault(); onOpen(item); }} className="px-3 py-1 rounded-md border text-sm">Lihat Penawaran</a>
            ) : (
              <button onClick={() => onOpen(item)} className="px-3 py-1 rounded-md border text-sm">Baca</button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

// Sidebar / sticky affiliate area for desktop
function Sidebar({ affiliates }) {
  return (
    <aside className="hidden lg:flex lg:flex-col lg:gap-4 lg:w-80">
      <div className="sticky top-24 space-y-4">
        {affiliates.map((a) => (
          <div key={a.id} className="rounded-2xl p-4 bg-gradient-to-br from-white to-gray-50 shadow">  
            <h5 className="font-semibold">{a.title}</h5>
            <p className="text-sm mt-2 text-gray-600">{a.excerpt}</p>
            <a href="#" className="mt-3 inline-block text-sm font-medium underline">Affiliate Disclosure</a>
          </div>
        ))}
      </div>
    </aside>
  );
}

// Main exported component
export default function FuturisticAutoAdaptiveLayout({ posts = MOCK_POSTS }) {
  const vw = useViewport();
  const [showAgeGate, setShowAgeGate] = useState(false);
  const [agePendingItem, setAgePendingItem] = useState(null);
  const [modalOpenItem, setModalOpenItem] = useState(null);

  const confirmed = useMemo(() => checkAgeConfirmed(), [showAgeGate]);

  useEffect(() => {
    if (agePendingItem && !confirmed) {
      setShowAgeGate(true);
    }
  }, [agePendingItem, confirmed]);

  const ordered = useMemo(() => smartOrder(posts, vw), [posts, vw]);

  // split out affiliates for sidebar
  const affiliates = ordered.filter((p) => p.affiliate).slice(0, 3);

  function handleOpen(item) {
    if (item.adult && !checkAgeConfirmed()) {
      setAgePendingItem(item);
      setShowAgeGate(true);
      return;
    }
    setModalOpenItem(item);
  }

  function confirmAge() {
    setAgeConfirmed();
    setShowAgeGate(false);
    if (agePendingItem) {
      setModalOpenItem(agePendingItem);
      setAgePendingItem(null);
    }
  }

  function cancelAge() {
    setShowAgeGate(false);
    setAgePendingItem(null);
  }

  // choose layout: masonry for wide, grid for medium, single column for small
  const layout = vw > 1200 ? "masonry" : vw > 700 ? "grid" : "single";

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Aleo's Futuristic Blog</h1>
          <div className="text-sm text-gray-600">Mode: {layout}</div>
        </header>

        <div className="lg:flex lg:gap-6">
          <main className="flex-1">
            {/* Controls */}
            <div className="mb-4 flex items-center gap-3">
              <input placeholder="Cari..." className="flex-1 rounded-full border px-4 py-2" />
              <select className="rounded-md border px-3 py-2">
                <option>Terbaru</option>
                <option>Terpopuler</option>
                <option>Affiliate</option>
              </select>
            </div>

            {/* Feed */}
            {layout === "single" && (
              <div className="space-y-6">
                {ordered.map((it) => (
                  <PostCard key={it.id} item={it} onOpen={handleOpen} />
                ))}
              </div>
            )}

            {layout === "grid" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {ordered.map((it) => (
                  <PostCard key={it.id} item={it} onOpen={handleOpen} />
                ))}
              </div>
            )}

            {layout === "masonry" && (
              // CSS-only masonry using column-count plus break-inside to avoid JS libs
              <div style={{ columnCount: 3, columnGap: 24 }}>
                {ordered.map((it) => (
                  <div key={it.id} style={{ breakInside: "avoid", marginBottom: 24 }}>
                    <PostCard item={it} onOpen={handleOpen} />
                  </div>
                ))}
              </div>
            )}
          </main>

          <Sidebar affiliates={affiliates} />
        </div>

        {/* Simple modal for opened item */}
        {modalOpenItem && (
          <div className="fixed inset-0 z-40 flex items-center justify-center p-4">  
            <div className="absolute inset-0 bg-black/50" onClick={() => setModalOpenItem(null)} />
            <div className="relative max-w-3xl w-full rounded-2xl bg-white dark:bg-gray-900 p-6">  
              <h2 className="text-xl font-semibold">{modalOpenItem.title}</h2>
              <p className="mt-3 text-sm text-gray-600">{modalOpenItem.excerpt}</p>
              <div className="mt-4 flex justify-end">
                <button onClick={() => setModalOpenItem(null)} className="px-3 py-2 rounded-md border">Tutup</button>
              </div>
            </div>
          </div>
        )}

        {showAgeGate && <AgeGateModal onConfirm={confirmAge} onCancel={cancelAge} />}
      </div>
    </div>
  );
}