import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/components/useColorScheme';
import { BasketProvider } from '@/contexts/BasketContext';
import { PreferencesProvider } from '@/contexts/PreferencesContext';
import { ListsProvider } from '@/contexts/ListsContext';
import { ScanProvider } from '@/contexts/ScanContext';
import { AlertsProvider } from '@/contexts/AlertsContext';
import { WeeklyRunProvider } from '@/contexts/WeeklyRunContext';

export { ErrorBoundary } from 'expo-router';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <PreferencesProvider>
        <ListsProvider>
          <BasketProvider>
            <ScanProvider>
              <AlertsProvider>
                <WeeklyRunProvider>
                  <Stack screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="(tabs)" />
                    <Stack.Screen name="product/[id]" options={{ headerShown: true, title: 'Product' }} />
                    <Stack.Screen name="preferences" options={{ headerShown: true, title: 'Preferences' }} />
                    <Stack.Screen name="alerts" options={{ headerShown: true, title: 'Alerts' }} />
                    <Stack.Screen name="run" options={{ headerShown: false, gestureEnabled: false }} />
                    <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
                  </Stack>
                </WeeklyRunProvider>
              </AlertsProvider>
            </ScanProvider>
          </BasketProvider>
        </ListsProvider>
      </PreferencesProvider>
    </ThemeProvider>
  );
}
