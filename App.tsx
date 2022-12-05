import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { setStatusBarBackgroundColor } from 'expo-status-bar';
import { NativeBaseProvider } from 'native-base';
import { useEffect } from 'react';
import * as Sentry from 'sentry-expo';

import { HomePage, SearchPage, PlayerPage } from './pages';

const Stack = createNativeStackNavigator();

Sentry.init({
  dsn: 'https://2a97b2858eca4a549dc242960c7b67f8@o4504251402616832.ingest.sentry.io/4504251406745600',
  enableInExpoDevelopment: true,
  debug: false,
});

export default function App() {
  useEffect(() => {
    setStatusBarBackgroundColor('#0891b2', false);
  }, []);

  return (
    <NativeBaseProvider>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerStyle: { backgroundColor: '#0891b2' },
            headerTintColor: '#FFFFFF',
            headerTitleStyle: { fontSize: 16 },
          }}>
          <Stack.Screen name="HomePage" component={HomePage} options={{ headerShown: false }} />
          <Stack.Screen name="SearchPage" component={SearchPage} options={{ title: '发现' }} />
          <Stack.Screen name="PlayerPage" component={PlayerPage} options={{ headerShown: false }} />
        </Stack.Navigator>
      </NavigationContainer>
    </NativeBaseProvider>
  );
}
