// app/(tabs)/sessions/index.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { Colors } from '../../../constants/Colors'; // Ajustado
import axiosInstance from '../../../api/axiosInstance'; // Ajustado
import { Session, UserType, SessionStatus } from '../../../types'; // Ajustado
import { useAuthStore } from '../../../store/authStore'; // Ajustado
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Button from '../../../components/Button'; // Ajustado

interface SessionCardProps {
  session: Session;
  onViewDetails: (id: number) => void;
  onUpdateStatus?: (id: number, newStatus: SessionStatus, obs?: string) => void;
  userType: UserType;
}

const SessionCard: React.FC<SessionCardProps> = ({ session, onViewDetails, onUpdateStatus, userType }) => {
  const getStatusColor = (status: SessionStatus) => {
    switch (status) {
      case 'AGENDADA': return Colors.primaryBlue;
      case 'REALIZADA': return Colors.successGreen;
      case 'CANCELADA':
      case 'CANCELADA_PACIENTE':
      case 'CANCELADA_PROFISSIONAL': return Colors.errorRed;
      default: return Colors.secondaryBlue;
    }
  };

  const handleStatusUpdate = (newStatus: SessionStatus) => {
    Alert.prompt(
      `Atualizar Status para ${newStatus}`,
      "Adicione uma observação (opcional):",
      [
        {
          text: "Cancelar",
          style: "cancel"
        },
        {
          text: "Confirmar",
          onPress: (obs) => onUpdateStatus && onUpdateStatus(session.id, newStatus, obs || undefined)
        }
      ],
      "plain-text"
    );
  };

  return (
    <TouchableOpacity style={styles.card} onPress={() => onViewDetails(session.id)}>
      <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(session.status) }]} />
      <Text style={styles.cardTitle}>Sessão com {userType === 'USUARIO' ? session.profissional.usuario.nome : session.usuario.nome}</Text>
      <Text style={styles.cardDetail}>Data: {new Date(session.dataHoraAgendamento).toLocaleString()}</Text>
      <Text style={styles.cardDetail}>Tipo: {session.tipoAtendimento}</Text>
      <Text style={styles.cardDetail}>Status: <Text style={{ color: getStatusColor(session.status), fontWeight: 'bold' }}>{session.status}</Text></Text>

      {userType === 'PROFISSIONAL' && session.status === 'AGENDADA' && (
        <View style={styles.cardActions}>
          <Button title="Marcar como Realizada" onPress={() => handleStatusUpdate('REALIZADA')} style={styles.statusButton} textStyle={{fontSize: 12}} />
          <Button title="Cancelar" onPress={() => handleStatusUpdate('CANCELADA_PROFISSIONAL')} style={[styles.statusButton, {backgroundColor: Colors.errorRed}]} textStyle={{fontSize: 12}} />
        </View>
      )}
      {userType === 'USUARIO' && session.status === 'AGENDADA' && (
        <View style={styles.cardActions}>
          <Button title="Cancelar Sessão" onPress={() => handleStatusUpdate('CANCELADA_PACIENTE')} style={[styles.statusButton, {backgroundColor: Colors.errorRed}]} textStyle={{fontSize: 12}} />
        </View>
      )}
    </TouchableOpacity>
  );
};

export default function SessionsScreen() {
  const { user, token } = useAuthStore();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (user && token) {
      fetchSessions();
    } else {
      setLoading(false);
    }
  }, [user, token]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      let url = '';
      if (user?.tipo === 'USUARIO') {
        url = '/sessoes/minhas';
      } else if (user?.tipo === 'PROFISSIONAL') {
        url = '/sessoes/profissional/minhas';
      } else {
        setLoading(false);
        return;
      }

      const response = await axiosInstance.get<Session[]>(url);
      setSessions(response.data);
    } catch (error: any) {
      console.error('Erro ao carregar sessões:', error.response?.data || error.message);
      Alert.alert('Erro', error.response?.data?.message || 'Não foi possível carregar suas sessões.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (id: number) => {
    router.push(`/(tabs)/sessions/${id}`);
  };

  const handleUpdateSessionStatus = async (sessionId: number, newStatus: SessionStatus, observacoes?: string) => {
    try {
      await axiosInstance.patch(`/sessoes/${sessionId}/status`, { novoStatus: newStatus, observacoes });
      Alert.alert('Sucesso', `Status da sessão atualizado para ${newStatus}.`);
      fetchSessions();
    } catch (error: any) {
      console.error('Erro ao atualizar status da sessão:', error.response?.data || error.message);
      Alert.alert('Erro', error.response?.data?.message || 'Não foi possível atualizar o status da sessão.');
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primaryBlue} />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyListText}>Faça login para ver suas sessões.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Text style={styles.mainTitle}>Minhas Sessões</Text>
      <FlatList
        data={sessions}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <SessionCard
            session={item}
            onViewDetails={handleViewDetails}
            onUpdateStatus={handleUpdateSessionStatus}
            userType={user.tipo}
          />
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.emptyListText}>Você não tem sessões agendadas ou realizadas.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingTop: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primaryBlue,
    marginBottom: 20,
    textAlign: 'center',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: Colors.background,
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 5,
    borderLeftColor: Colors.accentGreen,
    position: 'relative',
  },
  statusIndicator: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 8,
    borderTopLeftRadius: 10,
    borderBottomLeftRadius: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textDark,
    marginBottom: 5,
    marginLeft: 10,
  },
  cardDetail: {
    fontSize: 14,
    color: Colors.textDark,
    marginBottom: 3,
    marginLeft: 10,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#EEE',
  },
  statusButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    width: '45%',
  },
  emptyListText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: Colors.textDark,
  },
});