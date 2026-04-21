import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { SafeAreaView, Text, TouchableOpacity, View } from "react-native";
import { styles } from "../styles/ModalStyles";

export default function NovoRegistroModal() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.titulo}>Novo Registro</Text>
        {/* Botão de fechar usa o router.back() para descer o modal */}
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.botaoFechar}
        >
          <FontAwesome name="times" size={24} color="#999999" />
        </TouchableOpacity>
      </View>

      {/* Opção 1: Consulta */}
      <TouchableOpacity style={styles.opcaoCard}>
        <View style={styles.iconBox}>
          <FontAwesome name="user-md" size={24} color="#4A729A" />
        </View>
        <View style={styles.opcaoTextos}>
          <Text style={styles.opcaoTitulo}>Consulta Médica</Text>
          <Text style={styles.opcaoDescricao}>
            Adicione detalhes de uma visita ao médico
          </Text>
        </View>
        <FontAwesome name="chevron-right" size={16} color="#CCCCCC" />
      </TouchableOpacity>

      {/* Opção 2: Exame */}
      <TouchableOpacity style={styles.opcaoCard}>
        <View style={styles.iconBox}>
          <FontAwesome name="file-text-o" size={24} color="#4A729A" />
        </View>
        <View style={styles.opcaoTextos}>
          <Text style={styles.opcaoTitulo}>Exame Laboratorial</Text>
          <Text style={styles.opcaoDescricao}>
            Registre resultados de exames de sangue, imagem, etc.
          </Text>
        </View>
        <FontAwesome name="chevron-right" size={16} color="#CCCCCC" />
      </TouchableOpacity>

      {/* Opção 3: Vacina */}
      <TouchableOpacity style={styles.opcaoCard}>
        <View style={styles.iconBox}>
          <FontAwesome name="shield" size={24} color="#4A729A" />
        </View>
        <View style={styles.opcaoTextos}>
          <Text style={styles.opcaoTitulo}>Vacina</Text>
          <Text style={styles.opcaoDescricao}>
            Atualize sua carteira de vacinação
          </Text>
        </View>
        <FontAwesome name="chevron-right" size={16} color="#CCCCCC" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}
