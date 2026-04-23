import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { styles } from "../styles/CondicoesStyles"; // Reutilizando a estrutura de estilos

export default function CondicoesScreen() {
  const router = useRouter();

  // Estado para o texto que o usuário está digitando
  const [novaCondicao, setNovaCondicao] = useState("");

  // Lista de condições (pode começar com alguns exemplos ou vazia)
  const [listaCondicoes, setListaCondicoes] = useState([
    { id: "1", nome: "Hipertensão" },
    { id: "2", nome: "Asma" },
    { id: "3", nome: "Diabetes Tipo 2" },
  ]);

  // Função para adicionar a nova condição à lista
  const adicionarCondicao = () => {
    if (novaCondicao.trim() === "") return;

    const novoObjeto = {
      id: Date.now().toString(),
      nome: novaCondicao.trim(),
    };

    setListaCondicoes([...listaCondicoes, novoObjeto]);
    setNovaCondicao(""); // Limpa o campo após adicionar
  };

  // Função para remover uma condição da lista
  const removerCondicao = (idParaRemover) => {
    const listaFiltrada = listaCondicoes.filter(
      (item) => item.id !== idParaRemover,
    );
    setListaCondicoes(listaFiltrada);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* CABEÇALHO */}
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

        {/* ÁREA DE INPUT PARA NOVAS CONDIÇÕES */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Adicionar nova condição..."
            placeholderTextColor="#A0AEC0"
            value={novaCondicao}
            onChangeText={setNovaCondicao}
            onSubmitEditing={adicionarCondicao} // Adiciona ao apertar "Enter"
          />
          <TouchableOpacity
            style={[styles.botaoAdicionar, { backgroundColor: "#3182CE" }]}
            onPress={adicionarCondicao}
          >
            <FontAwesome name="plus" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* LISTAGEM DE TAGS (AZUL) */}
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
