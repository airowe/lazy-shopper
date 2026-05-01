export type Retailer = {
  id: string;
  name: string;
  logo: string;
  deliveryFee: number;
  freeDeliveryThreshold: number;
  membershipDiscount: number;
  membershipName: string;
  pickupAvailable: boolean;
};

export type ProductOffer = {
  retailerId: string;
  price: number;
  unit: string;
  unitPrice: number;
  inStock: boolean;
  onSale: boolean;
};

export type Product = {
  id: string;
  name: string;
  category: string;
  image: string;
  offers: ProductOffer[];
};

export const RETAILERS: Retailer[] = [
  {
    id: 'freshmart',
    name: 'FreshMart',
    logo: '🛒',
    deliveryFee: 4.99,
    freeDeliveryThreshold: 35,
    membershipDiscount: 0.05,
    membershipName: 'FreshPass',
    pickupAvailable: true,
  },
  {
    id: 'valuegrocer',
    name: 'ValueGrocer',
    logo: '🏪',
    deliveryFee: 3.99,
    freeDeliveryThreshold: 30,
    membershipDiscount: 0,
    membershipName: '',
    pickupAvailable: true,
  },
  {
    id: 'quickstop',
    name: 'QuickStop',
    logo: '⚡',
    deliveryFee: 6.99,
    freeDeliveryThreshold: 50,
    membershipDiscount: 0.1,
    membershipName: 'QuickClub',
    pickupAvailable: false,
  },
  {
    id: 'megasave',
    name: 'MegaSave',
    logo: '🏬',
    deliveryFee: 5.49,
    freeDeliveryThreshold: 40,
    membershipDiscount: 0.03,
    membershipName: 'MegaRewards',
    pickupAvailable: true,
  },
];

export const PRODUCTS: Product[] = [
  {
    id: 'milk-whole-gallon',
    name: 'Whole Milk (Gallon)',
    category: 'Dairy',
    image: '🥛',
    offers: [
      { retailerId: 'freshmart', price: 4.29, unit: '1 gal', unitPrice: 4.29, inStock: true, onSale: false },
      { retailerId: 'valuegrocer', price: 3.99, unit: '1 gal', unitPrice: 3.99, inStock: true, onSale: true },
      { retailerId: 'quickstop', price: 4.49, unit: '1 gal', unitPrice: 4.49, inStock: true, onSale: false },
      { retailerId: 'megasave', price: 4.19, unit: '1 gal', unitPrice: 4.19, inStock: true, onSale: false },
    ],
  },
  {
    id: 'eggs-large-12',
    name: 'Large Eggs (12 ct)',
    category: 'Dairy',
    image: '🥚',
    offers: [
      { retailerId: 'freshmart', price: 5.49, unit: '12 ct', unitPrice: 0.46, inStock: true, onSale: false },
      { retailerId: 'valuegrocer', price: 4.99, unit: '12 ct', unitPrice: 0.42, inStock: true, onSale: false },
      { retailerId: 'quickstop', price: 5.99, unit: '12 ct', unitPrice: 0.50, inStock: true, onSale: false },
      { retailerId: 'megasave', price: 4.79, unit: '12 ct', unitPrice: 0.40, inStock: true, onSale: true },
    ],
  },
  {
    id: 'bread-whole-wheat',
    name: 'Whole Wheat Bread (Loaf)',
    category: 'Bakery',
    image: '🍞',
    offers: [
      { retailerId: 'freshmart', price: 3.49, unit: '1 loaf', unitPrice: 3.49, inStock: true, onSale: false },
      { retailerId: 'valuegrocer', price: 2.99, unit: '1 loaf', unitPrice: 2.99, inStock: true, onSale: false },
      { retailerId: 'quickstop', price: 3.79, unit: '1 loaf', unitPrice: 3.79, inStock: true, onSale: true },
      { retailerId: 'megasave', price: 3.29, unit: '1 loaf', unitPrice: 3.29, inStock: false, onSale: false },
    ],
  },
  {
    id: 'chicken-breast-lb',
    name: 'Chicken Breast (per lb)',
    category: 'Meat',
    image: '🍗',
    offers: [
      { retailerId: 'freshmart', price: 5.99, unit: '1 lb', unitPrice: 5.99, inStock: true, onSale: false },
      { retailerId: 'valuegrocer', price: 5.49, unit: '1 lb', unitPrice: 5.49, inStock: true, onSale: false },
      { retailerId: 'quickstop', price: 6.49, unit: '1 lb', unitPrice: 6.49, inStock: true, onSale: false },
      { retailerId: 'megasave', price: 4.99, unit: '1 lb', unitPrice: 4.99, inStock: true, onSale: true },
    ],
  },
  {
    id: 'rice-white-5lb',
    name: 'White Rice (5 lb)',
    category: 'Pantry',
    image: '🍚',
    offers: [
      { retailerId: 'freshmart', price: 6.99, unit: '5 lb', unitPrice: 1.40, inStock: true, onSale: false },
      { retailerId: 'valuegrocer', price: 5.99, unit: '5 lb', unitPrice: 1.20, inStock: true, onSale: true },
      { retailerId: 'quickstop', price: 7.49, unit: '5 lb', unitPrice: 1.50, inStock: true, onSale: false },
      { retailerId: 'megasave', price: 6.49, unit: '5 lb', unitPrice: 1.30, inStock: true, onSale: false },
    ],
  },
  {
    id: 'pasta-penne-1lb',
    name: 'Penne Pasta (1 lb)',
    category: 'Pantry',
    image: '🍝',
    offers: [
      { retailerId: 'freshmart', price: 1.99, unit: '1 lb', unitPrice: 1.99, inStock: true, onSale: false },
      { retailerId: 'valuegrocer', price: 1.49, unit: '1 lb', unitPrice: 1.49, inStock: true, onSale: false },
      { retailerId: 'quickstop', price: 2.29, unit: '1 lb', unitPrice: 2.29, inStock: true, onSale: false },
      { retailerId: 'megasave', price: 1.79, unit: '1 lb', unitPrice: 1.79, inStock: true, onSale: false },
    ],
  },
  {
    id: 'cereal-corn-flakes',
    name: 'Corn Flakes (18 oz)',
    category: 'Breakfast',
    image: '🥣',
    offers: [
      { retailerId: 'freshmart', price: 4.49, unit: '18 oz', unitPrice: 0.25, inStock: true, onSale: false },
      { retailerId: 'valuegrocer', price: 3.99, unit: '18 oz', unitPrice: 0.22, inStock: true, onSale: true },
      { retailerId: 'quickstop', price: 4.79, unit: '18 oz', unitPrice: 0.27, inStock: true, onSale: false },
      { retailerId: 'megasave', price: 4.29, unit: '18 oz', unitPrice: 0.24, inStock: true, onSale: false },
    ],
  },
  {
    id: 'bananas-1lb',
    name: 'Bananas (1 lb)',
    category: 'Produce',
    image: '🍌',
    offers: [
      { retailerId: 'freshmart', price: 0.69, unit: '1 lb', unitPrice: 0.69, inStock: true, onSale: false },
      { retailerId: 'valuegrocer', price: 0.59, unit: '1 lb', unitPrice: 0.59, inStock: true, onSale: false },
      { retailerId: 'quickstop', price: 0.79, unit: '1 lb', unitPrice: 0.79, inStock: true, onSale: false },
      { retailerId: 'megasave', price: 0.55, unit: '1 lb', unitPrice: 0.55, inStock: true, onSale: true },
    ],
  },
  {
    id: 'olive-oil-16oz',
    name: 'Extra Virgin Olive Oil (16 oz)',
    category: 'Pantry',
    image: '🫒',
    offers: [
      { retailerId: 'freshmart', price: 8.99, unit: '16 oz', unitPrice: 0.56, inStock: true, onSale: false },
      { retailerId: 'valuegrocer', price: 7.99, unit: '16 oz', unitPrice: 0.50, inStock: true, onSale: false },
      { retailerId: 'quickstop', price: 9.49, unit: '16 oz', unitPrice: 0.59, inStock: true, onSale: false },
      { retailerId: 'megasave', price: 8.49, unit: '16 oz', unitPrice: 0.53, inStock: false, onSale: false },
    ],
  },
  {
    id: 'coffee-ground-12oz',
    name: 'Ground Coffee (12 oz)',
    category: 'Beverages',
    image: '☕',
    offers: [
      { retailerId: 'freshmart', price: 7.49, unit: '12 oz', unitPrice: 0.62, inStock: true, onSale: false },
      { retailerId: 'valuegrocer', price: 6.99, unit: '12 oz', unitPrice: 0.58, inStock: true, onSale: false },
      { retailerId: 'quickstop', price: 8.29, unit: '12 oz', unitPrice: 0.69, inStock: true, onSale: false },
      { retailerId: 'megasave', price: 5.99, unit: '12 oz', unitPrice: 0.50, inStock: true, onSale: true },
    ],
  },
  {
    id: 'toilet-paper-12pk',
    name: 'Toilet Paper (12 pk)',
    category: 'Household',
    image: '🧻',
    offers: [
      { retailerId: 'freshmart', price: 9.99, unit: '12 pk', unitPrice: 0.83, inStock: true, onSale: false },
      { retailerId: 'valuegrocer', price: 8.99, unit: '12 pk', unitPrice: 0.75, inStock: true, onSale: false },
      { retailerId: 'quickstop', price: 10.99, unit: '12 pk', unitPrice: 0.92, inStock: true, onSale: false },
      { retailerId: 'megasave', price: 7.99, unit: '12 pk', unitPrice: 0.67, inStock: true, onSale: true },
    ],
  },
  {
    id: 'avocado-each',
    name: 'Avocado (each)',
    category: 'Produce',
    image: '🥑',
    offers: [
      { retailerId: 'freshmart', price: 1.99, unit: 'each', unitPrice: 1.99, inStock: true, onSale: false },
      { retailerId: 'valuegrocer', price: 1.49, unit: 'each', unitPrice: 1.49, inStock: true, onSale: false },
      { retailerId: 'quickstop', price: 2.29, unit: 'each', unitPrice: 2.29, inStock: false, onSale: false },
      { retailerId: 'megasave', price: 1.79, unit: 'each', unitPrice: 1.79, inStock: true, onSale: false },
    ],
  },
  {
    id: 'cheese-cheddar-8oz',
    name: 'Cheddar Cheese (8 oz)',
    category: 'Dairy',
    image: '🧀',
    offers: [
      { retailerId: 'freshmart', price: 4.49, unit: '8 oz', unitPrice: 0.56, inStock: true, onSale: false },
      { retailerId: 'valuegrocer', price: 3.99, unit: '8 oz', unitPrice: 0.50, inStock: true, onSale: false },
      { retailerId: 'quickstop', price: 4.99, unit: '8 oz', unitPrice: 0.62, inStock: true, onSale: false },
      { retailerId: 'megasave', price: 3.79, unit: '8 oz', unitPrice: 0.47, inStock: true, onSale: true },
    ],
  },
  {
    id: 'yogurt-greek-32oz',
    name: 'Greek Yogurt (32 oz)',
    category: 'Dairy',
    image: '🫙',
    offers: [
      { retailerId: 'freshmart', price: 5.99, unit: '32 oz', unitPrice: 0.19, inStock: true, onSale: false },
      { retailerId: 'valuegrocer', price: 5.49, unit: '32 oz', unitPrice: 0.17, inStock: true, onSale: true },
      { retailerId: 'quickstop', price: 6.49, unit: '32 oz', unitPrice: 0.20, inStock: true, onSale: false },
      { retailerId: 'megasave', price: 5.79, unit: '32 oz', unitPrice: 0.18, inStock: false, onSale: false },
    ],
  },
  {
    id: 'spaghetti-sauce-24oz',
    name: 'Spaghetti Sauce (24 oz)',
    category: 'Pantry',
    image: '🥫',
    offers: [
      { retailerId: 'freshmart', price: 3.49, unit: '24 oz', unitPrice: 0.15, inStock: true, onSale: false },
      { retailerId: 'valuegrocer', price: 2.99, unit: '24 oz', unitPrice: 0.12, inStock: true, onSale: false },
      { retailerId: 'quickstop', price: 3.79, unit: '24 oz', unitPrice: 0.16, inStock: true, onSale: false },
      { retailerId: 'megasave', price: 2.79, unit: '24 oz', unitPrice: 0.12, inStock: true, onSale: true },
    ],
  },
  {
    id: 'apples-gala-3lb',
    name: 'Gala Apples (3 lb bag)',
    category: 'Produce',
    image: '🍎',
    offers: [
      { retailerId: 'freshmart', price: 4.99, unit: '3 lb', unitPrice: 1.66, inStock: true, onSale: false },
      { retailerId: 'valuegrocer', price: 4.49, unit: '3 lb', unitPrice: 1.50, inStock: true, onSale: false },
      { retailerId: 'quickstop', price: 5.49, unit: '3 lb', unitPrice: 1.83, inStock: true, onSale: false },
      { retailerId: 'megasave', price: 3.99, unit: '3 lb', unitPrice: 1.33, inStock: true, onSale: true },
    ],
  },
  {
    id: 'butter-unsalted-1lb',
    name: 'Unsalted Butter (1 lb)',
    category: 'Dairy',
    image: '🧈',
    offers: [
      { retailerId: 'freshmart', price: 4.99, unit: '1 lb', unitPrice: 4.99, inStock: true, onSale: false },
      { retailerId: 'valuegrocer', price: 4.49, unit: '1 lb', unitPrice: 4.49, inStock: true, onSale: false },
      { retailerId: 'quickstop', price: 5.49, unit: '1 lb', unitPrice: 5.49, inStock: true, onSale: false },
      { retailerId: 'megasave', price: 4.29, unit: '1 lb', unitPrice: 4.29, inStock: true, onSale: true },
    ],
  },
  {
    id: 'orange-juice-64oz',
    name: 'Orange Juice (64 oz)',
    category: 'Beverages',
    image: '🍊',
    offers: [
      { retailerId: 'freshmart', price: 4.99, unit: '64 oz', unitPrice: 0.08, inStock: true, onSale: false },
      { retailerId: 'valuegrocer', price: 4.49, unit: '64 oz', unitPrice: 0.07, inStock: true, onSale: false },
      { retailerId: 'quickstop', price: 5.49, unit: '64 oz', unitPrice: 0.09, inStock: true, onSale: false },
      { retailerId: 'megasave', price: 3.99, unit: '64 oz', unitPrice: 0.06, inStock: true, onSale: true },
    ],
  },
  {
    id: 'peanut-butter-16oz',
    name: 'Peanut Butter (16 oz)',
    category: 'Pantry',
    image: '🥜',
    offers: [
      { retailerId: 'freshmart', price: 4.29, unit: '16 oz', unitPrice: 0.27, inStock: true, onSale: false },
      { retailerId: 'valuegrocer', price: 3.79, unit: '16 oz', unitPrice: 0.24, inStock: true, onSale: false },
      { retailerId: 'quickstop', price: 4.49, unit: '16 oz', unitPrice: 0.28, inStock: true, onSale: false },
      { retailerId: 'megasave', price: 3.49, unit: '16 oz', unitPrice: 0.22, inStock: true, onSale: true },
    ],
  },
  {
    id: 'chips-tortilla-13oz',
    name: 'Tortilla Chips (13 oz)',
    category: 'Snacks',
    image: '🌮',
    offers: [
      { retailerId: 'freshmart', price: 3.99, unit: '13 oz', unitPrice: 0.31, inStock: true, onSale: false },
      { retailerId: 'valuegrocer', price: 3.49, unit: '13 oz', unitPrice: 0.27, inStock: true, onSale: false },
      { retailerId: 'quickstop', price: 4.29, unit: '13 oz', unitPrice: 0.33, inStock: true, onSale: false },
      { retailerId: 'megasave', price: 2.99, unit: '13 oz', unitPrice: 0.23, inStock: true, onSale: true },
    ],
  },
];

export function getRetailer(id: string): Retailer | undefined {
  return RETAILERS.find((r) => r.id === id);
}
