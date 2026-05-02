import { getRetailer, PRODUCTS, RETAILERS, type Product } from './data';

export type BasketItem = { productId: string; quantity: number };

export type OptimizedItem = {
  productId: string;
  name: string;
  image: string;
  basePrice: number;
  effectivePrice: number;
  quantity: number;
  lineTotal: number;
};

export type StoreAllocation = {
  retailerId: string;
  retailerName: string;
  retailerLogo: string;
  items: OptimizedItem[];
  subtotal: number;
  deliveryFee: number;
  freeDeliveryThreshold: number;
  total: number;
  itemCount: number;
};

export type OptimizationOptions = {
  maxStores?: number;
  useMembership?: boolean;
  preferPickup?: boolean;
  includedStores?: string[];
};

export type OptimizationResult = {
  allocations: StoreAllocation[];
  totalCost: number;
  singleStoreBaseline: number;
  mostExpensiveStoreAllocation: number;
  totalSavings: number;
  totalSavingsPercent: number;
  storesUsed: number;
};

type AssignedItem = {
  basketItem: BasketItem;
  retailerId: string;
  product: Product;
  price: number;
  effectivePrice: number;
};

function priceForStore(
  product: Product,
  storeId: string,
  useMembership: boolean
): { price: number; effectivePrice: number } | null {
  const offer = product.offers.find(
    (o) => o.retailerId === storeId && o.inStock
  );
  if (!offer) return null;

  const retailer = getRetailer(storeId);
  if (!retailer) return null;

  const discount = useMembership ? retailer.membershipDiscount : 0;
  const effectivePrice = Math.round(offer.price * (1 - discount) * 100) / 100;

  return { price: offer.price, effectivePrice };
}

export function findCheapestStore(
  productId: string,
  stores: string[],
  useMembership: boolean
): { retailerId: string; price: number; effectivePrice: number } | null {
  const product = PRODUCTS.find((p) => p.id === productId);
  if (!product) return null;

  const storeSet = new Set(stores);
  const validOffers = product.offers.filter(
    (o) => storeSet.has(o.retailerId) && o.inStock
  );

  if (validOffers.length === 0) return null;

  let bestOffer = validOffers[0];
  let bestEffectivePrice = Infinity;

  for (const offer of validOffers) {
    const retailer = getRetailer(offer.retailerId);
    if (!retailer) continue;

    const discount = useMembership ? retailer.membershipDiscount : 0;
    const effectivePrice =
      Math.round(offer.price * (1 - discount) * 100) / 100;

    if (effectivePrice < bestEffectivePrice) {
      bestEffectivePrice = effectivePrice;
      bestOffer = offer;
    }
  }

  return {
    retailerId: bestOffer.retailerId,
    price: bestOffer.price,
    effectivePrice: bestEffectivePrice,
  };
}

function computeStoreAllocation(
  retailerId: string,
  assignedItems: AssignedItem[],
  preferPickup: boolean
): StoreAllocation {
  const retailer = getRetailer(retailerId)!;

  const optimizedItems: OptimizedItem[] = assignedItems.map((a) => ({
    productId: a.basketItem.productId,
    name: a.product.name,
    image: a.product.image,
    basePrice: a.price,
    effectivePrice: a.effectivePrice,
    quantity: a.basketItem.quantity,
    lineTotal:
      Math.round(a.effectivePrice * a.basketItem.quantity * 100) / 100,
  }));

  const subtotal =
    Math.round(
      optimizedItems.reduce((sum, i) => sum + i.lineTotal, 0) * 100
    ) / 100;

  const deliveryFee =
    preferPickup || subtotal >= retailer.freeDeliveryThreshold
      ? 0
      : retailer.deliveryFee;

  const total = Math.round((subtotal + deliveryFee) * 100) / 100;
  const itemCount = assignedItems.reduce(
    (sum, a) => sum + a.basketItem.quantity,
    0
  );

  return {
    retailerId,
    retailerName: retailer.name,
    retailerLogo: retailer.logo,
    items: optimizedItems,
    subtotal,
    deliveryFee,
    freeDeliveryThreshold: retailer.freeDeliveryThreshold,
    total,
    itemCount,
  };
}

function calculateSingleStoreTotal(
  items: BasketItem[],
  storeIds: string[],
  useMembership: boolean,
  preferPickup: boolean,
  mode: 'min' | 'max'
): number {
  if (items.length === 0) return 0;

  let result = mode === 'min' ? Infinity : -Infinity;

  for (const storeId of storeIds) {
    const retailer = getRetailer(storeId);
    if (!retailer) continue;

    let subtotal = 0;
    let allFound = true;

    for (const item of items) {
      const product = PRODUCTS.find((p) => p.id === item.productId);
      if (!product) {
        allFound = false;
        break;
      }

      const prices = priceForStore(product, storeId, useMembership);
      if (!prices) {
        allFound = false;
        break;
      }

      subtotal +=
        Math.round(prices.effectivePrice * item.quantity * 100) / 100;
    }

    if (!allFound) continue;

    subtotal = Math.round(subtotal * 100) / 100;

    const deliveryFee =
      preferPickup || subtotal >= retailer.freeDeliveryThreshold
        ? 0
        : retailer.deliveryFee;

    const total = Math.round((subtotal + deliveryFee) * 100) / 100;

    if (mode === 'min' && total < result) result = total;
    if (mode === 'max' && total > result) result = total;
  }

  return result === Infinity || result === -Infinity ? 0 : result;
}

export function optimizeBasket(
  items: BasketItem[],
  options: OptimizationOptions = {}
): OptimizationResult {
  const {
    maxStores = Infinity,
    useMembership = false,
    preferPickup = false,
    includedStores,
  } = options;

  const storeIds = includedStores ?? RETAILERS.map((r) => r.id);

  const assignments: AssignedItem[] = [];

  for (const item of items) {
    const product = PRODUCTS.find((p) => p.id === item.productId);
    if (!product) continue;

    const cheapest = findCheapestStore(
      item.productId,
      storeIds,
      useMembership
    );
    if (!cheapest) continue;

    assignments.push({
      basketItem: item,
      retailerId: cheapest.retailerId,
      product,
      price: cheapest.price,
      effectivePrice: cheapest.effectivePrice,
    });
  }

  const allocationMap = new Map<string, AssignedItem[]>();
  for (const a of assignments) {
    const list = allocationMap.get(a.retailerId);
    if (list) {
      list.push(a);
    } else {
      allocationMap.set(a.retailerId, [a]);
    }
  }

  const storeIdsUsed = [...allocationMap.keys()];

  if (storeIdsUsed.length > maxStores) {
    const storeCounts = storeIdsUsed.map((sid) => ({
      id: sid,
      count: allocationMap.get(sid)!.length,
    }));
    storeCounts.sort((a, b) => b.count - a.count);

    const keptIds = new Set(
      storeCounts.slice(0, maxStores).map((s) => s.id)
    );
    const removedIds = storeCounts.slice(maxStores).map((s) => s.id);

    for (const removedId of removedIds) {
      const itemsToMove = allocationMap.get(removedId)!;

      for (const assigned of itemsToMove) {
        let bestStore: string | null = null;
        let bestPrice = Infinity;

        for (const keptId of keptIds) {
          const prices = priceForStore(
            assigned.product,
            keptId,
            useMembership
          );
          if (!prices) continue;

          if (prices.effectivePrice < bestPrice) {
            bestPrice = prices.effectivePrice;
            bestStore = keptId;
          }
        }

        if (bestStore) {
          assigned.retailerId = bestStore;
          assigned.price =
            assigned.product.offers.find(
              (o) => o.retailerId === bestStore
            )!.price;
          assigned.effectivePrice = bestPrice;
          allocationMap.get(bestStore)!.push(assigned);
        }
      }

      allocationMap.delete(removedId);
    }
  }

  const allocations: StoreAllocation[] = [];

  for (const [retailerId, assignedItems] of allocationMap) {
    allocations.push(
      computeStoreAllocation(retailerId, assignedItems, preferPickup)
    );
  }

  allocations.sort((a, b) => a.retailerName.localeCompare(b.retailerName));

  const totalCost =
    Math.round(
      allocations.reduce((sum, a) => sum + a.total, 0) * 100
    ) / 100;

  const singleStoreBaseline = calculateSingleStoreTotal(
    items,
    storeIds,
    useMembership,
    preferPickup,
    'min'
  );

  const mostExpensiveStoreAllocation = calculateSingleStoreTotal(
    items,
    storeIds,
    useMembership,
    preferPickup,
    'max'
  );

  const totalSavings =
    Math.round((singleStoreBaseline - totalCost) * 100) / 100;

  const totalSavingsPercent =
    singleStoreBaseline > 0
      ? Math.round((totalSavings / singleStoreBaseline) * 10000) / 100
      : 0;

  return {
    allocations,
    totalCost,
    singleStoreBaseline,
    mostExpensiveStoreAllocation,
    totalSavings,
    totalSavingsPercent,
    storesUsed: allocations.length,
  };
}
