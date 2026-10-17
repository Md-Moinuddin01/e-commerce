import {
  ArrowLeft,
  ArrowRight,
  Bell,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Compass,
  Copy,
  CreditCard,
  ExternalLink,
  Heart,
  Home,
  Landmark,
  LogOut,
  MapPin,
  Menu,
  Minus,
  Monitor,
  Moon,
  Navigation,
  PackageCheck,
  Plus,
  QrCode,
  Search,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Smartphone,
  Star,
  Sun,
  Trash2,
  Truck,
  User,
  Wallet,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import QRCode from 'qrcode';
import editorialModel from './assets/editorial-model.png';
import editorialTrench from './assets/editorial-model-trench.jpg';
import editorialReference from './assets/model-reference.jpg';
import { createOrderId, formatMoney, getDeliveryWindow, requestWalletConnection } from './commerce-utils.js';

type AppearanceMode = 'light' | 'dark' | 'system';

type Product = {
  id: string;
  name: string;
  brand: string;
  category: 'Men' | 'Women' | 'Children' | 'New offers';
  collection: 'New arrival' | 'Popular';
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  image: string;
  colors: string[];
  sizes: string[];
  badge: string;
  inventory: number;
  description: string;
};

type CartItem = {
  productId: string;
  color: string;
  size: string;
  quantity: number;
};

type UserProfile = {
  name: string;
  email: string;
  phone?: string;
  secondaryPhone?: string;
  address?: string;
  city?: string;
  region?: string;
  postal?: string;
  landmark?: string;
  lat?: number;
  lng?: number;
  savedPaymentMethod?: 'upi' | 'netbanking' | 'card' | 'wallet';
};

type WalletProfile = {
  address: string;
  chainId: string;
  walletType?: string;
};

type CheckoutForm = {
  fullName: string;
  email: string;
  phone: string;
  secondaryPhone?: string;
  address: string;
  city: string;
  region: string;
  postal: string;
  landmark?: string;
  lat?: number;
  lng?: number;
};

type OrderRecord = {
  id: string;
  total: number;
  delivery: string;
  paymentMethod?: string;
  reference?: string;
  deliveryAddress?: string;
  coordinates?: { lat: number; lng: number };
  itemsCount?: number;
  date?: string;
};

const OFFICIAL_WALLET = {
  address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
  ens: 'offthread-treasury.eth',
  network: 'Ethereum Mainnet (Chain 1)',
  explorer: 'https://etherscan.io/address/0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
  label: 'Verified Merchant Treasury Vault',
};

const UPI_ID = '6268385870@ybl';

const POPULAR_BANKS = [
  { id: 'sbi', name: 'State Bank of India', short: 'SBI', icon: '🏛️' },
  { id: 'hdfc', name: 'HDFC Bank', short: 'HDFC', icon: '🏦' },
  { id: 'icici', name: 'ICICI Bank', short: 'ICICI', icon: '🏦' },
  { id: 'axis', name: 'Axis Bank', short: 'Axis', icon: '💳' },
  { id: 'kotak', name: 'Kotak Mahindra Bank', short: 'Kotak', icon: '🏦' },
  { id: 'pnb', name: 'Punjab National Bank', short: 'PNB', icon: '🏛️' },
];

const OTHER_BANKS = [
  'Bank of Baroda',
  'Canara Bank',
  'Union Bank of India',
  'IndusInd Bank',
  'Federal Bank',
  'IDBI Bank',
  'Yes Bank',
  'Bank of India',
  'Indian Bank',
  'Central Bank of India',
  'Indian Overseas Bank',
  'UCO Bank',
  'RBL Bank',
  'IDFC First Bank',
  'South Indian Bank',
  'Jammu & Kashmir Bank',
  'Bandhan Bank',
  'AU Small Finance Bank',
];

const HERO_SLIDES = [
  {
    id: 'slide-1',
    image: editorialModel,
    subtitle: 'Hero drop 01 · Cobalt Utility',
    title: 'Cobalt Streetwear Form',
    description: 'Technical double-fleece structured hoodie with clean seam ergonomics and hidden zip pockets.',
    productId: 'cobalt-hoodie',
    badge: 'Hero Drop',
  },
  {
    id: 'slide-2',
    image: editorialTrench,
    subtitle: 'Hero drop 02 · Architectural Minimal',
    title: 'Monochrome Wool Trench',
    description: 'Heavyweight double-breasted tailored trench coat crafted from virgin brushed wool with silk interior lining.',
    productId: 'monochrome-wool-overcoat',
    badge: 'New Release',
  },
  {
    id: 'slide-3',
    image: editorialReference,
    subtitle: 'Hero drop 03 · Avant-Garde Civic',
    title: 'Ribbed Atelier Cardigan',
    description: 'Oversized chunky rib-knit spun with heritage merino fibers, styled for elevated urban lookbooks.',
    productId: 'atelier-heavy-knit',
    badge: 'Limited Drop',
  },
];

const products: Product[] = [
  {
    id: 'cobalt-hoodie',
    name: 'Cobalt Utility Hoodie',
    brand: 'Atelier Nova',
    category: 'Men',
    collection: 'New arrival',
    price: 150.2,
    originalPrice: 190,
    rating: 4.9,
    reviewCount: 328,
    image: editorialModel,
    colors: ['Cobalt', 'Cloud', 'Black'],
    sizes: ['S', 'M', 'L', 'XL'],
    badge: 'Hero drop',
    inventory: 16,
    description: 'Oversized technical fleece with clean seams, structured hood, and soft brushed interior.',
  },
  {
    id: 'therma-fit',
    name: 'Therma Fit Pullover',
    brand: 'Northline',
    category: 'Men',
    collection: 'New arrival',
    price: 120.5,
    rating: 4.7,
    reviewCount: 214,
    image: 'https://images.unsplash.com/photo-1552374196-1ab2a1c593e8?auto=format&fit=crop&w=900&q=80',
    colors: ['Slate', 'Graphite', 'Sea'],
    sizes: ['S', 'M', 'L', 'XL'],
    badge: 'New',
    inventory: 28,
    description: 'A clean pullover for layered city outfits, finished with rib cuffs and a dense warm handle.',
  },
  {
    id: 'solo-shell',
    name: 'Solo Swoop Shell',
    brand: 'Valley Dept.',
    category: 'New offers',
    collection: 'New arrival',
    price: 132,
    originalPrice: 165,
    rating: 4.6,
    reviewCount: 177,
    image: 'https://images.unsplash.com/photo-1520975916090-3105956dac38?auto=format&fit=crop&w=900&q=80',
    colors: ['Blue', 'Ink', 'Bone'],
    sizes: ['S', 'M', 'L', 'XL'],
    badge: 'Offer',
    inventory: 22,
    description: 'Lightweight shell jacket with a high collar, water-resistant surface, and packable finish.',
  },
  {
    id: 'rose-fleece',
    name: 'Rose Flight Fleece',
    brand: 'Civic Wear',
    category: 'Women',
    collection: 'Popular',
    price: 180,
    rating: 4.8,
    reviewCount: 421,
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80',
    colors: ['Rose', 'Cream', 'Black'],
    sizes: ['XS', 'S', 'M', 'L'],
    badge: 'Popular',
    inventory: 13,
    description: 'Soft-volume fleece with relaxed sleeves and a cropped streetwear profile.',
  },
  {
    id: 'olive-adv',
    name: 'Olive Thermal ADV',
    brand: 'Terrain Form',
    category: 'Men',
    collection: 'Popular',
    price: 185,
    rating: 4.7,
    reviewCount: 196,
    image: 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?auto=format&fit=crop&w=900&q=80',
    colors: ['Olive', 'Black', 'Taupe'],
    sizes: ['S', 'M', 'L', 'XL'],
    badge: 'Best',
    inventory: 19,
    description: 'A warm ADV layer with a half-brushed finish, roomy pocketing, and travel-ready weight.',
  },
  {
    id: 'mini-track',
    name: 'Mini Track Set',
    brand: 'Little Field',
    category: 'Children',
    collection: 'Popular',
    price: 88,
    rating: 4.6,
    reviewCount: 102,
    image: 'https://images.unsplash.com/photo-1600369671236-e74521d4b6ad?auto=format&fit=crop&w=900&q=80',
    colors: ['Sky', 'Pine', 'Stone'],
    sizes: ['4Y', '6Y', '8Y', '10Y'],
    badge: 'Kids',
    inventory: 31,
    description: 'Easy two-piece track set with stretch cuffs, soft lining, and washable color-block panels.',
  },
  {
    id: 'atelier-heavy-knit',
    name: 'Atelier Ribbed Wool Cardigan',
    brand: 'Atelier Nova',
    category: 'Men',
    collection: 'New arrival',
    price: 100,
    originalPrice: 140,
    rating: 4.8,
    reviewCount: 184,
    image: 'https://images.unsplash.com/photo-1617137984095-74e4e5e3613f?auto=format&fit=crop&w=900&q=80',
    colors: ['Oatmeal', 'Espresso', 'Charcoal'],
    sizes: ['S', 'M', 'L', 'XL'],
    badge: 'Drop',
    inventory: 24,
    description: 'Chunky rib-knit cardigan spun from premium merino wool blend with horn buttons.',
  },
  {
    id: 'monochrome-wool-overcoat',
    name: 'Monochrome Wool Trench',
    brand: 'Atelier Nova',
    category: 'Men',
    collection: 'Popular',
    price: 200,
    originalPrice: 260,
    rating: 4.9,
    reviewCount: 342,
    image: editorialTrench,
    colors: ['Obsidian', 'Camel', 'Fog'],
    sizes: ['S', 'M', 'L', 'XL'],
    badge: 'Hero drop',
    inventory: 14,
    description: 'Architectural heavyweight wool overcoat with tailored storm collar and silk lining.',
  },
  {
    id: 'sculpted-linen-blazer',
    name: 'Sculpted Linen Blazer',
    brand: 'Civic Wear',
    category: 'Women',
    collection: 'New arrival',
    price: 100,
    originalPrice: 145,
    rating: 4.9,
    reviewCount: 226,
    image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=900&q=80',
    colors: ['Ivory', 'Sage', 'Terracotta'],
    sizes: ['XS', 'S', 'M', 'L'],
    badge: 'New',
    inventory: 18,
    description: 'Breathable linen tailored blazer with relaxed double-breasted cut and soft notched lapels.',
  },
  {
    id: 'draped-silk-gown',
    name: 'Draped Mulberry Silk Trench Gown',
    brand: 'Civic Wear',
    category: 'Women',
    collection: 'Popular',
    price: 200,
    originalPrice: 285,
    rating: 5.0,
    reviewCount: 198,
    image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=900&q=80',
    colors: ['Champagne', 'Midnight', 'Emerald'],
    sizes: ['XS', 'S', 'M', 'L'],
    badge: 'Exclusive',
    inventory: 12,
    description: 'Fluid Mulberry silk evening gown with asymmetric drape neckline and waist cinch belt.',
  },
  {
    id: 'storm-field-parka',
    name: 'Junior Storm Field Parka',
    brand: 'Little Field',
    category: 'Children',
    collection: 'New arrival',
    price: 100,
    originalPrice: 130,
    rating: 4.7,
    reviewCount: 94,
    image: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=900&q=80',
    colors: ['Pine', 'Navy', 'Mustard'],
    sizes: ['6Y', '8Y', '10Y', '12Y'],
    badge: 'Kids',
    inventory: 22,
    description: 'All-weather water-repellent storm shell with sherpa lining and reflective trims.',
  },
  {
    id: 'velvet-flight-bomber',
    name: 'Quilted Velvet Flight Bomber',
    brand: 'Valley Dept.',
    category: 'New offers',
    collection: 'Popular',
    price: 200,
    originalPrice: 275,
    rating: 4.8,
    reviewCount: 173,
    image: 'https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=900&q=80',
    colors: ['Midnight Blue', 'Emerald', 'Black'],
    sizes: ['S', 'M', 'L', 'XL'],
    badge: 'Offer',
    inventory: 15,
    description: 'Lustrous diamond-quilted velvet bomber insulated with thermal down-touch filling.',
  },
];

const tabs = ['Men', 'Women', 'Children', 'New offers'] as const;

function useStoredState<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? (JSON.parse(stored) as T) : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue] as const;
}

function shortAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export default function App() {
  const [appearance, setAppearance] = useStoredState<AppearanceMode>('offthread-theme', 'system');
  const [cart, setCart] = useStoredState<CartItem[]>('offthread-cart', []);
  const [wishlist, setWishlist] = useStoredState<string[]>('offthread-wishlist', []);
  const [user, setUser] = useStoredState<UserProfile | null>('offthread-user-profile', null);
  const [wallet, setWallet] = useStoredState<WalletProfile | null>('offthread-wallet', null);
  const [orders, setOrders] = useStoredState<OrderRecord[]>('offthread-orders', []);

  const [currentView, setCurrentView] = useState<'home' | 'checkout' | 'profile'>(() => {
    const hash = window.location.hash.toLowerCase();
    if (hash === '#checkout') return 'checkout';
    if (hash === '#profile') return 'profile';
    return 'home';
  });

  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>('Men');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('featured');
  const [cartOpen, setCartOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [walletMessage, setWalletMessage] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [shippingSpeed, setShippingSpeed] = useState<'standard' | 'express'>('standard');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'netbanking' | 'card' | 'wallet'>('upi');
  const [selectedBank, setSelectedBank] = useState('sbi');
  const [otherBank, setOtherBank] = useState('');
  const [upiUtr, setUpiUtr] = useState('');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [isSimulatingRedirect, setIsSimulatingRedirect] = useState(false);
  const [redirectBankName, setRedirectBankName] = useState('');
  const [upiTimer, setUpiTimer] = useState(300);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [connectingProvider, setConnectingProvider] = useState<string | null>(null);

  // Delivery form state synced with user profile
  const [checkout, setCheckout] = useState<CheckoutForm>(() => ({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    secondaryPhone: user?.secondaryPhone || '',
    address: user?.address || '',
    city: user?.city || '',
    region: user?.region || '',
    postal: user?.postal || '',
    landmark: user?.landmark || '',
    lat: user?.lat || 28.6139,
    lng: user?.lng || 77.209,
  }));

  const [checkoutMessage, setCheckoutMessage] = useState('');
  const [lastOrder, setLastOrder] = useState<OrderRecord | null>(null);

  // Apply Appearance Theme
  useEffect(() => {
    const root = document.documentElement;
    const media = window.matchMedia('(prefers-color-scheme: dark)');

    const updateTheme = () => {
      const isDark = appearance === 'dark' || (appearance === 'system' && media.matches);
      if (isDark) {
        root.setAttribute('data-theme', 'dark');
      } else {
        root.removeAttribute('data-theme');
      }
    };

    updateTheme();
    media.addEventListener('change', updateTheme);
    return () => media.removeEventListener('change', updateTheme);
  }, [appearance]);

  // Sync hash routing
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash === '#checkout') setCurrentView('checkout');
      else if (hash === '#profile') setCurrentView('profile');
      else setCurrentView('home');
    };
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const navigateTo = (view: 'home' | 'checkout' | 'profile') => {
    setCurrentView(view);
    window.location.hash = view === 'home' ? '#home' : `#${view}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // UPI 5-minute countdown timer effect
  useEffect(() => {
    if (paymentMethod !== 'upi') return;
    const interval = setInterval(() => {
      setUpiTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [paymentMethod]);

  const resetUpiTimer = () => {
    setUpiTimer(300);
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const connectSpecificWallet = async (providerType: 'metamask' | 'coinbase' | 'trust' | 'demo') => {
    setWalletMessage('');
    setConnectingProvider(providerType);
    try {
      const connected = await requestWalletConnection(providerType);
      setWallet(connected as WalletProfile);
      setWalletMessage(`Connected via ${connected.walletType || 'Wallet'}! 3% discount active.`);
      setWalletModalOpen(false);
    } catch (error) {
      if (error instanceof Error && error.message === 'REJECTED') {
        setWalletMessage('Wallet connection request was rejected.');
      } else {
        const demo = await requestWalletConnection('demo');
        setWallet(demo as WalletProfile);
        setWalletMessage(`Connected via ${providerType.toUpperCase()} (Simulated). 3% discount active.`);
        setWalletModalOpen(false);
      }
    } finally {
      setConnectingProvider(null);
    }
  };

  const searchedProducts = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    const list = products.filter((product) => {
      const tabMatch = product.category === activeTab || activeTab === 'New offers';
      const offerMatch = activeTab !== 'New offers' || Boolean(product.originalPrice);
      const queryMatch =
        !normalized ||
        product.name.toLowerCase().includes(normalized) ||
        product.brand.toLowerCase().includes(normalized) ||
        product.category.toLowerCase().includes(normalized);
      return tabMatch && offerMatch && queryMatch;
    });

    if (sort === 'price-low') return list.sort((a, b) => a.price - b.price);
    if (sort === 'price-high') return list.sort((a, b) => b.price - a.price);
    if (sort === 'rating') return list.sort((a, b) => b.rating - a.rating);
    return list.sort((a, b) => b.reviewCount - a.reviewCount);
  }, [activeTab, query, sort]);

  const cartLines = cart
    .map((item) => ({
      item,
      product: products.find((product) => product.id === item.productId),
    }))
    .filter((line): line is { item: CartItem; product: Product } => Boolean(line.product));

  const itemCount = cart.reduce((count, item) => count + item.quantity, 0);
  const subtotal = cartLines.reduce((sum, line) => sum + line.product.price * line.item.quantity, 0);
  const promoDiscount = promoCode.trim().toUpperCase() === 'STYLE10' ? subtotal * 0.1 : 0;
  const walletDiscount = wallet ? subtotal * 0.03 : 0;
  const shipping = subtotal === 0 || subtotal > 250 ? 0 : shippingSpeed === 'express' ? 18 : 8;
  const tax = Math.max(subtotal - promoDiscount - walletDiscount, 0) * 0.082;
  const total = Math.max(subtotal - promoDiscount - walletDiscount + shipping + tax, 0);

  const inrAmount = useMemo(() => Math.round(total * 85), [total]);

  // UPI deep-link URI (URI contains the recipient UPI ID, but the UI text string is hidden)
  const upiUri = useMemo(() => {
    const amountVal = inrAmount > 0 ? inrAmount : 1;
    return `upi://pay?pa=${UPI_ID}&pn=off-thread%20Store&am=${amountVal}&cu=INR&tn=Order%20Payment`;
  }, [inrAmount]);

  useEffect(() => {
    let active = true;
    QRCode.toDataURL(upiUri, {
      width: 260,
      margin: 2,
      color: {
        dark: '#0b0d10',
        light: '#ffffff',
      },
    })
      .then((url) => {
        if (active) setQrCodeDataUrl(url);
      })
      .catch(() => {
        if (active) {
          setQrCodeDataUrl(
            `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=8&data=${encodeURIComponent(upiUri)}`,
          );
        }
      });
    return () => {
      active = false;
    };
  }, [upiUri]);

  const handleUpiDirectRedirect = (scheme?: 'phonepe' | 'gpay' | 'paytm') => {
    let url = upiUri;
    if (scheme === 'phonepe') {
      url = `phonepe://pay?pa=${UPI_ID}&pn=off-thread%20Store&am=${inrAmount}&cu=INR&tn=Order%20Payment`;
    } else if (scheme === 'gpay') {
      url = `tez://upi/pay?pa=${UPI_ID}&pn=off-thread%20Store&am=${inrAmount}&cu=INR&tn=Order%20Payment`;
    } else if (scheme === 'paytm') {
      url = `paytmmp://pay?pa=${UPI_ID}&pn=off-thread%20Store&am=${inrAmount}&cu=INR&tn=Order%20Payment`;
    }
    window.location.href = url;
  };

  const addToCart = (product: Product, quantity = 1, color = product.colors[0], size = product.sizes[0]) => {
    setCart((current) => {
      const existing = current.find(
        (item) => item.productId === product.id && item.color === color && item.size === size,
      );
      if (existing) {
        return current.map((item) =>
          item.productId === product.id && item.color === color && item.size === size
            ? { ...item, quantity: Math.min(item.quantity + quantity, product.inventory) }
            : item,
        );
      }
      return [...current, { productId: product.id, color, size, quantity }];
    });
    setCartOpen(true);
  };

  const updateQuantity = (target: CartItem, quantity: number) => {
    setCart((current) =>
      current
        .map((item) =>
          item.productId === target.productId && item.color === target.color && item.size === target.size
            ? { ...item, quantity: Math.max(quantity, 1) }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  const removeFromCart = (target: CartItem) => {
    setCart((current) =>
      current.filter(
        (item) => !(item.productId === target.productId && item.color === target.color && item.size === target.size),
      ),
    );
  };

  const toggleWishlist = (productId: string) => {
    setWishlist((current) =>
      current.includes(productId) ? current.filter((id) => id !== productId) : [...current, productId],
    );
  };

  const submitAuth = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get('name') || '').trim();
    const email = String(form.get('email') || '').trim();
    const password = String(form.get('password') || '');
    if (!email || password.length < 6) return;
    const profileData: UserProfile = {
      name: name || email.split('@')[0] || 'Member',
      email,
      phone: checkout.phone,
      address: checkout.address,
      city: checkout.city,
      region: checkout.region,
      postal: checkout.postal,
      landmark: checkout.landmark,
      lat: checkout.lat,
      lng: checkout.lng,
    };
    setUser(profileData);
    setAuthOpen(false);
  };

  const saveProfileInfo = (updatedProfile: UserProfile) => {
    setUser(updatedProfile);
    setCheckout((prev) => ({
      ...prev,
      fullName: updatedProfile.name,
      email: updatedProfile.email,
      phone: updatedProfile.phone || prev.phone,
      secondaryPhone: updatedProfile.secondaryPhone || prev.secondaryPhone,
      address: updatedProfile.address || prev.address,
      city: updatedProfile.city || prev.city,
      region: updatedProfile.region || prev.region,
      postal: updatedProfile.postal || prev.postal,
      landmark: updatedProfile.landmark || prev.landmark,
      lat: updatedProfile.lat || prev.lat,
      lng: updatedProfile.lng || prev.lng,
    }));
  };

  const placeOrder = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCheckoutMessage('');

    if (!cartLines.length) {
      setCheckoutMessage('Your cart is empty. Please add items to checkout.');
      return;
    }
    if (!user && !wallet) {
      if (checkout.fullName.trim() && checkout.email.trim()) {
        const newUser: UserProfile = {
          name: checkout.fullName.trim(),
          email: checkout.email.trim(),
          phone: checkout.phone.trim(),
          address: checkout.address.trim(),
          city: checkout.city.trim(),
          region: checkout.region.trim(),
          postal: checkout.postal.trim(),
          landmark: checkout.landmark,
          lat: checkout.lat,
          lng: checkout.lng,
        };
        setUser(newUser);
      } else {
        setCheckoutMessage('Please enter your full name and email to place the order.');
        return;
      }
    }
    if (paymentMethod === 'wallet' && !wallet) {
      setCheckoutMessage('Connect your wallet before wallet payment.');
      return;
    }
    if (!checkout.fullName.trim() || !checkout.address.trim() || !checkout.city.trim() || !checkout.phone.trim()) {
      setCheckoutMessage('Please complete the mandatory delivery details.');
      return;
    }

    let methodLabel = 'Card';
    let refLabel = '';

    if (paymentMethod === 'upi') {
      methodLabel = 'UPI Express Transfer';
      refLabel = upiUtr.trim() ? `UTR: ${upiUtr.trim()}` : `Ref: UPI-${Math.floor(100000000000 + Math.random() * 900000000000)}`;
    } else if (paymentMethod === 'netbanking') {
      const bankName =
        selectedBank === 'other'
          ? otherBank || 'Selected Bank'
          : POPULAR_BANKS.find((b) => b.id === selectedBank)?.name || 'Net Banking';
      methodLabel = `Net Banking (${bankName})`;
      refLabel = `Bank Ref: NB-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

      setIsSimulatingRedirect(true);
      setRedirectBankName(bankName);
      setTimeout(() => {
        setIsSimulatingRedirect(false);
        const order: OrderRecord = {
          id: createOrderId(),
          total,
          delivery: getDeliveryWindow(shippingSpeed),
          paymentMethod: methodLabel,
          reference: refLabel,
          deliveryAddress: `${checkout.address}, ${checkout.city}, ${checkout.region} ${checkout.postal}`,
          coordinates: checkout.lat && checkout.lng ? { lat: checkout.lat, lng: checkout.lng } : undefined,
          itemsCount: itemCount,
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        };
        setOrders((current) => [order, ...current]);
        setLastOrder(order);
        setCart([]);
        setPromoCode('');
        setUpiUtr('');
      }, 1900);
      return;
    } else if (paymentMethod === 'wallet') {
      methodLabel = `Web3 Wallet (${shortAddress(wallet?.address || '')})`;
      refLabel = `Vault: ${OFFICIAL_WALLET.ens}`;
    }

    const order: OrderRecord = {
      id: createOrderId(),
      total,
      delivery: getDeliveryWindow(shippingSpeed),
      paymentMethod: methodLabel,
      reference: refLabel,
      deliveryAddress: `${checkout.address}, ${checkout.city}, ${checkout.region} ${checkout.postal}`,
      coordinates: checkout.lat && checkout.lng ? { lat: checkout.lat, lng: checkout.lng } : undefined,
      itemsCount: itemCount,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    };
    setOrders((current) => [order, ...current]);
    setLastOrder(order);
    setCart([]);
    setPromoCode('');
    setUpiUtr('');
  };

  return (
    <div className="app-shell">
      {/* Site Header */}
      <header className="site-header">
        <div className="nav-bar">
          <button className="icon-button menu-button" aria-label="Menu" onClick={() => navigateTo('home')}>
            <Menu size={20} aria-hidden="true" />
          </button>

          <button className="brand-logo-btn" onClick={() => navigateTo('home')} aria-label="off-thread home">
            off-thread
          </button>

          <nav className="desktop-links" aria-label="Primary navigation">
            <button className={currentView === 'home' && activeTab === 'Men' ? 'active' : ''} onClick={() => { navigateTo('home'); setActiveTab('Men'); }}>
              Men
            </button>
            <button className={currentView === 'home' && activeTab === 'Women' ? 'active' : ''} onClick={() => { navigateTo('home'); setActiveTab('Women'); }}>
              Women
            </button>
            <button className={currentView === 'home' && activeTab === 'Children' ? 'active' : ''} onClick={() => { navigateTo('home'); setActiveTab('Children'); }}>
              Children
            </button>
            <button className={currentView === 'home' && activeTab === 'New offers' ? 'active' : ''} onClick={() => { navigateTo('home'); setActiveTab('New offers'); }}>
              Offers
            </button>
            <button className={currentView === 'checkout' ? 'active highlight' : ''} onClick={() => navigateTo('checkout')}>
              Checkout
            </button>
            <button className={currentView === 'profile' ? 'active' : ''} onClick={() => navigateTo('profile')}>
              Profile
            </button>
          </nav>

          <div className="header-tools">
            {/* Appearance Toggle */}
            <div className="theme-switcher-pill" aria-label="Theme mode switcher">
              <button
                className={appearance === 'light' ? 'theme-btn active' : 'theme-btn'}
                onClick={() => setAppearance('light')}
                title="Light Mode"
              >
                <Sun size={15} />
              </button>
              <button
                className={appearance === 'dark' ? 'theme-btn active' : 'theme-btn'}
                onClick={() => setAppearance('dark')}
                title="Dark Mode"
              >
                <Moon size={15} />
              </button>
              <button
                className={appearance === 'system' ? 'theme-btn active' : 'theme-btn'}
                onClick={() => setAppearance('system')}
                title="System Mode"
              >
                <Monitor size={15} />
              </button>
            </div>

            <button className="icon-button" aria-label="Search" onClick={() => { navigateTo('home'); setTimeout(() => document.getElementById('productSearch')?.focus(), 100); }}>
              <Search size={19} aria-hidden="true" />
            </button>

            <button className="icon-button" aria-label="User Profile" onClick={() => navigateTo('profile')}>
              <User size={19} aria-hidden="true" />
            </button>

            <button className="icon-button count-button" aria-label="Open cart" onClick={() => setCartOpen(true)}>
              <ShoppingCart size={19} aria-hidden="true" />
              <span>{itemCount}</span>
            </button>
          </div>
        </div>

        {currentView === 'home' ? (
          <div className="mobile-tabs" aria-label="Shop categories">
            {tabs.map((tab) => (
              <button key={tab} className={activeTab === tab ? 'active' : ''} onClick={() => setActiveTab(tab)}>
                {tab}
              </button>
            ))}
          </div>
        ) : null}
      </header>

      {/* Main Content Router */}
      {currentView === 'home' ? (
        <main id="home">
          {/* Animated Hero Carousel featuring the SAME face model */}
          <HeroCarousel
            slides={HERO_SLIDES}
            products={products}
            onAddToCart={addToCart}
            onSelectProduct={setSelectedProduct}
            onConnectWallet={() => setWalletModalOpen(true)}
          />

          <section className="store-controls">
            <label className="search-panel">
              <Search size={18} aria-hidden="true" />
              <input
                id="productSearch"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search hoodies, trench, cardigans, gowns..."
              />
            </label>

            <label className="sort-panel">
              <span>Sort</span>
              <select value={sort} onChange={(event) => setSort(event.target.value)}>
                <option value="featured">Most Popular</option>
                <option value="rating">Top Rated</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </label>
          </section>

          {/* Shelves */}
          <ProductShelf
            title={`${activeTab} Collection`}
            products={searchedProducts}
            wishlist={wishlist}
            onAdd={addToCart}
            onSave={toggleWishlist}
            onView={setSelectedProduct}
          />

          {/* Statement Grid with Model Reference */}
          <section className="style-statement">
            <h2>Crafted For Individuality. Worn With Confidence.</h2>
            <div className="statement-grid">
              <button className="statement-card" onClick={() => setSelectedProduct(products[7])}>
                <img src={editorialTrench} alt="Monochrome Wool Trench" />
                <span>Monochrome Wool Trench — $200</span>
              </button>
              <button className="statement-card" onClick={() => setSelectedProduct(products[6])}>
                <img src={editorialReference} alt="Ribbed Atelier Cardigan" />
                <span>Atelier Ribbed Cardigan — $100</span>
              </button>
            </div>
          </section>

          {/* Account & Verified Wallet Strip */}
          <section className="account-wallet-strip">
            <div>
              <User size={21} aria-hidden="true" />
              <strong>{user ? user.name : 'Guest Customer'}</strong>
              <span>{user ? user.email : 'Create an account to save delivery location'}</span>
            </div>
            <button className="light-button" onClick={() => (user ? navigateTo('profile') : setAuthOpen(true))}>
              {user ? 'My Profile' : 'Sign in'}
            </button>

            <div>
              <Wallet size={21} aria-hidden="true" />
              <div>
                <strong>{wallet ? `${wallet.walletType || 'Wallet'}: ${shortAddress(wallet.address)}` : 'Web3 Discount'}</strong>
                <small className="verified-ens-badge">✓ Treasury: {OFFICIAL_WALLET.ens}</small>
              </div>
            </div>
            <button className="dark-button" onClick={wallet ? () => setWallet(null) : () => setWalletModalOpen(true)}>
              {wallet ? 'Disconnect' : 'Connect Wallet'}
            </button>
          </section>
        </main>
      ) : null}

      {/* DEDICATED FULL PAYMENT / CHECKOUT PAGE */}
      {currentView === 'checkout' ? (
        <CheckoutPageView
          cartLines={cartLines}
          itemCount={itemCount}
          subtotal={subtotal}
          promoDiscount={promoDiscount}
          walletDiscount={walletDiscount}
          shipping={shipping}
          tax={tax}
          total={total}
          inrAmount={inrAmount}
          promoCode={promoCode}
          setPromoCode={setPromoCode}
          shippingSpeed={shippingSpeed}
          setShippingSpeed={setShippingSpeed}
          paymentMethod={paymentMethod}
          setPaymentMethod={setPaymentMethod}
          selectedBank={selectedBank}
          setSelectedBank={setSelectedBank}
          otherBank={otherBank}
          setOtherBank={setOtherBank}
          upiUtr={upiUtr}
          setUpiUtr={setUpiUtr}
          upiTimer={upiTimer}
          resetUpiTimer={resetUpiTimer}
          formatTimer={formatTimer}
          qrCodeDataUrl={qrCodeDataUrl}
          handleUpiDirectRedirect={handleUpiDirectRedirect}
          checkout={checkout}
          setCheckout={setCheckout}
          checkoutMessage={checkoutMessage}
          lastOrder={lastOrder}
          placeOrder={placeOrder}
          onBackToStore={() => navigateTo('home')}
          wallet={wallet}
          onOpenWalletModal={() => setWalletModalOpen(true)}
          user={user}
        />
      ) : null}

      {/* DEDICATED USER PROFILE AREA */}
      {currentView === 'profile' ? (
        <UserProfilePageView
          user={user}
          onSaveProfile={saveProfileInfo}
          orders={orders}
          wallet={wallet}
          onOpenWalletModal={() => setWalletModalOpen(true)}
          onDisconnectWallet={() => setWallet(null)}
          appearance={appearance}
          setAppearance={setAppearance}
          onBackToStore={() => navigateTo('home')}
          onGoToCheckout={() => navigateTo('checkout')}
        />
      ) : null}

      {/* Mobile Bottom Navigation */}
      <nav className="bottom-nav" aria-label="Mobile actions">
        <button className={currentView === 'home' ? 'active' : ''} onClick={() => navigateTo('home')}>
          <Home size={19} aria-hidden="true" />
          <span>Home</span>
        </button>
        <button onClick={() => { navigateTo('home'); setTimeout(() => document.getElementById('productSearch')?.focus(), 100); }}>
          <Search size={19} aria-hidden="true" />
          <span>Search</span>
        </button>
        <button onClick={() => setCartOpen(true)}>
          <ShoppingCart size={19} aria-hidden="true" />
          <span>Cart ({itemCount})</span>
        </button>
        <button className={currentView === 'checkout' ? 'active' : ''} onClick={() => navigateTo('checkout')}>
          <CreditCard size={19} aria-hidden="true" />
          <span>Checkout</span>
        </button>
        <button className={currentView === 'profile' ? 'active' : ''} onClick={() => navigateTo('profile')}>
          <User size={19} aria-hidden="true" />
          <span>Profile</span>
        </button>
      </nav>

      {/* Cart Drawer */}
      {cartOpen ? (
        <CartDrawer
          cartLines={cartLines}
          itemCount={itemCount}
          subtotal={subtotal}
          total={total}
          onClose={() => setCartOpen(false)}
          onQuantity={updateQuantity}
          onRemove={removeFromCart}
          onProceedToCheckout={() => {
            setCartOpen(false);
            navigateTo('checkout');
          }}
        />
      ) : null}

      {/* Auth Modal */}
      {authOpen ? (
        <AuthModal
          mode={authMode}
          user={user}
          wallet={wallet}
          walletMessage={walletMessage}
          onClose={() => setAuthOpen(false)}
          onMode={setAuthMode}
          onSubmit={submitAuth}
          onSignOut={() => setUser(null)}
          onWalletConnect={() => setWalletModalOpen(true)}
          onWalletDisconnect={() => setWallet(null)}
        />
      ) : null}

      {/* Product Detail Modal */}
      {selectedProduct ? (
        <ProductDialog
          product={selectedProduct}
          saved={wishlist.includes(selectedProduct.id)}
          onClose={() => setSelectedProduct(null)}
          onAdd={addToCart}
          onSave={() => toggleWishlist(selectedProduct.id)}
        />
      ) : null}

      {/* Web3 Wallet Modal */}
      {walletModalOpen ? (
        <WalletModal
          isConnecting={connectingProvider}
          onClose={() => setWalletModalOpen(false)}
          onConnect={connectSpecificWallet}
        />
      ) : null}

      {/* Netbanking Redirection Gateway Simulation */}
      {isSimulatingRedirect ? (
        <div className="overlay center">
          <section className="gateway-modal" aria-label="Connecting to Bank Gateway">
            <div className="gateway-spinner"></div>
            <h3>Connecting to {redirectBankName}</h3>
            <p>Please wait while we redirect you to the bank's secure Net Banking payment gateway...</p>
            <div className="gateway-security-tag">
              <ShieldCheck size={16} /> 256-Bit SSL Encrypted & RBI Compliant
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}

/* =========================================================================
   ANIMATED HERO CAROUSEL COMPONENT (Same face model across multiple drops)
   ========================================================================= */
function HeroCarousel({
  slides,
  products,
  onAddToCart,
  onSelectProduct,
  onConnectWallet,
}: {
  slides: typeof HERO_SLIDES;
  products: Product[];
  onAddToCart: (product: Product) => void;
  onSelectProduct: (product: Product) => void;
  onConnectWallet: () => void;
}) {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [isPaused, slides.length]);

  const nextSlide = () => setActiveSlide((prev) => (prev + 1) % slides.length);
  const prevSlide = () => setActiveSlide((prev) => (prev - 1 + slides.length) % slides.length);

  const currentSlide = slides[activeSlide];
  const currentProduct = products.find((p) => p.id === currentSlide.productId) || products[0];

  return (
    <section
      className="hero-carousel-container"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      aria-label="Editorial Lookbook Carousel"
    >
      <div className="carousel-slide-wrap">
        <img
          key={currentSlide.id}
          src={currentSlide.image}
          alt={currentSlide.title}
          className="carousel-model-image fade-in-scale"
        />

        <div className="carousel-overlay-content">
          <span className="carousel-drop-badge">{currentSlide.subtitle}</span>
          <h1 className="carousel-headline">{currentSlide.title}</h1>
          <p className="carousel-subheading">{currentSlide.description}</p>

          <div className="carousel-actions">
            <button className="dark-button hero-btn" onClick={() => onAddToCart(currentProduct)}>
              <ShoppingBag size={17} aria-hidden="true" />
              Shop This Look ({formatMoney(currentProduct.price)})
            </button>
            <button className="light-button hero-btn" onClick={() => onSelectProduct(currentProduct)}>
              View Details
            </button>
            <button className="light-button hero-btn" onClick={onConnectWallet}>
              <Wallet size={17} aria-hidden="true" />
              3% Wallet Deal
            </button>
          </div>
        </div>

        <button className="carousel-nav-btn prev" onClick={prevSlide} aria-label="Previous Outfit">
          <ChevronLeft size={22} />
        </button>
        <button className="carousel-nav-btn next" onClick={nextSlide} aria-label="Next Outfit">
          <ChevronRight size={22} />
        </button>

        <div className="carousel-dots">
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              className={activeSlide === index ? 'dot active' : 'dot'}
              onClick={() => setActiveSlide(index)}
              aria-label={`Go to ${slide.title}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/* =========================================================================
   INTERACTIVE GOOGLE MAP LOCATION PICKER COMPONENT
   ========================================================================= */
function GoogleMapLocationPicker({
  lat,
  lng,
  landmark,
  onLocationChange,
}: {
  lat: number;
  lng: number;
  landmark: string;
  onLocationChange: (lat: number, lng: number, landmark?: string) => void;
}) {
  const [isLocating, setIsLocating] = useState(false);
  const [locateStatus, setLocateStatus] = useState('');

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocateStatus('Geolocation is not supported by your browser.');
      return;
    }
    setIsLocating(true);
    setLocateStatus('Pinpointing exact GPS coordinates...');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const { latitude, longitude } = pos.coords;
        onLocationChange(Number(latitude.toFixed(6)), Number(longitude.toFixed(6)), landmark);
        setLocateStatus(`✓ Accurate location pinned! Coordinates: [${latitude.toFixed(4)}, ${longitude.toFixed(4)}]`);
      },
      () => {
        setIsLocating(false);
        setLocateStatus('Location access was denied. You can manually adjust coordinates below.');
      },
      { timeout: 10000, enableHighAccuracy: true },
    );
  };

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    // Map click offset calculation relative to current center
    const dLat = ((rect.height / 2 - y) / rect.height) * 0.05;
    const dLng = ((x - rect.width / 2) / rect.width) * 0.05;
    const newLat = Number((lat + dLat).toFixed(6));
    const newLng = Number((lng + dLng).toFixed(6));
    onLocationChange(newLat, newLng, landmark);
    setLocateStatus(`✓ Delivery pin updated to: [${newLat}, ${newLng}]`);
  };

  return (
    <div className="location-picker-box">
      <div className="location-picker-header">
        <div>
          <strong>📍 Exact Delivery Location Pin</strong>
          <p>Pinpoint your exact building or house for accurate delivery</p>
        </div>
        <button
          type="button"
          className="locate-gps-button"
          onClick={handleGetCurrentLocation}
          disabled={isLocating}
        >
          <Navigation size={16} className={isLocating ? 'spin-icon' : ''} />
          <span>{isLocating ? 'Locating...' : 'Use My GPS Location'}</span>
        </button>
      </div>

      {/* Interactive Map Visualizer */}
      <div className="interactive-map-frame" onClick={handleMapClick} title="Click anywhere on the map to pin exact delivery location">
        <iframe
          title="Google Map Location View"
          className="embedded-map-iframe"
          src={`https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`}
          loading="lazy"
          tabIndex={-1}
        />
        <div className="map-pin-overlay">
          <div className="pin-pulse"></div>
          <MapPin size={34} className="map-pin-icon" />
          <span className="pin-label">Delivery Here</span>
        </div>
        <div className="map-hint-banner">Click map to relocate delivery pin</div>
      </div>

      <div className="location-coordinates-row">
        <div className="coord-badge">
          <span>Lat: <strong>{lat.toFixed(5)}</strong></span>
          <span>Lng: <strong>{lng.toFixed(5)}</strong></span>
        </div>
        {locateStatus ? <span className="locate-status-text">{locateStatus}</span> : null}
      </div>

      <label className="landmark-field">
        <span>Delivery Landmark / Floor / Apartment notes</span>
        <input
          placeholder="e.g. Near Royal Plaza, 4th Floor, Door #402"
          value={landmark}
          onChange={(e) => onLocationChange(lat, lng, e.target.value)}
        />
      </label>
    </div>
  );
}

/* =========================================================================
   DEDICATED FULL PAYMENT / CHECKOUT PAGE VIEW
   ========================================================================= */
function CheckoutPageView({
  cartLines,
  itemCount,
  subtotal,
  promoDiscount,
  walletDiscount,
  shipping,
  tax,
  total,
  inrAmount,
  promoCode,
  setPromoCode,
  shippingSpeed,
  setShippingSpeed,
  paymentMethod,
  setPaymentMethod,
  selectedBank,
  setSelectedBank,
  otherBank,
  setOtherBank,
  upiUtr,
  setUpiUtr,
  upiTimer,
  resetUpiTimer,
  formatTimer,
  qrCodeDataUrl,
  handleUpiDirectRedirect,
  checkout,
  setCheckout,
  checkoutMessage,
  lastOrder,
  placeOrder,
  onBackToStore,
  wallet,
  onOpenWalletModal,
  user,
}: {
  cartLines: { item: CartItem; product: Product }[];
  itemCount: number;
  subtotal: number;
  promoDiscount: number;
  walletDiscount: number;
  shipping: number;
  tax: number;
  total: number;
  inrAmount: number;
  promoCode: string;
  setPromoCode: (v: string) => void;
  shippingSpeed: 'standard' | 'express';
  setShippingSpeed: (v: 'standard' | 'express') => void;
  paymentMethod: 'upi' | 'netbanking' | 'card' | 'wallet';
  setPaymentMethod: (v: 'upi' | 'netbanking' | 'card' | 'wallet') => void;
  selectedBank: string;
  setSelectedBank: (v: string) => void;
  otherBank: string;
  setOtherBank: (v: string) => void;
  upiUtr: string;
  setUpiUtr: (v: string) => void;
  upiTimer: number;
  resetUpiTimer: () => void;
  formatTimer: (s: number) => string;
  qrCodeDataUrl: string;
  handleUpiDirectRedirect: (scheme?: 'phonepe' | 'gpay' | 'paytm') => void;
  checkout: CheckoutForm;
  setCheckout: React.Dispatch<React.SetStateAction<CheckoutForm>>;
  checkoutMessage: string;
  lastOrder: OrderRecord | null;
  placeOrder: (e: FormEvent<HTMLFormElement>) => void;
  onBackToStore: () => void;
  wallet: WalletProfile | null;
  onOpenWalletModal: () => void;
  user: UserProfile | null;
}) {
  return (
    <main className="dedicated-checkout-page">
      <div className="checkout-page-topbar">
        <button type="button" className="back-store-btn" onClick={onBackToStore}>
          <ArrowLeft size={18} />
          <span>Back to Store</span>
        </button>
        <div className="checkout-page-title">
          <h2>Secure Checkout</h2>
          <span>256-Bit SSL Encrypted Order Portal</span>
        </div>
        <div className="checkout-trust-badge">
          <ShieldCheck size={18} />
          <span>Verified Merchant</span>
        </div>
      </div>

      <div className="dedicated-checkout-grid">
        {/* Left Column: Form, Map, and Payment */}
        <section className="checkout-main-column">
          <form className="checkout-form" onSubmit={placeOrder}>
            {/* Step 1: Customer & Delivery Details */}
            <div className="form-step-card">
              <div className="form-topline">
                <h3>1. Customer & Delivery Address</h3>
                {user ? (
                  <span className="profile-autofill-tag">✓ Pre-filled from your Profile</span>
                ) : null}
              </div>

              <div className="form-grid">
                <label>
                  Full name *
                  <input
                    required
                    value={checkout.fullName}
                    onChange={(e) => setCheckout({ ...checkout, fullName: e.target.value })}
                    placeholder="e.g. John Doe"
                  />
                </label>
                <label>
                  Email address *
                  <input
                    required
                    type="email"
                    value={checkout.email}
                    onChange={(e) => setCheckout({ ...checkout, email: e.target.value })}
                    placeholder="john@example.com"
                  />
                </label>
                <label>
                  Primary phone *
                  <input
                    required
                    value={checkout.phone}
                    onChange={(e) => setCheckout({ ...checkout, phone: e.target.value })}
                    placeholder="+91 98765 43210"
                  />
                </label>
                <label>
                  Alternate phone (optional)
                  <input
                    value={checkout.secondaryPhone || ''}
                    onChange={(e) => setCheckout({ ...checkout, secondaryPhone: e.target.value })}
                    placeholder="Secondary contact"
                  />
                </label>
                <label className="wide-field">
                  Street address *
                  <input
                    required
                    value={checkout.address}
                    onChange={(e) => setCheckout({ ...checkout, address: e.target.value })}
                    placeholder="Flat / House / Building / Street address"
                  />
                </label>
                <label>
                  City *
                  <input
                    required
                    value={checkout.city}
                    onChange={(e) => setCheckout({ ...checkout, city: e.target.value })}
                    placeholder="City"
                  />
                </label>
                <label>
                  State / Region *
                  <input
                    required
                    value={checkout.region}
                    onChange={(e) => setCheckout({ ...checkout, region: e.target.value })}
                    placeholder="State"
                  />
                </label>
                <label>
                  Postal / PIN Code *
                  <input
                    required
                    value={checkout.postal}
                    onChange={(e) => setCheckout({ ...checkout, postal: e.target.value })}
                    placeholder="Postal code"
                  />
                </label>
              </div>

              {/* Google Map Delivery Location Picker */}
              <GoogleMapLocationPicker
                lat={checkout.lat || 28.6139}
                lng={checkout.lng || 77.209}
                landmark={checkout.landmark || ''}
                onLocationChange={(lat, lng, landmark) => {
                  setCheckout((prev) => ({
                    ...prev,
                    lat,
                    lng,
                    landmark: landmark !== undefined ? landmark : prev.landmark,
                  }));
                }}
              />
            </div>

            {/* Step 2: Shipping Speed */}
            <div className="form-step-card">
              <h3>2. Shipping Method</h3>
              <div className="choice-grid">
                <button
                  type="button"
                  className={shippingSpeed === 'standard' ? 'choice active' : 'choice'}
                  onClick={() => setShippingSpeed('standard')}
                >
                  <Truck size={19} aria-hidden="true" />
                  <span>Standard Tracked</span>
                  <small>{getDeliveryWindow('standard')} · $8.00 (Free over $250)</small>
                </button>
                <button
                  type="button"
                  className={shippingSpeed === 'express' ? 'choice active' : 'choice'}
                  onClick={() => setShippingSpeed('express')}
                >
                  <PackageCheck size={19} aria-hidden="true" />
                  <span>Priority Express</span>
                  <small>{getDeliveryWindow('express')} · $18.00</small>
                </button>
              </div>
            </div>

            {/* Step 3: Payment Method Options */}
            <div className="form-step-card">
              <div className="form-topline">
                <h3>3. Payment Gateway</h3>
                <span className="payment-security-note">Zero convenience fees</span>
              </div>

              <div className="payment-options-section">
                <div className="payment-row">
                  <button
                    type="button"
                    className={paymentMethod === 'upi' ? 'payment active' : 'payment'}
                    onClick={() => setPaymentMethod('upi')}
                  >
                    <Smartphone size={18} aria-hidden="true" />
                    <span>UPI & QR</span>
                    <span className="badge-pill">Instant</span>
                  </button>
                  <button
                    type="button"
                    className={paymentMethod === 'netbanking' ? 'payment active' : 'payment'}
                    onClick={() => setPaymentMethod('netbanking')}
                  >
                    <Landmark size={18} aria-hidden="true" />
                    <span>Net Banking</span>
                  </button>
                  <button
                    type="button"
                    className={paymentMethod === 'card' ? 'payment active' : 'payment'}
                    onClick={() => setPaymentMethod('card')}
                  >
                    <CreditCard size={18} aria-hidden="true" />
                    <span>Card</span>
                  </button>
                  <button
                    type="button"
                    className={paymentMethod === 'wallet' ? 'payment active' : 'payment'}
                    onClick={() => setPaymentMethod('wallet')}
                  >
                    <Wallet size={18} aria-hidden="true" />
                    <span>Wallet</span>
                  </button>
                </div>

                {/* UPI Panel (UPI ID text hidden; only QR code and redirect options shown) */}
                {paymentMethod === 'upi' ? (
                  <div className="upi-container">
                    <div className="upi-header">
                      <div>
                        <h4>UPI Express Payment</h4>
                        <p>Scan the QR code or click to pay directly with your UPI app</p>
                      </div>
                      <div className="upi-amount-pill">
                        <span>₹{inrAmount.toLocaleString('en-IN')}</span>
                        <small>(${total.toFixed(2)})</small>
                      </div>
                    </div>

                    {/* 5-Minute Timer Bar */}
                    <div className="upi-timer-strip">
                      <div className="timer-info">
                        <div className={`timer-clock-badge ${upiTimer <= 60 ? 'critical' : upiTimer <= 150 ? 'warning' : 'active'}`}>
                          <span className="pulse-dot"></span>
                          <span>Session Timer: <strong>{formatTimer(upiTimer)}</strong></span>
                        </div>
                        <span className="timer-subtext">
                          {upiTimer > 0
                            ? 'QR Code is active and valid for 5 minutes. Complete payment before session ends.'
                            : 'Payment session expired. Please refresh to regenerate a new QR code.'}
                        </span>
                      </div>
                      {upiTimer === 0 ? (
                        <button type="button" className="refresh-qr-btn" onClick={resetUpiTimer}>
                          Regenerate QR Code
                        </button>
                      ) : (
                        <div className="timer-progress-track">
                          <div className="timer-progress-bar" style={{ width: `${(upiTimer / 300) * 100}%` }}></div>
                        </div>
                      )}
                    </div>

                    <div className="upi-body-grid">
                      <div className="upi-qr-card">
                        <div className="qr-badge">
                          <QrCode size={16} />
                          <span>{upiTimer > 0 ? 'Scan & Pay' : 'Session Expired'}</span>
                        </div>
                        <div className="qr-image-wrapper">
                          {upiTimer > 0 ? (
                            qrCodeDataUrl ? (
                              <img src={qrCodeDataUrl} alt="UPI QR Code Payment" className="qr-image" />
                            ) : (
                              <div className="qr-placeholder">Generating QR code...</div>
                            )
                          ) : (
                            <div className="qr-expired-overlay">
                              <span className="expired-icon">⏳</span>
                              <strong>QR Code Expired</strong>
                              <small>5 min session ended</small>
                              <button type="button" className="refresh-qr-btn small" onClick={resetUpiTimer}>
                                Regenerate QR
                              </button>
                            </div>
                          )}
                        </div>
                        <div className="qr-instructions">
                          <span>{upiTimer > 0 ? 'Scan with any UPI App' : 'Regenerate QR to pay'}</span>
                          <div className="upi-apps-logos">
                            <span className="app-tag gpay">GPay</span>
                            <span className="app-tag phonepe">PhonePe</span>
                            <span className="app-tag paytm">Paytm</span>
                            <span className="app-tag bhim">BHIM</span>
                            <span className="app-tag cred">CRED</span>
                          </div>
                        </div>
                      </div>

                      <div className="upi-redirect-column">
                        <div className="redirect-notice">
                          <strong>Pay on this device?</strong>
                          <p>Click below to open your installed UPI app and complete checkout directly:</p>
                        </div>

                        {/* Primary direct UPI app redirect button */}
                        <button
                          type="button"
                          className="upi-direct-pay-button"
                          onClick={() => handleUpiDirectRedirect()}
                        >
                          <ExternalLink size={18} />
                          <span>Pay via UPI App (Instant App Redirect)</span>
                        </button>

                        <div className="app-shortcuts">
                          <span>Or select your app:</span>
                          <div className="app-shortcut-buttons">
                            <button
                              type="button"
                              className="shortcut-btn phonepe"
                              onClick={() => handleUpiDirectRedirect('phonepe')}
                            >
                              PhonePe
                            </button>
                            <button
                              type="button"
                              className="shortcut-btn gpay"
                              onClick={() => handleUpiDirectRedirect('gpay')}
                            >
                              Google Pay
                            </button>
                            <button
                              type="button"
                              className="shortcut-btn paytm"
                              onClick={() => handleUpiDirectRedirect('paytm')}
                            >
                              Paytm
                            </button>
                            <button
                              type="button"
                              className="shortcut-btn bhim"
                              onClick={() => handleUpiDirectRedirect()}
                            >
                              BHIM / Any
                            </button>
                          </div>
                        </div>

                        <label className="utr-input-group">
                          <span>UPI Reference / UTR No. (Optional)</span>
                          <input
                            type="text"
                            placeholder="e.g. 428172918291"
                            maxLength={16}
                            value={upiUtr}
                            onChange={(e) => setUpiUtr(e.target.value)}
                          />
                          <small>Enter the 12-digit transaction ID from your UPI app receipt after payment.</small>
                        </label>
                      </div>
                    </div>
                  </div>
                ) : null}

                {/* Net Banking Panel */}
                {paymentMethod === 'netbanking' ? (
                  <div className="netbanking-container">
                    <div className="netbanking-header">
                      <div>
                        <h4>Net Banking</h4>
                        <p>Transfer directly from your bank account with RBI 256-bit encrypted gateway</p>
                      </div>
                      <div className="upi-amount-pill">
                        <span>₹{inrAmount.toLocaleString('en-IN')}</span>
                        <small>(${total.toFixed(2)})</small>
                      </div>
                    </div>

                    <span className="bank-section-label">Popular Indian Banks</span>
                    <div className="popular-banks-grid">
                      {POPULAR_BANKS.map((b) => (
                        <button
                          key={b.id}
                          type="button"
                          className={selectedBank === b.id ? 'bank-btn active' : 'bank-btn'}
                          onClick={() => setSelectedBank(b.id)}
                        >
                          <span className="bank-icon">{b.icon}</span>
                          <strong className="bank-name">{b.name}</strong>
                          <small className="bank-code">{b.short}</small>
                          {selectedBank === b.id ? <Check size={14} className="bank-check" /> : null}
                        </button>
                      ))}
                    </div>

                    <div className="other-banks-section">
                      <label>
                        <span>Or Select Another Bank ({OTHER_BANKS.length}+ available)</span>
                        <select
                          value={selectedBank === 'other' ? otherBank : ''}
                          onChange={(e) => {
                            setSelectedBank('other');
                            setOtherBank(e.target.value);
                          }}
                        >
                          <option value="">-- Choose your bank --</option>
                          {OTHER_BANKS.map((b) => (
                            <option key={b} value={b}>
                              {b}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>

                    <div className="netbanking-security-footer">
                      <ShieldCheck size={16} />
                      <span>Instant confirmation · Zero bank surcharge · Verified RBI payment pipeline</span>
                    </div>
                  </div>
                ) : null}

                {/* Card Panel */}
                {paymentMethod === 'card' ? (
                  <div className="card-mock-container">
                    <div className="form-grid">
                      <label className="wide-field">
                        Card Number
                        <input placeholder="4532 •••• •••• 8892" maxLength={19} />
                      </label>
                      <label>
                        Expiry
                        <input placeholder="MM / YY" maxLength={5} />
                      </label>
                      <label>
                        CVV / CVC
                        <input type="password" placeholder="•••" maxLength={4} />
                      </label>
                    </div>
                  </div>
                ) : null}

                {/* Web3 Wallet Panel with Verified Treasury ID */}
                {paymentMethod === 'wallet' ? (
                  <div className="wallet-checkout-panel">
                    <div className="wallet-checkout-info">
                      <Wallet size={24} />
                      <div>
                        <strong>
                          {wallet
                            ? `${wallet.walletType || 'Connected'}: ${shortAddress(wallet.address)}`
                            : 'No Web3 Wallet Connected'}
                        </strong>
                        <span>
                          {wallet
                            ? '3% instant crypto discount applied to this order'
                            : 'Connect MetaMask, Coinbase, or Trust Wallet for a 3% discount'}
                        </span>
                        <div className="official-vault-badge">
                          <span>Official Vault: </span>
                          <a href={OFFICIAL_WALLET.explorer} target="_blank" rel="noopener noreferrer">
                            {OFFICIAL_WALLET.ens} ({shortAddress(OFFICIAL_WALLET.address)}) ↗
                          </a>
                        </div>
                      </div>
                    </div>
                    {!wallet ? (
                      <button type="button" className="light-button" onClick={onOpenWalletModal}>
                        Connect Wallet (MetaMask / Coinbase)
                      </button>
                    ) : (
                      <button type="button" className="light-button" onClick={onOpenWalletModal}>
                        Switch / Manage
                      </button>
                    )}
                  </div>
                ) : null}
              </div>
            </div>

            {checkoutMessage ? <p className="form-message">{checkoutMessage}</p> : null}

            {lastOrder ? (
              <div className="success-order-banner">
                <div className="success-order-top">
                  <Check size={20} className="success-check-icon" />
                  <div>
                    <strong>Order {lastOrder.id} placed successfully!</strong>
                    <p>Estimated delivery {lastOrder.delivery}</p>
                  </div>
                </div>
                {lastOrder.paymentMethod ? (
                  <div className="success-order-meta">
                    <span>Payment: <strong>{lastOrder.paymentMethod}</strong></span>
                    {lastOrder.reference ? <span> ({lastOrder.reference})</span> : null}
                  </div>
                ) : null}
                {lastOrder.deliveryAddress ? (
                  <div className="success-order-meta">
                    <span>Delivery Address: {lastOrder.deliveryAddress}</span>
                  </div>
                ) : null}
              </div>
            ) : null}

            <button className="checkout-button submit-order-btn" type="submit">
              <ShieldCheck size={18} aria-hidden="true" />
              {paymentMethod === 'upi'
                ? `Confirm UPI Order (₹${inrAmount.toLocaleString('en-IN')})`
                : paymentMethod === 'netbanking'
                ? `Proceed to Bank Gateway (₹${inrAmount.toLocaleString('en-IN')})`
                : `Place Secure Order (${formatMoney(total)})`}
            </button>
          </form>
        </section>

        {/* Right Column: Order Summary */}
        <aside className="checkout-summary-column">
          <div className="order-review-card">
            <h3>Order Summary ({itemCount} items)</h3>
            <div className="review-items-list">
              {cartLines.map(({ item, product }) => (
                <div className="review-item-row" key={`${item.productId}-${item.color}-${item.size}`}>
                  <img src={product.image} alt={product.name} />
                  <div>
                    <strong>{product.name}</strong>
                    <span>{item.color} · Size {item.size} · Qty {item.quantity}</span>
                    <small>{formatMoney(product.price * item.quantity)}</small>
                  </div>
                </div>
              ))}
            </div>

            <label className="promo-field-row">
              <span>Promo Code</span>
              <div className="promo-input-wrap">
                <input
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="STYLE10"
                />
              </div>
            </label>

            <OrderSummary
              subtotal={subtotal}
              promoDiscount={promoDiscount}
              walletDiscount={walletDiscount}
              shipping={shipping}
              tax={tax}
              total={total}
            />

            <div className="official-merchant-guarantee">
              <ShieldCheck size={16} />
              <div>
                <strong>Official Merchant ID</strong>
                <span>{OFFICIAL_WALLET.ens}</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}

/* =========================================================================
   DEDICATED USER PROFILE PAGE VIEW (Saves all info in localStorage)
   ========================================================================= */
function UserProfilePageView({
  user,
  onSaveProfile,
  orders,
  wallet,
  onOpenWalletModal,
  onDisconnectWallet,
  appearance,
  setAppearance,
  onBackToStore,
  onGoToCheckout,
}: {
  user: UserProfile | null;
  onSaveProfile: (profile: UserProfile) => void;
  orders: OrderRecord[];
  wallet: WalletProfile | null;
  onOpenWalletModal: () => void;
  onDisconnectWallet: () => void;
  appearance: AppearanceMode;
  setAppearance: (mode: AppearanceMode) => void;
  onBackToStore: () => void;
  onGoToCheckout: () => void;
}) {
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [secondaryPhone, setSecondaryPhone] = useState(user?.secondaryPhone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [city, setCity] = useState(user?.city || '');
  const [region, setRegion] = useState(user?.region || '');
  const [postal, setPostal] = useState(user?.postal || '');
  const [landmark, setLandmark] = useState(user?.landmark || '');
  const [lat, setLat] = useState(user?.lat || 28.6139);
  const [lng, setLng] = useState(user?.lng || 77.209);
  const [savedPayment, setSavedPayment] = useState<'upi' | 'netbanking' | 'card' | 'wallet'>(user?.savedPaymentMethod || 'upi');
  const [saveMessage, setSaveMessage] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setSaveMessage('Please fill in your name and email.');
      return;
    }
    const updated: UserProfile = {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      secondaryPhone: secondaryPhone.trim(),
      address: address.trim(),
      city: city.trim(),
      region: region.trim(),
      postal: postal.trim(),
      landmark: landmark.trim(),
      lat,
      lng,
      savedPaymentMethod: savedPayment,
    };
    onSaveProfile(updated);
    setSaveMessage('✓ All profile, contact, and delivery details saved permanently to localStorage!');
    setTimeout(() => setSaveMessage(''), 4500);
  };

  return (
    <main className="profile-page-view">
      <div className="profile-page-header">
        <button type="button" className="back-store-btn" onClick={onBackToStore}>
          <ArrowLeft size={18} />
          <span>Back to Store</span>
        </button>
        <div className="profile-header-title">
          <h2>Member Profile & Preferences</h2>
          <span>Manage your address, exact GPS pin, Web3 wallet, and preferences</span>
        </div>
        <button type="button" className="dark-button" onClick={onGoToCheckout}>
          Go to Checkout
        </button>
      </div>

      <div className="profile-page-grid">
        {/* Left: Form with Profile, Map, and Preferences */}
        <section className="profile-form-column">
          <form className="profile-edit-form" onSubmit={handleSave}>
            <div className="profile-section-card">
              <div className="avatar-header-row">
                <div className="profile-avatar-circle">
                  {(name || email || 'M').slice(0, 1).toUpperCase()}
                </div>
                <div>
                  <h3>{name || 'Customer Account'}</h3>
                  <span>{email || 'No email saved yet'}</span>
                </div>
              </div>

              <div className="form-grid">
                <label>
                  Full Name *
                  <input
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                  />
                </label>
                <label>
                  Email Address *
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@example.com"
                  />
                </label>
                <label>
                  Primary Mobile Number
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                  />
                </label>
                <label>
                  Alternate Phone
                  <input
                    value={secondaryPhone}
                    onChange={(e) => setSecondaryPhone(e.target.value)}
                    placeholder="Secondary contact"
                  />
                </label>
              </div>
            </div>

            {/* Saved Delivery Address & Interactive Google Map */}
            <div className="profile-section-card">
              <h3>Saved Delivery Address & Location Pin</h3>
              <p className="section-desc">Set your permanent delivery location so every future order is automatically delivered to this exact address.</p>

              <div className="form-grid">
                <label className="wide-field">
                  Street Address
                  <input
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Flat / Building / House number / Street"
                  />
                </label>
                <label>
                  City
                  <input
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="City"
                  />
                </label>
                <label>
                  State / Region
                  <input
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    placeholder="State / Region"
                  />
                </label>
                <label>
                  Postal / PIN Code
                  <input
                    value={postal}
                    onChange={(e) => setPostal(e.target.value)}
                    placeholder="Postal code"
                  />
                </label>
              </div>

              <GoogleMapLocationPicker
                lat={lat}
                lng={lng}
                landmark={landmark}
                onLocationChange={(newLat, newLng, newLandmark) => {
                  setLat(newLat);
                  setLng(newLng);
                  if (newLandmark !== undefined) setLandmark(newLandmark);
                }}
              />
            </div>

            {/* Saved Payment Preference */}
            <div className="profile-section-card">
              <h3>Preferred Payment Method</h3>
              <div className="payment-row">
                <button
                  type="button"
                  className={savedPayment === 'upi' ? 'payment active' : 'payment'}
                  onClick={() => setSavedPayment('upi')}
                >
                  <Smartphone size={17} />
                  <span>UPI Express</span>
                </button>
                <button
                  type="button"
                  className={savedPayment === 'netbanking' ? 'payment active' : 'payment'}
                  onClick={() => setSavedPayment('netbanking')}
                >
                  <Landmark size={17} />
                  <span>Net Banking</span>
                </button>
                <button
                  type="button"
                  className={savedPayment === 'card' ? 'payment active' : 'payment'}
                  onClick={() => setSavedPayment('card')}
                >
                  <CreditCard size={17} />
                  <span>Card</span>
                </button>
                <button
                  type="button"
                  className={savedPayment === 'wallet' ? 'payment active' : 'payment'}
                  onClick={() => setSavedPayment('wallet')}
                >
                  <Wallet size={17} />
                  <span>Web3 Wallet</span>
                </button>
              </div>
            </div>

            {/* Appearance Preference */}
            <div className="profile-section-card">
              <h3>Store Appearance</h3>
              <div className="theme-options-grid">
                <button
                  type="button"
                  className={appearance === 'light' ? 'theme-card-btn active' : 'theme-card-btn'}
                  onClick={() => setAppearance('light')}
                >
                  <Sun size={20} />
                  <strong>Light</strong>
                  <small>Clean high-contrast daytime mode</small>
                </button>
                <button
                  type="button"
                  className={appearance === 'dark' ? 'theme-card-btn active' : 'theme-card-btn'}
                  onClick={() => setAppearance('dark')}
                >
                  <Moon size={20} />
                  <strong>Dark</strong>
                  <small>Midnight luxury aesthetic</small>
                </button>
                <button
                  type="button"
                  className={appearance === 'system' ? 'theme-card-btn active' : 'theme-card-btn'}
                  onClick={() => setAppearance('system')}
                >
                  <Monitor size={20} />
                  <strong>System</strong>
                  <small>Follows your device preferences</small>
                </button>
              </div>
            </div>

            {saveMessage ? <p className="success-message">{saveMessage}</p> : null}

            <button type="submit" className="checkout-button save-profile-btn">
              <Check size={18} />
              Save All Profile & Delivery Information
            </button>
          </form>
        </section>

        {/* Right: Wallet, Official Treasury & Order History */}
        <aside className="profile-sidebar-column">
          {/* Web3 Wallet Card */}
          <div className="profile-sidebar-card">
            <h3>Web3 Wallet Status</h3>
            <div className="wallet-card-content">
              <Wallet size={24} />
              <div>
                <strong>{wallet ? `${wallet.walletType || 'Wallet'}: ${shortAddress(wallet.address)}` : 'No Wallet Connected'}</strong>
                <span>{wallet ? '3% instant discount active on all drops' : 'Connect MetaMask or Coinbase wallet'}</span>
              </div>
            </div>
            {wallet ? (
              <button type="button" className="light-button full-width" onClick={onDisconnectWallet}>
                Disconnect Wallet
              </button>
            ) : (
              <button type="button" className="dark-button full-width" onClick={onOpenWalletModal}>
                Connect Wallet (MetaMask / Coinbase)
              </button>
            )}

            {/* Official Store Treasury Contract ID */}
            <div className="official-treasury-box">
              <span className="official-badge">✓ Official Store Treasury Vault</span>
              <p>All on-chain order payments and web3 transactions are settled directly with our audited treasury vault:</p>
              <code>{OFFICIAL_WALLET.ens}</code>
              <small>{OFFICIAL_WALLET.address}</small>
              <a href={OFFICIAL_WALLET.explorer} target="_blank" rel="noopener noreferrer" className="etherscan-link">
                View on Etherscan ↗
              </a>
            </div>
          </div>

          {/* Order History */}
          <div className="profile-sidebar-card">
            <h3>Order History ({orders.length})</h3>
            {orders.length ? (
              <div className="orders-history-list">
                {orders.map((ord) => (
                  <div className="order-history-item" key={ord.id}>
                    <div className="order-history-top">
                      <strong>{ord.id}</strong>
                      <span className="order-price">{formatMoney(ord.total)}</span>
                    </div>
                    <span className="order-date-text">{ord.date || 'Recent order'} · {ord.delivery}</span>
                    {ord.paymentMethod ? (
                      <small className="order-method-badge">{ord.paymentMethod}</small>
                    ) : null}
                    {ord.deliveryAddress ? (
                      <p className="order-address-preview">📍 {ord.deliveryAddress}</p>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-orders-text">No orders placed yet. Add items to your cart to checkout!</p>
            )}
          </div>
        </aside>
      </div>
    </main>
  );
}

/* =========================================================================
   MODAL AND HELPER COMPONENTS
   ========================================================================= */
function WalletModal({
  onClose,
  onConnect,
  isConnecting,
}: {
  onClose: () => void;
  onConnect: (provider: 'metamask' | 'coinbase' | 'trust' | 'demo') => void;
  isConnecting: string | null;
}) {
  return (
    <div className="overlay center">
      <section className="modal-card wallet-modal" aria-label="Connect Web3 Wallet">
        <div className="drawer-header">
          <div>
            <span>Web3 Checkout</span>
            <h2>Select a Wallet</h2>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Close wallet selection">
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <p className="wallet-modal-description">
          Connect your Web3 wallet for secure checkout and enjoy an automatic <strong>3% discount</strong> on your order.
        </p>

        <div className="wallet-options-list">
          <button
            type="button"
            className="wallet-option-item"
            disabled={Boolean(isConnecting)}
            onClick={() => onConnect('metamask')}
          >
            <span className="wallet-option-icon">🦊</span>
            <div className="wallet-option-info">
              <strong>MetaMask</strong>
              <small>Connect with MetaMask browser extension or mobile app</small>
            </div>
            <span className="wallet-badge popular">Popular</span>
          </button>

          <button
            type="button"
            className="wallet-option-item"
            disabled={Boolean(isConnecting)}
            onClick={() => onConnect('coinbase')}
          >
            <span className="wallet-option-icon">🔵</span>
            <div className="wallet-option-info">
              <strong>Coinbase Wallet</strong>
              <small>Connect with Coinbase Wallet extension or smart wallet</small>
            </div>
            <span className="wallet-badge coinbase">Coinbase</span>
          </button>

          <button
            type="button"
            className="wallet-option-item"
            disabled={Boolean(isConnecting)}
            onClick={() => onConnect('trust')}
          >
            <span className="wallet-option-icon">🛡️</span>
            <div className="wallet-option-info">
              <strong>Trust Wallet / Other</strong>
              <small>Connect with Trust Wallet or any standard Web3 provider</small>
            </div>
          </button>

          <button
            type="button"
            className="wallet-option-item instant-test-item"
            disabled={Boolean(isConnecting)}
            onClick={() => onConnect('demo')}
          >
            <span className="wallet-option-icon">⚡</span>
            <div className="wallet-option-info">
              <strong>Instant Connect (No Extension)</strong>
              <small>One-click instant connection with 3% discount</small>
            </div>
            <span className="wallet-badge instant">Instant</span>
          </button>
        </div>

        {isConnecting ? (
          <div className="wallet-connecting-status">
            <div className="mini-spinner"></div>
            <span>Connecting to {isConnecting.toUpperCase()}... Please confirm prompt</span>
          </div>
        ) : null}
      </section>
    </div>
  );
}

function ProductShelf({
  title,
  products,
  wishlist,
  onAdd,
  onSave,
  onView,
}: {
  title: string;
  products: Product[];
  wishlist: string[];
  onAdd: (product: Product) => void;
  onSave: (productId: string) => void;
  onView: (product: Product) => void;
}) {
  return (
    <section className="product-shelf">
      <div className="shelf-heading">
        <h2>{title}</h2>
        <button>View all</button>
      </div>
      <div className="product-grid">
        {products.map((product) => (
          <article className="product-card" key={product.id}>
            <button className="product-media" onClick={() => onView(product)}>
              <img src={product.image} alt={product.name} />
              <span>{product.badge}</span>
            </button>
            <button
              className={wishlist.includes(product.id) ? 'heart-button saved' : 'heart-button'}
              onClick={() => onSave(product.id)}
              aria-label={`Save ${product.name}`}
            >
              <Heart size={17} fill={wishlist.includes(product.id) ? 'currentColor' : 'none'} aria-hidden="true" />
            </button>
            <div className="product-info">
              <small>{product.brand}</small>
              <h3>{product.name}</h3>
              <div className="product-meta">
                <span>{formatMoney(product.price)}</span>
                <span>
                  <Star size={14} fill="currentColor" aria-hidden="true" />
                  {product.rating}
                </span>
              </div>
              <button className="add-button" onClick={() => onAdd(product)}>
                <ShoppingBag size={16} aria-hidden="true" />
                Add
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function OrderSummary({
  subtotal,
  promoDiscount,
  walletDiscount,
  shipping,
  tax,
  total,
}: {
  subtotal: number;
  promoDiscount: number;
  walletDiscount: number;
  shipping: number;
  tax: number;
  total: number;
}) {
  return (
    <div className="summary-card">
      <div>
        <span>Subtotal</span>
        <strong>{formatMoney(subtotal)}</strong>
      </div>
      <div>
        <span>Promo</span>
        <strong>-{formatMoney(promoDiscount)}</strong>
      </div>
      <div>
        <span>Wallet</span>
        <strong>-{formatMoney(walletDiscount)}</strong>
      </div>
      <div>
        <span>Shipping</span>
        <strong>{shipping ? formatMoney(shipping) : 'Free'}</strong>
      </div>
      <div>
        <span>Tax</span>
        <strong>{formatMoney(tax)}</strong>
      </div>
      <div className="grand-total">
        <span>Total</span>
        <strong>{formatMoney(total)}</strong>
      </div>
    </div>
  );
}

function CartDrawer({
  cartLines,
  itemCount,
  subtotal,
  total,
  onClose,
  onQuantity,
  onRemove,
  onProceedToCheckout,
}: {
  cartLines: { item: CartItem; product: Product }[];
  itemCount: number;
  subtotal: number;
  total: number;
  onClose: () => void;
  onQuantity: (item: CartItem, quantity: number) => void;
  onRemove: (item: CartItem) => void;
  onProceedToCheckout: () => void;
}) {
  return (
    <div className="overlay">
      <aside className="cart-drawer" aria-label="Shopping cart">
        <div className="drawer-header">
          <div>
            <span>Cart</span>
            <h2>{itemCount} items</h2>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Close cart">
            <X size={20} aria-hidden="true" />
          </button>
        </div>
        <div className="cart-items">
          {cartLines.length ? (
            cartLines.map(({ item, product }) => (
              <div className="cart-line" key={`${item.productId}-${item.color}-${item.size}`}>
                <img src={product.image} alt={product.name} />
                <div>
                  <strong>{product.name}</strong>
                  <span>
                    {item.color} / {item.size}
                  </span>
                  <small>{formatMoney(product.price)}</small>
                </div>
                <div className="quantity-control">
                  <button onClick={() => onQuantity(item, item.quantity - 1)} aria-label={`Reduce ${product.name}`}>
                    <Minus size={15} aria-hidden="true" />
                  </button>
                  <span>{item.quantity}</span>
                  <button onClick={() => onQuantity(item, item.quantity + 1)} aria-label={`Increase ${product.name}`}>
                    <Plus size={15} aria-hidden="true" />
                  </button>
                </div>
                <button className="trash-button" onClick={() => onRemove(item)} aria-label={`Remove ${product.name}`}>
                  <Trash2 size={16} aria-hidden="true" />
                </button>
              </div>
            ))
          ) : (
            <div className="empty-state">
              <ShoppingCart size={34} aria-hidden="true" />
              <strong>Your cart is empty</strong>
            </div>
          )}
        </div>
        <div className="drawer-summary">
          <div>
            <span>Subtotal</span>
            <strong>{formatMoney(subtotal)}</strong>
          </div>
          <div>
            <span>Total</span>
            <strong>{formatMoney(total)}</strong>
          </div>
          <button className="checkout-button" onClick={onProceedToCheckout}>
            Proceed to Checkout
          </button>
        </div>
      </aside>
    </div>
  );
}

function AuthModal({
  mode,
  user,
  wallet,
  walletMessage,
  onClose,
  onMode,
  onSubmit,
  onSignOut,
  onWalletConnect,
  onWalletDisconnect,
}: {
  mode: 'signin' | 'signup';
  user: UserProfile | null;
  wallet: WalletProfile | null;
  walletMessage: string;
  onClose: () => void;
  onMode: (mode: 'signin' | 'signup') => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onSignOut: () => void;
  onWalletConnect: () => void;
  onWalletDisconnect: () => void;
}) {
  return (
    <div className="overlay center">
      <section className="modal-card" aria-label="Account sign in">
        <div className="drawer-header">
          <div>
            <span>Account</span>
            <h2>{user ? 'Profile' : mode === 'signin' ? 'Sign in' : 'Create account'}</h2>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Close account">
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        {user ? (
          <div className="profile-card">
            <div className="avatar">{user.name.slice(0, 1).toUpperCase()}</div>
            <div>
              <strong>{user.name}</strong>
              <span>{user.email}</span>
            </div>
            <button className="light-button" onClick={onSignOut}>
              <LogOut size={16} aria-hidden="true" />
              Sign out
            </button>
          </div>
        ) : (
          <form className="auth-form" onSubmit={onSubmit}>
            {mode === 'signup' ? (
              <label>
                Name
                <input name="name" autoComplete="name" required />
              </label>
            ) : null}
            <label>
              Email
              <input name="email" type="email" autoComplete="email" required />
            </label>
            <label>
              Password
              <input name="password" type="password" minLength={6} required />
            </label>
            <button className="checkout-button" type="submit">
              <User size={17} aria-hidden="true" />
              {mode === 'signin' ? 'Sign in' : 'Create account'}
            </button>
            <button className="text-button" type="button" onClick={() => onMode(mode === 'signin' ? 'signup' : 'signin')}>
              {mode === 'signin' ? 'Create account' : 'Use sign in'}
            </button>
          </form>
        )}

        <div className="wallet-card">
          <Wallet size={20} aria-hidden="true" />
          <div>
            <strong>{wallet ? shortAddress(wallet.address) : 'Wallet'}</strong>
            <span>{wallet ? `Network ${wallet.chainId}` : 'Ethereum checkout'}</span>
          </div>
          <button className="light-button" onClick={wallet ? onWalletDisconnect : onWalletConnect}>
            {wallet ? 'Disconnect' : 'Connect'}
          </button>
        </div>
        {walletMessage ? <p className="form-message">{walletMessage}</p> : null}
      </section>
    </div>
  );
}

function ProductDialog({
  product,
  saved,
  onClose,
  onAdd,
  onSave,
}: {
  product: Product;
  saved: boolean;
  onClose: () => void;
  onAdd: (product: Product, quantity: number, color: string, size: string) => void;
  onSave: () => void;
}) {
  const [quantity, setQuantity] = useState(1);
  const [color, setColor] = useState(product.colors[0]);
  const [size, setSize] = useState(product.sizes[0]);

  return (
    <div className="overlay center">
      <section className="product-dialog" aria-label={product.name}>
        <button className="icon-button modal-close" onClick={onClose} aria-label="Close product">
          <X size={20} aria-hidden="true" />
        </button>
        <img src={product.image} alt={product.name} />
        <div className="dialog-content">
          <span>{product.brand}</span>
          <h2>{product.name}</h2>
          <p>{product.description}</p>
          <div className="rating-row">
            <Star size={16} fill="currentColor" aria-hidden="true" />
            {product.rating}
            <small>{product.reviewCount} reviews</small>
          </div>
          <label>
            Color
            <select value={color} onChange={(event) => setColor(event.target.value)}>
              {product.colors.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </label>
          <label>
            Size
            <select value={size} onChange={(event) => setSize(event.target.value)}>
              {product.sizes.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </label>
          <div className="dialog-price-row">
            <strong>{formatMoney(product.price)}</strong>
            <span>{product.inventory} left</span>
          </div>
          <div className="dialog-actions">
            <div className="quantity-control">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} aria-label="Reduce quantity">
                <Minus size={15} aria-hidden="true" />
              </button>
              <span>{quantity}</span>
              <button onClick={() => setQuantity(Math.min(product.inventory, quantity + 1))} aria-label="Increase quantity">
                <Plus size={15} aria-hidden="true" />
              </button>
            </div>
            <button className="light-button" onClick={onSave}>
              <Heart size={16} fill={saved ? 'currentColor' : 'none'} aria-hidden="true" />
              {saved ? 'Saved' : 'Save'}
            </button>
            <button className="dark-button" onClick={() => onAdd(product, quantity, color, size)}>
              <ShoppingBag size={16} aria-hidden="true" />
              Add to cart
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
