/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link, NavLink } from 'react-router-dom';
import { 
  ShoppingBag, Search, Heart, User, ShieldCheck, Truck, RotateCcw, 
  PhoneCall, ChevronRight, ChevronLeft, Star, X, Plus, Minus, Trash2, CheckCircle2, 
  SlidersHorizontal, ArrowLeft, Share2, Menu, Settings, Package, 
  TrendingUp, DollarSign, AlertTriangle, Eye, EyeOff, Edit, Check, Lock, Globe,
  Copy, MessageCircle, Home, LayoutGrid, Baby, Sparkles, Zap, Wifi, BatteryMedium, Mail,
  LogOut, KeyRound, MapPin, Send, CheckCheck, RefreshCw, FileText, ExternalLink,
  Instagram, Facebook, Landmark, Download, Upload, Database, History, FileSpreadsheet,
  HardDrive, AlertCircle, Layers, ArrowDownUp, FileDown, Bell, Calendar, Clock,
  ArrowUp, ArrowDown, Filter
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { authService } from './services/auth';
import { getApiUrl } from './config/api';
import { INITIAL_CATEGORIES, INITIAL_PRODUCTS } from './data/seedData';

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
  whatsapp: string;
  password?: string;
  createdAt?: string;
  defaultAddress?: CustomerAddress;
}

interface ProductVariant {
  id: string;
  name: string;
  sku: string;
  price: number;
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
  price: number;
  originalPrice?: number;
  discountPercentage?: number;
  rating: number;
  reviewCount: number;
  images: string[];
  variants: ProductVariant[];
  stock: number;
  stockQuantity?: number;
  sku?: string;
  isFeatured?: boolean;
  isFlashDeal?: boolean;
  isBestSeller?: boolean;
  isNewArrival?: boolean;
  isActive?: boolean;
  status?: 'active' | 'inactive';
  error?: string;
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
  trackingNumber: string; // 8-digit unique tracking number
  customerId?: string;
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
  transactionReference: string; // Mandatory transaction ID
  transactionId?: string; // Explicit transaction ID
  orderStatus: string;
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

const PAKISTANI_CITIES = [
  'Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad', 
  'Multan', 'Peshawar', 'Quetta', 'Sialkot', 'Gujranwala', 
  'Hyderabad', 'Abbottabad', 'Bahawalpur', 'Sargodha', 'Sukkur'
];

const PAKISTAN_PROVINCES = [
  'Punjab', 'Sindh', 'Khyber Pakhtunkhwa (KPK)', 'Balochistan', 
  'Islamabad Capital Territory', 'Azad Kashmir', 'Gilgit-Baltistan'
];

// Robust Safe Helper Functions for Product Data & Arrays
const DEFAULT_PRODUCT_IMAGE = '/assets/aistudio/WhatsApp_Image_2026-09-29_at_12.21.56_PM_187de251.jpeg';

export function getProductImages(product: Product | null | undefined): string[] {
  if (!product) return [DEFAULT_PRODUCT_IMAGE];
  if (Array.isArray(product.images) && product.images.length > 0) {
    const valid = product.images.filter(img => typeof img === 'string' && img.trim() !== '');
    if (valid.length > 0) return valid;
  }
  return [DEFAULT_PRODUCT_IMAGE];
}

export function getPrimaryProductImage(product: Product | null | undefined): string {
  const imgs = getProductImages(product);
  return imgs[0] || DEFAULT_PRODUCT_IMAGE;
}

export function getProductVariants(product: Product | null | undefined): ProductVariant[] {
  if (!product) return [];
  if (Array.isArray(product.variants) && product.variants.length > 0) {
    return product.variants;
  }
  return [];
}

// Interactive Hero Carousel Slides
export interface CarouselSlide {
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

// Interactive Hero Carousel Slides (Initial Defaults)
const HERO_SLIDES: CarouselSlide[] = [
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

export const DEFAULT_HOMEPAGE_SECTIONS = {
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
      items: [
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
      ]
    }
  },
  spotlight: {
    enabled: true,
    title: '🌟 ATAL Spotlight & Featured Collections',
    subtitle: 'Handpicked seasonal highlights, exclusive offers, and signature collections',
    layoutStyle: 'carousel',
    items: [
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
        buttonLink: '/category/cat-cosmetics',
        layoutType: 'card',
        badge: 'BEST SELLER',
        price: 2499,
        originalPrice: 4500
      }
    ]
  }
};

// Live ticking Countdown Timer component for Coming Soon drops
function CountdownTimer({ targetDate }: { targetDate?: string }) {
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number; isExpired: boolean } | null>(null);

  useEffect(() => {
    if (!targetDate) {
      setTimeLeft(null);
      return;
    }
    const target = new Date(targetDate).getTime();
    if (isNaN(target)) {
      setTimeLeft(null);
      return;
    }

    const calculate = () => {
      const now = Date.now();
      const diff = target - now;
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true });
        return;
      }
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      setTimeLeft({ days, hours, minutes, seconds, isExpired: false });
    };

    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  if (!timeLeft) return null;

  if (timeLeft.isExpired) {
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 rounded-full text-[10px] font-black uppercase tracking-wider animate-pulse">
        <Sparkles className="w-3 h-3 text-emerald-400" />
        <span>Official Launch Day!</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 font-mono text-[11px] text-white select-none">
      <div className="bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded-lg border border-white/20 text-center min-w-[28px]">
        <span className="font-black text-amber-300 block text-xs">{String(timeLeft.days).padStart(2, '0')}</span>
        <span className="text-[7.5px] text-slate-300 uppercase block font-sans">d</span>
      </div>
      <span className="text-amber-400 font-bold">:</span>
      <div className="bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded-lg border border-white/20 text-center min-w-[28px]">
        <span className="font-black text-amber-300 block text-xs">{String(timeLeft.hours).padStart(2, '0')}</span>
        <span className="text-[7.5px] text-slate-300 uppercase block font-sans">h</span>
      </div>
      <span className="text-amber-400 font-bold">:</span>
      <div className="bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded-lg border border-white/20 text-center min-w-[28px]">
        <span className="font-black text-amber-300 block text-xs">{String(timeLeft.minutes).padStart(2, '0')}</span>
        <span className="text-[7.5px] text-slate-300 uppercase block font-sans">m</span>
      </div>
      <span className="text-amber-400 font-bold">:</span>
      <div className="bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded-lg border border-white/20 text-center min-w-[28px]">
        <span className="font-black text-amber-300 block text-xs">{String(timeLeft.seconds).padStart(2, '0')}</span>
        <span className="text-[7.5px] text-slate-300 uppercase block font-sans">s</span>
      </div>
    </div>
  );
}

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentView, setCurrentView] = useState<'home' | 'products' | 'product-detail' | 'cart' | 'checkout' | 'order-success' | 'orders' | 'support' | 'admin' | 'account'>(() => {
    if (typeof window !== 'undefined') {
      const h = (window.location.hash || '').toLowerCase();
      const p = (window.location.pathname || '').toLowerCase();
      if (h === '#admin' || h === '#/admin' || h === '#portal' || h === '#/portal' || p.startsWith('/admin') || p === '/portal') {
        return 'admin';
      }
      if (p.startsWith('/product/')) return 'product-detail';
      if (p.startsWith('/category/') || p === '/shop' || p === '/products') return 'products';
      if (p === '/cart') return 'cart';
      if (p === '/checkout') return 'checkout';
      if (p === '/orders' || p === '/track' || p === '/track-order') return 'orders';
      if (p === '/account' || p === '/my-account' || p === '/login' || p === '/register') return 'account';
      if (p === '/support' || p === '/faqs' || p === '/contact') return 'support';
    }
    return 'home';
  });
  
  // Hero Carousel dynamic state
  const [carouselSlides, setCarouselSlides] = useState<CarouselSlide[]>(HERO_SLIDES);
  const [currentHeroSlide, setCurrentHeroSlide] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);

  const nextHeroSlide = () => {
    if (carouselSlides.length === 0) return;
    setCurrentHeroSlide(prev => (prev + 1) % carouselSlides.length);
  };

  const prevHeroSlide = () => {
    if (carouselSlides.length === 0) return;
    setCurrentHeroSlide(prev => (prev - 1 + carouselSlides.length) % carouselSlides.length);
  };

  const handleHeroTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleHeroTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleHeroTouchEnd = () => {
    if (touchStartX === null || touchEndX === null) return;
    const distance = touchStartX - touchEndX;
    if (distance > 40) {
      nextHeroSlide();
    } else if (distance < -40) {
      prevHeroSlide();
    }
    setTouchStartX(null);
    setTouchEndX(null);
  };

  // Carousel auto-advance timer
  useEffect(() => {
    if (carouselSlides.length === 0) return;
    const timer = setInterval(() => {
      setCurrentHeroSlide(prev => (prev + 1) % carouselSlides.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [carouselSlides.length]);
  
  // Data states
  const [categories, setCategories] = useState<Category[]>(INITIAL_CATEGORIES);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('atal_cart');
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      if (Array.isArray(cart)) {
        localStorage.setItem('atal_cart', JSON.stringify(cart));
      }
    } catch (e) {
      console.error('Error saving cart:', e);
    }
  }, [cart]);
  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('atal_wishlist');
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      if (Array.isArray(wishlist)) {
        localStorage.setItem('atal_wishlist', JSON.stringify(wishlist));
      }
    } catch (e) {
      console.error('Error saving wishlist:', e);
    }
  }, [wishlist]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState('Lahore');
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Variant / Checkout Selection states
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [couponCode, setCouponCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);

  // Checkout Form states
  const [checkoutForm, setCheckoutForm] = useState({
    customerName: '',
    mobileNumber: '',
    email: '',
    province: 'Punjab',
    city: 'Lahore',
    area: '',
    address: '',
    paymentMethod: 'cod' as 'cod' | 'jazzcash' | 'easypaisa' | 'card' | 'bank',
    transactionId: '' // MANDATORY TRANSACTION ID
  });
  const [checkoutTidError, setCheckoutTidError] = useState(false);

  // Customer Account Management State (Email, WhatsApp, Password)
  const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(() => {
    try {
      const saved = localStorage.getItem('atal_customer');
      return (saved && saved !== 'undefined' && saved !== 'null') ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [customerOrders, setCustomerOrders] = useState<Order[]>([]);
  const [isLoadingCustomerOrders, setIsLoadingCustomerOrders] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register');
  const [accountActiveTab, setAccountActiveTab] = useState<'orders' | 'profile' | 'address'>('orders');

  const [registerForm, setRegisterForm] = useState({
    name: '',
    email: '',
    whatsapp: '',
    password: '',
    confirmPassword: '',
    address: '',
    city: 'Lahore',
    province: 'Punjab',
    area: ''
  });
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  const [loginForm, setLoginForm] = useState({
    identifier: '',
    password: ''
  });
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    whatsapp: '',
    address: '',
    city: 'Lahore',
    province: 'Punjab',
    area: '',
    currentPassword: '',
    newPassword: ''
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Simulated Automated Email Receipt Service States
  const [isEmailReceiptModalOpen, setIsEmailReceiptModalOpen] = useState(false);
  const [selectedEmailOrder, setSelectedEmailOrder] = useState<Order | null>(null);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [customEmailInput, setCustomEmailInput] = useState('');

  const handleResendEmail = async (order: Order, overrideEmail?: string) => {
    const target = (overrideEmail || customEmailInput || order.email || currentCustomer?.email || '').trim();
    if (!target || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(target)) {
      showToast('Please enter a valid recipient email address.');
      return;
    }
    setIsSendingEmail(true);
    try {
      const res = await fetch(getApiUrl(`/api/orders/${order.trackingNumber}/resend-email`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: target })
      });
      const data = await res.json();
      if (res.ok && data.emailConfirmation) {
        const updatedOrder: Order = {
          ...order,
          email: target,
          emailConfirmation: data.emailConfirmation
        };
        if (lastPlacedOrder?.id === order.id) setLastPlacedOrder(updatedOrder);
        if (searchedOrder?.id === order.id) setSearchedOrder(updatedOrder);
        if (selectedEmailOrder?.id === order.id) setSelectedEmailOrder(updatedOrder);
        setCustomerOrders(prev => prev.map(o => o.id === order.id ? updatedOrder : o));
        showToast(`✉️ Order confirmation email sent to ${target}`);
        setCustomEmailInput('');
      } else {
        showToast(data.error || 'Failed to dispatch email');
      }
    } catch {
      showToast('Network error while dispatching email');
    } finally {
      setIsSendingEmail(false);
    }
  };

  const [lastPlacedOrder, setLastPlacedOrder] = useState<Order | null>(null);
  const [trackingSearchQuery, setTrackingSearchQuery] = useState('');
  const [searchedOrder, setSearchedOrder] = useState<Order | null>(null);
  const [isSearchingOrder, setIsSearchingOrder] = useState(false);
  const [adminOrderSearch, setAdminOrderSearch] = useState('');
  const [adminOrderStatusFilter, setAdminOrderStatusFilter] = useState('all');
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<Order | null>(null);
  // Admin & Staff Authentication State (uatal.pk@gmail.com & ali@atal.com)
  const [adminAuthUser, setAdminAuthUser] = useState<{
    id: string;
    email: string;
    name: string;
    role: 'admin' | 'employee';
    isPasswordChangeable?: boolean;
  } | null>(() => {
    try {
      const saved = localStorage.getItem('atal_staff_user');
      return (saved && saved !== 'undefined' && saved !== 'null') ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const isAdminAuthenticated = Boolean(adminAuthUser);
  const [adminLoginForm, setAdminLoginForm] = useState({
    email: '',
    password: ''
  });
  const [adminStatusNote, setAdminStatusNote] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [isStaffLoggingIn, setIsStaffLoggingIn] = useState(false);

  // Staff Password Change Modal State
  const [isStaffPasswordModalOpen, setIsStaffPasswordModalOpen] = useState(false);
  const [staffPasswordForm, setStaffPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });
  const [isChangingStaffPassword, setIsChangingStaffPassword] = useState(false);
  const [showStaffNewPassword, setShowStaffNewPassword] = useState(false);
  const [staffList, setStaffList] = useState<any[]>([]);

  // Add Staff Modal & Reset Staff Password State
  const [isAddStaffModalOpen, setIsAddStaffModalOpen] = useState(false);
  const [newStaffForm, setNewStaffForm] = useState({
    name: '',
    email: '',
    role: 'employee' as 'admin' | 'employee',
    password: ''
  });
  const [isAddingStaff, setIsAddingStaff] = useState(false);

  const [staffResetTarget, setStaffResetTarget] = useState<any | null>(null);
  const [staffResetPassword, setStaffResetPassword] = useState('');
  const [isResettingStaffPassword, setIsResettingStaffPassword] = useState(false);

  // Safe In-App Confirmation Modal (avoids window.confirm in iframe)
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    confirmColor?: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    confirmColor: 'bg-red-600',
    onConfirm: () => {}
  });

  const [adminStats, setAdminStats] = useState<any>(null);
  const [adminOrders, setAdminOrders] = useState<Order[]>([]);
  const [adminActiveTab, setAdminActiveTab] = useState<'orders' | 'products' | 'categories' | 'carousel' | 'settings' | 'staff' | 'import-export' | 'data-management' | 'homepage-sections'>('orders');

  // Data Management, Snapshots, and Advanced Import/Export States
  const [dataMgmtTab, setDataMgmtTab] = useState<'export' | 'import' | 'backups'>('export');
  const [backupSnapshots, setBackupSnapshots] = useState<any[]>([]);
  const [isLoadingBackups, setIsLoadingBackups] = useState(false);
  const [isCreatingSnapshot, setIsCreatingSnapshot] = useState(false);
  const [manualSnapshotNote, setManualSnapshotNote] = useState('');
  const [isRestoringSnapshot, setIsRestoringSnapshot] = useState(false);

  const [importSelectedFile, setImportSelectedFile] = useState<File | null>(null);
  const [importFileRawText, setImportFileRawText] = useState<string>('');
  const [importFileFormat, setImportFileFormat] = useState<'json' | 'csv' | 'zip'>('json');
  const [selectedDatasetType, setSelectedDatasetType] = useState<string>('auto');
  const [importValidation, setImportValidation] = useState<any | null>(null);
  const [isValidatingImport, setIsValidatingImport] = useState(false);
  const [importMode, setImportMode] = useState<'update_existing' | 'add_new' | 'full_restore'>('update_existing');
  const [isExecutingImport, setIsExecutingImport] = useState(false);
  const [importReport, setImportReport] = useState<any | null>(null);

  const [adminProductStatusFilter, setAdminProductStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [adminCategoryStatusFilter, setAdminCategoryStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  // Ultra-safe array helpers to guarantee zero render exceptions
  const safeProducts = Array.isArray(products) ? products : INITIAL_PRODUCTS;
  const safeCategories = Array.isArray(categories) ? categories : INITIAL_CATEGORIES;
  const safeCustomerOrders = Array.isArray(customerOrders) ? customerOrders : [];
  const safeAdminOrders = Array.isArray(adminOrders) ? adminOrders : [];
  const safeWishlist = Array.isArray(wishlist) ? wishlist : [];
  const safeCart = Array.isArray(cart) ? cart : [];
  const safeCarouselSlides = Array.isArray(carouselSlides) ? carouselSlides : HERO_SLIDES;

  // Storefront active filters: products and categories that are ON (isActive !== false)
  const activeCategories = safeCategories.filter(c => c && c.isActive !== false);
  const activeCategoryIds = new Set(activeCategories.map(c => c.id));
  const activeProducts = safeProducts.filter(p => p && p.isActive !== false && activeCategoryIds.has(p.categoryId));
  const [storeSettings, setStoreSettings] = useState({
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
  });

  const fetchCategories = async () => {
    try {
      const res = await fetch(getApiUrl('/api/categories'));
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setCategories(data);
        }
      }
    } catch (e) {
      console.error('Failed to fetch categories:', e);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch(getApiUrl('/api/products'));
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setProducts(data);
        }
      }
    } catch (e) {
      console.error('Failed to fetch products:', e);
    }
  };

  const fetchStoreSettings = async () => {
    try {
      const res = await fetch(getApiUrl('/api/settings'));
      const data = await res.json();
      setStoreSettings(data);
    } catch (e) {
      console.error(e);
    }
  };

  const [homepageSections, setHomepageSections] = useState<any>(DEFAULT_HOMEPAGE_SECTIONS);
  const [spotlightSlide, setSpotlightSlide] = useState(0);
  const [spotlightTouchStart, setSpotlightTouchStart] = useState<number | null>(null);
  const [spotlightTouchEnd, setSpotlightTouchEnd] = useState<number | null>(null);

  // VIP Launch Soon Notification Modal states
  const [isNotifyModalOpen, setIsNotifyModalOpen] = useState(false);
  const [notifyTargetItem, setNotifyTargetItem] = useState<any | null>(null);
  const [notifyCustomerName, setNotifyCustomerName] = useState('');
  const [notifyEmail, setNotifyEmail] = useState('');
  const [notifyWhatsapp, setNotifyWhatsapp] = useState('');
  const [isSubmittingNotify, setIsSubmittingNotify] = useState(false);

  // Admin Homepage Sections management sub-tab & preview states
  const [adminSectionSubTab, setAdminSectionSubTab] = useState<'availableNow' | 'launchSoon' | 'spotlight' | 'preview'>('availableNow');
  const [adminPreviewDevice, setAdminPreviewDevice] = useState<'mobile' | 'desktop'>('mobile');
  const [editingLaunchSoonItem, setEditingLaunchSoonItem] = useState<any | null>(null);
  const [isLaunchSoonModalOpen, setIsLaunchSoonModalOpen] = useState(false);
  const [editingSpotlightItem, setEditingSpotlightItem] = useState<any | null>(null);
  const [isSpotlightModalOpen, setIsSpotlightModalOpen] = useState(false);
  const [availableNowSearchQuery, setAvailableNowSearchQuery] = useState('');

  const fetchHomepageSections = async () => {
    try {
      const res = await fetch(getApiUrl('/api/homepage-sections'));
      if (res.ok) {
        const data = await res.json();
        if (data && typeof data === 'object') {
          const rawNL = data.newLaunch || {};
          const rawSpot = data.spotlight || {};

          // Backward compatible normalization with guaranteed fallbacks
          const availableNow = {
            enabled: rawNL.availableNow?.enabled !== undefined ? Boolean(rawNL.availableNow.enabled) : (rawNL.enabled !== false),
            title: rawNL.availableNow?.title || rawNL.title || DEFAULT_HOMEPAGE_SECTIONS.newLaunch.availableNow.title,
            subtitle: rawNL.availableNow?.subtitle || rawNL.subtitle || DEFAULT_HOMEPAGE_SECTIONS.newLaunch.availableNow.subtitle,
            productIds: Array.isArray(rawNL.availableNow?.productIds) && rawNL.availableNow.productIds.length > 0
              ? rawNL.availableNow.productIds
              : (Array.isArray(rawNL.productIds) && rawNL.productIds.length > 0 ? rawNL.productIds : DEFAULT_HOMEPAGE_SECTIONS.newLaunch.availableNow.productIds)
          };

          const launchSoon = {
            enabled: rawNL.launchSoon?.enabled !== undefined ? Boolean(rawNL.launchSoon.enabled) : true,
            title: rawNL.launchSoon?.title || DEFAULT_HOMEPAGE_SECTIONS.newLaunch.launchSoon.title,
            subtitle: rawNL.launchSoon?.subtitle || DEFAULT_HOMEPAGE_SECTIONS.newLaunch.launchSoon.subtitle,
            items: Array.isArray(rawNL.launchSoon?.items) && rawNL.launchSoon.items.length > 0
              ? rawNL.launchSoon.items
              : DEFAULT_HOMEPAGE_SECTIONS.newLaunch.launchSoon.items
          };

          const spotlight = {
            enabled: rawSpot.enabled !== undefined ? Boolean(rawSpot.enabled) : true,
            title: rawSpot.title || DEFAULT_HOMEPAGE_SECTIONS.spotlight.title,
            subtitle: rawSpot.subtitle || DEFAULT_HOMEPAGE_SECTIONS.spotlight.subtitle,
            layoutStyle: rawSpot.layoutStyle || DEFAULT_HOMEPAGE_SECTIONS.spotlight.layoutStyle,
            items: Array.isArray(rawSpot.items) && rawSpot.items.length > 0
              ? rawSpot.items
              : DEFAULT_HOMEPAGE_SECTIONS.spotlight.items
          };

          setHomepageSections({
            newLaunch: {
              enabled: availableNow.enabled || launchSoon.enabled,
              title: availableNow.title || 'New Launch',
              subtitle: availableNow.subtitle || "Discover What's New",
              productIds: availableNow.productIds,
              availableNow,
              launchSoon
            },
            spotlight
          });
        }
      }
    } catch (e) {
      console.error('Failed to fetch homepage sections:', e);
    }
  };

  const handleSaveHomepageSections = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      const res = await fetch(getApiUrl('/api/homepage-sections'), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(homepageSections)
      });
      if (res.ok) {
        const data = await res.json();
        if (data.homepageSections) {
          setHomepageSections(data.homepageSections);
        }
        showToast('✓ Homepage sections saved permanently to database!');
      } else {
        showToast('Failed to save homepage sections');
      }
    } catch (err) {
      showToast('Network error saving homepage sections');
    }
  };

  const handleMoveLaunchSoonToAvailable = async (itemId: string, itemName: string) => {
    try {
      const res = await fetch(getApiUrl('/api/homepage-sections/move-to-available'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(`✓ "${itemName}" moved to Available Now!`);
        if (data.homepageSections) {
          setHomepageSections(data.homepageSections);
        } else {
          fetchHomepageSections();
        }
      } else {
        showToast(data.error || 'Failed to move product');
      }
    } catch {
      showToast('Network error while moving product');
    }
  };

  const handleRegisterLaunchNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifyTargetItem) return;
    if (!notifyEmail && !notifyWhatsapp) {
      showToast('Please provide an email or WhatsApp number to get notified.');
      return;
    }
    setIsSubmittingNotify(true);
    try {
      const res = await fetch(getApiUrl('/api/launch-soon/notify'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId: notifyTargetItem.id,
          itemName: notifyTargetItem.name,
          email: notifyEmail,
          whatsapp: notifyWhatsapp,
          customerName: notifyCustomerName || (currentCustomer ? currentCustomer.name : 'Valued Customer')
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast(data.message || '✓ You have been added to the VIP launch list!');
        setIsNotifyModalOpen(false);
        setNotifyTargetItem(null);
        setNotifyEmail('');
        setNotifyWhatsapp('');
        setNotifyCustomerName('');
      } else {
        showToast(data.error || 'Failed to register notification');
      }
    } catch (err) {
      showToast('Network error while registering');
    } finally {
      setIsSubmittingNotify(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(getApiUrl('/api/settings'), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(storeSettings)
      });
      if (res.ok) {
        showToast('Store settings updated successfully!');
      }
    } catch (err) {
      showToast('Failed to update settings');
    }
  };

  // Customer Account Handlers
  const fetchCustomerOrders = async (custId: string) => {
    setIsLoadingCustomerOrders(true);
    try {
      const res = await fetch(getApiUrl(`/api/customers/${custId}/orders`));
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setCustomerOrders(data);
        } else if (data && Array.isArray(data.orders)) {
          setCustomerOrders(data.orders);
        } else {
          setCustomerOrders([]);
        }
      } else {
        setCustomerOrders([]);
      }
    } catch (err) {
      console.error('Failed to load customer orders:', err);
      setCustomerOrders([]);
    } finally {
      setIsLoadingCustomerOrders(false);
    }
  };

  // Sync profile form and orders whenever currentCustomer changes
  useEffect(() => {
    if (currentCustomer) {
      setProfileForm({
        name: currentCustomer.name || '',
        email: currentCustomer.email || '',
        whatsapp: currentCustomer.whatsapp || '',
        address: currentCustomer.defaultAddress?.address || '',
        city: currentCustomer.defaultAddress?.city || 'Lahore',
        province: currentCustomer.defaultAddress?.province || 'Punjab',
        area: currentCustomer.defaultAddress?.area || '',
        currentPassword: '',
        newPassword: ''
      });
      fetchCustomerOrders(currentCustomer.id);

      // Auto-fill checkoutForm with customer details
      setCheckoutForm(prev => ({
        ...prev,
        customerName: currentCustomer.name || prev.customerName,
        mobileNumber: currentCustomer.whatsapp || prev.mobileNumber,
        email: currentCustomer.email || prev.email,
        city: currentCustomer.defaultAddress?.city || prev.city,
        province: currentCustomer.defaultAddress?.province || prev.province,
        address: currentCustomer.defaultAddress?.address || prev.address,
        area: currentCustomer.defaultAddress?.area || prev.area
      }));
    }
  }, [currentCustomer]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerForm.name.trim()) {
      showToast('Please enter your full name.');
      return;
    }
    if (!registerForm.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerForm.email.trim())) {
      showToast('Please enter a valid email address.');
      return;
    }
    if (!registerForm.whatsapp.trim()) {
      showToast('Please enter your WhatsApp mobile number.');
      return;
    }
    if (registerForm.password.length < 6) {
      showToast('Password must be at least 6 characters.');
      return;
    }
    if (registerForm.password !== registerForm.confirmPassword) {
      showToast('Passwords do not match. Please verify.');
      return;
    }

    setIsRegistering(true);
    const result = await authService.registerCustomer({
      name: registerForm.name,
      email: registerForm.email,
      whatsapp: registerForm.whatsapp,
      password: registerForm.password,
      address: registerForm.address,
      city: registerForm.city,
      province: registerForm.province,
      area: registerForm.area
    });

    if (result.success && result.data) {
      setCurrentCustomer(result.data);
      localStorage.setItem('atal_customer', JSON.stringify(result.data));
      showToast(result.message || `🎉 Welcome to ATAL, ${result.data.name}! Account created.`);
      setRegisterForm({
        name: '',
        email: '',
        whatsapp: '',
        password: '',
        confirmPassword: '',
        address: '',
        city: 'Lahore',
        province: 'Punjab',
        area: ''
      });
      setCurrentView('account');
    } else {
      showToast(result.error || 'Failed to create account.');
    }
    setIsRegistering(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);

    const result = await authService.loginCustomer(loginForm.identifier, loginForm.password);

    if (result.success && result.data) {
      setCurrentCustomer(result.data);
      localStorage.setItem('atal_customer', JSON.stringify(result.data));
      showToast(result.message || `👋 Welcome back, ${result.data.name}!`);
      setLoginForm({ identifier: '', password: '' });
      setCurrentView('account');
    } else {
      showToast(result.error || 'Invalid login credentials.');
    }
    setIsLoggingIn(false);
  };

  const handleLogout = () => {
    setCurrentCustomer(null);
    localStorage.removeItem('atal_customer');
    setCustomerOrders([]);
    showToast('Signed out of customer account.');
    navigate('/');
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCustomer) return;
    setIsSavingProfile(true);

    const result = await authService.updateCustomerProfile(currentCustomer.id, {
      name: profileForm.name,
      email: profileForm.email,
      whatsapp: profileForm.whatsapp,
      defaultAddress: {
        address: profileForm.address,
        city: profileForm.city,
        province: profileForm.province,
        area: profileForm.area
      },
      currentPassword: profileForm.currentPassword || undefined,
      newPassword: profileForm.newPassword || undefined
    });

    if (result.success && result.data) {
      setCurrentCustomer(result.data);
      localStorage.setItem('atal_customer', JSON.stringify(result.data));
      showToast(result.message || '✓ Customer profile and shipping details updated!');
      setProfileForm(prev => ({ ...prev, currentPassword: '', newPassword: '' }));
    } else {
      showToast(result.error || 'Failed to update profile.');
    }
    setIsSavingProfile(false);
  };

  // Product Modal State
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [productForm, setProductForm] = useState<any>({
    name: '',
    description: '',
    categoryId: 'cat-men',
    subcategoryId: 'T-Shirts',
    brand: 'ATAL',
    price: 0,
    originalPrice: 0,
    stock: 20,
    imageUrl1: '',
    imageUrl2: '',
    imageUrl3: '',
    colorsString: '',
    sizesString: '',
    isFlashDeal: false,
    isFeatured: true,
    sku: '',
    isActive: true
  });

  // Categories Admin Management State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    slug: '',
    image: '',
    subcategories: '',
    description: '',
    isActive: true
  });

  const openAddCategoryModal = () => {
    setEditingCategoryId(null);
    setCategoryForm({
      name: '',
      slug: '',
      image: '',
      subcategories: '',
      description: '',
      isActive: true
    });
    setIsCategoryModalOpen(true);
  };

  const openEditCategoryModal = (cat: Category) => {
    setEditingCategoryId(cat.id);
    setCategoryForm({
      name: cat.name,
      slug: cat.slug,
      image: cat.image,
      subcategories: (cat.subcategories || []).join(', '),
      description: cat.description || '',
      isActive: cat.isActive !== false
    });
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const isAct = categoryForm.isActive !== false;
    const payload = {
      name: categoryForm.name,
      slug: categoryForm.slug || categoryForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      image: categoryForm.image,
      subcategories: categoryForm.subcategories.split(',').map(s => s.trim()).filter(Boolean),
      description: categoryForm.description,
      isActive: isAct
    };
    try {
      if (editingCategoryId) {
        const res = await fetch(getApiUrl(`/api/categories/${editingCategoryId}`), {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          showToast('Category updated successfully!');
          fetchCategories();
          setIsCategoryModalOpen(false);
        }
      } else {
        const res = await fetch(getApiUrl('/api/categories'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          showToast('New category added successfully!');
          fetchCategories();
          setIsCategoryModalOpen(false);
        }
      }
    } catch (err) {
      showToast('Failed to save category');
    }
  };

  const handleDeleteCategory = (id: string, name?: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Category',
      message: `Are you sure you want to delete category "${name || id}"? Products in this category will remain, but the category listing will be removed.`,
      confirmText: 'Delete Category',
      confirmColor: 'bg-red-600',
      onConfirm: async () => {
        try {
          const res = await fetch(getApiUrl(`/api/categories/${id}`), { method: 'DELETE' });
          if (res.ok) {
            showToast('Category deleted successfully!');
            fetchCategories();
          }
        } catch (err) {
          showToast('Failed to delete category');
        }
      }
    });
  };

  const handleToggleCategoryStatus = async (catId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const res = await fetch(getApiUrl(`/api/categories/${catId}/toggle-status`), { method: 'PUT' });
      if (res.ok) {
        const data = await res.json();
        const statusText = data.isActive ? 'Turned ON (Visible on Storefront)' : 'Turned OFF (Hidden from Storefront)';
        showToast(`Category ${statusText}`);
        fetchCategories();
      } else {
        showToast('Failed to toggle category status');
      }
    } catch {
      showToast('Network error toggling category status');
    }
  };

  // Carousel Admin Management State
  const [isCarouselModalOpen, setIsCarouselModalOpen] = useState(false);
  const [editingSlideId, setEditingSlideId] = useState<string | number | null>(null);
  const [slideForm, setSlideForm] = useState({
    badge: 'PAKISTAN FESTIVE SALE',
    brand: 'ATAL PAKISTAN',
    title: '',
    subtitle: '',
    discount: 'UPTO 40% OFF',
    buttonText: 'SHOP NOW!',
    image: '/assets/hero_festive_banner_1792525781469.jpg',
    categoryId: 'cat-women'
  });

  const fetchCarouselSlides = async () => {
    try {
      const res = await fetch(getApiUrl('/api/carousel'));
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setCarouselSlides(data);
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const openAddSlideModal = () => {
    setEditingSlideId(null);
    setSlideForm({
      badge: 'PROMO',
      brand: 'ATAL PAKISTAN',
      title: '',
      subtitle: '',
      discount: '',
      buttonText: 'SHOP NOW',
      image: '',
      categoryId: categories[0]?.id || 'cat-women'
    });
    setIsCarouselModalOpen(true);
  };

  const openEditSlideModal = (slide: CarouselSlide) => {
    if (!slide) return;
    setEditingSlideId(slide.id);
    setSlideForm({
      badge: slide?.badge || '',
      brand: slide?.brand || '',
      title: slide?.title || '',
      subtitle: slide?.subtitle || '',
      discount: slide?.discount || '',
      buttonText: slide?.buttonText || 'SHOP NOW',
      image: slide?.image || '',
      categoryId: slide?.categoryId || categories[0]?.id || 'cat-women'
    });
    setIsCarouselModalOpen(true);
  };

  const handleSaveSlide = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSlideId) {
        const res = await fetch(getApiUrl(`/api/carousel/${editingSlideId}`), {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(slideForm)
        });
        if (res.ok) {
          showToast('Hero Carousel slide updated!');
          fetchCarouselSlides();
          setIsCarouselModalOpen(false);
        }
      } else {
        const res = await fetch(getApiUrl('/api/carousel'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(slideForm)
        });
        if (res.ok) {
          showToast('New slide added to Hero Carousel!');
          fetchCarouselSlides();
          setIsCarouselModalOpen(false);
        }
      }
    } catch (err) {
      showToast('Failed to save carousel slide');
    }
  };

  const handleDeleteSlide = (id: string | number) => {
    if (carouselSlides.length <= 1) {
      showToast('Carousel must have at least one slide!');
      return;
    }
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Hero Promotion Slide',
      message: 'Are you sure you want to remove this promotion slide from the homepage carousel?',
      confirmText: 'Delete Slide',
      confirmColor: 'bg-red-600',
      onConfirm: async () => {
        try {
          const res = await fetch(getApiUrl(`/api/carousel/${id}`), { method: 'DELETE' });
          if (res.ok) {
            showToast('Slide removed from carousel!');
            fetchCarouselSlides();
          }
        } catch (err) {
          showToast('Failed to delete slide');
        }
      }
    });
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const colors = productForm.colorsString ? String(productForm.colorsString).split(',').map((s: string) => s.trim()).filter(Boolean) : ['Standard'];
    const sizes = productForm.sizesString ? String(productForm.sizesString).split(',').map((s: string) => s.trim()).filter(Boolean) : ['Standard'];
    const variants: ProductVariant[] = [];
    colors.forEach((col: string, cIdx: number) => {
      sizes.forEach((sz: string, sIdx: number) => {
        variants.push({
          id: `var-${Date.now()}-${cIdx}-${sIdx}`,
          name: `${col} / ${sz}`,
          sku: productForm.sku || `ATAL-${Math.floor(100000 + Math.random() * 900000)}`,
          price: Number(productForm.price),
          originalPrice: productForm.originalPrice ? Number(productForm.originalPrice) : undefined,
          stock: Math.round(Number(productForm.stock) / (colors.length * sizes.length)) || 10,
          color: col,
          size: sz
        });
      });
    });

    const images = [productForm.imageUrl1, productForm.imageUrl2, productForm.imageUrl3].filter(Boolean);
    if (images.length < 3) {
      showToast('⚠️ Every product must have at least 3 images!');
      return;
    }

    const payload = {
      name: productForm.name,
      description: productForm.description,
      categoryId: productForm.categoryId,
      subcategoryId: productForm.subcategoryId,
      brand: productForm.brand,
      price: Number(productForm.price),
      originalPrice: Number(productForm.originalPrice),
      stock: Number(productForm.stock),
      images: images,
      variants: variants,
      isFlashDeal: productForm.isFlashDeal,
      isFeatured: productForm.isFeatured,
      isActive: productForm.isActive !== false
    };

    try {
      if (editingProductId) {
        const res = await fetch(getApiUrl(`/api/products/${editingProductId}`), {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          showToast('Product updated successfully!');
          fetchProducts();
          loadAdminData();
          setIsProductModalOpen(false);
          setEditingProductId(null);
        }
      } else {
        const res = await fetch(getApiUrl('/api/products'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          showToast('New product added successfully!');
          fetchProducts();
          loadAdminData();
          setIsProductModalOpen(false);
        }
      }
    } catch (err) {
      showToast('Error saving product');
    }
  };

  const handleDeleteProduct = (prodId: string, name?: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Product',
      message: `Are you sure you want to permanently delete "${name || 'this product'}"? It will be removed from catalog and category listings.`,
      confirmText: 'Delete Product',
      confirmColor: 'bg-red-600',
      onConfirm: async () => {
        try {
          const res = await fetch(getApiUrl(`/api/products/${prodId}`), {
            method: 'DELETE'
          });
          if (res.ok) {
            showToast('Product deleted successfully');
            fetchProducts();
            loadAdminData();
          }
        } catch (e) {
          showToast('Failed to delete product');
        }
      }
    });
  };

  const handleToggleProductStatus = async (prodId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      const res = await fetch(getApiUrl(`/api/products/${prodId}/toggle-status`), { method: 'PUT' });
      if (res.ok) {
        const data = await res.json();
        const statusText = data.isActive ? 'Turned ON (Visible on Storefront)' : 'Turned OFF (Hidden from Storefront)';
        showToast(`Product ${statusText}`);
        fetchProducts();
      } else {
        showToast('Failed to toggle product status');
      }
    } catch {
      showToast('Network error toggling product status');
    }
  };

  // Step-by-step Back navigation helper with safe fallback
  const handleBackNavigation = (fallbackPath: string = '/') => {
    if (window.location.hash) {
      try {
        window.history.replaceState(null, '', window.location.pathname || '/');
      } catch (_) {}
    }
    if (window.history.length > 1 && window.history.state && typeof window.history.state.idx === 'number' && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate(fallbackPath);
    }
  };

  const handleOpenProduct = (prod: Product) => {
    setSelectedProduct(prod);
    const vars = getProductVariants(prod);
    if (vars.length > 0) {
      setSelectedVariant(vars[0]);
    } else {
      setSelectedVariant(null);
    }
    setQuantity(1);
    const targetPath = `/product/${prod.slug || prod.id}`;
    if (location.pathname !== targetPath) {
      navigate(targetPath);
    }
  };

  const handleOpenCategory = (catId: string, subcat?: string | null) => {
    setSelectedCategory(catId);
    setSelectedSubcategory(subcat || null);
    const cat = categories.find(c => c.id === catId);
    const catSlug = cat?.slug || catId;
    const query = subcat ? `?subcategory=${encodeURIComponent(subcat)}` : '';
    const targetPath = `/category/${catSlug}${query}`;
    if (`${location.pathname}${location.search}` !== targetPath) {
      navigate(targetPath);
    }
  };

  const handleOpenShop = (catId?: string | null, subcat?: string | null, search?: string) => {
    setSelectedCategory(catId || null);
    setSelectedSubcategory(subcat || null);
    if (search !== undefined) {
      setSearchQuery(search);
    }
    if (catId) {
      const cat = categories.find(c => c.id === catId);
      const catSlug = cat?.slug || catId;
      const query = subcat ? `?subcategory=${encodeURIComponent(subcat)}` : '';
      const targetPath = `/category/${catSlug}${query}`;
      if (`${location.pathname}${location.search}` !== targetPath) {
        navigate(targetPath);
      }
    } else {
      const params = new URLSearchParams();
      if (subcat) params.set('subcategory', subcat);
      if (search) params.set('search', search);
      const qs = params.toString() ? `?${params.toString()}` : '';
      const targetPath = `/shop${qs}`;
      if (`${location.pathname}${location.search}` !== targetPath) {
        navigate(targetPath);
      }
    }
  };

  // Load initial data
  useEffect(() => {
    fetchCategories();
    fetchProducts();
    fetchStoreSettings();
    fetchCarouselSlides();
    fetchHomepageSections();
  }, []);

  const loadProductBySlug = async (slug: string) => {
    // If already loaded and matching, just set view
    if (selectedProduct && (selectedProduct.slug === slug || selectedProduct.id === slug)) {
      setCurrentView('product-detail');
      return;
    }
    // Check local product catalogue first for instant zero-latency view
    const local = products.find(p => p.slug === slug || p.id === slug);
    if (local) {
      setSelectedProduct(local);
      const vars = getProductVariants(local);
      if (vars.length > 0) setSelectedVariant(vars[0]);
      setQuantity(1);
      setCurrentView('product-detail');
    }
    try {
      const res = await fetch(getApiUrl(`/api/products/${slug}`));
      if (res.ok) {
        const prod = await res.json();
        if (prod && !prod.error && (prod.id || prod.slug)) {
          setSelectedProduct(prod);
          const vars = getProductVariants(prod);
          if (vars.length > 0) {
            setSelectedVariant(vars[0]);
          } else {
            setSelectedVariant(null);
          }
          setQuantity(1);
          setCurrentView('product-detail');
          return;
        }
      }
      if (!local) {
        setSelectedProduct(null);
        setCurrentView('product-detail');
      }
    } catch (e) {
      console.error('Error loading product by slug:', e);
      if (!local) {
        setSelectedProduct(null);
        setCurrentView('product-detail');
      }
    }
  };

  // Synchronize React Router URL pathname, hash & query parameters with UI view state
  useEffect(() => {
    const rawPath = location.pathname;
    const path = rawPath.toLowerCase();
    const searchParams = new URLSearchParams(location.search);
    const catParam = searchParams.get('category');
    const subcatParam = searchParams.get('subcategory');
    const qParam = searchParams.get('search');
    const rawHash = (location.hash || window.location.hash || '').toLowerCase();
    const isHashAdmin = rawHash === '#admin' || rawHash === '#/admin' || rawHash === '#portal' || rawHash === '#/portal';

    if (qParam !== null) {
      setSearchQuery(qParam);
    }

    if (isHashAdmin || path.startsWith('/admin') || path === '/portal') {
      setCurrentView('admin');
    } else if (path === '/' || path === '/home' || path === '') {
      setCurrentView('home');
      setSelectedProduct(null);
    } else if (path.startsWith('/product/')) {
      const slug = decodeURIComponent(rawPath.substring(9).replace(/\/$/, ''));
      if (slug) {
        loadProductBySlug(slug);
      }
    } else if (path.startsWith('/category/')) {
      const rawCat = decodeURIComponent(rawPath.substring(10).replace(/\/$/, ''));
      const matchingCat = categories.find(c => 
        c.slug.toLowerCase() === rawCat.toLowerCase() || 
        c.id.toLowerCase() === rawCat.toLowerCase() ||
        c.name.toLowerCase() === rawCat.toLowerCase()
      );
      setSelectedCategory(matchingCat ? matchingCat.id : rawCat);
      setSelectedSubcategory(subcatParam || null);
      setSelectedProduct(null);
      setCurrentView('products');
    } else if (path === '/shop' || path === '/products') {
      if (catParam) {
        const matchingCat = categories.find(c => 
          c.slug.toLowerCase() === catParam.toLowerCase() || 
          c.id.toLowerCase() === catParam.toLowerCase()
        );
        setSelectedCategory(matchingCat ? matchingCat.id : catParam);
      } else {
        setSelectedCategory(null);
      }
      setSelectedSubcategory(subcatParam || null);
      setSelectedProduct(null);
      setCurrentView('products');
    } else if (path === '/cart') {
      setCurrentView('cart');
      setIsCartOpen(true);
    } else if (path === '/checkout') {
      setCurrentView('checkout');
      setIsCartOpen(false);
    } else if (path === '/orders' || path === '/track' || path === '/track-order') {
      setCurrentView('orders');
    } else if (path === '/account' || path === '/my-account') {
      setCurrentView('account');
    } else if (path === '/login') {
      setAuthMode('login');
      setCurrentView('account');
    } else if (path === '/register') {
      setAuthMode('register');
      setCurrentView('account');
    } else if (path === '/support' || path === '/faqs' || path === '/contact') {
      setCurrentView('support');
    } else if (path.startsWith('/admin') || path === '/portal') {
      setCurrentView('admin');
    }
  }, [location.pathname, location.search, location.hash, categories, products]);

  // Window hashchange event listener for #admin / #portal
  useEffect(() => {
    const handleHash = () => {
      const h = (window.location.hash || '').toLowerCase();
      if (h === '#admin' || h === '#/admin' || h === '#portal' || h === '#/portal') {
        setCurrentView('admin');
      } else if (h === '' && location.pathname === '/') {
        setCurrentView('home');
      }
    };
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, [location.pathname]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const addToCart = (prod: Product, variant?: ProductVariant, qty = 1) => {
    const varToUse = variant || (prod.variants && prod.variants[0]);
    setCart(prev => {
      const existing = prev.find(item => item.productId === prod.id && item.variantId === varToUse?.id);
      if (existing) {
        return prev.map(item => 
          item.productId === prod.id && item.variantId === varToUse?.id
            ? { ...item, quantity: item.quantity + qty }
            : item
        );
      }
      return [...prev, { productId: prod.id, variantId: varToUse?.id, quantity: qty, selectedVariant: varToUse, product: prod }];
    });
    showToast(`Added ${prod.name} to cart!`);
    setIsCartOpen(true);
  };

  const toggleWishlist = (prodId: string) => {
    setWishlist(prev => 
      prev.includes(prodId) ? prev.filter(id => id !== prodId) : [...prev, prodId]
    );
    showToast(wishlist.includes(prodId) ? 'Removed from wishlist' : 'Added to wishlist ❤️');
  };

  const calculateSubtotal = () => {
    return cart.reduce((acc, item) => {
      const price = item.selectedVariant ? item.selectedVariant.price : (item.product?.price || 0);
      return acc + (price * item.quantity);
    }, 0);
  };

  const subtotal = calculateSubtotal();
  const shippingCharges = subtotal >= storeSettings.freeShippingThreshold || subtotal === 0 ? 0 : storeSettings.defaultShippingCharge;
  const discountAmount = Math.round(subtotal * appliedDiscount);
  const finalTotal = subtotal - discountAmount + shippingCharges;

  const handleApplyCoupon = () => {
    const code = couponCode.toLowerCase();
    if (storeSettings.coupons && storeSettings.coupons[code]) {
      setAppliedDiscount(storeSettings.coupons[code]);
      showToast(`${(storeSettings.coupons[code] * 100).toFixed(0)}% Discount Applied!`);
    } else {
      showToast('Invalid Coupon Code.');
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) {
      showToast('⚠️ Your shopping cart is empty! Please add products before checking out.');
      return;
    }

    if (!checkoutForm.customerName.trim() || !checkoutForm.mobileNumber.trim() || !checkoutForm.city.trim() || !checkoutForm.address.trim()) {
      showToast('Please fill in all required delivery details (Name, Mobile, City, Address).');
      return;
    }

    const tid = checkoutForm.transactionId ? checkoutForm.transactionId.trim() : '';
    if (!tid) {
      setCheckoutTidError(true);
      showToast('⚠️ Payment Transaction ID (TID) is mandatory before placing order!');
      return;
    }
    setCheckoutTidError(false);

    // Validate Pakistani mobile
    const cleanedMobile = checkoutForm.mobileNumber.replace(/\s+/g, '');
    if (!/^(\+92|0)?3[0-9]{9}$/.test(cleanedMobile)) {
      showToast('Invalid Pakistani mobile number. Must start with 03 (e.g. 03001234567)');
      return;
    }

    const payload = {
      ...checkoutForm,
      customerId: currentCustomer?.id,
      mobileNumber: cleanedMobile,
      transactionId: tid,
      transactionReference: tid,
      items: cart.map(item => ({
        productId: item.productId,
        variantId: item.variantId,
        quantity: item.quantity
      })),
      couponCode: appliedDiscount > 0 ? 'ATAL2026' : undefined
    };

    try {
      const res = await fetch(getApiUrl('/api/checkout'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.order) {
        setLastPlacedOrder(data.order);
        setSearchedOrder(data.order);
        if (currentCustomer) {
          fetchCustomerOrders(currentCustomer.id);
        }
        try {
          const stored = JSON.parse(localStorage.getItem('atal_orders') || '[]');
          localStorage.setItem('atal_orders', JSON.stringify([data.order, ...stored]));
          localStorage.setItem('atal_last_tracking', data.order.trackingNumber);
        } catch (e) {}
        setCart([]);
        setCurrentView('order-success');
        const recipient = data.order.email || data.emailConfirmation?.recipientEmail || currentCustomer?.email;
        if (recipient) {
          showToast(`🎉 Order Placed! Automated confirmation email sent to ${recipient}`);
        } else {
          showToast(`🎉 Order Placed! 8-Digit Tracking #: ${data.order.trackingNumber}`);
        }
        loadAdminData();
      } else {
        showToast(data.error || 'Checkout failed');
      }
    } catch (e) {
      showToast('Network error during checkout');
    }
  };

  const handleTrackOrder = async (queryToTrack?: string) => {
    const q = (queryToTrack || trackingSearchQuery).trim();
    if (!q) {
      showToast('Please enter an 8-digit tracking number, order ID, or mobile number.');
      return;
    }
    setIsSearchingOrder(true);
    try {
      const res = await fetch(getApiUrl(`/api/orders/${encodeURIComponent(q)}`));
      if (res.ok) {
        const orderData = await res.json();
        setSearchedOrder(orderData);
        showToast(`Order found! Tracking #${orderData.trackingNumber}`);
      } else {
        const err = await res.json();
        setSearchedOrder(null);
        showToast(err.error || 'No order found with this tracking number');
      }
    } catch (e) {
      showToast('Failed to track order');
    } finally {
      setIsSearchingOrder(false);
    }
  };

  const fetchStaffList = async () => {
    try {
      const res = await fetch(getApiUrl('/api/admin/staff'));
      if (res.ok) {
        const data = await res.json();
        setStaffList(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error('Failed to fetch staff list:', e);
    }
  };

  const fetchBackupSnapshots = async () => {
    setIsLoadingBackups(true);
    try {
      const res = await fetch(getApiUrl('/api/admin/backups'));
      if (res.ok) {
        const data = await res.json();
        setBackupSnapshots(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to load backup snapshots:', err);
    } finally {
      setIsLoadingBackups(false);
    }
  };

  const handleCreateManualSnapshot = async () => {
    setIsCreatingSnapshot(true);
    try {
      const res = await fetch(getApiUrl('/api/admin/backups/create'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: manualSnapshotNote.trim() || 'Manual Admin Snapshot' })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('🛡️ Backup snapshot created successfully!');
        setManualSnapshotNote('');
        fetchBackupSnapshots();
      } else {
        showToast(data.error || 'Failed to create backup snapshot');
      }
    } catch {
      showToast('Network error while creating snapshot');
    } finally {
      setIsCreatingSnapshot(false);
    }
  };

  const handleRestoreSnapshot = (snapshotId: string, filename: string) => {
    setConfirmDialog({
      isOpen: true,
      title: '⚠️ Restore System from Backup Snapshot',
      message: `Are you sure you want to restore the entire ATAL Store database from snapshot "${filename}"? A safety backup will automatically be generated before restoration.`,
      confirmText: 'Yes, Restore Now',
      confirmColor: 'bg-amber-600',
      onConfirm: async () => {
        setIsRestoringSnapshot(true);
        try {
          const res = await fetch(getApiUrl(`/api/admin/backups/${snapshotId}/restore`), {
            method: 'POST'
          });
          const data = await res.json();
          if (res.ok && data.success) {
            showToast(`🎉 State successfully restored! Pre-restore backup ID: ${data.autoBackupId || 'saved'}`);
            await fetchCategories();
            await fetchProducts();
            await fetchCarouselSlides();
            await fetchStoreSettings();
            await loadAdminData();
            await fetchBackupSnapshots();
          } else {
            showToast(data.error || 'Failed to restore snapshot');
          }
        } catch {
          showToast('Network error while restoring snapshot');
        } finally {
          setIsRestoringSnapshot(false);
        }
      }
    });
  };

  const handleDeleteSnapshot = (snapshotId: string, filename: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Backup Snapshot',
      message: `Are you sure you want to permanently delete snapshot "${filename}"? This action cannot be undone.`,
      confirmText: 'Delete Snapshot',
      confirmColor: 'bg-red-600',
      onConfirm: async () => {
        try {
          const res = await fetch(getApiUrl(`/api/admin/backups/${snapshotId}`), {
            method: 'DELETE'
          });
          if (res.ok) {
            showToast('Snapshot deleted');
            fetchBackupSnapshots();
          } else {
            showToast('Failed to delete snapshot');
          }
        } catch {
          showToast('Error deleting snapshot');
        }
      }
    });
  };

  const triggerDataExport = (type: string, _format: string = 'json') => {
    try {
      const url = getApiUrl(`/api/admin/export-data?type=${type}`);
      const a = document.createElement('a');
      a.href = url;
      const todayStr = new Date().toISOString().slice(0, 10);
      a.download = `atal-${type === 'all' ? 'store' : type}-backup-${todayStr}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      showToast(`📥 Exporting ${type.toUpperCase()} in JSON format...`);
    } catch {
      showToast('Failed to start export download');
    }
  };

  const triggerSnapshotDownload = (id: string, filename: string) => {
    try {
      const url = getApiUrl(`/api/admin/backups/${id}/download`);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch {
      showToast('Failed to download snapshot file');
    }
  };

  const handleFileSelectedForImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.json')) {
      showToast('⚠️ Only .json files are supported. Please select an ATAL JSON backup.');
      e.target.value = '';
      return;
    }

    setImportSelectedFile(file);
    setImportReport(null);
    setImportValidation(null);
    setImportFileFormat('json');
    setSelectedDatasetType('auto');

    const reader = new FileReader();
    reader.onload = async (ev) => {
      let text = (ev.target?.result as string) || '';
      // Strip UTF-8 BOM from files saved in Windows Notepad
      text = text.replace(/^\uFEFF/, '').trim();
      setImportFileRawText(text);

      // Instant client-side JSON syntax check
      try {
        JSON.parse(text);
      } catch (parseErr: any) {
        setImportValidation({
          isValid: false,
          valid: false,
          detectedFormat: 'JSON (Malformed)',
          fileType: 'JSON',
          format: 'JSON',
          inferredDataset: 'Invalid JSON Syntax',
          inferredType: 'Invalid JSON Syntax',
          dataset: 'Invalid JSON Syntax',
          errors: [`Invalid JSON syntax: ${parseErr.message}. Please ensure the file is well-formed JSON.`],
          warnings: ['Check for missing commas, unescaped quotes, or syntax errors.']
        });
        showToast(`⚠️ Malformed JSON syntax: ${parseErr.message}`);
        return;
      }

      await validateImportContent(text, 'auto');
    };

    reader.readAsText(file, 'utf-8');
  };

  const validateImportContent = async (rawText: string, datasetOverride: string = selectedDatasetType) => {
    if (!rawText) return;
    setIsValidatingImport(true);
    try {
      const res = await fetch(getApiUrl('/api/admin/validate-import'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawContent: rawText,
          selectedDatasetType: datasetOverride !== 'auto' ? datasetOverride : undefined
        })
      });
      const valData = await res.json();
      setImportValidation(valData);
      if (res.ok && (valData.isValid || valData.valid)) {
        showToast(`✓ File analyzed: ${valData.inferredDataset || 'Ready for preview'}`);
      } else {
        showToast(`⚠️ Validation note: ${(valData.errors || []).join('; ') || valData.error || 'Please verify dataset selection'}`);
      }
    } catch (err) {
      showToast('Error validating import file format');
    } finally {
      setIsValidatingImport(false);
    }
  };

  const handleDatasetTypeChange = (newType: string) => {
    setSelectedDatasetType(newType);
    if (importFileRawText) {
      validateImportContent(importFileRawText, newType);
    }
  };

  const executeImportPayload = async () => {
    if (!importFileRawText) {
      showToast('No import file loaded');
      return;
    }
    setIsExecutingImport(true);
    try {
      const res = await fetch(getApiUrl('/api/admin/import-data'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawContent: importFileRawText,
          selectedDatasetType: selectedDatasetType !== 'auto' ? selectedDatasetType : undefined,
          mode: importMode
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setImportReport(data);
        showToast(`🎉 Import successful! Auto-backup snapshot saved.`);
        await fetchCategories();
        await fetchProducts();
        await fetchCarouselSlides();
        await fetchHomepageSections();
        await fetchStoreSettings();
        await loadAdminData();
        await fetchBackupSnapshots();
      } else {
        showToast(data.error || 'Import failed on server');
        setImportReport(data);
      }
    } catch {
      showToast('Network error during import');
    } finally {
      setIsExecutingImport(false);
    }
  };

  const handleExecuteValidatedImport = () => {
    if (!importValidation?.isValid) {
      showToast('Please upload a valid file before importing.');
      return;
    }

    if (importMode === 'full_restore') {
      setConfirmDialog({
        isOpen: true,
        title: '⚠️ Confirm Full Restore Import',
        message: 'Full Restore mode will replace your current catalog and settings with the contents of this backup. An automated safety backup snapshot will be created before proceeding. Do you wish to proceed?',
        confirmText: 'Yes, Full Restore',
        confirmColor: 'bg-red-600',
        onConfirm: () => {
          executeImportPayload();
        }
      });
    } else {
      executeImportPayload();
    }
  };

  const downloadImportReport = () => {
    if (!importReport) return;
    try {
      const jsonStr = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(importReport, null, 2))}`;
      const a = document.createElement('a');
      a.href = jsonStr;
      a.download = `atal_import_report_${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch {
      showToast('Failed to download report');
    }
  };

  const loadAdminData = async () => {
    try {
      const statsRes = await fetch(getApiUrl('/api/admin/stats'));
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        if (statsData && typeof statsData === 'object' && !statsData.error) {
          setAdminStats(statsData);
        }
      }

      const ordersRes = await fetch(getApiUrl('/api/orders'));
      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        if (Array.isArray(ordersData)) {
          setAdminOrders(ordersData);
        } else if (ordersData && Array.isArray(ordersData.orders)) {
          setAdminOrders(ordersData.orders);
        } else {
          setAdminOrders([]);
        }
      } else {
        setAdminOrders([]);
      }

      fetchStaffList();
      fetchBackupSnapshots();
    } catch (e) {
      console.error('Failed to load admin data:', e);
    }
  };

  const [importFileContent, setImportFileContent] = useState<any>(null);
  const [isImportingData, setIsImportingData] = useState(false);

  const handleExportData = () => {
    triggerDataExport('all', 'json');
  };

  const handleImportData = async () => {
    if (!importFileContent) {
      showToast('Please select a valid ATAL backup file first.');
      return;
    }
    setIsImportingData(true);
    try {
      const res = await fetch(getApiUrl('/api/admin/import-data'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rawContent: JSON.stringify(importFileContent),
          format: 'json',
          mode: 'update_existing'
        })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast('🎉 Full store data successfully imported and restored!');
        setImportFileContent(null);
        await fetchCategories();
        await fetchProducts();
        await fetchCarouselSlides();
        await fetchStoreSettings();
        await loadAdminData();
      } else {
        showToast(data.error || 'Backend failed to import backup data');
      }
    } catch {
      showToast('Error importing backup data');
    } finally {
      setIsImportingData(false);
    }
  };

  const handleExportProducts = () => {
    triggerDataExport('products', 'json');
  };

  const handleImportProducts = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.json')) {
      showToast('⚠️ Only .json backup files are supported for product imports.');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        let text = (ev.target?.result as string) || '';
        text = text.replace(/^\uFEFF/, '').trim();
        try {
          JSON.parse(text);
        } catch (pe: any) {
          showToast(`⚠️ Malformed JSON: ${pe.message}`);
          return;
        }

        const res = await fetch(getApiUrl('/api/admin/import-data'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rawContent: text, mode: 'update_existing' })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          showToast(`🎉 Successfully imported products! (Snapshot: ${data.autoBackupId || 'saved'})`);
          await fetchProducts();
          await loadAdminData();
        } else {
          showToast(data.error || 'Failed to import products.');
        }
      } catch (err) {
        showToast('Error reading products file.');
      }
    };
    reader.readAsText(file, 'utf-8');
    e.target.value = '';
  };

  const handleExportCategories = () => {
    triggerDataExport('categories', 'json');
  };

  const handleImportCategories = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.json')) {
      showToast('⚠️ Only .json backup files are supported for category imports.');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        let text = (ev.target?.result as string) || '';
        text = text.replace(/^\uFEFF/, '').trim();
        try {
          JSON.parse(text);
        } catch (pe: any) {
          showToast(`⚠️ Malformed JSON: ${pe.message}`);
          return;
        }

        const res = await fetch(getApiUrl('/api/admin/import-data'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rawContent: text, mode: 'update_existing' })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          showToast(`🎉 Successfully imported categories! (Snapshot: ${data.autoBackupId || 'saved'})`);
          await fetchCategories();
          await loadAdminData();
        } else {
          showToast(data.error || 'Failed to import categories.');
        }
      } catch (err) {
        showToast('Error reading categories file.');
      }
    };
    reader.readAsText(file, 'utf-8');
    e.target.value = '';
  };

  useEffect(() => {
    if (adminAuthUser && currentView === 'admin') {
      loadAdminData();
    }
  }, [adminAuthUser, currentView]);

  const handleStaffLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsStaffLoggingIn(true);

    const result = await authService.loginStaff(adminLoginForm.email, adminLoginForm.password);

    if (result.success && result.data) {
      setAdminAuthUser(result.data);
      localStorage.setItem('atal_staff_user', JSON.stringify(result.data));
      showToast(`🎉 ${result.message || `Welcome, ${result.data.name}!`}`);
      setCurrentView('admin');
      loadAdminData();
    } else {
      showToast(result.error || 'Invalid admin credentials.');
    }
    setIsStaffLoggingIn(false);
  };

  const handleStaffLogout = () => {
    setAdminAuthUser(null);
    localStorage.removeItem('atal_staff_user');
    showToast('Signed out of Admin & Staff Portal');
    navigate('/');
  };

  const handleStaffChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminAuthUser) return;
    if (staffPasswordForm.newPassword.length < 6) {
      showToast('New password must be at least 6 characters.');
      return;
    }
    if (staffPasswordForm.newPassword !== staffPasswordForm.confirmNewPassword) {
      showToast('New passwords do not match. Please verify.');
      return;
    }
    setIsChangingStaffPassword(true);
    try {
      const res = await fetch(getApiUrl('/api/admin/change-password'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: adminAuthUser.email,
          currentPassword: staffPasswordForm.currentPassword,
          newPassword: staffPasswordForm.newPassword
        })
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`🎉 ${data.message || 'Password updated successfully!'}`);
        setIsStaffPasswordModalOpen(false);
        setStaffPasswordForm({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
      } else {
        showToast(data.error || 'Failed to update password');
      }
    } catch {
      showToast('Network error while updating password');
    } finally {
      setIsChangingStaffPassword(false);
    }
  };

  const updateOrderStatus = async (orderId: string, orderStatus: string, note?: string) => {
    try {
      const res = await fetch(getApiUrl(`/api/orders/${orderId}/status`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderStatus, note })
      });
      if (res.ok) {
        const updated = await res.json();
        showToast(`Order status updated to ${orderStatus}`);
        loadAdminData();
        if (selectedOrderDetails && selectedOrderDetails.id === orderId) {
          setSelectedOrderDetails(updated);
        }
      }
    } catch (e) {
      showToast('Failed to update status');
    }
  };

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffForm.name || !newStaffForm.email || !newStaffForm.password) {
      showToast('Please fill in all staff fields.');
      return;
    }
    if (newStaffForm.password.length < 6) {
      showToast('Password must be at least 6 characters.');
      return;
    }
    setIsAddingStaff(true);
    try {
      const res = await fetch(getApiUrl('/api/admin/staff'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStaffForm)
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`🎉 ${data.message || 'Staff member added successfully!'}`);
        setIsAddStaffModalOpen(false);
        setNewStaffForm({ name: '', email: '', role: 'employee', password: '' });
        fetchStaffList();
      } else {
        showToast(data.error || 'Failed to add staff member');
      }
    } catch {
      showToast('Network error while adding staff member');
    } finally {
      setIsAddingStaff(false);
    }
  };

  const handleResetStaffPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffResetTarget) return;
    if (staffResetPassword.length < 6) {
      showToast('Password must be at least 6 characters.');
      return;
    }
    setIsResettingStaffPassword(true);
    try {
      const res = await fetch(getApiUrl(`/api/admin/staff/${staffResetTarget.id}/password`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword: staffResetPassword })
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`🎉 ${data.message || 'Staff password reset successfully!'}`);
        setStaffResetTarget(null);
        setStaffResetPassword('');
        fetchStaffList();
      } else {
        showToast(data.error || 'Failed to reset password');
      }
    } catch {
      showToast('Network error while resetting password');
    } finally {
      setIsResettingStaffPassword(false);
    }
  };

  const handleDeleteStaff = (staffUser: any) => {
    if (staffUser.email.toLowerCase() === 'uatal.pk@gmail.com') {
      showToast('Cannot delete the primary administrator account.');
      return;
    }
    setConfirmDialog({
      isOpen: true,
      title: 'Remove Staff Member',
      message: `Are you sure you want to remove ${staffUser.name} (${staffUser.email}) from staff access?`,
      confirmText: 'Remove Staff',
      confirmColor: 'bg-red-600',
      onConfirm: async () => {
        try {
          const res = await fetch(getApiUrl(`/api/admin/staff/${staffUser.id}`), {
            method: 'DELETE'
          });
          if (res.ok) {
            showToast('Staff member removed successfully');
            fetchStaffList();
          } else {
            const err = await res.json();
            showToast(err.error || 'Failed to remove staff');
          }
        } catch {
          showToast('Network error removing staff member');
        }
      }
    });
  };

  const handleDeleteOrder = (orderId: string, orderNumber: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Delete Order Record',
      message: `Are you sure you want to delete Order #${orderNumber}? This action cannot be undone.`,
      confirmText: 'Delete Order',
      confirmColor: 'bg-red-600',
      onConfirm: async () => {
        try {
          const res = await fetch(getApiUrl(`/api/orders/${orderId}`), {
            method: 'DELETE'
          });
          if (res.ok) {
            showToast(`Order #${orderNumber} deleted successfully`);
            loadAdminData();
            if (selectedOrderDetails?.id === orderId) {
              setSelectedOrderDetails(null);
            }
          } else {
            showToast('Failed to delete order');
          }
        } catch {
          showToast('Network error deleting order');
        }
      }
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-600 text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="w-5 h-5" />
          <span className="font-medium text-sm">{toastMessage}</span>
        </div>
      )}

      {/* Main Container: Full Responsive Layout */}
      <div className="w-full bg-white min-h-screen flex flex-col">

        {/* ======================================================== */}
        {/* HEADER: MOBILE VIEW (Exact Dark Forest Green Reference) */}
        {/* ======================================================== */}
        <header className="sticky top-0 z-40 bg-[#062419] text-white select-none border-b border-emerald-950/80 shrink-0 md:hidden">
          {/* Mobile Brand Bar */}
          <div className="px-4 py-2.5 flex items-center justify-between">
            {/* Brand Title with Official ATAL 3D Logo */}
            <div 
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => navigate('/')}
            >
              <img 
                src="/assets/aistudio/WhatsApp_Image_2026-09-29_at_12.21.56_PM_187de251.jpeg" 
                alt="ATAL Logo" 
                className="w-9 h-9 rounded-xl object-contain bg-white/10 p-0.5 border border-emerald-500/40 shadow-xs"
              />
              <div>
                <h1 className="text-xl font-black tracking-wider text-[#f5d77f] drop-shadow-xs leading-none">
                  ATAL
                </h1>
                <p className="text-[10px] text-emerald-200/90 font-medium tracking-wide mt-1">
                  Shop Smart. Live Better
                </p>
              </div>
            </div>

            {/* Action Icons */}
            <div className="flex items-center gap-3">
              {/* Search */}
              <button 
                onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
                className="p-1 text-white/90 hover:text-white transition"
                title="Search"
              >
                <Search className="w-5 h-5" />
              </button>

              {/* Wishlist with Badge */}
              <button 
                onClick={() => setIsWishlistOpen(true)}
                className="p-1 text-white/90 hover:text-white transition relative"
                title="Wishlist"
              >
                <Heart className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 bg-amber-400 text-slate-950 font-black text-[9.5px] w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                  {wishlist.length}
                </span>
              </button>

              {/* Cart with live counter */}
              <button 
                onClick={() => setIsCartOpen(true)}
                className="p-1 text-white/90 hover:text-white transition relative"
                title="Shopping Bag"
              >
                <ShoppingBag className="w-5 h-5" />
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white font-extrabold text-[9.5px] w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                    {cart.reduce((a, c) => a + c.quantity, 0)}
                  </span>
                )}
              </button>

              {/* Customer Account Button */}
              <button 
                onClick={() => navigate('/account')}
                className={`w-7 h-7 rounded-full flex items-center justify-center relative transition ${
                  currentCustomer 
                    ? 'bg-amber-400 text-slate-950 font-black text-xs shadow-xs' 
                    : 'bg-emerald-800/80 hover:bg-emerald-700 text-white border border-emerald-500/50'
                }`}
                title={currentCustomer ? `Account: ${currentCustomer.name}` : "Customer Account"}
              >
                {currentCustomer ? (
                  <span>{currentCustomer.name.charAt(0).toUpperCase()}</span>
                ) : (
                  <User className="w-3.5 h-3.5 text-emerald-200" />
                )}
                {currentCustomer && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400 absolute -bottom-0.5 -right-0.5 border border-[#062419]"></span>
                )}
              </button>
            </div>
          </div>

          {/* Mobile Search Dropdown */}
          {isMobileSearchOpen && (
            <div className="px-3 pb-2.5 pt-0.5">
              <div className="relative">
                <input 
                  type="text"
                  placeholder="Search products, brands, or deals..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleOpenShop(null, null, searchQuery);
                    }
                  }}
                  autoFocus
                  className="w-full bg-emerald-950/80 border border-emerald-700/60 text-white placeholder-emerald-300/60 rounded-xl pl-9 pr-8 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-amber-300 transition"
                />
                <Search className="w-3.5 h-3.5 text-emerald-300/70 absolute left-3 top-2.5" />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-2 text-emerald-300/70 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}
        </header>

        {/* ======================================================== */}
        {/* HEADER: DESKTOP & TABLET VIEW (Clean Header, No Location) */}
        {/* ======================================================== */}
        <header className="sticky top-0 z-40 bg-white border-b border-slate-200 hidden md:block">
          {/* Top Announcement Bar */}
          <div className="bg-emerald-700 text-white text-xs py-1.5 px-4 text-center font-medium flex justify-between items-center">
            <span className="hidden sm:inline">🇵🇰 Free Nationwide Delivery on Orders Above PKR 9,999!</span>
            <span>Support: 03719150297 | WhatsApp 24/7</span>
            <span className="text-emerald-200 text-xs">Shop Smart. Live Better</span>
          </div>

          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
            {/* Logo */}
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => navigate('/')}>
              <img 
                src="/assets/aistudio/WhatsApp_Image_2026-09-29_at_12.21.56_PM_187de251.jpeg" 
                alt="ATAL Logo" 
                className="w-11 h-11 rounded-xl object-contain bg-emerald-50/60 p-1 border border-emerald-200 shadow-sm group-hover:scale-105 transition"
              />
              <div>
                <h1 className="font-extrabold text-lg leading-tight text-slate-900 tracking-tight flex items-center gap-1.5">
                  <span>ATAL</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded-sm">STORE</span>
                </h1>
                <p className="text-xs text-slate-500 font-medium">Shop Smart. Live Better</p>
              </div>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-lg relative">
              <input 
                type="text" 
                placeholder="Search products, brands, SKU, or categories..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleOpenShop(null, null, searchQuery);
                  }
                }}
                className="w-full bg-slate-100 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button 
                onClick={() => navigate('/orders')}
                className="text-xs font-semibold text-slate-700 hover:text-emerald-600 transition"
              >
                Track Order
              </button>

              <button 
                onClick={() => navigate('/account')}
                className={`text-xs font-bold px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition ${
                  currentCustomer
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100'
                    : 'border-slate-200 text-slate-700 hover:border-emerald-500 hover:text-emerald-700'
                }`}
                title={currentCustomer ? `Account: ${currentCustomer.name}` : "Customer Sign In / Register"}
              >
                <User className="w-3.5 h-3.5 text-emerald-600" />
                <span>{currentCustomer ? `Hi, ${currentCustomer.name.split(' ')[0]}` : 'Account'}</span>
              </button>

              <button 
                onClick={() => setIsCartOpen(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 rounded-xl flex items-center gap-2 shadow-sm transition relative"
              >
                <ShoppingBag className="w-4 h-4" />
                <span className="text-xs font-bold">{cart.reduce((a, c) => a + c.quantity, 0)}</span>
              </button>
            </div>
          </div>

          {/* Categories Nav Header */}
          <div className="bg-slate-900 text-white px-4 py-2 text-xs overflow-x-auto flex gap-6 no-scrollbar">
            <button 
              onClick={() => navigate('/')}
              className="hover:text-emerald-400 font-medium whitespace-nowrap"
            >
              Home
            </button>
            {activeCategories.map(cat => (
              <button 
                key={cat.id} 
                onClick={() => handleOpenCategory(cat.id, cat.slug)}
                className="hover:text-emerald-400 whitespace-nowrap font-medium text-slate-200"
              >
                {cat.name}
              </button>
            ))}
            <button 
              onClick={() => navigate('/support')}
              className="hover:text-emerald-400 font-medium whitespace-nowrap text-emerald-300"
            >
              Customer Support
            </button>
          </div>
        </header>

        {/* Scrollable Body Content */}
        <div className="flex-1 overflow-y-auto pb-20 md:pb-0">

          {/* VIEW: HOME SCREEN */}
          {currentView === 'home' && (
            <>
              {/* ======================================================== */}
              {/* MOBILE HOME SCREEN (Exact match to reference mockup)      */}
              {/* ======================================================== */}
              <div className="pb-24 bg-[#f8fafc] md:hidden">
                {/* Interactive Hero Carousel (Mobile View) */}
                <div className="mx-3 mt-3 relative rounded-2xl overflow-hidden shadow-md bg-[#062419] border border-emerald-900/40 select-none group">
                  <div 
                    className="relative aspect-[16/9] w-full overflow-hidden cursor-pointer"
                    onTouchStart={handleHeroTouchStart}
                    onTouchMove={handleHeroTouchMove}
                    onTouchEnd={handleHeroTouchEnd}
                    onClick={() => {
                      const slide = carouselSlides[currentHeroSlide] || carouselSlides[0];
                      if (slide) {
                        setSelectedCategory(slide.categoryId);
                        setCurrentView('products');
                      }
                    }}
                  >
                    {/* Slides */}
                    {safeCarouselSlides.map((slide, idx) => {
                      if (!slide) return null;
                      return (
                        <div 
                          key={slide.id || idx}
                          className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
                            idx === currentHeroSlide ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                          }`}
                        >
                          <img 
                            src={slide?.image || DEFAULT_PRODUCT_IMAGE} 
                            alt={slide?.title || 'Slide'} 
                            className="w-full h-full object-cover object-center group-hover:scale-105 transition duration-500" 
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/25 flex flex-col justify-between p-3.5">
                            {/* Top Text on Banner */}
                            <div className="text-right ml-auto max-w-[68%]">
                              <p className="text-[11px] font-black tracking-widest text-[#f5d77f] font-serif">{slide?.brand || 'ATAL PAKISTAN'}</p>
                              <p className="text-[8px] tracking-wider text-emerald-200 uppercase font-semibold">PAKISTAN</p>
                              <h2 className="text-xs sm:text-sm font-bold text-white tracking-wide mt-0.5 leading-tight line-clamp-1">
                                {slide?.title || 'Exclusive Collection'}
                              </h2>
                              <p className="text-[7.5px] text-slate-300 mt-0.5 line-clamp-1">
                                {slide?.subtitle || ''}
                              </p>
                              <div className="mt-1 flex items-center justify-end gap-1.5">
                                <span className="text-[8.5px] font-bold text-amber-300">{slide?.discount || ''}</span>
                                <span className="bg-[#f5d77f] text-slate-950 font-black text-[8px] px-2 py-0.5 rounded-full uppercase shadow-xs">
                                  {slide?.buttonText || 'SHOP NOW'}
                                </span>
                              </div>
                            </div>

                            {/* Bottom Banner Tag and Headline */}
                            <div>
                              <span className="bg-[#d97706] text-black font-black text-[9px] px-2.5 py-0.5 rounded-xs uppercase tracking-wider inline-block mb-1 shadow-sm">
                                {slide?.badge || 'SPECIAL'}
                              </span>
                              <h3 className="text-white font-extrabold text-xs sm:text-sm drop-shadow-md leading-tight line-clamp-1">
                                {slide?.title || 'Special Feature'}
                              </h3>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {/* Prev / Next Buttons */}
                    <button 
                      onClick={(e) => { e.stopPropagation(); prevHeroSlide(); }}
                      className="absolute left-1.5 top-1/2 -translate-y-1/2 z-20 w-6 h-6 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs transition active:scale-90"
                      aria-label="Previous Slide"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); nextHeroSlide(); }}
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 z-20 w-6 h-6 rounded-full bg-black/40 hover:bg-black/70 text-white flex items-center justify-center backdrop-blur-xs transition active:scale-90"
                      aria-label="Next Slide"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>

                    {/* Dots indicator */}
                    <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5">
                      {carouselSlides.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={(e) => { e.stopPropagation(); setCurrentHeroSlide(idx); }}
                          className={`transition-all duration-300 rounded-full ${
                            idx === currentHeroSlide 
                              ? 'w-5 h-1.5 bg-[#f5d77f] shadow-xs' 
                              : 'w-1.5 h-1.5 bg-white/50 hover:bg-white/80'
                          }`}
                          aria-label={`Slide ${idx + 1}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* 3-Column Trust Strip */}
                <div className="mx-3 mt-3 bg-white rounded-xl border border-slate-100 shadow-xs py-3 px-2 grid grid-cols-3 divide-x divide-slate-100 text-center">
                  <div className="px-1">
                    <Truck className="w-5 h-5 text-slate-800 mx-auto mb-1 stroke-[1.75]" />
                    <p className="font-bold text-[11px] text-slate-900 leading-tight">Free Delivery</p>
                    <p className="text-[9px] text-slate-400 mt-0.5">Orders Rs 9,999+</p>
                  </div>
                  <div className="px-1">
                    <ShieldCheck className="w-5 h-5 text-slate-800 mx-auto mb-1 stroke-[1.75]" />
                    <p className="font-bold text-[11px] text-slate-900 leading-tight">JazzCash & EP</p>
                    <p className="text-[9px] text-slate-400 mt-0.5">100% Secure</p>
                  </div>
                  <div className="px-1">
                    <RotateCcw className="w-5 h-5 text-slate-800 mx-auto mb-1 stroke-[1.75]" />
                    <p className="font-bold text-[11px] text-slate-900 leading-tight">7-Day Return</p>
                    <p className="text-[9px] text-slate-400 mt-0.5">Doorstep Pickup</p>
                  </div>
                </div>

                {/* Shop by Category (All Categories in 1 Horizontal Row) */}
                <div className="mt-4 px-3">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                      Shop by Category
                    </h3>
                    <span 
                      onClick={() => handleOpenShop()}
                      className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 cursor-pointer"
                    >
                      All ({categories.length})
                    </span>
                  </div>
                  <div className="flex items-start gap-3.5 overflow-x-auto no-scrollbar py-1 scroll-smooth">
                    {categories.map((cat) => (
                      <button 
                        key={cat.id}
                        onClick={() => handleOpenCategory(cat.id, cat.slug)}
                        className="flex flex-col items-center shrink-0 min-w-[66px] max-w-[76px] group cursor-pointer"
                      >
                        <div className="w-14 h-14 rounded-full bg-[#eaf8f0] group-hover:bg-[#d8f3e2] p-1 flex items-center justify-center transition shadow-xs border border-emerald-100 overflow-hidden">
                          {cat.image ? (
                            <img src={cat.image} alt={cat.name} className="w-full h-full object-cover rounded-full" />
                          ) : (
                            <LayoutGrid className="w-6 h-6 text-emerald-800" />
                          )}
                        </div>
                        <span className="text-[11px] font-bold text-slate-800 mt-1.5 text-center leading-tight line-clamp-1 group-hover:text-emerald-700">
                          {cat.name}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* ⚡ Featured Festive Deals (All Products in One Row) */}
                <div className="mt-5 mx-3 p-3.5 bg-red-100 rounded-2xl border border-red-200 shadow-xs">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-extrabold text-sm sm:text-base text-slate-900 flex items-center gap-1.5">
                      <span className="text-amber-500">⚡</span> Featured Festive Deals
                    </h3>
                    <span 
                      onClick={() => handleOpenShop()}
                      className="text-[11px] font-bold text-red-700 hover:text-red-800 cursor-pointer"
                    >
                      View All
                    </span>
                  </div>

                  {/* Single Horizontal Row for All Festive Products */}
                  <div className="flex flex-nowrap overflow-x-auto no-scrollbar gap-3 pb-1 pt-1 scroll-smooth">
                    {safeProducts.filter(p => p && (p.isFlashDeal || p.isFeatured || p.isNewArrival)).map((prod) => (
                      <div 
                        key={prod.id}
                        onClick={() => handleOpenProduct(prod)}
                        className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition cursor-pointer flex flex-col group shrink-0 w-[170px] sm:w-[195px]"
                      >
                        {/* Image Box */}
                        <div className="relative aspect-square w-full bg-[#062419] overflow-hidden flex items-center justify-center">
                          <img 
                            src={getPrimaryProductImage(prod)} 
                            alt={prod.name}
                            className={`w-full h-full ${getPrimaryProductImage(prod).includes('WhatsApp') ? 'object-contain p-2' : 'object-cover'} group-hover:scale-105 transition duration-300`} 
                          />
                          {/* Badges */}
                          <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
                            {prod.discountPercentage && (
                              <span className="bg-[#ef4444] text-white text-[9.5px] font-black px-2 py-0.5 rounded-md shadow-xs">
                                {prod.discountPercentage}% OFF
                              </span>
                            )}
                            {(prod.isNewArrival || prod.id.startsWith('prod-festive')) && (
                              <span className="bg-emerald-600 text-white text-[8.5px] font-black px-1.5 py-0.5 rounded-md shadow-xs uppercase tracking-wider">
                                NEW ARRIVAL
                              </span>
                            )}
                          </div>
                          <button 
                            onClick={(e) => { e.stopPropagation(); toggleWishlist(prod.id); }}
                            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white shadow-md flex items-center justify-center transition hover:scale-110"
                          >
                            <Heart className={`w-3.5 h-3.5 ${wishlist.includes(prod.id) ? 'fill-red-500 text-red-500' : 'text-slate-400'}`} />
                          </button>
                        </div>

                        {/* Content Box */}
                        <div className="p-2.5 flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex items-center justify-between text-[10px] mb-1">
                              <span className="font-black text-[#a87428] uppercase tracking-wider truncate mr-1">
                                {prod.brand}
                              </span>
                              <span className="font-bold text-amber-500 flex items-center gap-0.5 shrink-0">
                                ★ {prod.rating}
                              </span>
                            </div>
                            <h4 className="font-bold text-xs text-slate-800 line-clamp-1 leading-snug">
                              {prod.name}
                            </h4>
                          </div>
                          <div className="mt-2 flex items-center justify-between pt-1 border-t border-slate-100">
                            <div>
                              <span className="text-xs font-black text-slate-900">
                                Rs {prod.price.toLocaleString()}
                              </span>
                              {prod.originalPrice && (
                                <span className="text-[10px] text-slate-400 line-through ml-1">
                                  Rs {prod.originalPrice.toLocaleString()}
                                </span>
                              )}
                            </div>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                addToCart(prod, prod.variants?.[0]);
                              }}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-2 py-1 text-[10px] font-bold shadow-xs transition"
                            >
                              + Cart
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* SPOTLIGHT SECTION (Mobile) */}
                {homepageSections?.spotlight?.enabled !== false && Array.isArray(homepageSections?.spotlight?.items) && homepageSections.spotlight.items.filter(Boolean).length > 0 && (() => {
                  const sItems = homepageSections.spotlight.items.filter(Boolean);
                  const layoutStyle = homepageSections.spotlight.layoutStyle || 'carousel';
                  const activeIdx = Math.min(spotlightSlide, sItems.length - 1);
                  const currentItem = sItems[activeIdx] || sItems[0];

                  return (
                    <div className="mt-6 mx-3 p-4 bg-gradient-to-br from-slate-950 via-[#062419] to-amber-950 text-white rounded-3xl border border-amber-500/40 shadow-xl space-y-4 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
                      <div className="text-center relative z-10">
                        <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-500/20 border border-amber-400/40 text-amber-300 text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-xs">
                          <Sparkles className="w-3 h-3 text-amber-300 animate-pulse" />
                          <span>FEATURED SPOTLIGHT</span>
                        </div>
                        <h3 className="font-black text-base text-white mt-1.5 tracking-tight">
                          {homepageSections?.spotlight?.title || '🌟 ATAL Spotlight'}
                        </h3>
                        {homepageSections?.spotlight?.subtitle && (
                          <p className="text-[11px] text-slate-300 mt-0.5 line-clamp-1">{homepageSections?.spotlight?.subtitle}</p>
                        )}
                      </div>

                      {/* Layout Type: Carousel */}
                      {layoutStyle === 'carousel' && (
                        <div 
                          className="relative rounded-2xl overflow-hidden bg-slate-950/90 border border-amber-500/25 shadow-lg group select-none"
                          onTouchStart={(e) => setSpotlightTouchStart(e.targetTouches[0].clientX)}
                          onTouchMove={(e) => setSpotlightTouchEnd(e.targetTouches[0].clientX)}
                          onTouchEnd={() => {
                            if (spotlightTouchStart === null || spotlightTouchEnd === null) return;
                            const diff = spotlightTouchStart - spotlightTouchEnd;
                            if (diff > 45) {
                              setSpotlightSlide(prev => (prev + 1) % sItems.length);
                            } else if (diff < -45) {
                              setSpotlightSlide(prev => (prev - 1 + sItems.length) % sItems.length);
                            }
                            setSpotlightTouchStart(null);
                            setSpotlightTouchEnd(null);
                          }}
                        >
                          <div className="relative aspect-[16/10] w-full overflow-hidden">
                            <img 
                              src={currentItem?.image || DEFAULT_PRODUCT_IMAGE} 
                              alt={currentItem?.title || 'Spotlight'} 
                              className="w-full h-full object-cover transition-transform duration-700 ease-out" 
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-transparent flex flex-col justify-end p-4">
                              {currentItem?.badge && (
                                <span className="bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase w-max mb-1.5 shadow-md border border-amber-200">
                                  {currentItem.badge}
                                </span>
                              )}
                              {currentItem?.subtitle && (
                                <p className="text-[10px] text-amber-300 font-extrabold tracking-wider uppercase">{currentItem.subtitle}</p>
                              )}
                              <h4 className="font-black text-sm text-white leading-tight mt-0.5">{currentItem?.title || 'Special Feature'}</h4>
                              {currentItem?.description && (
                                <p className="text-[11px] text-slate-300 line-clamp-2 mt-1 leading-snug">{currentItem.description}</p>
                              )}
                              
                              <div className="mt-3 pt-2.5 border-t border-white/15 flex items-center justify-between gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const link = currentItem?.buttonLink || '/shop';
                                    if (link.startsWith('http')) window.open(link, '_blank');
                                    else if (link.startsWith('/product/')) loadProductBySlug(link.replace('/product/', ''));
                                    else navigate(link);
                                  }}
                                  className="flex-1 min-h-[44px] bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md transition cursor-pointer"
                                >
                                  <span>{currentItem.buttonText || 'EXPLORE NOW'}</span>
                                  <ChevronRight className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Navigation Arrows & Indicators if > 1 items */}
                          {sItems.length > 1 && (
                            <>
                              <button
                                type="button"
                                onClick={() => setSpotlightSlide(prev => (prev - 1 + sItems.length) % sItems.length)}
                                className="absolute left-2 top-1/3 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center z-20 border border-white/20 active:scale-95"
                                aria-label="Previous Spotlight"
                              >
                                <ChevronLeft className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setSpotlightSlide(prev => (prev + 1) % sItems.length)}
                                className="absolute right-2 top-1/3 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 backdrop-blur-md text-white flex items-center justify-center z-20 border border-white/20 active:scale-95"
                                aria-label="Next Spotlight"
                              >
                                <ChevronRight className="w-4 h-4" />
                              </button>
                              <div className="absolute bottom-2 right-4 flex items-center gap-1.5 z-20">
                                {sItems.map((_item: any, dotIdx: number) => (
                                  <button
                                    key={dotIdx}
                                    type="button"
                                    onClick={() => setSpotlightSlide(dotIdx)}
                                    className={`h-1.5 rounded-full transition-all ${dotIdx === activeIdx ? 'w-5 bg-amber-400' : 'w-1.5 bg-white/40'}`}
                                  />
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                      )}

                      {/* Layout Type: Grid or Banner */}
                      {layoutStyle !== 'carousel' && (
                        <div className="space-y-4 relative z-10">
                          {sItems.map((item: any) => (
                            <div key={item.id} className="relative rounded-2xl overflow-hidden bg-slate-950/90 border border-amber-500/25 shadow-lg group flex flex-col justify-between">
                              <div className="relative aspect-[16/10] w-full overflow-hidden">
                                <img src={item.image || DEFAULT_PRODUCT_IMAGE} alt={item.title || 'Spotlight'} className="w-full h-full object-cover group-hover:scale-105 transition duration-700" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent flex flex-col justify-end p-4">
                                  {item.badge && (
                                    <span className="bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase w-max mb-1.5 shadow-md border border-amber-200">
                                      {item.badge}
                                    </span>
                                  )}
                                  {item.subtitle && (
                                    <p className="text-[10px] text-amber-300 font-extrabold tracking-wider uppercase">{item.subtitle}</p>
                                  )}
                                  <h4 className="font-black text-sm text-white leading-tight mt-0.5">{item.title || 'Featured Spotlight'}</h4>
                                  {item.description && (
                                    <p className="text-[11px] text-slate-300 line-clamp-2 mt-1 leading-snug">{item.description}</p>
                                  )}
                                  
                                  <div className="mt-3 pt-2.5 border-t border-white/15 flex items-center justify-between">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const link = item.buttonLink || '/shop';
                                        if (link.startsWith('http')) window.open(link, '_blank');
                                        else if (link.startsWith('/product/')) loadProductBySlug(link.replace('/product/', ''));
                                        else navigate(link);
                                      }}
                                      className="w-full min-h-[44px] bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md transition cursor-pointer"
                                    >
                                      <span>{item.buttonText || 'EXPLORE NOW'}</span>
                                      <ChevronRight className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* All Products Catalog (Mobile View: 2 products in a row, 8 columns grid) */}
                <div className="mt-6 px-3">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                      All Products Catalog
                    </h3>
                    <span 
                      onClick={() => handleOpenShop()}
                      className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 cursor-pointer"
                    >
                      View All →
                    </span>
                  </div>

                  <div className="grid grid-cols-8 gap-2.5">
                    {products.map((prod) => (
                      <div 
                        key={prod.id}
                        onClick={() => handleOpenProduct(prod)}
                        className="col-span-4 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition cursor-pointer flex flex-col justify-between group"
                      >
                        <div className="relative aspect-square w-full bg-[#062419] overflow-hidden flex items-center justify-center">
                          <img 
                            src={getPrimaryProductImage(prod)} 
                            alt={prod.name}
                            className={`w-full h-full ${getPrimaryProductImage(prod).includes('WhatsApp') ? 'object-contain p-2' : 'object-cover'} group-hover:scale-105 transition duration-300`} 
                          />
                          <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
                            {prod.discountPercentage && (
                              <span className="bg-red-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md shadow-xs">
                                {prod.discountPercentage}% OFF
                              </span>
                            )}
                          </div>
                          <button 
                            onClick={(e) => { e.stopPropagation(); toggleWishlist(prod.id); }}
                            className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white shadow-md flex items-center justify-center transition hover:scale-110"
                          >
                            <Heart className={`w-3 h-3 ${wishlist.includes(prod.id) ? 'fill-red-500 text-red-500' : 'text-slate-400'}`} />
                          </button>
                        </div>

                        <div className="p-2.5 flex-1 flex flex-col justify-between">
                          <div>
                            <p className="text-[9px] text-[#a87428] uppercase tracking-wider font-bold truncate">{prod.brand}</p>
                            <h4 className="font-bold text-xs text-slate-800 line-clamp-1 leading-snug">{prod.name}</h4>
                          </div>
                          <div className="mt-2 flex items-center justify-between pt-1 border-t border-slate-100">
                            <div>
                              <span className="text-xs font-black text-slate-900">Rs {prod.price.toLocaleString()}</span>
                            </div>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                addToCart(prod, prod.variants?.[0]);
                              }}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-2 py-1 text-[9.5px] font-bold shadow-xs transition"
                            >
                              + Cart
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ======================================================== */}
                {/* 1. NEW LAUNCH — AVAILABLE NOW (Mobile)                   */}
                {/* ======================================================== */}
                {homepageSections?.newLaunch?.availableNow?.enabled !== false && (() => {
                  const configuredIds = homepageSections?.newLaunch?.availableNow?.productIds || homepageSections?.newLaunch?.productIds || [];
                  let displayProds = activeProducts.filter(p => p && (p.stock ?? p.stockQuantity ?? 1) > 0);
                  if (Array.isArray(configuredIds) && configuredIds.length > 0) {
                    const mapped = configuredIds.map((id: string) => displayProds.find(p => p.id === id)).filter(Boolean) as Product[];
                    if (mapped.length > 0) displayProds = mapped;
                  } else {
                    displayProds = displayProds.filter(p => p.isNewArrival || p.id.startsWith('prod-festive')).slice(0, 8);
                  }

                  if (displayProds.length === 0) return null;

                  return (
                    <div className="mt-7 mx-3 p-4 bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-900 text-white rounded-3xl border border-emerald-500/30 shadow-lg">
                      <div className="flex items-center justify-between mb-3.5 pb-2 border-b border-white/10">
                        <div>
                          <div className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-900/60 px-2 py-0.5 rounded-full mb-1">
                            <Zap className="w-2.5 h-2.5" />
                            <span>READY TO SHIP</span>
                          </div>
                          <h3 className="font-black text-sm text-white flex items-center gap-1.5 leading-tight">
                            <span>{homepageSections?.newLaunch?.availableNow?.title || homepageSections?.newLaunch?.title || 'New Launch'}</span>
                          </h3>
                          <p className="text-[10.5px] text-slate-300 line-clamp-1 mt-0.5">
                            {homepageSections?.newLaunch?.availableNow?.subtitle || homepageSections?.newLaunch?.subtitle || "Discover What's New"}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleOpenShop()}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white text-[10.5px] font-bold px-3 py-1.5 rounded-xl shadow-xs transition shrink-0 cursor-pointer"
                        >
                          View All →
                        </button>
                      </div>

                      {/* Horizontal Scrolling Product Carousel */}
                      <div className="flex flex-nowrap overflow-x-auto no-scrollbar gap-3 pb-2 pt-1 scroll-smooth">
                        {displayProds.map((prod) => (
                          <div
                            key={prod.id}
                            onClick={() => handleOpenProduct(prod)}
                            className="bg-white/10 hover:bg-white/15 border border-white/15 rounded-2xl p-2.5 cursor-pointer shrink-0 w-[160px] flex flex-col justify-between group transition backdrop-blur-sm"
                          >
                            <div>
                              <div className="relative aspect-square rounded-xl overflow-hidden mb-2 bg-black/40 flex items-center justify-center">
                                <img 
                                  src={getPrimaryProductImage(prod)} 
                                  alt={prod.name} 
                                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300" 
                                />
                                <div className="absolute top-1.5 left-1.5 flex flex-col gap-1 z-10">
                                  <span className="bg-emerald-500 text-slate-950 text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider shadow-xs">
                                    NEW
                                  </span>
                                  {prod.discountPercentage && (
                                    <span className="bg-red-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded-md shadow-xs">
                                      {prod.discountPercentage}% OFF
                                    </span>
                                  )}
                                </div>
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); toggleWishlist(prod.id); }}
                                  className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/50 backdrop-blur text-white flex items-center justify-center z-10"
                                >
                                  <Heart className={`w-3 h-3 ${wishlist.includes(prod.id) ? 'fill-red-500 text-red-500' : 'text-white/80'}`} />
                                </button>
                              </div>
                              <p className="text-[9px] text-[#f5d77f] font-bold uppercase tracking-wider truncate">{prod.brand}</p>
                              <h4 className="font-bold text-[11px] text-white line-clamp-1 leading-snug">{prod.name}</h4>
                              <p className="text-[9px] text-emerald-300/80 mt-0.5">
                                {(prod.stock ?? prod.stockQuantity ?? 10) > 5 ? '● In Stock' : `● Only ${prod.stock ?? prod.stockQuantity ?? 1} left`}
                              </p>
                            </div>
                            <div className="mt-2 flex items-center justify-between pt-1.5 border-t border-white/10">
                              <div>
                                <span className="font-black text-xs text-white">Rs {prod.price.toLocaleString()}</span>
                                {prod.originalPrice && (
                                  <span className="text-[9px] text-slate-400 line-through block -mt-0.5">Rs {prod.originalPrice.toLocaleString()}</span>
                                )}
                              </div>
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); addToCart(prod, prod.variants?.[0]); }}
                                className="min-h-[32px] bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-2.5 py-1 rounded-lg text-[9.5px] transition shadow-xs cursor-pointer"
                              >
                                + Cart
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {/* ======================================================== */}
                {/* 2. LAUNCH SOON — COMING SOON (Mobile)                    */}
                {/* ======================================================== */}
                {homepageSections?.newLaunch?.launchSoon?.enabled !== false && Array.isArray(homepageSections?.newLaunch?.launchSoon?.items) && homepageSections.newLaunch.launchSoon.items.filter(Boolean).length > 0 && (() => {
                  const lsItems = homepageSections.newLaunch.launchSoon.items.filter(Boolean);
                  if (lsItems.length === 0) return null;

                  return (
                    <div className="mt-6 mx-3 p-4 bg-gradient-to-br from-slate-950 via-[#1c1304] to-slate-900 text-white rounded-3xl border border-amber-500/35 shadow-xl space-y-4">
                      <div className="flex items-center justify-between pb-2 border-b border-white/10">
                        <div>
                          <div className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-amber-400 bg-amber-950/70 border border-amber-500/30 px-2 py-0.5 rounded-full mb-1">
                            <Clock className="w-2.5 h-2.5 text-amber-400 animate-spin" />
                            <span>UPCOMING EXCLUSIVES</span>
                          </div>
                          <h3 className="font-black text-sm text-white flex items-center gap-1.5 leading-tight">
                            <span>{homepageSections?.newLaunch?.launchSoon?.title || 'Launch Soon'}</span>
                          </h3>
                          <p className="text-[10.5px] text-amber-200/80 line-clamp-1 mt-0.5">
                            {homepageSections?.newLaunch?.launchSoon?.subtitle || 'Something Exciting Is Coming'}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-3.5">
                        {lsItems.map((item: any) => (
                          <div 
                            key={item.id}
                            className="bg-white/5 border border-amber-500/20 rounded-2xl p-3.5 backdrop-blur-sm flex flex-col justify-between gap-3 shadow-md"
                          >
                            <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden bg-black/60">
                              <img src={item.image || DEFAULT_PRODUCT_IMAGE} alt={item.name || 'Upcoming product'} className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent flex flex-col justify-between p-3">
                                <div className="flex items-center justify-between">
                                  <span className="bg-amber-500 text-slate-950 text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                                    {item.badge || 'COMING SOON'}
                                  </span>
                                  {item.showCountdown !== false && item.expectedLaunchDate && (
                                    <CountdownTimer targetDate={item.expectedLaunchDate} />
                                  )}
                                </div>
                                <div>
                                  {item.expectedLaunchDate && (
                                    <p className="text-[10px] text-amber-300 font-bold flex items-center gap-1">
                                      <Calendar className="w-3 h-3" />
                                      <span>Launch: {new Date(item.expectedLaunchDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div>
                              <h4 className="font-black text-xs text-white leading-snug">{item.name || 'Exciting Product Drop'}</h4>
                              {item.description && (
                                <p className="text-[11px] text-slate-300 line-clamp-2 mt-1 leading-relaxed">{item.description}</p>
                              )}
                            </div>

                            {/* STRICTLY NO ADD TO CART OR BUY NOW */}
                            <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                              <button
                                type="button"
                                onClick={() => {
                                  setNotifyTargetItem(item);
                                  setIsNotifyModalOpen(true);
                                }}
                                className="flex-1 min-h-[44px] bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-md transition cursor-pointer"
                              >
                                <Bell className="w-3.5 h-3.5 text-slate-950" />
                                <span>Notify Me When Launched</span>
                              </button>
                              {item.previewSlug && (
                                <button
                                  type="button"
                                  onClick={() => loadProductBySlug(item.previewSlug)}
                                  className="min-h-[44px] px-3 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition flex items-center gap-1"
                                >
                                  Preview
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* ======================================================== */}
              {/* DESKTOP HOME SCREEN (Original Full Desktop Experience)   */}
              {/* ======================================================== */}
              <div className="pb-12 hidden md:block">
                {/* Hero Banner Carousel (Desktop) */}
                <div className="relative mx-4 mt-4 rounded-2xl overflow-hidden shadow-xl bg-slate-950 border border-slate-200/50 select-none group">
                  <div className="relative h-80 lg:h-96 w-full overflow-hidden">
                    {safeCarouselSlides.map((slide, idx) => {
                      if (!slide) return null;
                      return (
                        <div 
                          key={slide.id || idx}
                          className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                            idx === currentHeroSlide ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                          }`}
                        >
                          <img 
                            src={slide?.image || DEFAULT_PRODUCT_IMAGE} 
                            alt={slide?.title || 'Slide'} 
                            className="w-full h-full object-cover object-center transform scale-100 group-hover:scale-105 transition-transform duration-700" 
                          />
                          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/55 to-black/25 flex items-center p-8 lg:p-14">
                            <div className="max-w-xl text-white">
                              <div className="flex items-center gap-2 mb-3">
                                <span className="bg-emerald-500 text-slate-950 font-black text-xs px-3 py-1 rounded-full uppercase tracking-wider">
                                  {slide?.badge || 'SPECIAL'}
                                </span>
                                <span className="text-amber-300 font-bold text-xs">
                                  {slide?.discount || ''}
                                </span>
                              </div>
                              <h2 className="text-2xl lg:text-4xl font-black tracking-tight mb-3 text-white leading-tight">
                                {slide?.title || 'Exclusive Collection'}
                              </h2>
                              <p className="text-slate-200 text-sm mb-6 leading-relaxed">
                                {slide?.subtitle || ''}. Genuine high-quality items delivered doorstep nationwide across Pakistan with JazzCash, Easypaisa, or Cash on Delivery.
                              </p>
                            <div className="flex items-center gap-3">
                              <button 
                                onClick={() => handleOpenCategory(slide?.categoryId)}
                                className="bg-[#f5d77f] hover:bg-amber-400 text-slate-950 font-black px-6 py-3 rounded-xl text-sm shadow-lg transition flex items-center gap-2"
                              >
                                <span>{slide?.buttonText || 'SHOP NOW'}</span>
                                <ChevronRight className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleOpenShop()}
                                className="bg-white/15 hover:bg-white/25 text-white backdrop-blur-sm font-semibold px-5 py-3 rounded-xl text-sm transition"
                              >
                                Browse All Products
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}

                    {/* Prev & Next Arrows */}
                    <button 
                      onClick={() => prevHeroSlide()}
                      className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 hover:bg-black/75 text-white flex items-center justify-center backdrop-blur-md transition shadow-md"
                      aria-label="Previous Slide"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button 
                      onClick={() => nextHeroSlide()}
                      className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 hover:bg-black/75 text-white flex items-center justify-center backdrop-blur-md transition shadow-md"
                      aria-label="Next Slide"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>

                    {/* Dots */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
                      {carouselSlides.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentHeroSlide(idx)}
                          className={`transition-all duration-300 rounded-full ${
                            idx === currentHeroSlide 
                              ? 'w-8 h-2.5 bg-[#f5d77f] shadow-md' 
                              : 'w-2.5 h-2.5 bg-white/50 hover:bg-white/80'
                          }`}
                          aria-label={`Slide ${idx + 1}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Categories Row (Single Row) */}
                <div className="max-w-7xl mx-auto px-4 mt-8">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-lg text-slate-900">Shop by Category</h3>
                      <p className="text-xs text-slate-500">Explore our curated collections in one convenient row</p>
                    </div>
                    <span 
                      className="text-xs text-emerald-600 hover:text-emerald-700 cursor-pointer font-bold" 
                      onClick={() => handleOpenShop()}
                    >
                      View All Categories →
                    </span>
                  </div>
                  <div className="flex items-stretch gap-4 overflow-x-auto no-scrollbar py-2 scroll-smooth">
                    {categories.map(cat => (
                      <div 
                        key={cat.id}
                        onClick={() => handleOpenCategory(cat.id, cat.slug)}
                        className="bg-white border border-slate-200 hover:border-emerald-500 rounded-2xl p-4 text-center cursor-pointer hover:shadow-lg transition group shrink-0 w-44 flex flex-col items-center justify-center"
                      >
                        <div className="w-20 h-20 mx-auto rounded-full overflow-hidden mb-3 shadow-xs border-2 border-emerald-50 group-hover:border-emerald-300 transition">
                          <img src={cat.image} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition duration-300" />
                        </div>
                        <h4 className="font-bold text-sm text-slate-800 group-hover:text-emerald-700 transition line-clamp-1">{cat.name}</h4>
                        <p className="text-[11px] text-slate-400 mt-0.5">{cat.subcategories?.length || 0} Subcategories</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Featured Festive Deals Section (Single Row) */}
                <div className="max-w-7xl mx-auto px-4 mt-10 bg-red-100 p-6 rounded-3xl border border-red-200 shadow-sm">
                  <div className="flex items-center justify-between mb-4 bg-red-200 p-3.5 rounded-2xl border border-red-300 shadow-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="bg-red-600 text-white text-xs font-black px-3 py-1 rounded-lg animate-pulse tracking-wide shadow-xs">
                        FEATURED FESTIVE DEALS ⚡
                      </div>
                      <span className="text-xs font-bold text-slate-800">All festive offers & new arrivals in one row • Nationwide Delivery</span>
                    </div>
                    <span className="text-xs font-bold text-red-700 hover:text-red-900 cursor-pointer" onClick={() => handleOpenShop()}>
                      See All Deals →
                    </span>
                  </div>

                  <div className="flex items-stretch gap-4 overflow-x-auto no-scrollbar py-2 scroll-smooth">
                    {safeProducts.filter(p => p && (p.isFlashDeal || p.isFeatured || p.isNewArrival)).map(prod => (
                      <div 
                        key={prod.id}
                        className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col justify-between hover:shadow-xl transition group relative cursor-pointer shrink-0 w-60"
                        onClick={() => handleOpenProduct(prod)}
                      >
                        <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
                          {prod.discountPercentage && (
                            <span className="bg-red-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-xs">
                              {prod.discountPercentage}% OFF
                            </span>
                          )}
                          {(prod.isNewArrival || prod.id.startsWith('prod-festive')) && (
                            <span className="bg-emerald-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-xs uppercase tracking-wider">
                              NEW ARRIVAL
                            </span>
                          )}
                        </div>
                        <button 
                          onClick={(e) => { e.stopPropagation(); toggleWishlist(prod.id); }}
                          className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur rounded-full text-slate-600 hover:text-red-500 z-10 transition shadow-xs"
                        >
                          <Heart className={`w-4 h-4 ${wishlist.includes(prod.id) ? 'fill-red-500 text-red-500' : ''}`} />
                        </button>

                        <div className="w-full h-48 rounded-xl overflow-hidden mb-3 bg-[#062419] flex items-center justify-center">
                          <img 
                            src={getPrimaryProductImage(prod)} 
                            alt={prod.name} 
                            className={`w-full h-full ${getPrimaryProductImage(prod).includes('WhatsApp') ? 'object-contain p-2' : 'object-cover'} group-hover:scale-105 transition duration-300`} 
                          />
                        </div>

                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <p className="text-[11px] text-emerald-600 font-semibold mb-1 uppercase tracking-wider">{prod.brand}</p>
                            <h4 className="font-bold text-sm text-slate-900 line-clamp-2 mb-2 leading-snug">{prod.name}</h4>
                            <div className="flex items-center gap-1 mb-2">
                              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                              <span className="text-xs font-bold text-slate-700">{prod.rating}</span>
                              <span className="text-xs text-slate-400">({prod.reviewCount})</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
                            <div>
                              {prod.originalPrice && (
                                <p className="text-xs text-slate-400 line-through">PKR {prod.originalPrice.toLocaleString()}</p>
                              )}
                              <p className="text-sm font-black text-emerald-700">PKR {prod.price.toLocaleString()}</p>
                            </div>
                            <button 
                              onClick={(e) => { e.stopPropagation(); addToCart(prod); }}
                              className="bg-slate-900 hover:bg-emerald-600 text-white p-2 rounded-xl transition"
                              title="Add to Cart"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* SPOTLIGHT SECTION (Desktop) */}
                {homepageSections?.spotlight?.enabled !== false && Array.isArray(homepageSections?.spotlight?.items) && homepageSections.spotlight.items.filter(Boolean).length > 0 && (() => {
                  const sItems = homepageSections.spotlight.items.filter(Boolean);
                  const layoutStyle = homepageSections.spotlight.layoutStyle || 'carousel';
                  const activeIdx = Math.min(spotlightSlide, sItems.length - 1);
                  const currentItem = sItems[activeIdx] || sItems[0];

                  return (
                    <div className="max-w-7xl mx-auto px-4 mt-10 p-8 bg-gradient-to-br from-slate-950 via-[#062419] to-amber-950 text-white rounded-3xl border border-amber-500/40 shadow-2xl relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
                      
                      <div className="text-center max-w-2xl mx-auto mb-8 relative z-10">
                        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-widest mb-3 shadow-sm">
                          <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
                          <span>FEATURED SPOTLIGHT</span>
                        </div>
                        <h3 className="font-black text-3xl text-white tracking-tight drop-shadow-md">
                          {homepageSections?.spotlight?.title || '🌟 ATAL Spotlight & Featured Collections'}
                        </h3>
                        {homepageSections?.spotlight?.subtitle && (
                          <p className="text-sm text-slate-300 mt-2 leading-relaxed">{homepageSections?.spotlight?.subtitle}</p>
                        )}
                      </div>

                      {/* Carousel Layout (Desktop) */}
                      {layoutStyle === 'carousel' && (
                        <div className="relative rounded-3xl overflow-hidden bg-slate-950/90 border border-amber-500/30 shadow-2xl group">
                          <div className="relative h-96 w-full overflow-hidden">
                            <img 
                              src={currentItem?.image || DEFAULT_PRODUCT_IMAGE} 
                              alt={currentItem?.title || 'Spotlight'} 
                              className="w-full h-full object-cover group-hover:scale-105 transition duration-700 ease-out" 
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/60 to-transparent flex items-center p-8 lg:p-14">
                              <div className="max-w-xl text-white">
                                {currentItem?.badge && (
                                  <span className="inline-block bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 text-xs font-black px-3.5 py-1 rounded-full uppercase mb-3 shadow-lg border border-amber-200">
                                    {currentItem.badge}
                                  </span>
                                )}
                                {currentItem?.subtitle && (
                                  <p className="text-xs text-amber-300 font-extrabold tracking-widest uppercase mb-1">{currentItem.subtitle}</p>
                                )}
                                <h4 className="font-black text-3xl lg:text-4xl text-white leading-tight drop-shadow-md mb-3">
                                  {currentItem?.title || 'Special Feature'}
                                </h4>
                                {currentItem?.description && (
                                  <p className="text-slate-200 text-sm leading-relaxed mb-6 line-clamp-3">{currentItem.description}</p>
                                )}

                                <div className="flex items-center gap-4">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const link = currentItem?.buttonLink || '/shop';
                                      if (link.startsWith('http')) window.open(link, '_blank');
                                      else if (link.startsWith('/product/')) loadProductBySlug(link.replace('/product/', ''));
                                      else navigate(link);
                                    }}
                                    className="bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black px-7 py-3.5 rounded-2xl text-xs uppercase tracking-wider transition-all duration-300 shadow-xl flex items-center gap-2 cursor-pointer transform hover:scale-105"
                                  >
                                    <span>{currentItem?.buttonText || 'EXPLORE NOW'}</span>
                                    <ChevronRight className="w-4 h-4" />
                                  </button>
                                  {currentItem.price && (
                                    <div className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-xl text-left">
                                      <span className="text-[10px] text-slate-300 uppercase block font-bold">Featured Price</span>
                                      <span className="font-black text-amber-300 text-base">Rs {currentItem.price.toLocaleString()}</span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Desktop Slide Controls */}
                          {sItems.length > 1 && (
                            <>
                              <button
                                type="button"
                                onClick={() => setSpotlightSlide(prev => (prev - 1 + sItems.length) % sItems.length)}
                                className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/70 hover:bg-black/90 backdrop-blur-md text-white flex items-center justify-center z-20 border border-white/20 transition cursor-pointer"
                                aria-label="Previous Slide"
                              >
                                <ChevronLeft className="w-5 h-5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setSpotlightSlide(prev => (prev + 1) % sItems.length)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/70 hover:bg-black/90 backdrop-blur-md text-white flex items-center justify-center z-20 border border-white/20 transition cursor-pointer"
                                aria-label="Next Slide"
                              >
                                <ChevronRight className="w-5 h-5" />
                              </button>
                              <div className="absolute bottom-5 right-8 flex items-center gap-2 z-20">
                                {sItems.map((_item: any, dotIdx: number) => (
                                  <button
                                    key={dotIdx}
                                    type="button"
                                    onClick={() => setSpotlightSlide(dotIdx)}
                                    className={`h-2 rounded-full transition-all ${dotIdx === activeIdx ? 'w-8 bg-amber-400' : 'w-2 bg-white/40 hover:bg-white/70'}`}
                                  />
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                      )}

                      {/* Grid or Banner Layout (Desktop) */}
                      {layoutStyle !== 'carousel' && (
                        <div className={`grid ${layoutStyle === 'banner' ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'} gap-8 relative z-10`}>
                          {sItems.map((item: any) => (
                            <div key={item.id} className="relative rounded-3xl overflow-hidden bg-slate-950/90 border border-amber-500/30 shadow-2xl group flex flex-col justify-between hover:border-amber-400/60 transition duration-500">
                              <div className="relative h-80 w-full overflow-hidden">
                                <img src={item.image || DEFAULT_PRODUCT_IMAGE} alt={item.title || 'Spotlight'} className="w-full h-full object-cover group-hover:scale-105 transition duration-700 ease-out" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-transparent flex flex-col justify-end p-8">
                                  {item.badge && (
                                    <span className="bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 text-[11px] font-black px-3.5 py-1 rounded-full uppercase w-max mb-3 shadow-lg border border-amber-200">
                                      {item.badge}
                                    </span>
                                  )}
                                  {item.subtitle && (
                                    <p className="text-xs text-amber-300 font-extrabold tracking-wider uppercase">{item.subtitle}</p>
                                  )}
                                  <h4 className="font-black text-2xl text-white leading-tight mt-1 drop-shadow-sm">{item.title || 'Featured Spotlight'}</h4>
                                  <p className="text-slate-300 text-sm line-clamp-2 mt-2 leading-relaxed">{item.description}</p>
                                  
                                  <div className="mt-5 pt-4 border-t border-white/20 flex items-center justify-between">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const link = item.buttonLink || '/shop';
                                        if (link.startsWith('http')) window.open(link, '_blank');
                                        else if (link.startsWith('/product/')) loadProductBySlug(link.replace('/product/', ''));
                                        else navigate(link);
                                      }}
                                      className="bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 text-slate-950 font-black px-6 py-3 rounded-2xl text-xs uppercase tracking-wider transition-all duration-300 shadow-xl flex items-center gap-2 cursor-pointer transform group-hover:translate-x-1"
                                    >
                                      <span>{item.buttonText || 'EXPLORE NOW'}</span>
                                      <ChevronRight className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* All Products Section (Responsive Grid: 2-col mobile, 3-col tablet, 4-col PC) */}
                <div className="max-w-7xl mx-auto px-4 mt-12">
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200">
                    <div>
                      <h3 className="font-black text-lg text-slate-900">All Products Catalog</h3>
                      <p className="text-xs text-slate-500">Explore all available items across fashion, cosmetics, electronics & more</p>
                    </div>
                    <span 
                      className="text-xs font-bold text-emerald-600 hover:text-emerald-700 cursor-pointer"
                      onClick={() => handleOpenShop()}
                    >
                      View All in Catalog →
                    </span>
                  </div>

                  <div className="grid grid-cols-8 sm:grid-cols-6 lg:grid-cols-4 gap-4">
                    {products.map(prod => (
                      <div 
                        key={prod.id}
                        className="col-span-4 sm:col-span-2 lg:col-span-1 bg-white border border-slate-200 rounded-2xl p-3.5 flex flex-col justify-between hover:shadow-xl transition group relative cursor-pointer"
                        onClick={() => handleOpenProduct(prod)}
                      >
                        {prod.discountPercentage && (
                          <span className="absolute top-2.5 left-2.5 bg-red-600 text-white text-[9.5px] font-extrabold px-2 py-0.5 rounded-full z-10 shadow-xs">
                            {prod.discountPercentage}% OFF
                          </span>
                        )}
                        <button 
                          onClick={(e) => { e.stopPropagation(); toggleWishlist(prod.id); }}
                          className="absolute top-2.5 right-2.5 p-1.5 bg-white/80 backdrop-blur rounded-full text-slate-600 hover:text-red-500 z-10 transition shadow-xs"
                        >
                          <Heart className={`w-3.5 h-3.5 ${wishlist.includes(prod.id) ? 'fill-red-500 text-red-500' : ''}`} />
                        </button>

                        <div className="w-full h-44 rounded-xl overflow-hidden mb-3 bg-[#062419] flex items-center justify-center">
                          <img 
                            src={getPrimaryProductImage(prod)} 
                            alt={prod.name} 
                            className={`w-full h-full ${getPrimaryProductImage(prod).includes('WhatsApp') ? 'object-contain p-2' : 'object-cover'} group-hover:scale-105 transition duration-300`} 
                          />
                        </div>

                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <p className="text-[10px] text-emerald-600 font-semibold mb-1 uppercase tracking-wider">{prod.brand}</p>
                            <h4 className="font-bold text-xs text-slate-900 line-clamp-2 mb-1.5 leading-snug">{prod.name}</h4>
                            <div className="flex items-center gap-1 mb-2">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                              <span className="text-[11px] font-bold text-slate-700">{prod.rating}</span>
                              <span className="text-[10px] text-slate-400">({prod.reviewCount})</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                            <div>
                              {prod.originalPrice && (
                                <p className="text-[10px] text-slate-400 line-through">PKR {prod.originalPrice.toLocaleString()}</p>
                              )}
                              <p className="text-xs font-black text-emerald-700">PKR {prod.price.toLocaleString()}</p>
                            </div>
                            <button 
                              onClick={(e) => { e.stopPropagation(); addToCart(prod); }}
                              className="bg-slate-900 hover:bg-emerald-600 text-white p-1.5 rounded-xl transition shadow-xs"
                              title="Add to Cart"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ======================================================== */}
                {/* 1. NEW LAUNCH — AVAILABLE NOW (Desktop)                  */}
                {/* ======================================================== */}
                {homepageSections?.newLaunch?.availableNow?.enabled !== false && (() => {
                  const configuredIds = homepageSections?.newLaunch?.availableNow?.productIds || homepageSections?.newLaunch?.productIds || [];
                  let displayProds = activeProducts.filter(p => p && (p.stock ?? p.stockQuantity ?? 1) > 0);
                  if (Array.isArray(configuredIds) && configuredIds.length > 0) {
                    const mapped = configuredIds.map((id: string) => displayProds.find(p => p.id === id)).filter(Boolean) as Product[];
                    if (mapped.length > 0) displayProds = mapped;
                  } else {
                    displayProds = displayProds.filter(p => p.isNewArrival || p.id.startsWith('prod-festive')).slice(0, 8);
                  }

                  if (displayProds.length === 0) return null;

                  return (
                    <div className="max-w-7xl mx-auto px-4 mt-12 p-8 bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-900 text-white rounded-3xl border border-emerald-500/30 shadow-xl">
                      <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
                        <div>
                          <div className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-900/60 px-3 py-1 rounded-full mb-1.5">
                            <Zap className="w-3 h-3" />
                            <span>READY TO SHIP IN 24 HOURS</span>
                          </div>
                          <h3 className="font-black text-2xl text-white flex items-center gap-2">
                            <span>{homepageSections?.newLaunch?.availableNow?.title || homepageSections?.newLaunch?.title || 'New Launch'}</span>
                          </h3>
                          <p className="text-xs text-slate-300 mt-1">
                            {homepageSections?.newLaunch?.availableNow?.subtitle || homepageSections?.newLaunch?.subtitle || "Discover What's New"}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleOpenShop()}
                          className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-5 py-2.5 rounded-xl text-xs transition flex items-center gap-1.5 shadow-md cursor-pointer"
                        >
                          <span>Explore All New Arrivals</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                        {displayProds.map((prod) => (
                          <div
                            key={prod.id}
                            onClick={() => handleOpenProduct(prod)}
                            className="bg-white/10 hover:bg-white/15 border border-white/15 rounded-2xl p-3.5 backdrop-blur-sm cursor-pointer transition flex flex-col justify-between group hover:border-emerald-400/50 shadow-sm"
                          >
                            <div>
                              <div className="relative aspect-square rounded-xl overflow-hidden mb-3 bg-black/40 flex items-center justify-center">
                                <img 
                                  src={getPrimaryProductImage(prod)} 
                                  alt={prod.name} 
                                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300" 
                                />
                                <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
                                  <span className="bg-emerald-500 text-slate-950 text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider shadow-xs">
                                    NEW
                                  </span>
                                  {prod.discountPercentage && (
                                    <span className="bg-red-600 text-white text-[9px] font-black px-2 py-0.5 rounded-md shadow-xs">
                                      {prod.discountPercentage}% OFF
                                    </span>
                                  )}
                                </div>
                                <button
                                  type="button"
                                  onClick={(e) => { e.stopPropagation(); toggleWishlist(prod.id); }}
                                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 hover:bg-black/80 backdrop-blur text-white flex items-center justify-center z-10 transition"
                                >
                                  <Heart className={`w-3.5 h-3.5 ${wishlist.includes(prod.id) ? 'fill-red-500 text-red-500' : 'text-white/80'}`} />
                                </button>
                              </div>
                              <p className="text-[10px] text-[#f5d77f] font-bold uppercase tracking-wider truncate">{prod.brand}</p>
                              <h4 className="font-bold text-xs text-white line-clamp-1 mt-0.5">{prod.name}</h4>
                              <p className="text-[10px] text-emerald-300/80 mt-1">
                                {(prod.stock ?? prod.stockQuantity ?? 10) > 5 ? '● In Stock' : `● Only ${prod.stock ?? prod.stockQuantity ?? 1} items left`}
                              </p>
                            </div>
                            <div className="mt-3 flex items-center justify-between pt-2.5 border-t border-white/10">
                              <div>
                                <span className="font-black text-sm text-white">Rs {prod.price.toLocaleString()}</span>
                                {prod.originalPrice && (
                                  <span className="text-[10px] text-slate-400 line-through block -mt-0.5">Rs {prod.originalPrice.toLocaleString()}</span>
                                )}
                              </div>
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); addToCart(prod, prod.variants?.[0]); }}
                                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black px-3 py-1.5 rounded-xl text-xs transition shadow-sm cursor-pointer"
                              >
                                + Cart
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {/* ======================================================== */}
                {/* 2. LAUNCH SOON — COMING SOON (Desktop)                   */}
                {/* ======================================================== */}
                {homepageSections?.newLaunch?.launchSoon?.enabled !== false && Array.isArray(homepageSections?.newLaunch?.launchSoon?.items) && homepageSections.newLaunch.launchSoon.items.filter(Boolean).length > 0 && (() => {
                  const lsItems = homepageSections.newLaunch.launchSoon.items.filter(Boolean);
                  if (lsItems.length === 0) return null;

                  return (
                    <div className="max-w-7xl mx-auto px-4 mt-12 p-8 bg-gradient-to-br from-slate-950 via-[#1c1304] to-slate-900 text-white rounded-3xl border border-amber-500/35 shadow-2xl">
                      <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
                        <div>
                          <div className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-amber-400 bg-amber-950/70 border border-amber-500/30 px-3.5 py-1 rounded-full mb-2">
                            <Clock className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                            <span>UPCOMING EXCLUSIVE DROPS</span>
                          </div>
                          <h3 className="font-black text-2xl text-white flex items-center gap-2">
                            <span>{homepageSections?.newLaunch?.launchSoon?.title || 'Launch Soon'}</span>
                          </h3>
                          <p className="text-xs text-amber-200/80 mt-1">
                            {homepageSections?.newLaunch?.launchSoon?.subtitle || 'Something Exciting Is Coming'}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {lsItems.map((item: any) => (
                          <div 
                            key={item.id}
                            className="bg-white/5 border border-amber-500/20 hover:border-amber-400/50 rounded-3xl p-5 backdrop-blur-sm flex flex-col justify-between gap-4 transition shadow-lg group"
                          >
                            <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden bg-black/60">
                              <img src={item.image || DEFAULT_PRODUCT_IMAGE} alt={item.name || 'Upcoming product'} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent flex flex-col justify-between p-4">
                                <div className="flex items-center justify-between">
                                  <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                                    {item.badge || 'COMING SOON'}
                                  </span>
                                  {item.showCountdown !== false && item.expectedLaunchDate && (
                                    <CountdownTimer targetDate={item.expectedLaunchDate} />
                                  )}
                                </div>
                                <div>
                                  {item.expectedLaunchDate && (
                                    <p className="text-xs text-amber-300 font-bold flex items-center gap-1.5">
                                      <Calendar className="w-3.5 h-3.5" />
                                      <span>Expected Launch: {new Date(item.expectedLaunchDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div>
                              <h4 className="font-black text-base text-white leading-snug">{item.name || 'Upcoming Exclusive Drop'}</h4>
                              {item.description && (
                                <p className="text-xs text-slate-300 line-clamp-2 mt-1.5 leading-relaxed">{item.description}</p>
                              )}
                            </div>

                            {/* STRICTLY NO ADD TO CART OR BUY NOW */}
                            <div className="flex items-center gap-3 pt-3 border-t border-white/10">
                              <button
                                type="button"
                                onClick={() => {
                                  setNotifyTargetItem(item);
                                  setIsNotifyModalOpen(true);
                                }}
                                className="flex-1 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md transition cursor-pointer"
                              >
                                <Bell className="w-4 h-4 text-slate-950" />
                                <span>Notify Me When Launched</span>
                              </button>
                              {item.previewSlug && (
                                <button
                                  type="button"
                                  onClick={() => loadProductBySlug(item.previewSlug)}
                                  className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                                >
                                  <span>Preview</span>
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}


                {/* Trust Badges */}
                <div className="max-w-7xl mx-auto px-4 mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex items-center gap-3">
                    <Truck className="w-8 h-8 text-emerald-600" />
                    <div>
                      <h5 className="font-bold text-xs text-slate-900">Nationwide Shipping</h5>
                      <p className="text-[11px] text-slate-500">Fast delivery across Pakistan</p>
                    </div>
                  </div>
                  <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex items-center gap-3">
                    <ShieldCheck className="w-8 h-8 text-emerald-600" />
                    <div>
                      <h5 className="font-bold text-xs text-slate-900">Secure Payments</h5>
                      <p className="text-[11px] text-slate-500">JazzCash, Easypaisa & COD</p>
                    </div>
                  </div>
                  <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex items-center gap-3">
                    <RotateCcw className="w-8 h-8 text-emerald-600" />
                    <div>
                      <h5 className="font-bold text-xs text-slate-900">Easy Returns</h5>
                      <p className="text-[11px] text-slate-500">7-day return & exchange policy</p>
                    </div>
                  </div>
                  <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-2xl flex items-center gap-3">
                    <PhoneCall className="w-8 h-8 text-emerald-600" />
                    <div>
                      <h5 className="font-bold text-xs text-slate-900">24/7 Support</h5>
                      <p className="text-[11px] text-slate-500">WhatsApp & Phone assistance</p>
                    </div>
                  </div>
                </div>

              </div>
            </>
          )}

          {/* VIEW: PRODUCT LISTING & SEARCH */}
          {currentView === 'products' && (
            <div className="max-w-7xl mx-auto px-4 py-6">
              {/* Back to Home Button */}
              <div className="flex items-center justify-between mb-4">
                <button 
                  onClick={() => handleBackNavigation('/')}
                  className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-emerald-700 bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-xl transition shadow-xs"
                  title="Return to Home"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Home</span>
                </button>
                {selectedCategory && (
                  <span className="text-xs font-medium text-slate-500">
                    Category: <strong className="text-emerald-700">{categories.find(c => c.id === selectedCategory)?.name || 'All'}</strong>
                  </span>
                )}
              </div>

              <div className="flex flex-col md:flex-row gap-6">
                {/* Filters Sidebar */}
                <div className="w-full md:w-64 bg-slate-50 border border-slate-200 p-4 rounded-2xl h-fit">
                  <h3 className="font-bold text-sm text-slate-900 mb-4 flex items-center gap-2">
                    <SlidersHorizontal className="w-4 h-4" /> Filters
                  </h3>
                  
                  {/* Category Filter */}
                  <div className="mb-4">
                    <label className="text-xs font-bold text-slate-700 block mb-2">Category</label>
                    <select 
                      value={selectedCategory || ''}
                      onChange={(e) => { 
                        if (e.target.value) {
                          handleOpenCategory(e.target.value);
                        } else {
                          handleOpenShop();
                        }
                      }}
                      className="w-full bg-white border border-slate-300 rounded-xl p-2 text-xs"
                    >
                      <option value="">All Categories</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Subcategory Filter */}
                  {selectedCategory && (
                    <div className="mb-4">
                      <label className="text-xs font-bold text-slate-700 block mb-2">Subcategory</label>
                      <select 
                        value={selectedSubcategory || ''}
                        onChange={(e) => handleOpenCategory(selectedCategory, e.target.value || null)}
                        className="w-full bg-white border border-slate-300 rounded-xl p-2 text-xs"
                      >
                        <option value="">All Subcategories</option>
                        {categories.find(c => c.id === selectedCategory)?.subcategories.map(sub => (
                          <option key={sub} value={sub}>{sub}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Search filter keyword */}
                  <div className="mb-4">
                    <label className="text-xs font-bold text-slate-700 block mb-2">Keyword</label>
                    <input 
                      type="text" 
                      placeholder="Search..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-xl p-2 text-xs"
                    />
                  </div>

                  <button 
                    onClick={() => { handleOpenShop(); setSearchQuery(''); }}
                    className="w-full bg-slate-200 hover:bg-slate-300 text-slate-700 py-2 rounded-xl text-xs font-bold transition"
                  >
                    Reset Filters
                  </button>
                </div>

                {/* Product Grid */}
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="font-bold text-lg text-slate-900">
                      Products {selectedCategory ? `- ${categories.find(c => c.id === selectedCategory)?.name}` : ''}
                    </h2>
                    <span className="text-xs text-slate-500">
                      Showing {safeProducts.filter(p => {
                        if (!p) return false;
                        if (selectedCategory && p.categoryId !== selectedCategory) return false;
                        if (selectedSubcategory && (p.subcategoryId || '').toLowerCase() !== selectedSubcategory.toLowerCase()) return false;
                        if (searchQuery && !(p.name || '').toLowerCase().includes(searchQuery.toLowerCase()) && !(p.brand || '').toLowerCase().includes(searchQuery.toLowerCase())) return false;
                        return true;
                      }).length} items
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4">
                    {safeProducts.filter(p => {
                      if (!p) return false;
                      if (selectedCategory && p.categoryId !== selectedCategory) return false;
                      if (selectedSubcategory && (p.subcategoryId || '').toLowerCase() !== selectedSubcategory.toLowerCase()) return false;
                      if (searchQuery && !(p.name || '').toLowerCase().includes(searchQuery.toLowerCase()) && !(p.brand || '').toLowerCase().includes(searchQuery.toLowerCase())) return false;
                      return true;
                    }).map(prod => (
                      <div 
                        key={prod.id}
                        className="bg-white border border-slate-200 rounded-2xl p-2.5 sm:p-4 flex flex-col justify-between hover:shadow-xl transition group relative cursor-pointer"
                        onClick={() => handleOpenProduct(prod)}
                      >
                        {prod.discountPercentage && (
                          <span className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-red-600 text-white text-[9px] sm:text-[10px] font-extrabold px-1.5 sm:px-2 py-0.5 rounded-full z-10">
                            {prod.discountPercentage}% OFF
                          </span>
                        )}
                        <div className="w-full h-36 sm:h-52 rounded-xl overflow-hidden mb-2 sm:mb-3 bg-slate-100 flex items-center justify-center">
                          <img src={getPrimaryProductImage(prod)} alt={prod.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                        </div>
                        <div>
                          <p className="text-[9.5px] sm:text-[11px] text-emerald-600 font-semibold mb-0.5 sm:mb-1 uppercase truncate">{prod.brand}</p>
                          <h4 className="font-bold text-xs sm:text-sm text-slate-900 line-clamp-2 mb-1 sm:mb-2">{prod.name}</h4>
                          <div className="flex items-center gap-1 mb-1.5 sm:mb-2">
                            <Star className="w-3 sm:w-3.5 h-3 sm:h-3.5 fill-amber-400 text-amber-400" />
                            <span className="text-[10px] sm:text-xs font-bold text-slate-700">{prod.rating}</span>
                            <span className="text-[9px] sm:text-xs text-slate-400">({prod.reviewCount})</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between mt-1 sm:mt-2 pt-1.5 sm:pt-2 border-t border-slate-100">
                          <div>
                            {prod.originalPrice && (
                              <p className="text-[9px] sm:text-xs text-slate-400 line-through">PKR {prod.originalPrice?.toLocaleString()}</p>
                            )}
                            <p className="text-xs sm:text-sm font-black text-emerald-700">PKR {prod.price.toLocaleString()}</p>
                          </div>
                          <button 
                            onClick={(e) => { e.stopPropagation(); addToCart(prod); }}
                            className="bg-slate-900 hover:bg-emerald-600 text-white p-1.5 sm:p-2 rounded-xl transition shadow-xs"
                            title="Add to Cart"
                          >
                            <Plus className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW: UNIQUE PRODUCT DETAIL PAGE */}
          {currentView === 'product-detail' && (!selectedProduct || selectedProduct.error || !selectedProduct.id) && (
            <div className="max-w-7xl mx-auto px-4 py-16 text-center">
              <div className="w-16 h-16 bg-amber-100 text-amber-800 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">⚠️</div>
              <h2 className="text-xl font-black text-slate-900 mb-2">Product Not Found</h2>
              <p className="text-sm text-slate-500 mb-6">The product you are trying to view could not be located or has been removed from the catalog.</p>
              <button 
                onClick={() => handleBackNavigation('/shop')}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-xl shadow transition text-xs"
              >
                Return to Shop Catalog
              </button>
            </div>
          )}

          {currentView === 'product-detail' && selectedProduct && !selectedProduct.error && selectedProduct.id && (
            <div className="max-w-7xl mx-auto px-4 py-6">
              <div className="flex items-center justify-between mb-6">
                <button 
                  onClick={() => handleBackNavigation('/shop')}
                  className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-emerald-700 bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-xl transition shadow-xs"
                  title="Go back to previous page"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500">
                  <span className="cursor-pointer hover:text-emerald-600" onClick={() => navigate('/')}>Home</span>
                  <span>/</span>
                  <span className="cursor-pointer hover:text-emerald-600" onClick={() => handleOpenCategory(selectedProduct.categoryId)}>
                    {categories.find(c => c.id === selectedProduct.categoryId)?.name || 'Catalog'}
                  </span>
                  <span>/</span>
                  <span className="text-slate-800 font-semibold truncate max-w-[200px]">{selectedProduct.name}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Image Gallery */}
                <div>
                  <div className="w-full h-[380px] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 mb-4 shadow-sm flex items-center justify-center">
                    <img src={getPrimaryProductImage(selectedProduct)} alt={selectedProduct.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {getProductImages(selectedProduct).map((img, idx) => (
                      <div key={idx} className="w-20 h-20 rounded-xl overflow-hidden border border-slate-200 cursor-pointer shrink-0">
                        <img src={img} alt="" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Product Info & Variants */}
                <div>
                  <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full inline-block mb-2 uppercase">
                    {selectedProduct.brand}
                  </span>
                  <h2 className="text-2xl font-black text-slate-900 mb-2">{selectedProduct.name}</h2>
                  
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span className="text-sm font-bold text-slate-800">{selectedProduct.rating}</span>
                      <span className="text-xs text-slate-500">({selectedProduct.reviewCount} customer reviews)</span>
                    </div>
                    <span className="text-slate-300">|</span>
                    <span className="text-xs font-bold text-emerald-600">In Stock ({selectedProduct.stock} available)</span>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 mb-6">
                    <div className="flex items-baseline gap-3">
                      <p className="text-2xl font-black text-emerald-700">
                        PKR {(selectedVariant ? selectedVariant.price : selectedProduct.price).toLocaleString()}
                      </p>
                      {selectedProduct.originalPrice && (
                        <p className="text-sm text-slate-400 line-through">
                          PKR {selectedProduct.originalPrice.toLocaleString()}
                        </p>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">Inclusive of all taxes. Shipping calculated at checkout.</p>
                  </div>

                  {/* Optional Variations */}
                  {selectedProduct.variants && selectedProduct.variants.length > 0 && (
                    <div className="mb-6">
                      <label className="text-xs font-bold text-slate-700 block mb-2 uppercase tracking-wide">Available Variations</label>
                      <div className="space-y-2">
                        {selectedProduct.variants.map(v => (
                          <button
                            key={v.id}
                            onClick={() => setSelectedVariant(v)}
                            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 transition ${selectedVariant?.id === v.id ? 'bg-emerald-50 border-emerald-500 shadow-inner' : 'bg-white border-slate-200 hover:border-slate-300'}`}
                          >
                            <span className="text-xs font-bold text-slate-800">{v.name}</span>
                            <span className="text-xs font-bold text-emerald-700">PKR {v.price.toLocaleString()}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Quantity */}
                  <div className="flex items-center gap-4 mb-6">
                    <span className="text-xs font-bold text-slate-700">Quantity:</span>
                    <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden">
                      <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700">-</button>
                      <span className="px-4 py-1.5 text-xs font-bold">{quantity}</span>
                      <button onClick={() => setQuantity(quantity + 1)} className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700">+</button>
                    </div>
                  </div>

                  {/* Add to Cart & Buy Now */}
                  <div className="flex gap-3 mb-6">
                    <button 
                      onClick={() => addToCart(selectedProduct, selectedVariant || undefined, quantity)}
                      className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-lg transition"
                    >
                      <ShoppingBag className="w-5 h-5" /> Add to Cart
                    </button>
                    <button 
                      onClick={() => {
                        addToCart(selectedProduct, selectedVariant || undefined, quantity);
                        navigate('/checkout');
                      }}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-2xl flex items-center justify-center gap-2 shadow-lg transition"
                    >
                      Buy Now (COD / JazzCash)
                    </button>
                  </div>

                  {/* Share Unique URL */}
                  <div className="border-t border-slate-200 pt-4 flex items-center justify-between text-xs text-slate-500">
                    <span>Unique Product SKU: <strong className="text-slate-800">{selectedVariant?.sku || selectedProduct.id}</strong></span>
                    <button 
                      onClick={() => {
                        navigator.clipboard.writeText(window.location.href);
                        showToast('Product link copied to clipboard!');
                      }}
                      className="flex items-center gap-1 font-semibold text-emerald-600 hover:underline"
                    >
                      <Share2 className="w-4 h-4" /> Share Product
                    </button>
                  </div>

                  {/* Description */}
                  <div className="mt-6 border-t border-slate-200 pt-4">
                    <h4 className="font-bold text-sm text-slate-900 mb-2">Product Description</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">{selectedProduct.description}</p>
                  </div>

                  {/* Related Products Section */}
                  <div className="mt-8 border-t border-slate-200 pt-6">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-bold text-sm text-slate-900">Related Products in this Category</h4>
                      <button 
                        type="button"
                        onClick={() => handleOpenCategory(selectedProduct.categoryId)}
                        className="text-xs font-bold text-emerald-600 hover:text-emerald-700"
                      >
                        View More →
                      </button>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {safeProducts
                        .filter(p => p && p.id !== selectedProduct.id && (p.categoryId === selectedProduct.categoryId || p.subcategoryId === selectedProduct.subcategoryId))
                        .slice(0, 4)
                        .map(related => (
                          <div 
                            key={related.id}
                            onClick={() => handleOpenProduct(related)}
                            className="bg-white border border-slate-200 rounded-xl p-2 flex flex-col justify-between hover:shadow-md transition cursor-pointer group"
                          >
                            <div className="w-full aspect-square rounded-lg overflow-hidden bg-[#062419] flex items-center justify-center mb-1.5">
                              <img 
                                src={getPrimaryProductImage(related)} 
                                alt={related.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition duration-300" 
                              />
                            </div>
                            <div>
                              <p className="text-[9px] text-emerald-600 font-bold uppercase truncate">{related.brand}</p>
                              <h5 className="font-bold text-[11px] text-slate-800 line-clamp-1">{related.name}</h5>
                              <p className="font-black text-[11px] text-slate-900 mt-0.5">PKR {related.price.toLocaleString()}</p>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW: PAKISTAN-SPECIFIC CHECKOUT */}
          {currentView === 'checkout' && (
            <div className="max-w-4xl mx-auto px-4 py-6">
              <div className="flex items-center justify-between mb-6">
                <button 
                  type="button"
                  onClick={() => handleBackNavigation('/cart')}
                  className="inline-flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-emerald-700 bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-xl transition shadow-xs"
                  title="Go back to Cart"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Cart</span>
                </button>
                <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  <ShieldCheck className="w-6 h-6 text-emerald-600" /> Secure Pakistan Checkout
                </h2>
              </div>

              <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Delivery Information */}
                <div className="md:col-span-2 bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
                  <h3 className="font-bold text-sm text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                    <span>1. Customer & Delivery Information</span>
                    {currentCustomer && (
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                        ✓ Account Auto-Filled
                      </span>
                    )}
                  </h3>

                  {currentCustomer ? (
                    <div className="mb-4 bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span className="text-xs text-emerald-950 truncate">
                          Logged in as <strong>{currentCustomer.name}</strong> (WhatsApp: {currentCustomer.whatsapp}). Order will link to your account.
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => navigate('/account')}
                        className="text-[11px] font-bold text-emerald-700 hover:underline shrink-0 ml-2"
                      >
                        Account
                      </button>
                    </div>
                  ) : (
                    <div className="mb-4 bg-gradient-to-r from-emerald-50 to-blue-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <User className="w-4 h-4 text-emerald-700 shrink-0" />
                        <span className="text-xs text-slate-700 truncate">
                          Have an ATAL account? Sign in or register with WhatsApp to save this order!
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => navigate('/account')}
                        className="text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-3 py-1 rounded-lg transition shrink-0 ml-2 shadow-xs"
                      >
                        Sign In / Register
                      </button>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Full Name *</label>
                      <input 
                        type="text" 
                        required
                        placeholder="e.g. Muhammad Ali"
                        value={checkoutForm.customerName}
                        onChange={(e) => setCheckoutForm({...checkoutForm, customerName: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Mobile Number (03XXXXXXXXX) *</label>
                      <input 
                        type="text" 
                        required
                        placeholder="03001234567"
                        value={checkoutForm.mobileNumber}
                        onChange={(e) => setCheckoutForm({...checkoutForm, mobileNumber: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">Province / Territory *</label>
                      <select 
                        value={checkoutForm.province}
                        onChange={(e) => setCheckoutForm({...checkoutForm, province: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs"
                      >
                        {PAKISTAN_PROVINCES.map(prov => (
                          <option key={prov} value={prov}>{prov}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1">City *</label>
                      <select 
                        value={checkoutForm.city}
                        onChange={(e) => setCheckoutForm({...checkoutForm, city: e.target.value})}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs"
                      >
                        {PAKISTANI_CITIES.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="text-xs font-bold text-slate-700 block mb-1">Area / Locality / Sector *</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Gulberg III, Clifton Block 5, F-7/2"
                      value={checkoutForm.area}
                      onChange={(e) => setCheckoutForm({...checkoutForm, area: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs"
                    />
                  </div>

                  <div className="mb-4">
                    <label className="text-xs font-bold text-slate-700 block mb-1">Complete Street Address *</label>
                    <textarea 
                      required
                      rows={2}
                      placeholder="House # 42, Street # 3, Near Mosque / Landmark"
                      value={checkoutForm.address}
                      onChange={(e) => setCheckoutForm({...checkoutForm, address: e.target.value})}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs"
                    />
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 mt-6 mb-4 pb-2 border-b border-slate-100">2. Select Payment Method</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                    <label className={`border rounded-xl p-3 flex flex-col cursor-pointer transition ${checkoutForm.paymentMethod === 'cod' ? 'border-emerald-600 bg-emerald-50/50' : 'border-slate-200'}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <input 
                          type="radio" 
                          name="payment" 
                          checked={checkoutForm.paymentMethod === 'cod'} 
                          onChange={() => setCheckoutForm({...checkoutForm, paymentMethod: 'cod'})}
                        />
                        <span className="font-bold text-xs text-slate-900">Cash on Delivery</span>
                      </div>
                      <span className="text-[10px] text-slate-500">Pay cash upon delivery at your doorstep</span>
                    </label>

                    <label className={`border rounded-xl p-3 flex flex-col cursor-pointer transition ${checkoutForm.paymentMethod === 'jazzcash' ? 'border-emerald-600 bg-emerald-50/50' : 'border-slate-200'}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <input 
                          type="radio" 
                          name="payment" 
                          checked={checkoutForm.paymentMethod === 'jazzcash'} 
                          onChange={() => setCheckoutForm({...checkoutForm, paymentMethod: 'jazzcash'})}
                        />
                        <span className="font-bold text-xs text-red-600">JazzCash Mobile</span>
                      </div>
                      <span className="text-[10px] text-slate-500">Secure USSD / Mobile App payment</span>
                    </label>

                    <label className={`border rounded-xl p-3 flex flex-col cursor-pointer transition ${checkoutForm.paymentMethod === 'easypaisa' ? 'border-emerald-600 bg-emerald-50/50' : 'border-slate-200'}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <input 
                          type="radio" 
                          name="payment" 
                          checked={checkoutForm.paymentMethod === 'easypaisa'} 
                          onChange={() => setCheckoutForm({...checkoutForm, paymentMethod: 'easypaisa'})}
                        />
                        <span className="font-bold text-xs text-emerald-600">Easypaisa</span>
                      </div>
                      <span className="text-[10px] text-slate-500">Instant mobile wallet transfer</span>
                    </label>

                    <label className={`border rounded-xl p-3 flex flex-col cursor-pointer transition ${checkoutForm.paymentMethod === 'bank' ? 'border-emerald-600 bg-emerald-50/50' : 'border-slate-200'}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <input 
                          type="radio" 
                          name="payment" 
                          checked={checkoutForm.paymentMethod === 'bank'} 
                          onChange={() => setCheckoutForm({...checkoutForm, paymentMethod: 'bank'})}
                        />
                        <span className="font-bold text-xs text-blue-800">Bank Transfer</span>
                      </div>
                      <span className="text-[10px] text-slate-500">Secure Direct Bank Transfer</span>
                    </label>
                  </div>

                  {/* JazzCash Payment Box */}
                  {checkoutForm.paymentMethod === 'jazzcash' && (
                    <div className="bg-amber-50 border-2 border-red-300 p-4 rounded-xl mb-4 shadow-sm">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs font-black text-red-700">JazzCash Official Payment Details</p>
                        <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">TID Required</span>
                      </div>
                      <p className="text-[11px] text-slate-700 mb-3">
                        Account Title: <strong className="text-slate-900">{storeSettings.jazzcashAccountTitle}</strong> | 
                        Account No: <strong className="text-slate-900 bg-amber-100 px-1 py-0.5 rounded">{storeSettings.jazzcashAccountNumber}</strong>
                        <button 
                          type="button" 
                          onClick={() => { navigator.clipboard.writeText(storeSettings.jazzcashAccountNumber); showToast('JazzCash Account Number Copied!'); }}
                          className="ml-2 text-red-700 underline text-[10px] font-bold"
                        >
                          Copy
                        </button>
                      </p>
                      <div className="flex flex-col sm:flex-row items-center gap-4">
                        <img src={storeSettings.jazzcashQrImage} alt="JazzCash QR Code" className="w-40 h-40 object-contain border-2 border-amber-200 rounded-xl bg-white shadow" />
                        <div className="flex-1 w-full space-y-2">
                          <p className="text-[11px] text-amber-950">
                            1. Scan QR in JazzCash App or send <strong>PKR {finalTotal.toLocaleString()}</strong> to <strong>{storeSettings.jazzcashAccountNumber} ({storeSettings.jazzcashAccountTitle})</strong>.
                          </p>
                          <p className="text-[11px] text-amber-950 font-medium">
                            2. You will receive an SMS from JazzCash with a <strong>Transaction ID (TID)</strong>. Enter it below:
                          </p>
                          <div>
                            <label className="text-xs font-black text-red-800 block mb-1">
                              Payment Transaction ID (TID) * <span className="text-red-600 font-bold">(Mandatory Before Placing Order)</span>
                            </label>
                            <input 
                              type="text" 
                              required
                              placeholder="Enter 10-12 digit JazzCash TID (e.g. 1029485739)"
                              value={checkoutForm.transactionId}
                              onChange={(e) => {
                                setCheckoutForm({...checkoutForm, transactionId: e.target.value});
                                if (e.target.value.trim()) setCheckoutTidError(false);
                              }}
                              className={`bg-white border-2 rounded-xl p-2.5 text-xs w-full font-mono font-bold transition ${checkoutTidError && !checkoutForm.transactionId.trim() ? 'border-red-600 ring-2 ring-red-300 bg-red-50 text-red-900' : 'border-red-400 focus:ring-2 focus:ring-red-500'}`}
                            />
                            {checkoutTidError && !checkoutForm.transactionId.trim() && (
                              <p className="text-[11px] text-red-700 font-bold mt-1 animate-pulse">
                                ⚠️ Please make payment and enter the JazzCash Transaction ID (TID) to place your order.
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Easypaisa Payment Box */}
                  {checkoutForm.paymentMethod === 'easypaisa' && (
                    <div className="bg-emerald-50 border-2 border-emerald-300 p-4 rounded-xl mb-4 shadow-sm">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs font-black text-emerald-800">Easypaisa Official Payment Details</p>
                        <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">TID Required</span>
                      </div>
                      <p className="text-[11px] text-slate-700 mb-3">
                        Account Title: <strong className="text-slate-900">{storeSettings.easypaisaAccountTitle}</strong> | 
                        Account No: <strong className="text-slate-900 bg-emerald-100 px-1 py-0.5 rounded">{storeSettings.easypaisaAccountNumber}</strong>
                        <button 
                          type="button" 
                          onClick={() => { navigator.clipboard.writeText(storeSettings.easypaisaAccountNumber); showToast('Easypaisa Account Number Copied!'); }}
                          className="ml-2 text-emerald-700 underline text-[10px] font-bold"
                        >
                          Copy
                        </button>
                      </p>
                      <div className="flex flex-col sm:flex-row items-center gap-4">
                        <img src={storeSettings.easypaisaQrImage} alt="Easypaisa QR Code" className="w-40 h-40 object-contain border-2 border-emerald-200 rounded-xl bg-white shadow" />
                        <div className="flex-1 w-full space-y-2">
                          <p className="text-[11px] text-emerald-950">
                            1. Scan QR in Easypaisa App or send <strong>PKR {finalTotal.toLocaleString()}</strong> to <strong>{storeSettings.easypaisaAccountNumber} ({storeSettings.easypaisaAccountTitle})</strong>.
                          </p>
                          <p className="text-[11px] text-emerald-950 font-medium">
                            2. You will receive an SMS from Easypaisa (3737) with a <strong>Transaction ID (TID)</strong>. Enter it below:
                          </p>
                          <div>
                            <label className="text-xs font-black text-emerald-900 block mb-1">
                              Payment Transaction ID (TID) * <span className="text-emerald-700 font-bold">(Mandatory Before Placing Order)</span>
                            </label>
                            <input 
                              type="text" 
                              required
                              placeholder="Enter 10-12 digit Easypaisa TID (e.g. 2938471029)"
                              value={checkoutForm.transactionId}
                              onChange={(e) => {
                                setCheckoutForm({...checkoutForm, transactionId: e.target.value});
                                if (e.target.value.trim()) setCheckoutTidError(false);
                              }}
                              className={`bg-white border-2 rounded-xl p-2.5 text-xs w-full font-mono font-bold transition ${checkoutTidError && !checkoutForm.transactionId.trim() ? 'border-red-600 ring-2 ring-red-300 bg-red-50 text-red-900' : 'border-emerald-500 focus:ring-2 focus:ring-emerald-500'}`}
                            />
                            {checkoutTidError && !checkoutForm.transactionId.trim() && (
                              <p className="text-[11px] text-red-700 font-bold mt-1 animate-pulse">
                                ⚠️ Please make payment and enter the Easypaisa Transaction ID (TID) to place your order.
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Bank Payment Box */}
                  {checkoutForm.paymentMethod === 'bank' && (
                    <div className="bg-blue-50 border-2 border-blue-400 p-4 rounded-xl mb-4 shadow-sm">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs font-black text-blue-900">Bank Transfer Official Payment Details</p>
                        <span className="bg-blue-700 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">TID Required</span>
                      </div>
                      <p className="text-[11px] text-slate-700 mb-3">
                        Account Title: <strong className="text-slate-900">{storeSettings.bankAccountTitle}</strong> | 
                        Account No: <strong className="text-slate-900 bg-blue-100 px-1 py-0.5 rounded">{storeSettings.bankAccountNumber}</strong>
                        <button 
                          type="button" 
                          onClick={() => { navigator.clipboard.writeText(storeSettings.bankAccountNumber); showToast('Bank Account Number Copied!'); }}
                          className="ml-2 text-blue-800 underline text-[10px] font-bold"
                        >
                          Copy
                        </button>
                      </p>
                      <div className="flex flex-col sm:flex-row items-center gap-4">
                        <img src={storeSettings.bankQrImage} alt="Bank QR Code" className="w-40 h-40 object-contain border-2 border-blue-300 rounded-xl bg-white shadow" />
                        <div className="flex-1 w-full space-y-2">
                          <p className="text-[11px] text-blue-950">
                            1. Scan QR in your Banking App or send <strong>PKR {finalTotal.toLocaleString()}</strong> to <strong>{storeSettings.bankAccountNumber} ({storeSettings.bankAccountTitle})</strong>.
                          </p>
                          <p className="text-[11px] text-blue-950 font-medium">
                            2. Once transferred, enter the <strong>Transaction ID (TID)</strong> below:
                          </p>
                          <div>
                            <label className="text-xs font-black text-blue-900 block mb-1">
                              Payment Transaction ID (TID) * <span className="text-blue-700 font-bold">(Mandatory Before Placing Order)</span>
                            </label>
                            <input 
                              type="text" 
                              required
                              placeholder="Enter Bank Transfer TID"
                              value={checkoutForm.transactionId}
                              onChange={(e) => {
                                setCheckoutForm({...checkoutForm, transactionId: e.target.value});
                                if (e.target.value.trim()) setCheckoutTidError(false);
                              }}
                              className={`bg-white border-2 rounded-xl p-2.5 text-xs w-full font-mono font-bold transition ${checkoutTidError && !checkoutForm.transactionId.trim() ? 'border-red-600 ring-2 ring-red-300 bg-red-50 text-red-900' : 'border-blue-500 focus:ring-2 focus:ring-blue-500'}`}
                            />
                            {checkoutTidError && !checkoutForm.transactionId.trim() && (
                              <p className="text-[11px] text-red-700 font-bold mt-1 animate-pulse">
                                ⚠️ Please make payment and enter the Transaction ID (TID) to place your order.
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* COD with Advance Delivery Fee (Rs 290) Box */}
                  {checkoutForm.paymentMethod === 'cod' && storeSettings.codAdvanceShipping && (
                    <div className="bg-blue-50 border-2 border-blue-300 p-4 rounded-xl mb-4 shadow-sm">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs font-black text-blue-900">Cash on Delivery - Advance Delivery Fee (PKR {storeSettings.defaultShippingCharge})</p>
                        <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">Advance TID Required</span>
                      </div>
                      <p className="text-[11px] text-slate-700 mb-3">
                        To confirm COD, please send advance delivery fee of <strong>PKR {storeSettings.defaultShippingCharge}</strong> via Easypaisa or JazzCash to <strong>Omar Farooq ({storeSettings.easypaisaAccountNumber})</strong>. The remaining item total is paid in cash at your doorstep.
                      </p>
                      <div className="flex flex-col sm:flex-row items-center gap-4">
                        <img src={storeSettings.easypaisaQrImage} alt="Advance Delivery QR Code" className="w-36 h-36 object-contain border-2 border-blue-200 rounded-xl bg-white shadow" />
                        <div className="flex-1 w-full space-y-2">
                          <p className="text-[11px] text-blue-950">
                            Send delivery fee of <strong>PKR {storeSettings.defaultShippingCharge}</strong> to Easypaisa/JazzCash: <strong>{storeSettings.easypaisaAccountNumber} (Omar Farooq)</strong>.
                          </p>
                          <div>
                            <label className="text-xs font-black text-blue-900 block mb-1">
                              Advance Delivery Fee Transaction ID (TID) * <span className="text-blue-700 font-bold">(Mandatory Before Placing Order)</span>
                            </label>
                            <input 
                              type="text" 
                              required
                              placeholder="Enter advance payment TID (e.g. 1928471029)"
                              value={checkoutForm.transactionId}
                              onChange={(e) => {
                                setCheckoutForm({...checkoutForm, transactionId: e.target.value});
                                if (e.target.value.trim()) setCheckoutTidError(false);
                              }}
                              className={`bg-white border-2 rounded-xl p-2.5 text-xs w-full font-mono font-bold transition ${checkoutTidError && !checkoutForm.transactionId.trim() ? 'border-red-600 ring-2 ring-red-300 bg-red-50 text-red-900' : 'border-blue-500 focus:ring-2 focus:ring-blue-500'}`}
                            />
                            {checkoutTidError && !checkoutForm.transactionId.trim() && (
                              <p className="text-[11px] text-red-700 font-bold mt-1 animate-pulse">
                                ⚠️ Please enter the Transaction ID (TID) of the PKR {storeSettings.defaultShippingCharge} advance delivery fee.
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Fallback if COD without advance shipping is selected */}
                  {checkoutForm.paymentMethod === 'cod' && !storeSettings.codAdvanceShipping && (
                    <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl mb-4">
                      <label className="text-xs font-black text-slate-800 block mb-1">
                        Confirmation Reference / Note * <span className="text-slate-500 font-normal">(Enter COD or Mobile #)</span>
                      </label>
                      <input 
                        type="text" 
                        required
                        placeholder="Enter COD or your phone confirmation"
                        value={checkoutForm.transactionId}
                        onChange={(e) => {
                          setCheckoutForm({...checkoutForm, transactionId: e.target.value});
                          if (e.target.value.trim()) setCheckoutTidError(false);
                        }}
                        className={`bg-white border rounded-xl p-2.5 text-xs w-full ${checkoutTidError && !checkoutForm.transactionId.trim() ? 'border-red-600 ring-2 ring-red-300' : 'border-slate-300'}`}
                      />
                    </div>
                  )}

                  <button 
                    type="submit"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl shadow-lg transition text-sm flex items-center justify-center gap-2"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    Confirm & Place Order (PKR {finalTotal.toLocaleString()})
                  </button>
                </div>

                {/* Order Summary Sidebar */}
                <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl h-fit">
                  <h3 className="font-bold text-sm text-slate-900 mb-4 pb-2 border-b border-slate-200">Order Summary</h3>
                  
                  <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                    {cart.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center text-xs">
                        <span className="line-clamp-1 text-slate-700">{item.product?.name} ({item.selectedVariant?.name || 'Standard'}) x {item.quantity}</span>
                        <span className="font-bold text-slate-900">PKR {((item.selectedVariant?.price || item.product?.price || 0) * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>

                  {/* Coupon input */}
                  <div className="flex gap-2 mb-4">
                    <input 
                      type="text" 
                      placeholder="Coupon Code (ATAL2026)"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="bg-white border border-slate-300 rounded-xl p-2 text-xs flex-1"
                    />
                    <button 
                      type="button"
                      onClick={handleApplyCoupon}
                      className="bg-slate-900 text-white px-3 py-2 rounded-xl text-xs font-bold"
                    >
                      Apply
                    </button>
                  </div>

                  <div className="space-y-2 text-xs pt-3 border-t border-slate-200">
                    <div className="flex justify-between text-slate-600">
                      <span>Subtotal</span>
                      <span>PKR {subtotal.toLocaleString()}</span>
                    </div>
                    {appliedDiscount > 0 && (
                      <div className="flex justify-between text-emerald-600 font-bold">
                        <span>Discount (10%)</span>
                        <span>- PKR {discountAmount.toLocaleString()}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-slate-600">
                      <span>Shipping Charges</span>
                      <span>{shippingCharges === 0 ? 'FREE' : `PKR ${shippingCharges}`}</span>
                    </div>
                    <div className="flex justify-between text-slate-900 font-black text-sm pt-2 border-t border-slate-200">
                      <span>Total Payable</span>
                      <span className="text-emerald-700">PKR {finalTotal.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* VIEW: ORDER SUCCESS */}
          {currentView === 'order-success' && lastPlacedOrder && (
            <div className="max-w-2xl mx-auto px-4 py-10 text-center">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="text-2xl font-black text-slate-900 mb-1">Order Placed Successfully!</h2>
              <p className="text-slate-600 text-xs mb-6">Your order has been recorded in our system. You can track your parcel anytime using your unique 8-digit tracking number.</p>

              {/* 8-Digit Tracking Number Card */}
              <div className="bg-gradient-to-r from-emerald-800 to-slate-900 text-white rounded-2xl p-6 mb-6 shadow-xl text-center">
                <p className="text-xs font-bold text-emerald-300 uppercase tracking-widest mb-1">Official 8-Digit Tracking Number</p>
                <div className="flex items-center justify-center gap-3 my-2">
                  <span className="text-3xl sm:text-4xl font-black font-mono tracking-widest text-emerald-400 bg-white/10 px-4 py-1.5 rounded-xl border border-white/20">
                    {lastPlacedOrder.trackingNumber}
                  </span>
                  <button 
                    onClick={() => { navigator.clipboard.writeText(lastPlacedOrder.trackingNumber); showToast('8-Digit Tracking Number copied!'); }}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1 shadow"
                  >
                    Copy
                  </button>
                </div>
                <p className="text-[11px] text-slate-300">Order ID: {lastPlacedOrder.orderNumber} | Please keep this 8-digit code to track your order.</p>
              </div>

              {/* Automated Email Service Placeholder / Confirmation Card */}
              {(() => {
                const recipientEmail = lastPlacedOrder.email || lastPlacedOrder.emailConfirmation?.recipientEmail || currentCustomer?.email;
                return (
                  <div className="bg-gradient-to-br from-blue-950 via-slate-900 to-indigo-950 text-white rounded-2xl p-6 text-left mb-6 shadow-xl border border-blue-500/30 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
                    
                    {/* Header Strip */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10 relative z-10">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-400/30 shrink-0 shadow-inner">
                          <Mail className="w-5 h-5 text-blue-300" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-sm text-white">Automated Receipt Email Dispatched</h3>
                            <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                              Delivered
                            </span>
                          </div>
                          <p className="text-[11px] text-blue-200 mt-0.5">
                            Simulated Email Service Placeholder • Automated receipt generated
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedEmailOrder(lastPlacedOrder);
                            setIsEmailReceiptModalOpen(true);
                          }}
                          className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-3 py-1.5 rounded-xl text-xs transition flex items-center gap-1.5 shadow"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Receipt Email</span>
                        </button>
                      </div>
                    </div>

                    {/* Email Meta details */}
                    <div className="py-3 text-xs space-y-2 relative z-10">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] bg-white/5 rounded-xl p-3 border border-white/10">
                        <div>
                          <span className="text-slate-400">Recipient Address: </span>
                          <span className="font-bold text-emerald-300 font-mono">
                            {recipientEmail || 'No email attached'}
                          </span>
                        </div>
                        <div className="text-slate-400">
                          Subject: <span className="text-slate-200 font-medium">Order Confirmation #{lastPlacedOrder.trackingNumber} - ATAL Pakistan</span>
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-300 leading-relaxed pt-1">
                        A detailed receipt containing your 8-digit tracking code (<strong>{lastPlacedOrder.trackingNumber}</strong>), advance delivery TID (<strong>{lastPlacedOrder.transactionReference}</strong>), and itemized order breakdown has been simulated and sent to your registered address.
                      </p>
                    </div>

                    {/* Resend / Send to Another Email Action */}
                    <div className="pt-3 border-t border-white/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 relative z-10">
                      {recipientEmail ? (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            disabled={isSendingEmail}
                            onClick={() => handleResendEmail(lastPlacedOrder, recipientEmail)}
                            className="bg-white/10 hover:bg-white/20 text-white font-medium px-3 py-1.5 rounded-lg text-[11px] transition flex items-center gap-1.5 disabled:opacity-50"
                          >
                            <RefreshCw className={`w-3.5 h-3.5 ${isSendingEmail ? 'animate-spin' : ''}`} />
                            <span>{isSendingEmail ? 'Sending...' : 'Resend to this address'}</span>
                          </button>
                          <span className="text-[10px] text-slate-400">
                            Service: ATAL Automated Mail Dispatcher
                          </span>
                        </div>
                      ) : null}

                      {/* Send to custom email if changed or missing */}
                      <div className="flex items-center gap-2">
                        <input
                          type="email"
                          placeholder={recipientEmail ? 'Send copy to other email...' : 'Enter your email to receive receipt...'}
                          value={customEmailInput}
                          onChange={(e) => setCustomEmailInput(e.target.value)}
                          className="bg-white/10 border border-white/20 rounded-xl px-3 py-1.5 text-xs text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-400 w-48 sm:w-56"
                        />
                        <button
                          type="button"
                          disabled={isSendingEmail || !customEmailInput.trim()}
                          onClick={() => handleResendEmail(lastPlacedOrder, customEmailInput)}
                          className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold px-3 py-1.5 rounded-xl text-xs transition flex items-center gap-1 shrink-0"
                        >
                          <Send className="w-3 h-3" />
                          <span>Send</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })()}

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-left mb-6 shadow-sm">
                <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-200">
                  <div>
                    <p className="text-[11px] text-slate-400">Transaction ID (TID)</p>
                    <p className="font-mono font-bold text-xs text-slate-900 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded inline-block">
                      {lastPlacedOrder.transactionReference}
                    </p>
                  </div>
                  <span className="bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold px-3 py-1 rounded-full">
                    {lastPlacedOrder.orderStatus}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs mb-4">
                  <div>
                    <p className="text-slate-400">Customer Name</p>
                    <p className="font-bold text-slate-800">{lastPlacedOrder.customerName}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Mobile Number</p>
                    <p className="font-bold text-slate-800">{lastPlacedOrder.mobileNumber}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Delivery City</p>
                    <p className="font-bold text-slate-800">{lastPlacedOrder.city} ({lastPlacedOrder.province})</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Payment Method</p>
                    <p className="font-bold uppercase text-slate-800">{lastPlacedOrder.paymentMethod} ({lastPlacedOrder.paymentStatus})</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 flex justify-between items-center text-sm font-bold">
                  <span>Total Payable:</span>
                  <span className="text-emerald-700">PKR {lastPlacedOrder.totalAmount.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex gap-4 justify-center">
                <button 
                  onClick={() => { 
                    setTrackingSearchQuery(lastPlacedOrder.trackingNumber);
                    setSearchedOrder(lastPlacedOrder);
                    navigate('/orders'); 
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-xl text-xs transition shadow-md"
                >
                  Track This Order Now
                </button>
                <button 
                  onClick={() => { navigate('/'); }}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-6 py-3 rounded-xl text-xs transition"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          )}

          {/* VIEW: ORDER TRACKING */}
          {currentView === 'orders' && (
            <div className="max-w-4xl mx-auto px-4 py-6">
              {/* Back Button & Breadcrumbs */}
              <div className="flex items-center gap-3 mb-4">
                <button
                  type="button"
                  onClick={() => handleBackNavigation('/')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Link to="/" className="hover:text-emerald-700 font-medium">Home</Link>
                  <span>/</span>
                  <span className="font-semibold text-slate-800">Track Order</span>
                </div>
              </div>

              <h2 className="text-xl font-black text-slate-900 mb-2">Order Tracking & Status</h2>
              <p className="text-xs text-slate-500 mb-6">Track your package live nationwide across Pakistan using your 8-digit tracking number.</p>

              {/* Tracking Search Bar */}
              <div className="bg-white border-2 border-emerald-500 rounded-2xl p-5 shadow-sm mb-6">
                <label className="text-xs font-black text-slate-800 block mb-2">Enter 8-Digit Tracking Number or Mobile Number:</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="e.g. 78421095 or 03XXXXXXXXX"
                    value={trackingSearchQuery}
                    onChange={(e) => setTrackingSearchQuery(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleTrackOrder(); }}
                    className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs font-mono font-bold focus:ring-2 focus:ring-emerald-500"
                  />
                  <button 
                    onClick={() => handleTrackOrder()}
                    disabled={isSearchingOrder}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow transition flex items-center gap-1.5"
                  >
                    <Search className="w-4 h-4" />
                    {isSearchingOrder ? 'Searching...' : 'Track'}
                  </button>
                </div>
                <div className="mt-2 text-[11px] text-slate-500">
                  <span>Enter the 8-digit tracking number received after checkout or via your order confirmation.</span>
                </div>
              </div>

              {/* Display Searched or Last Placed Order */}
              {(() => {
                const orderToShow = searchedOrder || lastPlacedOrder;
                if (!orderToShow) {
                  return (
                    <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl p-6">
                      <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                      <p className="text-sm font-bold text-slate-800">No Order Selected</p>
                      <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                        Please enter your 8-digit tracking number above to see live dispatch updates and status.
                      </p>
                    </div>
                  );
                }

                return (
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-slate-100">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-400">8-Digit Tracking #:</span>
                          <span className="font-mono font-black text-base text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-lg">
                            {orderToShow.trackingNumber}
                          </span>
                          <button 
                            onClick={() => { navigator.clipboard.writeText(orderToShow.trackingNumber); showToast('Tracking Number copied!'); }}
                            className="text-xs text-slate-500 hover:text-emerald-600 underline"
                          >
                            Copy
                          </button>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">Placed on: {new Date(orderToShow.createdAt).toLocaleString()} | {orderToShow.orderNumber}</p>
                      </div>

                      <div className="flex flex-wrap gap-2 items-center">
                        <span className="bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold px-3 py-1 rounded-full">
                          {orderToShow.orderStatus}
                        </span>
                        <span className="bg-slate-100 text-slate-700 text-xs font-mono px-2.5 py-1 rounded-lg">
                          TID: {orderToShow.transactionReference}
                        </span>
                      </div>
                    </div>

                    {/* Progress Steps */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <p className="text-xs font-bold text-slate-700 mb-3">Delivery Progress Steps:</p>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                        <div className={`p-2 rounded-lg font-bold ${orderToShow.orderStatus !== 'Cancelled' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-500'}`}>
                          1. Placed & TID Verified
                        </div>
                        <div className={`p-2 rounded-lg font-bold ${['Confirmed', 'Processing', 'Ready to Ship', 'Shipped', 'Out for Delivery', 'Delivered'].includes(orderToShow.orderStatus) ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-400'}`}>
                          2. Confirmed
                        </div>
                        <div className={`p-2 rounded-lg font-bold ${['Ready to Ship', 'Shipped', 'Out for Delivery', 'Delivered'].includes(orderToShow.orderStatus) ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-400'}`}>
                          3. Dispatched
                        </div>
                        <div className={`p-2 rounded-lg font-bold ${orderToShow.orderStatus === 'Delivered' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-400'}`}>
                          4. Delivered
                        </div>
                      </div>
                    </div>

                    {/* Automated Email Service Receipt Bar */}
                    <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md border border-blue-500/20">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-blue-500/20 flex items-center justify-center border border-blue-400/30 text-blue-300 shrink-0">
                          <Mail className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold flex items-center gap-2">
                            <span>Automated Receipt Email:</span>
                            <span className="font-mono text-emerald-300 font-bold bg-white/10 px-2 py-0.5 rounded text-[11px]">
                              {orderToShow.email || 'customer@example.com'}
                            </span>
                            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded border border-emerald-500/30">
                              Simulated Dispatched
                            </span>
                          </p>
                          <p className="text-[11px] text-slate-300 mt-0.5">
                            Automated purchase invoice & 8-digit tracking sent via simulated mail dispatcher.
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedEmailOrder(orderToShow);
                            setIsEmailReceiptModalOpen(true);
                          }}
                          className="flex-1 sm:flex-initial bg-blue-600 hover:bg-blue-500 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition flex items-center justify-center gap-1.5 shadow"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Email Receipt</span>
                        </button>
                        <button
                          type="button"
                          disabled={isSendingEmail}
                          onClick={() => handleResendEmail(orderToShow, orderToShow.email)}
                          className="flex-1 sm:flex-initial bg-white/10 hover:bg-white/20 text-white font-medium px-3 py-1.5 rounded-lg text-xs transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${isSendingEmail ? 'animate-spin' : ''}`} />
                          <span>{isSendingEmail ? 'Sending...' : 'Resend'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Delivery & Customer Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <div>
                        <p className="text-slate-400">Customer</p>
                        <p className="font-bold text-slate-800">{orderToShow.customerName}</p>
                        <p className="text-slate-600">{orderToShow.mobileNumber}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Shipping Address</p>
                        <p className="font-bold text-slate-800">{orderToShow.city}, {orderToShow.province}</p>
                        <p className="text-slate-600">{orderToShow.address}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Payment & Transaction ID</p>
                        <p className="font-bold uppercase text-slate-800">{orderToShow.paymentMethod}</p>
                        <p className="text-emerald-700 font-mono font-bold">TID: {orderToShow.transactionReference}</p>
                        <p className="font-bold text-slate-900 mt-1">Total: PKR {orderToShow.totalAmount.toLocaleString()}</p>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div>
                      <p className="text-xs font-bold text-slate-700 mb-2">Package Items ({orderToShow.items.length}):</p>
                      <div className="space-y-2">
                        {orderToShow.items.map((item, i) => (
                          <div key={i} className="flex items-center gap-3 text-xs bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                            <img src={item.image} alt="" className="w-12 h-12 rounded-lg object-cover bg-white" />
                            <div className="flex-1">
                              <p className="font-bold text-slate-800">{item.productName}</p>
                              <p className="text-slate-400">{item.variantName ? `Variant: ${item.variantName} | ` : ''}SKU: {item.sku}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-slate-800">PKR {item.unitPrice.toLocaleString()} x {item.quantity}</p>
                              <p className="font-black text-emerald-700">PKR {item.total.toLocaleString()}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Status History Timeline */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <p className="text-xs font-bold text-slate-700 mb-2">Official Timeline Updates:</p>
                      <div className="space-y-2">
                        {orderToShow.statusHistory.map((h, i) => (
                          <div key={i} className="flex items-center gap-2 text-xs text-slate-600">
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="font-bold text-slate-800">{h.status}</span>
                            <span className="text-slate-400 text-[10px]">({new Date(h.timestamp).toLocaleTimeString()})</span>
                            <span className="text-slate-500 italic">- {h.note}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* VIEW: CUSTOMER SUPPORT */}
          {currentView === 'support' && (
            <div className="max-w-3xl mx-auto px-4 py-8">
              {/* Back Button & Breadcrumbs */}
              <div className="flex items-center gap-3 mb-6">
                <button
                  type="button"
                  onClick={() => handleBackNavigation('/')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Link to="/" className="hover:text-emerald-700 font-medium">Home</Link>
                  <span>/</span>
                  <span className="font-semibold text-slate-800">Customer Support</span>
                </div>
              </div>

              <h2 className="text-2xl font-black text-slate-900 mb-2">ATAL Store Customer Support</h2>
              <p className="text-xs text-slate-500 mb-6">We are available 24/7 to assist you with your orders and deliveries across Pakistan.</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                <a 
                  href="https://wa.me/923719150297" 
                  target="_blank" 
                  rel="noreferrer"
                  className="bg-emerald-600 hover:bg-emerald-700 text-white p-6 rounded-2xl flex items-center gap-4 shadow-lg transition"
                >
                  <MessageCircle className="w-8 h-8" />
                  <div>
                    <h4 className="font-bold text-sm">WhatsApp Live Support</h4>
                    <p className="text-xs text-emerald-100">+92 371 9150297</p>
                  </div>
                </a>
                <a 
                  href="mailto:contact.to.atal@gmail.com"
                  className="bg-slate-900 hover:bg-slate-800 text-white p-6 rounded-2xl flex items-center gap-4 shadow-lg transition"
                >
                  <Mail className="w-8 h-8 text-emerald-400" />
                  <div>
                    <h4 className="font-bold text-sm">Official Email Support</h4>
                    <p className="text-xs text-slate-300">contact.to.atal@gmail.com</p>
                  </div>
                </a>
              </div>

              {/* Official Social Media Channels */}
              <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-sky-50 border border-emerald-200 rounded-2xl p-4 mb-8">
                <p className="text-xs font-black uppercase tracking-wider text-emerald-950 mb-3 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>Connect With ATAL Official Channels</span>
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <a 
                    href="https://www.instagram.com/atal.pakistan?stkn=dXM2NTl0bHBzZ21n" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] text-white p-3 rounded-xl shadow-xs hover:opacity-90 transition font-bold text-xs"
                  >
                    <Instagram className="w-5 h-5 shrink-0" />
                    <div className="min-w-0">
                      <p className="font-bold text-xs">Instagram</p>
                      <p className="text-[10px] text-white/90 truncate">@atal.pakistan</p>
                    </div>
                  </a>
                  <a 
                    href="https://www.tiktok.com/@atal.pakistan" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 bg-black text-white p-3 rounded-xl shadow-xs hover:bg-neutral-800 transition font-bold text-xs"
                  >
                    <svg className="w-5 h-5 fill-current shrink-0" viewBox="0 0 24 24">
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.81 4.46 6.27 6.27 0 0 0 1.93-4.46V8.71a8.18 8.18 0 0 0 4.85 1.57v-3.59a4.85 4.85 0 0 1-1-.002Z"/>
                    </svg>
                    <div className="min-w-0">
                      <p className="font-bold text-xs">TikTok</p>
                      <p className="text-[10px] text-slate-300 truncate">@atal.pakistan</p>
                    </div>
                  </a>
                  <a 
                    href="https://www.facebook.com/share/1DgG52novy/" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 bg-[#1877F2] text-white p-3 rounded-xl shadow-xs hover:bg-[#166fe5] transition font-bold text-xs"
                  >
                    <Facebook className="w-5 h-5 shrink-0" />
                    <div className="min-w-0">
                      <p className="font-bold text-xs">Facebook Page</p>
                      <p className="text-[10px] text-blue-100 truncate">ATAL Pakistan</p>
                    </div>
                  </a>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-6">
                <h3 className="font-bold text-sm text-slate-900 mb-4">Frequently Asked Questions</h3>
                <div className="space-y-4 text-xs">
                  <div>
                    <p className="font-bold text-slate-800 mb-1">Q: What are the shipping charges in Pakistan?</p>
                    <p className="text-slate-600">A: Standard delivery is PKR 290 nationwide. Enjoy FREE delivery on all orders above PKR 9,999!</p>
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 mb-1">Q: How do JazzCash & Easypaisa payments work?</p>
                    <p className="text-slate-600">A: You can pay securely via USSD prompt, QR code scan, or mobile account transfer during checkout.</p>
                  </div>
                  <div>
                    <p className="font-bold text-slate-800 mb-1">Q: What is your return and refund policy?</p>
                    <p className="text-slate-600">A: We offer a 7-day hassle-free return and exchange policy for unused items in original packaging.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* VIEW: CUSTOMER ACCOUNT (EMAIL, WHATSAPP NUMBER, PASSWORD) */}
          {/* ======================================================== */}
          {currentView === 'account' && (
            <div className="max-w-4xl mx-auto px-4 py-8">
              {/* Back Button & Breadcrumbs */}
              <div className="flex items-center gap-3 mb-6">
                <button
                  type="button"
                  onClick={() => handleBackNavigation('/')}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <Link to="/" className="hover:text-emerald-700 font-medium">Home</Link>
                  <span>/</span>
                  <span className="font-semibold text-slate-800">
                    {currentCustomer ? 'Customer Account' : (authMode === 'login' ? 'Customer Sign In' : 'Create Account')}
                  </span>
                </div>
              </div>

              {!currentCustomer ? (
                /* AUTH VIEW (REGISTER & LOGIN) */
                <div className="max-w-lg mx-auto bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden">
                  {/* Brand Header */}
                  <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 p-6 text-white text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />
                    <div className="w-14 h-14 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-3 border border-white/20 shadow-md">
                      <User className="w-7 h-7 text-amber-300" />
                    </div>
                    <h2 className="text-xl font-black tracking-tight">ATAL Customer Portal</h2>
                    <p className="text-xs text-emerald-100 mt-1 max-w-sm mx-auto leading-relaxed">
                      Create an account or sign in with your <strong>Email</strong>, <strong>WhatsApp Number</strong>, and <strong>Password</strong> to track your parcels and enjoy rapid checkout across Pakistan.
                    </p>
                  </div>

                  {/* Tabs: Create Account vs Sign In */}
                  <div className="flex border-b border-slate-200 bg-slate-50">
                    <button
                      type="button"
                      onClick={() => setAuthMode('register')}
                      className={`flex-1 py-3 text-xs font-bold transition text-center border-b-2 flex items-center justify-center gap-1.5 ${
                        authMode === 'register'
                          ? 'border-emerald-600 text-emerald-800 bg-white shadow-xs'
                          : 'border-transparent text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Create Account</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setAuthMode('login')}
                      className={`flex-1 py-3 text-xs font-bold transition text-center border-b-2 flex items-center justify-center gap-1.5 ${
                        authMode === 'login'
                          ? 'border-emerald-600 text-emerald-800 bg-white shadow-xs'
                          : 'border-transparent text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Customer Sign In</span>
                    </button>
                  </div>

                  <div className="p-6">
                    {/* REGISTER TAB */}
                    {authMode === 'register' ? (
                      <form onSubmit={handleRegister} className="space-y-4 text-xs">
                        <div>
                          <label className="font-bold text-slate-800 block mb-1">Full Name *</label>
                          <div className="relative">
                            <input
                              type="text"
                              required
                              placeholder="e.g. Muhammad Ali"
                              value={registerForm.name}
                              onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                              className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition"
                            />
                            <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                          </div>
                        </div>

                        <div>
                          <label className="font-bold text-slate-800 block mb-1">Email Address *</label>
                          <div className="relative">
                            <input
                              type="email"
                              required
                              placeholder="e.g. ali.customer@example.com"
                              value={registerForm.email}
                              onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                              className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition"
                            />
                            <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                          </div>
                          <p className="text-[10.5px] text-slate-400 mt-1">We'll send order receipts and invoices to this email.</p>
                        </div>

                        <div>
                          <label className="font-bold text-slate-800 block mb-1">
                            WhatsApp Mobile Number *
                          </label>
                          <div className="relative">
                            <input
                              type="tel"
                              required
                              placeholder="03XXXXXXXXX (e.g. 03001234567)"
                              value={registerForm.whatsapp}
                              onChange={(e) => setRegisterForm({ ...registerForm, whatsapp: e.target.value })}
                              className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 text-xs font-mono focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition"
                            />
                            <MessageCircle className="w-4 h-4 text-emerald-600 absolute left-3 top-2.5" />
                          </div>
                          <p className="text-[10.5px] text-slate-500 mt-1 flex items-center gap-1">
                            <span>🇵🇰</span> 11-digit Pakistani WhatsApp number. You can also sign in using this number!
                          </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="font-bold text-slate-800 block mb-1">Password *</label>
                            <div className="relative">
                              <input
                                type={showRegPassword ? 'text' : 'password'}
                                required
                                minLength={6}
                                placeholder="Min. 6 characters"
                                value={registerForm.password}
                                onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-8 pr-8 py-2.5 text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition"
                              />
                              <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
                              <button
                                type="button"
                                onClick={() => setShowRegPassword(!showRegPassword)}
                                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-700"
                              >
                                {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>
                          <div>
                            <label className="font-bold text-slate-800 block mb-1">Confirm Password *</label>
                            <div className="relative">
                              <input
                                type={showRegConfirmPassword ? 'text' : 'password'}
                                required
                                minLength={6}
                                placeholder="Re-type password"
                                value={registerForm.confirmPassword}
                                onChange={(e) => setRegisterForm({ ...registerForm, confirmPassword: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-8 pr-8 py-2.5 text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition"
                              />
                              <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
                              <button
                                type="button"
                                onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
                                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-700"
                              >
                                {showRegConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Optional Delivery Address */}
                        <div className="pt-3 border-t border-slate-200">
                          <label className="font-bold text-slate-700 block mb-1">
                            Default Delivery City & Address (Optional)
                          </label>
                          <div className="grid grid-cols-2 gap-2 mb-2">
                            <select
                              value={registerForm.province}
                              onChange={(e) => setRegisterForm({ ...registerForm, province: e.target.value })}
                              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-xs"
                            >
                              {PAKISTAN_PROVINCES.map(p => (
                                <option key={p} value={p}>{p}</option>
                              ))}
                            </select>
                            <input
                              type="text"
                              placeholder="City (e.g. Lahore, Karachi)"
                              value={registerForm.city}
                              onChange={(e) => setRegisterForm({ ...registerForm, city: e.target.value })}
                              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-xs"
                            />
                          </div>
                          <input
                            type="text"
                            placeholder="Complete delivery address (House #, Street, Colony)"
                            value={registerForm.address}
                            onChange={(e) => setRegisterForm({ ...registerForm, address: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-xs"
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={isRegistering}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl shadow-lg transition flex items-center justify-center gap-2 text-xs mt-2 disabled:opacity-50"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>{isRegistering ? 'Creating Account...' : 'Create Customer Account'}</span>
                        </button>

                        <p className="text-center text-slate-500 text-[11px] pt-1">
                          Already have an account?{' '}
                          <button
                            type="button"
                            onClick={() => setAuthMode('login')}
                            className="font-bold text-emerald-700 hover:underline"
                          >
                            Sign In here
                          </button>
                        </p>
                      </form>
                    ) : (
                      /* LOGIN TAB */
                      <form onSubmit={handleLogin} className="space-y-4 text-xs">
                        <div>
                          <label className="font-bold text-slate-800 block mb-1">
                            Email Address OR WhatsApp Number *
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              required
                              placeholder="Enter email or WhatsApp (e.g. 03001234567)"
                              value={loginForm.identifier}
                              onChange={(e) => setLoginForm({ ...loginForm, identifier: e.target.value })}
                              className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition"
                            />
                            <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                          </div>
                          <p className="text-[10.5px] text-slate-500 mt-1">
                            You can log in with either your registered email or your 11-digit WhatsApp number.
                          </p>
                        </div>

                        <div>
                          <label className="font-bold text-slate-800 block mb-1">Password *</label>
                          <div className="relative">
                            <input
                              type={showLoginPassword ? 'text' : 'password'}
                              required
                              placeholder="Enter your password"
                              value={loginForm.password}
                              onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                              className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-9 py-2.5 text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition"
                            />
                            <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                            <button
                              type="button"
                              onClick={() => setShowLoginPassword(!showLoginPassword)}
                              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700"
                            >
                              {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={isLoggingIn}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl shadow-lg transition flex items-center justify-center gap-2 text-xs disabled:opacity-50"
                        >
                          <Lock className="w-4 h-4" />
                          <span>{isLoggingIn ? 'Signing In...' : 'Sign In to ATAL'}</span>
                        </button>

                        <p className="text-center text-slate-500 text-[11px] pt-1">
                          Don't have an account yet?{' '}
                          <button
                            type="button"
                            onClick={() => setAuthMode('register')}
                            className="font-bold text-emerald-700 hover:underline"
                          >
                            Create an account
                          </button>
                        </p>
                      </form>
                    )}
                  </div>
                </div>
              ) : (
                /* LOGGED IN CUSTOMER DASHBOARD */
                <div>
                  {/* Customer Banner Card */}
                  <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl mb-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />

                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative z-10">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-amber-400 text-slate-950 font-black text-2xl flex items-center justify-center shadow-lg border-2 border-white/20">
                          {currentCustomer.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h2 className="text-xl font-black text-white">{currentCustomer.name}</h2>
                            <span className="bg-emerald-500/30 text-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-400/30">
                              Verified Member
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-emerald-100">
                            <span className="flex items-center gap-1 bg-white/10 px-2.5 py-0.5 rounded-lg backdrop-blur-xs font-mono">
                              <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                              WhatsApp: {currentCustomer.whatsapp}
                            </span>
                            <span className="flex items-center gap-1 bg-white/10 px-2.5 py-0.5 rounded-lg backdrop-blur-xs">
                              <Mail className="w-3.5 h-3.5 text-emerald-400" />
                              {currentCustomer.email}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <button
                          onClick={() => setCurrentView('products')}
                          className="flex-1 sm:flex-initial bg-amber-400 hover:bg-amber-500 text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs transition shadow"
                        >
                          Shop Now
                        </button>
                        <button
                          onClick={handleLogout}
                          className="flex-1 sm:flex-initial bg-white/15 hover:bg-white/25 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition flex items-center justify-center gap-1.5"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>

                    {/* Stats Strip */}
                    <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-white/15 text-center">
                      <div className="bg-white/10 rounded-xl p-2.5 backdrop-blur-xs">
                        <p className="text-[10px] uppercase font-bold text-emerald-200">Total Orders</p>
                        <p className="text-lg font-black text-white mt-0.5">{(Array.isArray(customerOrders) ? customerOrders : []).length}</p>
                      </div>
                      <div className="bg-white/10 rounded-xl p-2.5 backdrop-blur-xs">
                        <p className="text-[10px] uppercase font-bold text-emerald-200">Active Parcels</p>
                        <p className="text-lg font-black text-amber-300 mt-0.5">
                          {(Array.isArray(customerOrders) ? customerOrders : []).filter(o => o && !['Delivered', 'Cancelled'].includes(o.orderStatus || '')).length}
                        </p>
                      </div>
                      <div className="bg-white/10 rounded-xl p-2.5 backdrop-blur-xs">
                        <p className="text-[10px] uppercase font-bold text-emerald-200">Delivery City</p>
                        <p className="text-sm font-bold text-white mt-1 truncate">
                          {currentCustomer.defaultAddress?.city || 'Not set'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Dashboard Sub Navigation Tabs */}
                  <div className="flex gap-2 mb-6 border-b border-slate-200 pb-2 overflow-x-auto no-scrollbar">
                    <button
                      onClick={() => setAccountActiveTab('orders')}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
                        accountActiveTab === 'orders'
                          ? 'bg-emerald-600 text-white shadow-md'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <Package className="w-4 h-4" />
                      <span>My Orders ({(Array.isArray(customerOrders) ? customerOrders : []).length})</span>
                    </button>
                    <button
                      onClick={() => setAccountActiveTab('profile')}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
                        accountActiveTab === 'profile'
                          ? 'bg-emerald-600 text-white shadow-md'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <User className="w-4 h-4" />
                      <span>Profile & Password</span>
                    </button>
                    <button
                      onClick={() => setAccountActiveTab('address')}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 ${
                        accountActiveTab === 'address'
                          ? 'bg-emerald-600 text-white shadow-md'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <MapPin className="w-4 h-4" />
                      <span>Saved Delivery Address</span>
                    </button>
                  </div>

                  {/* TAB 1: MY ORDERS */}
                  {accountActiveTab === 'orders' && (
                    <div className="space-y-4">
                      {isLoadingCustomerOrders ? (
                        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400 text-xs">
                          Loading your orders...
                        </div>
                      ) : (Array.isArray(customerOrders) ? customerOrders : []).length === 0 ? (
                        <div className="bg-white border border-slate-200 rounded-3xl p-10 text-center shadow-xs">
                          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                            <ShoppingBag className="w-8 h-8" />
                          </div>
                          <h3 className="font-bold text-base text-slate-900 mb-1">No orders yet</h3>
                          <p className="text-xs text-slate-500 mb-4 max-w-sm mx-auto">
                            When you place an order on ATAL, it will appear here with live 8-digit tracking, payment verification (TID), and real-time dispatch status.
                          </p>
                          <button
                            onClick={() => setCurrentView('products')}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-sm transition"
                          >
                            Browse Products & Deals
                          </button>
                        </div>
                      ) : (
                        (Array.isArray(customerOrders) ? customerOrders : []).map(ord => (
                          <div key={ord.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:shadow-md transition">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-100">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-mono font-bold text-xs text-slate-900">{ord.orderNumber}</span>
                                  <span className="text-[10px] text-slate-400">
                                    • {new Date(ord.createdAt).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' })}
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5 mt-1">
                                  <span className="text-[11px] font-black text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md font-mono">
                                    8-Digit Tracking: {ord.trackingNumber}
                                  </span>
                                  <button
                                    onClick={() => {
                                      navigator.clipboard.writeText(ord.trackingNumber);
                                      showToast('Tracking number copied!');
                                    }}
                                    className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-700"
                                    title="Copy Tracking Number"
                                  >
                                    <Copy className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                                  ord.orderStatus === 'Delivered'
                                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                    : ord.orderStatus === 'Out for Delivery'
                                    ? 'bg-blue-100 text-blue-800 border-blue-300'
                                    : 'bg-amber-100 text-amber-900 border-amber-300'
                                }`}>
                                  {ord.orderStatus}
                                </span>
                              </div>
                            </div>

                            {/* Items List */}
                            <div className="py-3 space-y-2 border-b border-slate-100">
                              {ord.items.map((item, iIdx) => (
                                <div key={iIdx} className="flex items-center justify-between text-xs">
                                  <div className="flex items-center gap-2.5">
                                    <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 shrink-0">
                                      <img src={item.image} alt={item.productName} className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                      <p className="font-bold text-slate-800 line-clamp-1">{item.productName}</p>
                                      <p className="text-[11px] text-slate-400">Qty: {item.quantity} × PKR {item.unitPrice.toLocaleString()}</p>
                                    </div>
                                  </div>
                                  <span className="font-bold text-slate-900 shrink-0">PKR {item.total.toLocaleString()}</span>
                                </div>
                              ))}
                            </div>

                            {/* Footer / Actions */}
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-3 text-xs">
                              <div className="flex items-center gap-3">
                                <div>
                                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Payment Method</span>
                                  <span className="font-bold text-slate-800 uppercase">{ord.paymentMethod}</span>
                                </div>
                                <div>
                                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Transaction ID (TID)</span>
                                  <span className="font-mono font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
                                    {ord.transactionReference || ord.transactionId || 'N/A'}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Total Amount</span>
                                  <span className="font-black text-emerald-700 text-sm">PKR {ord.totalAmount.toLocaleString()}</span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 w-full sm:w-auto">
                                <button
                                  onClick={() => {
                                    setTrackingSearchQuery(ord.trackingNumber);
                                    setSearchedOrder(ord);
                                    setCurrentView('orders');
                                  }}
                                  className="flex-1 sm:flex-initial bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-2 rounded-xl transition flex items-center justify-center gap-1.5 shadow-xs"
                                >
                                  <Truck className="w-3.5 h-3.5" />
                                  <span>Track Live</span>
                                </button>
                                <button
                                  onClick={() => {
                                    setSelectedEmailOrder(ord);
                                    setIsEmailReceiptModalOpen(true);
                                  }}
                                  className="flex-1 sm:flex-initial bg-blue-50 hover:bg-blue-100 text-blue-800 font-bold px-3 py-2 rounded-xl transition flex items-center justify-center gap-1.5 border border-blue-200"
                                  title="View Automated Receipt Email"
                                >
                                  <Mail className="w-3.5 h-3.5 text-blue-600" />
                                  <span>Receipt Email</span>
                                </button>
                                <a
                                  href={`https://wa.me/923719150297?text=${encodeURIComponent(`Assalam-o-Alaikum ATAL Support, I am ${currentCustomer.name}. I need assistance regarding my order with 8-digit tracking #${ord.trackingNumber}.`)}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="flex-1 sm:flex-initial bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold px-3 py-2 rounded-xl transition flex items-center justify-center gap-1.5 border border-emerald-200"
                                >
                                  <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>Support</span>
                                </a>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {/* TAB 2: PROFILE & PASSWORD */}
                  {accountActiveTab === 'profile' && (
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                      <h3 className="font-bold text-sm text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                        <User className="w-4 h-4 text-emerald-600" />
                        <span>Update Personal Information</span>
                      </h3>

                      <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs max-w-lg">
                        <div>
                          <label className="font-bold text-slate-700 block mb-1">Full Name</label>
                          <input
                            type="text"
                            required
                            value={profileForm.name}
                            onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs"
                          />
                        </div>

                        <div>
                          <label className="font-bold text-slate-700 block mb-1">Email Address</label>
                          <input
                            type="email"
                            required
                            value={profileForm.email}
                            onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs"
                          />
                        </div>

                        <div>
                          <label className="font-bold text-slate-700 block mb-1">WhatsApp Mobile Number</label>
                          <input
                            type="tel"
                            required
                            value={profileForm.whatsapp}
                            onChange={(e) => setProfileForm({ ...profileForm, whatsapp: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-mono"
                          />
                          <p className="text-[10.5px] text-slate-400 mt-1">Pakistani WhatsApp number (e.g. 03001234567)</p>
                        </div>

                        <div className="pt-3 border-t border-slate-200">
                          <h4 className="font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                            <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                            <span>Change Password (Optional)</span>
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="text-slate-600 block mb-1">Current Password</label>
                              <input
                                type="password"
                                placeholder="Leave blank to keep same"
                                value={profileForm.currentPassword}
                                onChange={(e) => setProfileForm({ ...profileForm, currentPassword: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs"
                              />
                            </div>
                            <div>
                              <label className="text-slate-600 block mb-1">New Password</label>
                              <input
                                type="password"
                                minLength={6}
                                placeholder="Min. 6 characters"
                                value={profileForm.newPassword}
                                onChange={(e) => setProfileForm({ ...profileForm, newPassword: e.target.value })}
                                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs"
                              />
                            </div>
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={isSavingProfile}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2.5 rounded-xl shadow transition text-xs disabled:opacity-50"
                        >
                          {isSavingProfile ? 'Saving...' : 'Save Profile Changes'}
                        </button>
                      </form>
                    </div>
                  )}

                  {/* TAB 3: SAVED DELIVERY ADDRESS */}
                  {accountActiveTab === 'address' && (
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                      <h3 className="font-bold text-sm text-slate-900 mb-2 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-emerald-600" />
                        <span>Saved Delivery Address</span>
                      </h3>
                      <p className="text-xs text-slate-500 mb-4">
                        Your default shipping address will be automatically filled whenever you proceed to checkout for 1-click orders.
                      </p>

                      <form onSubmit={handleUpdateProfile} className="space-y-4 text-xs max-w-lg">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="font-bold text-slate-700 block mb-1">Province / Territory *</label>
                            <select
                              value={profileForm.province}
                              onChange={(e) => setProfileForm({ ...profileForm, province: e.target.value })}
                              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs"
                            >
                              {PAKISTAN_PROVINCES.map(prov => (
                                <option key={prov} value={prov}>{prov}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="font-bold text-slate-700 block mb-1">City *</label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. Lahore, Karachi, Islamabad"
                              value={profileForm.city}
                              onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="font-bold text-slate-700 block mb-1">Area / Sector / Locality</label>
                          <input
                            type="text"
                            placeholder="e.g. Gulberg III, DHA Phase 5, F-7/2"
                            value={profileForm.area}
                            onChange={(e) => setProfileForm({ ...profileForm, area: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs"
                          />
                        </div>

                        <div>
                          <label className="font-bold text-slate-700 block mb-1">Complete Street Address *</label>
                          <textarea
                            rows={3}
                            required
                            placeholder="House number, Street number, Nearest Landmark..."
                            value={profileForm.address}
                            onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                            className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs"
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={isSavingProfile}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2.5 rounded-xl shadow transition text-xs disabled:opacity-50"
                        >
                          {isSavingProfile ? 'Saving...' : 'Save Default Delivery Address'}
                        </button>
                      </form>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* VIEW: ADMIN DASHBOARD */}
          {currentView === 'admin' && (
            <div className="max-w-7xl mx-auto px-4 py-6">
              {!isAdminAuthenticated ? (
                <div className="max-w-md mx-auto bg-white border border-slate-200 rounded-3xl p-8 shadow-2xl mt-10 text-left">
                  <div className="w-16 h-16 bg-gradient-to-br from-slate-900 to-emerald-950 text-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg border border-white/20">
                    <ShieldCheck className="w-8 h-8 text-emerald-400" />
                  </div>
                  <h3 className="font-black text-xl text-slate-900 text-center mb-1">ATAL Admin & Employee Portal</h3>
                  <p className="text-xs text-slate-500 text-center mb-4">
                    Authorized store administration and employee operations login only.
                  </p>



                  <form onSubmit={handleStaffLogin} className="space-y-4 text-xs">
                    <div>
                      <label className="font-bold text-slate-800 block mb-1">Email ID / User ID *</label>
                      <div className="relative">
                        <input 
                          type="email" 
                          required
                          placeholder="Enter authorized email ID / User ID"
                          value={adminLoginForm.email}
                          onChange={(e) => setAdminLoginForm({ ...adminLoginForm, email: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-3 py-2.5 text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition"
                        />
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      </div>
                    </div>

                    <div>
                      <label className="font-bold text-slate-800 block mb-1">Password *</label>
                      <div className="relative">
                        <input 
                          type={showAdminPassword ? 'text' : 'password'}
                          required
                          placeholder="Enter your password"
                          value={adminLoginForm.password}
                          onChange={(e) => setAdminLoginForm({ ...adminLoginForm, password: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-9 pr-9 py-2.5 text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition"
                        />
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                        <button
                          type="button"
                          onClick={() => setShowAdminPassword(!showAdminPassword)}
                          className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700"
                        >
                          {showAdminPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <button 
                      type="submit"
                      disabled={isStaffLoggingIn}
                      className="w-full bg-slate-900 hover:bg-emerald-600 text-white font-bold py-3 rounded-xl text-xs transition shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <Lock className="w-4 h-4" />
                      <span>{isStaffLoggingIn ? 'Verifying Credentials...' : 'Sign In to Portal'}</span>
                    </button>

                    <div className="text-center pt-2">
                      <button
                        type="button"
                        onClick={() => handleBackNavigation('/')}
                        className="text-slate-500 hover:text-slate-800 text-xs font-medium cursor-pointer"
                      >
                        ← Back to ATAL Store
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                <div>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-slate-200">
                    <div>
                      <div className="flex items-center gap-3">
                        <h2 className="text-xl font-black text-slate-900">ATAL Store Portal Dashboard</h2>
                        {adminAuthUser?.role === 'admin' ? (
                          <span className="bg-purple-100 text-purple-900 border border-purple-300 px-2.5 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5 text-purple-700" />
                            Admin ({adminAuthUser.name})
                          </span>
                        ) : (
                          <span className="bg-blue-100 text-blue-900 border border-blue-300 px-2.5 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1">
                            <User className="w-3.5 h-3.5 text-blue-700" />
                            Employee ({adminAuthUser?.name})
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Logged in as: <strong className="text-slate-800 font-mono">Authorized Staff Session</strong> • Operations & Catalog Management
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button 
                        type="button"
                        onClick={() => handleBackNavigation('/')}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-800 px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                        title="Return to Customer Storefront"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span>Storefront</span>
                      </button>

                      <button 
                        onClick={() => setIsStaffPasswordModalOpen(true)}
                        className="bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
                        title="Change Account Password"
                      >
                        <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                        <span>Change Password</span>
                      </button>

                      <button 
                        onClick={handleStaffLogout}
                        className="bg-red-50 hover:bg-red-100 text-red-600 px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Logout</span>
                      </button>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  {adminStats && typeof adminStats === 'object' && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-8">
                      <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
                        <p className="text-xs text-slate-400 mb-1">Total Sales</p>
                        <p className="text-xl font-black text-emerald-700">PKR {(Number(adminStats.totalSales) || 0).toLocaleString()}</p>
                      </div>
                      <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
                        <p className="text-xs text-slate-400 mb-1">Total Orders</p>
                        <p className="text-xl font-black text-slate-900">{adminStats.totalOrders || 0}</p>
                      </div>
                      <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
                        <p className="text-xs text-slate-400 mb-1">Registered Customers</p>
                        <p className="text-xl font-black text-teal-700">{adminStats.totalCustomers || 0}</p>
                      </div>
                      <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
                        <p className="text-xs text-slate-400 mb-1">Pending Orders</p>
                        <p className="text-xl font-black text-amber-600">{adminStats.pendingOrders || 0}</p>
                      </div>
                      <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
                        <p className="text-xs text-slate-400 mb-1">Low Stock Alerts</p>
                        <p className="text-xl font-black text-red-600">{adminStats.lowStockProducts || 0}</p>
                      </div>
                    </div>
                  )}

                  {/* Admin Navigation Tabs */}
                  <div className="flex flex-wrap gap-3 mb-6 border-b border-slate-200 pb-2">
                    <button 
                      onClick={() => setAdminActiveTab('orders')}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition ${adminActiveTab === 'orders' ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                    >
                      Orders Management ({(adminOrders || []).length})
                    </button>
                    <button 
                      onClick={() => setAdminActiveTab('products')}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition ${adminActiveTab === 'products' ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                    >
                      Products Catalog ({products.length})
                    </button>
                    <button 
                      onClick={() => setAdminActiveTab('categories')}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition ${adminActiveTab === 'categories' ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                    >
                      Categories Management ({categories.length})
                    </button>
                    <button 
                      onClick={() => setAdminActiveTab('carousel')}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition ${adminActiveTab === 'carousel' ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                    >
                      Hero Carousel Slides ({carouselSlides.length})
                    </button>
                    <button 
                      onClick={() => setAdminActiveTab('settings')}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition ${adminActiveTab === 'settings' ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                    >
                      Store Settings & Delivery Fee
                    </button>
                    <button 
                      onClick={() => setAdminActiveTab('staff')}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition ${adminActiveTab === 'staff' ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                    >
                      Staff & Roles ({(staffList || []).length})
                    </button>
                    <button 
                      onClick={() => { setAdminActiveTab('data-management'); fetchBackupSnapshots(); }}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${adminActiveTab === 'data-management' || adminActiveTab === 'import-export' ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                    >
                      <Database className="w-3.5 h-3.5" />
                      <span>Data Management & Backups</span>
                    </button>
                    <button 
                      onClick={() => setAdminActiveTab('homepage-sections')}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${adminActiveTab === 'homepage-sections' ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Homepage Sections</span>
                    </button>
                  </div>

                  {/* TAB 1: ORDERS MANAGEMENT */}
                  {adminActiveTab === 'orders' && (
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-8">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5 pb-4 border-b border-slate-100">
                        <div>
                          <h3 className="font-bold text-base text-slate-900">Customer Orders & Payment Verification</h3>
                          <p className="text-xs text-slate-500">Every order receives a unique 8-digit tracking number and verified Transaction ID (TID)</p>
                        </div>
                        <button 
                          onClick={loadAdminData}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                        >
                          Refresh Orders ({adminOrders.length})
                        </button>
                      </div>

                      {/* Search and Filters */}
                      <div className="flex flex-col sm:flex-row gap-3 mb-4">
                        <div className="flex-1 relative">
                          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                          <input 
                            type="text"
                            placeholder="Search by 8-Digit Tracking #, TID, Customer, Phone, or City..."
                            value={adminOrderSearch}
                            onChange={(e) => setAdminOrderSearch(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs focus:ring-2 focus:ring-emerald-500 font-medium"
                          />
                        </div>
                        <select 
                          value={adminOrderStatusFilter}
                          onChange={(e) => setAdminOrderStatusFilter(e.target.value)}
                          className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700"
                        >
                          <option value="all">All Order Statuses</option>
                          <option value="Pending Confirmation">Pending Confirmation</option>
                          <option value="Confirmed">Confirmed</option>
                          <option value="Processing">Processing</option>
                          <option value="Ready to Ship">Ready to Ship</option>
                          <option value="Shipped">Shipped</option>
                          <option value="Out for Delivery">Out for Delivery</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500">
                              <th className="p-3">8-Digit Tracking #</th>
                              <th className="p-3">Transaction ID (TID)</th>
                              <th className="p-3">Customer & Contact</th>
                              <th className="p-3">City & Address</th>
                              <th className="p-3">Total (PKR)</th>
                              <th className="p-3">Status</th>
                              <th className="p-3">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {(Array.isArray(adminOrders) ? adminOrders : []).filter(ord => {
                              if (!ord) return false;
                              const status = ord.orderStatus || 'Pending Confirmation';
                              if (adminOrderStatusFilter !== 'all' && status.toLowerCase() !== adminOrderStatusFilter.toLowerCase()) return false;
                              if (adminOrderSearch.trim()) {
                                const q = adminOrderSearch.trim().toLowerCase();
                                const matchTracking = ord.trackingNumber && ord.trackingNumber.toLowerCase().includes(q);
                                const matchOrderNum = ord.orderNumber && ord.orderNumber.toLowerCase().includes(q);
                                const matchTid = (ord.transactionReference && ord.transactionReference.toLowerCase().includes(q)) || 
                                                 (ord.transactionId && ord.transactionId.toLowerCase().includes(q));
                                const matchCustomer = ord.customerName && ord.customerName.toLowerCase().includes(q);
                                const matchPhone = ord.mobileNumber && ord.mobileNumber.toLowerCase().includes(q);
                                const matchCity = ord.city && ord.city.toLowerCase().includes(q);
                                return matchTracking || matchOrderNum || matchTid || matchCustomer || matchPhone || matchCity;
                              }
                              return true;
                            }).length === 0 ? (
                              <tr>
                                <td colSpan={7} className="text-center py-10 text-slate-400">
                                  No orders match your search criteria.
                                </td>
                              </tr>
                            ) : (
                              (Array.isArray(adminOrders) ? adminOrders : []).filter(ord => {
                                if (!ord) return false;
                                const status = ord.orderStatus || 'Pending Confirmation';
                                if (adminOrderStatusFilter !== 'all' && status.toLowerCase() !== adminOrderStatusFilter.toLowerCase()) return false;
                                if (adminOrderSearch.trim()) {
                                  const q = adminOrderSearch.trim().toLowerCase();
                                  const matchTracking = ord.trackingNumber && ord.trackingNumber.toLowerCase().includes(q);
                                  const matchOrderNum = ord.orderNumber && ord.orderNumber.toLowerCase().includes(q);
                                  const matchTid = (ord.transactionReference && ord.transactionReference.toLowerCase().includes(q)) || 
                                                   (ord.transactionId && ord.transactionId.toLowerCase().includes(q));
                                  const matchCustomer = ord.customerName && ord.customerName.toLowerCase().includes(q);
                                  const matchPhone = ord.mobileNumber && ord.mobileNumber.toLowerCase().includes(q);
                                  const matchCity = ord.city && ord.city.toLowerCase().includes(q);
                                  return matchTracking || matchOrderNum || matchTid || matchCustomer || matchPhone || matchCity;
                                }
                                return true;
                              }).map(ord => (
                                <tr key={ord.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                                  {/* 8-Digit Tracking Number */}
                                  <td className="p-3">
                                    <div className="flex items-center gap-1.5">
                                      <span className="font-mono font-black text-xs text-emerald-800 bg-emerald-100 border border-emerald-300 px-2.5 py-1 rounded-lg">
                                        {ord.trackingNumber || 'N/A'}
                                      </span>
                                      <button 
                                        onClick={() => { if (ord.trackingNumber) { navigator.clipboard.writeText(ord.trackingNumber); showToast(`Copied Tracking #${ord.trackingNumber}`); } }}
                                        className="text-slate-400 hover:text-emerald-600 p-1"
                                        title="Copy 8-Digit Tracking Number"
                                      >
                                        <Copy className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                    <p className="text-[10px] text-slate-400 mt-1 font-mono">
                                      {ord.orderNumber || 'ORD'} • {ord.createdAt ? new Date(ord.createdAt).toLocaleDateString() : 'N/A'}
                                    </p>
                                  </td>

                                  {/* Transaction ID (TID) */}
                                  <td className="p-3">
                                    <div className="flex items-center gap-1.5">
                                      <span className="font-mono font-black text-xs text-amber-950 bg-amber-100 border border-amber-300 px-2 py-1 rounded-lg">
                                        {ord.transactionReference || ord.transactionId || 'N/A'}
                                      </span>
                                      <button 
                                        onClick={() => { 
                                          const val = ord.transactionReference || ord.transactionId || '';
                                          if (val) {
                                            navigator.clipboard.writeText(val); 
                                            showToast(`Copied TID: ${val}`); 
                                          }
                                        }}
                                        className="text-slate-400 hover:text-amber-600 p-1"
                                        title="Copy Payment Transaction ID"
                                      >
                                        <Copy className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                    <div className="mt-1 flex items-center gap-1">
                                      <span className="bg-slate-100 text-slate-700 font-bold px-1.5 py-0.5 rounded text-[10px] uppercase">
                                        {ord.paymentMethod || 'COD'}
                                      </span>
                                      {ord.paymentMethod === 'cod' && (
                                        <span className="bg-blue-100 text-blue-800 font-bold px-1.5 py-0.5 rounded text-[10px]">
                                          Adv PKR 290
                                        </span>
                                      )}
                                    </div>
                                  </td>

                                  {/* Customer & Phone */}
                                  <td className="p-3">
                                    <p className="font-bold text-slate-900">{ord.customerName || 'Customer'}</p>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                      <span className="text-[11px] text-slate-500 font-mono">{ord.mobileNumber || ''}</span>
                                      {ord.mobileNumber && (
                                        <a 
                                          href={`https://wa.me/92${ord.mobileNumber.replace(/^(\+92|0)/, '')}?text=${encodeURIComponent(`Assalam-o-Alaikum ${ord.customerName}, this is ATAL Store regarding your order with 8-Digit Tracking #${ord.trackingNumber} (TID: ${ord.transactionReference || ord.transactionId}).`)}`}
                                          target="_blank"
                                          rel="noreferrer"
                                          className="text-emerald-600 hover:text-emerald-700 font-bold text-[10px] flex items-center gap-0.5 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200"
                                          title="Chat with Customer on WhatsApp"
                                        >
                                          <MessageCircle className="w-3 h-3" /> WhatsApp
                                        </a>
                                      )}
                                    </div>
                                  </td>

                                  {/* City & Address */}
                                  <td className="p-3">
                                    <p className="font-bold text-slate-700">{ord.city || ''}</p>
                                    <p className="text-[10px] text-slate-400 line-clamp-1 max-w-[150px]">{ord.address || ''}</p>
                                  </td>

                                  {/* Total Amount */}
                                  <td className="p-3">
                                    <p className="font-black text-emerald-700">PKR {(ord.totalAmount || 0).toLocaleString()}</p>
                                    <p className="text-[10px] text-slate-400">{(ord.items || []).length} item(s)</p>
                                  </td>

                                  {/* Status */}
                                  <td className="p-3">
                                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold mb-1 ${
                                      ord.orderStatus === 'Delivered' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                                      ord.orderStatus === 'Cancelled' ? 'bg-red-100 text-red-800 border border-red-200' :
                                      ord.orderStatus === 'Shipped' || ord.orderStatus === 'Out for Delivery' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                                      ord.orderStatus === 'Confirmed' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                                      'bg-amber-100 text-amber-900 border border-amber-200'
                                    }`}>
                                      {ord.orderStatus}
                                    </span>
                                    <select 
                                      value={ord.orderStatus}
                                      onChange={(e) => updateOrderStatus(ord.id, e.target.value)}
                                      className="bg-slate-100 border border-slate-300 rounded p-1 text-[10px] w-full block mt-1"
                                    >
                                      <option value="Pending Confirmation">Pending Confirmation</option>
                                      <option value="Confirmed">Confirmed</option>
                                      <option value="Processing">Processing</option>
                                      <option value="Ready to Ship">Ready to Ship</option>
                                      <option value="Shipped">Shipped</option>
                                      <option value="Out for Delivery">Out for Delivery</option>
                                      <option value="Delivered">Delivered</option>
                                      <option value="Cancelled">Cancelled</option>
                                    </select>
                                  </td>

                                  {/* Actions */}
                                  <td className="p-3">
                                    <div className="flex items-center gap-1.5">
                                      <button 
                                        onClick={() => setSelectedOrderDetails(ord)}
                                        className="bg-slate-900 hover:bg-emerald-600 text-white px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition flex items-center gap-1 shadow-sm"
                                      >
                                        <Eye className="w-3.5 h-3.5" /> Details
                                      </button>
                                      <button 
                                        onClick={() => handleDeleteOrder(ord.id, ord.orderNumber)}
                                        className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition"
                                        title="Delete Order Record"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* TAB 2: PRODUCTS MANAGEMENT */}
                  {adminActiveTab === 'products' && (
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-8">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-sm text-slate-900">Product Catalog Management</h3>
                        <div className="flex items-center gap-2">
                          <button 
                            type="button"
                            onClick={handleExportProducts}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-xs cursor-pointer"
                          >
                            📤 Export Products
                          </button>
                          <label className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-xs cursor-pointer">
                            📥 Import Products
                            <input type="file" accept=".json" onChange={handleImportProducts} className="hidden" />
                          </label>
                          <button 
                              onClick={() => {
                              setEditingProductId(null);
                              setProductForm({
                                name: '',
                                description: '',
                                categoryId: categories[0]?.id || 'cat-men',
                                subcategoryId: categories[0]?.subcategories?.[0] || 'T-Shirts',
                                brand: 'ATAL',
                                price: 0,
                                originalPrice: 0,
                                stock: 20,
                                imageUrl1: '',
                                imageUrl2: '',
                                imageUrl3: '',
                                colorsString: '',
                                sizesString: '',
                                isFlashDeal: false,
                                isFeatured: true,
                                sku: '',
                                isActive: true
                              });
                              setIsProductModalOpen(true);
                            }}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow"
                          >
                            <Plus className="w-4 h-4" /> Add New Product
                          </button>
                        </div>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-slate-500">
                              <th className="p-3">Image</th>
                              <th className="p-3">Product Name</th>
                              <th className="p-3">Brand</th>
                              <th className="p-3">Price (PKR)</th>
                              <th className="p-3">Stock</th>
                              <th className="p-3">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {products.map(prod => (
                              <tr key={prod.id} className="border-b border-slate-100 hover:bg-slate-50 transition">
                                <td className="p-3">
                                  <img src={getPrimaryProductImage(prod)} alt="" className="w-12 h-12 rounded-lg object-cover bg-slate-100" />
                                </td>
                                <td className="p-3 font-bold text-slate-900">
                                  {prod.name}
                                </td>
                                <td className="p-3 font-semibold text-emerald-600">{prod.brand}</td>
                                <td className="p-3 font-bold">PKR {prod.price.toLocaleString()}</td>
                                <td className="p-3">
                                  <span className={`px-2 py-1 rounded font-bold ${prod.stock < 10 ? 'bg-red-100 text-red-600' : 'bg-emerald-100 text-emerald-800'}`}>
                                    {prod.stock} units
                                  </span>
                                </td>
                                <td className="p-3 flex items-center gap-2">
                                  <button 
                                    onClick={() => {
                                      setEditingProductId(prod.id);
                                      const existingColors = Array.from(new Set(prod.variants?.map(v => v.color).filter(Boolean))).join(', ');
                                      const existingSizes = Array.from(new Set(prod.variants?.map(v => v.size).filter(Boolean))).join(', ');
                                      setProductForm({
                                        name: prod.name,
                                        description: prod.description,
                                        categoryId: prod.categoryId,
                                        subcategoryId: prod.subcategoryId,
                                        brand: prod.brand,
                                        price: prod.price,
                                        originalPrice: prod.originalPrice || prod.price,
                                        stock: prod.stock,
                                        imageUrl1: getPrimaryProductImage(prod),
                                        imageUrl2: prod.images?.[1] || getPrimaryProductImage(prod),
                                        imageUrl3: prod.images?.[2] || getPrimaryProductImage(prod),
                                        colorsString: existingColors || 'Black, Navy Blue, Maroon, White',
                                        sizesString: existingSizes || 'S, M, L, XL',
                                        isFlashDeal: !!prod.isFlashDeal,
                                        isFeatured: !!prod.isFeatured,
                                        sku: (prod as any).sku || prod.variants?.[0]?.sku || ''
                                      });
                                      setIsProductModalOpen(true);
                                    }}
                                    className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700"
                                    title="Edit Product"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteProduct(prod.id, prod.name)}
                                    className="p-2 bg-red-50 hover:bg-red-100 rounded-lg text-red-600"
                                    title="Delete Product"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* TAB: CATEGORIES MANAGEMENT */}
                  {adminActiveTab === 'categories' && (
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-8">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5 pb-4 border-b border-slate-100">
                        <div>
                          <h3 className="font-bold text-base text-slate-900">Store Categories Management</h3>
                          <p className="text-xs text-slate-500">Edit, organize, or add new categories and subcategories shown on home and shop views</p>
                        </div>
                        <button 
                          onClick={openAddCategoryModal}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm transition"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Add New Category</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {safeCategories.map(cat => {
                          const catProductsCount = safeProducts.filter(p => p && p.categoryId === cat.id).length;
                          return (
                            <div key={cat.id} className="border border-slate-200 rounded-2xl p-4 flex flex-col justify-between hover:shadow-md transition bg-slate-50/50">
                              <div>
                                <div className="flex items-start gap-3.5 mb-3">
                                  <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-slate-200 bg-white shadow-xs">
                                    <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                      <h4 className="font-bold text-sm text-slate-900 truncate">{cat.name}</h4>
                                      <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                                        {cat.slug}
                                      </span>
                                    </div>
                                    <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">{cat.description || 'No description provided.'}</p>
                                    <div className="flex items-center gap-2 mt-2">
                                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-md">
                                        {catProductsCount} Products
                                      </span>
                                      <span className="text-[10px] bg-slate-200 text-slate-700 font-semibold px-2 py-0.5 rounded-md">
                                        {cat.subcategories?.length || 0} Subcategories
                                      </span>
                                    </div>
                                  </div>
                                </div>

                                {cat.subcategories && cat.subcategories.length > 0 && (
                                  <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-200/80 mb-3">
                                    {cat.subcategories.map((sub, sIdx) => (
                                      <span key={sIdx} className="text-[10px] bg-white border border-slate-200 text-slate-600 px-2 py-0.5 rounded-lg">
                                        {sub}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>

                              <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                                <button
                                  type="button"
                                  onClick={(e) => handleToggleCategoryStatus(cat.id, e)}
                                  className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition flex items-center gap-1.5 cursor-pointer ${cat.isActive !== false ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}`}
                                  title="Click to toggle category status"
                                >
                                  <span className={`w-2 h-2 rounded-full ${cat.isActive !== false ? 'bg-emerald-600 animate-pulse' : 'bg-slate-400'}`} />
                                  <span>{cat.isActive !== false ? 'Active' : 'Inactive'}</span>
                                </button>

                                <div className="flex items-center gap-2">
                                  <button 
                                    onClick={() => openEditCategoryModal(cat)}
                                    className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                                  >
                                    <Edit className="w-3.5 h-3.5" />
                                    <span>Edit</span>
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteCategory(cat.id)}
                                    className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>Delete</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* TAB: HERO CAROUSEL MANAGEMENT */}
                  {adminActiveTab === 'carousel' && (
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-8">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5 pb-4 border-b border-slate-100">
                        <div>
                          <h3 className="font-bold text-base text-slate-900">Hero Carousel Banners & Promotions</h3>
                          <p className="text-xs text-slate-500">Edit, add, or delete the carousel slides shown on the home page across mobile and desktop</p>
                        </div>
                        <button 
                          onClick={openAddSlideModal}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm transition"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Add New Slide</span>
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {safeCarouselSlides.map((slide, sIdx) => {
                          if (!slide) return null;
                          const targetCat = categories.find(c => c && c.id === slide?.categoryId);
                          return (
                            <div key={slide?.id || sIdx} className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-900 text-white shadow-sm flex flex-col justify-between">
                              {/* Preview Banner */}
                              <div className="relative h-48 w-full overflow-hidden bg-slate-950">
                                <img src={slide?.image || DEFAULT_PRODUCT_IMAGE} alt={slide?.title || 'Slide'} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col justify-end p-4">
                                  <div className="flex items-center gap-2 mb-1.5">
                                    <span className="bg-emerald-500 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-full uppercase">
                                      {slide?.badge || 'PROMO'}
                                    </span>
                                    <span className="text-amber-300 font-bold text-[10px]">
                                      {slide?.discount || ''}
                                    </span>
                                  </div>
                                  <h4 className="font-black text-base leading-tight text-white line-clamp-1">{slide?.title || 'Slide Title'}</h4>
                                  <p className="text-slate-300 text-xs line-clamp-1 mt-0.5">{slide?.subtitle || ''}</p>
                                </div>
                                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                                  Slide #{sIdx + 1}
                                </div>
                              </div>

                              {/* Details & Actions */}
                              <div className="p-4 bg-white text-slate-800 flex flex-col justify-between gap-3 flex-1 border-t border-slate-100">
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                  <div>
                                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Target Category</span>
                                    <span className="font-bold text-emerald-700">{targetCat ? targetCat.name : slide.categoryId}</span>
                                  </div>
                                  <div>
                                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Button CTA</span>
                                    <span className="font-bold text-slate-800">{slide.buttonText}</span>
                                  </div>
                                </div>

                                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                                  <button 
                                    onClick={() => openEditSlideModal(slide)}
                                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
                                  >
                                    <Edit className="w-3.5 h-3.5" />
                                    <span>Edit Slide</span>
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteSlide(slide.id)}
                                    className="px-3.5 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                    <span>Delete</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* TAB: STORE SETTINGS & DELIVERY FEE */}
                  {adminActiveTab === 'settings' && (
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-8">
                      <h3 className="font-bold text-base text-slate-900 mb-2">Store Configuration & Payment Settings</h3>
                      <p className="text-xs text-slate-500 mb-6">Configure delivery charges, payment account details, QR codes, and COD advance delivery fees.</p>

                      <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="font-bold text-slate-700 block mb-1">Default Delivery Fee (PKR)</label>
                            <input 
                              type="number" 
                              value={storeSettings.defaultShippingCharge}
                              onChange={(e) => setStoreSettings({...storeSettings, defaultShippingCharge: Number(e.target.value)})}
                              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5"
                            />
                          </div>
                          <div>
                            <label className="font-bold text-slate-700 block mb-1">Free Shipping Threshold (PKR)</label>
                            <input 
                              type="number" 
                              value={storeSettings.freeShippingThreshold}
                              onChange={(e) => setStoreSettings({...storeSettings, freeShippingThreshold: Number(e.target.value)})}
                              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5"
                            />
                          </div>
                        </div>

                        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl mb-4 space-y-3">
                          <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-900">
                            <input 
                              type="checkbox" 
                              checked={storeSettings.codEnabled}
                              onChange={(e) => setStoreSettings({...storeSettings, codEnabled: e.target.checked})}
                            />
                            <span>Enable Cash on Delivery (COD) Payment Method</span>
                          </label>

                          <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-900">
                            <input 
                              type="checkbox" 
                              checked={Boolean(storeSettings.codDeliveryChargesMandatory)}
                              onChange={(e) => setStoreSettings({...storeSettings, codDeliveryChargesMandatory: e.target.checked})}
                            />
                            <span>Make Delivery Charges Mandatory on COD Orders (Ignore Free Shipping Threshold for COD)</span>
                          </label>
                        </div>

                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl mb-4">
                          <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-900 mb-2">
                            <input 
                              type="checkbox" 
                              checked={storeSettings.couponsEnabled}
                              onChange={(e) => setStoreSettings({...storeSettings, couponsEnabled: e.target.checked})}
                            />
                            <span>Enable Coupons</span>
                          </label>
                          <p className="text-[11px] text-slate-500 mb-2">Toggle to enable/disable coupon code functionality at checkout.</p>
                          <textarea
                            rows={2}
                            value={Object.entries(storeSettings.coupons || {}).map(([k, v]) => `${k}:${(v * 100).toFixed(0)}`).join(',')}
                            onChange={(e) => {
                              const lines = e.target.value.split(',');
                              const newCoupons: any = {};
                              lines.forEach(line => {
                                const [code, pct] = line.split(':');
                                if (code && pct) newCoupons[code.trim().toLowerCase()] = Number(pct) / 100;
                              });
                              setStoreSettings({...storeSettings, coupons: newCoupons});
                            }}
                            className="w-full bg-white border border-slate-300 rounded-xl p-2.5 text-xs"
                            placeholder="wellcome5:5,atal8:8"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-slate-200">
                          {/* Easypaisa Settings */}
                          <div className="bg-slate-50 p-4 rounded-xl border">
                            <h4 className="font-bold text-emerald-700 mb-3 text-sm">Easypaisa</h4>
                            <div className="space-y-3">
                              <div>
                                <label className="font-bold text-slate-700 block mb-1">Account Title</label>
                                <input type="text" value={storeSettings.easypaisaAccountTitle} onChange={(e) => setStoreSettings({...storeSettings, easypaisaAccountTitle: e.target.value})} className="w-full bg-white border border-slate-300 rounded-xl p-2" />
                              </div>
                              <div>
                                <label className="font-bold text-slate-700 block mb-1">Account Number</label>
                                <input type="text" value={storeSettings.easypaisaAccountNumber} onChange={(e) => setStoreSettings({...storeSettings, easypaisaAccountNumber: e.target.value})} className="w-full bg-white border border-slate-300 rounded-xl p-2" />
                              </div>
                              <div>
                                <label className="font-bold text-slate-700 block mb-1">QR Image</label>
                                <input type="file" accept="image/*" onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onload = (ev) => {
                                      const base64 = ev.target?.result as string;
                                      setStoreSettings({...storeSettings, easypaisaQrImage: base64});
                                      showToast('Easypaisa QR image updated!');
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }} className="w-full bg-white border border-slate-300 rounded-xl p-2 text-xs" />
                                {storeSettings.easypaisaQrImage && <img src={storeSettings.easypaisaQrImage} alt="QR" className="w-16 h-16 object-cover mt-2 rounded border" />}
                              </div>
                            </div>
                          </div>

                          {/* JazzCash Settings */}
                          <div className="bg-slate-50 p-4 rounded-xl border">
                            <h4 className="font-bold text-red-700 mb-3 text-sm">JazzCash</h4>
                            <div className="space-y-3">
                              <div>
                                <label className="font-bold text-slate-700 block mb-1">Account Title</label>
                                <input type="text" value={storeSettings.jazzcashAccountTitle} onChange={(e) => setStoreSettings({...storeSettings, jazzcashAccountTitle: e.target.value})} className="w-full bg-white border border-slate-300 rounded-xl p-2" />
                              </div>
                              <div>
                                <label className="font-bold text-slate-700 block mb-1">Account Number</label>
                                <input type="text" value={storeSettings.jazzcashAccountNumber} onChange={(e) => setStoreSettings({...storeSettings, jazzcashAccountNumber: e.target.value})} className="w-full bg-white border border-slate-300 rounded-xl p-2" />
                              </div>
                              <div>
                                <label className="font-bold text-slate-700 block mb-1">QR Image</label>
                                <input type="file" accept="image/*" onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onload = (ev) => {
                                      const base64 = ev.target?.result as string;
                                      setStoreSettings({...storeSettings, jazzcashQrImage: base64});
                                      showToast('JazzCash QR image updated!');
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }} className="w-full bg-white border border-slate-300 rounded-xl p-2 text-xs" />
                                {storeSettings.jazzcashQrImage && <img src={storeSettings.jazzcashQrImage} alt="QR" className="w-16 h-16 object-cover mt-2 rounded border" />}
                              </div>
                            </div>
                          </div>

                          {/* Bank Settings */}
                          <div className="bg-slate-50 p-4 rounded-xl border">
                            <h4 className="font-bold text-blue-700 mb-3 text-sm">Bank Transfer</h4>
                            <div className="space-y-3">
                              <div>
                                <label className="font-bold text-slate-700 block mb-1">Bank Name</label>
                                <input type="text" value={storeSettings.bankName} onChange={(e) => setStoreSettings({...storeSettings, bankName: e.target.value})} className="w-full bg-white border border-slate-300 rounded-xl p-2" />
                              </div>
                              <div>
                                <label className="font-bold text-slate-700 block mb-1">Account Title</label>
                                <input type="text" value={storeSettings.bankAccountTitle} onChange={(e) => setStoreSettings({...storeSettings, bankAccountTitle: e.target.value})} className="w-full bg-white border border-slate-300 rounded-xl p-2" />
                              </div>
                              <div>
                                <label className="font-bold text-slate-700 block mb-1">Account Number</label>
                                <input type="text" value={storeSettings.bankAccountNumber} onChange={(e) => setStoreSettings({...storeSettings, bankAccountNumber: e.target.value})} className="w-full bg-white border border-slate-300 rounded-xl p-2" />
                              </div>
                              <div>
                                <label className="font-bold text-slate-700 block mb-1">QR Image</label>
                                <input type="file" accept="image/*" onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    const reader = new FileReader();
                                    reader.onload = (ev) => {
                                      const base64 = ev.target?.result as string;
                                      setStoreSettings({...storeSettings, bankQrImage: base64});
                                      showToast('Bank QR image updated!');
                                    };
                                    reader.readAsDataURL(file);
                                  }
                                }} className="w-full bg-white border border-slate-300 rounded-xl p-2 text-xs" />
                                {storeSettings.bankQrImage && <img src={storeSettings.bankQrImage} alt="QR" className="w-16 h-16 object-cover mt-2 rounded border" />}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="pt-4">
                          <button 
                            type="submit"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-xl shadow-lg transition text-xs"
                          >
                            Save Store Settings
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* TAB 6: STAFF & ROLES MANAGEMENT */}
                  {adminActiveTab === 'staff' && (
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-8">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                        <div>
                          <h3 className="font-bold text-base text-slate-900">Staff & Role Management</h3>
                          <p className="text-xs text-slate-500">Manage administrator and employee access accounts for the ATAL Store Portal.</p>
                        </div>
                        <button 
                          onClick={() => {
                            setNewStaffForm({ name: '', email: '', role: 'employee', password: '' });
                            setIsAddStaffModalOpen(true);
                          }}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow"
                        >
                          <Plus className="w-4 h-4" /> Add New Staff Member
                        </button>
                      </div>

                      {/* Staff Table */}
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                              <th className="p-3">Staff Name</th>
                              <th className="p-3">Portal Login Email</th>
                              <th className="p-3">Role & Access</th>
                              <th className="p-3">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {(staffList || []).map((user: any) => (
                              <tr key={user.id} className="hover:bg-slate-50 transition">
                                <td className="p-3 font-bold text-slate-900 flex items-center gap-2">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${user.role === 'admin' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'}`}>
                                    {(user.name || 'S').charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <p>{user.name}</p>
                                    <span className="text-[10px] text-slate-400 font-normal">ID: {user.id}</span>
                                  </div>
                                </td>
                                <td className="p-3 font-mono text-slate-700">{user.email}</td>
                                <td className="p-3">
                                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                                    user.role === 'admin' 
                                      ? 'bg-amber-50 text-amber-800 border border-amber-200' 
                                      : 'bg-blue-50 text-blue-800 border border-blue-200'
                                  }`}>
                                    {user.role === 'admin' ? <ShieldCheck className="w-3.5 h-3.5" /> : <User className="w-3.5 h-3.5" />}
                                    {user.role === 'admin' ? 'Administrator (Full Access)' : 'Employee (Staff Access)'}
                                  </span>
                                </td>
                                <td className="p-3">
                                  <div className="flex items-center gap-2">
                                    <button 
                                      onClick={() => {
                                        setStaffResetTarget(user);
                                        setStaffResetPassword('');
                                      }}
                                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                                      title="Change or reset password"
                                    >
                                      <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                                      <span>Reset Password</span>
                                    </button>
                                    {user.email.toLowerCase() !== 'uatal.pk@gmail.com' && (
                                      <button 
                                        onClick={() => handleDeleteStaff(user)}
                                        className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition"
                                        title="Remove staff member"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* TAB: HOMEPAGE SECTIONS MANAGEMENT (New Launch & Spotlight) */}
                  {/* TAB: HOMEPAGE SECTIONS MANAGEMENT (New Launch: Available Now, Launch Soon, Spotlight & Live Preview) */}
                  {adminActiveTab === 'homepage-sections' && (
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm mb-8 space-y-6">
                      {/* Top Header & Global Actions */}
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-5 border-b border-slate-100">
                        <div className="flex items-center gap-3.5">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-800 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-600/20">
                            <Layers className="w-6 h-6" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-black text-lg text-slate-900">Homepage Sections Management</h3>
                              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                                Redesigned
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-0.5">
                              Manage New Launch (Available Now & Launch Soon), Spotlight promotional banners, layout styles, and preview before publishing.
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2.5 w-full sm:w-auto">
                          <button
                            type="button"
                            onClick={() => fetchHomepageSections()}
                            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Reset Changes</span>
                          </button>
                          <button
                            type="button"
                            onClick={handleSaveHomepageSections}
                            className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                          >
                            <Check className="w-4 h-4" />
                            <span>Save Changes Permanently</span>
                          </button>
                        </div>
                      </div>

                      {/* Sub-Navigation Tabs */}
                      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
                        <button
                          type="button"
                          onClick={() => setAdminSectionSubTab('availableNow')}
                          className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                            adminSectionSubTab === 'availableNow' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          <Zap className="w-4 h-4 text-emerald-600" />
                          <span>1. Available Now</span>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${homepageSections?.newLaunch?.availableNow?.enabled !== false ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-500'}`}>
                            {homepageSections?.newLaunch?.availableNow?.enabled !== false ? 'ON' : 'OFF'}
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setAdminSectionSubTab('launchSoon')}
                          className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                            adminSectionSubTab === 'launchSoon' ? 'bg-white text-amber-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          <Clock className="w-4 h-4 text-amber-600" />
                          <span>2. Launch Soon</span>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${homepageSections?.newLaunch?.launchSoon?.enabled !== false ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-500'}`}>
                            {homepageSections?.newLaunch?.launchSoon?.enabled !== false ? 'ON' : 'OFF'}
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setAdminSectionSubTab('spotlight')}
                          className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                            adminSectionSubTab === 'spotlight' ? 'bg-white text-purple-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          <Sparkles className="w-4 h-4 text-amber-500" />
                          <span>3. Spotlight Section</span>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${homepageSections?.spotlight?.enabled !== false ? 'bg-purple-100 text-purple-800' : 'bg-slate-200 text-slate-500'}`}>
                            {homepageSections?.spotlight?.enabled !== false ? 'ON' : 'OFF'}
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setAdminSectionSubTab('preview')}
                          className={`flex-1 min-w-[140px] py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                            adminSectionSubTab === 'preview' ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          <Eye className="w-4 h-4" />
                          <span>Live Preview</span>
                        </button>
                      </div>

                      {/* ======================================================== */}
                      {/* SUB-PANEL 1: AVAILABLE NOW (Immediate Purchase)          */}
                      {/* ======================================================== */}
                      {adminSectionSubTab === 'availableNow' && (
                        <div className="space-y-6">
                          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
                              <div>
                                <h4 className="font-black text-sm text-slate-900 flex items-center gap-2">
                                  <span>Part A: New Launch — Available Now</span>
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${homepageSections?.newLaunch?.availableNow?.enabled !== false ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}`}>
                                    {homepageSections?.newLaunch?.availableNow?.enabled !== false ? 'ACTIVE (VISIBLE)' : 'INACTIVE (HIDDEN)'}
                                  </span>
                                </h4>
                                <p className="text-xs text-slate-500 mt-0.5">
                                  Newly launched products eligible for instant purchase with Add to Cart and direct product detail links.
                                </p>
                              </div>
                              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                                <input
                                  type="checkbox"
                                  checked={homepageSections?.newLaunch?.availableNow?.enabled !== false}
                                  onChange={(e) => {
                                    const currNL = homepageSections?.newLaunch || {};
                                    const nextAN = { ...(currNL.availableNow || {}), enabled: e.target.checked };
                                    setHomepageSections({
                                      ...homepageSections,
                                      newLaunch: { ...currNL, availableNow: nextAN, enabled: nextAN.enabled || currNL.launchSoon?.enabled }
                                    });
                                  }}
                                  className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                                <span className="ml-2 text-xs font-bold text-slate-700">Section ON/OFF</span>
                              </label>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                              <div>
                                <label className="font-bold text-slate-700 block mb-1">Section Heading Title</label>
                                <input
                                  type="text"
                                  value={homepageSections?.newLaunch?.availableNow?.title || ''}
                                  onChange={(e) => {
                                    const currNL = homepageSections?.newLaunch || {};
                                    const nextAN = { ...(currNL.availableNow || {}), title: e.target.value };
                                    setHomepageSections({
                                      ...homepageSections,
                                      newLaunch: { ...currNL, availableNow: nextAN, title: e.target.value }
                                    });
                                  }}
                                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-emerald-500 outline-none"
                                  placeholder="e.g. New Launch"
                                />
                              </div>
                              <div>
                                <label className="font-bold text-slate-700 block mb-1">Section Subtitle / Description</label>
                                <input
                                  type="text"
                                  value={homepageSections?.newLaunch?.availableNow?.subtitle || ''}
                                  onChange={(e) => {
                                    const currNL = homepageSections?.newLaunch || {};
                                    const nextAN = { ...(currNL.availableNow || {}), subtitle: e.target.value };
                                    setHomepageSections({
                                      ...homepageSections,
                                      newLaunch: { ...currNL, availableNow: nextAN, subtitle: e.target.value }
                                    });
                                  }}
                                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-emerald-500 outline-none"
                                  placeholder="e.g. Discover What's New"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Selected Products Ordered List */}
                          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-black text-sm text-slate-900">Configured Products Order ({homepageSections?.newLaunch?.availableNow?.productIds?.length || 0})</h4>
                                <p className="text-xs text-slate-500">Reorder using Up/Down buttons or remove items from the New Launch section.</p>
                              </div>
                            </div>

                            <div className="space-y-2">
                              {((homepageSections?.newLaunch?.availableNow?.productIds || []).map((prodId: string, idx: number) => {
                                const prod = products.find(p => p.id === prodId);
                                if (!prod) return null;
                                return (
                                  <div key={prodId} className="bg-white border border-slate-200 rounded-xl p-3 flex items-center justify-between gap-3 shadow-xs">
                                    <div className="flex items-center gap-3 min-w-0">
                                      <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 text-xs font-black flex items-center justify-center shrink-0">
                                        #{idx + 1}
                                      </span>
                                      <img src={getPrimaryProductImage(prod)} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0" />
                                      <div className="min-w-0">
                                        <p className="text-xs font-bold text-slate-900 truncate">{prod.name}</p>
                                        <p className="text-[11px] text-slate-500">Rs {prod.price.toLocaleString()} • Stock: {prod.stock ?? prod.stockQuantity ?? 10}</p>
                                      </div>
                                    </div>

                                    <div className="flex items-center gap-1.5 shrink-0">
                                      <button
                                        type="button"
                                        disabled={idx === 0}
                                        onClick={() => {
                                          const currNL = homepageSections?.newLaunch || {};
                                          const currAN = currNL.availableNow || {};
                                          const next = [...(currAN.productIds || [])];
                                          const tmp = next[idx - 1];
                                          next[idx - 1] = next[idx];
                                          next[idx] = tmp;
                                          const nextAN = { ...currAN, productIds: next };
                                          setHomepageSections({ ...homepageSections, newLaunch: { ...currNL, availableNow: nextAN, productIds: next } });
                                        }}
                                        className="p-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-30 rounded-lg text-slate-700"
                                        title="Move Up"
                                      >
                                        <ArrowUp className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        type="button"
                                        disabled={idx === ((homepageSections?.newLaunch?.availableNow?.productIds || []).length - 1)}
                                        onClick={() => {
                                          const currNL = homepageSections?.newLaunch || {};
                                          const currAN = currNL.availableNow || {};
                                          const next = [...(currAN.productIds || [])];
                                          const tmp = next[idx + 1];
                                          next[idx + 1] = next[idx];
                                          next[idx] = tmp;
                                          const nextAN = { ...currAN, productIds: next };
                                          setHomepageSections({ ...homepageSections, newLaunch: { ...currNL, availableNow: nextAN, productIds: next } });
                                        }}
                                        className="p-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-30 rounded-lg text-slate-700"
                                        title="Move Down"
                                      >
                                        <ArrowDown className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const currNL = homepageSections?.newLaunch || {};
                                          const currAN = currNL.availableNow || {};
                                          const next = (currAN.productIds || []).filter((id: string) => id !== prodId);
                                          const nextAN = { ...currAN, productIds: next };
                                          setHomepageSections({ ...homepageSections, newLaunch: { ...currNL, availableNow: nextAN, productIds: next } });
                                        }}
                                        className="p-1.5 bg-red-50 hover:bg-red-100 rounded-lg text-red-600 ml-1"
                                        title="Remove"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </div>
                                );
                              }))}
                            </div>
                          </div>

                          {/* Product Selector with Search */}
                          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                              <div>
                                <h4 className="font-black text-sm text-slate-900">Add Products from Store Database</h4>
                                <p className="text-xs text-slate-500">Search and click to add or remove products from Available Now.</p>
                              </div>
                              <input
                                type="text"
                                placeholder="Search by product name or SKU..."
                                value={availableNowSearchQuery}
                                onChange={(e) => setAvailableNowSearchQuery(e.target.value)}
                                className="w-full sm:w-64 bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs outline-none focus:ring-2 focus:ring-emerald-500"
                              />
                            </div>

                            <div className="max-h-60 overflow-y-auto bg-white border border-slate-200 rounded-xl p-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                              {products
                                .filter(p => !availableNowSearchQuery || p.name.toLowerCase().includes(availableNowSearchQuery.toLowerCase()) || p.sku?.toLowerCase().includes(availableNowSearchQuery.toLowerCase()))
                                .map(p => {
                                  const selectedIds = homepageSections?.newLaunch?.availableNow?.productIds || [];
                                  const isSelected = selectedIds.includes(p.id);
                                  return (
                                    <div
                                      key={p.id}
                                      onClick={() => {
                                        const currNL = homepageSections?.newLaunch || {};
                                        const currAN = currNL.availableNow || {};
                                        const nextIds = isSelected
                                          ? selectedIds.filter((id: string) => id !== p.id)
                                          : [...selectedIds, p.id];
                                        const nextAN = { ...currAN, productIds: nextIds };
                                        setHomepageSections({
                                          ...homepageSections,
                                          newLaunch: { ...currNL, availableNow: nextAN, productIds: nextIds }
                                        });
                                      }}
                                      className={`p-2.5 rounded-xl border cursor-pointer transition flex items-center gap-2.5 ${isSelected ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold' : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'}`}
                                    >
                                      <input type="checkbox" checked={isSelected} readOnly className="rounded text-emerald-600" />
                                      <img src={p.images?.[0] || DEFAULT_PRODUCT_IMAGE} alt="" className="w-9 h-9 rounded-lg object-cover shrink-0" />
                                      <div className="min-w-0 flex-1">
                                        <p className="text-xs truncate">{p.name}</p>
                                        <p className="text-[10px] text-slate-400">Rs {p.price.toLocaleString()} • {(p.stock ?? p.stockQuantity ?? 10) > 0 ? `${p.stock ?? p.stockQuantity ?? 10} in stock` : 'Out of stock'}</p>
                                      </div>
                                    </div>
                                  );
                                })}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* ======================================================== */}
                      {/* SUB-PANEL 2: LAUNCH SOON (Upcoming Teaser Drops)        */}
                      {/* ======================================================== */}
                      {adminSectionSubTab === 'launchSoon' && (
                        <div className="space-y-6">
                          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
                              <div>
                                <h4 className="font-black text-sm text-slate-900 flex items-center gap-2">
                                  <span>Part B: Launch Soon — Coming Soon Exclusives</span>
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${homepageSections?.newLaunch?.launchSoon?.enabled !== false ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-600'}`}>
                                    {homepageSections?.newLaunch?.launchSoon?.enabled !== false ? 'ACTIVE (VISIBLE)' : 'INACTIVE (HIDDEN)'}
                                  </span>
                                </h4>
                                <p className="text-xs text-slate-500 mt-0.5">
                                  Tease future product drops with live countdown timers, COMING SOON badges, and VIP waitlist notifications.
                                </p>
                              </div>
                              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                                <input
                                  type="checkbox"
                                  checked={homepageSections?.newLaunch?.launchSoon?.enabled !== false}
                                  onChange={(e) => {
                                    const currNL = homepageSections?.newLaunch || {};
                                    const nextLS = { ...(currNL.launchSoon || {}), enabled: e.target.checked };
                                    setHomepageSections({
                                      ...homepageSections,
                                      newLaunch: { ...currNL, launchSoon: nextLS, enabled: currNL.availableNow?.enabled || nextLS.enabled }
                                    });
                                  }}
                                  className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                                <span className="ml-2 text-xs font-bold text-slate-700">Section ON/OFF</span>
                              </label>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                              <div>
                                <label className="font-bold text-slate-700 block mb-1">Section Heading Title</label>
                                <input
                                  type="text"
                                  value={homepageSections?.newLaunch?.launchSoon?.title || ''}
                                  onChange={(e) => {
                                    const currNL = homepageSections?.newLaunch || {};
                                    const nextLS = { ...(currNL.launchSoon || {}), title: e.target.value };
                                    setHomepageSections({
                                      ...homepageSections,
                                      newLaunch: { ...currNL, launchSoon: nextLS }
                                    });
                                  }}
                                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-amber-500 outline-none"
                                  placeholder="e.g. Launch Soon"
                                />
                              </div>
                              <div>
                                <label className="font-bold text-slate-700 block mb-1">Section Subtitle / Description</label>
                                <input
                                  type="text"
                                  value={homepageSections?.newLaunch?.launchSoon?.subtitle || ''}
                                  onChange={(e) => {
                                    const currNL = homepageSections?.newLaunch || {};
                                    const nextLS = { ...(currNL.launchSoon || {}), subtitle: e.target.value };
                                    setHomepageSections({
                                      ...homepageSections,
                                      newLaunch: { ...currNL, launchSoon: nextLS }
                                    });
                                  }}
                                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-amber-500 outline-none"
                                  placeholder="e.g. Something Exciting Is Coming"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Launch Soon Items List */}
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <h4 className="font-black text-sm text-slate-900">Upcoming Items ({homepageSections?.newLaunch?.launchSoon?.items?.length || 0})</h4>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingLaunchSoonItem({
                                    id: `launch-soon-${Date.now()}`,
                                    name: '',
                                    description: '',
                                    image: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f?auto=format&fit=crop&w=800&q=80',
                                    badge: 'COMING SOON',
                                    expectedLaunchDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 16),
                                    showCountdown: true,
                                    previewSlug: ''
                                  });
                                  setIsLaunchSoonModalOpen(true);
                                }}
                                className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-xs cursor-pointer transition"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Add Coming Soon Drop</span>
                              </button>
                            </div>

                            <div className="space-y-3">
                              {((homepageSections?.newLaunch?.launchSoon?.items || []).map((item: any, idx: number) => (
                                <div key={item.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                  <div className="flex items-start gap-3.5 min-w-0">
                                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-black/60 shrink-0 border border-slate-200">
                                      <img src={item.image || DEFAULT_PRODUCT_IMAGE} alt="" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="min-w-0">
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="bg-amber-100 text-amber-900 text-[9.5px] font-black px-2 py-0.5 rounded-full uppercase">
                                          {item.badge || 'COMING SOON'}
                                        </span>
                                        {item.expectedLaunchDate && (
                                          <span className="text-[11px] text-slate-500 flex items-center gap-1">
                                            <Calendar className="w-3 h-3" />
                                            {new Date(item.expectedLaunchDate).toLocaleDateString()}
                                          </span>
                                        )}
                                      </div>
                                      <h5 className="font-bold text-sm text-slate-900 leading-snug">{item.name}</h5>
                                      <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{item.description}</p>
                                    </div>
                                  </div>

                                  <div className="flex flex-wrap items-center gap-2 shrink-0 w-full md:w-auto justify-end pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                                    {/* 1-Click Move to Available Now */}
                                    <button
                                      type="button"
                                      onClick={() => handleMoveLaunchSoonToAvailable(item.id, item.name)}
                                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-xs cursor-pointer"
                                      title="Launch now: move this item into Available Now"
                                    >
                                      <Zap className="w-3.5 h-3.5" />
                                      <span>Move to Available Now</span>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEditingLaunchSoonItem({ ...item });
                                        setIsLaunchSoonModalOpen(true);
                                      }}
                                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                                    >
                                      <Edit className="w-3.5 h-3.5" />
                                      <span>Edit</span>
                                    </button>

                                    <button
                                      type="button"
                                      disabled={idx === 0}
                                      onClick={() => {
                                        const currNL = homepageSections?.newLaunch || {};
                                        const currLS = currNL.launchSoon || {};
                                        const next = [...(currLS.items || [])];
                                        const tmp = next[idx - 1];
                                        next[idx - 1] = next[idx];
                                        next[idx] = tmp;
                                        setHomepageSections({
                                          ...homepageSections,
                                          newLaunch: { ...currNL, launchSoon: { ...currLS, items: next } }
                                        });
                                      }}
                                      className="p-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-30 rounded-lg text-slate-700"
                                      title="Move Up"
                                    >
                                      <ArrowUp className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      disabled={idx === ((homepageSections?.newLaunch?.launchSoon?.items || []).length - 1)}
                                      onClick={() => {
                                        const currNL = homepageSections?.newLaunch || {};
                                        const currLS = currNL.launchSoon || {};
                                        const next = [...(currLS.items || [])];
                                        const tmp = next[idx + 1];
                                        next[idx + 1] = next[idx];
                                        next[idx] = tmp;
                                        setHomepageSections({
                                          ...homepageSections,
                                          newLaunch: { ...currNL, launchSoon: { ...currLS, items: next } }
                                        });
                                      }}
                                      className="p-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-30 rounded-lg text-slate-700"
                                      title="Move Down"
                                    >
                                      <ArrowDown className="w-3.5 h-3.5" />
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => {
                                        const currNL = homepageSections?.newLaunch || {};
                                        const currLS = currNL.launchSoon || {};
                                        const next = (currLS.items || []).filter((_: any, i: number) => i !== idx);
                                        setHomepageSections({
                                          ...homepageSections,
                                          newLaunch: { ...currNL, launchSoon: { ...currLS, items: next } }
                                        });
                                      }}
                                      className="p-1.5 bg-red-50 hover:bg-red-100 rounded-lg text-red-600"
                                      title="Delete"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              )))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* ======================================================== */}
                      {/* SUB-PANEL 3: SPOTLIGHT SECTION                           */}
                      {/* ======================================================== */}
                      {adminSectionSubTab === 'spotlight' && (
                        <div className="space-y-6">
                          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
                              <div>
                                <h4 className="font-black text-sm text-slate-900 flex items-center gap-2">
                                  <span>Spotlight & Featured Collections</span>
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${homepageSections?.spotlight?.enabled !== false ? 'bg-purple-100 text-purple-800' : 'bg-slate-200 text-slate-600'}`}>
                                    {homepageSections?.spotlight?.enabled !== false ? 'ACTIVE (VISIBLE)' : 'INACTIVE (HIDDEN)'}
                                  </span>
                                </h4>
                                <p className="text-xs text-slate-500 mt-0.5">
                                  Highlight exclusive hero banners, curated collections, and flagship promotions across mobile and desktop.
                                </p>
                              </div>
                              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                                <input
                                  type="checkbox"
                                  checked={homepageSections?.spotlight?.enabled !== false}
                                  onChange={(e) => setHomepageSections({
                                    ...homepageSections,
                                    spotlight: { ...(homepageSections?.spotlight || {}), enabled: e.target.checked }
                                  })}
                                  className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
                                <span className="ml-2 text-xs font-bold text-slate-700">Section ON/OFF</span>
                              </label>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                              <div>
                                <label className="font-bold text-slate-700 block mb-1">Section Heading Title</label>
                                <input
                                  type="text"
                                  value={homepageSections?.spotlight?.title || ''}
                                  onChange={(e) => setHomepageSections({
                                    ...homepageSections,
                                    spotlight: { ...(homepageSections?.spotlight || {}), title: e.target.value }
                                  })}
                                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-purple-500 outline-none"
                                />
                              </div>
                              <div>
                                <label className="font-bold text-slate-700 block mb-1">Section Subtitle / Description</label>
                                <input
                                  type="text"
                                  value={homepageSections?.spotlight?.subtitle || ''}
                                  onChange={(e) => setHomepageSections({
                                    ...homepageSections,
                                    spotlight: { ...(homepageSections?.spotlight || {}), subtitle: e.target.value }
                                  })}
                                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 focus:ring-2 focus:ring-purple-500 outline-none"
                                />
                              </div>
                              <div>
                                <label className="font-bold text-slate-700 block mb-1">Layout Style Display</label>
                                <select
                                  value={homepageSections?.spotlight?.layoutStyle || 'carousel'}
                                  onChange={(e) => setHomepageSections({
                                    ...homepageSections,
                                    spotlight: { ...(homepageSections?.spotlight || {}), layoutStyle: e.target.value }
                                  })}
                                  className="w-full bg-white border border-slate-300 rounded-xl p-2.5 font-bold text-slate-800"
                                >
                                  <option value="carousel">Interactive Carousel (Swipeable with Dots)</option>
                                  <option value="banner">Full-Width Showcase Banner</option>
                                  <option value="grid">Responsive Multi-Card Grid</option>
                                </select>
                              </div>
                            </div>
                          </div>

                          {/* Spotlight Items List */}
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <h4 className="font-black text-sm text-slate-900">Configured Spotlight Items ({homepageSections?.spotlight?.items?.length || 0})</h4>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingSpotlightItem({
                                    id: `spot-${Date.now()}`,
                                    title: '',
                                    subtitle: '',
                                    description: '',
                                    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80',
                                    buttonText: 'SHOP NOW',
                                    buttonLink: '/shop',
                                    layoutType: 'banner',
                                    badge: 'FEATURED',
                                    price: 2999,
                                    originalPrice: 4500
                                  });
                                  setIsSpotlightModalOpen(true);
                                }}
                                className="bg-purple-700 hover:bg-purple-800 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-xs cursor-pointer transition"
                              >
                                <Plus className="w-3.5 h-3.5" />
                                <span>Add Spotlight Item</span>
                              </button>
                            </div>

                            <div className="space-y-3">
                              {((homepageSections?.spotlight?.items || []).map((item: any, sIdx: number) => (
                                <div key={item.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                  <div className="flex items-start gap-3.5 min-w-0">
                                    <div className="w-20 h-16 rounded-xl overflow-hidden bg-slate-950 shrink-0 border border-slate-200">
                                      <img src={item.image || DEFAULT_PRODUCT_IMAGE} alt="" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="min-w-0">
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="bg-amber-100 text-amber-900 text-[9.5px] font-black px-2 py-0.5 rounded-full uppercase">
                                          {item.badge || 'SPOTLIGHT'}
                                        </span>
                                        {item.price && (
                                          <span className="text-[11px] font-bold text-emerald-700">
                                            Rs {item.price.toLocaleString()}
                                          </span>
                                        )}
                                      </div>
                                      <h5 className="font-bold text-sm text-slate-900 leading-snug">{item.title || 'Untitled Spotlight'}</h5>
                                      <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{item.description}</p>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2 shrink-0 w-full md:w-auto justify-end pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEditingSpotlightItem({ ...item });
                                        setIsSpotlightModalOpen(true);
                                      }}
                                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                                    >
                                      <Edit className="w-3.5 h-3.5" />
                                      <span>Edit</span>
                                    </button>

                                    <button
                                      type="button"
                                      disabled={sIdx === 0}
                                      onClick={() => {
                                        const currSpot = homepageSections?.spotlight || {};
                                        const next = [...(currSpot.items || [])];
                                        const tmp = next[sIdx - 1];
                                        next[sIdx - 1] = next[sIdx];
                                        next[sIdx] = tmp;
                                        setHomepageSections({ ...homepageSections, spotlight: { ...currSpot, items: next } });
                                      }}
                                      className="p-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-30 rounded-lg text-slate-700"
                                      title="Move Up"
                                    >
                                      <ArrowUp className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      disabled={sIdx === ((homepageSections?.spotlight?.items || []).length - 1)}
                                      onClick={() => {
                                        const currSpot = homepageSections?.spotlight || {};
                                        const next = [...(currSpot.items || [])];
                                        const tmp = next[sIdx + 1];
                                        next[sIdx + 1] = next[sIdx];
                                        next[sIdx] = tmp;
                                        setHomepageSections({ ...homepageSections, spotlight: { ...currSpot, items: next } });
                                      }}
                                      className="p-1.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-30 rounded-lg text-slate-700"
                                      title="Move Down"
                                    >
                                      <ArrowDown className="w-3.5 h-3.5" />
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => {
                                        const currSpot = homepageSections?.spotlight || {};
                                        const next = (currSpot.items || []).filter((_: any, i: number) => i !== sIdx);
                                        setHomepageSections({ ...homepageSections, spotlight: { ...currSpot, items: next } });
                                      }}
                                      className="p-1.5 bg-red-50 hover:bg-red-100 rounded-lg text-red-600"
                                      title="Delete"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                </div>
                              )))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* ======================================================== */}
                      {/* SUB-PANEL 4: LIVE PREVIEW (Android Mobile vs Desktop)    */}
                      {/* ======================================================== */}
                      {adminSectionSubTab === 'preview' && (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                            <div>
                              <h4 className="font-black text-sm text-slate-900">Interactive Storefront Preview</h4>
                              <p className="text-xs text-slate-500">Preview exactly how customers will see your sections before saving changes.</p>
                            </div>
                            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
                              <button
                                type="button"
                                onClick={() => setAdminPreviewDevice('mobile')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                                  adminPreviewDevice === 'mobile' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                                }`}
                              >
                                <span>📱 Mobile (Android)</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setAdminPreviewDevice('desktop')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                                  adminPreviewDevice === 'desktop' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                                }`}
                              >
                                <span>💻 Desktop View</span>
                              </button>
                            </div>
                          </div>

                          <div className={`mx-auto bg-slate-100 p-4 rounded-3xl border border-slate-300 overflow-hidden ${
                            adminPreviewDevice === 'mobile' ? 'max-w-[400px] shadow-2xl' : 'w-full shadow-md'
                          }`}>
                            <div className="bg-slate-950 text-white text-[11px] font-mono px-4 py-1.5 rounded-t-2xl flex items-center justify-between border-b border-white/10">
                              <span>ATAL Store Live Preview</span>
                              <span>{adminPreviewDevice === 'mobile' ? '375 × 812 (Android)' : '1280 × 800 (Desktop)'}</span>
                            </div>

                            <div className="bg-white p-4 space-y-6 max-h-[600px] overflow-y-auto rounded-b-2xl">
                              {/* Preview: Spotlight */}
                              {homepageSections?.spotlight?.enabled !== false && (
                                <div className="p-4 bg-gradient-to-br from-slate-950 via-[#062419] to-amber-950 text-white rounded-2xl border border-amber-500/30">
                                  <div className="text-center mb-3">
                                    <span className="text-[9px] font-black uppercase tracking-wider text-amber-300">FEATURED SPOTLIGHT</span>
                                    <h5 className="font-black text-sm text-white mt-0.5">{homepageSections?.spotlight?.title || 'ATAL Spotlight'}</h5>
                                  </div>
                                  <div className="space-y-2">
                                    {(homepageSections?.spotlight?.items || []).slice(0, 1).map((item: any) => {
                                      if (!item) return null;
                                      return (
                                        <div key={item.id || 'preview-spot'} className="relative rounded-xl overflow-hidden aspect-[16/9] bg-black/60">
                                          <img src={item.image || DEFAULT_PRODUCT_IMAGE} alt="" className="w-full h-full object-cover" />
                                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent p-3 flex flex-col justify-end">
                                            <span className="bg-amber-400 text-slate-950 text-[8px] font-black px-2 py-0.5 rounded w-max">{item.badge || 'SPOTLIGHT'}</span>
                                            <p className="text-xs font-bold text-white mt-1">{item.title || 'Special Feature'}</p>
                                            <button type="button" className="mt-2 bg-amber-400 text-slate-950 font-bold px-3 py-1 rounded-lg text-[10px] w-max">
                                              {item.buttonText || 'Shop Now'}
                                            </button>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}

                              {/* Preview: Available Now */}
                              {homepageSections?.newLaunch?.availableNow?.enabled !== false && (
                                <div className="p-4 bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-900 text-white rounded-2xl border border-emerald-500/30">
                                  <div className="flex items-center justify-between mb-3">
                                    <div>
                                      <span className="text-[9px] font-black uppercase text-emerald-400">READY TO SHIP</span>
                                      <h5 className="font-black text-sm text-white">{homepageSections?.newLaunch?.availableNow?.title || 'New Launch'}</h5>
                                    </div>
                                    <span className="text-[10px] text-emerald-400 font-bold">View All →</span>
                                  </div>
                                  <div className="grid grid-cols-2 gap-2">
                                    {((homepageSections?.newLaunch?.availableNow?.productIds || []).slice(0, 2)).map((pId: string) => {
                                      const p = products.find(x => x && x.id === pId);
                                      if (!p) return null;
                                      return (
                                        <div key={pId} className="bg-white/10 rounded-xl p-2">
                                          <img src={p.images?.[0] || DEFAULT_PRODUCT_IMAGE} alt="" className="w-full aspect-square object-cover rounded-lg mb-1" />
                                          <p className="text-[10px] font-bold text-white truncate">{p.name || 'Product'}</p>
                                          <p className="text-[10px] text-emerald-400 font-black">Rs {(p.price || 0).toLocaleString()}</p>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}

                              {/* Preview: Launch Soon */}
                              {homepageSections?.newLaunch?.launchSoon?.enabled !== false && (
                                <div className="p-4 bg-gradient-to-br from-slate-950 via-[#1c1304] to-slate-900 text-white rounded-2xl border border-amber-500/35">
                                  <div className="mb-3">
                                    <span className="text-[9px] font-black uppercase text-amber-400">UPCOMING EXCLUSIVES</span>
                                    <h5 className="font-black text-sm text-white">{homepageSections?.newLaunch?.launchSoon?.title || 'Launch Soon'}</h5>
                                  </div>
                                  <div className="space-y-2">
                                    {(homepageSections?.newLaunch?.launchSoon?.items || []).slice(0, 1).map((item: any) => {
                                      if (!item) return null;
                                      return (
                                        <div key={item.id || 'preview-ls'} className="bg-white/5 border border-amber-500/20 rounded-xl p-2.5">
                                          <div className="flex items-center justify-between mb-1">
                                            <span className="bg-amber-500 text-slate-950 text-[8px] font-black px-1.5 py-0.5 rounded">{item.badge || 'COMING SOON'}</span>
                                            {item.expectedLaunchDate && <CountdownTimer targetDate={item.expectedLaunchDate} />}
                                          </div>
                                          <p className="text-xs font-bold text-white mt-1">{item.name || 'Drop Title'}</p>
                                          <button type="button" className="mt-2 w-full bg-amber-500 text-slate-950 font-bold py-1.5 rounded-lg text-[10px]">
                                            🔔 Notify Me When Launched
                                          </button>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB: DATA MANAGEMENT, BACKUP & RESTORATION */}
                  {(adminActiveTab === 'data-management' || adminActiveTab === 'import-export') && (
                    <div className="space-y-6 mb-8">
                      {/* Top Header & Sub-Tab Navigation */}
                      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-5 border-b border-slate-100">
                          <div className="flex items-center gap-3.5">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-600/20">
                              <Database className="w-6 h-6" />
                            </div>
                            <div>
                              <h3 className="font-black text-lg text-slate-900">Data Management & Backup Center</h3>
                              <p className="text-xs text-slate-500">
                                Enterprise-grade export, validation preview, safe import, and point-in-time database snapshot backups.
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => triggerDataExport('all', 'json')}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition shadow-sm flex items-center gap-2 cursor-pointer"
                              title="Download complete database in JSON format"
                            >
                              <Download className="w-4 h-4" />
                              <span>Quick Full Backup (.json)</span>
                            </button>
                          </div>
                        </div>

                        {/* Sub-Tabs Selector */}
                        <div className="flex flex-wrap gap-2 pt-4">
                          <button
                            type="button"
                            onClick={() => setDataMgmtTab('export')}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                              dataMgmtTab === 'export'
                                ? 'bg-slate-900 text-white shadow-sm'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            <Download className="w-4 h-4 text-emerald-400" />
                            <span>Export Center (JSON Only)</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setDataMgmtTab('import')}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                              dataMgmtTab === 'import'
                                ? 'bg-slate-900 text-white shadow-sm'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            <Upload className="w-4 h-4 text-amber-400" />
                            <span>Smart Import & Restore</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setDataMgmtTab('backups');
                              fetchBackupSnapshots();
                            }}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                              dataMgmtTab === 'backups'
                                ? 'bg-slate-900 text-white shadow-sm'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            <History className="w-4 h-4 text-blue-400" />
                            <span>Backup Snapshots History ({backupSnapshots.length})</span>
                          </button>
                        </div>
                      </div>

                      {/* SUB-TAB 1: EXPORT CENTER */}
                      {dataMgmtTab === 'export' && (
                        <div className="space-y-4">
                          <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-4 flex items-start gap-3">
                            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                            <div className="text-xs text-emerald-900">
                              <p className="font-bold">Permanent Server-Side Storage & Instant JSON Downloads</p>
                              <p className="text-emerald-700 mt-0.5">
                                All exports are generated live directly from the persistent database on the server in standard JSON schema format for seamless backup, restoration, and website migration.
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* Card 1: Full Backup */}
                            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition">
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                                    <Database className="w-5 h-5" />
                                  </div>
                                  <span className="text-[10px] font-bold bg-purple-50 text-purple-700 px-2.5 py-0.5 rounded-full border border-purple-200">
                                    All Data
                                  </span>
                                </div>
                                <h4 className="font-bold text-sm text-slate-900">Complete Store Backup</h4>
                                <p className="text-xs text-slate-500 mt-1 mb-4">
                                  Products, categories, subcategories, carousel slides, settings, homepage sections, customer orders, and accounts.
                                </p>
                              </div>
                              <div className="pt-2 border-t border-slate-100">
                                <button
                                  type="button"
                                  onClick={() => triggerDataExport('all', 'json')}
                                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 rounded-xl text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                  <span>Download Complete JSON</span>
                                </button>
                              </div>
                            </div>

                            {/* Card 2: Categories (High Priority) */}
                            <div className="bg-white border-2 border-emerald-500/50 rounded-2xl p-5 shadow-xs flex flex-col justify-between relative">
                              <span className="absolute -top-2.5 right-4 bg-emerald-600 text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shadow-xs">
                                Highest Priority
                              </span>
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                                    <Layers className="w-5 h-5" />
                                  </div>
                                  <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-200">
                                    {categories.length} Categories
                                  </span>
                                </div>
                                <h4 className="font-bold text-sm text-slate-900">Categories & Subcategories</h4>
                                <p className="text-xs text-slate-500 mt-1 mb-4">
                                  Category ID, slug, title, description, category image URL, subcategory list array, and display ordering.
                                </p>
                              </div>
                              <div className="pt-2 border-t border-slate-100">
                                <button
                                  type="button"
                                  onClick={() => triggerDataExport('categories', 'json')}
                                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-xl text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                  <span>Export Categories (.json)</span>
                                </button>
                              </div>
                            </div>

                            {/* Card 3: Products Catalog */}
                            <div className="bg-white border-2 border-emerald-500/50 rounded-2xl p-5 shadow-xs flex flex-col justify-between relative">
                              <span className="absolute -top-2.5 right-4 bg-emerald-600 text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full shadow-xs">
                                Highest Priority
                              </span>
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                                    <Package className="w-5 h-5" />
                                  </div>
                                  <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-200">
                                    {products.length} Products
                                  </span>
                                </div>
                                <h4 className="font-bold text-sm text-slate-900">Products Catalog</h4>
                                <p className="text-xs text-slate-500 mt-1 mb-4">
                                  Product ID, SKU, title, slug, price, sale price, stock, category linkages, descriptions, and 3+ photo URLs.
                                </p>
                              </div>
                              <div className="pt-2 border-t border-slate-100">
                                <button
                                  type="button"
                                  onClick={() => triggerDataExport('products', 'json')}
                                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-xl text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                  <span>Export Products (.json)</span>
                                </button>
                              </div>
                            </div>

                            {/* Card 4: Variations, Sizes, Colors & Stock */}
                            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition">
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                                    <SlidersHorizontal className="w-5 h-5" />
                                  </div>
                                  <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2.5 py-0.5 rounded-full border border-blue-200">
                                    SKUs & Variants
                                  </span>
                                </div>
                                <h4 className="font-bold text-sm text-slate-900">Product Variations & Sizes</h4>
                                <p className="text-xs text-slate-500 mt-1 mb-4">
                                  Granular variant breakdown: color, size, individual SKU, unit price, and allocated inventory.
                                </p>
                              </div>
                              <div className="pt-2 border-t border-slate-100">
                                <button
                                  type="button"
                                  onClick={() => triggerDataExport('variations', 'json')}
                                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 rounded-xl text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                  <span>Export Variations (.json)</span>
                                </button>
                              </div>
                            </div>

                            {/* Card 5: Inventory & Stock Records */}
                            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition">
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                                    <TrendingUp className="w-5 h-5" />
                                  </div>
                                  <span className="text-[10px] font-bold bg-amber-50 text-amber-700 px-2.5 py-0.5 rounded-full border border-amber-200">
                                    Warehouse
                                  </span>
                                </div>
                                <h4 className="font-bold text-sm text-slate-900">Inventory & Stock Records</h4>
                                <p className="text-xs text-slate-500 mt-1 mb-4">
                                  Stock levels, stock statuses (In Stock, Low Stock, Out of Stock), unit retail prices, and product SKUs.
                                </p>
                              </div>
                              <div className="pt-2 border-t border-slate-100">
                                <button
                                  type="button"
                                  onClick={() => triggerDataExport('inventory', 'json')}
                                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 rounded-xl text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                  <span>Export Inventory (.json)</span>
                                </button>
                              </div>
                            </div>

                            {/* Card 6: Customer Orders */}
                            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition">
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                                    <ShoppingBag className="w-5 h-5" />
                                  </div>
                                  <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full border border-emerald-200">
                                    {(adminOrders || []).length} Orders
                                  </span>
                                </div>
                                <h4 className="font-bold text-sm text-slate-900">Orders & Payment Records</h4>
                                <p className="text-xs text-slate-500 mt-1 mb-4">
                                  8-Digit Tracking Numbers, TID Transaction IDs, Customer contact, Shipping address, Order items, and Total PKR.
                                </p>
                              </div>
                              <div className="pt-2 border-t border-slate-100">
                                <button
                                  type="button"
                                  onClick={() => triggerDataExport('orders', 'json')}
                                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 rounded-xl text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                  <span>Export Orders (.json)</span>
                                </button>
                              </div>
                            </div>

                            {/* Card 7: Customers & Delivery Addresses */}
                            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition">
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">
                                    <User className="w-5 h-5" />
                                  </div>
                                  <span className="text-[10px] font-bold bg-teal-50 text-teal-700 px-2.5 py-0.5 rounded-full border border-teal-200">
                                    Accounts
                                  </span>
                                </div>
                                <h4 className="font-bold text-sm text-slate-900">Customers & Addresses</h4>
                                <p className="text-xs text-slate-500 mt-1 mb-4">
                                  Authorized customer directory, WhatsApp numbers, email IDs, cities, provinces, and default delivery addresses.
                                </p>
                              </div>
                              <div className="pt-2 border-t border-slate-100">
                                <button
                                  type="button"
                                  onClick={() => triggerDataExport('customers', 'json')}
                                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 rounded-xl text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                  <span>Export Customers (.json)</span>
                                </button>
                              </div>
                            </div>

                            {/* Card 8: Hero Carousel & Banners */}
                            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition">
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center font-bold">
                                    <Sparkles className="w-5 h-5" />
                                  </div>
                                  <span className="text-[10px] font-bold bg-orange-50 text-orange-700 px-2.5 py-0.5 rounded-full border border-orange-200">
                                    {carouselSlides.length} Slides
                                  </span>
                                </div>
                                <h4 className="font-bold text-sm text-slate-900">Hero Carousel & Banners</h4>
                                <p className="text-xs text-slate-500 mt-1 mb-4">
                                  Promotional banners, festive sale badges, discount tags, button action texts, and banner image paths.
                                </p>
                              </div>
                              <div className="pt-2 border-t border-slate-100">
                                <button
                                  type="button"
                                  onClick={() => triggerDataExport('carousel', 'json')}
                                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 rounded-xl text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                  <span>Export Carousel (.json)</span>
                                </button>
                              </div>
                            </div>

                            {/* Card 9: Website Settings & Gateways */}
                            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition">
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
                                    <Settings className="w-5 h-5" />
                                  </div>
                                  <span className="text-[10px] font-bold bg-slate-50 text-slate-700 px-2.5 py-0.5 rounded-full border border-slate-200">
                                    Configuration
                                  </span>
                                </div>
                                <h4 className="font-bold text-sm text-slate-900">Store Settings & Gateways</h4>
                                <p className="text-xs text-slate-500 mt-1 mb-4">
                                  JazzCash, Easypaisa, Bank transfer accounts, QR code images, delivery charges, coupons, and support contacts.
                                </p>
                              </div>
                              <div className="pt-2 border-t border-slate-100">
                                <button
                                  type="button"
                                  onClick={() => triggerDataExport('settings', 'json')}
                                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 rounded-xl text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                  <span>Export Settings (.json)</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* SUB-TAB 2: SMART IMPORT & RESTORE */}
                      {dataMgmtTab === 'import' && (
                        <div className="space-y-6">
                          {/* Upload Box */}
                          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                                <Upload className="w-5 h-5" />
                              </div>
                              <div>
                                <h4 className="font-bold text-base text-slate-900">Upload Backup File (.json Only)</h4>
                                <p className="text-xs text-slate-500">
                                  Select an ATAL standard JSON backup. The system validates schema structure and previews all changes before modifying data.
                                </p>
                              </div>
                            </div>

                            <div className="border-2 border-dashed border-slate-300 hover:border-emerald-500 transition rounded-2xl p-8 text-center bg-slate-50/50">
                              <div className="max-w-md mx-auto space-y-3">
                                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                                  <Database className="w-6 h-6" />
                                </div>
                                <div>
                                  <p className="font-bold text-sm text-slate-800">Choose an ATAL JSON backup file (.json) to import</p>
                                  <p className="text-xs text-slate-400 mt-0.5">Supports ATAL full database JSON, products JSON, categories JSON, carousel JSON, and settings JSON.</p>
                                </div>
                                <input
                                  type="file"
                                  accept=".json,application/json"
                                  onChange={handleFileSelectedForImport}
                                  className="w-full text-xs file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-emerald-600 file:text-white hover:file:bg-emerald-700 cursor-pointer"
                                />
                                {importSelectedFile && (
                                  <p className="text-xs text-emerald-800 font-mono font-bold mt-2">
                                    Selected: {importSelectedFile.name} ({(importSelectedFile.size / 1024).toFixed(1)} KB)
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Dataset Selection Selector Bar */}
                          {importSelectedFile && importFileRawText && (
                            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                              <div>
                                <label className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                                  <Filter className="w-4 h-4 text-emerald-600" />
                                  <span>Administrator Dataset Selection:</span>
                                </label>
                                <p className="text-[11px] text-slate-500 mt-0.5">
                                  Override automatic detection if importing a specific subset (Products, Categories, Orders, Settings, Carousel) or custom JSON backup.
                                </p>
                              </div>
                              <select
                                value={selectedDatasetType}
                                onChange={(e) => handleDatasetTypeChange(e.target.value)}
                                className="bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs font-bold text-slate-800 shadow-xs focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer"
                              >
                                <option value="auto">⚡ Auto-Detect Dataset (Default)</option>
                                <option value="full">📦 Full Store Backup (All Collections)</option>
                                <option value="products">🛍️ Product Catalog</option>
                                <option value="categories">🏷️ Categories & Subcategories</option>
                                <option value="orders">🛒 Orders Dataset</option>
                                <option value="carousel">🎠 Hero Carousel & Banners</option>
                                <option value="settings">⚙️ Store Settings & Sections</option>
                              </select>
                            </div>
                          )}

                          {/* Pre-Import Validation & Simulation Preview Card */}
                          {isValidatingImport && (
                            <div className="bg-white border border-slate-200 rounded-2xl p-6 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                              <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
                              <span>Analyzing file structure, validating category hierarchies, and comparing existing records...</span>
                            </div>
                          )}

                          {importValidation && !isValidatingImport && (
                            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5">
                              {/* Requires Dataset Selection Warning Banner */}
                              {importValidation.requiresDatasetSelection && (
                                <div className="bg-amber-50 border border-amber-300 text-amber-900 rounded-2xl p-4 text-xs space-y-1">
                                  <p className="font-bold flex items-center gap-1.5 text-amber-900">
                                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                                    JSON file detected, but its dataset type could not be identified automatically.
                                  </p>
                                  <p className="text-amber-800">
                                    Please select the target dataset type (e.g. Products, Categories, Full Backup) in the dropdown above to validate and preview the records.
                                  </p>
                                </div>
                              )}

                              {/* Validation Status Header */}
                              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-slate-100">
                                <div className="flex items-center gap-3">
                                  {importValidation.isValid ? (
                                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                                      <CheckCircle2 className="w-5 h-5" />
                                    </div>
                                  ) : (
                                    <div className="w-8 h-8 rounded-full bg-red-100 text-red-700 flex items-center justify-center">
                                      <AlertCircle className="w-5 h-5" />
                                    </div>
                                  )}
                                  <div>
                                    <h4 className="font-black text-sm text-slate-900">
                                      {importValidation.isValid 
                                        ? (importValidation.warnings && importValidation.warnings.length > 0 
                                            ? 'File Validation Results (Advisories Found)' 
                                            : 'File Validation Results — Passed') 
                                        : 'File Validation Failed'}
                                    </h4>
                                    <p className="text-xs text-slate-600 mt-1 flex flex-wrap items-center gap-1.5 font-medium">
                                      <span>Detected Format:</span>
                                      <strong className="uppercase font-mono text-slate-900 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded font-bold">
                                        {importValidation.detectedFormat || importValidation.fileType || importValidation.format || 'JSON'}
                                      </strong>
                                      <span className="text-slate-300">•</span>
                                      <span>Inferred Dataset:</span>
                                      <strong className="font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                                        {importValidation.inferredDataset || importValidation.inferredType || importValidation.dataset || 'Unknown / Unsupported Dataset'}
                                      </strong>
                                    </p>
                                  </div>
                                </div>

                                <div>
                                  <span className={`text-[11px] font-black px-3 py-1 rounded-full uppercase tracking-wider border ${
                                    importValidation.isValid
                                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                      : 'bg-red-100 text-red-800 border-red-300'
                                  }`}>
                                    {importValidation.isValid ? 'Validation Status: Passed' : 'Validation Status: Failed'}
                                  </span>
                                </div>
                              </div>

                              {/* Errors or Warnings */}
                              {importValidation.errors && importValidation.errors.length > 0 && (
                                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-xs text-red-800 space-y-1">
                                  <p className="font-bold flex items-center gap-1.5"><AlertCircle className="w-4 h-4 text-red-600" /> Validation Errors:</p>
                                  <ul className="list-disc list-inside space-y-0.5">
                                    {importValidation.errors.map((err: string, idx: number) => (
                                      <li key={idx}>{err}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {importValidation.warnings && importValidation.warnings.length > 0 && (
                                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 space-y-1">
                                  <p className="font-bold flex items-center gap-1.5"><AlertTriangle className="w-4 h-4 text-amber-600" /> Validation Advisories:</p>
                                  <ul className="list-disc list-inside space-y-0.5">
                                    {importValidation.warnings.map((w: string, idx: number) => (
                                      <li key={idx}>{w}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {/* Simulation Statistics Grid */}
                              {importValidation.stats && (
                                <div>
                                  <h5 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-2">Record Simulation & Preview:</h5>
                                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    {/* Products stats */}
                                    {importValidation.stats.products && (
                                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs">
                                        <p className="font-bold text-slate-700">📦 Products</p>
                                        <p className="text-slate-500 mt-1">Incoming: <strong className="text-slate-900">{importValidation.stats.products.incomingCount}</strong></p>
                                        <p className="text-emerald-700">To Add: <strong>+{importValidation.stats.products.toAddCount}</strong></p>
                                        <p className="text-blue-700">To Update: <strong>{importValidation.stats.products.toUpdateCount}</strong></p>
                                      </div>
                                    )}

                                    {/* Categories stats */}
                                    {importValidation.stats.categories && (
                                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs">
                                        <p className="font-bold text-slate-700">🏷️ Categories</p>
                                        <p className="text-slate-500 mt-1">Incoming: <strong className="text-slate-900">{importValidation.stats.categories.incomingCount}</strong></p>
                                        <p className="text-emerald-700">To Add: <strong>+{importValidation.stats.categories.toAddCount}</strong></p>
                                        <p className="text-blue-700">To Update: <strong>{importValidation.stats.categories.toUpdateCount}</strong></p>
                                      </div>
                                    )}

                                    {/* Slides stats */}
                                    {importValidation.stats.carouselSlides && (
                                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs">
                                        <p className="font-bold text-slate-700">🎠 Hero Slides</p>
                                        <p className="text-slate-500 mt-1">Incoming: <strong className="text-slate-900">{importValidation.stats.carouselSlides.incomingCount}</strong></p>
                                      </div>
                                    )}

                                    {/* Orders stats */}
                                    {importValidation.stats.orders && (
                                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs">
                                        <p className="font-bold text-slate-700">🛍️ Orders</p>
                                        <p className="text-slate-500 mt-1">Incoming: <strong className="text-slate-900">{importValidation.stats.orders.incomingCount}</strong></p>
                                        <p className="text-emerald-700">To Add: <strong>+{importValidation.stats.orders.toAddCount}</strong></p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Category Integrity Check Card */}
                              {importValidation.categoryIntegrity && (
                                <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-4 text-xs space-y-1">
                                  <p className="font-bold text-blue-900 flex items-center gap-1.5">
                                    <ShieldCheck className="w-4 h-4 text-blue-700" />
                                    Category & Subcategory Hierarchy Integrity:
                                  </p>
                                  <p className="text-blue-800">
                                    Referenced Category Links: <strong>{importValidation.categoryIntegrity.totalReferenced}</strong> products checked • Valid: <strong>{importValidation.categoryIntegrity.validReferences}</strong>
                                  </p>
                                  {importValidation.categoryIntegrity.missingParentIds && importValidation.categoryIntegrity.missingParentIds.length > 0 && (
                                    <p className="text-amber-800 font-medium">
                                      Missing Parent Category IDs: {importValidation.categoryIntegrity.missingParentIds.join(', ')} (will be safely mapped).
                                    </p>
                                  )}
                                </div>
                              )}

                              {/* Mode Selection */}
                              <div className="pt-2">
                                <label className="font-bold text-xs uppercase tracking-wider text-slate-700 block mb-2">
                                  Select Import & Merge Mode:
                                </label>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                  {/* Mode 1: Update Existing */}
                                  <div
                                    onClick={() => setImportMode('update_existing')}
                                    className={`p-4 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between ${
                                      importMode === 'update_existing'
                                        ? 'border-emerald-600 bg-emerald-50/40 text-emerald-950'
                                        : 'border-slate-200 bg-white hover:border-slate-300'
                                    }`}
                                  >
                                    <div>
                                      <div className="flex items-center justify-between mb-1">
                                        <span className="font-bold text-xs">Update Existing (Recommended)</span>
                                        <span className="text-[10px] font-black bg-emerald-600 text-white px-2 py-0.5 rounded-full">Safe</span>
                                      </div>
                                      <p className="text-[11px] text-slate-500 mt-1">
                                        Matches records by ID/SKU/slug, updates matching items, appends new items, and preserves all other existing store data.
                                      </p>
                                    </div>
                                  </div>

                                  {/* Mode 2: Add New Only */}
                                  <div
                                    onClick={() => setImportMode('add_new')}
                                    className={`p-4 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between ${
                                      importMode === 'add_new'
                                        ? 'border-emerald-600 bg-emerald-50/40 text-emerald-950'
                                        : 'border-slate-200 bg-white hover:border-slate-300'
                                    }`}
                                  >
                                    <div>
                                      <div className="flex items-center justify-between mb-1">
                                        <span className="font-bold text-xs">Add New Only</span>
                                        <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">Additive</span>
                                      </div>
                                      <p className="text-[11px] text-slate-500 mt-1">
                                        Adds brand-new items only. Never overwrites or modifies existing items matching an existing ID or SKU.
                                      </p>
                                    </div>
                                  </div>

                                  {/* Mode 3: Full Restore */}
                                  <div
                                    onClick={() => setImportMode('full_restore')}
                                    className={`p-4 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between ${
                                      importMode === 'full_restore'
                                        ? 'border-red-600 bg-red-50/40 text-red-950'
                                        : 'border-slate-200 bg-white hover:border-slate-300'
                                    }`}
                                  >
                                    <div>
                                      <div className="flex items-center justify-between mb-1">
                                        <span className="font-bold text-xs">Full Restore (Replace)</span>
                                        <span className="text-[10px] font-black bg-red-600 text-white px-2 py-0.5 rounded-full">Warning</span>
                                      </div>
                                      <p className="text-[11px] text-slate-500 mt-1">
                                        Restores the database state from backup. An automated safety snapshot is automatically created before execution.
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Execute Button */}
                              <div className="pt-2 flex items-center justify-between">
                                <button
                                  type="button"
                                  disabled={isExecutingImport || !importValidation.isValid}
                                  onClick={handleExecuteValidatedImport}
                                  className={`font-bold px-8 py-3 rounded-2xl text-xs transition shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50 ${
                                    importMode === 'full_restore'
                                      ? 'bg-red-600 hover:bg-red-700 text-white'
                                      : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                  }`}
                                >
                                  {isExecutingImport ? (
                                    <>
                                      <RefreshCw className="w-4 h-4 animate-spin" />
                                      <span>Executing Safe Import & Backup Snapshot...</span>
                                    </>
                                  ) : (
                                    <>
                                      <Upload className="w-4 h-4" />
                                      <span>Execute Import ({importMode.replace('_', ' ').toUpperCase()})</span>
                                    </>
                                  )}
                                </button>

                                <button
                                  type="button"
                                  onClick={() => {
                                    setImportValidation(null);
                                    setImportSelectedFile(null);
                                    setImportFileRawText('');
                                  }}
                                  className="text-xs text-slate-500 hover:text-slate-700 font-bold"
                                >
                                  Cancel / Reset File
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Post-Import Execution Report */}
                          {importReport && (
                            <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-6 shadow-sm space-y-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                                  <h4 className="font-black text-sm text-emerald-950">Import Operation Completed Successfully</h4>
                                </div>
                                {importReport.autoBackupId && (
                                  <span className="font-mono text-[11px] bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-lg border border-emerald-300">
                                    Pre-Import Auto-Backup ID: {importReport.autoBackupId}
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-emerald-800">{importReport.message}</p>
                              {importReport.counts && (
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
                                  <div className="bg-white/80 p-2.5 rounded-xl border border-emerald-200">
                                    Products: <strong>{importReport.counts.products}</strong>
                                  </div>
                                  <div className="bg-white/80 p-2.5 rounded-xl border border-emerald-200">
                                    Categories: <strong>{importReport.counts.categories}</strong>
                                  </div>
                                  <div className="bg-white/80 p-2.5 rounded-xl border border-emerald-200">
                                    Carousel Slides: <strong>{importReport.counts.carouselSlides}</strong>
                                  </div>
                                  <div className="bg-white/80 p-2.5 rounded-xl border border-emerald-200">
                                    Orders: <strong>{importReport.counts.orders}</strong>
                                  </div>
                                </div>
                              )}
                              <div className="pt-2">
                                <button
                                  type="button"
                                  onClick={downloadImportReport}
                                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                  <span>Download Import Activity Report (.json)</span>
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* SUB-TAB 3: SNAPSHOT BACKUPS & HISTORY */}
                      {dataMgmtTab === 'backups' && (
                        <div className="space-y-6">
                          {/* Create Snapshot Card */}
                          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                              <div>
                                <h4 className="font-black text-base text-slate-900">Create Point-in-Time Database Snapshot</h4>
                                <p className="text-xs text-slate-500 mt-0.5">
                                  Save a complete persistent copy of all products, categories, orders, and settings directly to the server backups storage.
                                </p>
                              </div>
                              <div className="flex items-center gap-2 w-full sm:w-auto">
                                <input
                                  type="text"
                                  placeholder="Snapshot label/note (e.g. Before Catalog Update)..."
                                  value={manualSnapshotNote}
                                  onChange={(e) => setManualSnapshotNote(e.target.value)}
                                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs flex-1 sm:w-64 font-medium"
                                />
                                <button
                                  type="button"
                                  disabled={isCreatingSnapshot}
                                  onClick={handleCreateManualSnapshot}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50 whitespace-nowrap"
                                >
                                  {isCreatingSnapshot ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <HardDrive className="w-3.5 h-3.5" />}
                                  <span>{isCreatingSnapshot ? 'Creating...' : 'Create Snapshot'}</span>
                                </button>
                              </div>
                            </div>
                          </div>

                          {/* Notice */}
                          <div className="bg-blue-50/70 border border-blue-200 rounded-2xl p-4 flex items-start gap-3">
                            <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                            <div className="text-xs text-blue-950">
                              <p className="font-bold">Automated Safety Snapshot Protection</p>
                              <p className="text-blue-800 mt-0.5">
                                An automated pre-restore snapshot is systematically created before any full restore or destructive import executes. Even if you mistakenly overwrite data, you can restore any previous snapshot from the history list below with 1 click.
                              </p>
                            </div>
                          </div>

                          {/* Snapshots Table / List */}
                          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                            <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
                              <h4 className="font-bold text-sm text-slate-900">
                                Available Server Snapshots ({backupSnapshots.length})
                              </h4>
                              <button
                                type="button"
                                onClick={fetchBackupSnapshots}
                                className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
                              >
                                <RefreshCw className={`w-3.5 h-3.5 ${isLoadingBackups ? 'animate-spin' : ''}`} />
                                <span>Refresh List</span>
                              </button>
                            </div>

                            {isLoadingBackups && backupSnapshots.length === 0 ? (
                              <div className="text-center py-10 text-xs text-slate-400">Loading backup snapshots...</div>
                            ) : backupSnapshots.length === 0 ? (
                              <div className="text-center py-10 text-xs text-slate-400">
                                No backup snapshots created yet. Click "Create Snapshot" above to generate your first backup.
                              </div>
                            ) : (
                              <div className="space-y-3">
                                {backupSnapshots.map((snap: any) => (
                                  <div
                                    key={snap.id}
                                    className="border border-slate-200 rounded-2xl p-4 hover:border-slate-300 transition flex flex-col md:flex-row justify-between items-start md:items-center gap-3 bg-slate-50/30"
                                  >
                                    <div className="space-y-1">
                                      <div className="flex items-center gap-2 flex-wrap">
                                        <p className="font-mono font-bold text-xs text-slate-900">{snap.filename}</p>
                                        <span className="text-[10px] font-bold bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full">
                                          {snap.sizeFormatted}
                                        </span>
                                        {snap.note && (
                                          <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full border border-blue-200">
                                            {snap.note}
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-[11px] text-slate-400">
                                        Created: {new Date(snap.date).toLocaleString()}
                                      </p>
                                      {snap.counts && (
                                        <p className="text-[11px] text-emerald-700 font-medium">
                                          Includes: {snap.counts.products || 0} Products • {snap.counts.categories || 0} Categories • {snap.counts.slides || 0} Slides • {snap.counts.orders || 0} Orders
                                        </p>
                                      )}
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                      <button
                                        type="button"
                                        onClick={() => triggerSnapshotDownload(snap.id, snap.filename)}
                                        className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-3 py-1.5 rounded-xl text-xs transition flex items-center gap-1 cursor-pointer"
                                        title="Download snapshot JSON"
                                      >
                                        <Download className="w-3.5 h-3.5" />
                                        <span>Download</span>
                                      </button>

                                      <button
                                        type="button"
                                        disabled={isRestoringSnapshot}
                                        onClick={() => handleRestoreSnapshot(snap.id, snap.filename)}
                                        className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-3.5 py-1.5 rounded-xl text-xs transition flex items-center gap-1 cursor-pointer disabled:opacity-50"
                                        title="Restore entire database to this point in time"
                                      >
                                        <RotateCcw className="w-3.5 h-3.5" />
                                        <span>Restore</span>
                                      </button>

                                      <button
                                        type="button"
                                        onClick={() => handleDeleteSnapshot(snap.id, snap.filename)}
                                        className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-xl transition cursor-pointer"
                                        title="Delete snapshot"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ADD / EDIT PRODUCT MODAL - REDESIGNED */}
                  {isProductModalOpen && (
                    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
                      <div className="bg-white rounded-3xl max-w-2xl w-full p-8 shadow-2xl border border-slate-100 max-h-[92vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold shadow-inner">
                              <Package className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div>
                              <h3 className="font-black text-lg text-slate-900">
                                {editingProductId ? 'Edit Product Catalog Item' : 'Add New Product to ATAL Store'}
                              </h3>
                              <p className="text-xs text-slate-500">Configure pricing, variants, stock inventory, and high-res product photos.</p>
                            </div>
                          </div>
                          <button onClick={() => setIsProductModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition text-slate-400 hover:text-slate-700">
                            <X className="w-5 h-5" />
                          </button>
                        </div>

                        <form onSubmit={handleSaveProduct} className="space-y-5 text-xs">
                          <div>
                            <label className="font-black uppercase tracking-wider text-slate-700 block mb-1.5">Product Title / Name *</label>
                            <input 
                              type="text" 
                              required
                              placeholder="e.g. ATAL Luxury Festive Pret Couture"
                              value={productForm.name}
                              onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition shadow-xs"
                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                              <label className="font-black uppercase tracking-wider text-slate-700 block mb-1.5">Category *</label>
                              <select 
                                value={productForm.categoryId}
                                onChange={(e) => {
                                  const newCatId = e.target.value;
                                  const matchingCat = categories.find(c => c.id === newCatId);
                                  const defaultSub = matchingCat?.subcategories?.[0] || 'General';
                                  setProductForm({...productForm, categoryId: newCatId, subcategoryId: defaultSub});
                                }}
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition"
                              >
                                {categories.map(cat => (
                                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                              </select>
                            </div>
                          <div>
                            <label className="font-black uppercase tracking-wider text-slate-700 block mb-1.5">Custom SKU</label>
                            <input 
                              type="text" 
                              placeholder="e.g. ATAL-12345"
                              value={productForm.sku}
                              onChange={(e) => setProductForm({...productForm, sku: e.target.value})}
                              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition shadow-xs"
                            />
                          </div>
                            <div>
                              <label className="font-black uppercase tracking-wider text-slate-700 block mb-1.5">Subcategory *</label>
                              <select 
                                value={productForm.subcategoryId}
                                onChange={(e) => setProductForm({...productForm, subcategoryId: e.target.value})}
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition"
                              >
                                {(categories.find(c => c.id === productForm.categoryId)?.subcategories || ['General']).map(sub => (
                                  <option key={sub} value={sub}>{sub}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="font-black uppercase tracking-wider text-slate-700 block mb-1.5">Brand *</label>
                              <input 
                                type="text" 
                                required
                                value={productForm.brand}
                                onChange={(e) => setProductForm({...productForm, brand: e.target.value})}
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <label className="font-black uppercase tracking-wider text-slate-700 block mb-1.5">Selling Price (PKR) *</label>
                              <input 
                                type="number" 
                                required
                                value={productForm.price}
                                onChange={(e) => setProductForm({...productForm, price: Number(e.target.value)})}
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs font-mono font-bold text-emerald-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition"
                              />
                            </div>
                            <div>
                              <label className="font-black uppercase tracking-wider text-slate-700 block mb-1.5">Original Price</label>
                              <input 
                                type="number" 
                                value={productForm.originalPrice}
                                onChange={(e) => setProductForm({...productForm, originalPrice: Number(e.target.value)})}
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs font-mono font-bold text-slate-600 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition"
                              />
                            </div>
                            <div>
                              <label className="font-black uppercase tracking-wider text-slate-700 block mb-1.5">Stock Quantity *</label>
                              <input 
                                type="number" 
                                required
                                value={productForm.stock}
                                onChange={(e) => setProductForm({...productForm, stock: Number(e.target.value)})}
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs font-mono font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition"
                              />
                            </div>
                          </div>

                          <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl">
                            <label className="font-black uppercase tracking-wider text-slate-800 block mb-1 flex items-center justify-between">
                              <span>Product Images (Minimum 3 Required) *</span>
                              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">HQ Square</span>
                            </label>
                            <p className="text-[11px] text-slate-500 mb-3">Provide high-resolution image uploads or secure image URLs for all 3 angles.</p>
                            
                            <div className="space-y-3">
                              {/* Image 1 */}
                              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
                                <label className="text-[11px] font-bold text-slate-800 block mb-1">Image 1 (Primary Front Cover) *</label>
                                <input 
                                  type="file" 
                                  accept="image/*"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      const reader = new FileReader();
                                      reader.onload = (ev) => {
                                        const base64 = ev.target?.result as string;
                                        if (base64) {
                                          setProductForm({...productForm, imageUrl1: base64});
                                          showToast('Image 1 loaded successfully!');
                                        }
                                      };
                                      reader.readAsDataURL(file);
                                    }
                                  }}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-emerald-600 file:text-white"
                                />
                                <input 
                                  type="text" 
                                  placeholder="Or paste direct image URL (https://...)"
                                  value={productForm.imageUrl1.startsWith('data:') ? '' : productForm.imageUrl1}
                                  onChange={(e) => setProductForm({...productForm, imageUrl1: e.target.value})}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-2 text-xs mt-2"
                                />
                                {productForm.imageUrl1 && (
                                  <div className="mt-2 flex items-center gap-2">
                                    <img src={productForm.imageUrl1} alt="Preview 1" className="w-12 h-12 object-cover rounded-xl border shadow-xs" />
                                    <span className="text-[10px] text-emerald-700 font-bold">✓ Cover image ready</span>
                                  </div>
                                )}
                              </div>

                              {/* Image 2 */}
                              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
                                <label className="text-[11px] font-bold text-slate-800 block mb-1">Image 2 (Detail / Side Angle) *</label>
                                <input 
                                  type="file" 
                                  accept="image/*"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      const reader = new FileReader();
                                      reader.onload = (ev) => {
                                        const base64 = ev.target?.result as string;
                                        if (base64) {
                                          setProductForm({...productForm, imageUrl2: base64});
                                          showToast('Image 2 loaded successfully!');
                                        }
                                      };
                                      reader.readAsDataURL(file);
                                    }
                                  }}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-2 text-xs file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-emerald-600 file:text-white"
                                />
                                <input 
                                  type="text" 
                                  placeholder="Or paste direct image URL (https://...)"
                                  value={productForm.imageUrl2.startsWith('data:') ? '' : productForm.imageUrl2}
                                  onChange={(e) => setProductForm({...productForm, imageUrl2: e.target.value})}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-2 text-xs mt-2"
                                />
                                {productForm.imageUrl2 && (
                                  <div className="mt-2 flex items-center gap-2">
                                    <img src={productForm.imageUrl2} alt="Preview 2" className="w-12 h-12 object-cover rounded-xl border shadow-xs" />
                                    <span className="text-[10px] text-emerald-700 font-bold">✓ Detail image ready</span>
                                  </div>
                                )}
                              </div>

                              {/* Image 3 */}
                              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
                                <label className="text-[11px] font-bold text-slate-800 block mb-1">Image 3 (Lifestyle / Back Shot) *</label>
                                <input 
                                  type="file" 
                                  accept="image/*"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      const reader = new FileReader();
                                      reader.onload = (ev) => {
                                        const base64 = ev.target?.result as string;
                                        if (base64) {
                                          setProductForm({...productForm, imageUrl3: base64});
                                          showToast('Image 3 loaded successfully!');
                                        }
                                      };
                                      reader.readAsDataURL(file);
                                    }
                                  }}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-2 text-xs file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-emerald-600 file:text-white"
                                />
                                <input 
                                  type="text" 
                                  placeholder="Or paste direct image URL (https://...)"
                                  value={productForm.imageUrl3.startsWith('data:') ? '' : productForm.imageUrl3}
                                  onChange={(e) => setProductForm({...productForm, imageUrl3: e.target.value})}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-2 text-xs mt-2"
                                />
                                {productForm.imageUrl3 && (
                                  <div className="mt-2 flex items-center gap-2">
                                    <img src={productForm.imageUrl3} alt="Preview 3" className="w-12 h-12 object-cover rounded-xl border shadow-xs" />
                                    <span className="text-[10px] text-emerald-700 font-bold">✓ Lifestyle image ready</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          <div>
                            <label className="font-black uppercase tracking-wider text-slate-700 block mb-1.5">Product Description *</label>
                            <textarea 
                              rows={3} 
                              required
                              placeholder="Describe materials, fabric, features, warranty, and craftsmanship..."
                              value={productForm.description}
                              onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition"
                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="font-black uppercase tracking-wider text-slate-700 block mb-1.5">Color Variations</label>
                              <input 
                                type="text"
                                placeholder="e.g. Black, Navy Blue, Maroon"
                                value={productForm.colorsString}
                                onChange={(e) => setProductForm({...productForm, colorsString: e.target.value})}
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition"
                              />
                            </div>
                            <div>
                              <label className="font-black uppercase tracking-wider text-slate-700 block mb-1.5">Size Variations</label>
                              <input 
                                type="text"
                                placeholder="e.g. S, M, L, XL, Free Size"
                                value={productForm.sizesString}
                                onChange={(e) => setProductForm({...productForm, sizesString: e.target.value})}
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none transition"
                              />
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-6 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                            <label className="flex items-center gap-2.5 cursor-pointer font-bold text-slate-800">
                              <input 
                                type="checkbox" 
                                checked={productForm.isFlashDeal}
                                onChange={(e) => setProductForm({...productForm, isFlashDeal: e.target.checked})}
                                className="w-4 h-4 text-emerald-600 rounded accent-emerald-600"
                              />
                              <span>Flash Deal ⚡</span>
                            </label>
                            <label className="flex items-center gap-2.5 cursor-pointer font-bold text-slate-800">
                              <input 
                                type="checkbox" 
                                checked={productForm.isFeatured}
                                onChange={(e) => setProductForm({...productForm, isFeatured: e.target.checked})}
                                className="w-4 h-4 text-emerald-600 rounded accent-emerald-600"
                              />
                              <span>Featured Home Showcase</span>
                            </label>
                          </div>

                          <div className="flex gap-3 pt-4 border-t border-slate-100">
                            <button 
                              type="button"
                              onClick={() => setIsProductModalOpen(false)}
                              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-2xl transition"
                            >
                              Cancel
                            </button>
                            <button 
                              type="submit"
                              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-2xl shadow-lg transition"
                            >
                              {editingProductId ? 'Update Product Record' : 'Publish Product to Store'}
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}

                  {/* ADD / EDIT CATEGORY MODAL - REDESIGNED */}
                  {isCategoryModalOpen && (
                    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
                      <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold shadow-inner">
                              <LayoutGrid className="w-5 h-5 text-teal-700" />
                            </div>
                            <div>
                              <h3 className="font-black text-lg text-slate-900">
                                {editingCategoryId ? 'Edit Category' : 'Create New Category'}
                              </h3>
                              <p className="text-xs text-slate-500">Organize store catalog sections and subcategories.</p>
                            </div>
                          </div>
                          <button onClick={() => setIsCategoryModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition text-slate-400 hover:text-slate-700">
                            <X className="w-5 h-5" />
                          </button>
                        </div>

                        <form onSubmit={handleSaveCategory} className="space-y-4 text-xs">
                          <div>
                            <label className="font-black uppercase tracking-wider text-slate-700 block mb-1.5">Category Name *</label>
                            <input 
                              type="text" 
                              required
                              placeholder="e.g. Luxury Perfumes & Attars"
                              value={categoryForm.name}
                              onChange={(e) => setCategoryForm({...categoryForm, name: e.target.value})}
                              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none transition"
                            />
                          </div>

                          <div>
                            <label className="font-black uppercase tracking-wider text-slate-700 block mb-1.5">URL Slug</label>
                            <input 
                              type="text" 
                              placeholder="e.g. luxury-perfumes"
                              value={categoryForm.slug}
                              onChange={(e) => setCategoryForm({...categoryForm, slug: e.target.value})}
                              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs font-mono text-slate-700 focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none transition"
                            />
                          </div>

                          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                            <label className="font-black uppercase tracking-wider text-slate-800 block mb-1">Category Image / Banner *</label>
                            <p className="text-[11px] text-slate-500 mb-2">Square 1:1 or landscape ratio image banner.</p>
                            <input 
                              type="file" 
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onload = (ev) => {
                                    const base64 = ev.target?.result as string;
                                    if (base64) {
                                      setCategoryForm({...categoryForm, image: base64});
                                      showToast('Category banner loaded!');
                                    }
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                              className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-teal-600 file:text-white"
                            />
                            {categoryForm.image && (
                              <div className="mt-3 flex items-center gap-3">
                                <img src={categoryForm.image} alt="Preview" className="w-16 h-16 object-cover rounded-xl border shadow-xs" />
                                <span className="text-[11px] text-teal-800 font-bold">✓ Category image ready</span>
                              </div>
                            )}
                          </div>

                          <div>
                            <label className="font-black uppercase tracking-wider text-slate-700 block mb-1.5">Subcategories (Comma separated) *</label>
                            <input 
                              type="text" 
                              required
                              placeholder="e.g. Floral, Woody, Oriental, Fresh"
                              value={categoryForm.subcategories}
                              onChange={(e) => setCategoryForm({...categoryForm, subcategories: e.target.value})}
                              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none transition"
                            />
                          </div>

                          <div>
                            <label className="font-black uppercase tracking-wider text-slate-700 block mb-1.5">Description</label>
                            <textarea 
                              rows={2} 
                              value={categoryForm.description}
                              onChange={(e) => setCategoryForm({...categoryForm, description: e.target.value})}
                              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-teal-500 outline-none transition"
                            />
                          </div>

                          <div className="flex gap-3 pt-4 border-t border-slate-100">
                            <button 
                              type="button"
                              onClick={() => setIsCategoryModalOpen(false)}
                              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-2xl transition"
                            >
                              Cancel
                            </button>
                            <button 
                              type="submit"
                              className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 rounded-2xl shadow-lg transition"
                            >
                              {editingCategoryId ? 'Update Category' : 'Save Category'}
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}

                  {/* ADD / EDIT CAROUSEL SLIDE MODAL - REDESIGNED */}
                  {isCarouselModalOpen && (
                    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
                      <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold shadow-inner">
                              <Sparkles className="w-5 h-5 text-amber-600" />
                            </div>
                            <div>
                              <h3 className="font-black text-lg text-slate-900">
                                {editingSlideId ? 'Edit Hero Carousel Slide' : 'Add New Hero Promotion Slide'}
                              </h3>
                              <p className="text-xs text-slate-500">Configure homepage hero banners and promotional callouts.</p>
                            </div>
                          </div>
                          <button onClick={() => setIsCarouselModalOpen(false)} className="p-2 hover:bg-slate-100 rounded-full transition text-slate-400 hover:text-slate-700">
                            <X className="w-5 h-5" />
                          </button>
                        </div>

                        <form onSubmit={handleSaveSlide} className="space-y-4 text-xs">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="font-black uppercase tracking-wider text-slate-700 block mb-1.5">Badge Title *</label>
                              <input 
                                type="text" 
                                required
                                value={slideForm.badge || ''}
                                onChange={(e) => setSlideForm({...slideForm, badge: e.target.value})}
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 outline-none transition"
                              />
                            </div>
                            <div>
                              <label className="font-black uppercase tracking-wider text-slate-700 block mb-1.5">Discount Tag *</label>
                              <input 
                                type="text" 
                                required
                                value={slideForm.discount || ''}
                                onChange={(e) => setSlideForm({...slideForm, discount: e.target.value})}
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 outline-none transition"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="font-black uppercase tracking-wider text-slate-700 block mb-1.5">Slide Headline Title *</label>
                            <input 
                              type="text" 
                              required
                              value={slideForm.title || ''}
                              onChange={(e) => setSlideForm({...slideForm, title: e.target.value})}
                              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs font-bold text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 outline-none transition"
                            />
                          </div>

                          <div>
                            <label className="font-black uppercase tracking-wider text-slate-700 block mb-1.5">Subtitle *</label>
                            <input 
                              type="text" 
                              required
                              value={slideForm.subtitle || ''}
                              onChange={(e) => setSlideForm({...slideForm, subtitle: e.target.value})}
                              className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs text-slate-800 focus:bg-white focus:ring-2 focus:ring-amber-500 outline-none transition"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="font-black uppercase tracking-wider text-slate-700 block mb-1.5">Button Text *</label>
                              <input 
                                type="text" 
                                required
                                value={slideForm.buttonText || ''}
                                onChange={(e) => setSlideForm({...slideForm, buttonText: e.target.value})}
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-amber-500 outline-none transition"
                              />
                            </div>
                            <div>
                              <label className="font-black uppercase tracking-wider text-slate-700 block mb-1.5">Target Category *</label>
                              <select 
                                value={slideForm.categoryId || ''}
                                onChange={(e) => setSlideForm({...slideForm, categoryId: e.target.value})}
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3 text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-amber-500 outline-none transition"
                              >
                                {categories.map(cat => (
                                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
                            <label className="font-black uppercase tracking-wider text-slate-800 block mb-1">Banner Image (16:9 Landscape) *</label>
                            <p className="text-[11px] text-slate-500 mb-2">Upload high-res promotional slide banner.</p>
                            <input 
                              type="file" 
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onload = (ev) => {
                                    const base64 = ev.target?.result as string;
                                    if (base64) {
                                      setSlideForm({...slideForm, image: base64});
                                      showToast('Carousel slide image loaded!');
                                    }
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                              className="w-full bg-white border border-slate-200 rounded-xl p-2 text-xs file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-amber-600 file:text-white"
                            />
                            {slideForm.image && (
                              <div className="mt-3">
                                <img src={slideForm.image} alt="Preview" className="w-full h-28 object-cover rounded-xl border shadow-xs" />
                                <span className="text-[11px] text-amber-800 font-bold mt-1 inline-block">✓ Slide banner ready</span>
                              </div>
                            )}
                          </div>

                          <div className="flex gap-3 pt-4 border-t border-slate-100">
                            <button 
                              type="button"
                              onClick={() => setIsCarouselModalOpen(false)}
                              className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-2xl transition"
                            >
                              Cancel
                            </button>
                            <button 
                              type="submit"
                              className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 rounded-2xl shadow-lg transition"
                            >
                              {editingSlideId ? 'Update Hero Slide' : 'Save Hero Slide'}
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}

                  {/* ADMIN ORDER DETAILS & TID VERIFICATION MODAL */}
                  {selectedOrderDetails && (
                    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl max-h-[92vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-200">
                          <div>
                            <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                              <Package className="w-5 h-5 text-emerald-600" />
                              Order Details & TID Verification
                            </h3>
                            <p className="text-xs text-slate-500">Order ID: {selectedOrderDetails.orderNumber}</p>
                          </div>
                          <button 
                            onClick={() => setSelectedOrderDetails(null)} 
                            className="p-1 hover:bg-slate-100 rounded-full"
                          >
                            <X className="w-5 h-5 text-slate-500" />
                          </button>
                        </div>

                        <div className="space-y-4 text-xs">
                          {/* 8-Digit Tracking & Transaction ID Top Cards */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="bg-emerald-50 border-2 border-emerald-300 rounded-xl p-3.5">
                              <p className="text-[10px] font-black uppercase tracking-wider text-emerald-800">8-Digit Tracking Number</p>
                              <div className="flex items-center justify-between mt-1">
                                <span className="font-mono font-black text-lg text-emerald-900 tracking-wider">
                                  {selectedOrderDetails.trackingNumber}
                                </span>
                                <button
                                  onClick={() => {
                                    navigator.clipboard.writeText(selectedOrderDetails.trackingNumber);
                                    showToast(`Copied Tracking #${selectedOrderDetails.trackingNumber}`);
                                  }}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 shadow-sm"
                                >
                                  <Copy className="w-3 h-3" /> Copy
                                </button>
                              </div>
                              <p className="text-[10px] text-emerald-700 mt-1">Customers track with this 8-digit number</p>
                            </div>

                            <div className="bg-amber-50 border-2 border-amber-300 rounded-xl p-3.5">
                              <p className="text-[10px] font-black uppercase tracking-wider text-amber-800">Payment Transaction ID (TID)</p>
                              <div className="flex items-center justify-between mt-1">
                                <span className="font-mono font-black text-lg text-amber-950">
                                  {selectedOrderDetails.transactionReference || selectedOrderDetails.transactionId}
                                </span>
                                <button
                                  onClick={() => {
                                    const val = selectedOrderDetails.transactionReference || selectedOrderDetails.transactionId || '';
                                    navigator.clipboard.writeText(val);
                                    showToast(`Copied TID: ${val}`);
                                  }}
                                  className="bg-amber-600 hover:bg-amber-700 text-white px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 shadow-sm"
                                >
                                  <Copy className="w-3 h-3" /> Copy TID
                                </button>
                              </div>
                              <p className="text-[10px] text-amber-800 mt-1">
                                Method: <strong className="uppercase">{selectedOrderDetails.paymentMethod}</strong> • Status: <strong className="uppercase">{selectedOrderDetails.paymentStatus}</strong>
                              </p>
                            </div>
                          </div>

                          {/* Customer & Delivery Information */}
                          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                            <div className="flex justify-between items-center mb-2 pb-2 border-b border-slate-200">
                              <h4 className="font-bold text-slate-800">Customer & Shipping Address</h4>
                              <a
                                href={`https://wa.me/92${selectedOrderDetails.mobileNumber.replace(/^(\+92|0)/, '')}?text=${encodeURIComponent(`Assalam-o-Alaikum ${selectedOrderDetails.customerName}, this is ATAL Store regarding your order with 8-Digit Tracking #${selectedOrderDetails.trackingNumber} and Transaction ID: ${selectedOrderDetails.transactionReference || selectedOrderDetails.transactionId}.`)}`}
                                target="_blank"
                                rel="noreferrer"
                                className="bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 shadow-sm transition"
                              >
                                <MessageCircle className="w-3.5 h-3.5" /> Chat on WhatsApp
                              </a>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div>
                                <p className="text-slate-400">Full Name</p>
                                <p className="font-bold text-slate-800">{selectedOrderDetails.customerName}</p>
                              </div>
                              <div>
                                <p className="text-slate-400">Mobile Number</p>
                                <p className="font-mono font-bold text-slate-800">{selectedOrderDetails.mobileNumber}</p>
                              </div>
                              <div>
                                <p className="text-slate-400">City & Province</p>
                                <p className="font-bold text-slate-800">{selectedOrderDetails.city}, {selectedOrderDetails.province}</p>
                              </div>
                              <div>
                                <p className="text-slate-400">Order Placed Date</p>
                                <p className="font-bold text-slate-800">{new Date(selectedOrderDetails.createdAt).toLocaleString()}</p>
                              </div>
                              <div className="col-span-2">
                                <p className="text-slate-400">Complete Delivery Address</p>
                                <p className="font-bold text-slate-800 bg-white p-2 rounded-lg border border-slate-200 mt-1">
                                  {selectedOrderDetails.address} {selectedOrderDetails.area ? `(${selectedOrderDetails.area})` : ''}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Ordered Products Table */}
                          <div>
                            <h4 className="font-bold text-slate-800 mb-2">Package Items ({selectedOrderDetails.items.length})</h4>
                            <div className="space-y-2 max-h-48 overflow-y-auto">
                              {selectedOrderDetails.items.map((item, idx) => (
                                <div key={idx} className="flex items-center gap-3 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                                  <img src={item.image} alt="" className="w-12 h-12 rounded-lg object-cover bg-white" />
                                  <div className="flex-1">
                                    <p className="font-bold text-slate-900">{item.productName}</p>
                                    <p className="text-slate-400 text-[10px]">{item.variantName ? `Variant: ${item.variantName} | ` : ''}SKU: {item.sku}</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-slate-600">PKR {item.unitPrice.toLocaleString()} x {item.quantity}</p>
                                    <p className="font-black text-emerald-700">PKR {item.total.toLocaleString()}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Payment Summary */}
                          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1.5">
                            <div className="flex justify-between text-slate-600">
                              <span>Subtotal:</span>
                              <span>PKR {selectedOrderDetails.subtotal.toLocaleString()}</span>
                            </div>
                            {selectedOrderDetails.discount > 0 && (
                              <div className="flex justify-between text-emerald-600 font-bold">
                                <span>Discount:</span>
                                <span>- PKR {selectedOrderDetails.discount.toLocaleString()}</span>
                              </div>
                            )}
                            <div className="flex justify-between text-slate-600">
                              <span>Delivery Fee:</span>
                              <span>PKR {selectedOrderDetails.shippingCharges}</span>
                            </div>
                            <div className="flex justify-between text-slate-900 font-black text-sm pt-2 border-t border-slate-200">
                              <span>Total Amount:</span>
                              <span className="text-emerald-700">PKR {selectedOrderDetails.totalAmount.toLocaleString()}</span>
                            </div>
                          </div>

                          {/* Update Status and Note */}
                          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                            <h4 className="font-bold text-slate-800 mb-2">Update Order Status</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                              <div>
                                <label className="text-[10px] font-bold text-slate-500 block mb-1">Status</label>
                                <select 
                                  value={selectedOrderDetails.orderStatus}
                                  onChange={(e) => {
                                    const nextStatus = e.target.value;
                                    updateOrderStatus(selectedOrderDetails.id, nextStatus, adminStatusNote || `Status changed to ${nextStatus}`);
                                  }}
                                  className="w-full bg-white border border-slate-300 rounded-xl p-2 font-bold"
                                >
                                  <option value="Pending Confirmation">Pending Confirmation</option>
                                  <option value="Confirmed">Confirmed</option>
                                  <option value="Processing">Processing</option>
                                  <option value="Ready to Ship">Ready to Ship</option>
                                  <option value="Shipped">Shipped</option>
                                  <option value="Out for Delivery">Out for Delivery</option>
                                  <option value="Delivered">Delivered</option>
                                  <option value="Cancelled">Cancelled</option>
                                </select>
                              </div>
                              <div>
                                <label className="text-[10px] font-bold text-slate-500 block mb-1">Custom Timeline Note</label>
                                <div className="flex gap-2">
                                  <input 
                                    type="text" 
                                    placeholder="e.g. TID verified on JazzCash app" 
                                    value={adminStatusNote}
                                    onChange={(e) => setAdminStatusNote(e.target.value)}
                                    className="w-full bg-white border border-slate-300 rounded-xl p-2 text-xs"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (!adminStatusNote.trim()) {
                                        showToast('Please enter a note');
                                        return;
                                      }
                                      updateOrderStatus(selectedOrderDetails.id, selectedOrderDetails.orderStatus, adminStatusNote.trim());
                                      setAdminStatusNote('');
                                      showToast('Timeline note added!');
                                    }}
                                    className="bg-slate-900 text-white px-3 py-2 rounded-xl font-bold whitespace-nowrap"
                                  >
                                    Add Note
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* Status Timeline History */}
                            <div className="mt-3 pt-2 border-t border-slate-200">
                              <p className="font-bold text-[11px] text-slate-700 mb-1.5">Official Timeline:</p>
                              <div className="space-y-1.5">
                                {selectedOrderDetails.statusHistory.map((h, i) => (
                                  <div key={i} className="flex items-center gap-2 text-[11px] text-slate-600">
                                    <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                                    <span className="font-bold text-slate-800">{h.status}</span>
                                    <span className="text-slate-400 text-[10px]">({new Date(h.timestamp).toLocaleTimeString()})</span>
                                    <span className="text-slate-500 italic">- {h.note}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="mt-5 pt-3 border-t border-slate-200 flex justify-end">
                          <button
                            onClick={() => setSelectedOrderDetails(null)}
                            className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-5 py-2.5 rounded-xl text-xs"
                          >
                            Close Details
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* APP FOOTER: LIGHT GREEN STYLING & OFFICIAL ATAL CONTACT   */}
          {/* ======================================================== */}
          <footer className="bg-[#f0fdf4] text-slate-800 pt-10 pb-28 md:pb-10 border-t border-emerald-200/80 select-none mt-12">
            <div className="max-w-7xl mx-auto px-4">
              {/* Trust Highlights */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pb-8 border-b border-emerald-200/80 text-center sm:text-left">
                <div className="bg-white/80 border border-emerald-200/80 rounded-2xl p-3 shadow-xs flex flex-col sm:flex-row items-center sm:items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-300/60 flex items-center justify-center text-emerald-800 shrink-0">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-emerald-950 text-xs sm:text-sm">Nationwide Delivery</h4>
                    <p className="text-[11px] text-emerald-800/80 mt-0.5">Free on orders above PKR 9,999</p>
                  </div>
                </div>

                <div className="bg-white/80 border border-emerald-200/80 rounded-2xl p-3 shadow-xs flex flex-col sm:flex-row items-center sm:items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-300/60 flex items-center justify-center text-emerald-800 shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-emerald-950 text-xs sm:text-sm">100% Genuine Items</h4>
                    <p className="text-[11px] text-emerald-800/80 mt-0.5">Direct from verified suppliers</p>
                  </div>
                </div>

                <div className="bg-white/80 border border-emerald-200/80 rounded-2xl p-3 shadow-xs flex flex-col sm:flex-row items-center sm:items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-300/60 flex items-center justify-center text-emerald-800 shrink-0">
                    <RotateCcw className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-emerald-950 text-xs sm:text-sm">7-Day Easy Returns</h4>
                    <p className="text-[11px] text-emerald-800/80 mt-0.5">Doorstep pickup & fast refunds</p>
                  </div>
                </div>

                <div className="bg-white/80 border border-emerald-200/80 rounded-2xl p-3 shadow-xs flex flex-col sm:flex-row items-center sm:items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 border border-emerald-300/60 flex items-center justify-center text-emerald-800 shrink-0">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-emerald-950 text-xs sm:text-sm">24/7 WhatsApp Help</h4>
                    <p className="text-[11px] text-emerald-800/80 mt-0.5">Instant human assistance</p>
                  </div>
                </div>
              </div>

              {/* Main Footer Links */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 py-8 border-b border-emerald-200/80">
                {/* Brand Column (Exact User Copy) */}
                <div className="md:col-span-5 space-y-3">
                  <div className="flex items-center gap-3">
                    <img 
                      src="/assets/aistudio/WhatsApp_Image_2026-09-29_at_12.21.56_PM_187de251.jpeg" 
                      alt="ATAL Logo" 
                      className="w-10 h-10 rounded-xl object-contain bg-[#062419] p-0.5 border border-emerald-600/40 shadow-xs"
                    />
                    <div>
                      <h3 className="text-xl font-black text-emerald-950 tracking-wider leading-none">ATAL</h3>
                      <p className="text-xs text-emerald-700 font-semibold tracking-wide mt-1">Shop Smart. Live Better</p>
                    </div>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed font-medium">
                    <span className="font-bold text-emerald-950 block mb-1">ATAL – Shop Smart. Live Better. 🛍️</span>
                    Your trusted online store for beauty, cosmetics, perfumes, fashion & electronics—quality products, stylish choices, and easy shopping, all in one place.
                  </p>
                  <div className="pt-2 flex flex-wrap gap-2.5">
                    <a 
                      href="https://wa.me/923719150297" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-3 py-1.5 rounded-xl text-xs shadow-xs transition"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp: 03719150297</span>
                    </a>
                    <a 
                      href="mailto:contact.to.atal@gmail.com"
                      className="inline-flex items-center gap-1.5 bg-white hover:bg-emerald-100/70 text-emerald-900 border border-emerald-300 font-bold px-3 py-1.5 rounded-xl text-xs shadow-xs transition"
                    >
                      <Mail className="w-3.5 h-3.5 text-emerald-700" />
                      <span>contact.to.atal@gmail.com</span>
                    </a>
                  </div>

                  {/* Official Social Media Channels */}
                  <div className="pt-2">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-950/80 mb-2 flex items-center gap-1.5">
                      <span>Follow ATAL Official:</span>
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      <a 
                        href="https://www.instagram.com/atal.pakistan?stkn=dXM2NTl0bHBzZ21n" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 bg-gradient-to-r from-[#833ab4] via-[#fd1d1d] to-[#fcb045] hover:opacity-90 text-white font-bold px-3 py-1.5 rounded-xl text-xs shadow-xs transition"
                        title="Follow ATAL on Instagram"
                      >
                        <Instagram className="w-3.5 h-3.5" />
                        <span>Instagram</span>
                      </a>
                      <a 
                        href="https://www.tiktok.com/@atal.pakistan" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 bg-black hover:bg-neutral-800 text-white font-bold px-3 py-1.5 rounded-xl text-xs shadow-xs transition"
                        title="Follow ATAL on TikTok"
                      >
                        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.81 4.46 6.27 6.27 0 0 0 1.93-4.46V8.71a8.18 8.18 0 0 0 4.85 1.57v-3.59a4.85 4.85 0 0 1-1-.002Z"/>
                        </svg>
                        <span>TikTok</span>
                      </a>
                      <a 
                        href="https://www.facebook.com/share/1DgG52novy/" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 bg-[#1877F2] hover:bg-[#166fe5] text-white font-bold px-3 py-1.5 rounded-xl text-xs shadow-xs transition"
                        title="Follow ATAL on Facebook"
                      >
                        <Facebook className="w-3.5 h-3.5" />
                        <span>Facebook</span>
                      </a>
                    </div>
                  </div>
                </div>

                {/* Categories */}
                <div className="md:col-span-4">
                  <h4 className="font-black text-emerald-950 mb-3 uppercase tracking-wider text-xs">Categories</h4>
                  <ul className="space-y-2 text-xs">
                    <li>
                      <button 
                        onClick={() => handleOpenCategory('cat-men')} 
                        className="text-slate-700 hover:text-emerald-800 font-medium transition text-left cursor-pointer"
                      >
                        Men's Formal & Casual Wear
                      </button>
                    </li>
                    <li>
                      <button 
                        onClick={() => handleOpenCategory('cat-women')} 
                        className="text-slate-700 hover:text-emerald-800 font-medium transition text-left cursor-pointer"
                      >
                        Women's Pret, Lawn & Handbags
                      </button>
                    </li>
                    <li>
                      <button 
                        onClick={() => handleOpenCategory('cat-kids')} 
                        className="text-slate-700 hover:text-emerald-800 font-medium transition text-left cursor-pointer"
                      >
                        Kids Festive & Casual Wear
                      </button>
                    </li>
                    <li>
                      <button 
                        onClick={() => handleOpenCategory('cat-cosmetics')} 
                        className="text-slate-700 hover:text-emerald-800 font-medium transition text-left cursor-pointer"
                      >
                        Cosmetics, Skincare & Perfumes
                      </button>
                    </li>
                    <li>
                      <button 
                        onClick={() => handleOpenCategory('cat-electronics')} 
                        className="text-slate-700 hover:text-emerald-800 font-medium transition text-left cursor-pointer"
                      >
                        Audio, Earbuds & Smart Gadgets
                      </button>
                    </li>
                  </ul>
                </div>

                {/* Quick Navigation */}
                <div className="md:col-span-3">
                  <h4 className="font-black text-emerald-950 mb-3 uppercase tracking-wider text-xs">Quick Links</h4>
                  <ul className="space-y-2 text-xs">
                    <li>
                      <Link 
                        to="/" 
                        className="text-slate-700 hover:text-emerald-800 font-medium transition flex items-center gap-1.5"
                      >
                        <span>Home</span>
                      </Link>
                    </li>
                    <li>
                      <Link 
                        to="/shop" 
                        className="text-slate-700 hover:text-emerald-800 font-medium transition flex items-center gap-1.5"
                      >
                        <span>Shop Catalog & Categories</span>
                      </Link>
                    </li>
                    <li>
                      <Link 
                        to="/orders" 
                        className="text-slate-700 hover:text-emerald-800 font-medium transition flex items-center gap-1.5"
                      >
                        <Truck className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Track 8-Digit Order</span>
                      </Link>
                    </li>
                    <li>
                      <button 
                        onClick={() => { setIsCartOpen(true); }} 
                        className="text-slate-700 hover:text-emerald-800 font-medium transition flex items-center gap-1.5 cursor-pointer text-left"
                      >
                        <ShoppingBag className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Shopping Cart ({cart.reduce((a, c) => a + c.quantity, 0)})</span>
                      </button>
                    </li>
                    <li>
                      <Link 
                        to="/checkout" 
                        className="text-slate-700 hover:text-emerald-800 font-medium transition flex items-center gap-1.5"
                      >
                        <span>Secure Checkout</span>
                      </Link>
                    </li>
                    <li>
                      <Link 
                        to="/account" 
                        className="text-slate-700 hover:text-emerald-800 font-medium transition flex items-center gap-1.5"
                      >
                        <User className="w-3.5 h-3.5 text-emerald-700" />
                        <span>{currentCustomer ? 'My Account' : 'Sign In & Register'}</span>
                      </Link>
                    </li>
                    <li>
                      <Link 
                        to="/support" 
                        className="text-slate-700 hover:text-emerald-800 font-medium transition flex items-center gap-1.5"
                      >
                        <span>Customer Support & FAQs</span>
                      </Link>
                    </li>
                    <li>
                      <Link 
                        to="/admin" 
                        className="text-slate-700 hover:text-emerald-800 font-medium transition flex items-center gap-1.5"
                      >
                        <Lock className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Admin and Staff Portal</span>
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Copyright & Bottom Bar */}
              <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-emerald-900/80 gap-3">
                <div className="flex items-center gap-2 text-center sm:text-left">
                  <img 
                    src="/assets/aistudio/WhatsApp_Image_2026-09-29_at_12.21.56_PM_187de251.jpeg" 
                    alt="ATAL" 
                    className="w-5 h-5 rounded-md object-contain bg-[#062419]"
                  />
                  <span>© 2026 ATAL Pakistan. All rights reserved. Shop Smart. Live Better.</span>
                </div>
                <div className="flex flex-wrap items-center justify-center sm:justify-end gap-3 text-[11px] text-emerald-900/80">
                  <div className="flex items-center gap-1.5">
                    <a 
                      href="https://www.instagram.com/atal.pakistan?stkn=dXM2NTl0bHBzZ21n" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-6 h-6 rounded-lg bg-emerald-200/70 hover:bg-emerald-300 text-emerald-950 flex items-center justify-center transition"
                      title="ATAL on Instagram"
                    >
                      <Instagram className="w-3.5 h-3.5" />
                    </a>
                    <a 
                      href="https://www.tiktok.com/@atal.pakistan" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-6 h-6 rounded-lg bg-emerald-200/70 hover:bg-emerald-300 text-emerald-950 flex items-center justify-center transition"
                      title="ATAL on TikTok"
                    >
                      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.81 4.46 6.27 6.27 0 0 0 1.93-4.46V8.71a8.18 8.18 0 0 0 4.85 1.57v-3.59a4.85 4.85 0 0 1-1-.002Z"/>
                      </svg>
                    </a>
                    <a 
                      href="https://www.facebook.com/share/1DgG52novy/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="w-6 h-6 rounded-lg bg-emerald-200/70 hover:bg-emerald-300 text-emerald-950 flex items-center justify-center transition"
                      title="ATAL on Facebook"
                    >
                      <Facebook className="w-3.5 h-3.5" />
                    </a>
                  </div>
                  <span className="text-emerald-900/30 hidden sm:inline">|</span>
                  <div className="flex items-center gap-2 text-emerald-900/70">
                    <span>Lahore</span>
                    <span>•</span>
                    <span>Karachi</span>
                    <span>•</span>
                    <span>Islamabad</span>
                    <span>•</span>
                    <span>Nationwide 🇵🇰</span>
                  </div>
                </div>
              </div>
            </div>
          </footer>

        </div>

        {/* FIXED BOTTOM NAVIGATION BAR - ONLY IN MOBILE VIEW */}
        <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 py-1.5 px-2 flex items-center justify-around shadow-lg md:hidden select-none">
          {/* 1. Home (with active warm-amber pill highlight & spring animation) */}
          <button 
            onClick={() => {
              if (location.pathname !== '/') {
                navigate('/');
              } else {
                setSelectedCategory(null);
                setSelectedSubcategory(null);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            className={`flex flex-col items-center justify-center nav-item-spring cursor-pointer ${
              currentView === 'home' && !isWishlistOpen
                ? 'bg-[#fef08a] text-slate-950 font-bold px-3 py-1 rounded-full shadow-xs animate-spring-pill' 
                : 'text-slate-500 hover:text-slate-900 p-1'
            }`}
            title="Home"
          >
            <Home className={`w-4 h-4 ${
              currentView === 'home' && !isWishlistOpen 
                ? 'fill-slate-950 text-slate-950 animate-spring-icon' 
                : 'text-slate-500'
            }`} />
            <span className="text-[10px] leading-tight mt-0.5 font-bold">Home</span>
          </button>

          {/* 2. Categories (full category browser) */}
          <button 
            onClick={() => {
              if (location.pathname !== '/shop') {
                navigate('/shop');
              } else {
                setSelectedCategory(null);
                setSelectedSubcategory(null);
              }
            }}
            className={`flex flex-col items-center justify-center nav-item-spring cursor-pointer ${
              currentView === 'products' && !isWishlistOpen
                ? 'bg-emerald-50 text-emerald-800 font-bold px-3 py-1 rounded-full shadow-xs animate-spring-pill' 
                : 'text-slate-500 hover:text-slate-900 p-1'
            }`}
            title="Categories (full category browser)"
          >
            <LayoutGrid className={`w-4 h-4 ${
              currentView === 'products' && !isWishlistOpen 
                ? 'text-emerald-700 animate-spring-icon' 
                : 'text-slate-500'
            }`} />
            <span className="text-[10px] leading-tight mt-0.5 font-bold">Categories</span>
          </button>

          {/* 3. Account (Customer account with Email, WhatsApp, and Password) */}
          <button 
            onClick={() => {
              if (location.pathname !== '/account') {
                navigate('/account');
              }
            }}
            className={`flex flex-col items-center justify-center nav-item-spring cursor-pointer ${
              currentView === 'account' && !isWishlistOpen
                ? 'bg-emerald-50 text-emerald-800 font-bold px-3 py-1 rounded-full shadow-xs animate-spring-pill' 
                : 'text-slate-500 hover:text-slate-900 p-1'
            }`}
            title="Customer Account"
          >
            <div className="relative">
              <User className={`w-4 h-4 ${
                currentView === 'account' && !isWishlistOpen 
                  ? 'text-emerald-700 animate-spring-icon' 
                  : 'text-slate-500'
              }`} />
              {currentCustomer && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 absolute -top-0.5 -right-0.5"></span>
              )}
            </div>
            <span className="text-[10px] leading-tight mt-0.5 font-bold">
              {currentCustomer ? currentCustomer.name.split(' ')[0] : 'Account'}
            </span>
          </button>

          {/* 4. My Orders (direct 8-digit tracking lookup) */}
          <button 
            onClick={() => {
              if (location.pathname !== '/orders') {
                navigate('/orders');
              }
            }}
            className={`flex flex-col items-center justify-center nav-item-spring cursor-pointer ${
              currentView === 'orders' && !isWishlistOpen
                ? 'bg-emerald-50 text-emerald-800 font-bold px-3 py-1 rounded-full shadow-xs animate-spring-pill' 
                : 'text-slate-500 hover:text-slate-900 p-1'
            }`}
            title="My Orders (direct 8-digit tracking lookup)"
          >
            <Truck className={`w-4 h-4 ${
              currentView === 'orders' && !isWishlistOpen 
                ? 'text-emerald-700 animate-spring-icon' 
                : 'text-slate-500'
            }`} />
            <span className="text-[10px] leading-tight mt-0.5 font-bold">My Orders</span>
          </button>

          {/* 5. wishlist (with live quantity badge) */}
          <button 
            onClick={() => setIsWishlistOpen(true)}
            className={`flex flex-col items-center justify-center relative nav-item-spring cursor-pointer ${
              isWishlistOpen 
                ? 'bg-red-50 text-red-600 font-bold px-3 py-1 rounded-full shadow-xs animate-spring-pill' 
                : 'text-slate-500 hover:text-slate-900 p-1'
            }`}
            title="wishlist (with live quantity badge)"
          >
            <Heart className={`w-4 h-4 ${
              isWishlistOpen 
                ? 'fill-red-500 text-red-500 animate-spring-icon' 
                : wishlist.length > 0 
                  ? 'fill-red-500/20 text-red-500' 
                  : 'text-slate-500'
            }`} />
            <span className="text-[10px] leading-tight mt-0.5 font-bold">wishlist</span>
            {wishlist.length > 0 && (
              <span className="absolute -top-0.5 right-1.5 bg-amber-400 text-slate-950 font-black text-[9px] w-3.5 h-3.5 rounded-full flex items-center justify-center shadow-xs animate-spring-badge">
                {wishlist.length}
              </span>
            )}
          </button>
        </nav>

        {/* WISHLIST DRAWER MODAL */}
        {isWishlistOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex justify-end">
            <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col p-6 animate-slide-left">
              <div className="flex justify-between items-center pb-4 border-b border-slate-200">
                <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-red-500 fill-red-500" /> Saved Wishlist ({wishlist.length})
                </h3>
                <button onClick={() => setIsWishlistOpen(false)} className="p-2 hover:bg-slate-100 rounded-full">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-4 space-y-3">
                {wishlist.length === 0 ? (
                  <div className="text-center py-16 text-slate-400">
                    <Heart className="w-12 h-12 mx-auto mb-3 opacity-30 text-slate-300" />
                    <p className="text-sm font-bold text-slate-700">Your wishlist is empty</p>
                    <p className="text-xs text-slate-400 mt-1">Explore our festive collections and tap the heart icon to save items.</p>
                  </div>
                ) : (
                  wishlist.map(prodId => {
                    const prod = products.find(p => p.id === prodId);
                    if (!prod) return null;
                    return (
                      <div key={prod.id} className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200 hover:shadow-xs transition">
                        <img 
                          src={getPrimaryProductImage(prod)} 
                          alt={prod.name} 
                          className="w-14 h-14 rounded-xl object-cover bg-white shrink-0 border border-slate-100" 
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] text-amber-700 font-bold uppercase tracking-wider">{prod.brand}</p>
                          <h4 className="font-bold text-xs text-slate-900 truncate">{prod.name}</h4>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="font-black text-xs text-emerald-700">PKR {prod.price.toLocaleString()}</span>
                            {prod.originalPrice && (
                              <span className="text-[10px] text-slate-400 line-through">PKR {prod.originalPrice.toLocaleString()}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col gap-1 shrink-0">
                          <button 
                            onClick={() => {
                              addToCart(prod, prod.variants?.[0]);
                              showToast(`Added ${prod.name} to cart!`);
                            }}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-2.5 py-1 text-[10px] font-bold shadow-xs transition"
                          >
                            + Cart
                          </button>
                          <button 
                            onClick={() => toggleWishlist(prod.id)}
                            className="text-slate-400 hover:text-red-500 p-1 flex items-center justify-center text-[10px]"
                            title="Remove from wishlist"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {wishlist.length > 0 && (
                <div className="border-t border-slate-200 pt-4 flex gap-2">
                  <button 
                    onClick={() => {
                      wishlist.forEach(id => {
                        const p = products.find(prod => prod.id === id);
                        if (p) addToCart(p, p.variants?.[0]);
                      });
                      setIsWishlistOpen(false);
                      setIsCartOpen(true);
                      showToast('All wishlist items moved to cart!');
                    }}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl shadow-md transition text-xs"
                  >
                    Move All to Cart
                  </button>
                  <button 
                    onClick={() => setWishlist([])}
                    className="px-3 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-semibold"
                  >
                    Clear
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* CART DRAWER MODAL */}
        {isCartOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex justify-end">
            <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col p-6 animate-slide-left">
              <div className="flex justify-between items-center pb-4 border-b border-slate-200">
                <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-emerald-600" /> Your Shopping Cart ({cart.reduce((a,c) => a + c.quantity, 0)})
                </h3>
                <button 
                  onClick={() => {
                    setIsCartOpen(false);
                    if (location.pathname === '/cart') {
                      handleBackNavigation('/');
                    }
                  }} 
                  className="p-2 hover:bg-slate-100 rounded-full cursor-pointer"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto py-4 space-y-4">
                {cart.length === 0 ? (
                  <div className="text-center py-16 text-slate-400">
                    <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-40" />
                    <p className="text-sm font-bold text-slate-700">Your cart is empty</p>
                    <p className="text-xs text-slate-400 mt-1">Explore our collections and add items to cart.</p>
                  </div>
                ) : (
                  cart.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                      <img src={getPrimaryProductImage(item.product)} alt="" className="w-16 h-16 rounded-xl object-cover bg-white" />
                      <div className="flex-1">
                        <h4 className="font-bold text-xs text-slate-900 line-clamp-1">{item.product?.name}</h4>
                        <p className="text-[11px] text-slate-500 mb-1">{item.selectedVariant?.name || 'Standard'}</p>
                        <p className="font-black text-xs text-emerald-700">PKR {(item.selectedVariant?.price || item.product?.price || 0).toLocaleString()}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => {
                            setCart(prev => prev.map((it, i) => i === idx ? { ...it, quantity: Math.max(1, it.quantity - 1) } : it));
                          }}
                          className="w-6 h-6 bg-white border rounded-full flex items-center justify-center text-xs font-bold"
                        >-</button>
                        <span className="text-xs font-bold">{item.quantity}</span>
                        <button 
                          onClick={() => {
                            setCart(prev => prev.map((it, i) => i === idx ? { ...it, quantity: it.quantity + 1 } : it));
                          }}
                          className="w-6 h-6 bg-white border rounded-full flex items-center justify-center text-xs font-bold"
                        >+</button>
                      </div>
                      <button 
                        onClick={() => setCart(prev => prev.filter((_, i) => i !== idx))}
                        className="text-slate-400 hover:text-red-500 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {cart.length > 0 && (
                <div className="border-t border-slate-200 pt-4">
                  <div className="flex justify-between items-center text-sm font-bold mb-4">
                    <span>Subtotal:</span>
                    <span className="text-emerald-700">PKR {subtotal.toLocaleString()}</span>
                  </div>
                  <button 
                    onClick={() => {
                      setIsCartOpen(false);
                      navigate('/checkout');
                    }}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl shadow-lg transition text-xs cursor-pointer"
                  >
                    Proceed to Pakistan Checkout
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* DELIVERY LOCATION MODAL */}
        {isLocationModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-black text-base text-slate-900">Select Delivery City</h3>
                <button onClick={() => setIsLocationModalOpen(false)} className="p-1 hover:bg-slate-100 rounded-full">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
              <p className="text-xs text-slate-500 mb-4">Choose your city for accurate shipping estimates across Pakistan.</p>
              
              <div className="grid grid-cols-3 gap-2 max-h-60 overflow-y-auto mb-4">
                {PAKISTANI_CITIES.map(city => (
                  <button
                    key={city}
                    onClick={() => {
                      setSelectedLocation(city);
                      setIsLocationModalOpen(false);
                      showToast(`Delivery location set to ${city}`);
                    }}
                    className={`p-2.5 rounded-xl text-xs font-bold border transition ${selectedLocation === city ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'}`}
                  >
                    {city}
                  </button>
                ))}
              </div>
              <button 
                onClick={() => setIsLocationModalOpen(false)}
                className="w-full bg-slate-900 text-white py-2.5 rounded-xl text-xs font-bold"
              >
                Confirm Location
              </button>
            </div>
          </div>
        )}

        {/* SIMULATED AUTOMATED EMAIL SERVICE RECEIPT MODAL */}
        {isEmailReceiptModalOpen && selectedEmailOrder && (
          <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
              
              {/* Modal App Header */}
              <div className="bg-slate-900 text-white px-5 py-4 flex items-center justify-between border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
                    <Mail className="w-5 h-5 text-blue-300" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white flex items-center gap-2">
                      <span>Automated Receipt Email</span>
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-mono font-normal px-2 py-0.5 rounded-full border border-emerald-500/30">
                        Simulated Service
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Dispatched by ATAL Automated Mail Delivery Placeholder
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsEmailReceiptModalOpen(false)}
                  className="p-1.5 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Email Envelope Header Bar (Simulating Webmail / Gmail client header) */}
              <div className="bg-slate-50 border-b border-slate-200 p-4 text-xs space-y-2">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-1">
                  <span className="font-bold text-slate-900 text-sm">
                    Order Confirmation #{selectedEmailOrder.trackingNumber} - ATAL Pakistan
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {new Date(selectedEmailOrder.createdAt).toLocaleString('en-PK', { dateStyle: 'medium', timeStyle: 'short' })}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] text-slate-600 pt-1">
                  <div>
                    <span className="text-slate-400">From: </span>
                    <strong className="text-slate-800">{storeSettings.storeName} Official Orders</strong> &lt;{storeSettings.supportEmail}&gt;
                  </div>
                  <div>
                    <span className="text-slate-400">To: </span>
                    <strong className="text-emerald-700 font-mono">{selectedEmailOrder.email || currentCustomer?.email || 'Valued Customer'}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400">Service: </span>
                    <span className="bg-blue-50 text-blue-800 border border-blue-200 px-1.5 py-0.2 rounded font-medium">ATAL Mailer Engine (Simulated)</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Tracking Code: </span>
                    <strong className="font-mono text-emerald-800">{selectedEmailOrder.trackingNumber}</strong>
                  </div>
                </div>
              </div>

              {/* Simulated HTML Email Content Body */}
              <div className="p-6 max-h-[60vh] overflow-y-auto space-y-6 text-xs bg-white">
                
                {/* Email Branding Hero */}
                <div className="bg-gradient-to-r from-emerald-800 to-teal-900 rounded-2xl p-6 text-white text-center shadow-inner relative overflow-hidden">
                  <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center mx-auto mb-2 border border-white/20">
                    <CheckCheck className="w-6 h-6 text-emerald-300" />
                  </div>
                  <h2 className="text-lg font-black tracking-wide text-white">ATAL PAKISTAN</h2>
                  <p className="text-[11px] text-emerald-200 font-medium">Order Confirmation & Official Electronic Receipt</p>
                  <p className="text-xs text-white/90 mt-2 max-w-md mx-auto">
                    Dear <strong>{selectedEmailOrder.customerName}</strong>, thank you for your order! Your purchase is confirmed and currently in dispatch preparation.
                  </p>
                </div>

                {/* Key Summary Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-center">
                  <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">8-Digit Tracking</span>
                    <span className="font-mono font-black text-sm text-emerald-700 mt-0.5 block">{selectedEmailOrder.trackingNumber}</span>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Payment / TID</span>
                    <span className="font-mono font-bold text-xs text-slate-800 mt-0.5 block truncate" title={selectedEmailOrder.transactionReference}>
                      {selectedEmailOrder.transactionReference || selectedEmailOrder.transactionId || 'ADV-PAID'}
                    </span>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl col-span-2 sm:col-span-1">
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Delivery City</span>
                    <span className="font-bold text-xs text-slate-800 mt-0.5 block">{selectedEmailOrder.city}</span>
                  </div>
                </div>

                {/* Shipping Details */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-1.5 text-xs">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Shipping Destination</span>
                  </h4>
                  <p className="text-slate-700 text-xs">
                    <strong>{selectedEmailOrder.customerName}</strong> • {selectedEmailOrder.mobileNumber}
                  </p>
                  <p className="text-slate-600 text-xs mt-0.5">
                    {selectedEmailOrder.address}, {selectedEmailOrder.area ? `${selectedEmailOrder.area}, ` : ''}{selectedEmailOrder.city}, {selectedEmailOrder.province}
                  </p>
                </div>

                {/* Itemized Table */}
                <div>
                  <h4 className="font-bold text-slate-900 mb-2.5 text-xs flex items-center justify-between">
                    <span>Order Summary</span>
                    <span className="text-slate-400 font-normal">{selectedEmailOrder.items.length} item(s)</span>
                  </h4>
                  <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
                    {selectedEmailOrder.items.map((it, idx) => (
                      <div key={idx} className="p-3 flex items-center justify-between gap-3 bg-white">
                        <div className="flex items-center gap-3">
                          <img src={it.image} alt="" className="w-10 h-10 object-cover rounded-lg border border-slate-200 bg-slate-50 shrink-0" />
                          <div>
                            <p className="font-bold text-slate-900 line-clamp-1">{it.productName}</p>
                            <p className="text-[10px] text-slate-400">
                              {it.variantName ? `${it.variantName} • ` : ''}SKU: {it.sku} • Qty: {it.quantity}
                            </p>
                          </div>
                        </div>
                        <span className="font-bold text-slate-900 text-xs shrink-0">
                          PKR {it.total.toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Totals */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal:</span>
                    <span>PKR {selectedEmailOrder.subtotal.toLocaleString()}</span>
                  </div>
                  {selectedEmailOrder.discount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-bold">
                      <span>Discount:</span>
                      <span>- PKR {selectedEmailOrder.discount.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-600">
                    <span>Delivery Charges:</span>
                    <span>{selectedEmailOrder.shippingCharges === 0 ? 'FREE' : `PKR ${selectedEmailOrder.shippingCharges}`}</span>
                  </div>
                  <div className="flex justify-between font-black text-sm text-slate-900 pt-2 border-t border-slate-200">
                    <span>Total Paid / Payable:</span>
                    <span className="text-emerald-700">PKR {selectedEmailOrder.totalAmount.toLocaleString()}</span>
                  </div>
                </div>

                {/* Footer note in email */}
                <div className="text-center pt-2 border-t border-slate-100 text-slate-400 text-[11px] space-y-1">
                  <p>You can track your package anytime using your 8-digit tracking code.</p>
                  <p>Need support? WhatsApp our 24/7 help desk at <strong>{storeSettings.supportPhone}</strong> or email <strong>{storeSettings.supportEmail}</strong>.</p>
                </div>
              </div>

              {/* Modal Footer Controls */}
              <div className="bg-slate-50 border-t border-slate-200 p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <input
                    type="email"
                    placeholder="Enter email to resend..."
                    value={customEmailInput}
                    onChange={(e) => setCustomEmailInput(e.target.value)}
                    className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs flex-1 sm:w-56 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <button
                    type="button"
                    disabled={isSendingEmail}
                    onClick={() => handleResendEmail(selectedEmailOrder, customEmailInput || selectedEmailOrder.email)}
                    className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold px-3.5 py-2 rounded-xl text-xs transition flex items-center gap-1.5 shrink-0 shadow-sm"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSendingEmail ? 'animate-spin' : ''}`} />
                    <span>{isSendingEmail ? 'Sending...' : 'Resend Email'}</span>
                  </button>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(`ATAL ORDER RECEIPT #${selectedEmailOrder.trackingNumber}\nCustomer: ${selectedEmailOrder.customerName}\nTotal: PKR ${selectedEmailOrder.totalAmount}\nTID: ${selectedEmailOrder.transactionReference}\nTracking: ${selectedEmailOrder.trackingNumber}`);
                      showToast('Receipt text copied to clipboard!');
                    }}
                    className="bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold px-3.5 py-2 rounded-xl text-xs transition flex items-center gap-1.5"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Text</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEmailReceiptModalOpen(false)}
                    className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2 rounded-xl text-xs transition"
                  >
                    Done
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* STAFF PASSWORD CHANGE MODAL */}
        {isStaffPasswordModalOpen && adminAuthUser && (
          <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
              <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-black text-base text-slate-900">Change Portal Password</h3>
                    <p className="text-[11px] text-slate-500">{adminAuthUser.name} ({adminAuthUser.email})</p>
                  </div>
                </div>
                <button onClick={() => setIsStaffPasswordModalOpen(false)} className="p-1.5 hover:bg-slate-100 rounded-full">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <form onSubmit={handleStaffChangePassword} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">Current Password *</label>
                  <input
                    type="password"
                    required
                    placeholder="Enter current password"
                    value={staffPasswordForm.currentPassword}
                    onChange={(e) => setStaffPasswordForm({ ...staffPasswordForm, currentPassword: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">New Password * (Min. 6 characters)</label>
                  <div className="relative">
                    <input
                      type={showStaffNewPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      placeholder="Enter new secure password"
                      value={staffPasswordForm.newPassword}
                      onChange={(e) => setStaffPasswordForm({ ...staffPasswordForm, newPassword: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl pl-3 pr-9 py-3"
                    />
                    <button
                      type="button"
                      onClick={() => setShowStaffNewPassword(!showStaffNewPassword)}
                      className="absolute right-3 top-3 text-slate-400 hover:text-slate-700"
                    >
                      {showStaffNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">Confirm New Password *</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="Re-type new password"
                    value={staffPasswordForm.confirmNewPassword}
                    onChange={(e) => setStaffPasswordForm({ ...staffPasswordForm, confirmNewPassword: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsStaffPasswordModalOpen(false)}
                    className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-3 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isChangingStaffPassword}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl shadow-md"
                  >
                    {isChangingStaffPassword ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ADD NEW STAFF MODAL */}
        {isAddStaffModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
              <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-black text-base text-slate-900">Add New Staff Member</h3>
                    <p className="text-[11px] text-slate-500">Create portal access for an admin or employee</p>
                  </div>
                </div>
                <button onClick={() => setIsAddStaffModalOpen(false)} className="p-1.5 hover:bg-slate-100 rounded-full">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <form onSubmit={handleAddStaff} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sarah Khan"
                    value={newStaffForm.name}
                    onChange={(e) => setNewStaffForm({ ...newStaffForm, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">Portal Login Email *</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. sarah@atal.com"
                    value={newStaffForm.email}
                    onChange={(e) => setNewStaffForm({ ...newStaffForm, email: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">Role & Permissions *</label>
                  <select
                    value={newStaffForm.role}
                    onChange={(e) => setNewStaffForm({ ...newStaffForm, role: e.target.value as 'admin' | 'employee' })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3 font-semibold"
                  >
                    <option value="employee">Employee (View orders, manage catalog & slides)</option>
                    <option value="admin">Administrator (Full control, settings & staff)</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-800 block mb-1">Initial Password * (Min. 6 characters)</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="Create secure login password"
                    value={newStaffForm.password}
                    onChange={(e) => setNewStaffForm({ ...newStaffForm, password: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddStaffModalOpen(false)}
                    className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-3 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isAddingStaff}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl shadow-md"
                  >
                    {isAddingStaff ? 'Adding...' : 'Create Staff User'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* RESET STAFF PASSWORD MODAL (ADMIN ACTION) */}
        {staffResetTarget && (
          <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
              <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-black text-base text-slate-900">Reset Staff Password</h3>
                    <p className="text-[11px] text-slate-500">{staffResetTarget.name} ({staffResetTarget.email})</p>
                  </div>
                </div>
                <button onClick={() => setStaffResetTarget(null)} className="p-1.5 hover:bg-slate-100 rounded-full">
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>

              <form onSubmit={handleResetStaffPassword} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-slate-800 block mb-1">New Password * (Min. 6 characters)</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="Enter new password for this staff member"
                    value={staffResetPassword}
                    onChange={(e) => setStaffResetPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setStaffResetTarget(null)}
                    className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-3 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isResettingStaffPassword}
                    className="flex-1 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl shadow-md"
                  >
                    {isResettingStaffPassword ? 'Resetting...' : 'Save New Password'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* VIP NOTIFY ME MODAL (LAUNCH SOON DROPS) */}
        {isNotifyModalOpen && notifyTargetItem && (
          <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                    <Bell className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-black text-base text-slate-900">VIP Launch Waitlist</h3>
                    <p className="text-[11px] text-slate-500">Get early drop alert when this item arrives</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsNotifyModalOpen(false)}
                  className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Item Card Teaser */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 flex items-center gap-3 mb-4">
                <img 
                  src={notifyTargetItem.image || DEFAULT_PRODUCT_IMAGE} 
                  alt="" 
                  className="w-12 h-12 rounded-xl object-cover bg-black/40 shrink-0" 
                />
                <div className="min-w-0">
                  <span className="bg-amber-100 text-amber-900 text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
                    {notifyTargetItem.badge || 'COMING SOON'}
                  </span>
                  <p className="text-xs font-bold text-slate-900 truncate mt-0.5">{notifyTargetItem.name}</p>
                </div>
              </div>

              <form onSubmit={handleRegisterLaunchNotification} className="space-y-3.5 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Your Full Name</label>
                  <input
                    type="text"
                    placeholder="Enter your name"
                    value={notifyCustomerName}
                    onChange={(e) => setNotifyCustomerName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Email Address (Optional)</label>
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={notifyEmail}
                    onChange={(e) => setNotifyEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">WhatsApp Number (Optional)</label>
                  <input
                    type="tel"
                    placeholder="03001234567"
                    value={notifyWhatsapp}
                    onChange={(e) => setNotifyWhatsapp(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div className="flex items-start gap-2 pt-1 text-[11px] text-slate-500">
                  <input type="checkbox" defaultChecked required className="rounded text-emerald-600 mt-0.5" />
                  <span>I agree to receive a direct WhatsApp / Email notification as soon as this product drops.</span>
                </div>

                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsNotifyModalOpen(false)}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingNotify}
                    className="flex-1 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-slate-950 font-black py-2.5 rounded-xl text-xs shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Bell className="w-3.5 h-3.5" />
                    <span>{isSubmittingNotify ? 'Joining...' : 'Join VIP Waitlist'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ADMIN MODAL: ADD / EDIT LAUNCH SOON ITEM */}
        {isLaunchSoonModalOpen && editingLaunchSoonItem && (
          <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                    <Clock className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-black text-base text-slate-900">
                      {editingLaunchSoonItem.id && (homepageSections?.newLaunch?.launchSoon?.items || []).some((it: any) => it.id === editingLaunchSoonItem.id) ? 'Edit Coming Soon Drop' : 'Add New Coming Soon Drop'}
                    </h3>
                    <p className="text-[11px] text-slate-500">Configure upcoming drop details, image, launch countdown timer</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsLaunchSoonModalOpen(false)}
                  className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  const currentItems = [...(homepageSections?.newLaunch?.launchSoon?.items || [])];
                  const existingIdx = currentItems.findIndex((it: any) => it.id === editingLaunchSoonItem.id);
                  if (existingIdx >= 0) {
                    currentItems[existingIdx] = editingLaunchSoonItem;
                  } else {
                    currentItems.push(editingLaunchSoonItem);
                  }
                  const currNL = homepageSections?.newLaunch || {};
                  const currLS = currNL.launchSoon || {};
                  setHomepageSections({
                    ...homepageSections,
                    newLaunch: {
                      ...currNL,
                      launchSoon: {
                        ...currLS,
                        items: currentItems
                      }
                    }
                  });
                  setIsLaunchSoonModalOpen(false);
                  showToast('✓ Launch Soon drop saved to configuration!');
                }}
                className="space-y-4 text-xs"
              >
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Product Drop Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ATAL 24K Royal Velvet Couture Suite"
                    value={editingLaunchSoonItem.name || ''}
                    onChange={(e) => setEditingLaunchSoonItem({ ...editingLaunchSoonItem, name: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Kicker Badge</label>
                    <input
                      type="text"
                      placeholder="e.g. COMING SOON, EXCLUSIVE TEASER"
                      value={editingLaunchSoonItem.badge || ''}
                      onChange={(e) => setEditingLaunchSoonItem({ ...editingLaunchSoonItem, badge: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Expected Launch Date & Time</label>
                    <input
                      type="datetime-local"
                      value={editingLaunchSoonItem.expectedLaunchDate ? editingLaunchSoonItem.expectedLaunchDate.slice(0, 16) : ''}
                      onChange={(e) => setEditingLaunchSoonItem({ ...editingLaunchSoonItem, expectedLaunchDate: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Picture / Banner</label>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <label className="cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Picture File</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (ev) => {
                                const base64 = ev.target?.result as string;
                                setEditingLaunchSoonItem({ ...editingLaunchSoonItem, image: base64 });
                                showToast('✓ Picture uploaded!');
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                      <span className="text-slate-400 text-[11px]">or enter URL:</span>
                    </div>
                    <input
                      type="text"
                      placeholder="https://... or /assets/..."
                      value={editingLaunchSoonItem.image || ''}
                      onChange={(e) => setEditingLaunchSoonItem({ ...editingLaunchSoonItem, image: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-mono text-xs outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    {editingLaunchSoonItem.image && (
                      <div className="relative w-28 h-16 rounded-xl overflow-hidden border border-slate-200 mt-1">
                        <img src={editingLaunchSoonItem.image} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Short Description</label>
                  <textarea
                    rows={3}
                    placeholder="Enter short description highlighting fabric, craftsmanship, or features..."
                    value={editingLaunchSoonItem.description || ''}
                    onChange={(e) => setEditingLaunchSoonItem({ ...editingLaunchSoonItem, description: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 items-center">
                  <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-800">
                    <input
                      type="checkbox"
                      checked={editingLaunchSoonItem.showCountdown !== false}
                      onChange={(e) => setEditingLaunchSoonItem({ ...editingLaunchSoonItem, showCountdown: e.target.checked })}
                      className="rounded text-amber-600"
                    />
                    <span>Show Live Countdown Timer</span>
                  </label>
                  <div>
                    <label className="font-bold text-slate-700 block mb-0.5">Preview Slug (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. atal-luxury-pret"
                      value={editingLaunchSoonItem.previewSlug || ''}
                      onChange={(e) => setEditingLaunchSoonItem({ ...editingLaunchSoonItem, previewSlug: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 outline-none font-mono text-xs"
                    />
                  </div>
                </div>

                <div className="flex gap-2.5 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsLaunchSoonModalOpen(false)}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-bold py-2.5 rounded-xl text-xs shadow-md transition cursor-pointer"
                  >
                    Save Coming Soon Drop
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ADMIN MODAL: ADD / EDIT SPOTLIGHT ITEM */}
        {isSpotlightModalOpen && editingSpotlightItem && (
          <div className="fixed inset-0 z-50 bg-slate-900/75 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-black text-base text-slate-900">
                      {editingSpotlightItem.id && (homepageSections?.spotlight?.items || []).some((it: any) => it.id === editingSpotlightItem.id) ? 'Edit Spotlight Item' : 'Add Spotlight Item'}
                    </h3>
                    <p className="text-[11px] text-slate-500">Configure promotional highlight banner, image, CTA button and destination</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsSpotlightModalOpen(false)}
                  className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  const currentItems = [...(homepageSections?.spotlight?.items || [])];
                  const existingIdx = currentItems.findIndex((it: any) => it.id === editingSpotlightItem.id);
                  if (existingIdx >= 0) {
                    currentItems[existingIdx] = editingSpotlightItem;
                  } else {
                    currentItems.push(editingSpotlightItem);
                  }
                  const currSpot = homepageSections?.spotlight || {};
                  setHomepageSections({
                    ...homepageSections,
                    spotlight: {
                      ...currSpot,
                      items: currentItems
                    }
                  });
                  setIsSpotlightModalOpen(false);
                  showToast('✓ Spotlight item saved to configuration!');
                }}
                className="space-y-4 text-xs"
              >
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Headline Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ATAL 3D Signature Luxury Bag"
                    value={editingSpotlightItem.title || ''}
                    onChange={(e) => setEditingSpotlightItem({ ...editingSpotlightItem, title: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Subtitle</label>
                    <input
                      type="text"
                      placeholder="e.g. Emerald Green & 24K Gold"
                      value={editingSpotlightItem.subtitle || ''}
                      onChange={(e) => setEditingSpotlightItem({ ...editingSpotlightItem, subtitle: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Kicker Badge</label>
                    <input
                      type="text"
                      placeholder="e.g. LIMITED EDITION, BEST SELLER"
                      value={editingSpotlightItem.badge || ''}
                      onChange={(e) => setEditingSpotlightItem({ ...editingSpotlightItem, badge: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Picture / Promotional Banner *</label>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <label className="cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Picture File</span>
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (ev) => {
                                const base64 = ev.target?.result as string;
                                setEditingSpotlightItem({ ...editingSpotlightItem, image: base64 });
                                showToast('✓ Picture uploaded!');
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                      <span className="text-slate-400 text-[11px]">or enter URL:</span>
                    </div>
                    <input
                      type="text"
                      placeholder="https://... or /assets/..."
                      value={editingSpotlightItem.image || ''}
                      onChange={(e) => setEditingSpotlightItem({ ...editingSpotlightItem, image: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-mono text-xs outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    {editingSpotlightItem.image && (
                      <div className="relative w-28 h-16 rounded-xl overflow-hidden border border-slate-200 mt-1">
                        <img src={editingSpotlightItem.image} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Description</label>
                  <textarea
                    rows={3}
                    placeholder="Enter short promotional description..."
                    value={editingSpotlightItem.description || ''}
                    onChange={(e) => setEditingSpotlightItem({ ...editingSpotlightItem, description: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">CTA Button Text</label>
                    <input
                      type="text"
                      placeholder="e.g. EXPLORE NOW, SHOP BAG"
                      value={editingSpotlightItem.buttonText || ''}
                      onChange={(e) => setEditingSpotlightItem({ ...editingSpotlightItem, buttonText: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Destination URL / Link</label>
                    <input
                      type="text"
                      placeholder="e.g. /shop, /product/slug, /category/slug"
                      value={editingSpotlightItem.buttonLink || ''}
                      onChange={(e) => setEditingSpotlightItem({ ...editingSpotlightItem, buttonLink: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 font-mono text-xs outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Featured Price (PKR)</label>
                    <input
                      type="number"
                      placeholder="e.g. 3950"
                      value={editingSpotlightItem.price || ''}
                      onChange={(e) => setEditingSpotlightItem({ ...editingSpotlightItem, price: Number(e.target.value) })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 outline-none"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Original Price (PKR)</label>
                    <input
                      type="number"
                      placeholder="e.g. 5490"
                      value={editingSpotlightItem.originalPrice || ''}
                      onChange={(e) => setEditingSpotlightItem({ ...editingSpotlightItem, originalPrice: Number(e.target.value) })}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 outline-none"
                    />
                  </div>
                </div>

                <div className="flex gap-2.5 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsSpotlightModalOpen(false)}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-purple-700 hover:bg-purple-800 text-white font-bold py-2.5 rounded-xl text-xs shadow-md transition cursor-pointer"
                  >
                    Save Spotlight Item
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* SAFE IN-APP CONFIRMATION MODAL */}
        {confirmDialog.isOpen && (
          <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-sm text-slate-900">{confirmDialog?.title || 'Confirmation'}</h3>
                  <p className="text-[11px] text-slate-500">Please confirm this action</p>
                </div>
              </div>
              <p className="text-xs text-slate-600 mb-6 leading-relaxed">{confirmDialog.message}</p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const action = confirmDialog.onConfirm;
                    setConfirmDialog(prev => ({ ...prev, isOpen: false }));
                    action();
                  }}
                  className={`flex-1 ${confirmDialog.confirmColor || 'bg-red-600 hover:bg-red-700'} text-white font-bold py-2.5 rounded-xl text-xs shadow-md transition`}
                >
                  {confirmDialog.confirmText || 'Confirm'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
