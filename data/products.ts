// Single source of truth for every product, spec, color and price on the site.
// All numbers below are PLACEHOLDERS for a concept site. Replace them with
// official figures before publishing.

export type ProductId = 'xiaomi-18-pro' | 'xiaomi-18-pro-max' | 'xiaomi-fold' | 'pad-9' | 'pad-9-pro-max';

export type Category = 'phone' | 'foldable' | 'tablet';

export interface ColorOption {
  name: string;
  /** Back glass / body color used on the 3D model */
  hex: string;
  /** Metal frame color */
  frame: string;
  /** Phones only: transparent edition shows internals through the back */
  finish?: 'clear' | 'matte';
}

export interface Specs {
  display: string;
  /** Diagonal in inches, used for bars and true-scale outlines */
  displaySize: number;
  refresh: string;
  chip: string;
  ram: string;
  storage: string;
  mainCamera: string;
  /** Main sensor resolution in MP, used for spec bars */
  cameraMp: number;
  zoom: string;
  /** mAh */
  battery: number;
  /** Wired charging in W */
  charging: number;
  /** grams */
  weight: number;
  /** mm */
  thickness: number;
  os: string;
}

export interface Product {
  id: ProductId;
  name: string;
  short: string;
  category: Category;
  tagline: string;
  /** USD */
  price: number;
  colors: ColorOption[];
  specs: Specs;
}

export const products: Record<ProductId, Product> = {
  'xiaomi-18-pro': {
    id: 'xiaomi-18-pro',
    name: 'Xiaomi 18 Pro',
    short: '18 Pro',
    category: 'phone',
    tagline: 'Pro to the core.',
    price: 999, // TODO: verify official spec
    colors: [
      { name: 'Transparent Red', hex: '#d2201c', frame: '#c8261f', finish: 'clear' },
      { name: 'Obsidian Black', hex: '#1c1c1f', frame: '#2c2c31', finish: 'matte' },
      { name: 'Glacier White', hex: '#e8e8eb', frame: '#d2d3d7', finish: 'matte' },
      { name: 'Lavender', hex: '#9584b8', frame: '#ab9fcb', finish: 'matte' },
      { name: 'Forest Green', hex: '#3e4b3d', frame: '#5a6653', finish: 'matte' },
    ],
    // TODO: verify official spec
    specs: {
      display: '6.36" LTPO AMOLED',
      displaySize: 6.36,
      refresh: '1–120 Hz',
      chip: 'Snapdragon 8 Elite Gen 6',
      ram: '12 / 16 GB',
      storage: '256 GB – 1 TB',
      mainCamera: '50 MP 1" type',
      cameraMp: 50,
      zoom: '5x periscope',
      battery: 6300,
      charging: 100,
      weight: 199,
      thickness: 8.1,
      os: 'Xiaomi HyperOS 3',
    },
  },
  'xiaomi-18-pro-max': {
    id: 'xiaomi-18-pro-max',
    name: 'Xiaomi 18 Pro Max',
    short: '18 Pro Max',
    category: 'phone',
    tagline: 'Everything. Maximised.',
    price: 1199, // TODO: verify official spec
    colors: [
      { name: 'Transparent Red', hex: '#d2201c', frame: '#c8261f', finish: 'clear' },
      { name: 'Obsidian Black', hex: '#1c1c1f', frame: '#2c2c31', finish: 'matte' },
      { name: 'Glacier White', hex: '#e8e8eb', frame: '#d2d3d7', finish: 'matte' },
      { name: 'Lavender', hex: '#9584b8', frame: '#ab9fcb', finish: 'matte' },
      { name: 'Forest Green', hex: '#3e4b3d', frame: '#5a6653', finish: 'matte' },
    ],
    // TODO: verify official spec
    specs: {
      display: '6.9" LTPO AMOLED',
      displaySize: 6.9,
      refresh: '1–120 Hz',
      chip: 'Snapdragon 8 Elite Gen 6',
      ram: '16 GB',
      storage: '512 GB – 1 TB',
      mainCamera: '50 MP 1" type',
      cameraMp: 50,
      zoom: '5x periscope + 10x crop',
      battery: 7500,
      charging: 120,
      weight: 228,
      thickness: 8.4,
      os: 'Xiaomi HyperOS 3',
    },
  },
  'xiaomi-fold': {
    id: 'xiaomi-fold',
    name: 'Xiaomi 18 Fold',
    short: '18 Fold',
    category: 'foldable',
    tagline: 'Unfold a bigger idea.',
    price: 1799, // TODO: verify official spec
    colors: [
      { name: 'Crimson', hex: '#a3192b', frame: '#b02033' },
      { name: 'Ivory', hex: '#e6dfd2', frame: '#d6ccbb' },
      { name: 'Blush', hex: '#e7cdc2', frame: '#dcbcae' },
      { name: 'Graphite', hex: '#2a2b2f', frame: '#3b3c41' },
    ],
    // TODO: verify official spec
    specs: {
      display: '8.0" inner / 6.56" cover',
      displaySize: 8.0,
      refresh: '1–120 Hz',
      chip: 'Snapdragon 8 Elite Gen 6',
      ram: '16 GB',
      storage: '512 GB – 1 TB',
      mainCamera: '50 MP',
      cameraMp: 50,
      zoom: '3x telephoto',
      battery: 5800,
      charging: 90,
      weight: 219,
      thickness: 8.9,
      os: 'Xiaomi HyperOS 3',
    },
  },
  'pad-9': {
    id: 'pad-9',
    name: 'Xiaomi Pad 9',
    short: 'Pad 9',
    category: 'tablet',
    tagline: 'Big screen. Light life.',
    price: 449, // TODO: verify official spec
    colors: [
      { name: 'Graphite', hex: '#2a2b2f', frame: '#45474d' },
      { name: 'Sage', hex: '#a9b5a2', frame: '#c4ccc0' },
      { name: 'Mist Blue', hex: '#9fb3c8', frame: '#c2cfdc' },
    ],
    // TODO: verify official spec
    specs: {
      display: '11.2" 3.2K LCD',
      displaySize: 11.2,
      refresh: '144 Hz',
      chip: 'Snapdragon 8s Gen 5',
      ram: '8 / 12 GB',
      storage: '128 – 512 GB',
      mainCamera: '13 MP',
      cameraMp: 13,
      zoom: '—',
      battery: 9000,
      charging: 45,
      weight: 499,
      thickness: 5.9,
      os: 'Xiaomi HyperOS 3',
    },
  },
  'pad-9-pro-max': {
    id: 'pad-9-pro-max',
    name: 'Xiaomi Pad 9 Pro Max',
    short: 'Pad 9 Pro Max',
    category: 'tablet',
    tagline: 'A studio you can carry.',
    price: 799, // TODO: verify official spec
    colors: [
      { name: 'Graphite', hex: '#2a2b2f', frame: '#45474d' },
      { name: 'Ember Orange', hex: '#d9561a', frame: '#c9c9cf' },
      { name: 'Silver', hex: '#c8cacf', frame: '#e3e4e7' },
    ],
    // TODO: verify official spec
    specs: {
      display: '14" 3.5K OLED',
      displaySize: 14,
      refresh: '144 Hz',
      chip: 'Snapdragon 8 Elite Gen 6',
      ram: '12 / 16 GB',
      storage: '256 GB – 1 TB',
      mainCamera: '50 MP',
      cameraMp: 50,
      zoom: '—',
      battery: 12000,
      charging: 120,
      weight: 610,
      thickness: 5.7,
      os: 'Xiaomi HyperOS 3',
    },
  },
};

export const productList = Object.values(products);

/** Camera module callouts shown in the 18 Pro exploded view. */
// TODO: verify official spec
export const cameraCallouts = [
  { label: '1" type sensor', detail: '50 MP · Light Fusion', pos: 'tl' },
  { label: 'f/1.6 aperture', detail: 'Variable, 8-element lens', pos: 'tr' },
  { label: '5x periscope', detail: '230 mm equivalent', pos: 'bl' },
  { label: 'Ultra-wide 115°', detail: 'Macro down to 5 cm', pos: 'br' },
] as const;

/** Fold durability figures. */
// TODO: verify official spec
export const foldStats = {
  foldsTested: 500000,
  hingeParts: 112,
  creaseDepth: '< 0.1 mm',
};

/** Pad 9 / Pad 9 Pro Max physical outlines for the true-scale comparison (mm). */
// TODO: verify official spec
export const padOutlines = {
  'pad-9': { width: 251, height: 174, label: 'Pad 9 · 11.2"' },
  'pad-9-pro-max': { width: 311, height: 214, label: 'Pad 9 Pro Max · 14"' },
};

export interface Accessory {
  id: 'watch' | 'buds' | 'pen' | 'keyboard';
  name: string;
  price: number;
  requiresTablet?: boolean;
}

// TODO: verify official spec
export const accessories: Accessory[] = [
  { id: 'watch', name: 'Xiaomi Watch S5', price: 249 },
  { id: 'buds', name: 'Xiaomi Buds 6 Pro', price: 179 },
  { id: 'pen', name: 'Xiaomi Focus Pen 3', price: 99, requiresTablet: true },
  { id: 'keyboard', name: 'Pad Touch Keyboard', price: 149, requiresTablet: true },
];

export type EcoNodeId = 'phone' | 'fold' | 'pad' | 'watch' | 'buds' | 'home' | 'car';

export interface EcoNode {
  id: EcoNodeId;
  label: string;
  feature: string;
  description: string;
  links: EcoNodeId[];
}

export const ecosystemNodes: EcoNode[] = [
  {
    id: 'phone',
    label: 'Xiaomi 18 Pro Max',
    feature: 'Camera handoff',
    description: 'Use your phone camera as a live viewfinder on Pad, or scan a document straight into Notes.',
    links: ['pad', 'watch', 'buds', 'home', 'car', 'fold'],
  },
  {
    id: 'fold',
    label: 'Xiaomi 18 Fold',
    feature: 'Continue on Fold',
    description: 'Open an app on your phone, unfold, and it picks up on the big screen exactly where you left off.',
    links: ['phone', 'pad', 'buds'],
  },
  {
    id: 'pad',
    label: 'Pad 9 Pro Max',
    feature: 'Drag a file from phone to Pad',
    description: 'Drag photos, files and text across devices with one gesture. No cables, no uploads.',
    links: ['phone', 'fold', 'buds', 'home'],
  },
  {
    id: 'watch',
    label: 'Xiaomi Watch',
    feature: 'Unlock and notify',
    description: 'Your watch unlocks your phone and Pad when nearby, and mirrors notifications you care about.',
    links: ['phone', 'car', 'home'],
  },
  {
    id: 'buds',
    label: 'Xiaomi Buds',
    feature: 'Seamless audio switching',
    description: 'Audio follows you from phone to Pad to Fold automatically, based on what you are using.',
    links: ['phone', 'pad', 'fold'],
  },
  {
    id: 'home',
    label: 'Smart Home',
    feature: 'Shared clipboard & control',
    description: 'Copy on one device, paste on another. Control lights and cameras from any screen.',
    links: ['phone', 'pad', 'watch'],
  },
  {
    id: 'car',
    label: 'Xiaomi EV',
    feature: 'Phone as car key',
    description: 'Your route, music and calls move to the car display the moment you sit down.',
    links: ['phone', 'watch'],
  },
];

export const navSections = [
  { id: 'hero', label: 'Home' },
  { id: 'pro', label: '18 Pro' },
  { id: 'fold', label: 'Fold' },
  { id: 'pad', label: 'Pad 9' },
  { id: 'ecosystem', label: 'Ecosystem' },
  { id: 'compare', label: 'Compare' },
  { id: 'build', label: 'Build' },
] as const;
