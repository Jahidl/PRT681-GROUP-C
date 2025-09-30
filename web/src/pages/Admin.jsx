import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createProduct } from "@/api/products.js";

export default function AdminPage() {
  const nav = useNavigate();
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    imageUrl: "",
    sku: ""
  });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const priceNum = Number(form.price);
  const stockNum = Number(form.stock);
  const canSubmit =
    form.name.trim().length > 0 &&
    Number.isFinite(priceNum) &&
    priceNum >= 0 &&
    Number.isFinite(stockNum) &&
    stockNum >= 0;

  const previewImg = useMemo(
    () => (form.imageUrl?.trim() ? form.imageUrl.trim() : "https://placehold.co/600x450/png?text=Preview"),
    [form.imageUrl]
  );

  const update = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) return;

    setBusy(true);
    setMsg("");
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        stock: Number(form.stock),
        imageUrl: form.imageUrl.trim() || null,
        sku: form.sku.trim() || null
      };
      const created = await createProduct(payload);
      setMsg(`✅ Created: ${created?.name ?? "product"} (id: ${created?.id ?? "?"})`);
      // Go back home so the new item shows up
      setTimeout(() => nav("/"), 700);
    } catch (err) {
      setMsg(`❌ ${err.message || String(err)}`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ background:"#EAEDED", minHeight:"100vh", padding:"16px 0" }}>
      {/* Top bar (Amazon style color) */}
      <div style={{background:"#131921", color:"#fff", padding:"10px 12px"}}>
        <div style={{maxWidth:1200, margin:"0 auto", display:"flex", alignItems:"center", gap:12}}>
          <button onClick={()=>nav("/")} style={{background:"transparent", color:"#fff", border:"none", fontWeight:700, fontSize:20}}>
            ← 
          </button>
          <div style={{fontWeight:600}}>Admin · Add Product</div>
        </div>
      </div>

      {/* Content card */}
      <div style={{maxWidth:1200, margin:"16px auto", padding:"0 12px"}}>
        <div style={{display:"grid", gridTemplateColumns:"360px 1fr", gap:16}}>
          {/* Preview */}
          <div style={{background:"#fff", border:"1px solid #D5D9D9", borderRadius:8, padding:12}}>
            <div style={{fontWeight:700, marginBottom:8}}>Preview</div>
            <div style={{aspectRatio:"4/3", width:"100%", background:"#f6f6f6", display:"flex", alignItems:"center", justifyContent:"center", borderRadius:6, overflow:"hidden"}}>
              <img
                alt="Preview"
                src={previewImg}
                style={{width:"100%", height:"100%", objectFit:"cover"}}
                onError={(e)=>{ e.currentTarget.src="https://placehold.co/600x450/png?text=Preview"; }}
              />
            </div>
            <div style={{marginTop:8}}>
              <div style={{fontWeight:600}}>{form.name || "Product name"}</div>
              <div style={{marginTop:4, color:"#0F1111"}}>${Number(form.price||0).toFixed(2)}</div>
              <div style={{marginTop:4, fontSize:12, color:"#565959"}}>SKU: {form.sku || "N/A"}</div>
            </div>
          </div>

          {/* Form */}
          <form
            onSubmit={onSubmit}
            style={{background:"#fff", border:"1px solid #D5D9D9", borderRadius:8, padding:16, display:"grid", gap:12}}
          >
            <h2 style={{margin:"0 0 4px"}}>Add a new product</h2>
            <small style={{color:"#565959"}}>Fill the details below and click <b>Create</b>.</small>

            <label style={{display:"grid", gap:6}}>
              <span style={{fontWeight:600}}>Name</span>
              <input name="name" value={form.name} onChange={update} placeholder=" product name"
                     style={{padding:"8px 10px", border:"1px solid #D5D9D9", borderRadius:6}}/>
            </label>

            <label style={{display:"grid", gap:6}}>
              <span style={{fontWeight:600}}>Description</span>
              <textarea name="description" value={form.description} onChange={update} rows={4}
                        placeholder="Short description"
                        style={{padding:"8px 10px", border:"1px solid #D5D9D9", borderRadius:6}}/>
            </label>

            <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:12}}>
              <label style={{display:"grid", gap:6}}>
                <span style={{fontWeight:600}}>Price (USD)</span>
                <input name="price" type="number" step="0.01" value={form.price} onChange={update}
                       placeholder="0.00"
                       style={{padding:"8px 10px", border:"1px solid #D5D9D9", borderRadius:6}}/>
              </label>

              <label style={{display:"grid", gap:6}}>
                <span style={{fontWeight:600}}>Stock</span>
                <input name="stock" type="number" value={form.stock} onChange={update}
                       placeholder="0"
                       style={{padding:"8px 10px", border:"1px solid #D5D9D9", borderRadius:6}}/>
              </label>
            </div>

            <label style={{display:"grid", gap:6}}>
              <span style={{fontWeight:600}}>Image URL</span>
              <input name="imageUrl" value={form.imageUrl} onChange={update} placeholder="https://…"
                     style={{padding:"8px 10px", border:"1px solid #D5D9D9", borderRadius:6}}/>
            </label>

            <label style={{display:"grid", gap:6}}>
              <span style={{fontWeight:600}}>SKU</span>
              <input name="sku" value={form.sku} onChange={update} placeholder="SKU-12345"
                     style={{padding:"8px 10px", border:"1px solid #D5D9D9", borderRadius:6}}/>
            </label>

            <div style={{display:"flex", gap:10, alignItems:"center", marginTop:4}}>
              <button type="submit"
                      disabled={!canSubmit || busy}
                      style={{background:"#ffd814", border:"1px solid #fcd200", padding:"10px 14px", borderRadius:8, fontWeight:700}}>
                {busy ? "Creating…" : "Create"}
              </button>
              <button type="button" onClick={()=>nav("/")}
                      style={{background:"#fff", border:"1px solid #D5D9D9", padding:"10px 14px", borderRadius:8}}>
                Cancel
              </button>
              <span style={{marginLeft:8, color: msg.startsWith("❌") ? "#B12704" : "#0F1111"}}>{msg}</span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
