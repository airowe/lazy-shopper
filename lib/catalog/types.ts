export type ProductCategory = 'minecraft' | 'lego' | 'beyblade';

export type ProductSubcategory =
  | 'Lego Set'
  | 'Plush'
  | 'Figure'
  | 'Apparel'
  | 'Game'
  | 'Book'
  | 'Battle Set'
  | 'Launcher'
  | 'Top';

export type StoreId =
  | 'amazon'
  | 'target'
  | 'walmart'
  | 'lego'
  | 'bestbuy'
  | 'gamestop';

export type OfferSource =
  | 'manual'
  | 'amazon-pa'
  | 'target-redsky'
  | 'walmart-open'
  | 'scrape';

export type Product = {
  id: string;
  name: string;
  category: ProductCategory;
  subcategory: ProductSubcategory;
  brand?: string;
  imageUrl: string;
  ageRange?: { min: number; max?: number };
  pieceCount?: number;
  releaseYear?: number;
  discontinued?: boolean;
  // Approximate manufacturer list price, used by the price scraper as a
  // noise-rejection reference. Optional — absent means a wide band.
  rrp?: number;
  identifiers: {
    upc?: string;
    asin?: string;
    legoSetNumber?: string;
    targetTcin?: string;
    walmartItemId?: string;
  };
  // Verified full retailer product-page URLs. The price scraper crawls
  // these directly — retailer URLs need a slug segment that can't be
  // reconstructed from an ID alone. The Amazon offer is derived from
  // identifiers.asin; this is for additional retailers.
  retailerUrls?: Partial<Record<StoreId, string>>;
};

export type Store = {
  id: StoreId;
  name: string;
  brandColor: string;
  rating: number;
  supportsPickup: boolean;
  supportsDelivery: boolean;
  membershipName?: string;
};

export type UnitPrice = {
  value: number;
  unit: string;
};

export type Offer = {
  productId: string;
  storeId: StoreId;
  price: number;
  currency: 'USD';
  url: string;
  inStock: boolean;
  shippingDays?: { min: number; max: number };
  freeShippingThreshold?: number;
  membershipPrice?: number;
  unitPrice?: UnitPrice;
  capturedAt: string;
  source: OfferSource;
};
