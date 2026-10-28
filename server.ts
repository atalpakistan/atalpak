import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import zlib from 'zlib';
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
const HOMEPAGE_SECTIONS_FILE = path.join(__dirname, 'homepage_sections_data.json');
const LAUNCH_NOTIFICATIONS_FILE = path.join(__dirname, 'launch_notifications_data.json');
const BACKUPS_DIR = path.join(__dirname, 'backups');
if (!fs.existsSync(BACKUPS_DIR)) {
  try {
    fs.mkdirSync(BACKUPS_DIR, { recursive: true });
  } catch (err) {
    console.error('Failed to create backups directory:', err);
  }
}

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
  isActive?: boolean;
  status?: 'active' | 'inactive';
  createdAt: string;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  subcategories: string[];
  description: string;
  isActive?: boolean;
  status?: 'active' | 'inactive';
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

export interface SpotlightItem {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  image: string;
  buttonText: string;
  buttonLink: string;
  layoutType?: 'banner' | 'card' | 'grid';
  badge?: string;
  price?: number;
  originalPrice?: number;
}

export interface LaunchSoonItem {
  id: string;
  productId?: string;
  name: string;
  description: string;
  image: string;
  badge?: string;
  expectedLaunchDate?: string;
  showCountdown?: boolean;
  previewSlug?: string;
  displayOrder?: number;
}

export interface HomepageSectionsConfig {
  newLaunch: {
    enabled?: boolean;
    title?: string;
    subtitle?: string;
    productIds?: string[];
    availableNow: {
      enabled: boolean;
      title: string;
      subtitle: string;
      productIds: string[];
    };
    launchSoon: {
      enabled: boolean;
      title: string;
      subtitle: string;
      items: LaunchSoonItem[];
    };
  };
  spotlight: {
    enabled: boolean;
    title: string;
    subtitle: string;
    layoutStyle: 'banner' | 'carousel' | 'grid';
    items: SpotlightItem[];
  };
}

const DEFAULT_LAUNCH_SOON_ITEMS: LaunchSoonItem[] = [
  {
    id: 'launch-soon-1',
    productId: 'prod-festive-1',
    name: 'ATAL 24K Royal Velvet Couture Suite',
    description: 'Ultra-exclusive winter bridal & festive pret ensemble hand-woven with pure metallic tilla and velvet dupatta.',
    image: '/assets/atal_festive_pret_1792525761752.jpg',
    badge: 'COMING SOON',
    expectedLaunchDate: '2026-11-20T18:00:00',
    showCountdown: true,
    previewSlug: 'atal-luxury-festive-pret-couture',
    displayOrder: 1
  },
  {
    id: 'launch-soon-2',
    name: 'ATAL Audio AeroBeats Pro Wireless Headphones',
    description: 'Flagship hybrid active noise cancelling over-ear headphones with 60-hour playback and spatial audio.',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
    badge: 'EXCLUSIVE TEASER',
    expectedLaunchDate: '2026-11-28T12:00:00',
    showCountdown: true,
    displayOrder: 2
  },
  {
    id: 'launch-soon-3',
    name: 'ATAL Botanicals Pure Organic Saffron Night Elixir',
    description: 'Hand-picked Kashmiri saffron blended with Moroccan argan oil for intense nocturnal skin renewal.',
    image: 'https://images.unsplash.com/photo-1608248597359-2e094770220c?auto=format&fit=crop&w=800&q=80',
    badge: 'LIMITED PRE-DROP',
    expectedLaunchDate: '2026-12-05T00:00:00',
    showCountdown: true,
    displayOrder: 3
  }
];

const DEFAULT_SPOTLIGHT_ITEMS: SpotlightItem[] = [
  {
    id: 'spot-1',
    title: 'ATAL 3D Signature Luxury Bag',
    subtitle: 'Emerald Green & 24K Gold Hardware',
    description: 'Iconic architectural designer bag crafted with precision and elegance for modern trendsetters across Pakistan.',
    image: '/assets/aistudio/WhatsApp_Image_2026-09-29_at_12.21.56_PM_187de251.jpeg',
    buttonText: 'SHOP LUXURY BAG',
    buttonLink: '/product/atal-signature-3d-luxury-collection',
    layoutType: 'banner',
    badge: 'LIMITED EDITION',
    price: 3950,
    originalPrice: 5490
  },
  {
    id: 'spot-2',
    title: 'ATAL Luxury Festive Pret Couture',
    subtitle: 'Heritage Embroidered Velvet & Raw Silk',
    description: 'Hand-embroidered zardozi details, pure organza dupatta, and deep emerald silhouette designed for weddings.',
    image: '/assets/atal_festive_pret_1792525761752.jpg',
    buttonText: 'EXPLORE PRET',
    buttonLink: '/product/atal-luxury-festive-pret-couture',
    layoutType: 'banner',
    badge: 'FESTIVE COUTURE',
    price: 4890,
    originalPrice: 6800
  },
  {
    id: 'spot-3',
    title: 'ATAL Royal Oud Oriental Fragrance',
    subtitle: '24-Hour Long Lasting Cambodian Oud',
    description: 'Warm amber, smoky cedarwood, and pure Cambodian oud blended into exquisite crystal glass bottles.',
    image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=800&q=80',
    buttonText: 'DISCOVER SCENTS',
    buttonLink: '/category/cosmetics-perfume',
    layoutType: 'card',
    badge: 'BEST SELLER',
    price: 2499,
    originalPrice: 4500
  }
];

const DEFAULT_HOMEPAGE_SECTIONS: HomepageSectionsConfig = {
  newLaunch: {
    enabled: true,
    title: 'New Launch',
    subtitle: "Discover What's New",
    productIds: ['prod-festive-1', 'prod-festive-2', 'prod-1', 'prod-2', 'prod-3', 'prod-4'],
    availableNow: {
      enabled: true,
      title: 'New Launch',
      subtitle: "Discover What's New",
      productIds: ['prod-festive-1', 'prod-festive-2', 'prod-1', 'prod-2', 'prod-3', 'prod-4']
    },
    launchSoon: {
      enabled: true,
      title: 'Launch Soon',
      subtitle: 'Something Exciting Is Coming',
      items: DEFAULT_LAUNCH_SOON_ITEMS
    }
  },
  spotlight: {
    enabled: true,
    title: '🌟 ATAL Spotlight & Featured Collections',
    subtitle: 'Handpicked seasonal highlights, exclusive offers, and signature collections',
    layoutStyle: 'carousel',
    items: DEFAULT_SPOTLIGHT_ITEMS
  }
};

function normalizeHomepageSections(parsed: any): HomepageSectionsConfig {
  const legacyProductIds = Array.isArray(parsed?.newLaunch?.productIds) && parsed.newLaunch.productIds.length > 0
    ? parsed.newLaunch.productIds
    : DEFAULT_HOMEPAGE_SECTIONS.newLaunch.availableNow.productIds;
  const legacyEnabled = parsed?.newLaunch?.enabled !== undefined ? Boolean(parsed.newLaunch.enabled) : true;
  const legacyTitle = parsed?.newLaunch?.title || 'New Launch';
  const legacySubtitle = parsed?.newLaunch?.subtitle || "Discover What's New";

  const availableNow = {
    enabled: parsed?.newLaunch?.availableNow?.enabled !== undefined 
      ? Boolean(parsed.newLaunch.availableNow.enabled) 
      : legacyEnabled,
    title: parsed?.newLaunch?.availableNow?.title || legacyTitle,
    subtitle: parsed?.newLaunch?.availableNow?.subtitle || legacySubtitle,
    productIds: Array.isArray(parsed?.newLaunch?.availableNow?.productIds) 
      ? parsed.newLaunch.availableNow.productIds 
      : legacyProductIds
  };

  const launchSoon = {
    enabled: parsed?.newLaunch?.launchSoon?.enabled !== undefined 
      ? Boolean(parsed.newLaunch.launchSoon.enabled) 
      : true,
    title: parsed?.newLaunch?.launchSoon?.title || 'Launch Soon',
    subtitle: parsed?.newLaunch?.launchSoon?.subtitle || 'Something Exciting Is Coming',
    items: Array.isArray(parsed?.newLaunch?.launchSoon?.items) && parsed.newLaunch.launchSoon.items.length > 0
      ? parsed.newLaunch.launchSoon.items 
      : DEFAULT_LAUNCH_SOON_ITEMS
  };

  const spotlight = {
    enabled: parsed?.spotlight?.enabled !== undefined ? Boolean(parsed.spotlight.enabled) : true,
    title: parsed?.spotlight?.title || '🌟 ATAL Spotlight & Featured Collections',
    subtitle: parsed?.spotlight?.subtitle || 'Handpicked seasonal highlights, exclusive offers, and signature collections',
    layoutStyle: (parsed?.spotlight?.layoutStyle as any) || 'carousel',
    items: Array.isArray(parsed?.spotlight?.items) && parsed.spotlight.items.length > 0
      ? parsed.spotlight.items 
      : DEFAULT_SPOTLIGHT_ITEMS
  };

  return {
    newLaunch: {
      enabled: availableNow.enabled || launchSoon.enabled,
      title: availableNow.title,
      subtitle: availableNow.subtitle,
      productIds: availableNow.productIds,
      availableNow,
      launchSoon
    },
    spotlight
  };
}

function loadHomepageSectionsFromDisk(): HomepageSectionsConfig {
  try {
    if (fs.existsSync(HOMEPAGE_SECTIONS_FILE)) {
      const data = fs.readFileSync(HOMEPAGE_SECTIONS_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      if (parsed && typeof parsed === 'object') {
        const normalized = normalizeHomepageSections(parsed);
        // Save normalized structure if missing sub-keys
        if (!parsed?.newLaunch?.availableNow || !parsed?.newLaunch?.launchSoon) {
          fs.writeFileSync(HOMEPAGE_SECTIONS_FILE, JSON.stringify(normalized, null, 2), 'utf-8');
        }
        return normalized;
      }
    }
  } catch (err) {
    console.error('Error reading homepage sections from disk:', err);
  }
  try {
    fs.writeFileSync(HOMEPAGE_SECTIONS_FILE, JSON.stringify(DEFAULT_HOMEPAGE_SECTIONS, null, 2), 'utf-8');
  } catch (e) {
    console.error('Failed to save default homepage sections to disk:', e);
  }
  return JSON.parse(JSON.stringify(DEFAULT_HOMEPAGE_SECTIONS));
}

let homepageSections = loadHomepageSectionsFromDisk();

function saveHomepageSectionsToDisk() {
  try {
    fs.writeFileSync(HOMEPAGE_SECTIONS_FILE, JSON.stringify(homepageSections, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving homepage sections to disk:', err);
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
    const { name, slug, image, subcategories, description, isActive } = req.body;
    const isAct = isActive !== undefined ? Boolean(isActive) : true;
    const newCat: Category = {
      id: `cat-${Date.now()}`,
      name,
      slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      image: image || 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80',
      subcategories: subcategories || [],
      description: description || '',
      isActive: isAct,
      status: isAct ? 'active' : 'inactive'
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
    const isAct = req.body.isActive !== undefined ? Boolean(req.body.isActive) : categories[idx].isActive;
    categories[idx] = { 
      ...categories[idx], 
      ...req.body,
      isActive: isAct,
      status: isAct !== false ? 'active' : 'inactive'
    };
    saveCategoriesToDisk();
    res.json(categories[idx]);
  });

  // Toggle Category Status (ON / OFF)
  app.put('/api/categories/:id/toggle-status', (req, res) => {
    const { id } = req.params;
    const idx = categories.findIndex(c => c.id === id);
    if (idx === -1) {
      return res.status(404).json({ error: 'Category not found' });
    }
    const currentActive = categories[idx].isActive !== false;
    const newActive = !currentActive;
    categories[idx].isActive = newActive;
    categories[idx].status = newActive ? 'active' : 'inactive';
    saveCategoriesToDisk();
    res.json({
      success: true,
      id,
      isActive: newActive,
      status: categories[idx].status,
      category: categories[idx]
    });
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
    const isAct = data.isActive !== undefined ? Boolean(data.isActive) : true;
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
      isActive: isAct,
      status: isAct ? 'active' : 'inactive',
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
    const isAct = req.body.isActive !== undefined ? Boolean(req.body.isActive) : products[index].isActive;
    products[index] = { 
      ...products[index], 
      ...req.body,
      isActive: isAct,
      status: isAct !== false ? 'active' : 'inactive'
    };
    saveProductsToDisk();
    res.json(products[index]);
  });

  // Toggle Product Status (ON / OFF)
  app.put('/api/products/:id/toggle-status', (req, res) => {
    const { id } = req.params;
    const index = products.findIndex(p => p.id === id);
    if (index === -1) {
      return res.status(404).json({ error: 'Product not found' });
    }
    const currentActive = products[index].isActive !== false;
    const newActive = !currentActive;
    products[index].isActive = newActive;
    products[index].status = newActive ? 'active' : 'inactive';
    saveProductsToDisk();
    res.json({
      success: true,
      id,
      isActive: newActive,
      status: products[index].status,
      product: products[index]
    });
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
      const inputDigits = trimmed.replace(/\D/g, '');

      // Match by email OR by normalized WhatsApp number OR digit suffix
      const customer = customers.find(c => {
        if (!c) return false;
        const cEmail = (c.email || '').trim().toLowerCase();
        const cPhone = normalizePakistaniPhone(c.whatsapp || '');
        const cDigits = (c.whatsapp || '').replace(/\D/g, '');

        const matchesEmail = cEmail.length > 0 && cEmail === cleanEmail;
        const matchesPhone = (cPhone.length > 0 && cPhone === normalizedPhone) ||
                             (inputDigits.length >= 7 && cDigits.endsWith(inputDigits.slice(-10)));
        return matchesEmail || matchesPhone;
      });

      if (!customer) {
        return res.status(401).json({ 
          error: 'No account found matching that Email or WhatsApp number. Please check your details or create a new account.' 
        });
      }

      if (!customer.password || customer.password.trim() !== password.trim()) {
        return res.status(401).json({ 
          error: 'Incorrect password. Please verify your password and try again.' 
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

  // Homepage Sections (New Launch: Available Now & Launch Soon, and Spotlight)
  app.get('/api/homepage-sections', (req, res) => {
    res.json(homepageSections);
  });

  app.put('/api/homepage-sections', (req, res) => {
    try {
      const { newLaunch, spotlight } = req.body || {};
      if (newLaunch && typeof newLaunch === 'object') {
        const currentNL = homepageSections.newLaunch;
        const updatedAvailable = newLaunch.availableNow ? { ...currentNL.availableNow, ...newLaunch.availableNow } : currentNL.availableNow;
        const updatedSoon = newLaunch.launchSoon ? { ...currentNL.launchSoon, ...newLaunch.launchSoon } : currentNL.launchSoon;

        homepageSections.newLaunch = {
          ...currentNL,
          ...newLaunch,
          availableNow: updatedAvailable,
          launchSoon: updatedSoon,
          enabled: updatedAvailable.enabled || updatedSoon.enabled,
          productIds: updatedAvailable.productIds
        };
      }

      if (spotlight && typeof spotlight === 'object') {
        homepageSections.spotlight = {
          ...homepageSections.spotlight,
          ...spotlight,
          items: Array.isArray(spotlight.items) ? spotlight.items : homepageSections.spotlight.items
        };
      }

      saveHomepageSectionsToDisk();
      res.json({
        success: true,
        message: 'Homepage sections configuration updated successfully!',
        homepageSections
      });
    } catch (e: any) {
      console.error('Error updating homepage sections:', e);
      res.status(500).json({ error: `Failed to update homepage sections: ${e.message}` });
    }
  });

  // Move product from Launch Soon to New Launch (Available Now)
  app.post('/api/homepage-sections/move-to-available', (req, res) => {
    try {
      const { itemId, targetProductId } = req.body || {};
      const launchItem = homepageSections.newLaunch.launchSoon.items.find(i => i.id === itemId);
      if (!launchItem) {
        return res.status(404).json({ error: 'Launch Soon item not found' });
      }

      const prodIdToAdd = targetProductId || launchItem.productId || launchItem.id;
      // Add to availableNow if not already present
      if (!homepageSections.newLaunch.availableNow.productIds.includes(prodIdToAdd)) {
        homepageSections.newLaunch.availableNow.productIds.unshift(prodIdToAdd);
      }
      // Remove from launchSoon
      homepageSections.newLaunch.launchSoon.items = homepageSections.newLaunch.launchSoon.items.filter(i => i.id !== itemId);
      homepageSections.newLaunch.productIds = homepageSections.newLaunch.availableNow.productIds;
      saveHomepageSectionsToDisk();

      res.json({
        success: true,
        message: `"${launchItem.name}" has been successfully moved to New Launch (Available Now)!`,
        homepageSections
      });
    } catch (e: any) {
      console.error('Error moving item to available now:', e);
      res.status(500).json({ error: e.message });
    }
  });

  // Customer notification registration for Launch Soon
  app.post('/api/launch-soon/notify', (req, res) => {
    try {
      const { itemId, itemName, email, whatsapp, customerName } = req.body || {};
      if (!itemId || (!email && !whatsapp)) {
        return res.status(400).json({ error: 'Please provide an email or WhatsApp number to receive notification.' });
      }
      let notifications: any[] = [];
      try {
        if (fs.existsSync(LAUNCH_NOTIFICATIONS_FILE)) {
          notifications = JSON.parse(fs.readFileSync(LAUNCH_NOTIFICATIONS_FILE, 'utf-8'));
        }
      } catch (err) {
        notifications = [];
      }
      const newNotification = {
        id: `notif-${Date.now()}`,
        itemId,
        itemName: itemName || 'Coming Soon Item',
        email: email ? email.trim().toLowerCase() : '',
        whatsapp: whatsapp ? normalizePakistaniPhone(whatsapp) : '',
        customerName: customerName || 'Valued Customer',
        createdAt: new Date().toISOString()
      };
      notifications.unshift(newNotification);
      fs.writeFileSync(LAUNCH_NOTIFICATIONS_FILE, JSON.stringify(notifications, null, 2), 'utf-8');
      console.log(`[Launch Soon Notification Registered] ${newNotification.customerName} for ${newNotification.itemName}`);
      res.json({
        success: true,
        message: `You're on the VIP waitlist! We will notify you via ${whatsapp ? 'WhatsApp' : 'Email'} the moment "${newNotification.itemName}" is officially launched.`
      });
    } catch (err: any) {
      console.error('Error registering launch notification:', err);
      res.status(500).json({ error: 'Failed to register launch alert.' });
    }
  });

  // --------------------------------------------------------------------------
  // 7. COMPREHENSIVE DATA MANAGEMENT, BACKUPS, EXPORTS & RESTORE SYSTEM
  // --------------------------------------------------------------------------

  // Helper: Create full snapshot backup on server disk
  function createBackupSnapshot(note = 'Manual Snapshot') {
    try {
      if (!fs.existsSync(BACKUPS_DIR)) {
        fs.mkdirSync(BACKUPS_DIR, { recursive: true });
      }
      const id = `backup-${Date.now()}`;
      const snapshot = {
        id,
        note,
        version: '2.0',
        createdAt: new Date().toISOString(),
        storeName: storeSettings.storeName || 'ATAL',
        counts: {
          products: products.length,
          categories: categories.length,
          carouselSlides: carouselSlides.length,
          orders: orders.length,
          customers: customers.length
        },
        products,
        categories,
        carouselSlides,
        storeSettings,
        homepageSections,
        orders,
        customers: customers.map(sanitizeCustomer),
        staff: staffUsers.map(sanitizeStaffUser)
      };
      const filePath = path.join(BACKUPS_DIR, `${id}.json`);
      fs.writeFileSync(filePath, JSON.stringify(snapshot, null, 2), 'utf-8');
      const stats = fs.statSync(filePath);
      return {
        id,
        filename: `${id}.json`,
        note,
        createdAt: snapshot.createdAt,
        sizeBytes: stats.size,
        counts: snapshot.counts
      };
    } catch (err) {
      console.error('Error creating backup snapshot:', err);
      return null;
    }
  }

  // Helper: List all backup snapshots on server disk
  function listBackupSnapshots() {
    try {
      if (!fs.existsSync(BACKUPS_DIR)) {
        fs.mkdirSync(BACKUPS_DIR, { recursive: true });
        return [];
      }
      const files = fs.readdirSync(BACKUPS_DIR).filter(f => f.endsWith('.json'));
      const list: any[] = [];
      for (const f of files) {
        try {
          const fullPath = path.join(BACKUPS_DIR, f);
          const stats = fs.statSync(fullPath);
          const raw = fs.readFileSync(fullPath, 'utf-8');
          const content = JSON.parse(raw);
          list.push({
            id: content.id || f.replace('.json', ''),
            filename: f,
            note: content.note || 'System Backup Snapshot',
            createdAt: content.createdAt || stats.mtime.toISOString(),
            sizeBytes: stats.size,
            counts: content.counts || {
              products: Array.isArray(content.products) ? content.products.length : 0,
              categories: Array.isArray(content.categories) ? content.categories.length : 0,
              carouselSlides: Array.isArray(content.carouselSlides) ? content.carouselSlides.length : 0,
              orders: Array.isArray(content.orders) ? content.orders.length : 0,
              customers: Array.isArray(content.customers) ? content.customers.length : 0
            }
          });
        } catch (e) {
          // ignore corrupted files
        }
      }
      return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch (err) {
      console.error('Error listing backup snapshots:', err);
      return [];
    }
  }

  function parseActiveBoolean(val: any): boolean {
    if (val === undefined || val === null || val === '') return true;
    if (typeof val === 'boolean') return val;
    if (typeof val === 'number') return val !== 0;
    const s = String(val).trim().toLowerCase();
    if (s === 'off' || s === 'inactive' || s === 'false' || s === '0' || s === 'no' || s === 'disabled') {
      return false;
    }
    return true;
  }

  function isCategoryObject(obj: any): boolean {
    if (!obj || typeof obj !== 'object') return false;
    if (obj.price !== undefined || obj.variants !== undefined || obj.subcategoryId !== undefined) {
      return false;
    }
    if (obj.subcategories !== undefined || obj.parentId !== undefined || obj.parentCategoryId !== undefined) {
      return true;
    }
    if (typeof obj.id === 'string' && (obj.id.startsWith('cat-') || obj.id.startsWith('category-'))) {
      return true;
    }
    if (obj.name && obj.slug && obj.categoryId === undefined) {
      return true;
    }
    return false;
  }

  function isProductObject(obj: any): boolean {
    if (!obj || typeof obj !== 'object') return false;
    if (obj.price !== undefined || obj.variants !== undefined || obj.subcategoryId !== undefined || obj.sku !== undefined) {
      return true;
    }
    if (obj.categoryId !== undefined && (obj.price !== undefined || obj.name !== undefined)) {
      return true;
    }
    return false;
  }

  // Standard JSON Schema Validator & Extractor (JSON ONLY)
  function parseAndValidateJsonBackup(
    rawContent: any,
    directData?: any
  ): {
    success: boolean;
    error?: string;
    errors?: string[];
    warnings?: string[];
    appName?: string;
    backupType?: 'full' | 'categories' | 'products' | 'carousel' | 'settings';
    schemaVersion?: number;
    exportedAt?: string;
    data?: {
      products?: any[];
      categories?: any[];
      carouselSlides?: any[];
      storeSettings?: any;
      homepageSections?: any;
      orders?: any[];
      customers?: any[];
    };
    stats?: any;
    categoryIntegrity?: any;
    productIntegrity?: any;
    sampleProducts?: any[];
    sampleCategories?: any[];
  } {
    let target = directData;

    // 1. If string is passed, validate it is strict JSON
    if ((!target || (typeof target === 'object' && Object.keys(target).length === 0)) && rawContent !== undefined) {
      if (typeof rawContent !== 'string') {
        target = rawContent;
      } else {
        let str = rawContent;

        // Check for empty content
        if (!str || !str.trim()) {
          return {
            success: false,
            error: 'The selected file is empty. Please select a valid JSON backup file with content.',
            errors: ['The selected file is empty. Please select a valid JSON backup file with content.']
          };
        }

        // Check for non-JSON file headers (CSV, ZIP, binary)
        const trimmed = str.trim();
        if (
          trimmed.startsWith('PK\x03\x04') ||
          trimmed.startsWith('data:application/zip') ||
          trimmed.startsWith('data:application/x-zip') ||
          trimmed.startsWith('data:application/octet-stream')
        ) {
          return {
            success: false,
            error: 'ZIP archives are not supported. Only .json backup files are accepted.',
            errors: ['ZIP archives are not supported. Only .json backup files are accepted.']
          };
        }

        // Strip UTF-8 BOM if present
        str = str.replace(/^\uFEFF/, '').trim();

        // Strip markdown code fences if user pasted into raw input
        str = str.replace(/^```[a-zA-Z]*\r?\n/, '').replace(/\r?\n```\s*$/, '').trim();

        // Quick check if string starts with JSON brackets
        if (!str.startsWith('{') && !str.startsWith('[')) {
          return {
            success: false,
            error: 'Unsupported file format. Website data import requires a valid .json file. Non-JSON formats (CSV, Excel, XML, or plain text) are not accepted.',
            errors: ['Unsupported file format. Website data import requires a valid .json file. Non-JSON formats (CSV, Excel, XML, or plain text) are not accepted.']
          };
        }

        // Parse JSON
        try {
          target = JSON.parse(str);
        } catch (e: any) {
          return {
            success: false,
            error: `Invalid JSON syntax: ${e.message}. Please verify the file is well-formed JSON.`,
            errors: [`Invalid JSON syntax: ${e.message}. Please verify the file is well-formed JSON.`]
          };
        }
      }
    }

    if (!target || typeof target !== 'object') {
      return {
        success: false,
        error: 'Invalid file format. The file does not contain a valid JSON object or array.',
        errors: ['Invalid file format. The file does not contain a valid JSON object or array.']
      };
    }

    // 2. Validate schemaVersion if provided
    let schemaVersion = 1;
    if (target.schemaVersion !== undefined) {
      if (typeof target.schemaVersion !== 'number' || target.schemaVersion < 1) {
        return {
          success: false,
          error: `Unsupported schema version: "${target.schemaVersion}". This website supports schema version 1.`,
          errors: [`Unsupported schema version: "${target.schemaVersion}". This website supports schema version 1.`]
        };
      }
      schemaVersion = target.schemaVersion;
    }

    const appName = target.appName || 'ATAL Store';
    let backupType: 'full' | 'categories' | 'products' | 'carousel' | 'settings' = target.backupType || 'full';
    const exportedAt = target.exportedAt || new Date().toISOString();

    // 3. Extract Collections from data container or unwrap
    let container = target.data !== undefined ? target.data : target;

    // Handle nested envelope wrappers gracefully
    while (container && typeof container === 'object' && !Array.isArray(container)) {
      if (
        container.products ||
        container.categories ||
        container.carousel ||
        container.carouselSlides ||
        container.settings ||
        container.storeSettings ||
        container.homepageSections
      ) {
        break;
      }
      if (container.data && typeof container.data === 'object') {
        container = container.data;
      } else if (container.backup && typeof container.backup === 'object') {
        container = container.backup;
      } else if (container.payload && typeof container.payload === 'object') {
        container = container.payload;
      } else {
        break;
      }
    }

    const normalizedData: {
      products?: any[];
      categories?: any[];
      carouselSlides?: any[];
      storeSettings?: any;
      homepageSections?: any;
      orders?: any[];
      customers?: any[];
    } = {};

    if (Array.isArray(container)) {
      if (container.length > 0) {
        const first = container[0];
        if (isCategoryObject(first)) {
          normalizedData.categories = container;
          backupType = 'categories';
        } else if (isProductObject(first)) {
          normalizedData.products = container;
          backupType = 'products';
        } else if (first && (first.badge !== undefined || first.buttonText !== undefined)) {
          normalizedData.carouselSlides = container;
          backupType = 'carousel';
        } else {
          normalizedData.products = container;
          backupType = 'products';
        }
      } else {
        normalizedData.products = [];
      }
    } else if (typeof container === 'object' && container !== null) {
      if (Array.isArray(container.categories)) normalizedData.categories = container.categories;
      else if (Array.isArray(container.cats)) normalizedData.categories = container.cats;
      else if ('categories' in container) normalizedData.categories = Array.isArray(container.categories) ? container.categories : [];

      if (Array.isArray(container.products)) normalizedData.products = container.products;
      else if (Array.isArray(container.items)) normalizedData.products = container.items;
      else if (Array.isArray(container.catalog)) normalizedData.products = container.catalog;
      else if ('products' in container) normalizedData.products = Array.isArray(container.products) ? container.products : [];

      if (Array.isArray(container.carousel)) normalizedData.carouselSlides = container.carousel;
      else if (Array.isArray(container.carouselSlides)) normalizedData.carouselSlides = container.carouselSlides;
      else if (Array.isArray(container.slides)) normalizedData.carouselSlides = container.slides;
      else if ('carousel' in container || 'carouselSlides' in container) normalizedData.carouselSlides = Array.isArray(container.carousel || container.carouselSlides) ? (container.carousel || container.carouselSlides) : [];

      if (container.settings && typeof container.settings === 'object') normalizedData.storeSettings = container.settings;
      else if (container.storeSettings && typeof container.storeSettings === 'object') normalizedData.storeSettings = container.storeSettings;
      else if ('settings' in container || 'storeSettings' in container) normalizedData.storeSettings = container.settings || container.storeSettings || {};

      if (container.homepageSections && typeof container.homepageSections === 'object') normalizedData.homepageSections = container.homepageSections;
      else if ('homepageSections' in container) normalizedData.homepageSections = container.homepageSections || {};

      if (Array.isArray(container.orders)) normalizedData.orders = container.orders;
      else if ('orders' in container) normalizedData.orders = [];

      if (Array.isArray(container.customers)) normalizedData.customers = container.customers;
      else if ('customers' in container) normalizedData.customers = [];

      // Infer backupType if not explicitly provided
      if (!target.backupType) {
        const hasCats = normalizedData.categories !== undefined;
        const hasProds = normalizedData.products !== undefined;
        const hasCarousel = normalizedData.carouselSlides !== undefined;
        const hasSettings = normalizedData.storeSettings !== undefined;

        if (hasCats && !hasProds && !hasCarousel && !hasSettings) {
          backupType = 'categories';
        } else if (hasProds && !hasCats && !hasCarousel && !hasSettings) {
          backupType = 'products';
        } else if (hasCarousel && !hasCats && !hasProds && !hasSettings) {
          backupType = 'carousel';
        } else if (hasSettings && !hasCats && !hasProds && !hasCarousel) {
          backupType = 'settings';
        } else {
          backupType = 'full';
        }
      }
    }

    const hasAny = Boolean(
      normalizedData.products !== undefined ||
      normalizedData.categories !== undefined ||
      normalizedData.carouselSlides !== undefined ||
      normalizedData.storeSettings !== undefined ||
      normalizedData.homepageSections !== undefined ||
      normalizedData.orders !== undefined ||
      normalizedData.customers !== undefined ||
      (container && typeof container === 'object' && Object.keys(container).length > 0) ||
      Array.isArray(container) ||
      Array.isArray(target) ||
      (target && typeof target === 'object' && Object.keys(target).length > 0)
    );

    if (!hasAny) {
      return {
        success: false,
        error: 'Missing required data collections. The JSON backup does not contain recognizable categories, products, carousel, or store settings.',
        errors: ['Missing required data collections. The JSON backup does not contain recognizable categories, products, carousel, or store settings.']
      };
    }

    // Type-specific required collection validation
    if (backupType === 'categories' && normalizedData.categories === undefined) {
      return {
        success: false,
        error: 'Category backup file must contain a "categories" collection.',
        errors: ['Category backup file must contain a "categories" collection.']
      };
    }
    if (backupType === 'products' && normalizedData.products === undefined) {
      return {
        success: false,
        error: 'Product backup file must contain a "products" collection.',
        errors: ['Product backup file must contain a "products" collection.']
      };
    }
    if (backupType === 'carousel' && normalizedData.carouselSlides === undefined) {
      return {
        success: false,
        error: 'Carousel backup file must contain a "carousel" collection.',
        errors: ['Carousel backup file must contain a "carousel" collection.']
      };
    }
    if (backupType === 'settings' && normalizedData.storeSettings === undefined) {
      return {
        success: false,
        error: 'Settings backup file must contain a "settings" collection.',
        errors: ['Settings backup file must contain a "settings" collection.']
      };
    }

    // 4. Validate Individual Records and Relationships
    const validationErrors: string[] = [];
    const validationWarnings: string[] = [];

    // Existing IDs for lookup
    const currentCatIds = new Set(categories.map(c => c.id));
    const currentCatSlugs = new Set(categories.map(c => c.slug.toLowerCase()));
    const inCats = normalizedData.categories || [];
    const inCatIds = new Set(inCats.map((c: any) => c.id).filter(Boolean));
    const inCatSlugs = new Set(inCats.map((c: any) => (c.slug || '').toLowerCase()).filter(Boolean));

    // A. Validate Categories
    let parentCategoriesCount = 0;
    let subcategoriesCount = 0;
    const missingParentIds: string[] = [];

    if (inCats.length > 0) {
      inCats.forEach((cat: any, idx: number) => {
        if (!cat || typeof cat !== 'object') {
          validationErrors.push(`Category record at index ${idx} is not an object.`);
          return;
        }
        if (!cat.name || typeof cat.name !== 'string' || !cat.name.trim()) {
          validationErrors.push(`Category record at index ${idx} is missing the required "name" field.`);
        }
        if (!cat.id || typeof cat.id !== 'string' || !cat.id.trim()) {
          // Auto-generate stable id if missing
          cat.id = `cat-${(cat.slug || cat.name || `item-${idx}`).toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
        }
        if (!cat.slug) {
          cat.slug = cat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        }

        const parentId = cat.parentId || cat.parentCategoryId;
        if (parentId) {
          subcategoriesCount++;
          if (!currentCatIds.has(parentId) && !inCatIds.has(parentId)) {
            missingParentIds.push(parentId);
            validationWarnings.push(`Category "${cat.name}" references parent ID "${parentId}" which is not defined in incoming or current categories.`);
          }
        } else {
          parentCategoriesCount++;
        }
      });
    }

    // B. Validate Products
    const inProds = normalizedData.products || [];
    let validCatReferences = 0;
    const missingCategoryIds: string[] = [];

    if (inProds.length > 0) {
      inProds.forEach((prod: any, idx: number) => {
        if (!prod || typeof prod !== 'object') {
          validationErrors.push(`Product record at index ${idx} is not an object.`);
          return;
        }
        if (!prod.name || typeof prod.name !== 'string' || !prod.name.trim()) {
          validationErrors.push(`Product record at index ${idx} is missing the required "name" field.`);
        }
        if (prod.price === undefined || prod.price === null || isNaN(Number(prod.price))) {
          validationErrors.push(`Product "${prod.name || `index ${idx}`}" is missing a valid numeric "price".`);
        }
        if (!prod.id || typeof prod.id !== 'string') {
          prod.id = `prod-${Date.now()}-${idx}`;
        }
        if (!prod.slug) {
          prod.slug = (prod.name || `prod-${idx}`).toLowerCase().replace(/[^a-z0-9]+/g, '-');
        }

        // Category connection check
        if (prod.categoryId) {
          if (
            currentCatIds.has(prod.categoryId) ||
            inCatIds.has(prod.categoryId) ||
            currentCatSlugs.has(prod.categoryId.toLowerCase()) ||
            inCatSlugs.has(prod.categoryId.toLowerCase())
          ) {
            validCatReferences++;
          } else {
            missingCategoryIds.push(prod.categoryId);
            validationWarnings.push(`Product "${prod.name}" references category ID "${prod.categoryId}" which is not currently present in categories.`);
          }
        }
      });
    }

    if (validationErrors.length > 0) {
      return {
        success: false,
        error: validationErrors.join('; '),
        errors: validationErrors,
        warnings: validationWarnings
      };
    }

    // Sort categories topologically: parent categories (no parentId) first, followed by subcategories
    if (normalizedData.categories && normalizedData.categories.length > 0) {
      normalizedData.categories.sort((a, b) => {
        const aHasParent = Boolean(a.parentId || a.parentCategoryId);
        const bHasParent = Boolean(b.parentId || b.parentCategoryId);
        if (!aHasParent && bHasParent) return -1;
        if (aHasParent && !bHasParent) return 1;
        return (a.displayOrder || 0) - (b.displayOrder || 0);
      });
    }

    // 5. Calculate Simulation Stats
    let catsToAdd = 0;
    let catsToUpdate = 0;
    inCats.forEach((c: any) => {
      if (currentCatIds.has(c.id) || currentCatSlugs.has((c.slug || '').toLowerCase())) {
        catsToUpdate++;
      } else {
        catsToAdd++;
      }
    });

    const currentProdIds = new Set(products.map(p => p.id));
    const currentProdSkus = new Set(products.map(p => p.variants?.[0]?.sku).filter(Boolean));
    const currentProdSlugs = new Set(products.map(p => p.slug.toLowerCase()));

    let prodsToAdd = 0;
    let prodsToUpdate = 0;
    inProds.forEach((p: any) => {
      const pSku = p.variants?.[0]?.sku;
      if (currentProdIds.has(p.id) || (pSku && currentProdSkus.has(pSku)) || currentProdSlugs.has((p.slug || '').toLowerCase())) {
        prodsToUpdate++;
      } else {
        prodsToAdd++;
      }
    });

    const inSlides = normalizedData.carouselSlides || [];

    const stats = {
      categories: { incomingCount: inCats.length, toAddCount: catsToAdd, toUpdateCount: catsToUpdate, parentCategories: parentCategoriesCount, subcategories: subcategoriesCount },
      products: { incomingCount: inProds.length, toAddCount: prodsToAdd, toUpdateCount: prodsToUpdate },
      carousel: { incomingCount: inSlides.length },
      settings: { incoming: Boolean(normalizedData.storeSettings) },
      homepageSections: { incoming: Boolean(normalizedData.homepageSections) },
      orders: { incomingCount: (normalizedData.orders || []).length }
    };

    const categoryIntegrity = {
      total: inCats.length,
      parentCategories: parentCategoriesCount,
      subcategories: subcategoriesCount,
      validReferences: validCatReferences,
      missingParentIds: Array.from(new Set(missingParentIds))
    };

    const productIntegrity = {
      total: inProds.length,
      validCategoryReferences: validCatReferences,
      missingCategoryIds: Array.from(new Set(missingCategoryIds))
    };

    return {
      success: true,
      appName,
      backupType,
      schemaVersion,
      exportedAt,
      data: normalizedData,
      stats,
      categoryIntegrity,
      productIntegrity,
      warnings: validationWarnings.slice(0, 5),
      errors: [],
      sampleCategories: inCats.slice(0, 3).map((c: any) => ({ id: c.id, name: c.name, slug: c.slug, subcategoriesCount: (c.subcategories || []).length })),
      sampleProducts: inProds.slice(0, 3).map((p: any) => ({ id: p.id, name: p.name, price: p.price, stock: p.stock, brand: p.brand }))
    };
  }

  // 7.1 Backup Snapshots Management Endpoints
  app.get('/api/admin/backups', (req, res) => {
    const list = listBackupSnapshots();
    res.json(list);
  });

  app.post('/api/admin/backups/create', (req, res) => {
    const { note } = req.body || {};
    const snapshot = createBackupSnapshot(note || 'Manual Admin Snapshot');
    if (!snapshot) {
      return res.status(500).json({ error: 'Failed to create backup snapshot on disk.' });
    }
    res.json({
      success: true,
      message: 'Backup snapshot created successfully!',
      snapshot
    });
  });

  app.post('/api/admin/backups/:id/restore', (req, res) => {
    try {
      const { id } = req.params;
      const filePath = path.join(BACKUPS_DIR, `${id}.json`);
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: `Backup snapshot ${id} not found.` });
      }

      // Auto-backup current state before restoring an earlier snapshot
      createBackupSnapshot(`Auto-backup before restoring ${id}`);

      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

      if (Array.isArray(data.products)) {
        products = data.products;
        saveProductsToDisk();
      }
      if (Array.isArray(data.categories)) {
        categories = data.categories;
        saveCategoriesToDisk();
      }
      if (Array.isArray(data.carouselSlides)) {
        carouselSlides = data.carouselSlides;
        saveCarouselToDisk();
      }
      if (data.storeSettings && typeof data.storeSettings === 'object') {
        storeSettings = { ...DEFAULT_STORE_SETTINGS, ...data.storeSettings };
        saveSettingsToDisk();
      }
      if (Array.isArray(data.orders)) {
        orders = data.orders;
        saveOrdersToDisk();
      }
      if (Array.isArray(data.customers)) {
        customers = data.customers;
        saveCustomersToDisk();
      }

      console.log(`[Admin Restore] Successfully restored system state from snapshot ${id}`);
      res.json({
        success: true,
        message: `System successfully restored to snapshot from ${data.createdAt || id}!`,
        counts: {
          products: products.length,
          categories: categories.length,
          carouselSlides: carouselSlides.length,
          orders: orders.length,
          customers: customers.length
        }
      });
    } catch (err: any) {
      console.error('Error restoring snapshot:', err);
      res.status(500).json({ error: `Failed to restore snapshot: ${err.message}` });
    }
  });

  app.get('/api/admin/backups/:id/download', (req, res) => {
    const { id } = req.params;
    const filePath = path.join(BACKUPS_DIR, `${id}.json`);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Snapshot file not found' });
    }
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=${id}.json`);
    res.sendFile(filePath);
  });

  app.delete('/api/admin/backups/:id', (req, res) => {
    const { id } = req.params;
    const filePath = path.join(BACKUPS_DIR, `${id}.json`);
    if (fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
        return res.json({ success: true, message: 'Snapshot removed from disk.' });
      } catch (e: any) {
        return res.status(500).json({ error: `Failed to delete snapshot: ${e.message}` });
      }
    }
    res.status(404).json({ error: 'Snapshot not found' });
  });

  // 7.2 Standard Unified JSON Export API (JSON ONLY)
  app.get('/api/admin/export-data', (req, res) => {
    try {
      const type = ((req.query.type as string) || 'all').toLowerCase();
      const dateStr = new Date().toISOString().split('T')[0];

      let exportPayload: any = null;
      let filename = `atal-store-backup-${dateStr}.json`;

      if (type === 'categories') {
        filename = `atal-categories-backup-${dateStr}.json`;
        exportPayload = {
          appName: 'ATAL Store',
          backupType: 'categories',
          schemaVersion: 1,
          exportedAt: new Date().toISOString(),
          data: {
            categories
          }
        };
      } else if (type === 'products') {
        filename = `atal-products-backup-${dateStr}.json`;
        exportPayload = {
          appName: 'ATAL Store',
          backupType: 'products',
          schemaVersion: 1,
          exportedAt: new Date().toISOString(),
          data: {
            products
          }
        };
      } else if (type === 'carousel') {
        filename = `atal-carousel-backup-${dateStr}.json`;
        exportPayload = {
          appName: 'ATAL Store',
          backupType: 'carousel',
          schemaVersion: 1,
          exportedAt: new Date().toISOString(),
          data: {
            carousel: carouselSlides
          }
        };
      } else if (type === 'settings') {
        filename = `atal-settings-backup-${dateStr}.json`;
        exportPayload = {
          appName: 'ATAL Store',
          backupType: 'settings',
          schemaVersion: 1,
          exportedAt: new Date().toISOString(),
          data: {
            settings: storeSettings
          }
        };
      } else {
        // Full Store Backup
        filename = `atal-store-backup-${dateStr}.json`;
        exportPayload = {
          appName: 'ATAL Store',
          backupType: 'full',
          schemaVersion: 1,
          exportedAt: new Date().toISOString(),
          data: {
            categories,
            products,
            carousel: carouselSlides,
            settings: storeSettings,
            homepageSections,
            orders,
            customers: customers.map(sanitizeCustomer)
          }
        };
      }

      // MANDATORY PRE-DOWNLOAD SELF-VALIDATION
      const serializedJson = JSON.stringify(exportPayload, null, 2);
      const validation = parseAndValidateJsonBackup(serializedJson);

      if (!validation.success) {
        console.error('Export failed pre-download self-validation:', validation.error);
        return res.status(500).json({
          error: `Export generation failed internal validation: ${validation.error}`
        });
      }

      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
      return res.send(serializedJson);
    } catch (e: any) {
      console.error('Export error:', e);
      res.status(500).json({ error: `Failed to generate JSON export: ${e.message}` });
    }
  });

  // 7.3 Pre-Import Validation & Simulation Preview API (JSON ONLY)
  app.post('/api/admin/validate-import', (req, res) => {
    try {
      const { data, rawContent } = req.body || {};
      const val = parseAndValidateJsonBackup(rawContent, data);

      if (!val.success || !val.data) {
        return res.status(400).json({
          isValid: false,
          valid: false,
          errors: val.errors || [val.error || 'Invalid JSON file.']
        });
      }

      res.json({
        isValid: true,
        valid: true,
        appName: val.appName,
        backupType: val.backupType,
        schemaVersion: val.schemaVersion,
        exportedAt: val.exportedAt,
        stats: val.stats,
        summary: val.stats,
        categoryIntegrity: val.categoryIntegrity,
        productIntegrity: val.productIntegrity,
        warnings: val.warnings || [],
        errors: [],
        sampleCategories: val.sampleCategories,
        sampleProducts: val.sampleProducts
      });
    } catch (err: any) {
      console.error('Validation error:', err);
      res.status(400).json({
        isValid: false,
        valid: false,
        errors: [`Validation failed: ${err.message}`]
      });
    }
  });

  // 7.4 Robust JSON Import API (Merge Data & Full Restore Modes)
  app.post('/api/admin/import-data', (req, res) => {
    try {
      const { data, rawContent, mode = 'update_existing' } = req.body || {};
      const val = parseAndValidateJsonBackup(rawContent, data);

      if (!val.success || !val.data) {
        return res.status(400).json({
          success: false,
          error: val.error || 'Invalid backup payload.',
          errors: val.errors || [val.error || 'Invalid backup payload.']
        });
      }

      // Step 1: Automatic Safety Snapshot Backup before modifying database
      const autoSnapshot = createBackupSnapshot(`Auto-backup before ${mode} import`);

      const inCats: any[] | null = val.data.categories || null;
      const inProds: any[] | null = val.data.products || null;
      const inSlides: any[] | null = val.data.carouselSlides || null;
      const inSettings: any = val.data.storeSettings || null;
      const inHomepage: any = val.data.homepageSections || null;
      const inOrders: any[] | null = val.data.orders || null;
      const inCustomers: any[] | null = val.data.customers || null;

      const stats = {
        categories: { added: 0, updated: 0, skipped: 0, total: 0 },
        products: { added: 0, updated: 0, skipped: 0, total: 0 },
        carouselSlides: { added: 0, updated: 0, skipped: 0, total: 0 },
        orders: { added: 0, updated: 0, skipped: 0, total: 0 },
        customers: { added: 0, updated: 0, skipped: 0, total: 0 }
      };

      // 1. Process Categories (Preserve parent-child hierarchy & order)
      if (Array.isArray(inCats) && inCats.length > 0) {
        // Topological sort: parent categories first, subcategories second
        const sortedCats = [...inCats].sort((a, b) => {
          const aHasParent = Boolean(a.parentId || a.parentCategoryId);
          const bHasParent = Boolean(b.parentId || b.parentCategoryId);
          if (!aHasParent && bHasParent) return -1;
          if (aHasParent && !bHasParent) return 1;
          return (a.displayOrder || 0) - (b.displayOrder || 0);
        });

        stats.categories.total = sortedCats.length;

        if (mode === 'full_restore') {
          categories = sortedCats.map((cat: any) => {
            const isAct = cat.isActive !== undefined ? parseActiveBoolean(cat.isActive) : true;
            return {
              ...cat,
              isActive: isAct,
              status: isAct ? 'active' : 'inactive'
            };
          });
          stats.categories.updated = sortedCats.length;
        } else {
          // Merge Data
          sortedCats.forEach((cat: any) => {
            const isAct = cat.isActive !== undefined ? parseActiveBoolean(cat.isActive) : true;
            const normalizedCat = {
              ...cat,
              isActive: isAct,
              status: isAct ? 'active' : 'inactive'
            };
            const idx = categories.findIndex(c => c.id === cat.id || c.slug.toLowerCase() === cat.slug.toLowerCase());
            if (idx !== -1) {
              const mergedSubcategories = Array.from(new Set([
                ...(categories[idx].subcategories || []),
                ...(cat.subcategories || [])
              ]));
              categories[idx] = {
                ...categories[idx],
                ...normalizedCat,
                id: categories[idx].id,
                subcategories: mergedSubcategories
              };
              stats.categories.updated++;
            } else {
              categories.push(normalizedCat);
              stats.categories.added++;
            }
          });
        }
        saveCategoriesToDisk();
      }

      // 2. Process Products (Ensure Category Relationships)
      if (Array.isArray(inProds) && inProds.length > 0) {
        stats.products.total = inProds.length;
        const validCategoryIds = new Set(categories.map(c => c.id));
        const validCategorySlugs = new Map(categories.map(c => [c.slug.toLowerCase(), c.id]));

        const sanitizedProds = inProds.map((prod: any) => {
          let resolvedCatId = prod.categoryId;
          if (!validCategoryIds.has(resolvedCatId)) {
            if (validCategorySlugs.has((prod.categoryId || '').toLowerCase())) {
              resolvedCatId = validCategorySlugs.get(prod.categoryId.toLowerCase())!;
            } else {
              const match = categories.find(c => c.name.toLowerCase() === (prod.categoryName || '').toLowerCase());
              resolvedCatId = match ? match.id : (categories[0]?.id || 'cat-women');
            }
          }
          const isAct = prod.isActive !== undefined ? parseActiveBoolean(prod.isActive) : true;
          return {
            ...prod,
            categoryId: resolvedCatId,
            variants: Array.isArray(prod.variants) && prod.variants.length > 0 ? prod.variants : [
              {
                id: `var-${prod.id}`,
                name: 'Standard',
                sku: prod.sku || `ATAL-${prod.id}`,
                price: Number(prod.price),
                originalPrice: prod.originalPrice ? Number(prod.originalPrice) : undefined,
                stock: Number(prod.stock || 10)
              }
            ],
            stock: Number(prod.stock !== undefined ? prod.stock : 10),
            isActive: isAct,
            status: isAct ? 'active' : 'inactive'
          };
        });

        if (mode === 'full_restore') {
          products = sanitizedProds;
          stats.products.updated = sanitizedProds.length;
        } else {
          // Merge Data
          sanitizedProds.forEach((prod: any) => {
            const prodSku = prod.variants?.[0]?.sku;
            const idx = products.findIndex(p => p.id === prod.id || (prodSku && p.variants?.[0]?.sku === prodSku) || p.slug.toLowerCase() === prod.slug.toLowerCase());
            if (idx !== -1) {
              products[idx] = { ...products[idx], ...prod, id: products[idx].id };
              stats.products.updated++;
            } else {
              products.unshift(prod);
              stats.products.added++;
            }
          });
        }
        saveProductsToDisk();
      }

      // 3. Process Carousel Slides
      if (Array.isArray(inSlides) && inSlides.length > 0) {
        stats.carouselSlides.total = inSlides.length;
        if (mode === 'full_restore') {
          carouselSlides = inSlides;
          stats.carouselSlides.updated = inSlides.length;
        } else {
          inSlides.forEach((slide: any) => {
            const idx = carouselSlides.findIndex(s => String(s.id) === String(slide.id));
            if (idx !== -1) {
              carouselSlides[idx] = { ...carouselSlides[idx], ...slide, id: carouselSlides[idx].id };
              stats.carouselSlides.updated++;
            } else {
              carouselSlides.push(slide);
              stats.carouselSlides.added++;
            }
          });
        }
        saveCarouselToDisk();
      }

      // 4. Process Store Settings
      if (inSettings && typeof inSettings === 'object') {
        if (mode === 'full_restore') {
          storeSettings = { ...DEFAULT_STORE_SETTINGS, ...inSettings };
        } else {
          storeSettings = { ...storeSettings, ...inSettings };
        }
        saveSettingsToDisk();
      }

      // 5. Process Homepage Sections
      if (inHomepage && typeof inHomepage === 'object') {
        if (mode === 'full_restore') {
          homepageSections = normalizeHomepageSections(inHomepage);
        } else {
          homepageSections = {
            ...homepageSections,
            newLaunch: inHomepage.newLaunch ? { ...homepageSections.newLaunch, ...inHomepage.newLaunch } : homepageSections.newLaunch,
            spotlight: inHomepage.spotlight ? { ...homepageSections.spotlight, ...inHomepage.spotlight } : homepageSections.spotlight
          };
        }
        saveHomepageSectionsToDisk();
      }

      // 6. Process Orders
      if (Array.isArray(inOrders) && inOrders.length > 0) {
        stats.orders.total = inOrders.length;
        if (mode === 'full_restore') {
          orders = inOrders;
          stats.orders.updated = inOrders.length;
        } else {
          inOrders.forEach((ord: any) => {
            const idx = orders.findIndex(o => o.id === ord.id || o.trackingNumber === ord.trackingNumber);
            if (idx !== -1) {
              orders[idx] = { ...orders[idx], ...ord };
              stats.orders.updated++;
            } else {
              orders.unshift(ord);
              stats.orders.added++;
            }
          });
        }
        saveOrdersToDisk();
      }

      // 7. Process Customers
      if (Array.isArray(inCustomers) && inCustomers.length > 0) {
        stats.customers.total = inCustomers.length;
        if (mode === 'full_restore') {
          customers = inCustomers;
          stats.customers.updated = inCustomers.length;
        } else {
          inCustomers.forEach((cust: any) => {
            const idx = customers.findIndex(c => c.id === cust.id || c.email.toLowerCase() === cust.email.toLowerCase());
            if (idx !== -1) {
              customers[idx] = { ...customers[idx], ...cust };
              stats.customers.updated++;
            } else {
              customers.push(cust);
              stats.customers.added++;
            }
          });
        }
        saveCustomersToDisk();
      }

      console.log(`[Admin Import] Store data imported in mode '${mode}'. Auto-backup created: ${autoSnapshot?.id}`, stats);
      res.json({
        success: true,
        message: `Data import successfully executed in '${mode === 'full_restore' ? 'FULL RESTORE' : 'MERGE DATA'}' mode!`,
        mode,
        autoBackupId: autoSnapshot?.id,
        stats,
        counts: {
          products: products.length,
          categories: categories.length,
          carouselSlides: carouselSlides.length,
          orders: orders.length,
          customers: customers.length
        }
      });
    } catch (e: any) {
      console.error('Error importing backup data:', e);
      res.status(500).json({ error: `Failed to import store data: ${e.message}` });
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
