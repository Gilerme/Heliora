import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { styles } from "../styles/PerfilStyles";

export default function PerfilScreen() {
  const router = useRouter();

  const fazerLogout = () => {
    // Usamos o replace para que o usuário não consiga "voltar" para o perfil logado
    // após ir para a tela principal (index/login)
    router.replace("/");
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* CABEÇALHO AZUL COM AVATAR */}
        <View style={styles.header}>
          <TouchableOpacity
            style={{ position: "absolute", top: 40, right: 20, zIndex: 10 }}
            onPress={() => router.back()}
          >
            <FontAwesome name="times" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.avatar}>
            <FontAwesome name="user" size={50} color="#4A729A" />
          </View>
          <Text style={styles.nome}>Bianca</Text>
          <Text style={styles.email}>bianca@email.com</Text>
        </View>

        {/* LISTA DE OPÇÕES DO MENU */}
        <View style={styles.menuContainer}>
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIconBox}>
              <FontAwesome name="cog" size={20} color="#4A729A" />
            </View>
            <Text style={styles.menuText}>Configurações</Text>
            <FontAwesome name="chevron-right" size={16} color="#CCCCCC" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIconBox}>
              <FontAwesome name="shield" size={20} color="#4A729A" />
            </View>
            <Text style={styles.menuText}>Privacidade e Segurança</Text>
            <FontAwesome name="chevron-right" size={16} color="#CCCCCC" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIconBox}>
              <FontAwesome name="question-circle" size={20} color="#4A729A" />
            </View>
            <Text style={styles.menuText}>Ajuda e Suporte</Text>
            <FontAwesome name="chevron-right" size={16} color="#CCCCCC" />
          </TouchableOpacity>

          {/* BOTÃO DE SAIR */}
          <TouchableOpacity style={styles.menuItem} onPress={fazerLogout}>
            <View style={styles.menuIconBox}>
              <FontAwesome name="sign-out" size={20} color="#E53E3E" />
            </View>
            <Text style={[styles.menuText, styles.logoutText]}>
              Sair da Conta
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
