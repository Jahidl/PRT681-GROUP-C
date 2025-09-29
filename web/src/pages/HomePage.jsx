import React from "react";
import { useOutletContext } from "react-router-dom";
import Home from "@/components/home/Home.jsx";
import { PRODUCTS } from "@/data/products.js";

export default function HomePage() {
  const { addToCart } = useOutletContext();   // provided by ShopLayout
  return <Home products={PRODUCTS} onAdd={addToCart} />;
}
