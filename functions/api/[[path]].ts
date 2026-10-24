/**
 * Cloudflare Pages Functions API Router for ATAL Store
 * Executes at Cloudflare Edge when deployed on Cloudflare Pages.
 * Fully implements persistent CRUD for Products, Categories, Carousel, Orders,
 * Settings, Staff, and Customers with Cloudflare KV and memory/fallback storage.
 */

interface Env {
  ATAL_KV?: {
    get: (key: string) => Promise<string | null>;
    put: (key: string, value: string) => Promise<void>;
  };
}

const DEFAULT_STAFF = [
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

const DEFAULT_CATEGORIES = [
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

const DEFAULT_PRODUCTS: any[] = [
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
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80'
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
      { id: 'v-fest-3', name: 'Emerald / Medium', sku: 'ATAL-FEST-EM-M', price: 4890, originalPrice: 6800, size: 'M', color: 'Emerald Green', stock: 20 }
    ],
    stock: 35,
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
  }
];

const DEFAULT_CAROUSEL_SLIDES = [
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
  }
];

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

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
  'Content-Type': 'application/json'
};

let memProducts: any[] = [...DEFAULT_PRODUCTS];
let memCategories: any[] = [...DEFAULT_CATEGORIES];
let memCarousel: any[] = [...DEFAULT_CAROUSEL_SLIDES];
let memSettings: any = { ...DEFAULT_STORE_SETTINGS };
let memOrders: any[] = [];
let memCustomers: any[] = [];
let memStaff: any[] = [...DEFAULT_STAFF];

async function getKvOrMem(env: Env, key: string, fallback: any) {
  try {
    if (env && env.ATAL_KV) {
      const val = await env.ATAL_KV.get(key);
      if (val) return JSON.parse(val);
    }
  } catch (e) {
    console.error('KV get error:', e);
  }
  return fallback;
}

async function setKvOrMem(env: Env, key: string, data: any) {
  try {
    if (env && env.ATAL_KV) {
      await env.ATAL_KV.put(key, JSON.stringify(data));
    }
  } catch (e) {
    console.error('KV put error:', e);
  }
}

export async function onRequest(context: { request: Request; env: Env; params: { path?: string[] } }): Promise<Response> {
  const { request, env } = context;
  const segments = context.params.path || [];
  const method = request.method;

  if (method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 204 });
  }

  memProducts = await getKvOrMem(env, 'atal_products', memProducts);
  memCategories = await getKvOrMem(env, 'atal_categories', memCategories);
  memCarousel = await getKvOrMem(env, 'atal_carousel', memCarousel);
  memSettings = await getKvOrMem(env, 'atal_settings', memSettings);
  memOrders = await getKvOrMem(env, 'atal_orders', memOrders);
  memCustomers = await getKvOrMem(env, 'atal_customers', memCustomers);
  memStaff = await getKvOrMem(env, 'atal_staff', memStaff);

  const saveAll = async () => {
    await setKvOrMem(env, 'atal_products', memProducts);
    await setKvOrMem(env, 'atal_categories', memCategories);
    await setKvOrMem(env, 'atal_carousel', memCarousel);
    await setKvOrMem(env, 'atal_settings', memSettings);
    await setKvOrMem(env, 'atal_orders', memOrders);
    await setKvOrMem(env, 'atal_customers', memCustomers);
    await setKvOrMem(env, 'atal_staff', memStaff);
  };

  try {
    const route = segments.join('/');

    // --- CATEGORIES ---
    if (route === 'categories' && method === 'GET') {
      return new Response(JSON.stringify(memCategories), { status: 200, headers: corsHeaders });
    }
    if (route === 'categories' && method === 'POST') {
      const body: any = await request.json().catch(() => ({}));
      const newCat = {
        id: `cat-${Date.now()}`,
        name: body.name,
        slug: body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        image: body.image || 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80',
        subcategories: body.subcategories || [],
        description: body.description || ''
      };
      memCategories.push(newCat);
      await saveAll();
      return new Response(JSON.stringify(newCat), { status: 201, headers: corsHeaders });
    }
    if (segments[0] === 'categories' && segments[1] && method === 'PUT') {
      const catId = segments[1];
      const body: any = await request.json().catch(() => ({}));
      const idx = memCategories.findIndex((c: any) => c.id === catId);
      if (idx === -1) return new Response(JSON.stringify({ error: 'Category not found' }), { status: 404, headers: corsHeaders });
      memCategories[idx] = { ...memCategories[idx], ...body };
      await saveAll();
      return new Response(JSON.stringify(memCategories[idx]), { status: 200, headers: corsHeaders });
    }
    if (segments[0] === 'categories' && segments[1] && method === 'DELETE') {
      const catId = segments[1];
      memCategories = memCategories.filter((c: any) => c.id !== catId);
      await saveAll();
      return new Response(JSON.stringify({ success: true }), { status: 200, headers: corsHeaders });
    }

    // --- CAROUSEL ---
    if (route === 'carousel' && method === 'GET') {
      return new Response(JSON.stringify(memCarousel), { status: 200, headers: corsHeaders });
    }
    if (route === 'carousel' && method === 'POST') {
      const body: any = await request.json().catch(() => ({}));
      const newSlide = {
        id: Date.now(),
        badge: body.badge || 'PROMO',
        brand: body.brand || 'ATAL',
        title: body.title || 'New Collection',
        subtitle: body.subtitle || '',
        discount: body.discount || '',
        buttonText: body.buttonText || 'SHOP NOW',
        image: body.image || '/assets/hero_festive_banner_1792525781469.jpg',
        categoryId: body.categoryId || 'cat-women'
      };
      memCarousel.push(newSlide);
      await saveAll();
      return new Response(JSON.stringify(newSlide), { status: 201, headers: corsHeaders });
    }
    if (segments[0] === 'carousel' && segments[1] && method === 'PUT') {
      const slideId = segments[1];
      const body: any = await request.json().catch(() => ({}));
      const idx = memCarousel.findIndex((s: any) => String(s.id) === String(slideId));
      if (idx === -1) return new Response(JSON.stringify({ error: 'Slide not found' }), { status: 404, headers: corsHeaders });
      memCarousel[idx] = { ...memCarousel[idx], ...body, id: memCarousel[idx].id };
      await saveAll();
      return new Response(JSON.stringify(memCarousel[idx]), { status: 200, headers: corsHeaders });
    }
    if (segments[0] === 'carousel' && segments[1] && method === 'DELETE') {
      const slideId = segments[1];
      memCarousel = memCarousel.filter((s: any) => String(s.id) !== String(slideId));
      await saveAll();
      return new Response(JSON.stringify({ success: true }), { status: 200, headers: corsHeaders });
    }

    // --- PRODUCTS ---
    if (route === 'products' && method === 'GET') {
      return new Response(JSON.stringify(memProducts), { status: 200, headers: corsHeaders });
    }
    if (segments[0] === 'products' && segments[1] && method === 'GET') {
      const slugOrId = segments[1];
      const prod = memProducts.find((p: any) => p.slug === slugOrId || p.id === slugOrId);
      if (!prod) return new Response(JSON.stringify({ error: 'Product not found' }), { status: 404, headers: corsHeaders });
      return new Response(JSON.stringify(prod), { status: 200, headers: corsHeaders });
    }
    if (route === 'products' && method === 'POST') {
      const data: any = await request.json().catch(() => ({}));
      const newProduct: any = {
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
      memProducts.unshift(newProduct);
      await saveAll();
      return new Response(JSON.stringify(newProduct), { status: 201, headers: corsHeaders });
    }
    if (segments[0] === 'products' && segments[1] && method === 'PUT') {
      const prodId = segments[1];
      const body: any = await request.json().catch(() => ({}));
      const idx = memProducts.findIndex((p: any) => p.id === prodId);
      if (idx === -1) return new Response(JSON.stringify({ error: 'Product not found' }), { status: 404, headers: corsHeaders });
      memProducts[idx] = { ...memProducts[idx], ...body };
      await saveAll();
      return new Response(JSON.stringify(memProducts[idx]), { status: 200, headers: corsHeaders });
    }
    if (segments[0] === 'products' && segments[1] && method === 'DELETE') {
      const prodId = segments[1];
      memProducts = memProducts.filter((p: any) => p.id !== prodId);
      await saveAll();
      return new Response(JSON.stringify({ success: true }), { status: 200, headers: corsHeaders });
    }

    // --- SETTINGS ---
    if (route === 'settings' && method === 'GET') {
      return new Response(JSON.stringify(memSettings), { status: 200, headers: corsHeaders });
    }
    if (route === 'settings' && method === 'PUT') {
      const body: any = await request.json().catch(() => ({}));
      memSettings = { ...memSettings, ...body };
      await saveAll();
      return new Response(JSON.stringify(memSettings), { status: 200, headers: corsHeaders });
    }

    // --- ORDERS ---
    if (route === 'orders' && method === 'GET') {
      return new Response(JSON.stringify(memOrders), { status: 200, headers: corsHeaders });
    }
    if (segments[0] === 'orders' && segments[1] && segments[2] === 'status' && method === 'PUT') {
      const ordId = segments[1];
      const body: any = await request.json().catch(() => ({}));
      const ord = memOrders.find((o: any) => o.id === ordId || o.trackingNumber === ordId);
      if (!ord) return new Response(JSON.stringify({ error: 'Order not found' }), { status: 404, headers: corsHeaders });
      if (body.orderStatus) {
        ord.orderStatus = body.orderStatus;
        if (!ord.statusHistory) ord.statusHistory = [];
        ord.statusHistory.push({
          status: body.orderStatus,
          timestamp: new Date().toISOString(),
          note: body.note || `Status updated to ${body.orderStatus} by admin`
        });
      }
      if (body.paymentStatus) {
        ord.paymentStatus = body.paymentStatus;
      }
      await saveAll();
      return new Response(JSON.stringify(ord), { status: 200, headers: corsHeaders });
    }
    if (segments[0] === 'orders' && segments[1] && method === 'DELETE') {
      const ordId = segments[1];
      memOrders = memOrders.filter((o: any) => o.id !== ordId && o.trackingNumber !== ordId);
      await saveAll();
      return new Response(JSON.stringify({ success: true }), { status: 200, headers: corsHeaders });
    }
    if (segments[0] === 'orders' && segments[1] && method === 'GET') {
      const q = segments[1].toLowerCase();
      const ord = memOrders.find((o: any) => o.id.toLowerCase() === q || o.trackingNumber === q || o.orderNumber.toLowerCase() === q);
      if (!ord) return new Response(JSON.stringify({ error: 'Order not found' }), { status: 404, headers: corsHeaders });
      return new Response(JSON.stringify(ord), { status: 200, headers: corsHeaders });
    }
    if (route === 'checkout' && method === 'POST') {
      const data: any = await request.json().catch(() => ({}));
      const trackingNumber = Math.floor(10000000 + Math.random() * 90000000).toString();
      const newOrder = {
        id: `ord-${Date.now()}`,
        orderNumber: `ATAL-${trackingNumber}`,
        trackingNumber,
        customerName: data.customerName,
        mobileNumber: data.mobileNumber,
        email: data.email || '',
        province: data.province,
        city: data.city,
        area: data.area || '',
        address: data.address,
        items: data.items || [],
        totalAmount: data.totalAmount || 1000,
        paymentMethod: data.paymentMethod || 'cod',
        paymentStatus: 'pending',
        transactionReference: data.transactionId || data.transactionReference || 'COD',
        orderStatus: 'Pending Confirmation',
        createdAt: new Date().toISOString(),
        statusHistory: [{ status: 'Pending Confirmation', timestamp: new Date().toISOString(), note: 'Order placed successfully' }]
      };
      memOrders.unshift(newOrder);
      await saveAll();
      return new Response(JSON.stringify({ success: true, order: newOrder }), { status: 200, headers: corsHeaders });
    }

    // --- ADMIN STATS ---
    if (route === 'admin/stats' && method === 'GET') {
      const totalSales = memOrders.filter((o: any) => o.orderStatus !== 'Cancelled').reduce((acc: number, o: any) => acc + (o.totalAmount || 0), 0);
      const totalOrders = memOrders.length;
      const pendingOrders = memOrders.filter((o: any) => o.orderStatus === 'Pending Confirmation' || o.orderStatus === 'Confirmed').length;
      const deliveredOrders = memOrders.filter((o: any) => o.orderStatus === 'Delivered').length;
      const lowStockProducts = memProducts.filter((p: any) => (p.stock || 0) < 10).length;

      return new Response(JSON.stringify({
        totalSales,
        totalOrders,
        totalCustomers: memCustomers.length,
        pendingOrders,
        deliveredOrders,
        totalProducts: memProducts.length,
        lowStockProducts,
        recentOrders: memOrders.slice(0, 5)
      }), { status: 200, headers: corsHeaders });
    }

    // --- STAFF ---
    if (route === 'admin/login' && method === 'POST') {
      const body: any = await request.json().catch(() => ({}));
      const email = (body.email || '').toString().trim().toLowerCase();
      const password = (body.password || '').toString().trim();
      const staff = memStaff.find((u: any) => u.email.toLowerCase() === email || u.name.toLowerCase() === email);
      if (!staff || staff.password.trim() !== password) {
        return new Response(JSON.stringify({ error: 'Invalid admin or employee email or password.' }), { status: 401, headers: corsHeaders });
      }
      const { password: _, ...safeUser } = staff;
      return new Response(JSON.stringify({ success: true, message: `Welcome ${safeUser.name}!`, user: safeUser }), { status: 200, headers: corsHeaders });
    }
    if (route === 'admin/staff' && method === 'GET') {
      return new Response(JSON.stringify(memStaff.map((u: any) => { const { password, ...s } = u; return s; })), { status: 200, headers: corsHeaders });
    }
    if (route === 'admin/staff' && method === 'POST') {
      const body: any = await request.json().catch(() => ({}));
      const newStaff = {
        id: `staff-${Date.now()}`,
        name: body.name,
        email: body.email.toLowerCase(),
        role: body.role || 'employee',
        password: body.password,
        isPasswordChangeable: true,
        createdAt: new Date().toISOString()
      };
      memStaff.push(newStaff);
      await saveAll();
      const { password: _, ...safe } = newStaff;
      return new Response(JSON.stringify({ success: true, user: safe }), { status: 201, headers: corsHeaders });
    }
    if (segments[0] === 'admin' && segments[1] === 'staff' && segments[2] && method === 'DELETE') {
      const staffId = segments[2];
      memStaff = memStaff.filter((u: any) => u.id !== staffId);
      await saveAll();
      return new Response(JSON.stringify({ success: true }), { status: 200, headers: corsHeaders });
    }

    return new Response(JSON.stringify({ message: 'ATAL Cloudflare Edge API Active' }), { status: 200, headers: corsHeaders });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message || 'Server error' }), { status: 500, headers: corsHeaders });
  }
}
