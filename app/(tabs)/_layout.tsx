// app/(tabs)/_layout.tsx
import React from 'react';
import { Tabs } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors'; // Ajustado
import { useAuthStore } from '../../store/authStore'; // Ajustado
import { router } from 'expo-router';
import { TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { StatusBar } from 'expo-status-bar';

export default function AppLayout() {
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    Alert.alert(
      "Sair do aplicativo",
      "Tem certeza que deseja sair?",
      [
        {
          text: "Cancelar",
          style: "cancel"
        },
        {
          text: "Sair",
          onPress: () => {
            logout();
            router.replace('/');
          }
        }
      ],
      { cancelable: false }
    );
  };

  return (
    <>
      <StatusBar style="light" />
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors.primaryBlue,
          tabBarInactiveTintColor: Colors.secondaryBlue,
          tabBarStyle: {
            backgroundColor: Colors.background,
            borderTopWidth: 0,
            elevation: 5,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 2,
          },
          headerStyle: {
            backgroundColor: Colors.primaryBlue,
          },
          headerTintColor: Colors.background,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerRight: () => (
            <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
              <MaterialIcons name="logout" size={24} color={Colors.background} />
            </TouchableOpacity>
          ),
          // Correção: `headerBackTitleVisible` não é uma propriedade direta de Tabs.Screen options,
          // mas sim de Stack.Screen dentro de uma Stack Navigator.
          // Se for usado em uma Stack dentro de uma Tab, ele é válido.
          // Aqui, no _layout de Tabs, não é aplicável.
          // O erro "Object literal may only specify known properties" é por isso.
          // Removendo aqui, se for necessário, deve ser colocado no _layout de Stack.
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => <MaterialIcons name="home" size={28} color={color} />,
          }}
        />
        <Tabs.Screen
          name="professionals"
          options={{
            title: 'Profissionais',
            tabBarIcon: ({ color }) => <MaterialIcons name="people" size={28} color={color} />,
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Meu Perfil',
            tabBarIcon: ({ color }) => <MaterialIcons name="person" size={28} color={color} />,
            headerShown: false,
          }}
        />
        <Tabs.Screen
          name="sessions"
          options={{
            title: 'Minhas Sessões',
            tabBarIcon: ({ color }) => <MaterialIcons name="event" size={28} color={color} />,
            headerShown: false,
          }}
        />
        <Tabs.Screen
          name="matching"
          options={{
            title: 'Matching',
            tabBarIcon: ({ color }) => <MaterialIcons name="auto-awesome" size={28} color={color} />,
          }}
        />
         <Tabs.Screen
          name="settings"
          options={{
            title: 'Configurações',
            tabBarIcon: ({ color }) => <MaterialIcons name="settings" size={28} color={color} />,
          }}
        />
      </Tabs>
    </>
  );
}

const styles = StyleSheet.create({
  logoutButton: {
    marginRight: 15,
  },
});