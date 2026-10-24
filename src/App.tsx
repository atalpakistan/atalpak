/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  ShoppingBag, Search, Heart, User, ShieldCheck, Truck, RotateCcw, 
  PhoneCall, ChevronRight, ChevronLeft, Star, X, Plus, Minus, Trash2, CheckCircle2, 
  SlidersHorizontal, ArrowLeft, Share2, Menu, Settings, Package, 
  TrendingUp, DollarSign, AlertTriangle, Eye, EyeOff, Edit, Check, Lock, Globe,
  Copy, MessageCircle, Home, LayoutGrid, Baby, Sparkles, Zap, Wifi, BatteryMedium, Mail,
  LogOut, KeyRound, MapPin, Send, CheckCheck, RefreshCw, FileText, ExternalLink,
  Instagram, Facebook, Landmark
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { authService } from './services/auth';

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
  isFeatured?: boolean;
  isFlashDeal?: boolean;
  isBestSeller?: boolean;
  isNewArrival?: boolean;
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

export default function App() {
  const [currentView, setCurrentView] = useState<'home' | 'products' | 'product-detail' | 'cart' | 'checkout' | 'order-success' | 'orders' | 'support' | 'admin' | 'account'>('home');
  
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
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('atal_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('atal_wishlist', JSON.stringify(wishlist));
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
      return saved ? JSON.parse(saved) : null;
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
      const res = await fetch(`/api/orders/${order.trackingNumber}/resend-email`, {
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
      return saved ? JSON.parse(saved) : null;
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

  const [adminStats, setAdminStats] = useState<any>(null);
  const [adminOrders, setAdminOrders] = useState<Order[]>([]);
  const [adminActiveTab, setAdminActiveTab] = useState<'orders' | 'products' | 'categories' | 'carousel' | 'settings' | 'staff'>('orders');
  const [storeSettings, setStoreSettings] = useState({
    storeName: 'ATAL',
    tagline: 'Shop Smart. Live Better',
    supportPhone: '+92 371 9150297',
    supportEmail: 'contact.to.atal@gmail.com',
    whatsappNumber: '923719150297',
    freeShippingThreshold: 9999,
    defaultShippingCharge: 290,
    codEnabled: true,
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

  const fetchStoreSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      setStoreSettings(data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/settings', {
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
      const res = await fetch(`/api/customers/${custId}/orders`);
      if (res.ok) {
        const data = await res.json();
        setCustomerOrders(data);
      }
    } catch (err) {
      console.error('Failed to load customer orders:', err);
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
  const [productForm, setProductForm] = useState({
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
    isFeatured: true
  });

  // Categories Admin Management State
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    slug: '',
    image: '',
    subcategories: '',
    description: ''
  });

  const openAddCategoryModal = () => {
    setEditingCategoryId(null);
    setCategoryForm({
      name: '',
      slug: '',
      image: '',
      subcategories: '',
      description: ''
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
      description: cat.description || ''
    });
    setIsCategoryModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: categoryForm.name,
      slug: categoryForm.slug || categoryForm.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      image: categoryForm.image,
      subcategories: categoryForm.subcategories.split(',').map(s => s.trim()).filter(Boolean),
      description: categoryForm.description
    };
    try {
      if (editingCategoryId) {
        const res = await fetch(`/api/categories/${editingCategoryId}`, {
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
        const res = await fetch('/api/categories', {
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

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    try {
      const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Category deleted successfully!');
        fetchCategories();
      }
    } catch (err) {
      showToast('Failed to delete category');
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
      const res = await fetch('/api/carousel');
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
    setEditingSlideId(slide.id);
    setSlideForm({
      badge: slide.badge,
      brand: slide.brand,
      title: slide.title,
      subtitle: slide.subtitle,
      discount: slide.discount,
      buttonText: slide.buttonText,
      image: slide.image,
      categoryId: slide.categoryId
    });
    setIsCarouselModalOpen(true);
  };

  const handleSaveSlide = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSlideId) {
        const res = await fetch(`/api/carousel/${editingSlideId}`, {
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
        const res = await fetch('/api/carousel', {
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

  const handleDeleteSlide = async (id: string | number) => {
    if (carouselSlides.length <= 1) {
      showToast('Carousel must have at least one slide!');
      return;
    }
    if (!confirm('Are you sure you want to delete this slide?')) return;
    try {
      const res = await fetch(`/api/carousel/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Slide removed from carousel!');
        fetchCarouselSlides();
      }
    } catch (err) {
      showToast('Failed to delete slide');
    }
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const colors = productForm.colorsString ? productForm.colorsString.split(',').map(s => s.trim()).filter(Boolean) : ['Standard'];
    const sizes = productForm.sizesString ? productForm.sizesString.split(',').map(s => s.trim()).filter(Boolean) : ['Standard'];
    const variants: ProductVariant[] = [];
    colors.forEach((col, cIdx) => {
      sizes.forEach((sz, sIdx) => {
        variants.push({
          id: `var-${Date.now()}-${cIdx}-${sIdx}`,
          name: `${col} / ${sz}`,
          sku: `ATAL-${Math.floor(100000 + Math.random() * 900000)}`,
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
      isFeatured: productForm.isFeatured
    };

    try {
      if (editingProductId) {
        const res = await fetch(`/api/products/${editingProductId}`, {
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
        const res = await fetch('/api/products', {
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

  const handleDeleteProduct = async (prodId: string) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      const res = await fetch(`/api/products/${prodId}`, {
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
  };

  // Load initial data
  useEffect(() => {
    fetchCategories();
    fetchProducts();
    fetchStoreSettings();
    fetchCarouselSlides();
    
    // Check URL for product slug e.g. /#product/slug or query ?product=slug
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#product/')) {
        const slug = hash.replace('#product/', '');
        loadProductBySlug(slug);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    
    // Initial check
    if (window.location.hash.startsWith('#product/')) {
      const slug = window.location.hash.replace('#product/', '');
      loadProductBySlug(slug);
    }

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      setCategories(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(data);
    } catch (e) {
      console.error(e);
    }
  };

  const loadProductBySlug = async (slug: string) => {
    try {
      const res = await fetch(`/api/products/${slug}`);
      if (res.ok) {
        const prod = await res.json();
        setSelectedProduct(prod);
        if (prod.variants && prod.variants.length > 0) {
          setSelectedVariant(prod.variants[0]);
        }
        setQuantity(1);
        setCurrentView('product-detail');
      }
    } catch (e) {
      console.error(e);
    }
  };

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
      const res = await fetch('/api/checkout', {
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
      const res = await fetch(`/api/orders/${encodeURIComponent(q)}`);
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
      const res = await fetch('/api/admin/staff');
      if (res.ok) {
        const data = await res.json();
        setStaffList(data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const loadAdminData = async () => {
    try {
      const statsRes = await fetch('/api/admin/stats');
      const statsData = await statsRes.json();
      setAdminStats(statsData);

      const ordersRes = await fetch('/api/orders');
      const ordersData = await ordersRes.json();
      setAdminOrders(ordersData);

      fetchStaffList();
    } catch (e) {
      console.error(e);
    }
  };

  const handleStaffLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsStaffLoggingIn(true);

    const result = await authService.loginStaff(adminLoginForm.email, adminLoginForm.password);

    if (result.success && result.data) {
      setAdminAuthUser(result.data);
      localStorage.setItem('atal_staff_user', JSON.stringify(result.data));
      showToast(`🎉 ${result.message || `Welcome, ${result.data.name}!`}`);
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
      const res = await fetch('/api/admin/change-password', {
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
      const res = await fetch(`/api/orders/${orderId}/status`, {
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
              onClick={() => { setCurrentView('home'); window.location.hash = ''; }}
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
                onClick={() => setCurrentView('account')}
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
                      setCurrentView('products');
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
            <div className="flex items-center gap-3 cursor-pointer group" onClick={() => { setCurrentView('home'); window.location.hash = ''; }}>
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
                    setCurrentView('products');
                  }
                }}
                className="w-full bg-slate-100 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setCurrentView('orders')}
                className="text-xs font-semibold text-slate-700 hover:text-emerald-600"
              >
                Track Order
              </button>

              <button 
                onClick={() => setCurrentView('account')}
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
              onClick={() => { setSelectedCategory(null); setSelectedSubcategory(null); setCurrentView('home'); window.location.hash=''; }}
              className="hover:text-emerald-400 font-medium whitespace-nowrap"
            >
              Home
            </button>
            {categories.map(cat => (
              <button 
                key={cat.id} 
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setSelectedSubcategory(null);
                  setCurrentView('products');
                  window.location.hash = '';
                }}
                className="hover:text-emerald-400 whitespace-nowrap font-medium text-slate-200"
              >
                {cat.name}
              </button>
            ))}
            <button 
              onClick={() => setCurrentView('support')}
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
                    {carouselSlides.map((slide, idx) => (
                      <div 
                        key={slide.id}
                        className={`absolute inset-0 transition-opacity duration-500 ease-in-out ${
                          idx === currentHeroSlide ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                        }`}
                      >
                        <img 
                          src={slide.image} 
                          alt={slide.title} 
                          className="w-full h-full object-cover object-center group-hover:scale-105 transition duration-500" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/25 flex flex-col justify-between p-3.5">
                          {/* Top Text on Banner */}
                          <div className="text-right ml-auto max-w-[68%]">
                            <p className="text-[11px] font-black tracking-widest text-[#f5d77f] font-serif">{slide.brand}</p>
                            <p className="text-[8px] tracking-wider text-emerald-200 uppercase font-semibold">PAKISTAN</p>
                            <h2 className="text-xs sm:text-sm font-bold text-white tracking-wide mt-0.5 leading-tight line-clamp-1">
                              {slide.title}
                            </h2>
                            <p className="text-[7.5px] text-slate-300 mt-0.5 line-clamp-1">
                              {slide.subtitle}
                            </p>
                            <div className="mt-1 flex items-center justify-end gap-1.5">
                              <span className="text-[8.5px] font-bold text-amber-300">{slide.discount}</span>
                              <span className="bg-[#f5d77f] text-slate-950 font-black text-[8px] px-2 py-0.5 rounded-full uppercase shadow-xs">
                                {slide.buttonText}
                              </span>
                            </div>
                          </div>

                          {/* Bottom Banner Tag and Headline */}
                          <div>
                            <span className="bg-[#d97706] text-black font-black text-[9px] px-2.5 py-0.5 rounded-xs uppercase tracking-wider inline-block mb-1 shadow-sm">
                              {slide.badge}
                            </span>
                            <h3 className="text-white font-extrabold text-xs sm:text-sm drop-shadow-md leading-tight line-clamp-1">
                              {slide.title}
                            </h3>
                          </div>
                        </div>
                      </div>
                    ))}

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
                      onClick={() => { setSelectedCategory(null); setSelectedSubcategory(null); setCurrentView('products'); }}
                      className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 cursor-pointer"
                    >
                      All ({categories.length})
                    </span>
                  </div>
                  <div className="flex items-start gap-3.5 overflow-x-auto no-scrollbar py-1 scroll-smooth">
                    {categories.map((cat) => (
                      <button 
                        key={cat.id}
                        onClick={() => { setSelectedCategory(cat.id); setSelectedSubcategory(null); setCurrentView('products'); }}
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
                      onClick={() => setCurrentView('products')}
                      className="text-[11px] font-bold text-red-700 hover:text-red-800 cursor-pointer"
                    >
                      View All
                    </span>
                  </div>

                  {/* Single Horizontal Row for All Festive Products */}
                  <div className="flex flex-nowrap overflow-x-auto no-scrollbar gap-3 pb-1 pt-1 scroll-smooth">
                    {products.filter(p => p.isFlashDeal || p.isFeatured || p.isNewArrival).map((prod) => (
                      <div 
                        key={prod.id}
                        onClick={() => {
                          setSelectedProduct(prod);
                          if (prod.variants?.length) setSelectedVariant(prod.variants[0]);
                          setCurrentView('product-detail');
                        }}
                        className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition cursor-pointer flex flex-col group shrink-0 w-[170px] sm:w-[195px]"
                      >
                        {/* Image Box */}
                        <div className="relative aspect-square w-full bg-[#062419] overflow-hidden flex items-center justify-center">
                          <img 
                            src={prod.images[0]} 
                            alt={prod.name}
                            className={`w-full h-full ${prod.images[0].includes('WhatsApp') ? 'object-contain p-2' : 'object-cover'} group-hover:scale-105 transition duration-300`} 
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

                {/* All Products Catalog (Mobile View: 2 products in a row, 8 columns grid) */}
                <div className="mt-6 px-3">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                      All Products Catalog
                    </h3>
                    <span 
                      onClick={() => setCurrentView('products')}
                      className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 cursor-pointer"
                    >
                      View All →
                    </span>
                  </div>

                  <div className="grid grid-cols-8 gap-2.5">
                    {products.map((prod) => (
                      <div 
                        key={prod.id}
                        onClick={() => {
                          setSelectedProduct(prod);
                          if (prod.variants?.length) setSelectedVariant(prod.variants[0]);
                          setCurrentView('product-detail');
                        }}
                        className="col-span-4 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-md transition cursor-pointer flex flex-col justify-between group"
                      >
                        <div className="relative aspect-square w-full bg-[#062419] overflow-hidden flex items-center justify-center">
                          <img 
                            src={prod.images[0]} 
                            alt={prod.name}
                            className={`w-full h-full ${prod.images[0].includes('WhatsApp') ? 'object-contain p-2' : 'object-cover'} group-hover:scale-105 transition duration-300`} 
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
              </div>

              {/* ======================================================== */}
              {/* DESKTOP HOME SCREEN (Original Full Desktop Experience)   */}
              {/* ======================================================== */}
              <div className="pb-12 hidden md:block">
                {/* Hero Banner Carousel (Desktop) */}
                <div className="relative mx-4 mt-4 rounded-2xl overflow-hidden shadow-xl bg-slate-950 border border-slate-200/50 select-none group">
                  <div className="relative h-80 lg:h-96 w-full overflow-hidden">
                    {carouselSlides.map((slide, idx) => (
                      <div 
                        key={slide.id}
                        className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                          idx === currentHeroSlide ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                        }`}
                      >
                        <img 
                          src={slide.image} 
                          alt={slide.title} 
                          className="w-full h-full object-cover object-center transform scale-100 group-hover:scale-105 transition-transform duration-700" 
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/55 to-black/25 flex items-center p-8 lg:p-14">
                          <div className="max-w-xl text-white">
                            <div className="flex items-center gap-2 mb-3">
                              <span className="bg-emerald-500 text-slate-950 font-black text-xs px-3 py-1 rounded-full uppercase tracking-wider">
                                {slide.badge}
                              </span>
                              <span className="text-amber-300 font-bold text-xs">
                                {slide.discount}
                              </span>
                            </div>
                            <h2 className="text-2xl lg:text-4xl font-black tracking-tight mb-3 text-white leading-tight">
                              {slide.title}
                            </h2>
                            <p className="text-slate-200 text-sm mb-6 leading-relaxed">
                              {slide.subtitle}. Genuine high-quality items delivered doorstep nationwide across Pakistan with JazzCash, Easypaisa, or Cash on Delivery.
                            </p>
                            <div className="flex items-center gap-3">
                              <button 
                                onClick={() => {
                                  setSelectedCategory(slide.categoryId);
                                  setCurrentView('products');
                                }}
                                className="bg-[#f5d77f] hover:bg-amber-400 text-slate-950 font-black px-6 py-3 rounded-xl text-sm shadow-lg transition flex items-center gap-2"
                              >
                                <span>{slide.buttonText}</span>
                                <ChevronRight className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => {
                                  setSelectedCategory(null);
                                  setCurrentView('products');
                                }}
                                className="bg-white/15 hover:bg-white/25 text-white backdrop-blur-sm font-semibold px-5 py-3 rounded-xl text-sm transition"
                              >
                                Browse All Products
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

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
                      onClick={() => { setSelectedCategory(null); setCurrentView('products'); }}
                    >
                      View All Categories →
                    </span>
                  </div>
                  <div className="flex items-stretch gap-4 overflow-x-auto no-scrollbar py-2 scroll-smooth">
                    {categories.map(cat => (
                      <div 
                        key={cat.id}
                        onClick={() => {
                          setSelectedCategory(cat.id);
                          setSelectedSubcategory(null);
                          setCurrentView('products');
                        }}
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
                    <span className="text-xs font-bold text-red-700 hover:text-red-900 cursor-pointer" onClick={() => setCurrentView('products')}>
                      See All Deals →
                    </span>
                  </div>

                  <div className="flex items-stretch gap-4 overflow-x-auto no-scrollbar py-2 scroll-smooth">
                    {products.filter(p => p.isFlashDeal || p.isFeatured || p.isNewArrival).map(prod => (
                      <div 
                        key={prod.id}
                        className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col justify-between hover:shadow-xl transition group relative cursor-pointer shrink-0 w-60"
                        onClick={() => {
                          setSelectedProduct(prod);
                          if (prod.variants && prod.variants.length > 0) setSelectedVariant(prod.variants[0]);
                          setCurrentView('product-detail');
                          window.location.hash = `product/${prod.slug}`;
                        }}
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
                            src={prod.images[0]} 
                            alt={prod.name} 
                            className={`w-full h-full ${prod.images[0].includes('WhatsApp') ? 'object-contain p-2' : 'object-cover'} group-hover:scale-105 transition duration-300`} 
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

                {/* All Products Section (Responsive Grid: 2-col mobile, 3-col tablet, 4-col PC) */}
                <div className="max-w-7xl mx-auto px-4 mt-12">
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200">
                    <div>
                      <h3 className="font-black text-lg text-slate-900">All Products Catalog</h3>
                      <p className="text-xs text-slate-500">Explore all available items across fashion, cosmetics, electronics & more</p>
                    </div>
                    <span 
                      className="text-xs font-bold text-emerald-600 hover:text-emerald-700 cursor-pointer"
                      onClick={() => { setSelectedCategory(null); setSelectedSubcategory(null); setCurrentView('products'); }}
                    >
                      View All in Catalog →
                    </span>
                  </div>

                  <div className="grid grid-cols-8 sm:grid-cols-6 lg:grid-cols-4 gap-4">
                    {products.map(prod => (
                      <div 
                        key={prod.id}
                        className="col-span-4 sm:col-span-2 lg:col-span-1 bg-white border border-slate-200 rounded-2xl p-3.5 flex flex-col justify-between hover:shadow-xl transition group relative cursor-pointer"
                        onClick={() => {
                          setSelectedProduct(prod);
                          if (prod.variants && prod.variants.length > 0) setSelectedVariant(prod.variants[0]);
                          setCurrentView('product-detail');
                          window.location.hash = `product/${prod.slug}`;
                        }}
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
                            src={prod.images[0]} 
                            alt={prod.name} 
                            className={`w-full h-full ${prod.images[0].includes('WhatsApp') ? 'object-contain p-2' : 'object-cover'} group-hover:scale-105 transition duration-300`} 
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
                      onChange={(e) => { setSelectedCategory(e.target.value || null); setSelectedSubcategory(null); }}
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
                        onChange={(e) => setSelectedSubcategory(e.target.value || null)}
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
                    onClick={() => { setSelectedCategory(null); setSelectedSubcategory(null); setSearchQuery(''); }}
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
                      Showing {products.filter(p => {
                        if (selectedCategory && p.categoryId !== selectedCategory) return false;
                        if (selectedSubcategory && p.subcategoryId.toLowerCase() !== selectedSubcategory.toLowerCase()) return false;
                        if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase()) && !p.brand.toLowerCase().includes(searchQuery.toLowerCase())) return false;
                        return true;
                      }).length} items
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4">
                    {products.filter(p => {
                      if (selectedCategory && p.categoryId !== selectedCategory) return false;
                      if (selectedSubcategory && p.subcategoryId.toLowerCase() !== selectedSubcategory.toLowerCase()) return false;
                      if (searchQuery && !p.name.toLowerCase().includes(searchQuery.toLowerCase()) && !p.brand.toLowerCase().includes(searchQuery.toLowerCase())) return false;
                      return true;
                    }).map(prod => (
                      <div 
                        key={prod.id}
                        className="bg-white border border-slate-200 rounded-2xl p-2.5 sm:p-4 flex flex-col justify-between hover:shadow-xl transition group relative cursor-pointer"
                        onClick={() => {
                          setSelectedProduct(prod);
                          if (prod.variants && prod.variants.length > 0) setSelectedVariant(prod.variants[0]);
                          setCurrentView('product-detail');
                          window.location.hash = `product/${prod.slug}`;
                        }}
                      >
                        {prod.discountPercentage && (
                          <span className="absolute top-2 left-2 sm:top-3 sm:left-3 bg-red-600 text-white text-[9px] sm:text-[10px] font-extrabold px-1.5 sm:px-2 py-0.5 rounded-full z-10">
                            {prod.discountPercentage}% OFF
                          </span>
                        )}
                        <div className="w-full h-36 sm:h-52 rounded-xl overflow-hidden mb-2 sm:mb-3 bg-slate-100 flex items-center justify-center">
                          <img src={prod.images[0]} alt={prod.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
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
          {currentView === 'product-detail' && selectedProduct && (
            <div className="max-w-7xl mx-auto px-4 py-6">
              <button 
                onClick={() => { setCurrentView('home'); window.location.hash = ''; }}
                className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-emerald-600 mb-6"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Store
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Image Gallery */}
                <div>
                  <div className="w-full h-[380px] rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 mb-4 shadow-sm">
                    <img src={selectedProduct.images[0]} alt={selectedProduct.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {selectedProduct.images.map((img, idx) => (
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

                  {/* Variants Selector */}
                  {selectedProduct.variants && selectedProduct.variants.length > 0 && (
                    <div className="mb-6">
                      <label className="text-xs font-bold text-slate-700 block mb-2">Select Variant / Color / Size:</label>
                      <div className="flex flex-wrap gap-2">
                        {selectedProduct.variants.map(v => (
                          <button
                            key={v.id}
                            onClick={() => setSelectedVariant(v)}
                            className={`px-4 py-2 rounded-xl text-xs font-bold border transition ${selectedVariant?.id === v.id ? 'bg-emerald-600 text-white border-emerald-600 shadow-md' : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-500'}`}
                          >
                            {v.name}
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
                        setCurrentView('checkout');
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
                </div>
              </div>
            </div>
          )}

          {/* VIEW: PAKISTAN-SPECIFIC CHECKOUT */}
          {currentView === 'checkout' && (
            <div className="max-w-4xl mx-auto px-4 py-6">
              <h2 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-emerald-600" /> Secure Pakistan Checkout
              </h2>

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
                        onClick={() => setCurrentView('account')}
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
                        onClick={() => setCurrentView('account')}
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
                    setCurrentView('orders'); 
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 py-3 rounded-xl text-xs transition shadow-md"
                >
                  Track This Order Now
                </button>
                <button 
                  onClick={() => { setCurrentView('home'); }}
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
                        <p className="text-lg font-black text-white mt-0.5">{customerOrders.length}</p>
                      </div>
                      <div className="bg-white/10 rounded-xl p-2.5 backdrop-blur-xs">
                        <p className="text-[10px] uppercase font-bold text-emerald-200">Active Parcels</p>
                        <p className="text-lg font-black text-amber-300 mt-0.5">
                          {customerOrders.filter(o => !['Delivered', 'Cancelled'].includes(o.orderStatus)).length}
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
                      <span>My Orders ({customerOrders.length})</span>
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
                      ) : customerOrders.length === 0 ? (
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
                        customerOrders.map(ord => (
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
                  <p className="text-xs text-slate-500 text-center mb-6">
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
                        onClick={() => setCurrentView('home')}
                        className="text-slate-500 hover:text-slate-800 text-xs font-medium"
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
                  {adminStats && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-8">
                      <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
                        <p className="text-xs text-slate-400 mb-1">Total Sales</p>
                        <p className="text-xl font-black text-emerald-700">PKR {adminStats.totalSales.toLocaleString()}</p>
                      </div>
                      <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
                        <p className="text-xs text-slate-400 mb-1">Total Orders</p>
                        <p className="text-xl font-black text-slate-900">{adminStats.totalOrders}</p>
                      </div>
                      <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
                        <p className="text-xs text-slate-400 mb-1">Registered Customers</p>
                        <p className="text-xl font-black text-teal-700">{adminStats.totalCustomers || 0}</p>
                      </div>
                      <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
                        <p className="text-xs text-slate-400 mb-1">Pending Orders</p>
                        <p className="text-xl font-black text-amber-600">{adminStats.pendingOrders}</p>
                      </div>
                      <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
                        <p className="text-xs text-slate-400 mb-1">Low Stock Alerts</p>
                        <p className="text-xl font-black text-red-600">{adminStats.lowStockProducts}</p>
                      </div>
                    </div>
                  )}

                  {/* Admin Navigation Tabs */}
                  <div className="flex flex-wrap gap-3 mb-6 border-b border-slate-200 pb-2">
                    <button 
                      onClick={() => setAdminActiveTab('orders')}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition ${adminActiveTab === 'orders' ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                    >
                      Orders Management ({adminOrders.length})
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
                            {adminOrders.filter(ord => {
                              if (adminOrderStatusFilter !== 'all' && ord.orderStatus.toLowerCase() !== adminOrderStatusFilter.toLowerCase()) return false;
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
                              adminOrders.filter(ord => {
                                if (adminOrderStatusFilter !== 'all' && ord.orderStatus.toLowerCase() !== adminOrderStatusFilter.toLowerCase()) return false;
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
                                        {ord.trackingNumber}
                                      </span>
                                      <button 
                                        onClick={() => { navigator.clipboard.writeText(ord.trackingNumber); showToast(`Copied Tracking #${ord.trackingNumber}`); }}
                                        className="text-slate-400 hover:text-emerald-600 p-1"
                                        title="Copy 8-Digit Tracking Number"
                                      >
                                        <Copy className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                    <p className="text-[10px] text-slate-400 mt-1 font-mono">
                                      {ord.orderNumber} • {new Date(ord.createdAt).toLocaleDateString()}
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
                                          navigator.clipboard.writeText(val); 
                                          showToast(`Copied TID: ${val}`); 
                                        }}
                                        className="text-slate-400 hover:text-amber-600 p-1"
                                        title="Copy Payment Transaction ID"
                                      >
                                        <Copy className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                    <div className="mt-1 flex items-center gap-1">
                                      <span className="bg-slate-100 text-slate-700 font-bold px-1.5 py-0.5 rounded text-[10px] uppercase">
                                        {ord.paymentMethod}
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
                                    <p className="font-bold text-slate-900">{ord.customerName}</p>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                      <span className="text-[11px] text-slate-500 font-mono">{ord.mobileNumber}</span>
                                      <a 
                                        href={`https://wa.me/92${ord.mobileNumber.replace(/^(\+92|0)/, '')}?text=${encodeURIComponent(`Assalam-o-Alaikum ${ord.customerName}, this is ATAL Store regarding your order with 8-Digit Tracking #${ord.trackingNumber} (TID: ${ord.transactionReference || ord.transactionId}).`)}`}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-emerald-600 hover:text-emerald-700 font-bold text-[10px] flex items-center gap-0.5 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200"
                                        title="Chat with Customer on WhatsApp"
                                      >
                                        <MessageCircle className="w-3 h-3" /> WhatsApp
                                      </a>
                                    </div>
                                  </td>

                                  {/* City & Address */}
                                  <td className="p-3">
                                    <p className="font-bold text-slate-700">{ord.city}</p>
                                    <p className="text-[10px] text-slate-400 line-clamp-1 max-w-[150px]">{ord.address}</p>
                                  </td>

                                  {/* Total Amount */}
                                  <td className="p-3">
                                    <p className="font-black text-emerald-700">PKR {ord.totalAmount.toLocaleString()}</p>
                                    <p className="text-[10px] text-slate-400">{ord.items.length} item(s)</p>
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
                                    <button 
                                      onClick={() => setSelectedOrderDetails(ord)}
                                      className="bg-slate-900 hover:bg-emerald-600 text-white px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition flex items-center gap-1 shadow-sm"
                                    >
                                      <Eye className="w-3.5 h-3.5" /> Details
                                    </button>
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
                              isFeatured: true
                            });
                            setIsProductModalOpen(true);
                          }}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow"
                        >
                          <Plus className="w-4 h-4" /> Add New Product
                        </button>
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
                              <tr key={prod.id} className="border-b border-slate-100 hover:bg-slate-50">
                                <td className="p-3">
                                  <img src={prod.images[0]} alt="" className="w-12 h-12 rounded-lg object-cover bg-slate-100" />
                                </td>
                                <td className="p-3 font-bold text-slate-900">{prod.name}</td>
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
                                        imageUrl1: prod.images[0] || '',
                                        imageUrl2: prod.images[1] || prod.images[0] || '',
                                        imageUrl3: prod.images[2] || prod.images[0] || '',
                                        colorsString: existingColors || 'Black, Navy Blue, Maroon, White',
                                        sizesString: existingSizes || 'S, M, L, XL',
                                        isFlashDeal: !!prod.isFlashDeal,
                                        isFeatured: !!prod.isFeatured
                                      });
                                      setIsProductModalOpen(true);
                                    }}
                                    className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700"
                                    title="Edit Product"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteProduct(prod.id)}
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
                        {categories.map(cat => {
                          const catProductsCount = products.filter(p => p.categoryId === cat.id).length;
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

                              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                                <button 
                                  onClick={() => openEditCategoryModal(cat)}
                                  className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-bold flex items-center gap-1.5 transition"
                                >
                                  <Edit className="w-3.5 h-3.5" />
                                  <span>Edit</span>
                                </button>
                                <button 
                                  onClick={() => handleDeleteCategory(cat.id)}
                                  className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-bold flex items-center gap-1.5 transition"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>Delete</span>
                                </button>
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
                        {carouselSlides.map((slide, sIdx) => {
                          const targetCat = categories.find(c => c.id === slide.categoryId);
                          return (
                            <div key={slide.id} className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-900 text-white shadow-sm flex flex-col justify-between">
                              {/* Preview Banner */}
                              <div className="relative h-48 w-full overflow-hidden bg-slate-950">
                                <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col justify-end p-4">
                                  <div className="flex items-center gap-2 mb-1.5">
                                    <span className="bg-emerald-500 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-full uppercase">
                                      {slide.badge}
                                    </span>
                                    <span className="text-amber-300 font-bold text-[10px]">
                                      {slide.discount}
                                    </span>
                                  </div>
                                  <h4 className="font-black text-base leading-tight text-white line-clamp-1">{slide.title}</h4>
                                  <p className="text-slate-300 text-xs line-clamp-1 mt-0.5">{slide.subtitle}</p>
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

                  {/* ADD / EDIT PRODUCT MODAL */}
                  {isProductModalOpen && (
                    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-200">
                          <h3 className="font-black text-base text-slate-900">
                            {editingProductId ? 'Edit Product' : 'Add New Product'}
                          </h3>
                          <button onClick={() => setIsProductModalOpen(false)} className="p-1 hover:bg-slate-100 rounded-full">
                            <X className="w-5 h-5 text-slate-500" />
                          </button>
                        </div>

                        <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
                          <div>
                            <label className="font-bold text-slate-700 block mb-1">Product Name *</label>
                            <input 
                              type="text" 
                              required
                              placeholder="e.g. ATAL Wireless Earbuds Pro"
                              value={productForm.name}
                              onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5"
                            />
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div>
                              <label className="font-bold text-slate-700 block mb-1">Category *</label>
                              <select 
                                value={productForm.categoryId}
                                onChange={(e) => {
                                  const newCatId = e.target.value;
                                  const matchingCat = categories.find(c => c.id === newCatId);
                                  const defaultSub = matchingCat?.subcategories?.[0] || 'General';
                                  setProductForm({...productForm, categoryId: newCatId, subcategoryId: defaultSub});
                                }}
                                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5"
                              >
                                {categories.map(cat => (
                                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="font-bold text-slate-700 block mb-1">Subcategory *</label>
                              <select 
                                value={productForm.subcategoryId}
                                onChange={(e) => setProductForm({...productForm, subcategoryId: e.target.value})}
                                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5"
                              >
                                {(categories.find(c => c.id === productForm.categoryId)?.subcategories || ['General']).map(sub => (
                                  <option key={sub} value={sub}>{sub}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="font-bold text-slate-700 block mb-1">Brand *</label>
                              <input 
                                type="text" 
                                required
                                value={productForm.brand}
                                onChange={(e) => setProductForm({...productForm, brand: e.target.value})}
                                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-3">
                            <div>
                              <label className="font-bold text-slate-700 block mb-1">Selling Price (PKR) *</label>
                              <input 
                                type="number" 
                                required
                                value={productForm.price}
                                onChange={(e) => setProductForm({...productForm, price: Number(e.target.value)})}
                                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5"
                              />
                            </div>
                            <div>
                              <label className="font-bold text-slate-700 block mb-1">Original Price</label>
                              <input 
                                type="number" 
                                value={productForm.originalPrice}
                                onChange={(e) => setProductForm({...productForm, originalPrice: Number(e.target.value)})}
                                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5"
                              />
                            </div>
                            <div>
                              <label className="font-bold text-slate-700 block mb-1">Stock Qty *</label>
                              <input 
                                type="number" 
                                required
                                value={productForm.stock}
                                onChange={(e) => setProductForm({...productForm, stock: Number(e.target.value)})}
                                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="font-bold text-slate-700 block mb-1">Product Images (Minimum 3 Required) *</label>
                            <p className="text-[10px] text-slate-500 mb-2 font-semibold">Recommended Format: Square JPG/PNG (1000x1000px). Every product requires at least 3 images.</p>
                            
                            <div className="space-y-3">
                              {/* Image 1 */}
                              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                                <label className="text-[10px] font-bold text-slate-600 block mb-1">Image 1 (Main Cover) *</label>
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
                                          showToast('Product Image 1 uploaded!');
                                        }
                                      };
                                      reader.readAsDataURL(file);
                                    }
                                  }}
                                  className="w-full bg-white border border-slate-300 rounded-lg p-1.5 text-xs file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-[10px] file:font-bold file:bg-emerald-50 file:text-emerald-700"
                                />
                                {productForm.imageUrl1 && (
                                  <img src={productForm.imageUrl1} alt="Preview 1" className="w-12 h-12 object-cover rounded-lg mt-2 border" />
                                )}
                              </div>

                              {/* Image 2 */}
                              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                                <label className="text-[10px] font-bold text-slate-600 block mb-1">Image 2 (Angle / Detail) *</label>
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
                                          showToast('Product Image 2 uploaded!');
                                        }
                                      };
                                      reader.readAsDataURL(file);
                                    }
                                  }}
                                  className="w-full bg-white border border-slate-300 rounded-lg p-1.5 text-xs file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-[10px] file:font-bold file:bg-emerald-50 file:text-emerald-700"
                                />
                                {productForm.imageUrl2 && (
                                  <img src={productForm.imageUrl2} alt="Preview 2" className="w-12 h-12 object-cover rounded-lg mt-2 border" />
                                )}
                              </div>

                              {/* Image 3 */}
                              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                                <label className="text-[10px] font-bold text-slate-600 block mb-1">Image 3 (Lifestyle / Back) *</label>
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
                                          showToast('Product Image 3 uploaded!');
                                        }
                                      };
                                      reader.readAsDataURL(file);
                                    }
                                  }}
                                  className="w-full bg-white border border-slate-300 rounded-lg p-1.5 text-xs file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-[10px] file:font-bold file:bg-emerald-50 file:text-emerald-700"
                                />
                                {productForm.imageUrl3 && (
                                  <img src={productForm.imageUrl3} alt="Preview 3" className="w-12 h-12 object-cover rounded-lg mt-2 border" />
                                )}
                              </div>
                            </div>
                          </div>

                          <div>
                            <label className="font-bold text-slate-700 block mb-1">Description *</label>
                            <textarea 
                              rows={3} 
                              required
                              value={productForm.description}
                              onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <label className="font-bold text-slate-700 block mb-1">Color Variations (Comma separated)</label>
                              <input 
                                type="text"
                                placeholder="e.g. Black, Navy Blue, Maroon"
                                value={productForm.colorsString}
                                onChange={(e) => setProductForm({...productForm, colorsString: e.target.value})}
                                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5"
                              />
                            </div>
                            <div>
                              <label className="font-bold text-slate-700 block mb-1">Size Variations (Comma separated)</label>
                              <input 
                                type="text"
                                placeholder="e.g. S, M, L, XL"
                                value={productForm.sizesString}
                                onChange={(e) => setProductForm({...productForm, sizesString: e.target.value})}
                                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5"
                              />
                            </div>
                          </div>

                          <div className="flex items-center gap-4 pt-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={productForm.isFlashDeal}
                                onChange={(e) => setProductForm({...productForm, isFlashDeal: e.target.checked})}
                              />
                              <span>Flash Deal ⚡</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                              <input 
                                type="checkbox" 
                                checked={productForm.isFeatured}
                                onChange={(e) => setProductForm({...productForm, isFeatured: e.target.checked})}
                              />
                              <span>Featured Home Product</span>
                            </label>
                          </div>

                          <div className="flex gap-3 pt-4 border-t border-slate-200">
                            <button 
                              type="button"
                              onClick={() => setIsProductModalOpen(false)}
                              className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-2.5 rounded-xl"
                            >
                              Cancel
                            </button>
                            <button 
                              type="submit"
                              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl shadow"
                            >
                              {editingProductId ? 'Update Product' : 'Publish Product'}
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}

                  {/* ADD / EDIT CATEGORY MODAL */}
                  {isCategoryModalOpen && (
                    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-200">
                          <h3 className="font-black text-base text-slate-900">
                            {editingCategoryId ? 'Edit Category' : 'Add New Category'}
                          </h3>
                          <button onClick={() => setIsCategoryModalOpen(false)} className="p-1 hover:bg-slate-100 rounded-full">
                            <X className="w-5 h-5 text-slate-500" />
                          </button>
                        </div>

                        <form onSubmit={handleSaveCategory} className="space-y-4 text-xs">
                          <div>
                            <label className="font-bold text-slate-700 block mb-1">Category Name *</label>
                            <input 
                              type="text" 
                              required
                              placeholder="e.g. Luxury Perfumes"
                              value={categoryForm.name}
                              onChange={(e) => setCategoryForm({...categoryForm, name: e.target.value})}
                              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5"
                            />
                          </div>

                          <div>
                            <label className="font-bold text-slate-700 block mb-1">URL Slug</label>
                            <input 
                              type="text" 
                              placeholder="e.g. luxury-perfumes"
                              value={categoryForm.slug}
                              onChange={(e) => setCategoryForm({...categoryForm, slug: e.target.value})}
                              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5"
                            />
                          </div>

                          <div>
                            <label className="font-bold text-slate-700 block mb-1">Upload Category Image *</label>
                            <p className="text-[10px] text-slate-500 mb-1 font-semibold">Recommended Format: Square 1:1 or 4:3 JPG/PNG/WebP (600x600px - 800x800px)</p>
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
                                      showToast('Category image uploaded!');
                                    }
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-xs file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-700"
                            />
                            {categoryForm.image && (
                              <img src={categoryForm.image} alt="Preview" className="w-16 h-16 object-cover rounded-xl mt-2 border" />
                            )}
                          </div>

                          <div>
                            <label className="font-bold text-slate-700 block mb-1">Subcategories (Comma separated) *</label>
                            <input 
                              type="text" 
                              required
                              placeholder="e.g. Floral, Woody, Oriental, Fresh"
                              value={categoryForm.subcategories}
                              onChange={(e) => setCategoryForm({...categoryForm, subcategories: e.target.value})}
                              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5"
                            />
                          </div>

                          <div>
                            <label className="font-bold text-slate-700 block mb-1">Description</label>
                            <textarea 
                              rows={2} 
                              value={categoryForm.description}
                              onChange={(e) => setCategoryForm({...categoryForm, description: e.target.value})}
                              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5"
                            />
                          </div>

                          <div className="flex gap-3 pt-4 border-t border-slate-200">
                            <button 
                              type="button"
                              onClick={() => setIsCategoryModalOpen(false)}
                              className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-2.5 rounded-xl"
                            >
                              Cancel
                            </button>
                            <button 
                              type="submit"
                              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl shadow"
                            >
                              {editingCategoryId ? 'Update Category' : 'Save Category'}
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}

                  {/* ADD / EDIT CAROUSEL SLIDE MODAL */}
                  {isCarouselModalOpen && (
                    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-200">
                          <h3 className="font-black text-base text-slate-900">
                            {editingSlideId ? 'Edit Hero Slide' : 'Add New Hero Slide'}
                          </h3>
                          <button onClick={() => setIsCarouselModalOpen(false)} className="p-1 hover:bg-slate-100 rounded-full">
                            <X className="w-5 h-5 text-slate-500" />
                          </button>
                        </div>

                        <form onSubmit={handleSaveSlide} className="space-y-4 text-xs">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="font-bold text-slate-700 block mb-1">Badge Title *</label>
                              <input 
                                type="text" 
                                required
                                value={slideForm.badge}
                                onChange={(e) => setSlideForm({...slideForm, badge: e.target.value})}
                                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5"
                              />
                            </div>
                            <div>
                              <label className="font-bold text-slate-700 block mb-1">Discount Tag *</label>
                              <input 
                                type="text" 
                                required
                                value={slideForm.discount}
                                onChange={(e) => setSlideForm({...slideForm, discount: e.target.value})}
                                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="font-bold text-slate-700 block mb-1">Slide Headline Title *</label>
                            <input 
                              type="text" 
                              required
                              value={slideForm.title}
                              onChange={(e) => setSlideForm({...slideForm, title: e.target.value})}
                              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5"
                            />
                          </div>

                          <div>
                            <label className="font-bold text-slate-700 block mb-1">Subtitle *</label>
                            <input 
                              type="text" 
                              required
                              value={slideForm.subtitle}
                              onChange={(e) => setSlideForm({...slideForm, subtitle: e.target.value})}
                              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="font-bold text-slate-700 block mb-1">Button Text *</label>
                              <input 
                                type="text" 
                                required
                                value={slideForm.buttonText}
                                onChange={(e) => setSlideForm({...slideForm, buttonText: e.target.value})}
                                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5"
                              />
                            </div>
                            <div>
                              <label className="font-bold text-slate-700 block mb-1">Target Category *</label>
                              <select 
                                value={slideForm.categoryId}
                                onChange={(e) => setSlideForm({...slideForm, categoryId: e.target.value})}
                                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5"
                              >
                                {categories.map(cat => (
                                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div>
                            <label className="font-bold text-slate-700 block mb-1">Upload Banner Image *</label>
                            <p className="text-[10px] text-slate-500 mb-1 font-semibold">Recommended Format: Landscape 16:9 JPG/PNG (1920x1080px)</p>
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
                                      showToast('Banner image uploaded!');
                                    }
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                              className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-xs file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-emerald-50 file:text-emerald-700"
                            />
                            {slideForm.image && (
                              <img src={slideForm.image} alt="Preview" className="w-full h-24 object-cover rounded-xl mt-2 border" />
                            )}
                          </div>

                          <div className="flex gap-3 pt-4 border-t border-slate-200">
                            <button 
                              type="button"
                              onClick={() => setIsCarouselModalOpen(false)}
                              className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-2.5 rounded-xl"
                            >
                              Cancel
                            </button>
                            <button 
                              type="submit"
                              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-xl shadow"
                            >
                              {editingSlideId ? 'Update Slide' : 'Save Slide'}
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
                        onClick={() => { setSelectedCategory('cat-men'); setSelectedSubcategory(null); setCurrentView('products'); }} 
                        className="text-slate-700 hover:text-emerald-800 font-medium transition text-left"
                      >
                        Men's Formal & Casual Wear
                      </button>
                    </li>
                    <li>
                      <button 
                        onClick={() => { setSelectedCategory('cat-women'); setSelectedSubcategory(null); setCurrentView('products'); }} 
                        className="text-slate-700 hover:text-emerald-800 font-medium transition text-left"
                      >
                        Women's Pret, Lawn & Handbags
                      </button>
                    </li>
                    <li>
                      <button 
                        onClick={() => { setSelectedCategory('cat-kids'); setSelectedSubcategory(null); setCurrentView('products'); }} 
                        className="text-slate-700 hover:text-emerald-800 font-medium transition text-left"
                      >
                        Kids Festive & Casual Wear
                      </button>
                    </li>
                    <li>
                      <button 
                        onClick={() => { setSelectedCategory('cat-cosmetics'); setSelectedSubcategory(null); setCurrentView('products'); }} 
                        className="text-slate-700 hover:text-emerald-800 font-medium transition text-left"
                      >
                        Cosmetics, Skincare & Perfumes
                      </button>
                    </li>
                    <li>
                      <button 
                        onClick={() => { setSelectedCategory('cat-electronics'); setSelectedSubcategory(null); setCurrentView('products'); }} 
                        className="text-slate-700 hover:text-emerald-800 font-medium transition text-left"
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
                      <button 
                        onClick={() => { setCurrentView('orders'); }} 
                        className="text-slate-700 hover:text-emerald-800 font-medium transition flex items-center gap-1.5"
                      >
                        <Truck className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Track 8-Digit Order</span>
                      </button>
                    </li>
                    <li>
                      <button 
                        onClick={() => { setIsWishlistOpen(true); }} 
                        className="text-slate-700 hover:text-emerald-800 font-medium transition flex items-center gap-1.5"
                      >
                        <Heart className="w-3.5 h-3.5 text-red-500" />
                        <span>Saved Wishlist ({wishlist.length})</span>
                      </button>
                    </li>
                    <li>
                      <button 
                        onClick={() => { setIsCartOpen(true); }} 
                        className="text-slate-700 hover:text-emerald-800 font-medium transition flex items-center gap-1.5"
                      >
                        <ShoppingBag className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Shopping Cart ({cart.reduce((a, c) => a + c.quantity, 0)})</span>
                      </button>
                    </li>
                    <li>
                      <button 
                        onClick={() => { setCurrentView('support'); }} 
                        className="text-slate-700 hover:text-emerald-800 font-medium transition"
                      >
                        Customer Support & FAQs
                      </button>
                    </li>
                    <li>
                      <button 
                        onClick={() => { setCurrentView('admin'); window.scrollTo({ top: 0, behavior: 'smooth' }); }} 
                        className="text-emerald-950 font-bold hover:text-emerald-700 transition flex items-center gap-1.5 bg-emerald-100/70 hover:bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-300/70 mt-1 shadow-2xs"
                        title="Authorized Store Administration & Employee Access Only"
                      >
                        <Lock className="w-3.5 h-3.5 text-emerald-800" />
                        <span>Staff & Admin Portal</span>
                      </button>
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
            onClick={() => { setCurrentView('home'); window.location.hash = ''; }}
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
            onClick={() => { setSelectedCategory(null); setSelectedSubcategory(null); setCurrentView('products'); }}
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
            onClick={() => setCurrentView('account')}
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
            onClick={() => setCurrentView('orders')}
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
                          src={prod.images[0]} 
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
                <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-slate-100 rounded-full">
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
                      <img src={item.product?.images[0]} alt="" className="w-16 h-16 rounded-xl object-cover bg-white" />
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
                      setCurrentView('checkout');
                    }}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl shadow-lg transition text-xs"
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

      </div>
    </div>
  );
}
