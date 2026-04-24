import { Platform, StatusBar, StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 20 : 60,
    paddingHorizontal: 24,
    paddingBottom: 25,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F4F8",
    backgroundColor: "#FFFFFF",
  },
  botaoVoltar: {
    padding: 10,
    marginRight: 15,
    backgroundColor: "#F7FAFC",
    borderRadius: 12,
  },
  tituloHeader: {
    fontSize: 22, // Aumentado
    fontWeight: "bold",
    color: "#2D3748",
  },
  content: {
    padding: 24, // Aumentado o respiro lateral
  },
  label: {
    fontSize: 14, // Aumentado
    color: "#A0AEC0",
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginBottom: 8,
    marginTop: 28, // Mais espaço entre blocos
  },
  valor: {
    fontSize: 22, // Aumentado para destaque
    color: "#2D3748",
    fontWeight: "600",
  },
  notasContainer: {
    marginTop: 12,
    padding: 20, // Mais preenchimento interno
    backgroundColor: "#F7FAFC",
    borderRadius: 16,
    borderLeftWidth: 5,
    borderLeftColor: "#4A729A",
  },
  notasTexto: {
    fontSize: 17, // Aumentado para leitura confortável
    color: "#4A5568",
    lineHeight: 26,
  },
  anexoTitulo: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2D3748",
    marginTop: 35,
    marginBottom: 20,
  },
  imagemFull: {
    width: "100%",
    height: 500, // Aumentado para ocupar mais tela
    borderRadius: 20,
    resizeMode: "contain",
    backgroundColor: "#F7FAFC",
    marginBottom: 30,
  },
  pdfCardFull: {
    flexDirection: "row",
    alignItems: "center",
    padding: 25,
    backgroundColor: "#FFF5F5",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#FED7D7",
    marginBottom: 30,
  },
  pdfNome: {
    marginLeft: 18,
    fontSize: 18,
    color: "#C53030",
    fontWeight: "bold",
    flex: 1,
  },
});
