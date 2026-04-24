import { FontAwesome } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { Stack, useLocalSearchParams, useRouter } from "expo-router"; // Adicionado useLocalSearchParams
import React, { useState } from "react";
import {
  Alert,
  DeviceEventEmitter, // Adicionado para avisar o histórico
  Image,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { styles } from "../styles/NovoRegistroStyles"; // Reutilizando os mesmos estilos!

export default function EditarRegistroScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // 1. Recebe os dados do registro que vamos editar
  const registroOriginal = params.dados ? JSON.parse(params.dados) : null;

  // 2. Preenche os campos (useState) com os dados originais ao invés de começar vazio
  const [tipoSelecionado, setTipoSelecionado] = useState(
    registroOriginal?.tipo || "Consulta",
  );
  const [estaGravando, setEstaGravando] = useState(false);
  const [notas, setNotas] = useState(registroOriginal?.notas || "");
  const [arquivoAnexo, setArquivoAnexo] = useState(
    registroOriginal?.anexo || null,
  );
  const [titulo, setTitulo] = useState(registroOriginal?.titulo || "");
  const [dataRegistro, setDataRegistro] = useState(
    registroOriginal?.data || "",
  );
  const [local, setLocal] = useState(registroOriginal?.local || "");

  const anexarArquivo = async () => {
    try {
      const resultado = await DocumentPicker.getDocumentAsync({
        type: "application/pdf",
        copyToCacheDirectory: true,
      });

      if (!resultado.canceled) {
        setArquivoAnexo({
          uri: resultado.assets[0].uri,
          nome: resultado.assets[0].name,
          tipo: "pdf",
        });
      }
    } catch (err) {
      console.error("Erro ao anexar documento:", err);
      Alert.alert("Erro", "Não foi possível selecionar o arquivo.");
    }
  };

  const formatarData = (texto) => {
    let textoLimpo = texto.replace(/\D/g, "");

    textoLimpo = textoLimpo.substring(0, 8);

    if (textoLimpo.length > 2) {
      textoLimpo = textoLimpo.substring(0, 2) + "/" + textoLimpo.substring(2);
    }

    if (textoLimpo.length > 5) {
      textoLimpo = textoLimpo.substring(0, 5) + "/" + textoLimpo.substring(5);
    }

    setDataRegistro(textoLimpo);
  };

  const tirarFoto = async () => {
    const permissao = await ImagePicker.requestCameraPermissionsAsync();
    if (permissao.granted === false) {
      Alert.alert("Permissão negada", "Precisamos de acesso à câmera.");
      return;
    }
    const resultado = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.7,
    });
    if (!resultado.canceled) {
      setArquivoAnexo({ uri: resultado.assets[0].uri, tipo: "imagem" });
    }
  };

  const escolherDaGaleria = async () => {
    const resultado = await ImagePicker.launchImageLibraryAsync({
      quality: 0.7,
    });
    if (!resultado.canceled) {
      setArquivoAnexo({ uri: resultado.assets[0].uri, tipo: "imagem" });
    }
  };

  const removerAnexo = () => setArquivoAnexo(null);

  const toggleScribe = () => {
    if (estaGravando) {
      setEstaGravando(false);
      const agora = new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
      const resumoIA = `\n\n[Transcrição IA - ${agora}]:\nO paciente mencionou melhora nos sintomas após o início do último medicamento. Relata leve tontura pela manhã.`;
      setNotas((prevNotas) => prevNotas + resumoIA);
    } else {
      setEstaGravando(true);
    }
  };

  const atualizarRegistro = async () => {
    if (!titulo || !dataRegistro) {
      Alert.alert("Aviso", "Por favor, preencha pelo menos o título e a data.");
      return;
    }

    // Monta o pacote atualizado, MANTENDO O MESMO ID do registro original
    const registroAtualizado = {
      id: registroOriginal.id,
      tipo: tipoSelecionado,
      titulo: titulo,
      data: dataRegistro,
      local: local,
      notas: notas,
      anexo: arquivoAnexo,
    };

    try {
      const registrosSalvos = await AsyncStorage.getItem("@heliora_registros");
      let listaRegistros = registrosSalvos ? JSON.parse(registrosSalvos) : [];

      // Procura onde está o registro antigo na lista e substitui pelo novo
      const index = listaRegistros.findIndex(
        (item) => item.id === registroOriginal.id,
      );

      if (index !== -1) {
        listaRegistros[index] = registroAtualizado; // Atualiza
      } else {
        listaRegistros.push(registroAtualizado); // Prevenção de erro
      }

      await AsyncStorage.setItem(
        "@heliora_registros",
        JSON.stringify(listaRegistros),
      );

      Alert.alert("Sucesso!", "Registro atualizado com sucesso!", [
        {
          text: "OK",
          onPress: () => {
            // 1. Avisa o Histórico para recarregar a lista
            DeviceEventEmitter.emit("atualizarHistorico");

            // 2. Substitui a tela atual pela tela de detalhes, enviando os dados NOVOS
            router.replace({
              pathname: "/detalhes",
              params: { dados: JSON.stringify(registroAtualizado) },
            });
          },
        },
      ]);
    } catch (err) {
      console.error("Erro ao atualizar:", err);
      Alert.alert("Erro", "Não foi possível atualizar os dados.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <Text style={styles.tituloTela}>Editar Registro</Text>
        <TouchableOpacity
          style={styles.botaoFechar}
          onPress={() => router.back()}
        >
          <FontAwesome name="times" size={24} color="#999" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.formContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.label}>O que você deseja adicionar?</Text>
        <View style={styles.tipoContainer}>
          {["Consulta", "Exame", "Vacina"].map((tipo) => (
            <TouchableOpacity
              key={tipo}
              style={[
                styles.botaoTipo,
                tipoSelecionado === tipo && styles.botaoTipoAtivo,
              ]}
              onPress={() => setTipoSelecionado(tipo)}
            >
              <Text
                style={[
                  styles.textoTipo,
                  tipoSelecionado === tipo && styles.textoTipoAtivo,
                ]}
              >
                {tipo}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {tipoSelecionado === "Consulta" && (
          <View>
            <View style={styles.scribeContainer}>
              <TouchableOpacity
                style={[
                  styles.scribeBotao,
                  estaGravando && styles.scribeBotaoGravando,
                ]}
                onPress={toggleScribe}
              >
                <FontAwesome
                  name={estaGravando ? "stop" : "microphone"}
                  size={28}
                  color="#FFFFFF"
                />
              </TouchableOpacity>
              <Text style={styles.scribeTexto}>
                {estaGravando
                  ? "Gravando... Toque para parar e resumir com IA"
                  : "Scribe IA: Adicionar à transcrição"}
              </Text>
            </View>
            <Text style={styles.label}>Notas da Consulta / Transcrição</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Notas ou transcrição..."
              placeholderTextColor="#999"
              multiline={true}
              numberOfLines={6}
              value={notas}
              onChangeText={setNotas}
            />
          </View>
        )}

        <Text style={styles.label}>Título (Ex: Clínico Geral)</Text>
        <TextInput
          style={styles.input}
          placeholder="Digite o título..."
          placeholderTextColor="#999"
          value={titulo}
          onChangeText={setTitulo}
        />

        <Text style={styles.label}>Data</Text>
        <TextInput
          style={styles.input}
          placeholder="DD/MM/AAAA"
          placeholderTextColor="#999"
          value={dataRegistro}
          keyboardType="numeric"
          maxLength={10}
          onChangeText={formatarData}
        />

        <Text style={styles.label}>
          {tipoSelecionado === "Exame" ? "Laboratório" : "Profissional / Local"}
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Nome do médico ou local..."
          placeholderTextColor="#999"
          value={local}
          onChangeText={setLocal}
        />

        <Text style={styles.label}>Anexos (Receitas, Laudos ou PDF)</Text>

        <View style={styles.anexoContainer}>
          {arquivoAnexo ? (
            <View style={styles.previewContainer}>
              {arquivoAnexo.tipo === "imagem" ? (
                <Image
                  source={{ uri: arquivoAnexo.uri }}
                  style={styles.imagemPreview}
                />
              ) : (
                <View style={styles.arquivoPdfContainer}>
                  <FontAwesome name="file-pdf-o" size={40} color="#E53E3E" />
                  <Text style={styles.textoNomeArquivo} numberOfLines={1}>
                    {arquivoAnexo.nome}
                  </Text>
                </View>
              )}
              <TouchableOpacity
                style={styles.botaoRemoverImagem}
                onPress={removerAnexo}
              >
                <FontAwesome name="trash" size={16} color="#FFF" />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.botoesAnexoContainer}>
              <TouchableOpacity
                style={styles.botaoAnexoPequeno}
                onPress={tirarFoto}
              >
                <FontAwesome name="camera" size={20} color="#4A729A" />
                <Text style={styles.textoAnexoPequeno}>Câmera</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.botaoAnexoPequeno}
                onPress={escolherDaGaleria}
              >
                <FontAwesome name="image" size={20} color="#4A729A" />
                <Text style={styles.textoAnexoPequeno}>Galeria</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.botaoAnexoPequeno}
                onPress={anexarArquivo}
              >
                <FontAwesome name="file-text" size={20} color="#4A729A" />
                <Text style={styles.textoAnexoPequeno}>Arquivos</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Mudei o nome do botão para Atualizar */}
        <TouchableOpacity
          style={styles.botaoSalvar}
          onPress={atualizarRegistro}
        >
          <Text style={styles.textoSalvar}>Atualizar Registro</Text>
        </TouchableOpacity>

        {/* Espaço extra no fim do scroll */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}
