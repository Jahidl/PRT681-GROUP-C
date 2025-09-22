import { useEffect, useState } from "react";
import { listProducts } from "../lib/api";

export default function Books() {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ items: [], total: 0, page: 1, pageSize: 12 });
  const pageSize = 12;

  useEffect(() => {
    (async () => {
      const res = await listProducts({ q, page, pageSize, sort: "new" });
      setData(res);
    })();
  }, [q, page]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex items-center gap-3">
        <input
          className="w-full rounded-xl border border-stone-300 px-3 py-2"
          placeholder="Search books, authors…"
          value={q}
          onChange={(e) => { setPage(1); setQ(e.target.value); }}
        />
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {data.items.map(p => (
          <div key={p.id} className="rounded-xl border border-stone-200 bg-white p-3 shadow-sm">
            <div className="aspect-[3/4] w-full overflow-hidden rounded-lg bg-stone-100">
              {p.imageUrl ? (
                <img src={p.imageUrl} alt={p.title} className="h-full w-full object-cover" />
              ) : null}
            </div>
            <h3 className="mt-3 line-clamp-2 text-sm font-semibold text-stone-800">{p.title}</h3>
            {p.author && <p className="text-xs text-stone-500">{p.author}</p>}
            <div className="mt-2 text-amber-700 font-semibold">${p.price.toFixed(2)}</div>
          </div>
        ))}
      </div>

      {/* pager */}
      <div className="mt-6 flex items-center justify-center gap-2">
        <button
          className="rounded-lg border px-3 py-1 disabled:opacity-50"
          disabled={page <= 1}
          onClick={() => setPage(p => Math.max(1, p - 1))}
        >
          Prev
        </button>
        <span className="text-sm text-stone-600">
          Page {data.page} / {Math.max(1, Math.ceil(data.total / data.pageSize || 1))}
        </span>
        <button
          className="rounded-lg border px-3 py-1 disabled:opacity-50"
          disabled={data.page * data.pageSize >= data.total}
          onClick={() => setPage(p => p + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
