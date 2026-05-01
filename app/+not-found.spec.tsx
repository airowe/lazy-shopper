import { render, screen } from '@testing-library/react-native';
import NotFoundScreen from './+not-found';

jest.mock('expo-router', () => ({
  Stack: {
    Screen: () => null,
  },
  Link: ({ children, ...props }: any) => {
    const { Text: RNText, Pressable } = require('react-native');
    if (typeof children === 'function') {
      return children({ pressed: false });
    }
    return (
      <Pressable {...props}>
        {typeof children === 'string' ? <RNText>{children}</RNText> : children}
      </Pressable>
    );
  },
}));

jest.mock('@/components/Themed', () => {
  const { View: RNView, Text: RNText } = require('react-native');
  return {
    View: (props: any) => <RNView {...props} />,
    Text: (props: any) => <RNText {...props} />,
  };
});

describe('NotFoundScreen', () => {
  it('renders the not found title', () => {
    render(<NotFoundScreen />);
    expect(screen.getByText('Page Not Found')).toBeTruthy();
  });

  it('renders a descriptive subtitle', () => {
    render(<NotFoundScreen />);
    expect(
      screen.getByText(/The page you're looking for doesn't exist/)
    ).toBeTruthy();
  });

  it('renders a button to go back to search', () => {
    render(<NotFoundScreen />);
    expect(screen.getByText('Back to Search')).toBeTruthy();
  });

  it('renders the emoji', () => {
    render(<NotFoundScreen />);
    expect(screen.getByText('🔍')).toBeTruthy();
  });
});
