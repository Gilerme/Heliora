import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
    SafeAreaView,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { styles } from "../styles/ModalStyles";

export default function CondicoesScreen() {
  const router = useRouter();
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.titulo}>Condições</Text>
        <TouchableOpacity
          style={styles.botaoFechar}
          onPress={() => router.back()}
        >
          <FontAwesome name="times" size={24} color="#999" />
        </TouchableOpacity>
      </View>
      <ScrollView>
        <View style={styles.itemLista}>
          <FontAwesome name="heartbeat" size={20} color="#4A729A" />
          <View style={styles.itemTextoContainer}>
            <Text style={styles.itemTitulo}>Hipertensão</Text>
            <Text style={styles.itemSubtitulo}>Diagnosticado em 2022</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
