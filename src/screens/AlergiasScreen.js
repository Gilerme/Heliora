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
import { styles } from "../styles/AlergiasStyles";

const API_URL = "http://192.168.0.163:8000";

export default function AlergiasScreen() {
  const router = useRouter();
  const [novaAlergia, setNovaAlergia] = useState("");
  // 1. Iniciamos a lista vazia
  const [listaAlergias, setListaAlergias] = useState([]);

  // 2. Carrega as alergias salvas assim que a tela abre
  useEffect(() => {
    carregarAlergias();
  }, []);

  const carregarAlergias = async () => {
    try {
      const idPaciente = await AsyncStorage.getItem("id_paciente");
      if (idPaciente) {
        // Busca da API primeiro
        try {
          const response = await axios.get(`${API_URL}/pacientes/${idPaciente}/alergias`);
          const alergiasAPI = response.data;
          // Pode formatar as chaves se a API retornar diferente do que a tela espera
          // A API retorna [{"id": 1, "nome": "Amendoim"}] que bate perfeitamente com a necessidade
          setListaAlergias(alergiasAPI);
          salvarAlergiasLocal(alergiasAPI); // Sincroniza no AsyncStorage
        } catch (apiError) {
          console.error("Erro ao carregar alergias da API:", apiError);
          // Fallback para os dados salvos localmente
          const dadosSalvos = await AsyncStorage.getItem("@heliora_alergias");
          if (dadosSalvos) {
            setListaAlergias(JSON.parse(dadosSalvos));
          }
        }
      } else {
        const dadosSalvos = await AsyncStorage.getItem("@heliora_alergias");
        if (dadosSalvos) {
          setListaAlergias(JSON.parse(dadosSalvos));
        }
      }
    } catch (error) {
      console.error("Erro geral ao carregar alergias:", error);
    }
  };

  // 3. Função auxiliar para salvar no celular
  const salvarAlergiasLocal = async (novaLista) => {
    try {
      await AsyncStorage.setItem(
        "@heliora_alergias",
        JSON.stringify(novaLista),
      );
    } catch (error) {
      console.error("Erro ao salvar alergias:", error);
    }
  };

  const adicionarAlergia = async () => {
    if (novaAlergia.trim() === "") return;

    try {
      const idPaciente = await AsyncStorage.getItem("id_paciente");
      if (!idPaciente) {
        console.error("Paciente ID não encontrado no AsyncStorage");
        return;
      }
      
      const response = await axios.post(`${API_URL}/pacientes/${idPaciente}/alergias?nome=${novaAlergia.trim()}`);
      
      // Resposta da API retorna o ID gerado pelo banco
      const novoObjeto = {
        id: response.data.id || Date.now().toString(),
        nome: novaAlergia.trim(),
      };

      const novaLista = [...listaAlergias, novoObjeto];
      setListaAlergias(novaLista);
      salvarAlergiasLocal(novaLista);
      setNovaAlergia("");
    } catch (error) {
      console.error("Erro ao salvar alergia na API:", error);
    }
  };

  const removerAlergia = (idParaRemover) => {
    const listaFiltrada = listaAlergias.filter(
      (item) => item.id !== idParaRemover,
    );  
    setListaAlergias(listaFiltrada);
    salvarAlergiasLocal(listaFiltrada); // 🚨 Salva a atualização
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.tituloTela}>Alergias</Text>
        <TouchableOpacity onPress={() => router.back()}>
          <FontAwesome name="times" size={24} color="#999" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.descricao}>
          Liste medicamentos, alimentos ou materiais (como látex) que causam
          reações alérgicas para acesso rápido em emergências.
        </Text>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Adicionar nova alergia..."
            placeholderTextColor="#A0AEC0"
            value={novaAlergia}
            onChangeText={setNovaAlergia}
            onSubmitEditing={adicionarAlergia}
          />
          <TouchableOpacity
            style={styles.botaoAdicionar}
            onPress={adicionarAlergia}
          >
            <FontAwesome name="plus" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.tagsContainer}>
          {listaAlergias.length === 0 ? (
            <Text style={{ color: "#999", fontStyle: "italic", marginTop: 10 }}>
              Nenhuma alergia registrada.
            </Text>
          ) : (
            listaAlergias.map((item) => (
              <View key={item.id} style={styles.tag}>
                <Text style={styles.tagText}>{item.nome}</Text>
                <TouchableOpacity
                  style={styles.botaoRemoverTag}
                  onPress={() => removerAlergia(item.id)}
                >
                  <FontAwesome name="times-circle" size={16} color="#E53E3E" />
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
