module.exports = {
  preset: 'jest-expo',
  transformIgnorePatterns: [
    'node_modules/(?!(?:.pnpm/)?' +
    '((jest-)?react-native' +
    '|@react-native(-community)?)' +
    '|expo(nent)?' +
    '|@expo(nent)?/.*' +
    '|@expo-google-fonts/.*' +
    '|react-navigation' +
    '|@react-navigation/.*' +
    '|@sentry/react-native' +
    '|native-base' +
    '|react-native-svg' +
    '|react-native-reanimated' +
    '|react-native-safe-area-context' +
    '|react-native-screens' +
    '|react-native-worklets' +
    ')',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  
  collectCoverageFrom: [
    'lib/**/*.{ts,tsx}',
    'components/**/*.{ts,tsx}',
    'app/**/*.{ts,tsx}',
    '!app/+html.tsx',
    '!app/_layout.tsx',
    '!components/useClientOnlyValue.ts',
    '!components/useClientOnlyValue.web.ts',
    '!components/useColorScheme.ts',
    '!components/useColorScheme.web.ts',
    '!components/EditScreenInfo.tsx',
    '!components/ExternalLink.tsx',
    '!components/StyledText.tsx',
    '!components/Themed.tsx',
    '!app/modal.tsx',
  ],
};
