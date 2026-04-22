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

export default function AlergiasScreen() {
  const router = useRouter();
  const alergias = [
    { id: "1", nome: "Dipirona", nivel: "Grave" },
    { id: "2", nome: "Amendoim", nivel: "Moderado" },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.titulo}>Alergias</Text>
        <TouchableOpacity
          style={styles.botaoFechar}
          onPress={() => router.back()}
        >
          <FontAwesome name="times" size={24} color="#999" />
        </TouchableOpacity>
      </View>
      <ScrollView>
        {alergias.map((item) => (
          <View
            key={item.id}
            style={[
              styles.itemLista,
              {
                borderLeftColor: item.nivel === "Grave" ? "#E53E3E" : "#DD6B20",
              },
            ]}
          >
            <FontAwesome
              name="warning"
              size={20}
              color={item.nivel === "Grave" ? "#E53E3E" : "#DD6B20"}
            />
            <View style={styles.itemTextoContainer}>
              <Text style={styles.itemTitulo}>{item.nome}</Text>
              <Text style={styles.itemSubtitulo}>Nível: {item.nivel}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
