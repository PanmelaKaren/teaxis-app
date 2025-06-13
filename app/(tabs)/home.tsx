// app/(tabs)/home.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native'; // Removida a importação de Image
import { useAuthStore } from '../../store/authStore';
import { Colors } from '../../constants/Colors';
import { StatusBar } from 'expo-status-bar';

export default function HomeScreen() {
  const user = useAuthStore((state) => state.user);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      {/* LOGO REMOVIDA DAQUI */}
      <Text style={styles.welcomeText}>Olá, {user?.nome?.split(' ')[0] || 'Usuário'}!</Text>
      <Text style={styles.subtitle}>Bem-vindo de volta ao Teaxis.</Text>
      <Text style={styles.infoText}>Explore profissionais, agende sessões e encontre o suporte que você precisa.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: 20,
  },
  // Removido o estilo 'logo' pois a imagem não está mais aqui
  welcomeText: {
    fontSize: 26,
    fontWeight: 'bold',
    color: Colors.primaryBlue,
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: Colors.textDark,
    textAlign: 'center',
    marginBottom: 30,
  },
  infoText: {
    fontSize: 16,
    color: Colors.textDark,
    textAlign: 'center',
    lineHeight: 24,
    marginHorizontal: 20,
  },
});