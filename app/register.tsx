import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, Alert } from 'react-native';
import Input from '../components/Input';
import Button from '../components/Button';
import { Colors } from '../constants/Colors';
import { Link, router } from 'expo-router';
import axiosInstance from '../api/axiosInstance';
import { RegisterUserDTO } from '../types';
import { StatusBar } from 'expo-status-bar';

export default function RegisterScreen() {
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [dob, setDob] = useState<string>('');
  const [neurodivergence, setNeurodivergence] = useState<string>('');
  const [hobbies, setHobbies] = useState<string>('');
  const [communicationMode, setCommunicationMode] = useState<string>('');
  const [sensoryPreferences, setSensoryPreferences] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword || !dob) {
      Alert.alert('Campos Obrigatórios', 'Por favor, preencha todos os campos obrigatórios (Nome, E-mail, Senha, Confirmação de Senha, Data de Nascimento).');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Erro de Senha', 'As senhas não coincidem.');
      return;
    }
    if (password.length < 6) {
      Alert.alert('Senha Fraca', 'A senha deve ter no mínimo 6 caracteres.');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      Alert.alert('E-mail Inválido', 'Por favor, insira um e-mail válido.');
      return;
    }

    setLoading(true);

    const userData: RegisterUserDTO = {
      nome: name,
      email: email,
      senha: password,
      dataNascimento: dob,
      tipo: "USUARIO",
      tipoNeurodivergencia: neurodivergence || null,
      hobbies: hobbies.split(',').map(h => h.trim()).filter(h => h) || [],
      modoComunicacao: communicationMode || null,
      preferenciasSensoriais: sensoryPreferences || null,
      genero: undefined,
      cidade: undefined,
      estado: undefined,
      historicoEscolar: undefined,
    };

    try {
      const response = await axiosInstance.post('/usuarios/registrar', userData);

      if (response.status === 201) {
        Alert.alert('Sucesso', 'Sua conta foi criada! Faça login para continuar.');
        router.replace('/login');
      } else {
        Alert.alert('Erro de Registro', 'Ocorreu um erro ao registrar. Tente novamente.');
      }
    } catch (error: any) {
      console.error('Erro ao registrar:', error.response?.data || error.message);
      Alert.alert('Erro de Registro', error.response?.data?.message || 'Não foi possível conectar ao servidor. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <StatusBar style="dark" />
      <Image source={require('../assets/images/fundoLogo.png')} style={styles.logo} resizeMode="contain" />
      <Text style={styles.title}>Criar Conta</Text>

      <Input
        label="Nome Completo"
        placeholder="Seu nome"
        value={name}
        onChangeText={setName}
      />
      <Input
        label="E-mail"
        placeholder="Seu e-mail"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />
      <Input
        label="Senha"
        placeholder="Crie uma senha"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <Input
        label="Confirmar Senha"
        placeholder="Confirme sua senha"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />
      <Input
        label="Data de Nascimento (AAAA-MM-DD)"
        placeholder="Ex: 1995-08-20"
        value={dob}
        onChangeText={setDob}
      />
      <Input
        label="Tipo de Neurodivergência (Opcional)"
        placeholder="Ex: TDAH, Autismo"
        value={neurodivergence}
        onChangeText={setNeurodivergence}
      />
      <Input
        label="Hobbies (Separados por vírgula)"
        placeholder="Ex: Leitura, Música, Jogos"
        value={hobbies}
        onChangeText={setHobbies}
        multiline
      />
      <Input
        label="Modo de Comunicação Preferido (Opcional)"
        placeholder="Ex: Prefere comunicação visual"
        value={communicationMode}
        onChangeText={setCommunicationMode}
        multiline
      />
      <Input
        label="Preferências Sensoriais (Opcional)"
        placeholder="Ex: Sensível a ruídos altos"
        value={sensoryPreferences}
        onChangeText={setSensoryPreferences}
        multiline
      />

        <Button
        title={loading ? "Registrando..." : "Registrar"}
        onPress={handleRegister} 
        style={styles.registerButton}
        disabled={loading}
      />
      <Link href="/login" asChild>
        <Text style={styles.loginText}>Já tem conta? <Text style={styles.loginLink}>Faça login!</Text></Text>
      </Link>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: 20,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primaryBlue,
    marginBottom: 20,
  },
  registerButton: {
    marginTop: 20,
    marginBottom: 10,
  },
  loginText: {
    marginTop: 10,
    fontSize: 16,
    color: Colors.textDark,
  },
  loginLink: {
    color: Colors.primaryBlue,
    fontWeight: 'bold',
  },
});