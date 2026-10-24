export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
  subcategories: string[];
  description: string;
}

export interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  price: number;
  originalPrice?: number;
  stock: number;
  color?: string;
  size?: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  categoryId: string;
  subcategoryId: string;
  brand: string;
  price: number;
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

export const INITIAL_CATEGORIES: Category[] = [
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

export const INITIAL_PRODUCTS: Product[] = [
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
      '/assets/aistudio/WhatsApp_Image_2026-10-19_at_8.37.40_PM_e34dc877.jpeg'
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
    slug: 'signature-royal-oud-luxury-perfume-100ml',
    name: 'ATAL Parfums Royal Oud Signature Unisex Fragrance 100ml',
    description: 'A rich and long-lasting oriental fragrance featuring notes of Cambodian Oud, Amber, Vanilla, and Damascus Rose. Premium glass bottle with magnetic gold cap.',
    categoryId: 'cat-cosmetics',
    subcategoryId: 'Unisex Perfumes',
    brand: 'ATAL Parfums',
    price: 2850,
    originalPrice: 4200,
    discountPercentage: 32,
    rating: 4.9,
    reviewCount: 215,
    images: [
      'https://images.unsplash.com/photo-1547887537-6158d64c35b3?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=800&q=80'
    ],
    variants: [
      { id: 'v3', name: '100ml EDP Bottle', sku: 'ATAL-OUD-100', price: 2850, originalPrice: 4200, stock: 40 }
    ],
    stock: 40,
    isFeatured: true,
    isFlashDeal: true,
    isBestSeller: true,
    createdAt: new Date().toISOString()
  }
];
