import { FontAwesome } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
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

const API_URL = "http://192.168.0.163:8000";

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
      const idPaciente = await AsyncStorage.getItem("id_paciente");
      if (idPaciente) {
        // Busca da API primeiro
        try {
          const response = await axios.get(`${API_URL}/pacientes/${idPaciente}/condicao`);
          const condicoesAPI = response.data;
          setListaCondicoes(condicoesAPI);
          salvarCondicoesLocal(condicoesAPI); // Sincroniza no AsyncStorage
        } catch (apiError) {
          console.error("Erro ao carregar condições da API:", apiError);
          // Fallback para os dados salvos localmente
          const dadosSalvos = await AsyncStorage.getItem("@heliora_condicoes");
          if (dadosSalvos) {
            setListaCondicoes(JSON.parse(dadosSalvos));
          }
        }
      } else {
        const dadosSalvos = await AsyncStorage.getItem("@heliora_condicoes");
        if (dadosSalvos) {
          setListaCondicoes(JSON.parse(dadosSalvos));
        }
      }
    } catch (error) {
      console.error("Erro geral ao carregar condições:", error);
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

  const adicionarCondicao = async () => {
    if (novaCondicao.trim() === "") return;

    try {
      const idPaciente = await AsyncStorage.getItem("id_paciente");
      if (!idPaciente) {
        console.error("Paciente ID não encontrado no AsyncStorage");
        return;
      }
      
      const response = await axios.post(`${API_URL}/pacientes/${idPaciente}/condicao?nome=${novaCondicao.trim()}`);
      
      // Resposta da API retorna o ID gerado pelo banco
      const novoObjeto = {
        id: response.data.id || Date.now().toString(),
        nome: novaCondicao.trim(),
      };

      const novaLista = [...listaCondicoes, novoObjeto];
      setListaCondicoes(novaLista);
      salvarCondicoesLocal(novaLista);
      setNovaCondicao("");
    } catch (error) {
      console.error("Erro ao salvar condição na API:", error);
    }
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
