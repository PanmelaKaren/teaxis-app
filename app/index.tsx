// app/index.tsx
import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { Link } from 'expo-router';
import Button from '../components/Button';
import { Colors } from '../constants/Colors';
import { StatusBar } from 'expo-status-bar';

export default function WelcomeScreen() {
  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <Image
        source={require('../assets/images/fundoLogo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.title}>Bem-vindo ao Teaxis!</Text>
      <Text style={styles.subtitle}>Conectando você a profissionais especializados.</Text>

      <View style={styles.buttonGroup}>
        {/* Link para a tela de login */}
        <Link href="/login" asChild>
          <Button title="Entrar" style={styles.button} />
        </Link>

        {/* Link para a tela de registro */}
        <Link href="/register" asChild>
          <Button
            title="Criar Conta"
            style={[styles.button, styles.secondaryButton]}
            textStyle={styles.secondaryButtonText}
          />
        </Link>
      </View>
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
  logo: {
    width: 200,
    height: 200,
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.primaryBlue,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textDark,
    textAlign: 'center',
    marginBottom: 40,
  },
  buttonGroup: {
    width: '100%',
    alignItems: 'center',
  },
  button: {
    marginTop: 15,
  },
  secondaryButton: {
    backgroundColor: Colors.secondaryBlue,
  },
  secondaryButtonText: {
    color: Colors.background,
  },
});
