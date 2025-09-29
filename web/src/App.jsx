import React from "react";
import { Routes, Route, Link } from "react-router-dom";
import ShopLayout from "@/components/layout/ShopLayout.jsx";
import HomePage from "@/pages/HomePage.jsx";
import Login from "@/pages/Login.jsx";
import Register from "@/pages/Register.jsx";
import ProductsPage from "@/pages/Products.jsx";
import ProductsDebug from "@/pages/ProductsDebug.jsx"; // <-- added

export default function App() {
  return (
    <>
      {/* temp helper to navigate quickly */}
      <div style={{position:"fixed",top:6,left:6,zIndex:9999,background:"#fff",padding:"4px 8px",border:"1px solid #ddd"}}>
        Hello world
      </div>

    
    </>
  );
}
