import { FontAwesome } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRouter } from "expo-router"; // Importante para recarregar a tela
import React, { useCallback, useState } from "react";
import {
  FlatList,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { styles } from "../styles/HistoricoStyles";

export default function HistoricoScreen() {
  const [registros, setRegistros] = useState([]);
  const router = useRouter();
  // Recarrega os dados toda vez que a aba ganha foco
  useFocusEffect(
    useCallback(() => {
      carregarRegistros();
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
        return { bg: "#F0FFF4", color: "#38A169", icon: "shield" };
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
          <FontAwesome name={estilo.icon} size={24} color={estilo.color} />
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
          <FontAwesome
            name="paperclip"
            size={16}
            color="#CBD5E0"
            style={{ marginLeft: 8 }}
          />
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.tituloTela}>Meu Histórico</Text>
        <Text style={styles.descricao}>
          Acompanhe todas as suas consultas, exames e vacinas.
        </Text>
      </View>

      <FlatList
        data={registros}
        keyExtractor={(item) => item.id}
        renderItem={renderizarItem}
        contentContainerStyle={styles.listaContainer}
        showsVerticalScrollIndicator={false}
        // Mostra isso caso o cofre esteja vazio
        ListEmptyComponent={
          <Text style={styles.mensagemVazia}>
            {
              "Você ainda não tem nenhum registro salvo. Adicione no botão '+' na tela inicial!"
            }
          </Text>
        }
      />
    </SafeAreaView>
  );
}
