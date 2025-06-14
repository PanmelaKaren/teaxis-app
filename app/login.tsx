import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, Alert } from 'react-native';
import Input from '../components/Input';
import Button from '../components/Button';
import { Colors } from '../constants/Colors';
import { useAuthStore } from '../store/authStore';
import { Link, router } from 'expo-router';
import axiosInstance from '../api/axiosInstance';
import { StatusBar } from 'expo-status-bar';
import { DadosTokenJWT, User } from '../types'; 

export default function LoginScreen() {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  
  const login = useAuthStore((state) => state.login);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erro de Login', 'Por favor, preencha todos os campos.');
      return;
    }

    setLoading(true);
    try {
      const response = await axiosInstance.post<DadosTokenJWT>('/login', {
        email,
        senha: password,
      });

      console.log('Resposta completa do Login:', response);
      console.log('Dados da Resposta (response.data):', response.data);
      console.log('Status da Resposta (response.status):', response.status);

      const { token, usuario } = response.data;

      if (token && usuario) {
        login(usuario, token);
        router.replace('/(tabs)/home');
      } else {
        Alert.alert('Erro de Login', 'Resposta inesperada do servidor: Token ou dados do usuário ausentes.');
      }
    } catch (error: any) {
      console.error('Erro detalhado ao fazer login:', error);
      if (error.response) {
        console.error('Status do Erro:', error.response.status);
        console.error('Dados do Erro:', error.response.data);
        console.error('Headers do Erro:', error.response.headers);
        Alert.alert(
          'Erro de Login',
          error.response.data?.message || `Erro ${error.response.status}: Credenciais inválidas ou acesso proibido.`
        );
      } else if (error.request) {
        console.error('Nenhuma resposta recebida (provável problema de rede/backend offline):', error.request);
        Alert.alert('Erro de Conexão', 'Não foi possível conectar ao servidor. Verifique sua conexão ou o status do backend.');
      } else {
        console.error('Erro na configuração da requisição:', error.message);
        Alert.alert('Erro Interno', `Um erro inesperado ocorreu: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <Image
        source={require('../assets/images/fundoLogo.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.title}>Entrar</Text>

      <Input
        label="E-mail"
        placeholder="Digite seu e-mail"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />
      <Input
        label="Senha"
        placeholder="Digite sua senha"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {/* Botão de Login: Chamar handleLogin no onPress */}
      <Button
        title={loading ? 'Entrando...' : 'Login'}
        onPress={handleLogin} 
        style={styles.loginButton}
        disabled={loading}
      />
      <Link href="/register" asChild>
        <Text style={styles.registerText}>
          Não tem conta?{' '}
          <Text style={styles.registerLink}>Crie uma agora!</Text>
        </Text>
      </Link>
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
    width: 150,
    height: 150,
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primaryBlue,
    marginBottom: 30,
  },
  loginButton: {
    marginTop: 20,
  },
  registerText: {
    marginTop: 20,
    fontSize: 16,
    color: Colors.textDark,
  },
  registerLink: {
    color: Colors.primaryBlue,
    fontWeight: 'bold',
  },
});