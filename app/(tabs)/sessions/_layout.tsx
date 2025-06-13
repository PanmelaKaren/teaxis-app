// app/(tabs)/sessions/_layout.tsx
import React from 'react';
import { Stack } from 'expo-router';
import { Colors } from '../../../constants/Colors'; // Ajustado

export default function SessionsStackLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.primaryBlue,
        },
        headerTintColor: Colors.background,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Minhas Sessões' }} />
      <Stack.Screen name="[id]" options={{ title: 'Detalhes da Sessão' }} />
    </Stack>
  );
}