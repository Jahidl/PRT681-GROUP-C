import React, { createContext, useContext, useEffect, useMemo, useReducer } from "react";

const CartContext = createContext(null);

function reducer(state, action) {
  switch (action.type) {
    case "INIT": return action.payload || [];
    case "ADD": {
      const p = action.payload;
      const existing = state.find(i => i.id === p.id);
      return existing
        ? state.map(i => i.id === p.id ? { ...i, qty: i.qty + 1 } : i)
        : [...state, { id: p.id, name: p.name, price: p.price, imageUrl: p.imageUrl, qty: 1 }];
    }
    case "INC": return state.map(i => i.id === action.id ? { ...i, qty: i.qty + 1 } : i);
    case "DEC": return state.map(i => i.id === action.id ? { ...i, qty: Math.max(1, i.qty - 1) } : i).filter(i => i.qty > 0);
    case "REMOVE": return state.filter(i => i.id !== action.id);
    case "CLEAR": return [];
    default: return state;
  }
}

export function CartProvider({ children }) {
  const [items, dispatch] = useReducer(reducer, []);

  // hydrate from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem("cart");
      if (raw) dispatch({ type: "INIT", payload: JSON.parse(raw) });
    } catch {}
  }, []);
  // persist
  useEffect(() => {
    try { localStorage.setItem("cart", JSON.stringify(items)); } catch {}
  }, [items]);

  const api = useMemo(() => ({
    items,
    count: items.reduce((n, i) => n + i.qty, 0),
    subtotal: items.reduce((s, i) => s + i.qty * Number(i.price || 0), 0),
    add: (p) => dispatch({ type: "ADD", payload: p }),
    inc: (id) => dispatch({ type: "INC", id }),
    dec: (id) => dispatch({ type: "DEC", id }),
    remove: (id) => dispatch({ type: "REMOVE", id }),
    clear: () => dispatch({ type: "CLEAR" })
  }), [items]);

  return <CartContext.Provider value={api}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
