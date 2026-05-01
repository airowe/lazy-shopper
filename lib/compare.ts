import { getRetailer, PRODUCTS, type Product, type ProductOffer, type Retailer } from './data';

export type RankedOffer = {
  retailer: Retailer;
  offer: ProductOffer;
  effectivePrice: number;
  savings: number;
  rank: number;
};

export type ComparisonResult = {
  product: Product;
  offers: RankedOffer[];
  bestPick: RankedOffer | null;
};

export function searchProducts(query: string): Product[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];

  return PRODUCTS.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q)
  );
}

function calculateEffectivePrice(
  price: number,
  retailer: Retailer,
  useMembership: boolean
): number {
  const discount = useMembership ? retailer.membershipDiscount : 0;
  return price * (1 - discount);
}

export function compareOffers(
  product: Product,
  useMembership: boolean = false
): ComparisonResult {
  const offersWithRetailers: RankedOffer[] = product.offers
    .map((offer) => {
      const retailer = getRetailer(offer.retailerId);
      if (!retailer) return null;

      const effectivePrice = calculateEffectivePrice(
        offer.price,
        retailer,
        useMembership
      );

      return {
        retailer,
        offer,
        effectivePrice: Math.round(effectivePrice * 100) / 100,
        savings: 0,
        rank: 0,
      } as RankedOffer;
    })
    .filter((o): o is RankedOffer => o !== null)
    .sort((a, b) => {
      if (a.offer.inStock !== b.offer.inStock) {
        return a.offer.inStock ? -1 : 1;
      }
      return a.effectivePrice - b.effectivePrice;
    });

  const bestPrice =
    offersWithRetailers.length > 0
      ? offersWithRetailers[0].effectivePrice
      : 0;

  return {
    product,
    offers: offersWithRetailers.map((o, i) => ({
      ...o,
      savings:
        i === 0
          ? 0
          : Math.round((o.effectivePrice - bestPrice) * 100) / 100,
      rank: i + 1,
    })),
    bestPick: offersWithRetailers.length > 0 ? { ...offersWithRetailers[0], savings: 0, rank: 1 } : null,
  };
}
