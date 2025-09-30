import React from "react";
import { useCart } from "@/lib/cart.jsx";

export default function ProductCard({ product }) {
  const cart = useCart();
  return (
    <div style={{border:"1px solid #eee", borderRadius:8, padding:12}}>
      <div style={{aspectRatio:"4/3", width:"100%", background:"#f6f6f6", borderRadius:6, overflow:"hidden", display:"flex", alignItems:"center", justifyContent:"center"}}>
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} style={{width:"100%", height:"100%", objectFit:"cover"}}/>
        ) : <span style={{color:"#888"}}>No image</span>}
      </div>
      <div style={{marginTop:8, fontWeight:600}}>{product.name}</div>
      <div style={{marginTop:4}}>${Number(product.price||0).toFixed(2)}</div>
      <button
        onClick={() => cart.add(product)}
        style={{marginTop:8, width:"100%", padding:"8px 10px", background:"#ffd814", border:"1px solid #fcd200", fontWeight:700}}
      >
        Add to Cart
      </button>
    </div>
  );
}
