import type { Store } from './types';

export const STORES: Store[] = [
  {
    id: 'amazon',
    name: 'Amazon',
    brandColor: '#FF9900',
    rating: 4.5,
    supportsPickup: false,
    supportsDelivery: true,
    membershipName: 'Prime',
  },
  {
    id: 'target',
    name: 'Target',
    brandColor: '#CC0000',
    rating: 4.6,
    supportsPickup: true,
    supportsDelivery: true,
    membershipName: 'Target Circle 360',
  },
  {
    id: 'walmart',
    name: 'Walmart',
    brandColor: '#0071CE',
    rating: 4.3,
    supportsPickup: true,
    supportsDelivery: true,
    membershipName: 'Walmart+',
  },
  {
    id: 'lego',
    name: 'LEGO Shop',
    brandColor: '#D01012',
    rating: 4.8,
    supportsPickup: false,
    supportsDelivery: true,
    membershipName: 'LEGO Insiders',
  },
  {
    id: 'bestbuy',
    name: 'Best Buy',
    brandColor: '#0046BE',
    rating: 4.4,
    supportsPickup: true,
    supportsDelivery: true,
  },
  {
    id: 'gamestop',
    name: 'GameStop',
    brandColor: '#EC1D24',
    rating: 4.0,
    supportsPickup: true,
    supportsDelivery: true,
    membershipName: 'GameStop Pro',
  },
];

export const getStore = (id: string): Store | undefined =>
  STORES.find((s) => s.id === id);
