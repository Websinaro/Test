export interface InitialCategory {
  slug: string;
  name: string;
  icon: string;
  description: string;
  image_url: string;
}

export interface InitialProduct {
  title: string;
  slug: string;
  description: string;
  price: number;
  original_price: number;
  discount_percent: number;
  rating: number;
  review_count: number;
  stock_quantity: number;
  category_slug: string;
  brand: string;
  images: string[];
  features: string[];
  in_stock: boolean;
  is_featured: boolean;
  badge?: string;
}

export interface InitialCoupon {
  code: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  min_purchase: number;
  max_discount?: number;
  description: string;
  is_active: boolean;
}

export const INITIAL_CATEGORIES: InitialCategory[] = [
  {
    slug: 'audio',
    name: 'Audio & Sound',
    icon: 'Headphones',
    description: 'Studio-grade headphones, noise-canceling earbuds, and high-fidelity speakers',
    image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
  },
  {
    slug: 'wearables',
    name: 'Smart Wearables',
    icon: 'Watch',
    description: 'Advanced smartwatches, fitness bands, and biometric wellness trackers',
    image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
  },
  {
    slug: 'computing',
    name: 'Laptops & Computing',
    icon: 'Laptop',
    description: 'High-performance ultrabooks, mechanical keyboards, and 4K displays',
    image_url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80',
  },
  {
    slug: 'cameras',
    name: 'Cameras & Optics',
    icon: 'Camera',
    description: 'Mirrorless 4K cameras, cine lenses, and professional gimbal stabilizers',
    image_url: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80',
  },
  {
    slug: 'accessories',
    name: 'Tech Accessories',
    icon: 'Smartphone',
    description: 'GaN ultra-fast chargers, braided cables, leather cases, and magnetic docks',
    image_url: 'https://images.unsplash.com/photo-1625772452859-1c03d5bf1137?auto=format&fit=crop&w=800&q=80',
  },
  {
    slug: 'smart-home',
    name: 'Smart Living',
    icon: 'Home',
    description: 'Ambient smart lighting, AI home assistants, and automated climate gear',
    image_url: 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=800&q=80',
  },
];

export const INITIAL_PRODUCTS: InitialProduct[] = [
  {
    title: 'Aura Pro ANC Wireless Headphones',
    slug: 'aura-pro-anc-headphones',
    description: 'Engineered for pristine acoustic clarity with 45mm custom dynamic drivers, hybrid active noise cancellation (42dB reduction), and 40-hour ultra-long battery life with rapid USB-C charging.',
    price: 249.99,
    original_price: 329.99,
    discount_percent: 24,
    rating: 4.9,
    review_count: 312,
    stock_quantity: 45,
    category_slug: 'audio',
    brand: 'AuraSonic',
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1000&q=80',
    ],
    features: [
      'Industry-leading 42dB Hybrid Active Noise Cancellation',
      '40-hour battery lifespan with 10-min quick charge for 4 hours',
      'Multi-point Bluetooth 5.3 with LDAC lossless audio codec',
      'Plush memory-foam lambskin leather ear cushions',
      'Built-in 6-mic beamforming array with AI background filtering',
    ],
    in_stock: true,
    is_featured: true,
    badge: 'Bestseller',
  },
  {
    title: 'Chronos Titanium GPS Smartwatch',
    slug: 'chronos-titanium-gps-smartwatch',
    description: 'Precision grade aerospace titanium case with sapphire crystal glass. Features dual-frequency GNSS tracking, ECG monitor, 100m water resistance, and offline topo maps.',
    price: 389.00,
    original_price: 449.00,
    discount_percent: 13,
    rating: 4.8,
    review_count: 184,
    stock_quantity: 28,
    category_slug: 'wearables',
    brand: 'Chronos',
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=1000&q=80',
    ],
    features: [
      'Grade 5 Titanium Bezel & Scratch-proof Sapphire Crystal',
      'Always-on 1.4-inch AMOLED display (2000 nits peak brightness)',
      '14-day battery life in typical smartwatch mode',
      'Advanced biometric sensor: SpO2, continuous HR & Sleep staging',
      'Integrated offline multi-continent topographic maps',
    ],
    in_stock: true,
    is_featured: true,
    badge: 'Top Rated',
  },
  {
    title: 'ZenBook Studio 16 OLED Pro',
    slug: 'zenbook-studio-16-oled',
    description: 'Workstation grade laptop powered by 14-core Intel Core i9, NVIDIA RTX 4070, 32GB DDR5 RAM, and a breathtaking 3.2K 120Hz color-calibrated OLED display for creators.',
    price: 1899.00,
    original_price: 2199.00,
    discount_percent: 14,
    rating: 4.95,
    review_count: 94,
    stock_quantity: 12,
    category_slug: 'computing',
    brand: 'Vanguard',
    images: [
      'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=1000&q=80',
    ],
    features: [
      '16-inch 3.2K (3200x2000) 120Hz 0.2ms OLED display (100% DCI-P3)',
      'Intel Core i9-13900H (14 cores, 20 threads, up to 5.4 GHz)',
      'NVIDIA GeForce RTX 4070 (8GB GDDR6 VRAM)',
      '32GB 5600MHz LPDDR5X RAM + 2TB NVMe PCIe 4.0 SSD',
      'Vapor chamber thermal cooling architecture',
    ],
    in_stock: true,
    is_featured: true,
    badge: 'Flagship',
  },
  {
    title: 'Lumina Lumix Cinema 4K Mirrorless',
    slug: 'lumina-lumix-cinema-4k',
    description: 'Compact cinema powerhouse featuring a 24.2MP full-frame sensor, internal 10-bit 4:2:2 4K60p recording, 6.5-stop sensor shift IBIS, and unlimited recording time.',
    price: 1499.00,
    original_price: 1699.00,
    discount_percent: 12,
    rating: 4.85,
    review_count: 67,
    stock_quantity: 15,
    category_slug: 'cameras',
    brand: 'Lumina',
    images: [
      'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=1000&q=80',
    ],
    features: [
      '24.2MP Full-Frame CMOS Sensor with Dual Native ISO',
      'Internal 4K 60p 10-bit 4:2:2 and V-Log 14+ stops dynamic range',
      '5-Axis Sensor-Shift Image Stabilization (6.5 stops)',
      'Dual UHS-II SD Card Slots with relay & backup recording',
      'Magnesium alloy weather-sealed chassis',
    ],
    in_stock: true,
    is_featured: false,
    badge: 'Popular',
  },
  {
    title: 'VoltPulse 140W GaN Fast Charger & Hub',
    slug: 'voltpulse-140w-gan-charger',
    description: 'Next-gen Gallium Nitride (GaN III) high-density multi-port power adapter capable of charging a 16-inch laptop, tablet, and phone at maximum speeds simultaneously.',
    price: 69.99,
    original_price: 89.99,
    discount_percent: 22,
    rating: 4.7,
    review_count: 420,
    stock_quantity: 80,
    category_slug: 'accessories',
    brand: 'VoltPulse',
    images: [
      'https://images.unsplash.com/photo-1625772452859-1c03d5bf1137?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=1000&q=80',
    ],
    features: [
      '140W total output with Power Delivery 3.1 support',
      '3x USB-C ports and 1x USB-A port with smart dynamic power allocation',
      'Over-voltage, surge, and thermal monitoring protection',
      'Foldable prongs and universal 100-240V worldwide compatibility',
      'Included 240W braided 6.6ft Kevlar USB-C cable',
    ],
    in_stock: true,
    is_featured: false,
  },
  {
    title: 'AeroSound Flow Hi-Fi Spatial Speaker',
    slug: 'aerosound-flow-spatial-speaker',
    description: '360-degree room-filling acoustic brilliance with 6 active drivers, dual passive subwoofers, room calibration tuning, and seamless AirPlay 2, Spotify Connect, and Bluetooth audio streaming.',
    price: 199.00,
    original_price: 249.00,
    discount_percent: 20,
    rating: 4.8,
    review_count: 142,
    stock_quantity: 35,
    category_slug: 'audio',
    brand: 'AuraSonic',
    images: [
      'https://images.unsplash.com/photo-1545454675-3531b543be5d?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1543512214-318c7553f230?auto=format&fit=crop&w=1000&q=80',
    ],
    features: [
      '360° omnidirectional acoustic dispersion pattern',
      'TrueRoom adaptive acoustic auto-calibration microphone',
      'IP67 dust and waterproof rating for outdoor durability',
      '18 hours continuous wireless playback with magnetic dock',
      'Touch capacitive controls with ambient halo light bar',
    ],
    in_stock: true,
    is_featured: true,
    badge: 'Trending',
  },
  {
    title: 'PulseTrack Fit Pro Smart Band',
    slug: 'pulsetrack-fit-pro-band',
    description: 'Ultra-lightweight 24g fitness band featuring all-day HRV heart tracking, blood oxygen metrics, stress scores, and waterproof construction up to 50m.',
    price: 89.00,
    original_price: 119.00,
    discount_percent: 25,
    rating: 4.65,
    review_count: 230,
    stock_quantity: 60,
    category_slug: 'wearables',
    brand: 'PulseTrack',
    images: [
      'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1510017803434-a899398421b3?auto=format&fit=crop&w=1000&q=80',
    ],
    features: [
      'Weightless 24g titanium & fluoroelastomer design',
      '120+ workout sport modes with automatic recognition',
      'Detailed sleep phase tracking & recovery index score',
      'Up to 10 days battery on a single charge',
      '5 ATM water resistance for swimming',
    ],
    in_stock: true,
    is_featured: false,
  },
  {
    title: 'OmniDesk Mech Ergo Keyboard',
    slug: 'omnidesk-mech-ergo-keyboard',
    description: 'Split mechanical ergonomic keyboard with hot-swappable lubricated linear switches, CNC anodized aluminum chassis, south-facing RGB, and wireless 2.4GHz + Bluetooth.',
    price: 169.00,
    original_price: 199.00,
    discount_percent: 15,
    rating: 4.9,
    review_count: 178,
    stock_quantity: 40,
    category_slug: 'computing',
    brand: 'OmniDesk',
    images: [
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=1000&q=80',
    ],
    features: [
      'Gasket mounted construction with sound-dampening IXPE foam',
      'Custom pre-lubed Gateron Pro switches',
      'Seamless tri-mode connectivity (2.4G / BT 5.2 / USB-C)',
      '4000mAh battery providing up to 200 hours of use',
      'Mac and Windows keycaps and hotkey swap switch',
    ],
    in_stock: true,
    is_featured: false,
    badge: 'Staff Pick',
  },
  {
    title: 'GlowSmart Ambient Sync Lightbar Set',
    slug: 'glowsmart-ambient-sync-lightbar',
    description: 'Dynamic reactive screen backlighting kit with 16 million colors, dual corner towers, sound reactive beat detection, and integration with Alexa and Google Home.',
    price: 119.00,
    original_price: 149.00,
    discount_percent: 20,
    rating: 4.75,
    review_count: 98,
    stock_quantity: 50,
    category_slug: 'smart-home',
    brand: 'GlowSmart',
    images: [
      'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=1000&q=80',
      'https://images.unsplash.com/photo-1540932239986-30128078f3c5?auto=format&fit=crop&w=1000&q=80',
    ],
    features: [
      'Direct HDMI 2.1 zero-latency video screen syncing',
      '16 Million RGBIC addressable color zones',
      'Built-in acoustic sensor with 8 rhythmic music modes',
      'Compatible with HomeKit, Google Assistant, and Matter',
      'Heavy weighted matte metal base stands included',
    ],
    in_stock: true,
    is_featured: false,
  }
];

export const INITIAL_COUPONS: InitialCoupon[] = [
  {
    code: 'WELCOME20',
    discount_type: 'percentage',
    discount_value: 20,
    min_purchase: 50,
    max_discount: 100,
    description: '20% off on orders over $50 for new members',
    is_active: true,
  },
  {
    code: 'SAVE10',
    discount_type: 'percentage',
    discount_value: 10,
    min_purchase: 30,
    description: '10% instant discount across all categories',
    is_active: true,
  },
  {
    code: 'PROMO50',
    discount_type: 'fixed',
    discount_value: 50,
    min_purchase: 250,
    description: '$50 flat off on premium orders exceeding $250',
    is_active: true,
  },
  {
    code: 'FREESHIP',
    discount_type: 'fixed',
    discount_value: 15,
    min_purchase: 40,
    description: 'Free expedited express shipping discount ($15 value)',
    is_active: true,
  },
];
