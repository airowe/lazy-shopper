import AsyncStorage from '@react-native-async-storage/async-storage';
import { render, screen, waitFor } from '@testing-library/react-native';

import { WishlistSheet } from './WishlistSheet';
import { addToWishlist } from '@/lib/wishlist/storage';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('WishlistSheet', () => {
  it('shows the empty state when nothing is saved', async () => {
    render(<WishlistSheet visible onClose={() => {}} />);
    await waitFor(() =>
      expect(screen.getByTestId('wishlist-empty')).toBeTruthy()
    );
  });

  it('lists a saved product', async () => {
    await addToWishlist('minecraft-creeper-plush-8in', 25);
    render(<WishlistSheet visible onClose={() => {}} />);
    await waitFor(() =>
      expect(
        screen.getByTestId('wishlist-row-minecraft-creeper-plush-8in')
      ).toBeTruthy()
    );
  });

  it('shows a price-drop note when the price fell since saving', async () => {
    // saved at $25; current best in-stock is $19.99 (Target)
    await addToWishlist('minecraft-creeper-plush-8in', 25);
    render(<WishlistSheet visible onClose={() => {}} />);
    await waitFor(() =>
      expect(screen.getByText(/cheaper than when you saved it/)).toBeTruthy()
    );
  });

  it('renders nothing visible when closed', () => {
    render(<WishlistSheet visible={false} onClose={() => {}} />);
    expect(screen.queryByTestId('wishlist-empty')).toBeNull();
  });
});
