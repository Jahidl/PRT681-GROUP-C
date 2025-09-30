import React, { useEffect, useState } from "react";
import ProductCard from "@/components/ProductCard.jsx";

const BASE =
  (import.meta.env.VITE_API_BASE_URL && import.meta.env.VITE_API_BASE_URL.replace(/\/+$/, "")) ||
  "http://localhost:8080";

async function fetchProducts() {
  const res = await fetch(`${BASE}/api/products?page=1&pageSize=24`, { credentials: "include" });
  if (!res.ok) throw new Error(await res.text().catch(() => res.statusText));
  const json = await res.json();
  return Array.isArray(json) ? json : (json?.items || []);
}

export default function HomePage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await fetchProducts();
        if (alive) setItems(data);
      } catch (e) {
        if (alive) setErr(String(e));
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  return (
    <div>
      {/* (Hero removed) */}

      <section style={{maxWidth:1200, margin:"0 auto", padding:"16px 12px 40px"}}>
        <h2 style={{margin:"6px 0 12px"}}>Products</h2>

        {loading && <div>Loading…</div>}
        {err && <div style={{color:"red"}}>{err}</div>}

        {!loading && !err && (
          items.length === 0 ? (
            <div>No products found.</div>
          ) : (
            <div style={{
              display:"grid",
              gridTemplateColumns:"repeat(auto-fill, minmax(220px, 1fr))",
              gap:12
            }}>
              {items.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )
        )}
      </section>
    </div>
  );
}
