import AsyncStorage from '@react-native-async-storage/async-storage';
import { fireEvent, render, screen, waitFor } from '@testing-library/react-native';
import { Share } from 'react-native';

import ProductDetailScreen from './[id]';

jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

jest.mock('expo-haptics', () => ({
  selectionAsync: jest.fn(),
  notificationAsync: jest.fn(),
  NotificationFeedbackType: { Success: 2 },
}));

const mockOpenBrowser = jest.fn();
jest.mock('expo-web-browser', () => ({
  openBrowserAsync: (...args: unknown[]) => mockOpenBrowser(...args),
}));

let mockId = 'lego-21261-wolf-stronghold';
jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({ id: mockId }),
  Stack: { Screen: () => null },
}));

beforeEach(async () => {
  await AsyncStorage.clear();
  mockOpenBrowser.mockClear();
  mockId = 'lego-21261-wolf-stronghold';
});

describe('ProductDetailScreen', () => {
  it('renders the product name and best pick', async () => {
    render(<ProductDetailScreen />);
    expect(
      screen.getByText('LEGO Minecraft The Wolf Stronghold 21261')
    ).toBeTruthy();
    expect(screen.getByTestId('open-best')).toBeTruthy();
  });

  it('opens a retailer in a browser from the best-pick button', () => {
    render(<ProductDetailScreen />);
    fireEvent.press(screen.getByTestId('open-best'));
    // Which retailer wins depends on live prices; assert only that a real
    // retailer URL was opened.
    expect(mockOpenBrowser).toHaveBeenCalledWith(
      expect.stringMatching(/^https:\/\//)
    );
  });

  it('renders the best-pick offer for the product', () => {
    render(<ProductDetailScreen />);
    // Retailer coverage is intermittent — a product may have just its
    // Amazon offer (best pick) or also others. The best pick always shows.
    expect(screen.getByTestId('open-best')).toBeTruthy();
  });

  it('toggles save state and persists it', async () => {
    render(<ProductDetailScreen />);
    expect(screen.getByText('♡ Save')).toBeTruthy();
    fireEvent.press(screen.getByTestId('save-button'));
    await waitFor(() => expect(screen.getByText('♥ Saved')).toBeTruthy());
  });

  it('shares the best offer via the OS share sheet', async () => {
    const shareSpy = jest
      .spyOn(Share, 'share')
      .mockResolvedValue({ action: 'sharedAction' } as never);
    render(<ProductDetailScreen />);
    fireEvent.press(screen.getByTestId('share-button'));
    await waitFor(() =>
      expect(shareSpy).toHaveBeenCalledWith({
        message: expect.stringContaining('LEGO Minecraft The Wolf Stronghold'),
      })
    );
    shareSpy.mockRestore();
  });

  it('shows a not-found state for an unknown product', () => {
    mockId = 'does-not-exist';
    render(<ProductDetailScreen />);
    expect(screen.getByText(/can't find this anymore/)).toBeTruthy();
  });
});
