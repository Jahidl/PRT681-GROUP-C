import React from "react";

const FALLBACK_IMG =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="800" height="600">
    <rect width="100%" height="100%" fill="#f3f4f6"/>
    <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
          font-family="Arial, sans-serif" font-size="28" fill="#6b7280">
      Farm Tool
    </text>
  </svg>`);

const Stars = ({ value }) => {
  const full = Math.floor(value);
  const half = value - full >= 0.5;
  return (
    <div className="stars" aria-label={`${value} out of 5`}>
      {Array.from({ length: 5 }).map((_, i) => {
        const isFull = i < full;
        const isHalf = !isFull && half && i === full;
        return (
          <span
            key={i}
            className={`star ${isFull ? "full" : isHalf ? "half" : "empty"}`}
          >
            ★
          </span>
        );
      })}
    </div>
  );
};

const ProductCard = ({ product, onAdd }) => (
  <div className="card">
    <img
      className="card__img"
      src={product.image}
      alt={product.title}
      onError={(e) => {
        e.currentTarget.src = FALLBACK_IMG;
      }}
    />
    <div className="card__body">
      <h3 className="card__title" title={product.title}>
        {product.title}
      </h3>
      <Stars value={product.rating} />
      <div className="card__price">
        {product.price.toLocaleString(undefined, {
          style: "currency",
          currency: "USD",
        })}
      </div>
      <button className="btn btn--primary" onClick={() => onAdd(product)}>
        Add to Cart
      </button>
    </div>
  </div>
);

export default function Home({ products, onAdd }) {
  return (
    <>
      <section className="hero">
        <div className="hero__content">
          <h1>Darwin’s marketplace for second-hand farming tools</h1>
          <p>
            Buy & sell quality used gear across the Top End — tractors, pumps,
            sprayers, and more.
          </p>
          <a href="#catalog" className="btn btn--light">
            Browse Tools
          </a>
        </div>
      </section>

      <section id="catalog" className="catalog">
        <h2 className="section__title">Available Tools</h2>
        <div className="grid">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} onAdd={onAdd} />
          ))}
        </div>
      </section>
    </>
  );
}
