// app/(tabs)/profile/professional.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useAuthStore } from '../../../store/authStore'; // Ajustado
import { Colors } from '../../../constants/Colors'; // Ajustado
import Input from '../../../components/Input'; // Ajustado
import Button from '../../../components/Button'; // Ajustado
import axiosInstance from '../../../api/axiosInstance'; // Ajustado
import { Professional, UpdateProfessionalProfileDTO, User } from '../../../types'; // Ajustado
import { StatusBar } from 'expo-status-bar';

export default function ProfessionalProfileScreen() {
  const { user, token, setUserProfile } = useAuthStore();
  const [loading, setLoading] = useState<boolean>(true);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [isProfessionalProfileLoaded, setIsProfessionalProfileLoaded] = useState<boolean>(false);

  // Estados para os campos do formulário profissional
  const [disponibilidade, setDisponibilidade] = useState<string>('');
  const [certificacoes, setCertificacoes] = useState<string>('');
  const [especializacoes, setEspecializacoes] = useState<string>('');
  const [metodosUtilizados, setMetodosUtilizados] = useState<string>('');
  const [hobbiesProfissional, setHobbiesProfissional] = useState<string>('');

  useEffect(() => {
    if (user?.tipo === 'PROFISSIONAL') {
      fetchProfessionalProfile();
    } else {
      setLoading(false);
    }
  }, [user?.tipo]);

  const fetchProfessionalProfile = async () => {
    if (!token || user?.tipo !== 'PROFISSIONAL') {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await axiosInstance.get<Professional>('/profissionais/meu-perfil');
      const data = response.data;
      setDisponibilidade(data.disponibilidade || '');
      setCertificacoes(data.certificacoes?.join(', ') || '');
      setEspecializacoes(data.especializacoes?.join(', ') || '');
      setMetodosUtilizados(data.metodosUtilizados?.join(', ') || '');
      setHobbiesProfissional(data.hobbies?.join(', ') || '');
      setIsProfessionalProfileLoaded(true);
    } catch (error: any) {
      console.error('Erro ao carregar perfil profissional:', error.response?.data || error.message);
      if (error.response?.status === 404) {
        Alert.alert('Perfil Profissional', 'Você ainda não possui um perfil profissional completo. Preencha os dados abaixo para criá-lo.');
        setIsProfessionalProfileLoaded(false);
        setEditMode(true);
      } else {
        Alert.alert('Erro', error.response?.data?.message || 'Não foi possível carregar seu perfil profissional.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfessionalProfile = async () => {
    setLoading(true);
    const updatedProfessionalData: UpdateProfessionalProfileDTO = {
      disponibilidade,
      certificacoes: certificacoes.split(',').map(c => c.trim()).filter(c => c),
      especializacoes: especializacoes.split(',').map(e => e.trim()).filter(e => e),
      metodosUtilizados: metodosUtilizados.split(',').map(m => m.trim()).filter(m => m),
      hobbies: hobbiesProfissional.split(',').map(h => h.trim()).filter(h => h),
    };

    try {
      const response = await axiosInstance.put<Professional>('/profissionais/meu-perfil', updatedProfessionalData);

      if (response.status === 200) {
        Alert.alert('Sucesso', 'Perfil profissional atualizado com sucesso!');
        setIsProfessionalProfileLoaded(true);
        setEditMode(false);
      } else {
        Alert.alert('Erro', 'Falha ao atualizar perfil profissional. Tente novamente.');
      }
    } catch (error: any) {
      console.error('Erro ao atualizar perfil profissional:', error.response?.data || error.message);
      Alert.alert('Erro', error.response?.data?.message || 'Não foi possível atualizar o perfil profissional.');
    } finally {
      setLoading(false);
    }
  };

  const handleBecomeProfessional = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const response = await axiosInstance.patch<User>(`/usuarios/${user.id}/tornar-profissional`);

      if (response.status === 200) {
        Alert.alert('Sucesso', 'Seu perfil foi atualizado para Profissional. Agora você pode completar seu perfil profissional!');
        setUserProfile(response.data);
        setEditMode(true);
        setIsProfessionalProfileLoaded(false);
      } else {
        Alert.alert('Erro', 'Não foi possível converter seu perfil para profissional.');
      }
    } catch (error: any) {
      console.error('Erro ao converter para profissional:', error.response?.data || error.message);
      Alert.alert('Erro', error.response?.data?.message || 'Não foi possível converter seu perfil para profissional.');
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

  if (user?.tipo !== 'PROFISSIONAL') {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <Text style={styles.title}>Complete seu Perfil</Text>
        <Text style={styles.noAccessText}>Para oferecer serviços na plataforma, você precisa ter um perfil de Profissional.</Text>
        <Button title="Tornar-me Profissional" onPress={handleBecomeProfessional} style={styles.becomeProButton} disabled={loading} />
      </View>
    );
  }

  if (!isProfessionalProfileLoaded && !editMode) {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <StatusBar style="light" />
        <Text style={styles.title}>Complete seu Perfil Profissional</Text>
        <Text style={styles.noAccessText}>Por favor, preencha as informações abaixo para configurar seu perfil como profissional.</Text>
        <Button title="Preencher Perfil Profissional" onPress={() => setEditMode(true)} style={styles.becomeProButton} />
      </ScrollView>
    );
  }


  return (
    <ScrollView contentContainerStyle={styles.container}>
      <StatusBar style="light" />
      <Text style={styles.title}>Meu Perfil Profissional</Text>

      <Input label="Nome (Usuário)" value={user?.nome || ''} editable={false} />
      <Input label="Email (Usuário)" value={user?.email || ''} editable={false} />

      <Input label="Disponibilidade" value={disponibilidade} onChangeText={setDisponibilidade} editable={editMode} multiline />
      <Input label="Certificações (separadas por vírgula)" value={certificacoes} onChangeText={setCertificacoes} editable={editMode} multiline />
      <Input label="Especializações (separadas por vírgula)" value={especializacoes} onChangeText={setEspecializacoes} editable={editMode} multiline />
      <Input label="Métodos Utilizados (separadas por vírgula)" value={metodosUtilizados} onChangeText={setMetodosUtilizados} editable={editMode} multiline />
      <Input label="Hobbies Profissional (separadas por vírgula)" value={hobbiesProfissional} onChangeText={setHobbiesProfissional} editable={editMode} multiline />

      {!editMode ? (
        <Button title="Editar Perfil Profissional" onPress={() => setEditMode(true)} style={styles.button} />
      ) : (
        <View style={styles.buttonContainer}>
          <Button title="Salvar Alterações" onPress={handleUpdateProfessionalProfile} style={styles.button} disabled={loading} />
          <Button title="Cancelar" onPress={() => { setEditMode(false); fetchProfessionalProfile(); }} style={[styles.button, styles.cancelButton]} textStyle={styles.cancelButtonText} />
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
  noAccessText: {
    fontSize: 18,
    color: Colors.textDark,
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 30,
    paddingHorizontal: 10,
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
  becomeProButton: {
    marginTop: 30,
  },
});