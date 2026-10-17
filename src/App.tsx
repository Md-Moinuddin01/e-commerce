import {
  Bell,
  Check,
  ChevronDown,
  Copy,
  CreditCard,
  ExternalLink,
  Heart,
  Home,
  Landmark,
  LogOut,
  Menu,
  Minus,
  PackageCheck,
  Plus,
  QrCode,
  Search,
  ShieldCheck,
  ShoppingBag,
  ShoppingCart,
  Smartphone,
  Star,
  Trash2,
  Truck,
  User,
  Wallet,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import QRCode from 'qrcode';
import editorialModel from './assets/editorial-model.png';
import { createOrderId, formatMoney, getDeliveryWindow, requestWalletConnection } from './commerce-utils.js';

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
  address: string;
  city: string;
  region: string;
  postal: string;
};

type OrderRecord = {
  id: string;
  total: number;
  delivery: string;
  paymentMethod?: string;
  reference?: string;
};

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
    image: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=900&q=80',
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

const defaultCheckout: CheckoutForm = {
  fullName: '',
  email: '',
  phone: '',
  address: '',
  city: '',
  region: '',
  postal: '',
};

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
  const [cart, setCart] = useStoredState<CartItem[]>('offthread-cart', []);
  const [wishlist, setWishlist] = useStoredState<string[]>('offthread-wishlist', []);
  const [user, setUser] = useStoredState<UserProfile | null>('offthread-user', null);
  const [wallet, setWallet] = useStoredState<WalletProfile | null>('offthread-wallet', null);
  const [orders, setOrders] = useStoredState<OrderRecord[]>('offthread-orders', []);
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
  const [upiCopied, setUpiCopied] = useState(false);
  const [upiUtr, setUpiUtr] = useState('');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState('');
  const [isSimulatingRedirect, setIsSimulatingRedirect] = useState(false);
  const [redirectBankName, setRedirectBankName] = useState('');
  const [upiTimer, setUpiTimer] = useState(300);
  const [walletModalOpen, setWalletModalOpen] = useState(false);
  const [connectingProvider, setConnectingProvider] = useState<string | null>(null);
  const [checkout, setCheckout] = useState(defaultCheckout);
  const [checkoutMessage, setCheckoutMessage] = useState('');
  const [lastOrder, setLastOrder] = useState<OrderRecord | null>(null);

  const submitAuth = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get('name') || '').trim();
    const email = String(form.get('email') || '').trim();
    const password = String(form.get('password') || '');
    if (!email || password.length < 6) return;
    setUser({ name: name || email.split('@')[0] || 'Member', email });
    setAuthOpen(false);
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

  const newArrivals = searchedProducts.filter((product) => product.collection === 'New arrival');
  const popular = searchedProducts.filter((product) => product.collection === 'Popular');
  const visibleFallback = searchedProducts.length ? searchedProducts : products;

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

  const inrAmount = useMemo(() => Math.round(total * 85), [total]);

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
        setWalletMessage(`Connected via ${providerType.toUpperCase()} (Demo Mode). 3% discount active.`);
        setWalletModalOpen(false);
      }
    } finally {
      setConnectingProvider(null);
    }
  };

  const connectWallet = () => {
    setWalletModalOpen(true);
  };

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

  const copyUpiId = () => {
    navigator.clipboard.writeText(UPI_ID);
    setUpiCopied(true);
    setTimeout(() => setUpiCopied(false), 2200);
  };

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

  const placeOrder = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCheckoutMessage('');

    if (!cartLines.length) {
      setCheckoutMessage('Your cart is empty. Please add items to checkout.');
      return;
    }
    if (!user && !wallet) {
      if (checkout.fullName.trim() && checkout.email.trim()) {
        setUser({ name: checkout.fullName.trim(), email: checkout.email.trim() });
      } else {
        setCheckoutMessage('Please enter your full name and email to place the order.');
        return;
      }
    }
    if (paymentMethod === 'wallet' && !wallet) {
      setCheckoutMessage('Connect your wallet before wallet payment.');
      return;
    }
    if (!Object.values(checkout).every((value) => value.trim().length > 1)) {
      setCheckoutMessage('Please complete all delivery details.');
      return;
    }

    let methodLabel = 'Card';
    let refLabel = '';

    if (paymentMethod === 'upi') {
      methodLabel = `UPI (${UPI_ID})`;
      refLabel = upiUtr.trim() ? `UTR: ${upiUtr.trim()}` : `Ref: UPI-${Math.floor(100000000000 + Math.random() * 900000000000)}`;
    } else if (paymentMethod === 'netbanking') {
      const bankName =
        selectedBank === 'other'
          ? (otherBank || 'Selected Bank')
          : POPULAR_BANKS.find((b) => b.id === selectedBank)?.name || 'Net Banking';
      methodLabel = `Net Banking (${bankName})`;
      refLabel = `Bank Ref: NB-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

      // Simulate NetBanking gateway redirection
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
    }

    const order: OrderRecord = {
      id: createOrderId(),
      total,
      delivery: getDeliveryWindow(shippingSpeed),
      paymentMethod: methodLabel,
      reference: refLabel,
    };
    setOrders((current) => [order, ...current]);
    setLastOrder(order);
    setCart([]);
    setPromoCode('');
    setUpiUtr('');
  };

  const fillFromAccount = () => {
    if (!user) return;
    setCheckout((current) => ({
      ...current,
      fullName: current.fullName || user.name,
      email: current.email || user.email,
    }));
  };

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="nav-bar">
          <button className="icon-button menu-button" aria-label="Menu">
            <Menu size={20} aria-hidden="true" />
          </button>

          <a className="brand" href="#home" aria-label="off-thread home">
            off-thread
          </a>

          <nav className="desktop-links" aria-label="Primary navigation">
            {tabs.map((tab) => (
              <button key={tab} className={activeTab === tab ? 'active' : ''} onClick={() => setActiveTab(tab)}>
                {tab}
              </button>
            ))}
            <a href="#checkout">Checkout</a>
          </nav>

          <div className="header-tools">
            <button className="icon-button" aria-label="Search" onClick={() => document.getElementById('productSearch')?.focus()}>
              <Search size={19} aria-hidden="true" />
            </button>
            <button className="icon-button" aria-label="Notifications">
              <Bell size={19} aria-hidden="true" />
            </button>
            <button className="icon-button count-button" aria-label="Open cart" onClick={() => setCartOpen(true)}>
              <ShoppingCart size={19} aria-hidden="true" />
              <span>{itemCount}</span>
            </button>
          </div>
        </div>

        <div className="mobile-tabs" aria-label="Shop categories">
          {tabs.map((tab) => (
            <button key={tab} className={activeTab === tab ? 'active' : ''} onClick={() => setActiveTab(tab)}>
              {tab}
            </button>
          ))}
        </div>
      </header>

      <main id="home">
        <section className="editorial-hero">
          <img src={editorialModel} alt="Fashion model wearing cobalt streetwear" />
          <div className="hero-content">
            <span>Luxurious</span>
            <h1>Stylish Life</h1>
            <p>All time best offers</p>
          </div>
          <div className="hero-side-note">Celebrate individuality with unique outfits</div>
          <div className="hero-cta">
            <button className="dark-button" onClick={() => addToCart(products[0])}>
              <ShoppingBag size={17} aria-hidden="true" />
              Shop now
            </button>
            <button className="light-button" onClick={connectWallet}>
              <Wallet size={17} aria-hidden="true" />
              Wallet deal
            </button>
          </div>
        </section>

        <section className="store-controls">
          <label className="search-panel">
            <Search size={18} aria-hidden="true" />
            <input
              id="productSearch"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search hoodies, fleece, shells"
            />
          </label>

          <label className="sort-panel">
            <span>Sort</span>
            <select value={sort} onChange={(event) => setSort(event.target.value)}>
              <option value="featured">Featured</option>
              <option value="rating">Rating</option>
              <option value="price-low">Price low</option>
              <option value="price-high">Price high</option>
            </select>
            <ChevronDown size={17} aria-hidden="true" />
          </label>
        </section>

        <ProductShelf
          title="New arrival"
          products={newArrivals.length ? newArrivals : visibleFallback.slice(0, 3)}
          wishlist={wishlist}
          onAdd={addToCart}
          onSave={toggleWishlist}
          onView={setSelectedProduct}
        />

        <section className="style-statement">
          <h2>Here every click is a step towards a more stylish you.</h2>
          <div className="statement-grid">
            {products.slice(0, 2).map((product) => (
              <button key={product.id} className="statement-card" onClick={() => setSelectedProduct(product)}>
                <img src={product.image} alt={product.name} />
                <span>{product.name}</span>
              </button>
            ))}
          </div>
        </section>

        <ProductShelf
          title="Popular"
          products={popular.length ? popular : visibleFallback.slice(2)}
          wishlist={wishlist}
          onAdd={addToCart}
          onSave={toggleWishlist}
          onView={setSelectedProduct}
        />

        <section className="account-wallet-strip">
          <div>
            <User size={21} aria-hidden="true" />
            <strong>{user ? user.name : 'Profile'}</strong>
            <span>{user ? user.email : 'Sign in for saved orders'}</span>
          </div>
          <button className="light-button" onClick={() => setAuthOpen(true)}>
            {user ? 'Account' : 'Sign in'}
          </button>
          <div>
            <Wallet size={21} aria-hidden="true" />
            <strong>{wallet ? shortAddress(wallet.address) : 'Wallet'}</strong>
            <span>{wallet ? '3% discount active' : 'Connect for wallet checkout'}</span>
          </div>
          <button className="dark-button" onClick={wallet ? () => setWallet(null) : connectWallet}>
            {wallet ? 'Disconnect' : 'Connect'}
          </button>
        </section>

        <section className="checkout-section" id="checkout">
          <div className="checkout-copy">
            <span>Secure checkout</span>
            <h2>Complete the look.</h2>
            <p>{orders[0] ? `Last order ${orders[0].id} · ${formatMoney(orders[0].total)}` : 'Curated pieces ship with tracked delivery.'}</p>
          </div>

          <form className="checkout-form" onSubmit={placeOrder}>
            <div className="form-topline">
              <h3>Delivery</h3>
              {user ? (
                <button type="button" className="text-button" onClick={fillFromAccount}>
                  Use account
                </button>
              ) : (
                <button type="button" className="text-button" onClick={() => setAuthOpen(true)}>
                  Sign in
                </button>
              )}
            </div>

            <div className="form-grid">
              <label>
                Full name
                <input value={checkout.fullName} onChange={(event) => setCheckout({ ...checkout, fullName: event.target.value })} />
              </label>
              <label>
                Email
                <input type="email" value={checkout.email} onChange={(event) => setCheckout({ ...checkout, email: event.target.value })} />
              </label>
              <label>
                Phone
                <input value={checkout.phone} onChange={(event) => setCheckout({ ...checkout, phone: event.target.value })} />
              </label>
              <label>
                Postal
                <input value={checkout.postal} onChange={(event) => setCheckout({ ...checkout, postal: event.target.value })} />
              </label>
              <label className="wide-field">
                Address
                <input value={checkout.address} onChange={(event) => setCheckout({ ...checkout, address: event.target.value })} />
              </label>
              <label>
                City
                <input value={checkout.city} onChange={(event) => setCheckout({ ...checkout, city: event.target.value })} />
              </label>
              <label>
                Region
                <input value={checkout.region} onChange={(event) => setCheckout({ ...checkout, region: event.target.value })} />
              </label>
            </div>

            <div className="choice-grid">
              <button
                type="button"
                className={shippingSpeed === 'standard' ? 'choice active' : 'choice'}
                onClick={() => setShippingSpeed('standard')}
              >
                <Truck size={19} aria-hidden="true" />
                <span>Standard</span>
                <small>{getDeliveryWindow('standard')}</small>
              </button>
              <button
                type="button"
                className={shippingSpeed === 'express' ? 'choice active' : 'choice'}
                onClick={() => setShippingSpeed('express')}
              >
                <PackageCheck size={19} aria-hidden="true" />
                <span>Express</span>
                <small>{getDeliveryWindow('express')}</small>
              </button>
            </div>

            <div className="payment-options-section">
              <span className="payment-section-title">Payment Method</span>
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

              {paymentMethod === 'upi' ? (
                <div className="upi-container">
                  <div className="upi-header">
                    <div>
                      <h4>UPI Express Checkout</h4>
                      <p>Instant zero-fee transfer via PhonePe, Google Pay, Paytm, BHIM, or any UPI app</p>
                    </div>
                    <div className="upi-amount-pill">
                      <span>₹{inrAmount.toLocaleString('en-IN')}</span>
                      <small>(${total.toFixed(2)})</small>
                    </div>
                  </div>

                  <div className="upi-vpa-strip">
                    <div className="upi-vpa-info">
                      <span className="upi-label">UPI ID / VPA</span>
                      <code className="upi-code">{UPI_ID}</code>
                    </div>
                    <button type="button" className="copy-upi-button" onClick={copyUpiId} aria-label="Copy UPI ID">
                      {upiCopied ? <Check size={16} /> : <Copy size={16} />}
                      <span>{upiCopied ? 'Copied!' : 'Copy ID'}</span>
                    </button>
                  </div>

                  <div className="upi-timer-strip">
                    <div className="timer-info">
                      <div className={`timer-clock-badge ${upiTimer <= 60 ? 'critical' : upiTimer <= 150 ? 'warning' : 'active'}`}>
                        <span className="pulse-dot"></span>
                        <span>QR Session Timer: <strong>{formatTimer(upiTimer)}</strong></span>
                      </div>
                      <span className="timer-subtext">
                        {upiTimer > 0
                          ? 'Valid for 5 minutes. Complete payment in your UPI app before timer expires.'
                          : 'Payment session expired. Please refresh to generate a new QR code.'}
                      </span>
                    </div>
                    {upiTimer === 0 ? (
                      <button type="button" className="refresh-qr-btn" onClick={resetUpiTimer}>
                        Refresh QR Code
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
                            <img src={qrCodeDataUrl} alt={`UPI QR Code for ${UPI_ID}`} className="qr-image" />
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
                        <strong>Paying on this mobile or desktop?</strong>
                        <p>Click below to redirect directly to UPI ID <code>{UPI_ID}</code></p>
                      </div>

                      <a
                        href={upiUri}
                        className="upi-direct-pay-button"
                        onClick={(e) => {
                          e.preventDefault();
                          handleUpiDirectRedirect();
                        }}
                      >
                        <ExternalLink size={18} />
                        <span>Pay via UPI App (Redirect to {UPI_ID})</span>
                      </a>

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
                        <span>UPI UTR / Reference No. (Optional)</span>
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
                    </div>
                  </div>
                  {!wallet ? (
                    <button type="button" className="light-button" onClick={() => setWalletModalOpen(true)}>
                      Connect Wallet (MetaMask / Coinbase)
                    </button>
                  ) : (
                    <button type="button" className="light-button" onClick={() => setWallet(null)}>
                      Disconnect
                    </button>
                  )}
                </div>
              ) : null}
            </div>

            <label className="promo-field">
              Promo
              <input value={promoCode} onChange={(event) => setPromoCode(event.target.value)} placeholder="STYLE10" />
            </label>

            <OrderSummary
              subtotal={subtotal}
              promoDiscount={promoDiscount}
              walletDiscount={walletDiscount}
              shipping={shipping}
              tax={tax}
              total={total}
            />

            {checkoutMessage ? <p className="form-message">{checkoutMessage}</p> : null}
            {lastOrder ? (
              <div className="success-order-banner">
                <div className="success-order-top">
                  <Check size={20} className="success-check-icon" />
                  <div>
                    <strong>Order {lastOrder.id} confirmed!</strong>
                    <p>Estimated delivery {lastOrder.delivery}</p>
                  </div>
                </div>
                {lastOrder.paymentMethod ? (
                  <div className="success-order-meta">
                    <span>Payment: <strong>{lastOrder.paymentMethod}</strong></span>
                    {lastOrder.reference ? <span> ({lastOrder.reference})</span> : null}
                  </div>
                ) : null}
              </div>
            ) : null}

            <button className="checkout-button" type="submit">
              <ShieldCheck size={18} aria-hidden="true" />
              {paymentMethod === 'upi'
                ? `Confirm UPI Order (₹${inrAmount.toLocaleString('en-IN')})`
                : paymentMethod === 'netbanking'
                ? `Proceed to Bank Gateway (₹${inrAmount.toLocaleString('en-IN')})`
                : 'Place secure order'}
            </button>
          </form>
        </section>
      </main>

      <nav className="bottom-nav" aria-label="Mobile actions">
        <a href="#home">
          <Home size={19} aria-hidden="true" />
          Home
        </a>
        <button onClick={() => document.getElementById('productSearch')?.focus()}>
          <Search size={19} aria-hidden="true" />
          Search
        </button>
        <button onClick={() => setCartOpen(true)}>
          <ShoppingCart size={19} aria-hidden="true" />
          Cart
        </button>
        <button onClick={() => setAuthOpen(true)}>
          <User size={19} aria-hidden="true" />
          Profile
        </button>
      </nav>

      {cartOpen ? (
        <CartDrawer
          cartLines={cartLines}
          itemCount={itemCount}
          subtotal={subtotal}
          total={total}
          onClose={() => setCartOpen(false)}
          onQuantity={updateQuantity}
          onRemove={removeFromCart}
        />
      ) : null}

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
          onWalletConnect={connectWallet}
          onWalletDisconnect={() => setWallet(null)}
        />
      ) : null}

      {selectedProduct ? (
        <ProductDialog
          product={selectedProduct}
          saved={wishlist.includes(selectedProduct.id)}
          onClose={() => setSelectedProduct(null)}
          onAdd={addToCart}
          onSave={() => toggleWishlist(selectedProduct.id)}
        />
      ) : null}

      {walletModalOpen ? (
        <WalletModal
          isConnecting={connectingProvider}
          onClose={() => setWalletModalOpen(false)}
          onConnect={connectSpecificWallet}
        />
      ) : null}

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
}: {
  cartLines: { item: CartItem; product: Product }[];
  itemCount: number;
  subtotal: number;
  total: number;
  onClose: () => void;
  onQuantity: (item: CartItem, quantity: number) => void;
  onRemove: (item: CartItem) => void;
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
          <a className="checkout-button" href="#checkout" onClick={onClose}>
            Checkout
          </a>
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
                <input name="name" autoComplete="name" />
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
