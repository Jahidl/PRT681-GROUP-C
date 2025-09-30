import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "@/components/NavBar.jsx";
import CartDrawer from "@/components/CartDrawer.jsx";

export default function ShopLayout() {
  const [cartOpen, setCartOpen] = useState(false);
  return (
    <div>
      <Navbar onToggleCart={() => setCartOpen(v => !v)} />
      <main>
        <Outlet />
      </main>
      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}
