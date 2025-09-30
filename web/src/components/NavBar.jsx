import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "@/lib/cart.jsx";

export default function Navbar({ onToggleCart }) {
  const cart = useCart();
  const nav = useNavigate();

  let user = null;
  try { user = JSON.parse(localStorage.getItem("user") || "null"); } catch {}
  const token = localStorage.getItem("token");
  const isLoggedIn = Boolean(token);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    nav("/login");
  };

  return (
    <header className="nav">
      <div className="nav__bar">
        {/* Brand */}
        <div className="nav__brand">
          <Link to="/" className="nav__brandLink">
            <span className="nav__brandMark">📚</span>
            <span className="nav__brandText">TopEnd Books</span>
          </Link>
        </div>

        {/* Search */}
        <form className="nav__search" onSubmit={(e) => e.preventDefault()}>
          <input
            className="nav__searchInput"
            placeholder="Search books, authors, ISBN…"
            aria-label="Search"
          />
          <button className="nav__searchBtn" aria-label="Search">Search</button>
        </form>

        {/* Links / Auth / Cart */}
        <nav className="nav__links">
          {isLoggedIn ? (
            <>
              <span className="nav__hello">Hello, {(user && user.firstName) || "Reader"}</span>
              <Link to="/admin" className="nav__link">Admin</Link>
              <button className="nav__btn" onClick={logout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="nav__link">Login</Link>
              <Link to="/register" className="nav__link">Register</Link>
            </>
          )}

          <button className="nav__cartBtn" onClick={onToggleCart} aria-label="Open cart">
            <span className="nav__cartIcon">🛒</span>
            <span>Cart</span>
            {cart.count > 0 && <span className="nav__cartBadge">{cart.count}</span>}
          </button>
        </nav>
      </div>
    </header>
  );
}
