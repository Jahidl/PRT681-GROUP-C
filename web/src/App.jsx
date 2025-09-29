import React from "react";
import { Routes, Route } from "react-router-dom";
import ShopLayout from "@/components/layout/ShopLayout.jsx";
import HomePage from "@/pages/HomePage.jsx";
import Login from "@/pages/Login.jsx";
import Register from "@/pages/Register.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<ShopLayout />}>
        <Route index element={<HomePage />} />           {/* <-- renders at "/" */}
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="*" element={<HomePage />} />
      </Route>
    </Routes>
  );
}
