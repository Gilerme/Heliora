import { FontAwesome } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  FlatList,
  Modal,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { styles } from "../styles/HomeStyles";

export default function HomeScreen() {
  const router = useRouter();
  const [ultimoRegistro, setUltimoRegistro] = useState(null);
  const [exames, setExames] = useState([]);
  const [modalExamesVisivel, setModalExamesVisivel] = useState(false);

  const carregarDadosHome = useCallback(async () => {
    try {
      const dados = await AsyncStorage.getItem("@heliora_registros");
      if (dados) {
        const lista = JSON.parse(dados);

        // 1. Pegar o ÚLTIMO (mais recente por ID/Timestamp)
        const ordenados = [...lista].sort((a, b) => b.id - a.id);
        setUltimoRegistro(ordenados[0]);

        // 2. Filtrar apenas os EXAMES para o acesso rápido
        const apenasExames = lista.filter((item) => item.tipo === "Exame");
        setExames(apenasExames);
      }
    } catch (error) {
      console.error("Erro ao carregar dados na Home:", error);
    }
  }, []);

  // Recarrega sempre que a tela ganha foco
  useFocusEffect(
    useCallback(() => {
      carregarDadosHome();
    }, [carregarDadosHome]),
  );

  // Função para navegar para detalhes (reutilizando a lógica do histórico)
  const verDetalhes = (item) => {
    router.push({
      pathname: "/detalhes",
      params: { dados: JSON.stringify(item) },
    });
  };
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
            onPress={() => setModalExamesVisivel(true)}
          >
            <View
              style={[
                styles.quickAccessIconBox,
                { backgroundColor: "#EBF8FF" },
              ]}
            >
              <FontAwesome name="flask" size={24} color="#4A729A" />
            </View>
            <Text style={styles.quickAccessText}>Exames</Text>
          </TouchableOpacity>
        </View>

        {/* SEÇÃO: ÚLTIMO REGISTRO */}
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Último Registro</Text>

          {ultimoRegistro ? (
            <TouchableOpacity
              style={styles.cardUltimo}
              onPress={() => verDetalhes(ultimoRegistro)}
            >
              <View style={styles.cardIconContainer}>
                <FontAwesome
                  name={
                    ultimoRegistro.tipo === "Consulta"
                      ? "user-md"
                      : ultimoRegistro.tipo === "Exame"
                        ? "flask"
                        : "vial"
                  }
                  size={24}
                  color="#4A729A"
                />
              </View>
              <View style={styles.cardTextContainer}>
                <Text style={styles.cardTitulo}>{ultimoRegistro.titulo}</Text>
                <Text style={styles.cardSubtitulo}>
                  {ultimoRegistro.data} • {ultimoRegistro.local}
                </Text>
              </View>
              <FontAwesome name="chevron-right" size={16} color="#CBD5E0" />
            </TouchableOpacity>
          ) : (
            <View style={styles.cardVazio}>
              <Text style={styles.textoVazio}>Nenhum registro recente.</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* MODAL DE LISTA DE EXAMES */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalExamesVisivel}
        onRequestClose={() => setModalExamesVisivel(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Meus Exames</Text>
              <TouchableOpacity onPress={() => setModalExamesVisivel(false)}>
                <FontAwesome name="close" size={28} color="#CBD5E0" />
              </TouchableOpacity>
            </View>

            <FlatList
              data={exames}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.itemExameModal}
                  onPress={() => {
                    setModalExamesVisivel(false);
                    verDetalhes(item);
                  }}
                >
                  <FontAwesome
                    name="file-text-o"
                    size={20}
                    color="#4A729A"
                    style={{ marginRight: 15 }}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.tituloExameModal}>{item.titulo}</Text>
                    <Text style={styles.dataExameModal}>{item.data}</Text>
                  </View>
                  <FontAwesome name="angle-right" size={20} color="#4A729A" />
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text style={styles.textoVazioModal}>
                  Nenhum exame cadastrado.
                </Text>
              }
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
