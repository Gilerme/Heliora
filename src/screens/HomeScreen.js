import { FontAwesome5 } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  DeviceEventEmitter,
  FlatList,
  Image,
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
  const [nomeUsuario, setNomeUsuario] = useState("Usuário");
  const [fotoUsuario, setFotoUsuario] = useState(null);

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

  useEffect(() => {
    carregarPerfil();

    // Fica escutando o evento emitido pela tela de Perfil
    const listener = DeviceEventEmitter.addListener(
      "atualizarPerfilHome",
      () => {
        carregarPerfil();
      },
    );

    return () => {
      listener.remove(); // Limpa o ouvinte por segurança
    };
  }, []);

  const carregarPerfil = async () => {
    try {
      const dados = await AsyncStorage.getItem("@heliora_perfil");
      if (dados) {
        const perfil = JSON.parse(dados);
        if (perfil.nome) {
          setNomeUsuario(perfil.nome.split(" ")[0]); // Pega só o primeiro nome
        }
        if (perfil.fotoPerfil) {
          setFotoUsuario(perfil.fotoPerfil);
        }
      }
    } catch (e) {
      console.error("Erro ao carregar perfil na Home", e);
    }
  };
  return (
    <SafeAreaView style={styles.container}>
      {/* Usando ScrollView para permitir rolagem caso a tela fique cheia */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* CABEÇALHO */}
        <View style={styles.header}>
          <View>
            <Text style={styles.saudacao}>Olá,</Text>
            <Text style={styles.nomeUsuario}>{nomeUsuario} 👋</Text>
          </View>

          <TouchableOpacity
            style={styles.perfilBotao}
            onPress={() => router.push("/perfil")}
          >
            {fotoUsuario ? (
              <Image
                source={{ uri: fotoUsuario }}
                style={{ width: 50, height: 50, borderRadius: 25 }}
              />
            ) : (
              <FontAwesome5 name="user" size={24} color="#4A729A" />
            )}
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
            <FontAwesome5
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
              <FontAwesome5 name="allergies" size={24} color="#4A729A" />
            </View>
            <Text style={styles.quickAccessText}>Alergias</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.quickAccessCard}
            onPress={() => router.push("/condicoes")}
          >
            <View style={styles.quickAccessIconBox}>
              <FontAwesome5 name="heartbeat" size={24} color="#4A729A" />
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
              <FontAwesome5 name="flask" size={24} color="#4A729A" />
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
                <FontAwesome5
                  name={
                    ultimoRegistro.tipo === "Consulta"
                      ? "user-md"
                      : ultimoRegistro.tipo === "Exame"
                        ? "flask"
                        : ultimoRegistro.tipo === "Vacina"
                          ? "syringe"
                          : "medkit"
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
              <FontAwesome5 name="chevron-right" size={16} color="#CBD5E0" />
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
                <FontAwesome5 name="close" size={28} color="#CBD5E0" />
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
                  <FontAwesome5
                    name="file-text-o"
                    size={20}
                    color="#4A729A"
                    style={{ marginRight: 15 }}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.tituloExameModal}>{item.titulo}</Text>
                    <Text style={styles.dataExameModal}>{item.data}</Text>
                  </View>
                  <FontAwesome5 name="angle-right" size={20} color="#4A729A" />
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
