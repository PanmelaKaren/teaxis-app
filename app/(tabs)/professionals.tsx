// app/(tabs)/professionals.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { Colors } from '../../constants/Colors';
import axiosInstance from '../../api/axiosInstance';
import { Professional, UserType } from '../../types';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '../../store/authStore';
import { MaterialIcons } from '@expo/vector-icons'; // Manter se usar MaterialIcons para outros ícones, senão pode remover
import Button from '../../components/Button';
import { useFocusEffect } from '@react-navigation/native';


interface ProfessionalCardProps {
  professional: Professional;
  onViewDetails: (id: number) => void;
  // REMOVIDO: onFavoriteToggle e isFavorited
}

// ProfessionalCard sem a funcionalidade de favoritos
const ProfessionalCard: React.FC<ProfessionalCardProps> = ({ professional, onViewDetails }) => {
  const professionalName = professional.usuario?.nome || 'Profissional Desconhecido';

  return (
    <TouchableOpacity style={styles.card} onPress={() => onViewDetails(professional.id)}>
      <Text style={styles.cardName}>{professionalName}</Text>
      <Text style={styles.cardDetail}>Especializações: {professional.especializacoes?.join(', ') || 'N/A'}</Text>
      <Text style={styles.cardDetail}>Disponibilidade: {professional.disponibilidade || 'N/A'}</Text>
      <View style={styles.cardActions}>
        {/* REMOVIDO: Botão de favoritar */}
        <Button
          title="Ver Perfil"
          onPress={() => onViewDetails(professional.id)}
          style={styles.viewProfileButton}
          textStyle={{ fontSize: 14 }}
        />
      </View>
    </TouchableOpacity>
  );
};

export default function ProfessionalsScreen() {
  const [professionals, setProfessionals] = useState<Professional[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  // REMOVIDO: favoritedProfessionals state
  const { user } = useAuthStore();

  const fetchProfessionals = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get<Professional[]>('/profissionais');
      setProfessionals(response.data);
    } catch (error: any) {
      console.error('Erro ao carregar profissionais:', error.response?.data || error.message);
      Alert.alert('Erro', error.response?.data?.message || 'Não foi possível carregar a lista de profissionais.');
    } finally {
      setLoading(false);
    }
  }, []);

  // REMOVIDO: fetchFavorites function

  // AGORA USAMOS useFocusEffect para refetch quando a tela está em foco
  useFocusEffect(
    useCallback(() => {
      fetchProfessionals();
      // REMOVIDO: Chamada a fetchFavorites
      return () => {
        // Lógica de limpeza
      };
    }, [fetchProfessionals]) // Dependências: apenas fetchProfessionals
  );

  const handleViewDetails = (id: number) => {
    router.push(`/(tabs)/professionals/${id}`);
  };

  // REMOVIDO: handleFavoriteToggle function

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primaryBlue} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Text style={styles.title}>Encontre um Profissional</Text>
      <FlatList
        data={professionals}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <ProfessionalCard
            professional={item}
            onViewDetails={handleViewDetails}
            // REMOVIDO: onFavoriteToggle e isFavorited props
          />
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.emptyListText}>Nenhum profissional encontrado.</Text>
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
  title: {
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
    borderLeftColor: Colors.primaryBlue,
  },
  cardName: {
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
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end', // Ajustado para alinhar o botão "Ver Perfil" à direita
    alignItems: 'center',
    marginTop: 10,
  },
  favoriteButton: { // Mantenha o estilo se for referenciado em outro lugar ou remova
    padding: 5,
  },
  viewProfileButton: {
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