import { FontAwesome } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { styles } from "../styles/CondicoesStyles";

export default function CondicoesScreen() {
  const router = useRouter();
  const [novaCondicao, setNovaCondicao] = useState("");
  // 1. Iniciamos a lista vazia
  const [listaCondicoes, setListaCondicoes] = useState([]);

  // 2. Carrega as condições salvas assim que a tela abre
  useEffect(() => {
    carregarCondicoes();
  }, []);

  const carregarCondicoes = async () => {
    try {
      const dadosSalvos = await AsyncStorage.getItem("@heliora_condicoes");
      if (dadosSalvos) {
        setListaCondicoes(JSON.parse(dadosSalvos));
      }
    } catch (error) {
      console.error("Erro ao carregar condições:", error);
    }
  };

  // 3. Função auxiliar para salvar no celular
  const salvarCondicoesLocal = async (novaLista) => {
    try {
      await AsyncStorage.setItem(
        "@heliora_condicoes",
        JSON.stringify(novaLista),
      );
    } catch (error) {
      console.error("Erro ao salvar condições:", error);
    }
  };

  const adicionarCondicao = () => {
    if (novaCondicao.trim() === "") return;

    const novoObjeto = {
      id: Date.now().toString(),
      nome: novaCondicao.trim(),
    };

    const novaLista = [...listaCondicoes, novoObjeto];
    setListaCondicoes(novaLista);
    salvarCondicoesLocal(novaLista); // 🚨 Salva a atualização
    setNovaCondicao("");
  };

  const removerCondicao = (idParaRemover) => {
    const listaFiltrada = listaCondicoes.filter(
      (item) => item.id !== idParaRemover,
    );
    setListaCondicoes(listaFiltrada);
    salvarCondicoesLocal(listaFiltrada); // 🚨 Salva a atualização
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.tituloTela, { color: "#2B6CB0" }]}>
          Condições Médicas
        </Text>
        <TouchableOpacity onPress={() => router.back()}>
          <FontAwesome name="times" size={24} color="#999" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.descricao}>
          Liste doenças crônicas ou condições permanentes que exigem atenção
          especial de profissionais de saúde.
        </Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Adicionar nova condição..."
            placeholderTextColor="#A0AEC0"
            value={novaCondicao}
            onChangeText={setNovaCondicao}
            onSubmitEditing={adicionarCondicao}
          />
          <TouchableOpacity
            style={[styles.botaoAdicionar, { backgroundColor: "#3182CE" }]}
            onPress={adicionarCondicao}
          >
            <FontAwesome name="plus" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.tagsContainer}>
          {listaCondicoes.length === 0 ? (
            <Text style={{ color: "#999", fontStyle: "italic", marginTop: 10 }}>
              Nenhuma condição registrada.
            </Text>
          ) : (
            listaCondicoes.map((item) => (
              <View
                key={item.id}
                style={[
                  styles.tag,
                  { backgroundColor: "#EBF4FF", borderColor: "#BEE3F8" },
                ]}
              >
                <Text style={[styles.tagText, { color: "#2B6CB0" }]}>
                  {item.nome}
                </Text>
                <TouchableOpacity
                  style={styles.botaoRemoverTag}
                  onPress={() => removerCondicao(item.id)}
                >
                  <FontAwesome name="times-circle" size={16} color="#3182CE" />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
