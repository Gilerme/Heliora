import { Platform, StatusBar, StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0F4F8", // Mesmo fundo cinza claro do app
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

  // Contêiner da Foto de Perfil
  avatarSection: {
    alignItems: "center",
    marginVertical: 30,
  },
  avatarContainer: {
    width: 130,
    height: 130,
    borderRadius: 65, // Círculo perfeito
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    elevation: 8, // Sombra forte no Android
    shadowColor: "#4A729A", // Sombra colorida no iOS
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    borderWidth: 4,
    borderColor: "#FFFFFF",
  },
  avatarImage: {
    width: 122,
    height: 122,
    borderRadius: 61,
  },
  avatarPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  botaoMudarFoto: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginTop: -20, // Sobrepõe levemente a foto
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  textoMudarFoto: {
    color: "#4A729A",
    fontWeight: "600",
    marginLeft: 8,
    fontSize: 14,
  },

  // Formulário
  form: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  sectionSubtitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#718096",
    marginTop: 10,
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    paddingBottom: 5,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4A729A",
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    backgroundColor: "#FFFFFF",
    height: 50,
    borderRadius: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    color: "#2D3748",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  // Botão Salvar
  botaoSalvar: {
    backgroundColor: "#4A729A",
    height: 55,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    elevation: 3,
    shadowColor: "#4A729A",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  textoBotao: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  botaoSair: {
    marginTop: 15,
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#FC8181",
    borderRadius: 15,
    backgroundColor: "#FFF5F5",
  },
  textoSair: {
    color: "#E53E3E",
    fontSize: 16,
    fontWeight: "bold",
  },
});
