// src/data/products.js
const svg = (emoji, label, bg = "#f3f4f6") =>
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900">
    <defs>
      <style>
        .label { font: 36px/1.2 -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Arial, sans-serif; fill:#374151 }
        .emoji { font: 200px/1 "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif }
      </style>
    </defs>
    <rect width="100%" height="100%" fill="${bg}"/>
    <g transform="translate(600,450)" text-anchor="middle">
      <text class="emoji" y="-20">${emoji}</text>
      <text class="label" y="160">${label}</text>
    </g>
  </svg>`);

export const PRODUCTS = [
  {
    id: "t1",
    title: "Compact Farm Tractor (Used)",
    price: 4800,
    rating: 4.5,
    image: svg("🚜", "Compact Tractor"),
  },
  {
    id: "t2",
    title: "Rotary Tiller / Cultivator",
    price: 720,
    rating: 4.3,
    image: svg("🧰", "Rotary Tiller Attachment"),
  },
  {
    id: "t3",
    title: "Two-Wheel Walking Tractor",
    price: 950,
    rating: 4.2,
    image: svg("🚜", "Walking Tractor"),
  },
  {
    id: "t4",
    title: "Crop Sprayer (Backpack 15L)",
    price: 85,
    rating: 4.0,
    image: svg("🧪", "Backpack Sprayer"),
  },
  {
    id: "t5",
    title: "Single-Blade Plough",
    price: 310,
    rating: 4.1,
    image: svg("🛠️", "Plough Attachment"),
  },
  {
    id: "t6",
    title: "Irrigation Pump (Petrol)",
    price: 295,
    rating: 4.2,
    image: svg("💧", "Irrigation Pump"),
  },
  {
    id: "t7",
    title: "Disc Harrow (3-Disc)",
    price: 670,
    rating: 4.3,
    image: svg("🛞", "Disc Harrow"),
  },
  {
    id: "t8",
    title: "Seed Planter / Seeder",
    price: 240,
    rating: 4.0,
    image: svg("🌱", "Seeder / Planter"),
  },
  {
    id: "t9",
    title: "Drip Irrigation Hose Kit",
    price: 95,
    rating: 4.4,
    image: svg("🪢", "Drip Hose Kit"),
  },
  {
    id: "t10",
    title: "Small Combine Harvester",
    price: 7200,
    rating: 4.6,
    image: svg("🌾", "Combine Harvester"),
  },
];
