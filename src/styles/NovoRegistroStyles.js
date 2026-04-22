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
    marginBottom: 20,
  },
  tituloTela: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4A729A",
  },
  botaoFechar: {
    padding: 12,
  },
  formContainer: {
    paddingHorizontal: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: "#333333",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  textArea: {
    height: 120,
    textAlignVertical: "top",
  },
  // --- Estilos dos Botões de Tipo (Consulta/Exame/Vacina) ---
  tipoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  botaoTipo: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginHorizontal: 4,
    borderRadius: 8,
  },
  botaoTipoAtivo: {
    backgroundColor: "#4A729A",
    borderColor: "#4A729A",
  },
  textoTipo: {
    fontSize: 14,
    color: "#666666",
    fontWeight: "600",
  },
  textoTipoAtivo: {
    color: "#FFFFFF",
  },
  // --- Estilos do Scribe AI ---
  scribeContainer: {
    backgroundColor: "#EBF4FF",
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#BEE3F8",
    borderStyle: "dashed",
  },
  scribeBotao: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#4A729A",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    elevation: 3,
    shadowColor: "#4A729A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  scribeBotaoGravando: {
    backgroundColor: "#E53E3E", // Fica vermelho quando está gravando
    shadowColor: "#E53E3E",
  },
  scribeTexto: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#4A729A",
    textAlign: "center",
  },
  // --- Botão de Salvar ---
  botaoSalvar: {
    backgroundColor: "#38A169",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 32,
    marginBottom: 40,
  },
  textoSalvar: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  // --- Estilos de Anexos ---
  anexoContainer: {
    marginTop: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderStyle: "dashed",
    padding: 20,
    alignItems: "center",
  },
  botaoAnexo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F4F8",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  textoAnexo: {
    marginLeft: 10,
    fontSize: 14,
    color: "#4A729A",
    fontWeight: "bold",
  },
  previewImagem: {
    width: "100%",
    height: 150,
    backgroundColor: "#EDF2F7",
    borderRadius: 8,
    marginTop: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  textoPreview: {
    color: "#718096",
    fontSize: 12,
  },
});
