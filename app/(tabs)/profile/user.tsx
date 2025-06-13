// app/(tabs)/profile/user.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useAuthStore } from '../../../store/authStore'; // Ajustado
import { Colors } from '../../../constants/Colors'; // Ajustado
import Input from '../../../components/Input'; // Ajustado
import Button from '../../../components/Button'; // Ajustado
import axiosInstance from '../../../api/axiosInstance'; // Ajustado
import { User, Gender, UserType } from '../../../types'; // Ajustado
import { StatusBar } from 'expo-status-bar';
import { Picker } from '@react-native-picker/picker';

export default function UserProfileScreen() {
  const { user, token, setUserProfile } = useAuthStore();
  const [loading, setLoading] = useState<boolean>(true);
  const [editMode, setEditMode] = useState<boolean>(false);

  // Estados para os campos do formulário
  const [nome, setNome] = useState<string>(user?.nome || '');
  const [dataNascimento, setDataNascimento] = useState<string>(user?.dataNascimento || '');
  const [genero, setGenero] = useState<Gender | undefined>(user?.genero);
  const [cidade, setCidade] = useState<string>(user?.cidade || '');
  const [estado, setEstado] = useState<string>(user?.estado || '');
  const [tipoNeurodivergencia, setTipoNeurodivergencia] = useState<string>(user?.tipoNeurodivergencia || '');
  const [preferenciasSensoriais, setPreferenciasSensoriais] = useState<string>(user?.preferenciasSensoriais || ''); // Correção do nome do estado
  const [modoComunicacao, setModoComunicacao] = useState<string>(user?.modoComunicacao || '');
  const [historicoEscolar, setHistoricoEscolar] = useState<string>(user?.historicoEscolar || '');
  const [hobbies, setHobbies] = useState<string>(user?.hobbies?.join(', ') || '');

  useEffect(() => {
    if (user) {
      setNome(user.nome);
      setDataNascimento(user.dataNascimento || '');
      setGenero(user.genero);
      setCidade(user.cidade || '');
      setEstado(user.estado || '');
      setTipoNeurodivergencia(user.tipoNeurodivergencia || '');
      setPreferenciasSensoriais(user.preferenciasSensoriais || '');
      setModoComunicacao(user.modoComunicacao || '');
      setHistoricoEscolar(user.historicoEscolar || '');
      setHobbies(user.hobbies?.join(', ') || '');
      setLoading(false);
    } else {
      fetchUserProfile();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await axiosInstance.get<User>('/usuarios/me');
      const data = response.data;

      setUserProfile(data);
      setNome(data.nome);
      setDataNascimento(data.dataNascimento || '');
      setGenero(data.genero);
      setCidade(data.cidade || '');
      setEstado(data.estado || '');
      setTipoNeurodivergencia(data.tipoNeurodivergencia || '');
      setPreferenciasSensoriais(data.preferenciasSensoriais || '');
      setModoComunicacao(data.modoComunicacao || '');
      setHistoricoEscolar(data.historicoEscolar || '');
      setHobbies(data.hobbies?.join(', ') || '');
    } catch (error: any) {
      console.error('Erro ao carregar perfil:', error.response?.data || error.message);
      Alert.alert('Erro', error.response?.data?.message || 'Não foi possível carregar seu perfil.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    if (!user?.id) {
      Alert.alert('Erro', 'ID do usuário não disponível.');
      return;
    }

    const updatedUserData: Partial<User> = {
      nome,
      dataNascimento,
      genero,
      cidade,
      estado,
      tipoNeurodivergencia,
      preferenciasSensoriais,
      modoComunicacao,
      historicoEscolar,
      hobbies: hobbies.split(',').map(h => h.trim()).filter(h => h),
    };

    try {
      setLoading(true);
      const response = await axiosInstance.put<User>(`/usuarios/${user.id}`, updatedUserData);

      if (response.status === 200) {
        Alert.alert('Sucesso', 'Perfil atualizado com sucesso!');
        setUserProfile(response.data);
        setEditMode(false);
      } else {
        Alert.alert('Erro', 'Falha ao atualizar perfil. Tente novamente.');
      }
    } catch (error: any) {
      console.error('Erro ao atualizar perfil:', error.response?.data || error.message);
      Alert.alert('Erro', error.response?.data?.message || 'Não foi possível atualizar o perfil.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primaryBlue} />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <StatusBar style="light" />
      <Text style={styles.title}>Meu Perfil</Text>

      <Input label="Nome" value={nome} onChangeText={setNome} editable={editMode} />
      <Input label="E-mail" value={user?.email || ''} editable={false} />
      <Input label="Data de Nascimento (AAAA-MM-DD)" placeholder="Ex: 1995-08-20" value={dataNascimento} onChangeText={setDataNascimento} editable={editMode} />

      <Text style={styles.label}>Gênero:</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={genero}
          onValueChange={(itemValue) => setGenero(itemValue as Gender)}
          enabled={editMode}
          style={styles.picker}
        >
          <Picker.Item label="Não Informado" value={undefined} />
          <Picker.Item label="Masculino" value="Masculino" />
          <Picker.Item label="Feminino" value="Feminino" />
          <Picker.Item label="Outro" value="Outro" />
        </Picker>
      </View>

      <Input label="Cidade" value={cidade} onChangeText={setCidade} editable={editMode} />
      <Input label="Estado (UF)" value={estado} onChangeText={setEstado} editable={editMode} />
      <Input label="Tipo de Neurodivergência" value={tipoNeurodivergencia} onChangeText={setTipoNeurodivergencia} editable={editMode} />
      <Input label="Preferências Sensoriais" value={preferenciasSensoriais} onChangeText={setPreferenciasSensoriais} editable={editMode} multiline />
      <Input label="Modo de Comunicação" value={modoComunicacao} onChangeText={setModoComunicacao} editable={editMode} />
      <Input label="Histórico Escolar" value={historicoEscolar} onChangeText={setHistoricoEscolar} editable={editMode} multiline />
      <Input label="Hobbies (separados por vírgula)" value={hobbies} onChangeText={setHobbies} editable={editMode} multiline />

      {!editMode ? (
        <Button title="Editar Perfil" onPress={() => setEditMode(true)} style={styles.button} />
      ) : (
        <View style={styles.buttonContainer}>
          <Button title="Salvar Alterações" onPress={handleUpdateProfile} style={styles.button} disabled={loading} />
          <Button title="Cancelar" onPress={() => { setEditMode(false); fetchUserProfile(); }} style={[styles.button, styles.cancelButton]} textStyle={styles.cancelButtonText} />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.primaryBlue,
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    marginTop: 15,
  },
  buttonContainer: {
    flexDirection: 'column',
    width: '100%',
  },
  cancelButton: {
    backgroundColor: Colors.secondaryBlue,
  },
  cancelButtonText: {
    color: Colors.background,
  },
  label: {
    fontSize: 16,
    color: Colors.textDark,
    marginBottom: 5,
    marginTop: 10,
  },
  pickerContainer: {
    borderColor: Colors.secondaryBlue,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
    overflow: 'hidden',
    height: 50,
    justifyContent: 'center',
  },
  picker: {
    height: 50,
    width: '100%',
    color: Colors.textDark,
  },
});