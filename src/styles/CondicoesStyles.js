import { Platform, StatusBar, StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F4F8",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 20 : 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    marginTop: 20,
    marginBottom: 24,
  },
  tituloTela: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2B6CB0", // Azul padrão para condições
  },
  botaoFechar: {
    padding: 10,
  },
  content: {
    paddingHorizontal: 24,
  },
  descricao: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 20,
    lineHeight: 20,
  },
  inputContainer: {
    flexDirection: "row",
    marginBottom: 24,
  },
  input: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 50,
    fontSize: 16,
    marginRight: 10,
  },
  botaoAdicionar: {
    backgroundColor: "#3182CE", // Fundo azul do botão +
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#3182CE",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
  },
  tag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#EBF4FF", // Fundo azul clarinho da tag
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginRight: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#BEE3F8",
  },
  tagText: {
    color: "#2B6CB0", // Texto azul escuro da tag
    fontWeight: "600",
    marginRight: 8,
  },
  botaoRemoverTag: {
    padding: 2,
  },
});
