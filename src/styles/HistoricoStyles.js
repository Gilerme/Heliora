import { Platform, StatusBar, StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F4F8",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight + 20 : 40,
  },
  header: {
    paddingHorizontal: 24,
    marginTop: 20,
    marginBottom: 24,
  },
  tituloTela: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2D3748",
  },
  descricao: {
    fontSize: 14,
    color: "#718096",
    marginTop: 8,
  },
  listaContainer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  cardRegistro: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    alignItems: "center",
    elevation: 2, // Sombra Android
    shadowColor: "#000", // Sombra iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  iconeContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  infoContainer: {
    flex: 1,
  },
  tituloRegistro: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#2D3748",
    marginBottom: 4,
  },
  detalhesRegistro: {
    fontSize: 14,
    color: "#718096",
    marginBottom: 4,
  },
  tipoBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 4,
  },
  tipoTexto: {
    fontSize: 12,
    fontWeight: "bold",
  },
  mensagemVazia: {
    textAlign: "center",
    color: "#A0AEC0",
    fontSize: 16,
    marginTop: 40,
    lineHeight: 24,
  },
});
