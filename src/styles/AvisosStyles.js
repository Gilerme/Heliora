import { Platform, StatusBar, StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 20 : 60,
    paddingBottom: 20,
    backgroundColor: "#FFFFFF",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#4A729A",
  },
  listaContainer: {
    padding: 20,
  },
  cardAviso: {
    backgroundColor: "#FFF",
    borderRadius: 15,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  iconeContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#4A729A",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitulo: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2D3748",
    marginBottom: 5,
  },
  cardData: {
    fontSize: 14,
    color: "#718096",
  },
  botaoDetalhes: {
    padding: 10,
  },
  emptyState: {
    alignItems: "center",
    marginTop: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4A729A",
    marginTop: 20,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#A0AEC0",
    marginTop: 10,
    textAlign: "center",
    paddingHorizontal: 20,
  },
});
