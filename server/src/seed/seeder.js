/* eslint-disable no-console */
import { connectDB, disconnectDB } from "../config/db.js";
import { User } from "../models/user.model.js";
import { Category } from "../models/category.model.js";
import { Product } from "../models/product.model.js";
import { Coupon } from "../models/coupon.model.js";

const CATEGORIES = [
  { name: "Pizza", icon: "🍕", order: 1 },
  { name: "Burgers", icon: "🍔", order: 2 },
  { name: "Steak", icon: "🥩", order: 3 },
  { name: "Seafood", icon: "🦞", order: 4 },
  { name: "Pasta", icon: "🍝", order: 5 },
  { name: "Salads", icon: "🥗", order: 6 },
  { name: "Desserts", icon: "🍰", order: 7 },
  { name: "Drinks", icon: "🥤", order: 8 },
];

const img = (q) => `https://source.unsplash.com/800x600/?${encodeURIComponent(q)}`;

const productsFor = (catName, catId) => {
  const base = {
    Pizza: [
      ["Margherita Royale", 180, ["pizza", "vegetarian"], true],
      ["Truffle Funghi", 240, ["pizza"], true],
      ["Diavola Piccante", 210, ["pizza", "spicy"], false],
    ],
    Burgers: [
      ["VINCI Signature Burger", 165, ["burger", "best-seller"], true],
      ["Wagyu Double Stack", 260, ["burger"], true],
      ["Crispy Chicken Deluxe", 140, ["burger"], false],
    ],
    Steak: [
      ["Ribeye Prime 300g", 420, ["steak"], true],
      ["Filet Mignon", 480, ["steak"], true],
    ],
    Seafood: [
      ["Grilled Lobster Tail", 520, ["seafood"], true],
      ["Garlic Butter Shrimp", 290, ["seafood"], false],
    ],
    Pasta: [
      ["Truffle Carbonara", 195, ["pasta"], true],
      ["Seafood Linguine", 245, ["pasta", "seafood"], false],
    ],
    Salads: [
      ["Caesar Supreme", 110, ["salad", "vegetarian"], false],
      ["Mediterranean Quinoa", 125, ["salad", "vegan", "gluten-free"], true],
    ],
    Desserts: [
      ["Molten Chocolate Lava", 95, ["dessert"], true],
      ["Tiramisu Classico", 90, ["dessert"], false],
    ],
    Drinks: [
      ["Fresh Mango Sunrise", 55, ["drink"], false],
      ["Italian Espresso", 45, ["drink"], false],
    ],
  };
  return (base[catName] || []).map(([name, price, tags, featured]) => ({
    name,
    description: `Chef's ${name} — crafted with premium ingredients and VINCI signature technique.`,
    category: catId,
    price,
    compareAtPrice: Math.round(price * 1.2),
    images: [img(catName), img(name)],
    thumbnail: img(name),
    tags,
    isFeatured: featured,
    isPopular: featured,
    isBestSeller: tags.includes("best-seller"),
    isVegetarian: tags.includes("vegetarian") || tags.includes("vegan"),
    isVegan: tags.includes("vegan"),
    isGlutenFree: tags.includes("gluten-free"),
    spicyLevel: tags.includes("spicy") ? 2 : 0,
    calories: 200 + Math.floor(Math.random() * 700),
    ingredients: ["Premium sourced", "Fresh herbs", "Extra virgin olive oil"],
    allergens: catName === "Seafood" ? ["shellfish"] : ["gluten", "dairy"],
    preparationTime: 10 + Math.floor(Math.random() * 25),
    sizes:
      catName === "Pizza"
        ? [
            { name: "Medium", priceDelta: 0 },
            { name: "Large", priceDelta: 60 },
          ]
        : [],
    extras: [
      { name: "Extra cheese", priceDelta: 25 },
      { name: "Extra sauce", priceDelta: 15 },
    ],
    stock: 500,
    soldCount: Math.floor(Math.random() * 300),
    ratingAverage: Math.round((3.8 + Math.random() * 1.2) * 10) / 10,
    ratingCount: Math.floor(Math.random() * 200),
  }));
};

const seed = async () => {
  await connectDB();
  console.log("Clearing existing data...");
  await Promise.all([
    User.deleteMany({}),
    Category.deleteMany({}),
    Product.deleteMany({}),
    Coupon.deleteMany({}),
  ]);

  console.log("Seeding users...");
  await User.create([
    { name: "VINCI Admin", email: "admin@vinci.test", password: "Admin123!", role: "admin", isEmailVerified: true },
    { name: "Kitchen Chef", email: "kitchen@vinci.test", password: "Kitchen123!", role: "kitchen", isEmailVerified: true },
    { name: "Delivery Rider", email: "driver@vinci.test", password: "Driver123!", role: "delivery", isEmailVerified: true },
    { name: "Jane Customer", email: "customer@vinci.test", password: "Customer123!", role: "customer", isEmailVerified: true },
  ]);

  console.log("Seeding categories & products...");
  const cats = await Category.create(CATEGORIES);
  let productCount = 0;
  for (const cat of cats) {
    const docs = productsFor(cat.name, cat._id);
    if (docs.length) {
      await Product.create(docs);
      productCount += docs.length;
    }
  }

  console.log("Seeding coupons...");
  await Coupon.create([
    { code: "WELCOME10", type: "percent", value: 10, minOrderAmount: 100, description: "10% off your first order" },
    { code: "VINCI50", type: "fixed", value: 50, minOrderAmount: 300, description: "50 EGP off orders over 300" },
    { code: "FREESHIP", type: "fixed", value: 30, minOrderAmount: 150, description: "Free delivery" },
  ]);

  console.log(`✅ Seed complete: ${cats.length} categories, ${productCount} products, 4 users, 3 coupons`);
  console.log("   Admin login: admin@vinci.test / Admin123!");
  await disconnectDB();
  process.exit(0);
};

const destroy = async () => {
  await connectDB();
  await Promise.all([
    User.deleteMany({}),
    Category.deleteMany({}),
    Product.deleteMany({}),
    Coupon.deleteMany({}),
  ]);
  console.log("🗑️  All seed data destroyed");
  await disconnectDB();
  process.exit(0);
};

if (process.argv.includes("--destroy")) destroy();
else seed();
