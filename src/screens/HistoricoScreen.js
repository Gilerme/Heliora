import { FontAwesome } from "@expo/vector-icons";
import React, { useState } from "react";
import {
    FlatList,
    SafeAreaView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { styles } from "../styles/HistoricoStyles";

const mockHistorico = [
  {
    id: "1",
    tipo: "Consulta",
    data: "20 Abr 2026",
    titulo: "Clínico Geral",
    subtitulo: "Dr. Roberto Almeida - Hospital Santa Maria",
    icone: "user-md",
    cor: "#4A729A",
  },
  {
    id: "2",
    tipo: "Exame",
    data: "15 Abr 2026",
    titulo: "Hemograma Completo",
    subtitulo: "Laboratório Central",
    icone: "file-text-o",
    cor: "#DD6B20",
  },
  {
    id: "3",
    tipo: "Vacina",
    data: "10 Mar 2026",
    titulo: "Gripe (Influenza)",
    subtitulo: "Posto de Saúde Central",
    icone: "shield",
    cor: "#38A169",
  },
];

export default function HistoricoScreen() {
  // Estado para guardar o que o usuário digitou
  const [textoPesquisa, setTextoPesquisa] = useState("");

  // Filtra a lista original baseada no texto da pesquisa
  const historicoFiltrado = mockHistorico.filter((item) => {
    // Transforma tudo em letras minúsculas para a pesquisa não ser "case sensitive"
    const tituloBuscavel = item.titulo.toLowerCase();
    const tipoBuscavel = item.tipo.toLowerCase();
    const termoPesquisado = textoPesquisa.toLowerCase();

    // Retorna true se o termo pesquisado estiver no título OU no tipo do registro
    return (
      tituloBuscavel.includes(termoPesquisado) ||
      tipoBuscavel.includes(termoPesquisado)
    );
  });

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => alert(`Detalhes de: ${item.titulo}`)}
    >
      <View style={styles.cardHeader}>
        <View style={styles.tipoContainer}>
          <FontAwesome name={item.icone} size={16} color={item.cor} />
          <Text style={[styles.tipoTexto, { color: item.cor }]}>
            {item.tipo}
          </Text>
        </View>
        <Text style={styles.dataTexto}>{item.data}</Text>
      </View>

      <Text style={styles.tituloRegistro}>{item.titulo}</Text>
      <Text style={styles.subtituloRegistro}>{item.subtitulo}</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.titulo}>Histórico</Text>

        {/* BARRA DE PESQUISA */}
        <View style={styles.searchContainer}>
          <FontAwesome name="search" size={20} color="#999999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar consulta, exame ou vacina..."
            placeholderTextColor="#999999"
            value={textoPesquisa}
            onChangeText={(texto) => setTextoPesquisa(texto)}
          />
          {/* Botão de limpar a pesquisa (só aparece se tiver texto) */}
          {textoPesquisa.length > 0 && (
            <TouchableOpacity onPress={() => setTextoPesquisa("")}>
              <FontAwesome name="times-circle" size={20} color="#CCCCCC" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        // Agora passamos a lista FILTRADA em vez da original
        data={historicoFiltrado}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listaContainer}
        showsVerticalScrollIndicator={false}
        // Mensagem caso a pesquisa não encontre nada
        ListEmptyComponent={
          <Text style={{ textAlign: "center", color: "#999", marginTop: 20 }}>
            Nenhum registro encontrado.
          </Text>
        }
      />
    </SafeAreaView>
  );
}
