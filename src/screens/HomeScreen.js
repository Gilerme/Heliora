import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
    SafeAreaView,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { styles } from "../styles/HomeStyles";

export default function HomeScreen() {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.container}>
      {/* Usando ScrollView para permitir rolagem caso a tela fique cheia */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* CABEÇALHO */}
        <View style={styles.header}>
          <View>
            <Text style={styles.saudacao}>Olá,</Text>
            <Text style={styles.nomeUsuario}>Bianca 👋</Text>
          </View>

          <TouchableOpacity
            style={styles.perfilBotao}
            onPress={() => router.push("/perfil")}
          >
            <FontAwesome name="user" size={24} color="#4A729A" />
          </TouchableOpacity>
        </View>

        {/* CARD PRINCIPAL (BANNER AZUL) */}
        <View style={styles.banner}>
          <View style={styles.bannerTextContainer}>
            <Text style={styles.bannerTitle}>Como você está hoje?</Text>
            <Text style={styles.bannerSubtitle}>
              Mantenha seus registros de saúde sempre atualizados.
            </Text>

            <TouchableOpacity
              style={styles.bannerButton}
              onPress={() => router.push("/modal")}
            >
              <Text style={styles.bannerButtonText}>+ Novo Registro</Text>
            </TouchableOpacity>
          </View>

          {/* Espaço reservado para a ilustração da médica */}
          <View style={styles.bannerImagePlaceholder}>
            <FontAwesome
              name="stethoscope"
              size={60}
              color="#FFFFFF"
              style={{ opacity: 0.8 }}
            />
          </View>
        </View>

        {/* SEÇÃO DE ACESSO RÁPIDO */}
        <Text style={styles.sectionTitle}>Acesso Rápido</Text>
        <View style={styles.quickAccessRow}>
          <TouchableOpacity
            style={styles.quickAccessCard}
            onPress={() => router.push("/alergias")}
          >
            <View style={styles.quickAccessIconBox}>
              <FontAwesome name="shield" size={24} color="#4A729A" />
            </View>
            <Text style={styles.quickAccessText}>Alergias</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickAccessCard}
            onPress={() => router.push("/condicoes")}
          >
            <View style={styles.quickAccessIconBox}>
              <FontAwesome name="heartbeat" size={24} color="#4A729A" />
            </View>
            <Text style={styles.quickAccessText}>Condições</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickAccessCard}
            onPress={() => router.push("/exames")}
          >
            <View style={styles.quickAccessIconBox}>
              <FontAwesome name="file-text-o" size={24} color="#4A729A" />
            </View>
            <Text style={styles.quickAccessText}>Exames</Text>
          </TouchableOpacity>
        </View>

        {/* SEÇÃO DE ÚLTIMO REGISTRO */}
        <Text style={styles.sectionTitle}>Último Registro</Text>
        <TouchableOpacity style={styles.historyCard}>
          <View style={styles.historyHeader}>
            <Text style={styles.historyType}>
              <FontAwesome name="user-md" size={14} color="#4A729A" /> Consulta
            </Text>
            <Text style={styles.historyDate}>20 Abr 2026</Text>
          </View>

          <Text style={styles.historyTitle}>Clínico Geral</Text>
          <Text style={styles.historySubtitle}>
            Dr. Roberto Almeida - Hospital Santa Maria
          </Text>
        </TouchableOpacity>

        {/* Adicione um View vazio no final apenas para dar um espaço extra na rolagem */}
        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
