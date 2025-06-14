// app/(tabs)/matching.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { Colors } from '../../constants/Colors';
import axiosInstance from '../../api/axiosInstance';
import { Matching, UserType } from '../../types';
import { useAuthStore } from '../../store/authStore';
import { router } from 'expo-router';
import Button from '../../components/Button';
import { StatusBar } from 'expo-status-bar';

interface MatchingCardProps {
  matching: Matching;
  onViewProfessionalDetails: (id: number) => void;
}

const MatchingCard: React.FC<MatchingCardProps> = ({ matching, onViewProfessionalDetails }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={() => onViewProfessionalDetails(matching.profissional.id)}>
      <Text style={styles.cardTitle}>Profissional: {matching.profissional.usuario.nome}</Text>
      <Text style={styles.cardDetail}>Especializações: {matching.profissional.especializacoes?.join(', ') || 'N/A'}</Text>
      <Text style={styles.cardDetail}>Avaliação Média: {matching.profissional.avaliacaoMedia?.toFixed(1) || 'N/A'}</Text>
      {/* O campo pontuacao existe no backend, se o backend retornar ele, será exibido */}
      {typeof matching.pontuacao === 'number' && <Text style={styles.cardDetail}>Pontuação de Matching: {matching.pontuacao.toFixed(2)}</Text>}
      <Text style={styles.cardDetail}>Sugerido em: {new Date(matching.dataSugestao).toLocaleDateString()}</Text>
      <Button
        title="Ver Perfil do Profissional"
        onPress={() => onViewProfessionalDetails(matching.profissional.id)}
        style={styles.viewProfileButton}
        textStyle={{ fontSize: 14 }}
      />
    </TouchableOpacity>
  );
};

export default function MatchingScreen() {
  const { user, token } = useAuthStore();
  const [matchingSuggestions, setMatchingSuggestions] = useState<Matching[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const handleSuggestMatching = async () => {
    if (user?.tipo !== 'USUARIO') {
      Alert.alert('Acesso Negado', 'Apenas usuários comuns podem solicitar sugestões de matching.');
      return;
    }
    setLoading(true);
    try {
      const response = await axiosInstance.post<Matching[]>('/matching/sugerir');

      console.log('Resposta do Matching:', response);
      console.log('Dados do Matching (response.data):', response.data);
      console.log('Status do Matching:', response.status);

      setMatchingSuggestions(response.data);
      // MELHORIA AQUI: Mensagem mais detalhada se não houver sugestões
      if (response.data.length === 0) {
        Alert.alert('Sem Sugestões', 'Nenhuma sugestão de profissional encontrada com base nos seus critérios.\n\nSugestões:\n- Preencha mais detalhes no seu perfil (neurodivergência, hobbies).\n- Verifique se há profissionais com perfis completos na plataforma que se encaixem nos seus critérios.');
      }
    } catch (error: any) {
      console.error('Erro ao buscar sugestões de matching:', error.response?.data || error.message);
      // Melhorar a mensagem de erro para o usuário final
      let errorMessage = 'Não foi possível buscar sugestões de matching.';
      if (error.response && error.response.data && typeof error.response.data.message === 'string') {
        errorMessage = error.response.data.message;
      } else if (error.response && error.response.status === 500) {
        errorMessage = 'Ocorreu um erro interno no servidor ao buscar sugestões. Verifique se seu perfil e o dos profissionais estão completos.';
      } else if (error.request) {
        errorMessage = 'Problema de conexão com o servidor. Verifique sua internet ou o status do backend.';
      }
      Alert.alert('Erro no Matching', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleViewProfessionalDetails = (professionalId: number) => {
    router.push(`/(tabs)/professionals/${professionalId}`);
  };

  if (user?.tipo !== 'USUARIO') {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <Text style={styles.title}>Matching de Profissionais</Text>
        <Text style={styles.infoText}>Esta funcionalidade está disponível apenas para usuários (pacientes/familiares).</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Text style={styles.title}>Matching de Profissionais</Text>

      <Button
        title={loading ? "Buscando Sugestões..." : "Buscar Sugestões de Matching"}
        onPress={handleSuggestMatching}
        disabled={loading}
        style={styles.searchButton}
      />

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primaryBlue} />
        </View>
      )}

      {!loading && matchingSuggestions.length > 0 && (
        <FlatList
          data={matchingSuggestions}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <MatchingCard matching={item} onViewProfessionalDetails={handleViewProfessionalDetails} />
          )}
          contentContainerStyle={styles.listContent}
        />
      )}

      {!loading && matchingSuggestions.length === 0 && (
        // MELHORIA AQUI: Mensagem mais detalhada se não houver sugestões
        <Text style={styles.emptyListText}>
          Nenhum profissional encontrado com base nos seus critérios.
          {"\n\n"}Sugestões:
          {"\n"}- Preencha mais detalhes no seu perfil (neurodivergência, hobbies).
          {"\n"}- Verifique se há profissionais com perfis completos na plataforma que se encaixem nos seus critérios.
        </Text>
      )}
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
    marginTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.primaryBlue,
    marginBottom: 20,
    textAlign: 'center',
  },
  infoText: {
    fontSize: 16,
    color: Colors.textDark,
    textAlign: 'center',
    marginHorizontal: 20,
    marginTop: 20,
  },
  searchButton: {
    marginHorizontal: 20,
    marginBottom: 20,
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
    borderLeftColor: Colors.primaryBlue,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.textDark,
    marginBottom: 5,
  },
  cardDetail: {
    fontSize: 14,
    color: Colors.textDark,
    marginBottom: 3,
  },
  viewProfileButton: {
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    width: 'auto',
  },
  emptyListText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: Colors.textDark,
  },
});