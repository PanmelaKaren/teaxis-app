// app/(tabs)/settings.tsx
import React from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { Colors } from '../../constants/Colors';
import Button from '../../components/Button';
import { useAuthStore } from '../../store/authStore';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { MaterialIcons } from '@expo/vector-icons';
import axiosInstance from '../../api/axiosInstance'; // Importar axiosInstance

export default function SettingsScreen() {
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const [loadingDelete, setLoadingDelete] = React.useState(false);

  const handleDeleteAccount = () => {
    Alert.alert(
      "Excluir Conta",
      "Tem certeza que deseja excluir sua conta? Esta ação é irreversível.",
      [
        {
          text: "Cancelar",
          style: "cancel"
        },
        {
          text: "Confirmar Exclusão",
          onPress: async () => {
            if (!user?.id) {
                Alert.alert('Erro', 'Não foi possível identificar seu usuário para exclusão.');
                return;
            }
            setLoadingDelete(true);
            try {
              await axiosInstance.delete(`/usuarios/${user.id}`);
              Alert.alert('Sucesso', 'Sua conta foi excluída com sucesso.');
              logout();
              router.replace('/');
            } catch (error: any) {
              console.error('Erro ao excluir conta:', error.response?.data || error.message);
              Alert.alert('Erro', error.response?.data?.message || 'Não foi possível excluir sua conta. Tente novamente.');
            } finally {
                setLoadingDelete(false);
            }
          },
          style: "destructive"
        }
      ],
      { cancelable: true }
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <MaterialIcons name="settings" size={60} color={Colors.primaryBlue} style={styles.icon} />
      <Text style={styles.title}>Configurações</Text>
      <Text style={styles.subtitle}>Gerencie suas preferências e conta.</Text>

      <View style={styles.buttonGroup}>
        <Button
          title="Alterar Senha"
          onPress={() => Alert.alert('Funcionalidade', 'Em desenvolvimento: Alterar Senha')}
          style={styles.settingButton}
          textStyle={styles.settingButtonText}
        />
        <Button
          title="Privacidade"
          onPress={() => Alert.alert('Funcionalidade', 'Em desenvolvimento: Configurações de Privacidade')}
          style={styles.settingButton}
          textStyle={styles.settingButtonText}
        />
        <Button
          title={loadingDelete ? "Excluindo..." : "Excluir Conta"}
          onPress={handleDeleteAccount}
          style={[styles.settingButton, styles.deleteButton]}
          disabled={loadingDelete}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
    padding: 20,
  },
  icon: {
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: Colors.primaryBlue,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textDark,
    textAlign: 'center',
    marginBottom: 40,
  },
  buttonGroup: {
    width: '100%',
    marginTop: 20,
  },
  settingButton: {
    backgroundColor: Colors.secondaryBlue,
    marginBottom: 15,
  },
  settingButtonText: {
    color: Colors.background,
  },
  deleteButton: {
    backgroundColor: Colors.errorRed,
  },
});