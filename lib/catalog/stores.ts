import type { Store } from './types';

export const STORES: Store[] = [
  {
    id: 'amazon',
    name: 'Amazon',
    logoUrl: 'https://logo.clearbit.com/amazon.com',
    rating: 4.5,
    supportsPickup: false,
    supportsDelivery: true,
    membershipName: 'Prime',
  },
  {
    id: 'target',
    name: 'Target',
    logoUrl: 'https://logo.clearbit.com/target.com',
    rating: 4.6,
    supportsPickup: true,
    supportsDelivery: true,
    membershipName: 'Target Circle 360',
  },
  {
    id: 'walmart',
    name: 'Walmart',
    logoUrl: 'https://logo.clearbit.com/walmart.com',
    rating: 4.3,
    supportsPickup: true,
    supportsDelivery: true,
    membershipName: 'Walmart+',
  },
  {
    id: 'lego',
    name: 'LEGO Shop',
    logoUrl: 'https://logo.clearbit.com/lego.com',
    rating: 4.8,
    supportsPickup: false,
    supportsDelivery: true,
    membershipName: 'LEGO Insiders',
  },
  {
    id: 'bestbuy',
    name: 'Best Buy',
    logoUrl: 'https://logo.clearbit.com/bestbuy.com',
    rating: 4.4,
    supportsPickup: true,
    supportsDelivery: true,
  },
  {
    id: 'gamestop',
    name: 'GameStop',
    logoUrl: 'https://logo.clearbit.com/gamestop.com',
    rating: 4.0,
    supportsPickup: true,
    supportsDelivery: true,
    membershipName: 'GameStop Pro',
  },
];

export const getStore = (id: string): Store | undefined =>
  STORES.find((s) => s.id === id);
