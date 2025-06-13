// app/(tabs)/professionals.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { Colors } from '../../constants/Colors';
import axiosInstance from '../../api/axiosInstance';
import { Professional, UserType } from '../../types';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useAuthStore } from '../../store/authStore';
import { MaterialIcons } from '@expo/vector-icons';
import Button from '../../components/Button';

interface ProfessionalCardProps {
  professional: Professional;
  onViewDetails: (id: number) => void;
  onFavoriteToggle: (id: number, isFavorited: boolean) => void;
  isFavorited: boolean;
}

const ProfessionalCard: React.FC<ProfessionalCardProps> = ({ professional, onViewDetails, onFavoriteToggle, isFavorited }) => {
  const professionalName = professional.usuario?.nome || 'Profissional Desconhecido';

  return (
    <TouchableOpacity style={styles.card} onPress={() => onViewDetails(professional.id)}>
      <Text style={styles.cardName}>{professionalName}</Text>
      <Text style={styles.cardDetail}>Especializações: {professional.especializacoes?.join(', ') || 'N/A'}</Text>
      <Text style={styles.cardDetail}>Disponibilidade: {professional.disponibilidade || 'N/A'}</Text>
      <View style={styles.cardActions}>
        <TouchableOpacity onPress={() => onFavoriteToggle(professional.id, isFavorited)} style={styles.favoriteButton}>
          <MaterialIcons name={isFavorited ? "favorite" : "favorite-border"} size={24} color={Colors.primaryBlue} />
        </TouchableOpacity>
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
  const [favoritedProfessionals, setFavoritedProfessionals] = useState<Set<number>>(new Set());
  const { user } = useAuthStore();

  useEffect(() => {
    fetchProfessionals();
    if (user?.tipo === 'USUARIO') {
      fetchFavorites();
    }
  }, [user?.tipo]);

  const fetchProfessionals = async () => {
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
  };

  const fetchFavorites = async () => {
    try {
      const response = await axiosInstance.get<any[]>('/favoritos/me');
      const favoriteIds = new Set(response.data.map(fav => fav.profissional.id));
      setFavoritedProfessionals(favoriteIds);
    } catch (error: any) {
      console.error('Erro ao carregar favoritos:', error.response?.data || error.message);
    }
  };

  const handleViewDetails = (id: number) => {
    router.push(`/(tabs)/professionals/${id}`);
  };

  // CORREÇÃO: Verifique a definição e o uso de professionalId AQUI
  const handleFavoriteToggle = async (profissionalId: number, isCurrentlyFavorited: boolean) => {
    console.log(`handleFavoriteToggle chamado. ID do profissional: ${profissionalId}, Favoritado atualmente: ${isCurrentlyFavorited}`); // Log para depuração

    if (user?.tipo !== 'USUARIO') {
      Alert.alert('Acesso Negado', 'Apenas usuários comuns podem favoritar profissionais.');
      return;
    }

    try {
      if (isCurrentlyFavorited) {
        // Desfavoritar
        // A linha 102 no seu erro original deve ser esta abaixo:
        await axiosInstance.delete(`/favoritos/${profissionalId}`); // professionalId deve estar no escopo
        setFavoritedProfessionals(prev => {
          const newSet = new Set(prev);
          newSet.delete(profissionalId);
          return newSet;
        });
        Alert.alert('Sucesso', 'Profissional removido dos favoritos.');
      } else {
        // Favoritar
        await axiosInstance.post('/favoritos', { profissionalId });
        setFavoritedProfessionals(prev => new Set(prev).add(profissionalId));
        Alert.alert('Sucesso', 'Profissional adicionado aos favoritos!');
      }
    } catch (error: any) {
      console.error('Erro ao favoritar/desfavoritar:', error.response?.data || error.message);
      Alert.alert('Erro', error.response?.data?.message || 'Não foi possível atualizar favoritos.');
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
            onFavoriteToggle={handleFavoriteToggle} // Passando a função como prop
            isFavorited={favoritedProfessionals.has(item.id)}
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  favoriteButton: {
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