import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ORDERS_FILE = path.join(__dirname, 'orders_data.json');
const CUSTOMERS_FILE = path.join(__dirname, 'customers_data.json');
const STAFF_FILE = path.join(__dirname, 'staff_data.json');
const PRODUCTS_FILE = path.join(__dirname, 'products_data.json');
const CATEGORIES_FILE = path.join(__dirname, 'categories_data.json');
const CAROUSEL_FILE = path.join(__dirname, 'carousel_data.json');
const SETTINGS_FILE = path.join(__dirname, 'settings_data.json');

export interface StaffUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'employee';
  password: string;
  isPasswordChangeable: boolean;
  createdAt: string;
}

const DEFAULT_STAFF_USERS: StaffUser[] = [
  {
    id: 'staff-admin-1',
    email: 'uatal.pk@gmail.com',
    name: 'Umer (Admin)',
    role: 'admin',
    password: 'Umer@9157',
    isPasswordChangeable: true,
    createdAt: '2026-10-01T00:00:00.000Z'
  },
  {
    id: 'staff-emp-1',
    email: 'ali@atal.com',
    name: 'Ali (Employee)',
    role: 'employee',
    password: 'Ali@297',
    isPasswordChangeable: true,
    createdAt: '2026-10-01T00:00:00.000Z'
  }
];

function loadStaffFromDisk(): StaffUser[] {
  try {
    if (fs.existsSync(STAFF_FILE)) {
      const data = fs.readFileSync(STAFF_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        let changed = false;
        const merged = [...parsed];
        const adminUser = merged.find(u => u.email.toLowerCase() === 'uatal.pk@gmail.com');
        if (!adminUser) {
          merged.unshift(DEFAULT_STAFF_USERS[0]);
          changed = true;
        }
        const empUser = merged.find(u => u.email.toLowerCase() === 'ali@atal.com');
        if (!empUser) {
          merged.push(DEFAULT_STAFF_USERS[1]);
          changed = true;
        }
        if (changed) {
          fs.writeFileSync(STAFF_FILE, JSON.stringify(merged, null, 2), 'utf-8');
        }
        return merged;
      }
    }
  } catch (err) {
    console.error('Error loading staff from disk:', err);
  }
  try {
    fs.writeFileSync(STAFF_FILE, JSON.stringify(DEFAULT_STAFF_USERS, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to create initial staff file:', e);
  }
  return [...DEFAULT_STAFF_USERS];
}

let staffUsers: StaffUser[] = loadStaffFromDisk();

function saveStaffToDisk() {
  try {
    fs.writeFileSync(STAFF_FILE, JSON.stringify(staffUsers, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to persist staff to disk:', err);
  }
}

function sanitizeStaffUser(user: StaffUser) {
  const { password, ...safe } = user;
  return safe;
}

export interface CustomerAddress {
  address: string;
  city: string;
  province: string;
  area?: string;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  whatsapp: string; // WhatsApp number (e.g. 03001234567)
  password: string;
  createdAt: string;
  defaultAddress?: CustomerAddress;
}

interface ProductVariant {
  id: string;
  name: string; // e.g., "Red / M" or "Midnight Black / 128GB"
  sku: string;
  price: number; // in PKR
  originalPrice?: number;
  stock: number;
  color?: string;
  size?: string;
}

interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  categoryId: string;
  subcategoryId: string;
  brand: string;
  price: number; // base price in PKR
  originalPrice?: number;
  discountPercentage?: number;
  rating: number;
  reviewCount: number;
  images: string[];
  variants: ProductVariant[];
  stock: number;
  isFeatured?: boolean;
  isFlashDeal?: boolean;
  isBestSeller?: boolean;
  isNewArrival?: boolean;
  createdAt: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  subcategories: string[];
  description: string;
}

interface CartItem {
  productId: string;
  variantId?: string;
  quantity: number;
  selectedVariant?: ProductVariant;
  product?: Product;
}

interface OrderItem {
  productId: string;
  productName: string;
  sku: string;
  variantName?: string;
  unitPrice: number;
  quantity: number;
  total: number;
  image: string;
}

interface Order {
  id: string;
  orderNumber: string;
  trackingNumber: string; // Guaranteed 8-digit unique tracking number
  customerId?: string; // Associated customer account ID
  customerName: string;
  mobileNumber: string;
  email?: string;
  province: string;
  city: string;
  area: string;
  address: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  shippingCharges: number;
  totalAmount: number;
  paymentMethod: 'jazzcash' | 'easypaisa' | 'cod' | 'card' | 'bank';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  transactionReference: string; // Mandatory payment transaction ID / TID
  transactionId?: string; // Explicit transaction ID
  orderStatus: 
    | 'Pending Confirmation'
    | 'Confirmed'
    | 'Processing'
    | 'Ready to Ship'
    | 'Shipped'
    | 'Out for Delivery'
    | 'Delivered'
    | 'Cancellation Requested'
    | 'Cancelled'
    | 'Return Requested'
    | 'Returned'
    | 'Refunded';
  createdAt: string;
  statusHistory: { status: string; timestamp: string; note: string }[];
  emailConfirmation?: {
    sent: boolean;
    recipientEmail: string;
    sentAt: string;
    subject: string;
    service: string;
  };
}

const DEFAULT_CATEGORIES: Category[] = [
  {
    id: 'cat-men',
    name: "Men",
    slug: 'men',
    image: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=600&q=80',
    subcategories: ['T-Shirts', 'Shirts', 'Polo Shirts', 'Jeans and Trousers', 'Shalwar Kameez', 'Jackets and Hoodies', 'Sandals and Slippers', 'Watches', 'Wallets', 'Belts', 'Men Accessories'],
    description: "Modern & traditional menswear crafted for comfort and elegance."
  },
  {
    id: 'cat-women',
    name: "Women",
    slug: 'women',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    subcategories: ['Dresses', 'Casual Wear', 'Formal Wear', 'Kurtis', 'Shalwar Kameez', 'Abayas and Hijabs', 'Women Shoes', 'Handbags', 'Purses and Clutches', 'Jewellery', 'Watches', 'Fashion Accessories'],
    description: "Trendy eastern and western wear, luxury handbags, and accessories."
  },
  {
    id: 'cat-kids',
    name: "Kids",
    slug: 'kids',
    image: 'https://images.unsplash.com/photo-1503944583220-7eeec8587d5a?auto=format&fit=crop&w=600&q=80',
    subcategories: ['Boys Clothing', 'Girls Clothing', 'Baby Clothing', 'Newborn Essentials', 'Kids Shoes', 'School Bags', 'Toys', 'Kids Accessories'],
    description: "Safe, colorful, and durable clothing and toys for children of all ages."
  },
  {
    id: 'cat-cosmetics',
    name: "Cosmetics & Perfume",
    slug: 'cosmetics-perfume',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80',
    subcategories: ['Makeup', 'Face Wash', 'Skincare', 'Face Creams', 'Serums', 'Sunscreen', 'Facial Kits', 'Hair Care', 'Body Care', 'Perfumes for Men', 'Perfumes for Women', 'Unisex Perfumes', 'Body Sprays', 'Beauty Accessories'],
    description: "100% original skincare, cosmetics, and signature oriental & western perfumes."
  },
  {
    id: 'cat-electronics',
    name: "Electronics",
    slug: 'electronics',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
    subcategories: ['Mobile Accessories', 'Earbuds and Headphones', 'Speakers', 'Smart Watches', 'Chargers and Cables', 'Power Banks', 'Computer Accessories', 'Home Electronics', 'Gaming Accessories', 'Other Electronic Gadgets'],
    description: "High-performance gadgets, wireless audio, and smart accessories."
  }
];

function loadCategoriesFromDisk(): Category[] {
  try {
    if (fs.existsSync(CATEGORIES_FILE)) {
      const data = fs.readFileSync(CATEGORIES_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error reading categories from disk:', err);
  }
  try {
    fs.writeFileSync(CATEGORIES_FILE, JSON.stringify(DEFAULT_CATEGORIES, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to save default categories to disk:', e);
  }
  return [...DEFAULT_CATEGORIES];
}

let categories: Category[] = loadCategoriesFromDisk();

function saveCategoriesToDisk() {
  try {
    fs.writeFileSync(CATEGORIES_FILE, JSON.stringify(categories, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving categories to disk:', err);
  }
}

const DEFAULT_PRODUCTS: Product[] = [
  {
    id: 'prod-festive-1',
    slug: 'atal-signature-3d-luxury-collection',
    name: 'ATAL 3D Signature Luxury Bag',
    description: 'Iconic ATAL luxury designer bag crafted with emerald green metallic trims, gold geometric hardware, and signature architectural silhouette.',
    categoryId: 'cat-women',
    subcategoryId: 'Bags & Clutches',
    brand: 'ATAL SIGNATURE',
    price: 3950,
    originalPrice: 5490,
    discountPercentage: 28,
    rating: 4.9,
    reviewCount: 382,
    images: [
      '/assets/aistudio/WhatsApp_Image_2026-09-29_at_12.21.56_PM_187de251.jpeg',
      '/assets/atal_signature_bag_1792525744513.jpg',
      '/public/assets/aistudio/WhatsApp_Image_2026-10-19_at_8.37.40_PM_e34dc877.jpeg'
    ],
    variants: [
      { id: 'v-fest-1', name: 'Emerald & 24K Gold Edition', sku: 'ATAL-BAG-EM-GLD', price: 3950, originalPrice: 5490, stock: 24, color: 'Emerald Green' }
    ],
    stock: 24,
    isFeatured: true,
    isFlashDeal: true,
    isBestSeller: true,
    isNewArrival: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod-festive-2',
    slug: 'atal-luxury-festive-pret-couture',
    name: 'ATAL Luxury Festive Pret Couture',
    description: 'Exquisite Pakistani festive pret collection featuring heritage zardozi threadwork, hand-embroidered organza dupatta, and pure raw silk shirt in deep emerald.',
    categoryId: 'cat-women',
    subcategoryId: 'Festive Pret',
    brand: 'ATAL COUTURE',
    price: 4890,
    originalPrice: 6800,
    discountPercentage: 28,
    rating: 5.0,
    reviewCount: 420,
    images: [
      '/assets/atal_festive_pret_1792525761752.jpg',
      '/assets/hero_festive_banner_1792525781469.jpg',
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=800&q=80'
    ],
    variants: [
      { id: 'v-fest-2', name: 'Emerald / Small', sku: 'ATAL-FEST-EM-S', price: 4890, originalPrice: 6800, size: 'S', color: 'Emerald Green', stock: 15 },
      { id: 'v-fest-3', name: 'Emerald / Medium', sku: 'ATAL-FEST-EM-M', price: 4890, originalPrice: 6800, size: 'M', color: 'Emerald Green', stock: 20 },
      { id: 'v-fest-4', name: 'Emerald / Large', sku: 'ATAL-FEST-EM-L', price: 4890, originalPrice: 6800, size: 'L', color: 'Emerald Green', stock: 12 }
    ],
    stock: 47,
    isFeatured: true,
    isFlashDeal: true,
    isBestSeller: true,
    isNewArrival: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod-1',
    slug: 'wireless-earbuds-pro-active-noise-cancelling',
    name: 'ATAL Pods Pro Active Noise Cancelling Wireless Earbuds',
    description: 'Immersive sound quality with active noise cancellation, 30-hour battery life with charging case, Bluetooth 5.3, sweat resistance, and crystal clear microphone for calls.',
    categoryId: 'cat-electronics',
    subcategoryId: 'Earbuds and Headphones',
    brand: 'ATAL Audio',
    price: 3499,
    originalPrice: 5999,
    discountPercentage: 42,
    rating: 4.8,
    reviewCount: 328,
    images: [
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80'
    ],
    variants: [
      { id: 'v1', name: 'Matte Black', sku: 'ATAL-POD-BLK', price: 3499, originalPrice: 5999, stock: 45, color: 'Black' },
      { id: 'v2', name: 'Pearl White', sku: 'ATAL-POD-WHT', price: 3499, originalPrice: 5999, stock: 30, color: 'White' }
    ],
    stock: 75,
    isFeatured: true,
    isFlashDeal: true,
    isBestSeller: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod-2',
    slug: 'mens-luxury-lawn-shalwar-kameez-embbroidered',
    name: "Men's Premium Cotton Shalwar Kameez Suit",
    description: 'Exquisite summer weight cotton fabric with subtle collar embroidery and executive cut. Designed for festive occasions and formal daily wear in Pakistan climate.',
    categoryId: 'cat-men',
    subcategoryId: 'Shalwar Kameez',
    brand: 'ATAL Men',
    price: 2850,
    originalPrice: 4200,
    discountPercentage: 32,
    rating: 4.6,
    reviewCount: 194,
    images: [
      'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&w=800&q=80'
    ],
    variants: [
      { id: 'v3', name: 'Off White / Medium', sku: 'ATAL-SK-OW-M', price: 2850, size: 'M', color: 'White', stock: 15 },
      { id: 'v4', name: 'Off White / Large', sku: 'ATAL-SK-OW-L', price: 2850, size: 'L', color: 'White', stock: 20 },
      { id: 'v5', name: 'Charcoal Grey / Large', sku: 'ATAL-SK-CG-L', price: 2850, size: 'L', color: 'Grey', stock: 12 }
    ],
    stock: 47,
    isFeatured: true,
    isNewArrival: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod-3',
    slug: 'womens-embbroidered-chiffon-formal-kurtis',
    name: "Women's Luxury Embroidered Chiffon Kurti",
    description: 'Stunning festive kurti featuring intricate thread work, hand embellishments, and breathable inner lining. Perfect for weddings and formal parties.',
    categoryId: 'cat-women',
    subcategoryId: 'Kurtis',
    brand: 'ATAL Haute',
    price: 3999,
    originalPrice: 6500,
    discountPercentage: 38,
    rating: 4.9,
    reviewCount: 412,
    images: [
      'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1618244972963-dbee1a7edc95?auto=format&fit=crop&w=800&q=80'
    ],
    variants: [
      { id: 'v6', name: 'Royal Blue / Small', sku: 'ATAL-KURT-BL-S', price: 3999, size: 'S', color: 'Blue', stock: 10 },
      { id: 'v7', name: 'Royal Blue / Medium', sku: 'ATAL-KURT-BL-M', price: 3999, size: 'M', color: 'Blue', stock: 25 },
      { id: 'v8', name: 'Blush Pink / Medium', sku: 'ATAL-KURT-PK-M', price: 3999, size: 'M', color: 'Pink', stock: 18 }
    ],
    stock: 53,
    isFeatured: true,
    isBestSeller: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod-4',
    slug: 'smart-fitness-watch-amoled-bluetooth-calling',
    name: 'ATAL Watch Ultra Smart Fitness & Bluetooth Calling Watch',
    description: 'Bright AMOLED display with always-on feature, 100+ sports modes, IP67 waterproof, health monitoring (heart rate, SpO2, sleep), and 7-day battery life.',
    categoryId: 'cat-electronics',
    subcategoryId: 'Smart Watches',
    brand: 'ATAL Tech',
    price: 4999,
    originalPrice: 8999,
    discountPercentage: 44,
    rating: 4.7,
    reviewCount: 285,
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?auto=format&fit=crop&w=800&q=80'
    ],
    variants: [
      { id: 'v9', name: 'Titanium Silver with Orange Strap', sku: 'ATAL-W-SLV', price: 4999, stock: 22, color: 'Silver' },
      { id: 'v10', name: 'Midnight Black with Black Strap', sku: 'ATAL-W-BLK', price: 4999, stock: 35, color: 'Black' }
    ],
    stock: 57,
    isFlashDeal: true,
    isFeatured: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod-5',
    slug: 'vitamin-c-brightening-face-serum-hyaluronic-acid',
    name: 'ATAL Glow Radiance Vitamin C Face Serum (30ml)',
    description: 'Advanced antioxidant formula with 20% Vitamin C, Hyaluronic Acid, and Niacinamide. Fades dark spots, boosts collagen, and gives glowing skin.',
    categoryId: 'cat-cosmetics',
    subcategoryId: 'Serums',
    brand: 'ATAL Skincare',
    price: 1299,
    originalPrice: 2200,
    discountPercentage: 41,
    rating: 4.8,
    reviewCount: 512,
    images: [
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1608248597359-2e094770220c?auto=format&fit=crop&w=800&q=80'
    ],
    variants: [
      { id: 'v11', name: '30ml Bottle', sku: 'ATAL-SER-VC', price: 1299, stock: 120 }
    ],
    stock: 120,
    isBestSeller: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod-6',
    slug: 'mens-luxury-long-lasting-oud-perfume-100ml',
    name: 'ATAL Royal Oud Oriental Signature Perfume (100ml)',
    description: 'A captivating blend of rich Cambodian oud, warm amber, and smoky woods. Designed for sophisticated evenings and long-lasting freshness up to 24 hours.',
    categoryId: 'cat-cosmetics',
    subcategoryId: 'Perfumes for Men',
    brand: 'ATAL Fragrances',
    price: 2499,
    originalPrice: 4500,
    discountPercentage: 44,
    rating: 4.9,
    reviewCount: 230,
    images: [
      'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=800&q=80'
    ],
    variants: [
      { id: 'v12', name: '100ml Eau de Parfum', sku: 'ATAL-PERF-OUD', price: 2499, stock: 65 }
    ],
    stock: 65,
    isFeatured: true,
    isNewArrival: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod-7',
    slug: 'kids-electric-ride-on-jeep-remote-control',
    name: 'Kids 12V Electric Ride-On Jeep with Remote Control',
    description: 'Safe, rechargeable battery-powered jeep with parental remote control, working LED headlights, music player via USB, and sturdy off-road wheels.',
    categoryId: 'cat-kids',
    subcategoryId: 'Toys',
    brand: 'ATAL Play',
    price: 18999,
    originalPrice: 25999,
    discountPercentage: 27,
    rating: 4.8,
    reviewCount: 88,
    images: [
      'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=800&q=80'
    ],
    variants: [
      { id: 'v13', name: 'Red Off-Road Jeep', sku: 'ATAL-TOY-JEEP-RED', price: 18999, color: 'Red', stock: 8 },
      { id: 'v14', name: 'Jet Black Jeep', sku: 'ATAL-TOY-JEEP-BLK', price: 18999, color: 'Black', stock: 5 }
    ],
    stock: 13,
    isFeatured: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'prod-8',
    slug: 'heavy-bass-bluetooth-wireless-party-speaker',
    name: 'ATAL ThunderBox RGB Wireless Bluetooth Speaker',
    description: '40W stereo sound with deep bass, dynamic RGB LED light show, TWS pairing support, FM radio, USB/TF card playback, and 12-hour playtime.',
    categoryId: 'cat-electronics',
    subcategoryId: 'Speakers',
    brand: 'ATAL Audio',
    price: 5499,
    originalPrice: 8500,
    discountPercentage: 35,
    rating: 4.7,
    reviewCount: 142,
    images: [
      'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=800&q=80'
    ],
    variants: [
      { id: 'v15', name: 'Black Thunder', sku: 'ATAL-SPK-THUN', price: 5499, stock: 24 }
    ],
    stock: 24,
    isBestSeller: true,
    createdAt: new Date().toISOString()
  }
];

function loadProductsFromDisk(): Product[] {
  try {
    if (fs.existsSync(PRODUCTS_FILE)) {
      const data = fs.readFileSync(PRODUCTS_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error reading products from disk:', err);
  }
  try {
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(DEFAULT_PRODUCTS, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to save default products to disk:', e);
  }
  return [...DEFAULT_PRODUCTS];
}

let products: Product[] = loadProductsFromDisk();

function saveProductsToDisk() {
  try {
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving products to disk:', err);
  }
}

const initialOrders: Order[] = [];

function loadOrdersFromDisk(): Order[] {
  try {
    if (fs.existsSync(ORDERS_FILE)) {
      const data = fs.readFileSync(ORDERS_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error reading orders from disk:', err);
  }
  return initialOrders;
}

let orders: Order[] = loadOrdersFromDisk();

function saveOrdersToDisk() {
  try {
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving orders to disk:', err);
  }
}

export function normalizePakistaniPhone(phone: string): string {
  if (!phone) return '';
  let cleaned = phone.replace(/[\s\-\(\)\+]+/g, '');
  if (cleaned.startsWith('92')) {
    cleaned = '0' + cleaned.substring(2);
  }
  if (cleaned.length === 10 && cleaned.startsWith('3')) {
    cleaned = '0' + cleaned;
  }
  return cleaned;
}

export function sanitizeCustomer(cust: Customer): Omit<Customer, 'password'> {
  const { password, ...safe } = cust;
  return safe;
}

const initialCustomers: Customer[] = [];

function loadCustomersFromDisk(): Customer[] {
  try {
    if (fs.existsSync(CUSTOMERS_FILE)) {
      const data = fs.readFileSync(CUSTOMERS_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error reading customers from disk:', err);
  }
  return initialCustomers;
}

let customers: Customer[] = loadCustomersFromDisk();

function saveCustomersToDisk() {
  try {
    fs.writeFileSync(CUSTOMERS_FILE, JSON.stringify(customers, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving customers to disk:', err);
  }
}

const DEFAULT_STORE_SETTINGS = {
  storeName: 'ATAL',
  tagline: 'Shop Smart. Live Better',
  supportPhone: '+92 371 9150297',
  supportEmail: 'contact.to.atal@gmail.com',
  whatsappNumber: '923719150297',
  freeShippingThreshold: 9999,
  defaultShippingCharge: 290,
  codEnabled: true,
  codDeliveryChargesMandatory: true,
  jazzcashEnabled: true,
  easypaisaEnabled: true,
  cardEnabled: true,
  codAdvanceShipping: true,
  easypaisaAccountTitle: 'Omar Farooq',
  easypaisaAccountNumber: '03719150297',
  easypaisaQrImage: '/assets/aistudio/WhatsApp_Image_2026-10-20_at_11.24.41_PM_3cd4a1f7.jpeg',
  jazzcashAccountTitle: 'Umer Farooq',
  jazzcashAccountNumber: '03719150297',
  jazzcashQrImage: '/assets/aistudio/WhatsApp_Image_2026-10-20_at_11.26.22_PM_96ced8c4.jpeg',
  bankEnabled: true,
  bankName: 'HBL (Habib Bank Limited)',
  bankAccountTitle: 'Umer Farooq',
  bankAccountNumber: '50627918149903',
  bankQrImage: '/assets/aistudio/WhatsApp_Image_2026-10-22_at_9.45.39_AM_5e21af89.jpeg',
  couponsEnabled: true,
  coupons: {
    wellcome5: 0.05,
    atal8: 0.08
  } as Record<string, number>
};

function loadSettingsFromDisk() {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const data = fs.readFileSync(SETTINGS_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (parsed && typeof parsed === 'object') {
        return { ...DEFAULT_STORE_SETTINGS, ...parsed };
      }
    }
  } catch (err) {
    console.error('Error reading settings from disk:', err);
  }
  try {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(DEFAULT_STORE_SETTINGS, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to save default settings to disk:', e);
  }
  return { ...DEFAULT_STORE_SETTINGS };
}

let storeSettings = loadSettingsFromDisk();

function saveSettingsToDisk() {
  try {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(storeSettings, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving settings to disk:', err);
  }
}

interface CarouselSlide {
  id: string | number;
  badge: string;
  brand: string;
  title: string;
  subtitle: string;
  discount: string;
  buttonText: string;
  image: string;
  categoryId: string;
}

const DEFAULT_CAROUSEL_SLIDES: CarouselSlide[] = [
  {
    id: 1,
    badge: 'PAKISTAN FESTIVE SALE',
    brand: 'ATAL PAKISTAN',
    title: 'Up to 50% Off Luxury Pret & Fragrances',
    subtitle: 'ELEGANT ATTIRE • PREMIUM TECH • EXQUISITE SCENTS',
    discount: 'UPTO 40% OFF',
    buttonText: 'SHOP NOW!',
    image: '/assets/hero_festive_banner_1792525781469.jpg',
    categoryId: 'cat-women',
  },
  {
    id: 2,
    badge: 'ROYAL OUD & PERFUMES',
    brand: 'ATAL PARFUMS',
    title: 'Signature Long-Lasting Fragrances & Attars',
    subtitle: 'FRENCH NOTES • ARABIAN OUD • LUXURY BOTTLES',
    discount: 'FLAT 30% OFF',
    buttonText: 'DISCOVER SCENTS',
    image: 'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=1200&q=80',
    categoryId: 'cat-cosmetics',
  },
  {
    id: 3,
    badge: 'SMART AUDIO & TECH ⚡',
    brand: 'ATAL PRO TECH',
    title: 'Wireless ANC Earbuds & Smartwatches',
    subtitle: 'CRYSTAL HD SOUND • 40H BATTERY • WATER RESISTANT',
    discount: 'SPECIAL OFFER',
    buttonText: 'UPGRADE AUDIO',
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=1200&q=80',
    categoryId: 'cat-electronics',
  },
  {
    id: 4,
    badge: 'ARTISANAL LEATHER',
    brand: 'ATAL COUTURE',
    title: 'Signature Quilted Handbags & Clutches',
    subtitle: 'PREMIUM FINISH • EMBOSSED LOGO • 24K GOLD HARDWARE',
    discount: 'NEW ARRIVAL',
    buttonText: 'EXPLORE BAGS',
    image: '/assets/atal_signature_bag_1792525744513.jpg',
    categoryId: 'cat-women',
  }
];

function loadCarouselFromDisk(): CarouselSlide[] {
  try {
    if (fs.existsSync(CAROUSEL_FILE)) {
      const data = fs.readFileSync(CAROUSEL_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error reading carousel slides from disk:', err);
  }
  try {
    fs.writeFileSync(CAROUSEL_FILE, JSON.stringify(DEFAULT_CAROUSEL_SLIDES, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to save default carousel slides to disk:', e);
  }
  return [...DEFAULT_CAROUSEL_SLIDES];
}

let carouselSlides: CarouselSlide[] = loadCarouselFromDisk();

function saveCarouselToDisk() {
  try {
    fs.writeFileSync(CAROUSEL_FILE, JSON.stringify(carouselSlides, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving carousel slides to disk:', err);
  }
}

export async function createServer() {
  const app = express();
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));

  // CORS & Preflight headers middleware for AI Studio preview / iframe
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
      return res.sendStatus(200);
    }
    next();
  });

  // API Routes
  
  // 1. Get Categories
  app.get('/api/categories', (req, res) => {
    res.json(categories);
  });

  // Create Category (Admin)
  app.post('/api/categories', (req, res) => {
    const { name, slug, image, subcategories, description } = req.body;
    const newCat: Category = {
      id: `cat-${Date.now()}`,
      name,
      slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      image: image || 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80',
      subcategories: subcategories || [],
      description: description || ''
    };
    categories.push(newCat);
    saveCategoriesToDisk();
    res.json(newCat);
  });

  // Update Category (Admin)
  app.put('/api/categories/:id', (req, res) => {
    const { id } = req.params;
    const idx = categories.findIndex(c => c.id === id);
    if (idx === -1) {
      return res.status(404).json({ error: 'Category not found' });
    }
    categories[idx] = { ...categories[idx], ...req.body };
    saveCategoriesToDisk();
    res.json(categories[idx]);
  });

  // Delete Category (Admin)
  app.delete('/api/categories/:id', (req, res) => {
    const { id } = req.params;
    categories = categories.filter(c => c.id !== id);
    saveCategoriesToDisk();
    res.json({ success: true, message: 'Category deleted' });
  });

  // 1.1 Hero Carousel Slides Endpoints
  app.get('/api/carousel', (req, res) => {
    res.json(carouselSlides);
  });

  app.post('/api/carousel', (req, res) => {
    const newSlide: CarouselSlide = {
      id: Date.now(),
      badge: req.body.badge || 'PROMOTION',
      brand: req.body.brand || 'ATAL',
      title: req.body.title || 'New Special Collection',
      subtitle: req.body.subtitle || '',
      discount: req.body.discount || 'LIMITED TIME',
      buttonText: req.body.buttonText || 'SHOP NOW',
      image: req.body.image || '/assets/hero_festive_banner_1792525781469.jpg',
      categoryId: req.body.categoryId || 'cat-women'
    };
    carouselSlides.push(newSlide);
    saveCarouselToDisk();
    res.json(newSlide);
  });

  app.put('/api/carousel/:id', (req, res) => {
    const { id } = req.params;
    const idx = carouselSlides.findIndex(s => String(s.id) === String(id));
    if (idx === -1) {
      return res.status(404).json({ error: 'Slide not found' });
    }
    carouselSlides[idx] = { ...carouselSlides[idx], ...req.body, id: carouselSlides[idx].id };
    saveCarouselToDisk();
    res.json(carouselSlides[idx]);
  });

  app.delete('/api/carousel/:id', (req, res) => {
    const { id } = req.params;
    carouselSlides = carouselSlides.filter(s => String(s.id) !== String(id));
    saveCarouselToDisk();
    res.json({ success: true, message: 'Slide deleted' });
  });

  // 2. Get Products (with filters & search)
  app.get('/api/products', (req, res) => {
    let result = [...products];
    const { search, category, subcategory, brand, minPrice, maxPrice, sort, featured, flashDeal, bestSeller } = req.query;

    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.description.toLowerCase().includes(q) || 
        p.brand.toLowerCase().includes(q) ||
        p.subcategoryId.toLowerCase().includes(q)
      );
    }

    if (category && typeof category === 'string') {
      result = result.filter(p => p.categoryId === category);
    }

    if (subcategory && typeof subcategory === 'string') {
      result = result.filter(p => p.subcategoryId.toLowerCase() === subcategory.toLowerCase());
    }

    if (brand && typeof brand === 'string') {
      result = result.filter(p => p.brand.toLowerCase() === brand.toLowerCase());
    }

    if (minPrice) {
      result = result.filter(p => p.price >= Number(minPrice));
    }

    if (maxPrice) {
      result = result.filter(p => p.price <= Number(maxPrice));
    }

    if (featured === 'true') {
      result = result.filter(p => p.isFeatured);
    }

    if (flashDeal === 'true') {
      result = result.filter(p => p.isFlashDeal);
    }

    if (bestSeller === 'true') {
      result = result.filter(p => p.isBestSeller);
    }

    if (sort === 'price-low') {
      result.sort((a, b) => a.price - b.price);
    } else if (sort === 'price-high') {
      result.sort((a, b) => b.price - a.price);
    } else if (sort === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sort === 'newest') {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    res.json(result);
  });

  // Get Single Product by Slug or ID (Unique Product URL requirement)
  app.get('/api/products/:slugOrId', (req, res) => {
    const { slugOrId } = req.params;
    const product = products.find(p => p.slug === slugOrId || p.id === slugOrId);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  });

  // Create Product (Admin)
  app.post('/api/products', (req, res) => {
    const data = req.body;
    const newProduct: Product = {
      id: `prod-${Date.now()}`,
      slug: data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      name: data.name,
      description: data.description,
      categoryId: data.categoryId,
      subcategoryId: data.subcategoryId,
      brand: data.brand || 'ATAL',
      price: Number(data.price),
      originalPrice: data.originalPrice ? Number(data.originalPrice) : undefined,
      discountPercentage: data.originalPrice ? Math.round(((data.originalPrice - data.price) / data.originalPrice) * 100) : 0,
      rating: 5.0,
      reviewCount: 0,
      images: data.images || ['https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80'],
      variants: data.variants || [],
      stock: Number(data.stock || 10),
      isFeatured: !!data.isFeatured,
      isFlashDeal: !!data.isFlashDeal,
      isBestSeller: !!data.isBestSeller,
      isNewArrival: true,
      createdAt: new Date().toISOString()
    };
    products.unshift(newProduct);
    saveProductsToDisk();
    res.json(newProduct);
  });

  // Update Product (Admin)
  app.put('/api/products/:id', (req, res) => {
    const { id } = req.params;
    const index = products.findIndex(p => p.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Product not found' });
    }
    products[index] = { ...products[index], ...req.body };
    saveProductsToDisk();
    res.json(products[index]);
  });

  // Delete Product (Admin)
  app.delete('/api/products/:id', (req, res) => {
    const { id } = req.params;
    products = products.filter(p => p.id !== id);
    saveProductsToDisk();
    res.json({ success: true, message: 'Product deleted successfully' });
  });

  // 3. Checkout / Place Order (Pakistan-specific)
  app.post('/api/checkout', (req, res) => {
    const {
      customerId,
      customerName,
      mobileNumber,
      email,
      province,
      city,
      area,
      address,
      items, // array of { productId, variantId, quantity }
      paymentMethod, // 'jazzcash' | 'easypaisa' | 'cod' | 'card'
      couponCode,
      transactionId,
      transactionReference
    } = req.body;

    if (!customerName || !mobileNumber || !province || !city || !address || !items || items.length === 0) {
      return res.status(400).json({ error: 'Missing required customer details or cart items' });
    }

    const finalTxId = (transactionId || transactionReference || '').toString().trim();
    if (!finalTxId) {
      return res.status(400).json({ 
        error: 'Transaction ID is mandatory before placing an order. Please complete payment and enter your TID from the payment SMS / app.' 
      });
    }

    // Validate mobile number format (e.g., 03XXXXXXXXX or +923XXXXXXXXX)
    const cleanedMobile = mobileNumber.replace(/\s+/g, '');
    if (!/^(\+92|0)?3[0-9]{9}$/.test(cleanedMobile)) {
      return res.status(400).json({ error: 'Invalid Pakistani mobile number format. Must start with 03 (e.g. 03001234567).' });
    }

    let subtotal = 0;
    const orderItems: OrderItem[] = [];

    for (const cartItem of items) {
      const prod = products.find(p => p.id === cartItem.productId);
      if (!prod) {
        return res.status(400).json({ error: `Product not found: ${cartItem.productId}` });
      }

      let unitPrice = prod.price;
      let variantName = undefined;
      let sku = prod.id;

      if (cartItem.variantId && prod.variants) {
        const v = prod.variants.find(va => va.id === cartItem.variantId);
        if (v) {
          unitPrice = v.price;
          variantName = v.name;
          sku = v.sku;
          if (v.stock < cartItem.quantity) {
            return res.status(400).json({ error: `Insufficient stock for ${prod.name} (${v.name}). Available: ${v.stock}` });
          }
          // deduct stock
          v.stock -= cartItem.stock || cartItem.quantity;
        }
      } else {
        if (prod.stock < cartItem.quantity) {
          return res.status(400).json({ error: `Insufficient stock for ${prod.name}. Available: ${prod.stock}` });
        }
        prod.stock -= cartItem.quantity;
      }

      const itemTotal = unitPrice * cartItem.quantity;
      subtotal += itemTotal;

      orderItems.push({
        productId: prod.id,
        productName: prod.name,
        sku,
        variantName,
        unitPrice,
        quantity: cartItem.quantity,
        total: itemTotal,
        image: prod.images[0]
      });
    }

    let discount = 0;
    if (storeSettings.couponsEnabled && couponCode && storeSettings.coupons && storeSettings.coupons[couponCode.toLowerCase()]) {
      discount = Math.round(subtotal * storeSettings.coupons[couponCode.toLowerCase()]);
    }

    const isCod = paymentMethod === 'cod';
    const shippingCharges = (subtotal >= storeSettings.freeShippingThreshold && (!isCod || !storeSettings.codDeliveryChargesMandatory)) 
      ? 0 
      : storeSettings.defaultShippingCharge;
    const totalAmount = subtotal - discount + shippingCharges;

    // Issue guaranteed unique 8-digit tracking number
    let trackingNumber = '';
    while (!trackingNumber || orders.some(o => o.trackingNumber === trackingNumber)) {
      trackingNumber = Math.floor(10000000 + Math.random() * 90000000).toString();
    }
    const orderNumber = `ATAL-${trackingNumber}`;
    // Associate with customer account if available
    let resolvedCustomerId = customerId;
    if (!resolvedCustomerId) {
      const matchedCust = customers.find(c => 
        (email && c.email.toLowerCase() === email.trim().toLowerCase()) ||
        normalizePakistaniPhone(c.whatsapp) === cleanedMobile
      );
      if (matchedCust) {
        resolvedCustomerId = matchedCust.id;
      }
    }

    const recipientEmail = (email && typeof email === 'string' && email.trim()) || 
      (resolvedCustomerId ? customers.find(c => c.id === resolvedCustomerId)?.email : '') || '';

    const emailConfirmation = recipientEmail ? {
      sent: true,
      recipientEmail,
      sentAt: new Date().toISOString(),
      subject: `Order Confirmation #${trackingNumber} - ATAL Pakistan`,
      service: 'ATAL Automated Receipt Mailer (Simulated Service)'
    } : undefined;

    const newOrder: Order = {
      id: `ord-${Date.now()}`,
      orderNumber,
      trackingNumber,
      customerId: resolvedCustomerId || undefined,
      customerName,
      mobileNumber: cleanedMobile,
      email: recipientEmail,
      province,
      city,
      area: area || '',
      address,
      items: orderItems,
      subtotal,
      discount,
      shippingCharges,
      totalAmount,
      paymentMethod,
      paymentStatus: paymentMethod === 'cod' ? (storeSettings.codAdvanceShipping ? 'paid' : 'pending') : 'paid',
      transactionReference: finalTxId,
      transactionId: finalTxId,
      orderStatus: 'Pending Confirmation',
      createdAt: new Date().toISOString(),
      statusHistory: [
        { status: 'Pending Confirmation', timestamp: new Date().toISOString(), note: `Order received via ${paymentMethod.toUpperCase()} with Transaction ID: ${finalTxId}` }
      ],
      emailConfirmation
    };

    orders.unshift(newOrder);
    saveOrdersToDisk();
    saveProductsToDisk();
    console.log(`[ATAL Order Received] Tracking: ${trackingNumber}, TID: ${finalTxId}, Customer: ${customerName}, Amount: PKR ${totalAmount}`);
    if (emailConfirmation) {
      console.log(`[Simulated Email Service] Automated receipt sent to ${recipientEmail} for Order #${trackingNumber}`);
    }
    res.json({ success: true, order: newOrder, emailConfirmation });
  });

  // Resend or Send Simulated Order Receipt Email
  app.post('/api/orders/:idOrTracking/resend-email', (req, res) => {
    const { idOrTracking } = req.params;
    const { email } = req.body;
    const order = orders.find(o => o.id === idOrTracking || o.trackingNumber === idOrTracking || o.orderNumber === idOrTracking);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    const recipient = (email && typeof email === 'string' && email.trim()) || order.email;
    if (!recipient || !recipient.includes('@')) {
      return res.status(400).json({ error: 'Please provide a valid email address.' });
    }
    order.email = recipient;
    order.emailConfirmation = {
      sent: true,
      recipientEmail: recipient,
      sentAt: new Date().toISOString(),
      subject: `Order Confirmation #${order.trackingNumber} - ATAL Pakistan`,
      service: 'ATAL Automated Receipt Mailer (Simulated Service)'
    };
    saveOrdersToDisk();
    console.log(`[Simulated Email Service] Confirmation email re-dispatched to ${recipient} for Order #${order.trackingNumber}`);
    res.json({ 
      success: true, 
      emailConfirmation: order.emailConfirmation, 
      message: `Automated confirmation receipt successfully sent to ${recipient}` 
    });
  });

  // 4. Get Orders & Tracking
  app.get('/api/orders', (req, res) => {
    let result = [...orders];
    const { search, status } = req.query;
    if (search && typeof search === 'string') {
      const q = search.trim().toLowerCase();
      result = result.filter(o => 
        o.trackingNumber.includes(q) ||
        o.orderNumber.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.mobileNumber.includes(q) ||
        (o.transactionReference && o.transactionReference.toLowerCase().includes(q)) ||
        (o.transactionId && o.transactionId.toLowerCase().includes(q)) ||
        o.city.toLowerCase().includes(q)
      );
    }
    if (status && typeof status === 'string' && status !== 'all') {
      result = result.filter(o => o.orderStatus.toLowerCase() === status.toLowerCase());
    }
    res.json(result);
  });

  app.get('/api/orders/:id', (req, res) => {
    const { id } = req.params;
    const clean = id.trim().toLowerCase();
    const order = orders.find(o => 
      o.id.toLowerCase() === clean || 
      o.trackingNumber === clean || 
      o.orderNumber.toLowerCase() === clean || 
      o.orderNumber.replace('atal-', '').toLowerCase() === clean ||
      o.mobileNumber === clean ||
      o.mobileNumber.replace(/^(\+92|0)/, '') === clean.replace(/^(\+92|0)/, '') ||
      (o.transactionReference && o.transactionReference.toLowerCase() === clean) ||
      (o.transactionId && o.transactionId.toLowerCase() === clean)
    );
    if (!order) {
      return res.status(404).json({ error: 'Order not found. Please verify your 8-digit tracking number, phone number, or Transaction ID.' });
    }
    res.json(order);
  });

  // Update Order Status (Admin)
  app.put('/api/orders/:id/status', (req, res) => {
    const { id } = req.params;
    const { orderStatus, paymentStatus, note } = req.body;
    const order = orders.find(o => o.id === id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (orderStatus) {
      order.orderStatus = orderStatus;
      order.statusHistory.push({
        status: orderStatus,
        timestamp: new Date().toISOString(),
        note: note || `Status updated to ${orderStatus} by admin`
      });
    }

    if (paymentStatus) {
      order.paymentStatus = paymentStatus;
    }

    saveOrdersToDisk();
    res.json(order);
  });

  // Delete Order (Admin)
  app.delete('/api/orders/:id', (req, res) => {
    const { id } = req.params;
    orders = orders.filter(o => o.id !== id && o.trackingNumber !== id);
    saveOrdersToDisk();
    res.json({ success: true, message: 'Order removed successfully' });
  });

  // --------------------------------------------------------------------------
  // CUSTOMER ACCOUNT MANAGEMENT (Sign up via Email, WhatsApp, Password)
  // --------------------------------------------------------------------------

  // Register New Customer Account
  app.post('/api/customers/register', (req, res) => {
    try {
      const { name, email, whatsapp, password, address, city, province, area } = req.body;

      if (!name || typeof name !== 'string' || !name.trim()) {
        return res.status(400).json({ error: 'Please enter your full name.' });
      }

      if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        return res.status(400).json({ error: 'Please provide a valid email address.' });
      }

      if (!whatsapp || typeof whatsapp !== 'string' || !whatsapp.trim()) {
        return res.status(400).json({ error: 'Please provide your WhatsApp mobile number.' });
      }

      const normalizedPhone = normalizePakistaniPhone(whatsapp.trim());
      if (normalizedPhone.length < 10) {
        return res.status(400).json({ 
          error: 'Please provide a valid 11-digit mobile/WhatsApp number (e.g. 03001234567).' 
        });
      }

      if (!password || typeof password !== 'string' || password.trim().length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
      }

      const cleanEmail = email.trim().toLowerCase();

      // Check if email already registered
      const existingEmail = customers.find(c => c.email.toLowerCase() === cleanEmail);
      if (existingEmail) {
        return res.status(400).json({ error: 'An account with this email address already exists. Please log in.' });
      }

      // Check if WhatsApp already registered
      const existingPhone = customers.find(c => normalizePakistaniPhone(c.whatsapp) === normalizedPhone);
      if (existingPhone) {
        return res.status(400).json({ error: 'An account with this WhatsApp number already exists. Please log in.' });
      }

      const newCustomer: Customer = {
        id: `cust-${Date.now()}`,
        name: name.trim(),
        email: cleanEmail,
        whatsapp: normalizedPhone,
        password: password.trim(),
        createdAt: new Date().toISOString(),
        defaultAddress: address && city && province ? {
          address: address.trim(),
          city: city.trim(),
          province: province.trim(),
          area: area ? area.trim() : ''
        } : undefined
      };

      customers.unshift(newCustomer);
      saveCustomersToDisk();

      console.log(`[ATAL] New Customer Created: ${newCustomer.name} (${newCustomer.email}, WhatsApp: ${newCustomer.whatsapp})`);

      res.status(201).json({
        success: true,
        message: 'Account created successfully! Welcome to ATAL.',
        customer: sanitizeCustomer(newCustomer)
      });
    } catch (err: any) {
      console.error('Customer registration error:', err);
      res.status(500).json({ error: 'An error occurred while creating your account. Please try again.' });
    }
  });

  // Login Customer via Email OR WhatsApp Number + Password
  app.post('/api/customers/login', (req, res) => {
    try {
      const { identifier, password } = req.body;

      if (!identifier || typeof identifier !== 'string' || !identifier.trim()) {
        return res.status(400).json({ error: 'Please enter your email address or WhatsApp number.' });
      }

      if (!password || typeof password !== 'string') {
        return res.status(400).json({ error: 'Please enter your password.' });
      }

      const trimmed = identifier.trim();
      const cleanEmail = trimmed.toLowerCase();
      const normalizedPhone = normalizePakistaniPhone(trimmed);

      // Match by email OR by normalized WhatsApp number
      const customer = customers.find(c => 
        c.email.toLowerCase() === cleanEmail || 
        normalizePakistaniPhone(c.whatsapp) === normalizedPhone ||
        c.whatsapp.replace(/\D/g, '') === trimmed.replace(/\D/g, '')
      );

      if (!customer || customer.password.trim() !== password.trim()) {
        return res.status(401).json({ 
          error: 'Invalid credentials. Please check your email/WhatsApp number and password.' 
        });
      }

      res.json({
        success: true,
        message: `Welcome back, ${customer.name}!`,
        customer: sanitizeCustomer(customer)
      });
    } catch (err: any) {
      console.error('Customer login error:', err);
      res.status(500).json({ error: 'An error occurred while logging in. Please try again.' });
    }
  });

  // Get All Customers (Admin)
  app.get('/api/customers', (req, res) => {
    const list = customers.map(c => sanitizeCustomer(c));
    res.json(list);
  });

  // Get Single Customer Profile
  app.get('/api/customers/:id', (req, res) => {
    const { id } = req.params;
    const customer = customers.find(c => c.id === id);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json(sanitizeCustomer(customer));
  });

  // Update Customer Profile & Address
  app.put('/api/customers/:id', (req, res) => {
    try {
      const { id } = req.params;
      const customer = customers.find(c => c.id === id);
      if (!customer) {
        return res.status(404).json({ error: 'Customer not found' });
      }

      const { name, whatsapp, email, defaultAddress, currentPassword, newPassword } = req.body;

      if (name && typeof name === 'string' && name.trim()) {
        customer.name = name.trim();
      }

      if (email && typeof email === 'string' && email.trim()) {
        const cleanEmail = email.trim().toLowerCase();
        if (customers.some(c => c.id !== id && c.email.toLowerCase() === cleanEmail)) {
          return res.status(400).json({ error: 'This email is already in use by another account.' });
        }
        customer.email = cleanEmail;
      }

      if (whatsapp && typeof whatsapp === 'string' && whatsapp.trim()) {
        const norm = normalizePakistaniPhone(whatsapp.trim());
        if (!/^03[0-9]{9}$/.test(norm)) {
          return res.status(400).json({ error: 'Invalid Pakistani WhatsApp number.' });
        }
        if (customers.some(c => c.id !== id && normalizePakistaniPhone(c.whatsapp) === norm)) {
          return res.status(400).json({ error: 'This WhatsApp number is already registered to another account.' });
        }
        customer.whatsapp = norm;
      }

      if (defaultAddress) {
        customer.defaultAddress = {
          address: defaultAddress.address || '',
          city: defaultAddress.city || '',
          province: defaultAddress.province || '',
          area: defaultAddress.area || ''
        };
      }

      if (newPassword && typeof newPassword === 'string') {
        if (newPassword.length < 6) {
          return res.status(400).json({ error: 'New password must be at least 6 characters.' });
        }
        if (currentPassword && currentPassword !== customer.password) {
          return res.status(400).json({ error: 'Current password is incorrect.' });
        }
        customer.password = newPassword;
      }

      saveCustomersToDisk();
      res.json({
        success: true,
        message: 'Profile updated successfully!',
        customer: sanitizeCustomer(customer)
      });
    } catch (err: any) {
      console.error('Customer update error:', err);
      res.status(500).json({ error: 'Failed to update profile.' });
    }
  });

  // Delete Customer (Admin)
  app.delete('/api/customers/:id', (req, res) => {
    const { id } = req.params;
    customers = customers.filter(c => c.id !== id);
    saveCustomersToDisk();
    res.json({ success: true, message: 'Customer account deleted successfully' });
  });

  // Get Customer's Orders
  app.get('/api/customers/:id/orders', (req, res) => {
    const { id } = req.params;
    const customer = customers.find(c => c.id === id);
    if (!customer) {
      return res.status(404).json({ error: 'Customer not found' });
    }

    const normCustPhone = normalizePakistaniPhone(customer.whatsapp);
    const custEmail = customer.email.toLowerCase();

    const customerOrders = orders.filter(o => 
      o.customerId === customer.id ||
      (o.email && o.email.toLowerCase() === custEmail) ||
      normalizePakistaniPhone(o.mobileNumber) === normCustPhone
    );

    res.json(customerOrders);
  });

  // 5. Admin Stats & Dashboard
  app.get('/api/admin/stats', (req, res) => {
    const totalSales = orders.filter(o => o.orderStatus !== 'Cancelled').reduce((acc, o) => acc + o.totalAmount, 0);
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => o.orderStatus === 'Pending Confirmation' || o.orderStatus === 'Confirmed').length;
    const deliveredOrders = orders.filter(o => o.orderStatus === 'Delivered').length;
    const lowStockProducts = products.filter(p => p.stock < 10).length;

    res.json({
      totalSales,
      totalOrders,
      totalCustomers: customers.length,
      pendingOrders,
      deliveredOrders,
      totalProducts: products.length,
      lowStockProducts,
      recentOrders: orders.slice(0, 5)
    });
  });

  // --------------------------------------------------------------------------
  // ADMIN & EMPLOYEE PORTAL AUTHENTICATION (uatal.pk@gmail.com & ali@atal.com)
  // --------------------------------------------------------------------------

  // Staff / Admin Login
  app.post('/api/admin/login', (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
        return res.status(400).json({ error: 'Please enter both Email and Password.' });
      }

      const cleanEmail = email.trim().toLowerCase();
      const cleanPass = password.trim();
      const user = staffUsers.find(u => 
        u.email.toLowerCase() === cleanEmail || 
        u.name.toLowerCase() === cleanEmail
      );

      if (!user || user.password.trim() !== cleanPass) {
        return res.status(401).json({ error: 'Invalid admin or employee email or password.' });
      }

      console.log(`[Portal Login] User ${user.email} logged in with role: ${user.role}`);
      res.json({
        success: true,
        message: `Welcome to ATAL Portal, ${user.name}!`,
        user: sanitizeStaffUser(user)
      });
    } catch (err) {
      console.error('Portal login error:', err);
      res.status(500).json({ error: 'Internal server error during login.' });
    }
  });

  // Change Password (for employee or admin)
  app.post('/api/admin/change-password', (req, res) => {
    try {
      const { email, currentPassword, newPassword } = req.body;
      if (!email || !newPassword || typeof newPassword !== 'string' || newPassword.length < 6) {
        return res.status(400).json({ error: 'New password must be at least 6 characters long.' });
      }

      const cleanEmail = email.trim().toLowerCase();
      const user = staffUsers.find(u => u.email.toLowerCase() === cleanEmail);

      if (!user) {
        return res.status(404).json({ error: 'Staff account not found.' });
      }

      if (currentPassword && user.password !== currentPassword) {
        return res.status(400).json({ error: 'Current password does not match.' });
      }

      user.password = newPassword;
      saveStaffToDisk();
      console.log(`[Staff Portal] Password changed successfully for ${user.email}`);
      res.json({
        success: true,
        message: `Password for ${user.name} has been updated successfully!`,
        user: sanitizeStaffUser(user)
      });
    } catch (err) {
      console.error('Change password error:', err);
      res.status(500).json({ error: 'Failed to update password.' });
    }
  });

  // Get Staff List (Admin Only)
  app.get('/api/admin/staff', (req, res) => {
    res.json(staffUsers.map(u => sanitizeStaffUser(u)));
  });

  // Reset or Change any staff password (Admin Action)
  app.put('/api/admin/staff/:id/password', (req, res) => {
    const { id } = req.params;
    const { newPassword } = req.body;
    if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters.' });
    }
    const user = staffUsers.find(u => u.id === id);
    if (!user) {
      return res.status(404).json({ error: 'Staff user not found.' });
    }
    user.password = newPassword;
    saveStaffToDisk();
    res.json({
      success: true,
      message: `Password for ${user.name} (${user.email}) updated successfully!`,
      user: sanitizeStaffUser(user)
    });
  });

  // Add New Staff Member (Admin Only)
  app.post('/api/admin/staff', (req, res) => {
    const { name, email, role, password } = req.body;
    if (!name || !email || !password || password.length < 6) {
      return res.status(400).json({ error: 'Name, email, and password (at least 6 characters) are required.' });
    }
    const cleanEmail = email.trim().toLowerCase();
    if (staffUsers.some(u => u.email.toLowerCase() === cleanEmail)) {
      return res.status(400).json({ error: 'A staff account with this email address already exists.' });
    }
    const newStaff: StaffUser = {
      id: `staff-${Date.now()}`,
      name: name.trim(),
      email: cleanEmail,
      role: role === 'admin' ? 'admin' : 'employee',
      password: password.trim(),
      isPasswordChangeable: true,
      createdAt: new Date().toISOString()
    };
    staffUsers.push(newStaff);
    saveStaffToDisk();
    console.log(`[Staff Portal] New staff member added: ${newStaff.name} (${newStaff.email}, role: ${newStaff.role})`);
    res.json({
      success: true,
      message: `Staff member ${newStaff.name} added successfully!`,
      user: sanitizeStaffUser(newStaff)
    });
  });

  // Delete Staff Member (Admin Only)
  app.delete('/api/admin/staff/:id', (req, res) => {
    const { id } = req.params;
    const user = staffUsers.find(u => u.id === id);
    if (!user) {
      return res.status(404).json({ error: 'Staff member not found.' });
    }
    if (user.email.toLowerCase() === 'uatal.pk@gmail.com') {
      return res.status(400).json({ error: 'Cannot remove the primary administrator account.' });
    }
    staffUsers = staffUsers.filter(u => u.id !== id);
    saveStaffToDisk();
    console.log(`[Staff Portal] Staff member removed: ${user.name} (${user.email})`);
    res.json({ success: true, message: 'Staff member removed successfully.' });
  });

  // 6. Store Settings
  app.get('/api/settings', (req, res) => {
    res.json(storeSettings);
  });

  app.put('/api/settings', (req, res) => {
    storeSettings = { ...storeSettings, ...req.body };
    saveSettingsToDisk();
    res.json(storeSettings);
  });

  // 7. Backup / Data Import & Export (Admin)
  app.get('/api/admin/export-data', (req, res) => {
    try {
      const backupData = {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        storeName: storeSettings.storeName || 'ATAL',
        products,
        categories,
        carouselSlides,
        storeSettings,
        orders,
        customers: customers.map(sanitizeCustomer),
        staff: staffUsers.map(sanitizeStaffUser)
      };
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename=atal_store_backup_${Date.now()}.json`);
      res.json(backupData);
    } catch (e) {
      res.status(500).json({ error: 'Failed to generate store backup export' });
    }
  });

  app.post('/api/admin/import-data', (req, res) => {
    try {
      const data = req.body;
      if (!data || (typeof data !== 'object' && !Array.isArray(data))) {
        return res.status(400).json({ error: 'Invalid backup payload format.' });
      }

      let importedCount = { products: 0, categories: 0, carousel: 0, orders: 0, customers: 0 };

      // Case A: Direct Array Import
      if (Array.isArray(data)) {
        if (data.length > 0) {
          const first = data[0];
          if (first && (first.price !== undefined || first.categoryId !== undefined || first.variants !== undefined)) {
            products = data;
            saveProductsToDisk();
            importedCount.products = products.length;
          } else if (first && (first.subcategories !== undefined || (typeof first.id === 'string' && first.id.startsWith('cat-')))) {
            categories = data;
            saveCategoriesToDisk();
            importedCount.categories = categories.length;
          } else if (first && (first.badge !== undefined || first.buttonText !== undefined || first.discount !== undefined)) {
            carouselSlides = data;
            saveCarouselToDisk();
            importedCount.carousel = carouselSlides.length;
          }
        }
      } else {
        // Case B: Full Store / Multi-entity Object Import
        const prods = data.products || data.items || data.catalog;
        if (Array.isArray(prods)) {
          products = prods;
          saveProductsToDisk();
          importedCount.products = products.length;
        }

        const cats = data.categories || data.cats;
        if (Array.isArray(cats)) {
          categories = cats;
          saveCategoriesToDisk();
          importedCount.categories = categories.length;
        }

        const slides = data.carouselSlides || data.carousel || data.slides || data.heroSlides;
        if (Array.isArray(slides)) {
          carouselSlides = slides;
          saveCarouselToDisk();
          importedCount.carousel = carouselSlides.length;
        }

        const settings = data.storeSettings || data.settings;
        if (settings && typeof settings === 'object') {
          storeSettings = { ...DEFAULT_STORE_SETTINGS, ...settings };
          saveSettingsToDisk();
        }

        const ords = data.orders;
        if (Array.isArray(ords)) {
          orders = ords;
          saveOrdersToDisk();
          importedCount.orders = orders.length;
        }

        const custs = data.customers;
        if (Array.isArray(custs)) {
          customers = custs;
          saveCustomersToDisk();
          importedCount.customers = customers.length;
        }
      }

      console.log('[Admin Import] Store data imported successfully:', importedCount);
      res.json({
        success: true,
        message: 'Store data imported and saved successfully!',
        importedCount
      });
    } catch (e) {
      console.error('Error importing backup data:', e);
      res.status(500).json({ error: 'Failed to import store data. Please check JSON file format.' });
    }
  });

  // Vite integration / Static production serving
  const isProduction = process.env.NODE_ENV === 'production';
  const distPath = path.join(__dirname, 'dist');

  if (isProduction && fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  app.listen(port, '0.0.0.0', () => {
    console.log(`ATAL Store server running on http://0.0.0.0:${port}`);
  });
}

createServer();
