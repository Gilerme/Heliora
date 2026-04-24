import { FontAwesome } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import * as Notifications from "expo-notifications";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { styles } from "../styles/NovoRegistroStyles";

export default function NovoRegistroModal() {
  const router = useRouter();

  const [tipoSelecionado, setTipoSelecionado] = useState("Consulta"); // Pode ser Consulta, Exame ou Vacina
  const [estaGravando, setEstaGravando] = useState(false);
  const [notas, setNotas] = useState("");
  const [arquivoAnexo, setArquivoAnexo] = useState(null);
  const [titulo, setTitulo] = useState("");
  const [dataRegistro, setDataRegistro] = useState("");
  const [local, setLocal] = useState("");

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

  useEffect(() => {
    // Função para pedir permissão
    const pedirPermissao = async () => {
      const { status: existingStatus } =
        await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== "granted") {
        console.log("Permissão para notificações negada!");
        return;
      }
    };

    pedirPermissao();
  }, []);

  const anexarArquivo = async () => {
    try {
      const resultado = await DocumentPicker.getDocumentAsync({
        type: "application/pdf", // Filtra apenas para PDFs
        copyToCacheDirectory: true,
      });

      if (!resultado.canceled) {
        // O Expo Document Picker retorna os dados dentro de assets[0]
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
      // Aqui, futuramente, a IA vai jogar o texto final resumido
      setNotas(
        notas +
          "\n[IA]: Paciente relata dores de cabeça frequentes nos últimos 3 dias. Pressão arterial medida: 120x80. Recomendado uso de analgésico e repouso.",
      );
    } else {
      setEstaGravando(true);
      // Limpa as notas ou adiciona um aviso que está ouvindo
      setNotas("Escutando a consulta...\n");
    }
  };

  const agendarNotificacaoMedica = async (titulo, dataTexto, tipo) => {
    try {
      const partes = dataTexto.split("/");
      if (partes.length !== 3) return;

      // 1. Convertendo para números inteiros (Isso previne o disparo imediato)
      const dia = parseInt(partes[0], 10);
      const mes = parseInt(partes[1], 10);
      const ano = parseInt(partes[2], 10);

      // 2. Criando a data corretamente
      const dataAlvo = new Date(ano, mes - 1, dia, 8, 0, 0);

      // 3. Validação de data futura
      if (isNaN(dataAlvo.getTime()) || dataAlvo <= new Date()) {
        console.log("Data inválida ou no passado. Ignorando agendamento.");
        return;
      }

      // 4. Agendamento com o objeto de trigger correto
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `Lembrete Heliora 🩺`,
          body: `Hoje você tem: ${titulo} (${tipo}). Não se esqueça!`,
          sound: true,
          android: {
            channelId: "default",
          },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: dataAlvo,
          channelId: "default",
        },
      });

      console.log(
        `Sucesso! Agendado para ${dataAlvo.toLocaleDateString()} às 08:00`,
      );
    } catch (error) {
      console.error("Erro ao agendar notificação:", error);
    }
  };

  const salvarRegistro = async () => {
    // 1. Validação rápida para não salvar vazio
    if (!titulo || !dataRegistro) {
      Alert.alert("Aviso", "Por favor, preencha pelo menos o título e a data.");
      return;
    }

    // 2. Montar o "pacote" de dados
    const novoRegistro = {
      id: Date.now().toString(), // Cria um ID único baseado na hora exata
      tipo: tipoSelecionado,
      titulo: titulo,
      data: dataRegistro,
      local: local,
      notas: notas,
      anexo: arquivoAnexo, // Salva o caminho da foto/PDF se houver
    };

    try {
      // 3. Puxar o que já existe no cofre
      const registrosSalvos = await AsyncStorage.getItem("@heliora_registros");
      let listaRegistros = registrosSalvos ? JSON.parse(registrosSalvos) : [];

      // 4. Adicionar o novo e guardar de volta
      listaRegistros.push(novoRegistro);
      await AsyncStorage.setItem(
        "@heliora_registros",
        JSON.stringify(listaRegistros),
      );

      await agendarNotificacaoMedica(titulo, dataRegistro, tipoSelecionado);

      Alert.alert("Sucesso!", "Registro salvo com segurança no seu celular!");
      router.back(); // Volta para a tela anterior
    } catch (err) {
      console.error("Erro ao salvar:", err);
      Alert.alert("Erro", "Não foi possível salvar os dados.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.tituloTela}>Novo Registro</Text>
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
        {/* SELETOR DE TIPO */}
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

        {/* SCRIBE MEDICAL (SÓ APARECE SE FOR CONSULTA) */}
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
                  : "Scribe IA: Transcrever Consulta"}
              </Text>
            </View>

            {/* ÁREA DE NOTAS E TRANSCRIÇÃO */}
            <Text style={styles.label}>Notas da Consulta / Transcrição</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="A transcrição da IA aparecerá aqui, ou você pode escrever suas próprias notas..."
              placeholderTextColor="#999"
              multiline={true}
              numberOfLines={6}
              value={notas}
              onChangeText={setNotas}
            />
          </View>
        )}

        {/* FORMULÁRIO PADRÃO */}
        <Text style={styles.label}>Título (Ex: Clínico Geral)</Text>
        <TextInput
          style={styles.input}
          placeholder="Digite o título..."
          placeholderTextColor="#999"
          value={titulo} // <- LIGANDO O VALOR
          onChangeText={setTitulo} // <- LIGANDO A FUNÇÃO
        />

        <Text style={styles.label}>Data</Text>
        <TextInput
          style={styles.input}
          placeholder="DD/MM/AAAA"
          placeholderTextColor="#999"
          value={dataRegistro} // <- LIGANDO O VALOR
          keyboardType="numeric"
          maxLength={10}
          onChangeText={formatarData} // <- LIGANDO A FUNÇÃO
        />

        <Text style={styles.label}>
          {tipoSelecionado === "Exame" ? "Laboratório" : "Profissional / Local"}
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Nome do médico ou local..."
          placeholderTextColor="#999"
          value={local} // <- LIGANDO O VALOR
          onChangeText={setLocal} // <- LIGANDO A FUNÇÃO
        />

        {/* ANEXO */}
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

        {/* BOTÃO SALVAR */}
        <TouchableOpacity
          style={styles.botaoSalvar}
          onPress={salvarRegistro} // <- CHAMANDO NOSSA NOVA FUNÇÃO AQUI
        >
          <Text style={styles.textoSalvar}>Salvar Registro</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
