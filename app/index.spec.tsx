import { fireEvent, render, screen } from '@testing-library/react-native';

import HomeScreen from './index';

jest.mock('expo-haptics', () => ({
  notificationAsync: jest.fn(),
  NotificationFeedbackType: { Warning: 0, Error: 1, Success: 2 },
}));

const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe('HomeScreen', () => {
  beforeEach(() => {
    mockPush.mockClear();
  });

  it('renders the wordmark and search input', () => {
    render(<HomeScreen />);
    expect(screen.getByText('Lazy Shopper')).toBeTruthy();
    expect(screen.getByTestId('search-input')).toBeTruthy();
  });

  it('shows a hint when submitting an empty query', () => {
    render(<HomeScreen />);
    fireEvent.press(screen.getByTestId('find-button'));
    expect(screen.getByTestId('empty-hint')).toBeTruthy();
  });

  it('shows no-match state for an unknown product', () => {
    render(<HomeScreen />);
    fireEvent.changeText(screen.getByTestId('search-input'), 'xyzzy nothing');
    fireEvent.press(screen.getByTestId('find-button'));
    expect(screen.getByTestId('no-match')).toBeTruthy();
  });

  it('shows ranked offers for a real product', () => {
    render(<HomeScreen />);
    fireEvent.changeText(screen.getByTestId('search-input'), 'creeper plush');
    fireEvent.press(screen.getByTestId('find-button'));
    expect(screen.getByTestId('insight-bar')).toBeTruthy();
    expect(screen.getByTestId('offer-target')).toBeTruthy();
  });

  it('the insight bar names the cheapest in-stock store', () => {
    render(<HomeScreen />);
    fireEvent.changeText(screen.getByTestId('search-input'), 'creeper plush');
    fireEvent.press(screen.getByTestId('find-button'));
    expect(screen.getByTestId('insight-bar').props.children.join('')).toContain(
      'Target'
    );
  });

  it('navigates to product detail when an offer is tapped', () => {
    render(<HomeScreen />);
    fireEvent.changeText(screen.getByTestId('search-input'), 'creeper plush');
    fireEvent.press(screen.getByTestId('find-button'));
    fireEvent.press(screen.getByTestId('offer-target'));
    expect(mockPush).toHaveBeenCalledWith(
      '/product/minecraft-creeper-plush-8in'
    );
  });

  it('clears the input via the clear button', () => {
    render(<HomeScreen />);
    const input = screen.getByTestId('search-input');
    fireEvent.changeText(input, 'creeper');
    fireEvent.press(screen.getByTestId('clear-button'));
    expect(screen.getByTestId('search-input').props.value).toBe('');
  });

  it('an example pill runs that search', () => {
    render(<HomeScreen />);
    fireEvent.changeText(screen.getByTestId('search-input'), 'xyzzy');
    fireEvent.press(screen.getByTestId('find-button'));
    fireEvent.press(screen.getByText('ender dragon'));
    expect(screen.getByTestId('insight-bar')).toBeTruthy();
  });
});
