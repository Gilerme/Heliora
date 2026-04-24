import { FontAwesome } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { styles } from "../styles/AvisosStyles";

export default function AvisosScreen() {
  const router = useRouter();
  const [avisos, setAvisos] = useState([]);

  useFocusEffect(
    useCallback(() => {
      carregarAvisos();
    }, []),
  );

  const carregarAvisos = async () => {
    try {
      const dados = await AsyncStorage.getItem("@heliora_registros");
      if (dados) {
        const lista = JSON.parse(dados);

        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);

        const eventosFuturos = lista.filter((item) => {
          if (!item.data) return false;

          const [dia, mes, ano] = item.data.split("/");
          const dataItem = new Date(ano, mes - 1, dia);

          return dataItem >= hoje;
        });

        eventosFuturos.sort((a, b) => {
          const dataA = new Date(
            a.data.split("/")[2],
            a.data.split("/")[1] - 1,
            a.data.split("/")[0],
          );
          const dataB = new Date(
            b.data.split("/")[2],
            b.data.split("/")[1] - 1,
            b.data.split("/")[0],
          );
          return dataA - dataB;
        });

        setAvisos(eventosFuturos);
      }
    } catch (e) {
      console.error("Erro ao carregar avisos:", e);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 5 }}>
          <FontAwesome name="arrow-left" size={20} color="#4A729A" />
        </TouchableOpacity>
        <Text style={styles.title}>Lembretes e Avisos</Text>
        <View style={{ width: 30 }} />
      </View>

      <ScrollView contentContainerStyle={styles.listaContainer}>
        {avisos.length === 0 ? (
          <View style={styles.emptyState}>
            <FontAwesome name="calendar-check-o" size={60} color="#CBD5E0" />
            <Text style={styles.emptyText}>Nenhum evento médico próximo!</Text>
            <Text style={styles.emptySubtext}>
              Seus futuros exames e consultas aparecerão aqui.
            </Text>
          </View>
        ) : (
          avisos.map((item, index) => (
            <View key={index} style={styles.cardAviso}>
              <View style={styles.iconeContainer}>
                <FontAwesome
                  name={item.tipo === "Consulta" ? "user-md" : "stethoscope"}
                  size={24}
                  color="#FFF"
                />
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.cardTitulo}>{item.titulo}</Text>
                <Text style={styles.cardData}>
                  <FontAwesome name="calendar" size={14} color="#718096" />{" "}
                  {item.data}
                </Text>
              </View>
              <TouchableOpacity style={styles.botaoDetalhes}>
                <FontAwesome name="bell" size={18} color="#4A729A" />
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}
