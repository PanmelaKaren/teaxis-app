// app/(tabs)/professionals/[id].tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { Colors } from '../../../constants/Colors'; // Ajustado
import axiosInstance from '../../../api/axiosInstance'; // Ajustado
import { Professional, CreateSessionDTO, AppointmentType } from '../../../types'; // Ajustado
import Button from '../../../components/Button'; // Ajustado
import Input from '../../../components/Input'; // Ajustado
import { Picker } from '@react-native-picker/picker';
import { useAuthStore } from '../../../store/authStore'; // Ajustado
import { StatusBar } from 'expo-status-bar';

export default function ProfessionalDetailsScreen() {
  const { id } = useLocalSearchParams();
  const professionalId = typeof id === 'string' ? parseInt(id, 10) : undefined; // Correção: uso correto de professionalId

  const { user } = useAuthStore();

  const [professional, setProfessional] = useState<Professional | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isScheduling, setIsScheduling] = useState<boolean>(false);

  // Estados para o agendamento
  const [dataHoraAgendamento, setDataHoraAgendamento] = useState<string>('');
  const [tipoAtendimento, setTipoAtendimento] = useState<AppointmentType>('ONLINE');
  const [localOuLink, setLocalOuLink] = useState<string>('');
  const [observacoesUsuario, setObservacoesUsuario] = useState<string>('');
  const [duracaoEstimadaMinutos, setDuracaoEstimadaMinutos] = useState<string>('50');

  useEffect(() => {
    if (professionalId) {
      fetchProfessionalDetails(professionalId);
    } else {
      setLoading(false);
      Alert.alert('Erro', 'ID do profissional não fornecido.');
    }
  }, [professionalId]);

  const fetchProfessionalDetails = async (id: number) => {
    try {
      setLoading(true);
      const response = await axiosInstance.get<Professional>(`/profissionais/${id}`);
      setProfessional(response.data);
    } catch (error: any) {
      console.error('Erro ao carregar detalhes do profissional:', error.response?.data || error.message);
      Alert.alert('Erro', error.response?.data?.message || 'Não foi possível carregar os detalhes do profissional.');
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleSession = async () => {
    if (!professionalId || !dataHoraAgendamento || !localOuLink) {
      Alert.alert('Campos Faltando', 'Por favor, preencha a data/hora e o local/link para agendar a sessão.');
      return;
    }

    if (user?.tipo !== 'USUARIO') {
      Alert.alert('Acesso Negado', 'Apenas usuários podem agendar sessões.');
      return;
    }

    setIsScheduling(true);

    const sessionData: CreateSessionDTO = {
      profissionalId: professionalId,
      dataHoraAgendamento: dataHoraAgendamento,
      tipoAtendimento: tipoAtendimento,
      localOuLink: localOuLink,
      observacoesUsuario: observacoesUsuario || undefined,
      duracaoEstimadaMinutos: parseInt(duracaoEstimadaMinutos) || 50,
    };

    try {
      const response = await axiosInstance.post('/sessoes', sessionData);
      if (response.status === 201) {
        Alert.alert('Sucesso', 'Sessão agendada com sucesso!');
        setDataHoraAgendamento('');
        setLocalOuLink('');
        setObservacoesUsuario('');
        setDuracaoEstimadaMinutos('50');
      } else {
        Alert.alert('Erro', 'Falha ao agendar sessão. Tente novamente.');
      }
    } catch (error: any) {
      console.error('Erro ao agendar sessão:', error.response?.data || error.message);
      Alert.alert('Erro', error.response?.data?.message || 'Não foi possível agendar a sessão. Verifique os dados e tente novamente.');
    } finally {
      setIsScheduling(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primaryBlue} />
      </View>
    );
  }

  if (!professional) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Profissional não encontrado.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <StatusBar style="light" />
      <Stack.Screen options={{ title: professional.usuario.nome }} />

      <Text style={styles.title}>{professional.usuario.nome}</Text>
      <Text style={styles.detailText}>E-mail: {professional.usuario.email}</Text>
      <Text style={styles.detailText}>Disponibilidade: {professional.disponibilidade || 'Não informada'}</Text>
      <Text style={styles.detailText}>Avaliação Média: {professional.avaliacaoMedia?.toFixed(1) || 'N/A'}</Text>

      {professional.especializacoes && professional.especializacoes.length > 0 && (
        <Text style={styles.sectionTitle}>Especializações:</Text>
      )}
      {professional.especializacoes?.map((spec, index) => (
        <Text key={index} style={styles.listItem}>- {spec}</Text>
      ))}

      {professional.metodosUtilizados && professional.metodosUtilizados.length > 0 && (
        <Text style={styles.sectionTitle}>Métodos Utilizados:</Text>
      )}
      {professional.metodosUtilizados?.map((method, index) => (
        <Text key={index} style={styles.listItem}>- {method}</Text>
      ))}

      {professional.certificacoes && professional.certificacoes.length > 0 && (
        <Text style={styles.sectionTitle}>Certificações:</Text>
      )}
      {professional.certificacoes?.map((cert, index) => (
        <Text key={index} style={styles.listItem}>- {cert}</Text>
      ))}

      {professional.hobbies && professional.hobbies.length > 0 && (
        <Text style={styles.sectionTitle}>Hobbies:</Text>
      )}
      {professional.hobbies?.map((hobby, index) => (
        <Text key={index} style={styles.listItem}>- {hobby}</Text>
      ))}

      {user?.tipo === 'USUARIO' && (
        <View style={styles.schedulingSection}>
          <Text style={styles.schedulingTitle}>Agendar Sessão</Text>
          <Input
            label="Data e Hora (AAAA-MM-DDTHH:mm:ss)"
            placeholder="Ex: 2025-07-15T14:00:00"
            value={dataHoraAgendamento}
            onChangeText={setDataHoraAgendamento}
          />
          <Text style={styles.label}>Tipo de Atendimento:</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={tipoAtendimento}
              onValueChange={(itemValue) => setTipoAtendimento(itemValue as AppointmentType)}
              style={styles.picker}
            >
              <Picker.Item label="Online" value="ONLINE" />
              <Picker.Item label="Presencial" value="PRESENCIAL" />
            </Picker>
          </View>
          <Input
            label={tipoAtendimento === 'ONLINE' ? 'Link da Sessão' : 'Local Físico'}
            placeholder={tipoAtendimento === 'ONLINE' ? 'Ex: https://meet.google.com/link' : 'Ex: Rua X, 123, Bairro Y'}
            value={localOuLink}
            onChangeText={setLocalOuLink}
          />
          <Input
            label="Observações para o Profissional (Opcional)"
            placeholder="Ex: Primeira consulta para TDAH"
            value={observacoesUsuario}
            onChangeText={setObservacoesUsuario}
            multiline
          />
          <Input
            label="Duração Estimada (minutos)"
            placeholder="Ex: 50"
            keyboardType="numeric"
            value={duracaoEstimadaMinutos}
            onChangeText={setDuracaoEstimadaMinutos}
          />
          <Button
            title={isScheduling ? "Agendando..." : "Agendar Sessão"}
            onPress={handleScheduleSession}
            disabled={isScheduling}
            style={styles.scheduleButton}
          />
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
  errorText: {
    fontSize: 18,
    color: Colors.errorRed,
    textAlign: 'center',
    marginTop: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primaryBlue,
    marginBottom: 10,
    textAlign: 'center',
  },
  detailText: {
    fontSize: 16,
    color: Colors.textDark,
    marginBottom: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.secondaryBlue,
    marginTop: 15,
    marginBottom: 5,
  },
  listItem: {
    fontSize: 16,
    color: Colors.textDark,
    marginLeft: 10,
    marginBottom: 2,
  },
  schedulingSection: {
    marginTop: 30,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.secondaryBlue,
  },
  schedulingTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primaryBlue,
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    color: Colors.textDark,
    marginBottom: 5,
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
  scheduleButton: {
    marginTop: 20,
  },
});