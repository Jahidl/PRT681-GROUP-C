import React from "react";
import { Routes, Route } from "react-router-dom";
import ShopLayout from "@/components/layout/ShopLayout.jsx";
import HomePage from "@/pages/HomePage.jsx";
import Login from "@/pages/Login.jsx";
import Register from "@/pages/Register.jsx";
import AdminPage from "@/pages/Admin.jsx";
import ProtectedRoute from "@/lib/ProtectedRoute.jsx";   // ⬅️ add this
import { CartProvider } from "@/lib/Cart.jsx";

export default function App() {
  return (
    <CartProvider>
      <Routes>
        <Route path="/" element={<ShopLayout />}>
          <Route index element={<HomePage />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />

          {/* Admin is only visible when logged in */}
          <Route
            path="admin"
            element={
              <ProtectedRoute>
                <AdminPage />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<HomePage />} />
        </Route>
      </Routes>
    </CartProvider>
  );
}
