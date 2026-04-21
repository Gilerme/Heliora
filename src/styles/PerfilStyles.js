import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F4F8",
  },
  // O cabeçalho terá o fundo azul descendo um pouco pela tela
  header: {
    alignItems: "center",
    paddingTop: 60, // Espaço para a barra de status do celular
    paddingBottom: 40,
    backgroundColor: "#4A729A",
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  nome: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  email: {
    fontSize: 16,
    color: "#E2E8F0",
  },
  menuContainer: {
    padding: 24,
    marginTop: 10,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  menuIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F0F4F8",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    color: "#333333",
    fontWeight: "600",
  },
  logoutText: {
    color: "#E53E3E", // Vermelho para indicar ação destrutiva (sair)
  },
});
