import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useAuthStore } from '../../../store/authStore';
import { Colors } from '../../../constants/Colors';
import Input from '../../../components/Input';
import Button from '../../../components/Button';
import axiosInstance from '../../../api/axiosInstance';
import { Professional, UpdateProfessionalProfileDTO, User } from '../../../types';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router'; 


export default function ProfessionalProfileScreen() {
  const { user, token, setUserProfile } = useAuthStore();
  const [loading, setLoading] = useState<boolean>(false);
  const [editMode, setEditMode] = useState<boolean>(true);
  const [isProfessionalProfileLoaded, setIsProfessionalProfileLoaded] = useState<boolean>(false);

  const [disponibilidade, setDisponibilidade] = useState<string>('');
  const [certificacoes, setCertificacoes] = useState<string>('');
  const [especializacoes, setEspecializacoes] = useState<string>('');
  const [metodosUtilizados, setMetodosUtilizados] = useState<string>('');
  const [hobbiesProfissional, setHobbiesProfissional] = useState<string>('');


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
        setUserProfile({ tipo: 'PROFISSIONAL' });

        router.replace('/(tabs)/professionals'); 
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
      <Text style={styles.title}>Meu Perfil Profissional</Text>

      {!isProfessionalProfileLoaded && (
        <Text style={styles.noAccessText}>Por favor, preencha as informações abaixo para configurar seu perfil como profissional.</Text>
      )}

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
          {isProfessionalProfileLoaded && (
            <Button title="Cancelar" onPress={() => { setEditMode(false); /* AQUI VOCÊ PODE CHAMAR fetchProfessionalProfile() NOVAMENTE SE QUISER RECARREGAR OS DADOS */}} style={[styles.button, styles.cancelButton]} textStyle={styles.cancelButtonText} />
          )}
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
    marginTop: 10,
    marginBottom: 20,
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
    backgroundColor: Colors.accentGreen,
    marginTop: 30,
  },
});