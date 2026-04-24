import { FontAwesome5 } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRouter } from "expo-router"; // Importante para recarregar a tela
import React, { useCallback, useState } from "react";
import {
  DeviceEventEmitter,
  FlatList,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { styles } from "../styles/HistoricoStyles";

export default function HistoricoScreen() {
  const [registros, setRegistros] = useState([]);
  const [searchText, setSearchText] = useState("");
  const router = useRouter();
  // Recarrega os dados toda vez que a aba ganha foco

  useFocusEffect(
    useCallback(() => {
      // 1. CARREGA OS DADOS LOGO DE CARA QUANDO A TELA ABRE
      carregarRegistros();

      // 2. Fica escutando o aviso da tela de detalhes caso algo seja apagado
      const listener = DeviceEventEmitter.addListener(
        "atualizarHistorico",
        () => {
          carregarRegistros();
        },
      );

      return () => {
        listener.remove();
      };
    }, []),
  );

  const carregarRegistros = async () => {
    try {
      const dadosSalvos = await AsyncStorage.getItem("@heliora_registros");
      if (dadosSalvos) {
        // .reverse() faz o mais recente aparecer no topo da lista
        setRegistros(JSON.parse(dadosSalvos).reverse());
      }
    } catch (error) {
      console.error("Erro ao carregar histórico:", error);
    }
  };

  // Define cores e ícones baseados no tipo de registro
  const obterEstiloTipo = (tipo) => {
    switch (tipo) {
      case "Consulta":
        return { bg: "#EBF8FF", color: "#3182CE", icon: "user-md" };
      case "Exame":
        return { bg: "#E9D8FD", color: "#805AD5", icon: "heartbeat" };
      case "Vacina":
        return { bg: "#F0FFF4", color: "#38A169", icon: "syringe" };
      default:
        return { bg: "#EDF2F7", color: "#718096", icon: "file-text" };
    }
  };

  // Função que desenha cada item da lista
  const renderizarItem = ({ item }) => {
    const estilo = obterEstiloTipo(item.tipo);

    return (
      <TouchableOpacity
        style={styles.cardRegistro}
        onPress={() =>
          router.push({
            pathname: "/detalhes",
            params: { dados: JSON.stringify(item) },
          })
        }
      >
        {/* Ícone Redondo */}
        <View style={[styles.iconeContainer, { backgroundColor: estilo.bg }]}>
          <FontAwesome5 name={estilo.icon} size={24} color={estilo.color} />
        </View>

        {/* Textos */}
        <View style={styles.infoContainer}>
          <Text style={styles.tituloRegistro}>{item.titulo}</Text>
          <Text style={styles.detalhesRegistro}>
            {item.data} • {item.local}
          </Text>
          <View style={[styles.tipoBadge, { backgroundColor: estilo.bg }]}>
            <Text style={[styles.tipoTexto, { color: estilo.color }]}>
              {item.tipo}
            </Text>
          </View>
        </View>

        {/* Mostra um clipe de papel se tiver anexo (foto ou pdf) */}
        {item.anexo && (
          <FontAwesome5
            name="paperclip"
            size={16}
            color="#CBD5E0"
            style={{ marginLeft: 8 }}
          />
        )}
      </TouchableOpacity>
    );
  };
  const registrosFiltrados = registros.filter((item) => {
    if (searchText === "") return true; // Se não digitou nada, mostra tudo

    const termo = searchText.toLowerCase();

    // Verifica se o termo digitado existe no título, local ou tipo
    const matchTitulo = item.titulo
      ? item.titulo.toLowerCase().includes(termo)
      : false;
    const matchLocal = item.local
      ? item.local.toLowerCase().includes(termo)
      : false;
    const matchTipo = item.tipo
      ? item.tipo.toLowerCase().includes(termo)
      : false;

    return matchTitulo || matchLocal || matchTipo;
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.tituloTela}>Meu Histórico</Text>
        <Text style={styles.descricao}>
          Acompanhe todas as suas consultas, exames e vacinas.
        </Text>
      </View>

      {/* 🚨 NOVA BARRA DE BUSCA (Estilizada inline para facilitar) */}
      <View style={styles.barraPesquisa}>
        <FontAwesome5 name="search" size={20} color="#A0AEC0" />
        <TextInput
          style={{ flex: 1, marginLeft: 10, fontSize: 16, color: "#2D3748" }}
          placeholder="Buscar consulta, local ou tipo..."
          placeholderTextColor="#A0AEC0"
          value={searchText}
          onChangeText={setSearchText}
        />
        {/* Botão de "X" que só aparece se tiver algo digitado */}
        {searchText.length > 0 && (
          <TouchableOpacity
            onPress={() => setSearchText("")}
            style={{ padding: 5 }}
          >
            <FontAwesome5 name="times-circle" size={20} color="#A0AEC0" />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={registrosFiltrados} // 🚨 MUDE AQUI: De 'registros' para 'registrosFiltrados'
        keyExtractor={(item) => item.id}
        renderItem={renderizarItem}
        contentContainerStyle={styles.listaContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={styles.mensagemVazia}>
            {searchText !== ""
              ? "Nenhum resultado encontrado para a sua busca."
              : "Você ainda não tem nenhum registro salvo. Adicione no botão '+' na tela inicial!"}
          </Text>
        }
      />
    </SafeAreaView>
  );
}
