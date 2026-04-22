import { FontAwesome } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import {
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
        <Text style={styles.tituloHeader}>Detalhes do Registro</Text>
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
