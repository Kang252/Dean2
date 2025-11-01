// App.tsx
import React from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import { KeyboardProvider } from 'react-native-keyboard-controller'; // 1. Import

export default function App() {
  return (
    // 2. Bọc toàn bộ AppNavigator bằng KeyboardProvider
    <KeyboardProvider>
      <AppNavigator />
    </KeyboardProvider>
  );
}