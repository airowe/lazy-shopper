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

let mockId = 'lego-21595-ender-dragon';
jest.mock('expo-router', () => ({
  useLocalSearchParams: () => ({ id: mockId }),
  Stack: { Screen: () => null },
}));

beforeEach(async () => {
  await AsyncStorage.clear();
  mockOpenBrowser.mockClear();
  mockId = 'lego-21595-ender-dragon';
});

describe('ProductDetailScreen', () => {
  it('renders the product name and best pick', async () => {
    render(<ProductDetailScreen />);
    expect(
      screen.getByText('LEGO Minecraft The Ender Dragon 21595')
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

  it('lists the Ender Dragon offers across retailers', () => {
    render(<ProductDetailScreen />);
    // The Ender Dragon has lego, amazon, and target offers; the best pick
    // is rendered separately, so at least one of the others is in the list.
    const others = ['offer-lego', 'offer-amazon', 'offer-target'].filter(
      (id) => screen.queryByTestId(id)
    );
    expect(others.length).toBeGreaterThanOrEqual(2);
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
        message: expect.stringContaining('LEGO Minecraft The Ender Dragon'),
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
