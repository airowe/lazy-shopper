import { render, screen, fireEvent, act } from '@testing-library/react-native';
import HomeScreen from './(tabs)/index';

jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(() => Promise.resolve()),
  getItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve()),
}));

jest.mock('expo-haptics', () => ({
  notificationAsync: jest.fn(async () => {}),
  impactAsync: jest.fn(async () => {}),
  NotificationFeedbackType: {
    Success: 'success',
    Warning: 'warning',
    Error: 'error',
  },
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy',
  },
}));

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), replace: jest.fn() }),
  Stack: { Screen: () => null },
  Link: ({ children }: any) => children,
}));

jest.mock('@/contexts/WeeklyRunContext', () => ({
  useWeeklyRun: () => ({
    run: { isActive: false },
    suggestRun: false,
    startRun: jest.fn(),
    dismissSuggestion: jest.fn(),
    cancelRun: jest.fn(),
    advanceStep: jest.fn(),
    toggleItemChecked: jest.fn(),
    completeRun: jest.fn(),
    hasRecurringList: false,
  }),
  WeeklyRunProvider: ({ children }: any) => children,
}));

jest.mock('@/components/Themed', () => {
  const { View: RNView, Text: RNText } = require('react-native');
  return {
    View: (props: any) => <RNView {...props} />,
    Text: (props: any) => <RNText {...props} />,
  };
});

describe('HomeScreen', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('renders the hero section with title and subtitle', () => {
    render(<HomeScreen />);
    expect(screen.getByText('Lazy Shopper')).toBeTruthy();
    expect(screen.getByText(/Compare grocery prices/)).toBeTruthy();
  });

  it('renders the search input', () => {
    render(<HomeScreen />);
    expect(screen.getByPlaceholderText('Search a product...')).toBeTruthy();
  });

  it('renders the Compare button', () => {
    render(<HomeScreen />);
    expect(screen.getByText('Compare')).toBeTruthy();
  });

  it('renders membership pricing toggle', () => {
    render(<HomeScreen />);
    expect(screen.getByText('Apply membership pricing')).toBeTruthy();
  });

  it('shows suggestion chips when no search has been made', () => {
    render(<HomeScreen />);
    expect(screen.getByText('Try searching:')).toBeTruthy();
    expect(screen.getByText('Milk')).toBeTruthy();
    expect(screen.getByText('Eggs')).toBeTruthy();
    expect(screen.getByText('Bread')).toBeTruthy();
    expect(screen.getByText('Chicken')).toBeTruthy();
    expect(screen.getByText('Bananas')).toBeTruthy();
    expect(screen.getByText('Coffee')).toBeTruthy();
  });

  it('clicking a suggestion chip fills the search input', () => {
    render(<HomeScreen />);
    fireEvent.press(screen.getByText('Milk'));
    const input = screen.getByPlaceholderText('Search a product...');
    expect(input.props.value).toBe('Milk');
  });

  it('shows error when searching with empty input', () => {
    render(<HomeScreen />);
    fireEvent.press(screen.getByText('Compare'));
    expect(
      screen.getByText('Please enter a product name to compare prices.')
    ).toBeTruthy();
  });

  it('shows no results message for unknown product', () => {
    render(<HomeScreen />);
    const input = screen.getByPlaceholderText('Search a product...');
    fireEvent.changeText(input, 'xyznonexistent');
    fireEvent.press(screen.getByText('Compare'));

    act(() => {
      jest.advanceTimersByTime(600);
    });

    expect(
      screen.getByText(/No products found/)
    ).toBeTruthy();
  });

  it('shows results for a valid product search', () => {
    render(<HomeScreen />);
    const input = screen.getByPlaceholderText('Search a product...');
    fireEvent.changeText(input, 'milk');
    fireEvent.press(screen.getByText('Compare'));

    act(() => {
      jest.advanceTimersByTime(600);
    });

    expect(screen.getByText(/product found/)).toBeTruthy();
    expect(screen.getByText('BEST PICK')).toBeTruthy();
  });

  it('toggles membership pricing when checkbox is pressed', () => {
    render(<HomeScreen />);
    const toggle = screen.getByText('Apply membership pricing');
    fireEvent.press(toggle);

    const input = screen.getByPlaceholderText('Search a product...');
    fireEvent.changeText(input, 'milk');
    fireEvent.press(screen.getByText('Compare'));

    act(() => {
      jest.advanceTimersByTime(600);
    });

    expect(screen.getByText(/product found/)).toBeTruthy();
  });

  it('removes error when user starts typing after an error', () => {
    render(<HomeScreen />);
    fireEvent.press(screen.getByText('Compare'));
    expect(
      screen.getByText('Please enter a product name to compare prices.')
    ).toBeTruthy();

    const input = screen.getByPlaceholderText('Search a product...');
    fireEvent.changeText(input, 'm');

    expect(
      screen.queryByText('Please enter a product name to compare prices.')
    ).toBeNull();
  });

  it('renders multiple product groups when search matches many', () => {
    render(<HomeScreen />);
    const input = screen.getByPlaceholderText('Search a product...');
    fireEvent.changeText(input, 'dairy');
    fireEvent.press(screen.getByText('Compare'));

    act(() => {
      jest.advanceTimersByTime(600);
    });

    // Dairy category has multiple products
    const countText = screen.getByText(/\d+ products found/);
    const count = parseInt(countText.props.children.toString(), 10);
    expect(count).toBeGreaterThan(1);
  });
});
