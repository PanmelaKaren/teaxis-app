// app/(tabs)/sessions/[id].tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { Colors } from '../../../constants/Colors'; // Ajustado
import axiosInstance from '../../../api/axiosInstance'; // Ajustado
import { Session, SessionStatus, Avaliacao, CreateAvaliacaoDTO } from '../../../types'; // Ajustado
import { useAuthStore } from '../../../store/authStore'; // Ajustado
import Input from '../../../components/Input'; // Ajustado
import Button from '../../../components/Button'; // Ajustado
import { StatusBar } from 'expo-status-bar';
import { Picker } from '@react-native-picker/picker';

export default function SessionDetailsScreen() {
  const { id } = useLocalSearchParams();
  const sessionId = typeof id === 'string' ? parseInt(id, 10) : undefined;

  const { user } = useAuthStore();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState<boolean>(false);
  const [newStatus, setNewStatus] = useState<SessionStatus | undefined>(undefined);
  const [statusObservations, setStatusObservations] = useState<string>('');

  // Estados para avaliação
  const [showRatingForm, setShowRatingForm] = useState<boolean>(false);
  const [rating, setRating] = useState<string>('5.0');
  const [comment, setComment] = useState<string>('');
  const [isSubmittingRating, setIsSubmittingRating] = useState<boolean>(false);
  const [existingRating, setExistingRating] = useState<Avaliacao | null>(null);


  useEffect(() => {
    if (sessionId) {
      fetchSessionDetails(sessionId);
    } else {
      setLoading(false);
      Alert.alert('Erro', 'ID da sessão não fornecido.');
    }
  }, [sessionId]);

  const fetchSessionDetails = async (id: number) => {
    try {
      setLoading(true);
      const response = await axiosInstance.get<Session>(`/sessoes/${id}`);
      setSession(response.data);
      setNewStatus(response.data.status);

      if (response.data.status === 'REALIZADA' && user?.tipo === 'USUARIO') {
        fetchExistingRating(response.data.profissional.id);
      }
    } catch (error: any) {
      console.error('Erro ao carregar detalhes da sessão:', error.response?.data || error.message);
      Alert.alert('Erro', error.response?.data?.message || 'Não foi possível carregar os detalhes da sessão.');
    } finally {
      setLoading(false);
    }
  };

  const fetchExistingRating = async (professionalId: number) => {
    try {
      const response = await axiosInstance.get<Avaliacao[]>(`/avaliacoes/me?profissionalId=${professionalId}`);
      if (response.data && response.data.length > 0) {
        setExistingRating(response.data[0]);
        setRating(response.data[0].nota.toString());
        setComment(response.data[0].comentario || '');
      }
    } catch (error) {
      console.error('Erro ao buscar avaliação existente:', error);
    }
  };

  const handleUpdateSessionStatus = async () => {
    if (!sessionId || !newStatus) {
      Alert.alert('Erro', 'Status inválido ou ID da sessão não fornecido.');
      return;
    }

    if (user?.tipo !== 'PROFISSIONAL' && user?.tipo !== 'USUARIO') {
        Alert.alert('Acesso Negado', 'Você não tem permissão para alterar o status da sessão.');
        return;
    }

    setIsUpdatingStatus(true);
    try {
      await axiosInstance.patch(`/sessoes/${sessionId}/status`, {
        novoStatus: newStatus,
        observacoes: statusObservations || undefined,
      });
      Alert.alert('Sucesso', 'Status da sessão atualizado.');
      fetchSessionDetails(sessionId);
    } catch (error: any) {
      console.error('Erro ao atualizar status:', error.response?.data || error.message);
      Alert.alert('Erro', error.response?.data?.message || 'Não foi possível atualizar o status.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleSubmitRating = async () => {
    if (!session?.profissional?.id || !rating) {
      Alert.alert('Erro', 'Dados da avaliação incompletos.');
      return;
    }
    if (user?.tipo !== 'USUARIO') {
        Alert.alert('Acesso Negado', 'Apenas usuários podem avaliar sessões.');
        return;
    }
    setIsSubmittingRating(true);
    try {
      const evaluationData: CreateAvaliacaoDTO = {
        profissionalId: session.profissional.id,
        nota: parseFloat(rating),
        comentario: comment || undefined,
        dataAvaliacao: new Date().toISOString().split('T')[0],
      };
      await axiosInstance.post('/avaliacoes', evaluationData);
      Alert.alert('Sucesso', 'Avaliação enviada com sucesso!');
      setShowRatingForm(false);
      fetchExistingRating(session.profissional.id);
    } catch (error: any) {
      console.error('Erro ao enviar avaliação:', error.response?.data || error.message);
      Alert.alert('Erro', error.response?.data?.message || 'Não foi possível enviar a avaliação.');
    } finally {
      setIsSubmittingRating(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primaryBlue} />
      </View>
    );
  }

  if (!session) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Sessão não encontrada.</Text>
      </View>
    );
  }

  const isUserPatient = user?.tipo === 'USUARIO';
  const isUserProfessional = user?.tipo === 'PROFISSIONAL';
  const canChangeStatus = isUserProfessional || (isUserPatient && (session.status === 'AGENDADA' || session.status === 'REALIZADA'));

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <StatusBar style="light" />
      <Stack.Screen options={{ title: 'Sessão com ' + (isUserPatient ? session.profissional.usuario.nome : session.usuario.nome) }} />

      <Text style={styles.title}>Detalhes da Sessão</Text>

      <View style={styles.detailCard}>
        <Text style={styles.detailLabel}>Participante:</Text>
        <Text style={styles.detailValue}>
          {isUserPatient ? session.profissional.usuario.nome : session.usuario.nome}
          {' ('}
          {isUserPatient ? 'Profissional' : 'Paciente'}
          {')'}
        </Text>

        <Text style={styles.detailLabel}>Data e Hora:</Text>
        <Text style={styles.detailValue}>{new Date(session.dataHoraAgendamento).toLocaleString()}</Text>

        <Text style={styles.detailLabel}>Tipo de Atendimento:</Text>
        <Text style={styles.detailValue}>{session.tipoAtendimento}</Text>

        <Text style={styles.detailLabel}>{session.tipoAtendimento === 'ONLINE' ? 'Link da Sessão:' : 'Local:'}</Text>
        <Text style={styles.detailValue}>{session.localOuLink || 'N/A'}</Text>

        <Text style={styles.detailLabel}>Status:</Text>
        <Text style={[styles.detailValue, { color: session.status === 'REALIZADA' ? Colors.successGreen : (session.status.includes('CANCELADA') ? Colors.errorRed : Colors.primaryBlue) }]}>
          {session.status}
        </Text>

        {session.observacoesUsuario && (
          <>
            <Text style={styles.detailLabel}>Observações do Paciente:</Text>
            <Text style={styles.detailValue}>{session.observacoesUsuario}</Text>
          </>
        )}

        {session.observacoesProfissional && (
          <>
            <Text style={styles.detailLabel}>Observações do Profissional:</Text>
            <Text style={styles.detailValue}>{session.observacoesProfissional}</Text>
          </>
        )}

        {session.duracaoEstimadaMinutos && (
          <>
            <Text style={styles.detailLabel}>Duração Estimada:</Text>
            <Text style={styles.detailValue}>{session.duracaoEstimadaMinutos} minutos</Text>
          </>
        )}
      </View>

      {isUserProfessional && session.status !== 'CANCELADA_PROFISSIONAL' && session.status !== 'CANCELADA_PACIENTE' && (
        <View style={styles.statusUpdateSection}>
          <Text style={styles.sectionTitle}>Atualizar Status da Sessão</Text>
          <Text style={styles.label}>Novo Status:</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={newStatus}
              onValueChange={(itemValue) => setNewStatus(itemValue as SessionStatus)}
              style={styles.picker}
            >
              <Picker.Item label="Agendada" value="AGENDADA" />
              <Picker.Item label="Realizada" value="REALIZADA" />
              <Picker.Item label="Cancelada (Profissional)" value="CANCELADA_PROFISSIONAL" />
            </Picker>
          </View>
          <Input
            label="Observações (Opcional)"
            placeholder="Adicione observações sobre a mudança de status"
            value={statusObservations}
            onChangeText={setStatusObservations}
            multiline
          />
          <Button
            title={isUpdatingStatus ? "Atualizando..." : "Atualizar Status"}
            onPress={handleUpdateSessionStatus}
            disabled={isUpdatingStatus}
            style={styles.actionButton}
          />
        </View>
      )}

      {isUserPatient && session.status === 'AGENDADA' && (
        <View style={styles.statusUpdateSection}>
          <Text style={styles.sectionTitle}>Cancelar Sessão</Text>
          <Input
            label="Motivo do Cancelamento (Opcional)"
            placeholder="Ex: Tive um imprevisto"
            value={statusObservations}
            onChangeText={setStatusObservations}
            multiline
          />
          <Button
            title={isUpdatingStatus ? "Cancelando..." : "Cancelar Sessão"}
            onPress={() => { setNewStatus('CANCELADA_PACIENTE'); handleUpdateSessionStatus(); }}
            disabled={isUpdatingStatus}
            style={[styles.actionButton, styles.cancelButton]}
          />
        </View>
      )}

      {isUserPatient && session.status === 'REALIZADA' && (
        <View style={styles.ratingSection}>
          <Text style={styles.sectionTitle}>Avaliar Profissional</Text>
          {existingRating ? (
            <View style={styles.existingRatingContainer}>
              <Text style={styles.existingRatingText}>Você já avaliou esta sessão:</Text>
              <Text style={styles.existingRatingText}>Nota: {existingRating.nota}</Text>
              {existingRating.comentario && <Text style={styles.existingRatingText}>Comentário: {existingRating.comentario}</Text>}
              <Button title="Editar Avaliação" onPress={() => setShowRatingForm(true)} style={[styles.actionButton, {backgroundColor: Colors.secondaryBlue}]} />
            </View>
          ) : (
            <>
              {!showRatingForm ? (
                <Button title="Avaliar Agora" onPress={() => setShowRatingForm(true)} style={styles.actionButton} />
              ) : (
                <>
                  <Text style={styles.label}>Nota (1.0 a 5.0):</Text>
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={rating}
                      onValueChange={(itemValue) => setRating(itemValue as string)}
                      style={styles.picker}
                    >
                      {['1.0', '1.5', '2.0', '2.5', '3.0', '3.5', '4.0', '4.5', '5.0'].map(value => (
                        <Picker.Item key={value} label={value} value={value} />
                      ))}
                    </Picker>
                  </View>
                  <Input
                    label="Comentário (Opcional)"
                    placeholder="Sua experiência com o profissional"
                    value={comment}
                    onChangeText={setComment}
                    multiline
                  />
                  <Button
                    title={isSubmittingRating ? "Enviando..." : "Enviar Avaliação"}
                    onPress={handleSubmitRating}
                    disabled={isSubmittingRating}
                    style={styles.actionButton}
                  />
                   <Button
                    title="Cancelar"
                    onPress={() => setShowRatingForm(false)}
                    style={[styles.actionButton, styles.cancelButton]}
                    textStyle={styles.cancelButtonText}
                  />
                </>
              )}
            </>
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
    marginBottom: 20,
    textAlign: 'center',
  },
  detailCard: {
    backgroundColor: Colors.background,
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 5,
    borderLeftColor: Colors.primaryBlue,
  },
  detailLabel: {
    fontSize: 15,
    fontWeight: 'bold',
    color: Colors.secondaryBlue,
    marginTop: 8,
  },
  detailValue: {
    fontSize: 16,
    color: Colors.textDark,
    marginBottom: 5,
  },
  statusUpdateSection: {
    marginTop: 30,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.secondaryBlue,
  },
  ratingSection: {
    marginTop: 30,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: Colors.secondaryBlue,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.primaryBlue,
    marginBottom: 15,
    textAlign: 'center',
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
  actionButton: {
    marginTop: 15,
  },
  cancelButton: {
    backgroundColor: Colors.errorRed,
  },
  cancelButtonText: {
    color: Colors.background,
  },
  existingRatingContainer: {
    backgroundColor: '#F0F8FF',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: Colors.successGreen,
  },
  existingRatingText: {
    fontSize: 16,
    color: Colors.textDark,
    marginBottom: 5,
  },
});