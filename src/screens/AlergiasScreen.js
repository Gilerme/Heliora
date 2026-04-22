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
import { styles } from "../styles/AlergiasStyles";

export default function AlergiasScreen() {
  const router = useRouter();

  // Estado para o texto que o usuário está digitando
  const [novaAlergia, setNovaAlergia] = useState("");

  // Lista de alergias (pode começar com alguns exemplos ou vazia)
  const [listaAlergias, setListaAlergias] = useState([
    { id: "1", nome: "Penicilina" },
    { id: "2", nome: "Amendoim" },
    { id: "3", nome: "Frutos do Mar" },
  ]);

  // Função para adicionar a nova alergia à lista
  const adicionarAlergia = () => {
    if (novaAlergia.trim() === "") return;

    const novoObjeto = {
      id: Date.now().toString(),
      nome: novaAlergia.trim(),
    };

    setListaAlergias([...listaAlergias, novoObjeto]);
    setNovaAlergia(""); // Limpa o campo após adicionar
  };

  // Função para remover uma alergia da lista
  const removerAlergia = (idParaRemover) => {
    const listaFiltrada = listaAlergias.filter(
      (item) => item.id !== idParaRemover,
    );
    setListaAlergias(listaFiltrada);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* CABEÇALHO */}
      <View style={styles.header}>
        {/* Usamos a cor vermelha padrão do estilo para o título */}
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

        {/* ÁREA DE INPUT PARA NOVAS ALERGIAS */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Adicionar nova alergia..."
            placeholderTextColor="#A0AEC0"
            value={novaAlergia}
            onChangeText={setNovaAlergia}
            onSubmitEditing={adicionarAlergia} // Adiciona ao apertar "Enter"
          />
          <TouchableOpacity
            style={styles.botaoAdicionar}
            onPress={adicionarAlergia}
          >
            <FontAwesome name="plus" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* LISTAGEM DE TAGS (VERMELHO) */}
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
