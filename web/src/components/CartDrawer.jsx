import React from "react";
import { useCart } from "@/lib/cart.jsx";

export default function CartDrawer({ open, onClose }) {
  const cart = useCart();

  if (!open) return null;
  return (
    <div style={{position:"fixed", inset:0, background:"rgba(0,0,0,0.4)"}} onClick={onClose}>
      <aside
        style={{position:"absolute", right:0, top:0, bottom:0, width:360, background:"#fff", padding:16, overflow:"auto"}}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{display:"flex", justifyContent:"space-between", alignItems:"center"}}>
          <h3>Cart</h3>
          <button onClick={onClose}>✕</button>
        </div>

        {cart.items.length === 0 ? (
          <p>Cart is empty.</p>
        ) : (
          <>
            <ul style={{listStyle:"none", padding:0, margin:0, display:"grid", gap:10}}>
              {cart.items.map(i => (
                <li key={i.id} style={{display:"grid", gridTemplateColumns:"60px 1fr auto", gap:10, alignItems:"center", border:"1px solid #eee", padding:8}}>
                  <img alt="" src={i.imageUrl || ""} style={{width:60, height:60, objectFit:"cover", background:"#f3f3f3"}}/>
                  <div>
                    <div style={{fontWeight:600}}>{i.name}</div>
                    <div>${Number(i.price||0).toFixed(2)}</div>
                    <div style={{display:"flex", gap:6, alignItems:"center", marginTop:6}}>
                      <button onClick={() => cart.dec(i.id)}>-</button>
                      <span>{i.qty}</span>
                      <button onClick={() => cart.inc(i.id)}>+</button>
                      <button onClick={() => cart.remove(i.id)} style={{marginLeft:8}}>Remove</button>
                    </div>
                  </div>
                  <div style={{fontWeight:700}}>${(Number(i.price||0)*i.qty).toFixed(2)}</div>
                </li>
              ))}
            </ul>
            <div style={{display:"flex", justifyContent:"space-between", marginTop:12, fontWeight:700}}>
              <span>Subtotal</span>
              <span>${cart.subtotal.toFixed(2)}</span>
            </div>
            <button style={{width:"100%", marginTop:10, padding:"10px 12px", background:"#ffd814", border:"1px solid #fcd200", fontWeight:700}}>
              Proceed to checkout (demo)
            </button>
          </>
        )}
      </aside>
    </div>
  );
}
