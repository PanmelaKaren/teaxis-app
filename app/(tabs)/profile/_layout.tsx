// app/(tabs)/profile/_layout.tsx
import React from 'react';
import { Stack } from 'expo-router';
import { Colors } from '../../../constants/Colors'; // Ajustado
import { useAuthStore } from '../../../store/authStore'; // Ajustado
import { Text, View, StyleSheet } from 'react-native';

export default function ProfileStackLayout() {
  const { user } = useAuthStore();

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.errorText}>Carregando perfil...</Text>
      </View>
    );
  }

  const initialRouteName = user.tipo === 'PROFISSIONAL' ? 'professional' : 'user';

  return (
    <Stack
      initialRouteName={initialRouteName}
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.primaryBlue,
        },
        headerTintColor: Colors.background,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerBackTitleVisible: false, // Esta propriedade é válida para Stack.ScreenOptions
      }}
    >
      <Stack.Screen name="user" options={{ title: 'Meu Perfil' }} />
      <Stack.Screen name="professional" options={{ title: 'Perfil Profissional' }} />
    </Stack>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  errorText: {
    color: Colors.textDark,
    fontSize: 16,
  },
});