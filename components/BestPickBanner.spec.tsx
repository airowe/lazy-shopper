import { render, screen } from '@testing-library/react-native';
import BestPickBanner from './BestPickBanner';
import type { RankedOffer } from '@/lib/compare';
import type { Retailer, ProductOffer } from '@/lib/data';

const mockRetailer: Retailer = {
  id: 'megasave',
  name: 'MegaSave',
  logo: '🏬',
  deliveryFee: 5.49,
  freeDeliveryThreshold: 40,
  membershipDiscount: 0.03,
  membershipName: 'MegaRewards',
  pickupAvailable: true,
};

const mockOffer: ProductOffer = {
  retailerId: 'megasave',
  price: 4.79,
  unit: '12 ct',
  unitPrice: 0.40,
  inStock: true,
  onSale: true,
};

const bestPick: RankedOffer = {
  retailer: mockRetailer,
  offer: mockOffer,
  effectivePrice: 4.79,
  savings: 0,
  rank: 1,
};

describe('BestPickBanner', () => {
  it('renders the BEST PICK badge', () => {
    render(<BestPickBanner bestPick={bestPick} useMembership={false} />);
    expect(screen.getByText('BEST PICK')).toBeTruthy();
  });

  it('renders retailer name and logo', () => {
    render(<BestPickBanner bestPick={bestPick} useMembership={false} />);
    expect(screen.getByText('MegaSave')).toBeTruthy();
    expect(screen.getByText('🏬')).toBeTruthy();
  });

  it('renders effective price and unit', () => {
    render(<BestPickBanner bestPick={bestPick} useMembership={false} />);
    expect(screen.getByText(/\$4\.79/)).toBeTruthy();
    expect(screen.getByText(/12 ct/)).toBeTruthy();
  });

  it('shows "On sale" reason when offer is on sale', () => {
    render(<BestPickBanner bestPick={bestPick} useMembership={false} />);
    expect(screen.getByText(/On sale/)).toBeTruthy();
  });

  it('shows "Lowest price" when not on sale', () => {
    const notOnSale = {
      ...bestPick,
      offer: { ...bestPick.offer, onSale: false },
    };
    render(<BestPickBanner bestPick={notOnSale} useMembership={false} />);
    expect(screen.getByText(/Lowest price/)).toBeTruthy();
  });

  it('shows pickup available reason', () => {
    render(<BestPickBanner bestPick={bestPick} useMembership={false} />);
    expect(screen.getByText(/Pickup available/)).toBeTruthy();
  });

  it('does not show pickup reason when not available', () => {
    const noPickup = {
      ...bestPick,
      retailer: { ...bestPick.retailer, pickupAvailable: false },
    };
    render(<BestPickBanner bestPick={noPickup} useMembership={false} />);
    expect(screen.queryByText(/Pickup available/)).toBeNull();
  });

  it('shows membership discount reason when useMembership is true', () => {
    render(<BestPickBanner bestPick={bestPick} useMembership={true} />);
    expect(screen.getByText(/MegaRewards discount/)).toBeTruthy();
  });

  it('does not show membership discount when useMembership is false', () => {
    render(<BestPickBanner bestPick={bestPick} useMembership={false} />);
    expect(screen.queryByText(/MegaRewards discount/)).toBeNull();
  });

  it('does not show membership discount when retailer has no discount', () => {
    const noDiscount = {
      ...bestPick,
      retailer: { ...bestPick.retailer, membershipDiscount: 0, membershipName: '' },
    };
    render(<BestPickBanner bestPick={noDiscount} useMembership={true} />);
    expect(screen.queryByText(/discount/)).toBeNull();
  });
});
