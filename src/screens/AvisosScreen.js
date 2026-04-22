import { FontAwesome } from "@expo/vector-icons";
import React from "react";
import { SafeAreaView, ScrollView, Text, View } from "react-native";
import { styles } from "../styles/AvisosStyles";

export default function AvisosScreen() {
  // Mock de dados com diferentes status
  const avisos = [
    {
      id: "1",
      tipo: "exame",
      titulo: "Exame de Sangue (Rotina)",
      data: "Venceu há 5 dias",
      status: "atrasado",
      icone: "heartbeat",
    },
    {
      id: "2",
      tipo: "vacina",
      titulo: "Reforço Antitetânica",
      data: "Faltam 10 dias",
      status: "proximo",
      icone: "shield",
    },
    {
      id: "3",
      tipo: "consulta",
      titulo: "Retorno Oftalmologista",
      data: "Em 2 meses",
      status: "futuro",
      icone: "eye",
    },
  ];

  // Função para definir as cores e ícones baseados no status e tipo
  const obterEstilosStatus = (status) => {
    switch (status) {
      case "atrasado":
        return {
          bg: "#FED7D7",
          text: "#C53030",
          iconBg: "#FFF5F5",
          iconColor: "#E53E3E",
        };
      case "proximo":
        return {
          bg: "#FEEBC8",
          text: "#C05621",
          iconBg: "#FFFAF0",
          iconColor: "#DD6B20",
        };
      case "futuro":
        return {
          bg: "#EBF4FF",
          text: "#2B6CB0",
          iconBg: "#F0F4F8",
          iconColor: "#4A729A",
        };
      default:
        return {
          bg: "#EDF2F7",
          text: "#4A5568",
          iconBg: "#F7FAFC",
          iconColor: "#718096",
        };
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.tituloTela}>Lembretes e Avisos</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.descricao}>
          Fique de olho! Aqui estão seus exames próximos do vencimento, vacinas
          pendentes e retornos médicos.
        </Text>

        {avisos.map((aviso) => {
          const visual = obterEstilosStatus(aviso.status);

          return (
            <View key={aviso.id} style={styles.cardAviso}>
              {/* Ícone dinâmico */}
              <View
                style={[styles.iconeBox, { backgroundColor: visual.iconBg }]}
              >
                <FontAwesome
                  name={aviso.icone}
                  size={24}
                  color={visual.iconColor}
                />
              </View>

              {/* Informações */}
              <View style={styles.textosBox}>
                <Text style={styles.tituloAviso}>{aviso.titulo}</Text>
                <Text style={styles.dataAviso}>{aviso.data}</Text>

                {/* Badge (Etiqueta colorida) */}
                <View style={[styles.badge, { backgroundColor: visual.bg }]}>
                  <Text style={[styles.badgeTexto, { color: visual.text }]}>
                    {aviso.status.toUpperCase()}
                  </Text>
                </View>
              </View>

              <FontAwesome name="chevron-right" size={16} color="#CCCCCC" />
            </View>
          );
        })}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
