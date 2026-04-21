import { Platform, StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F4F8",
    padding: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
    marginTop: Platform.OS === "ios" ? 10 : 20,
  },
  titulo: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4A729A",
    padding: 10,
  },
  botaoFechar: {
    padding: 12,
    marginRight: 8,
    marginTop: 4,
  },
  opcaoCard: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 16,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  iconBox: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#F0F4F8",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  opcaoTextos: {
    flex: 1,
  },
  opcaoTitulo: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 4,
  },
  opcaoDescricao: {
    fontSize: 14,
    color: "#666666",
  },
  listaContainer: {
    marginTop: 10,
  },
  itemLista: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: "#4A729A",
  },
  itemTextoContainer: {
    flex: 1,
    marginLeft: 12,
  },
  itemTitulo: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  itemSubtitulo: {
    fontSize: 14,
    color: "#666",
    marginTop: 2,
  },
});
