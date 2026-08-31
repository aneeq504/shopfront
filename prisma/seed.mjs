import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const products = [
  {
    name: "Wireless Earbuds Pro",
    description: "Bluetooth 5.3 earbuds with active noise cancellation and 30h battery life.",
    priceCents: 799900,
    imageUrl: "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600",
    stock: 25,
    category: "Electronics",
  },
  {
    name: "Cotton Kurta",
    description: "Breathable unstitched cotton kurta, available in classic white.",
    priceCents: 249900,
    imageUrl: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600",
    stock: 40,
    category: "Fashion",
  },
  {
    name: "Stainless Steel Water Bottle",
    description: "Double-walled 1L bottle that keeps drinks cold for 24 hours.",
    priceCents: 149900,
    imageUrl: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600",
    stock: 60,
    category: "Home",
  },
  {
    name: "Mechanical Keyboard 87-key",
    description: "Hot-swappable tenkeyless keyboard with RGB backlight.",
    priceCents: 1099900,
    imageUrl: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600",
    stock: 12,
    category: "Electronics",
  },
];

for (const product of products) {
  const existing = await prisma.product.findFirst({ where: { name: product.name } });
  if (!existing) await prisma.product.create({ data: product });
}

console.log(`Seeded ${products.length} products.`);
await prisma.$disconnect();
