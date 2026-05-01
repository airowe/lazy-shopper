import { render, screen } from '@testing-library/react-native';
import OfferCard from './OfferCard';
import type { RankedOffer } from '@/lib/compare';
import type { Retailer, ProductOffer } from '@/lib/data';

const mockRetailer: Retailer = {
  id: 'freshmart',
  name: 'FreshMart',
  logo: '🛒',
  deliveryFee: 4.99,
  freeDeliveryThreshold: 35,
  membershipDiscount: 0.05,
  membershipName: 'FreshPass',
  pickupAvailable: true,
};

const mockOffer: ProductOffer = {
  retailerId: 'freshmart',
  price: 4.29,
  unit: '1 gal',
  unitPrice: 4.29,
  inStock: true,
  onSale: false,
};

const makeRankedOffer = (overrides: Partial<RankedOffer> = {}): RankedOffer => ({
  retailer: mockRetailer,
  offer: mockOffer,
  effectivePrice: 4.29,
  savings: 0,
  rank: 1,
  ...overrides,
});

describe('OfferCard', () => {
  it('renders retailer name and logo', () => {
    render(<OfferCard offer={makeRankedOffer()} isBest={false} useMembership={false} />);
    expect(screen.getByText('FreshMart')).toBeTruthy();
    expect(screen.getByText('🛒')).toBeTruthy();
  });

  it('renders the effective price', () => {
    render(<OfferCard offer={makeRankedOffer()} isBest={false} useMembership={false} />);
    expect(screen.getByText('$4.29')).toBeTruthy();
  });

  it('renders the unit label', () => {
    render(<OfferCard offer={makeRankedOffer()} isBest={false} useMembership={false} />);
    expect(screen.getByText('1 gal')).toBeTruthy();
  });

  it('shows Best Value badge when isBest is true', () => {
    render(<OfferCard offer={makeRankedOffer()} isBest={true} useMembership={false} />);
    expect(screen.getByText('Best Value')).toBeTruthy();
  });

  it('does not show Best Value badge when isBest is false', () => {
    render(<OfferCard offer={makeRankedOffer()} isBest={false} useMembership={false} />);
    expect(screen.queryByText('Best Value')).toBeNull();
  });

  it('shows SALE tag when offer is on sale', () => {
    const onSaleOffer = { ...mockOffer, onSale: true };
    render(
      <OfferCard
        offer={makeRankedOffer({ offer: onSaleOffer })}
        isBest={false}
        useMembership={false}
      />
    );
    expect(screen.getByText('SALE')).toBeTruthy();
  });

  it('does not show SALE tag when not on sale', () => {
    render(<OfferCard offer={makeRankedOffer()} isBest={false} useMembership={false} />);
    expect(screen.queryByText('SALE')).toBeNull();
  });

  it('shows membership pricing when useMembership is true and retailer has discount', () => {
    render(<OfferCard offer={makeRankedOffer()} isBest={false} useMembership={true} />);
    expect(screen.getByText(/FreshPass/)).toBeTruthy();
  });

  it('does not show membership pricing when useMembership is false', () => {
    render(<OfferCard offer={makeRankedOffer()} isBest={false} useMembership={false} />);
    expect(screen.queryByText(/FreshPass/)).toBeNull();
  });

  it('does not show membership pricing when retailer has no discount', () => {
    const noDiscountRetailer = { ...mockRetailer, membershipDiscount: 0, membershipName: '' };
    render(
      <OfferCard
        offer={makeRankedOffer({ retailer: noDiscountRetailer })}
        isBest={false}
        useMembership={true}
      />
    );
    // No member name text should appear
    expect(screen.queryByText('FreshPass')).toBeNull();
    // Price text still renders (at least 2 dollar amounts: price + delivery)
    const dollarNodes = screen.getAllByText(/\$/);
    expect(dollarNodes.length).toBeGreaterThanOrEqual(2);
  });

  it('shows delivery fee', () => {
    render(<OfferCard offer={makeRankedOffer()} isBest={false} useMembership={false} />);
    expect(screen.getByText('$4.99')).toBeTruthy();
  });

  it('shows "Free" when delivery fee is 0', () => {
    const freeDeliveryRetailer = { ...mockRetailer, deliveryFee: 0 };
    render(
      <OfferCard
        offer={makeRankedOffer({ retailer: freeDeliveryRetailer })}
        isBest={false}
        useMembership={false}
      />
    );
    expect(screen.getByText('Free')).toBeTruthy();
  });

  it('shows pickup availability', () => {
    render(<OfferCard offer={makeRankedOffer()} isBest={false} useMembership={false} />);
    expect(screen.getByText('Available')).toBeTruthy();
  });

  it('shows savings when savings > 0', () => {
    render(
      <OfferCard
        offer={makeRankedOffer({ savings: 0.5, rank: 2 })}
        isBest={false}
        useMembership={false}
      />
    );
    expect(screen.getByText('Savings')).toBeTruthy();
    expect(screen.getByText('+$0.50 vs best')).toBeTruthy();
  });

  it('does not show savings when savings is 0', () => {
    render(<OfferCard offer={makeRankedOffer({ savings: 0 })} isBest={false} useMembership={false} />);
    expect(screen.queryByText('Savings')).toBeNull();
  });
});
