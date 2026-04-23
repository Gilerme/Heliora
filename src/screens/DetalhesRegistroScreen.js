import { FontAwesome } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import {
  Alert,
  DeviceEventEmitter,
  Image,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { styles } from "../styles/DetalhesRegistroStyles";

export default function DetalhesRegistroScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const registro = params.dados ? JSON.parse(params.dados) : null;

  const confirmarExclusao = () => {
    Alert.alert(
      "Excluir Registro",
      "Tem certeza que deseja apagar este documento? Essa ação não pode ser desfeita.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Sim, Excluir",
          style: "destructive", // Deixa o botão vermelho no iOS
          onPress: excluirRegistro,
        },
      ],
    );
  };

  const excluirRegistro = async () => {
    try {
      const registrosSalvos = await AsyncStorage.getItem("@heliora_registros");
      let lista = registrosSalvos ? JSON.parse(registrosSalvos) : [];

      // Filtra os itens. Vai manter na lista apenas quem tiver a DATA diferente do item atual.
      const novaLista = lista.filter((item) => item.data !== registro.data);

      await AsyncStorage.setItem(
        "@heliora_registros",
        JSON.stringify(novaLista),
      );

      Alert.alert("Sucesso", "Registro apagado com sucesso!", [
        {
          text: "OK",
          onPress: () => {
            // "Grita" no rádio comunicador que a lista mudou
            DeviceEventEmitter.emit("atualizarHistorico");
            router.back();
          },
        },
      ]);
    } catch (error) {
      console.error("Erro ao excluir:", error);
      Alert.alert("Erro", "Não foi possível excluir o registro.");
    }
  };

  if (!registro) {
    return (
      <SafeAreaView style={styles.container}>
        <Text style={{ padding: 20 }}>Erro ao carregar dados.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <StatusBar style="dark" />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.botaoVoltar}
        >
          <FontAwesome name="arrow-left" size={20} color="#4A729A" />
        </TouchableOpacity>
        <Text style={[styles.tituloHeader, { flex: 1 }]}>
          Detalhes do Registro
        </Text>
        <TouchableOpacity
          onPress={() =>
            router.push({
              pathname: "/editar",
              params: { dados: JSON.stringify(registro) },
            })
          }
          style={{ padding: 10, marginRight: 5 }}
        >
          <FontAwesome name="pencil" size={24} color="#4A729A" />
        </TouchableOpacity>

        <TouchableOpacity onPress={confirmarExclusao} style={{ padding: 10 }}>
          <FontAwesome name="trash-o" size={24} color="#E53E3E" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.label}>Título</Text>
        <Text style={styles.valor}>{registro.titulo}</Text>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginTop: 10,
          }}
        >
          <View>
            <Text style={styles.label}>Data</Text>
            <Text style={styles.valor}>{registro.data}</Text>
          </View>
          <View>
            <Text style={styles.label}>Tipo</Text>
            <Text style={styles.valor}>{registro.tipo}</Text>
          </View>
        </View>

        <Text style={styles.label}>Local / Profissional</Text>
        <Text style={styles.valor}>
          {registro.local ? registro.local : "Não informado"}
        </Text>

        {registro.notas ? (
          <View>
            <Text style={styles.label}>Notas</Text>
            <View style={styles.notasContainer}>
              <Text style={styles.notasTexto}>{registro.notas}</Text>
            </View>
          </View>
        ) : null}

        {registro.anexo ? (
          <View>
            <Text style={styles.anexoTitulo}>Documento Anexo</Text>
            {registro.anexo.tipo === "imagem" ? (
              <Image
                source={{ uri: registro.anexo.uri }}
                style={styles.imagemFull}
              />
            ) : (
              <View style={styles.pdfCardFull}>
                <FontAwesome name="file-pdf-o" size={32} color="#E53E3E" />
                <Text style={styles.pdfNome}>
                  {registro.anexo.nome ? registro.anexo.nome : "Documento PDF"}
                </Text>
              </View>
            )}
          </View>
        ) : null}

        <View style={{ height: 80 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
