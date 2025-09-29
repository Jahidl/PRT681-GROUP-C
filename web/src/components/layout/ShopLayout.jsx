import React, { useEffect, useMemo, useState } from "react";
import { Outlet, Link, useNavigate } from "react-router-dom";
import "../../App.css"; // bring back your original global styles

export default function ShopLayout() {
  const nav = useNavigate();

  // --- auth state (from localStorage) ---
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("user") || "null"); }
    catch { return null; }
  });

  useEffect(() => {
    const onAuth = () => {
      try { setUser(JSON.parse(localStorage.getItem("user") || "null")); }
      catch { setUser(null); }
    };
    window.addEventListener("auth-changed", onAuth);
    window.addEventListener("storage", onAuth); // cross-tab
    return () => {
      window.removeEventListener("auth-changed", onAuth);
      window.removeEventListener("storage", onAuth);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("auth-changed"));
    nav("/login");
  };

  // --- cart state (your original logic) ---
  const [cartOpen, setCartOpen] = useState(false);
  const [items, setItems] = useState([]);

  const addToCart = (p) => {
    setItems((prev) => {
      const found = prev.find((i) => i.id === p.id);
      return found
        ? prev.map((i) => (i.id === p.id ? { ...i, qty: i.qty + 1 } : i))
        : [...prev, { ...p, qty: 1 }];
    });
    setCartOpen(true);
  };

  const inc = (id) =>
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, qty: i.qty + 1 } : i)));

  const dec = (id) =>
    setItems((prev) =>
      prev
        .map((i) => (i.id === id ? { ...i, qty: Math.max(1, i.qty - 1) } : i))
        .filter((i) => i.qty > 0)
    );

  const remove = (id) => setItems((prev) => prev.filter((i) => i.id !== id));

  const subtotal = useMemo(() => items.reduce((s, i) => s + i.price * i.qty, 0), [items]);
  const cartCount = items.reduce((n, i) => n + i.qty, 0);

  return (
    <div className="app">
      {/* NAVBAR */}
      <header className="nav">
        <div className="nav__bar">
          <div className="nav__logo">
            TopEnd AgSwap
            <div style={{ fontSize: 12, fontWeight: 500, opacity: 0.8 }}>Darwin • NT</div>
          </div>

          <div className="nav__search">
            <input placeholder="Search tools..." />
            <button aria-label="Search">🔍</button>
          </div>

          <nav className="nav__links">
            <a className="nav__link" href="#">Categories</a>
            <a className="nav__link" href="#">Sell Tool</a>

            {/* auth-aware */}
            {user ? (
              <div className="nav__auth">
                <span className="nav__link">Hello, {user.firstName || "User"}</span>
                <button className="nav__link" onClick={handleLogout}>Logout</button>
              </div>
            ) : (
              <div className="nav__auth">
                <Link className="nav__link" to="/login">Login</Link>
                <Link className="nav__link" to="/register">Register</Link>
              </div>
            )}

            <button
              className="cart"
              onClick={() => setCartOpen((v) => !v)}
              aria-label="Open cart"
            >
              🛒 {cartCount > 0 && <span className="cart__badge">{cartCount}</span>}
            </button>
          </nav>
        </div>
      </header>

      {/* ROUTE CONTENT */}
      <Outlet context={{ addToCart }} />

      {/* CART DRAWER */}
      <div
        className={`drawer ${cartOpen ? "open" : ""}`}
        onClick={() => setCartOpen(false)}
      />
      <aside className={`sidepanel ${cartOpen ? "open" : ""}`}>
        <button
          className="sidepanel__close"
          onClick={() => setCartOpen(false)}
          aria-label="Close cart"
        >
          ✕
        </button>
        <div className="minicart">
          <h4>Cart</h4>
          {items.length === 0 ? (
            <p className="muted">Your cart is empty.</p>
          ) : (
            <>
              <ul className="minicart__list">
                {items.map((it) => (
                  <li key={it.id} className="minicart__item">
                    <img src={it.image} alt="" />
                    <div className="minicart__meta">
                      <div className="minicart__title" title={it.title}>
                        {it.title}
                      </div>
                      <div className="minicart__price">
                        {it.price.toLocaleString(undefined, {
                          style: "currency",
                          currency: "USD",
                        })}
                      </div>
                      <div className="qty">
                        <button onClick={() => dec(it.id)}>−</button>
                        <span>{it.qty}</span>
                        <button onClick={() => inc(it.id)}>＋</button>
                        <button
                          className="link danger"
                          onClick={() => remove(it.id)}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="minicart__footer">
                <div className="subtotal">
                  <span>Subtotal:</span>
                  <strong>
                    {subtotal.toLocaleString(undefined, {
                      style: "currency",
                      currency: "USD",
                    })}
                  </strong>
                </div>
                <button
                  className="btn btn--accent"
                  onClick={() => alert("Proceed to checkout (demo)")}
                >
                  Checkout
                </button>
              </div>
            </>
          )}
        </div>
      </aside>
    </div>
  );
}
