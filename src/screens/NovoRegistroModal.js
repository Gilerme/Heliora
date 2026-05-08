import { FontAwesome } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import * as Notifications from "expo-notifications";
import axios from "axios";
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

const API_URL = "http://192.168.0.163:8000";

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
        type: ["application/pdf", "image/*"], // Filtra para PDFs e Imagens
        copyToCacheDirectory: true,
      });

      if (!resultado.canceled) {
        const asset = resultado.assets[0];
        const isImage = asset.mimeType && asset.mimeType.startsWith("image/");
        
        setArquivoAnexo({
          uri: asset.uri,
          nome: asset.name,
          tipo: isImage ? "imagem" : "pdf",
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

    try {
      const idPaciente = await AsyncStorage.getItem("id_paciente");
      if (!idPaciente) {
        Alert.alert("Erro", "Paciente não identificado. Faça login novamente.");
        return;
      }

      // Preparar FormData para envio
      const formData = new FormData();
      let endpoint = "";

      if (tipoSelecionado === "Consulta") {
        endpoint = `/pacientes/${idPaciente}/consultas`;
        formData.append("nome", titulo);
        
        // Conversão de data de DD/MM/AAAA para YYYY-MM-DD
        const partes = dataRegistro.split("/");
        if (partes.length === 3) {
          formData.append("data", `${partes[2]}-${partes[1]}-${partes[0]}`);
        } else {
          formData.append("data", dataRegistro);
        }
        
        formData.append("profissional", local || "Não informado");
        
        // Se a gravação estivesse pronta, enviaríamos aqui:
        // if (arquivoAnexo && arquivoAnexo.uri) {
        //   formData.append("audio_file", {
        //     uri: arquivoAnexo.uri,
        //     name: arquivoAnexo.nome || "audio.m4a",
        //     type: "audio/m4a"
        //   });
        // }
      } else if (tipoSelecionado === "Exame") {
        endpoint = `/pacientes/${idPaciente}/exames`;
        endpoint += `?laboratorio=${encodeURIComponent(local || "Não informado")}&nome_exame=${encodeURIComponent(titulo)}`;
        if (!arquivoAnexo) {
          Alert.alert("Atenção", "Para Exames, é obrigatório anexar um arquivo PDF ou Imagem.");
          return;
        }
        formData.append("file", {
          uri: arquivoAnexo.uri,
          name: arquivoAnexo.nome || `exame_${Date.now()}.${arquivoAnexo.tipo === "pdf" ? "pdf" : "jpg"}`,
          type: arquivoAnexo.tipo === "pdf" ? "application/pdf" : "image/jpeg"
        });
      } else if (tipoSelecionado === "Vacina") {
        endpoint = `/pacientes/${idPaciente}/vacinas`;
        endpoint += `?local=${encodeURIComponent(local || "Não informado")}&nome_vacina=${encodeURIComponent(titulo)}`;
        if (!arquivoAnexo) {
          Alert.alert("Atenção", "Para Vacinas, é obrigatório anexar um arquivo PDF ou Imagem.");
          return;
        }
        formData.append("file", {
          uri: arquivoAnexo.uri,
          name: arquivoAnexo.nome || `vacina_${Date.now()}.${arquivoAnexo.tipo === "pdf" ? "pdf" : "jpg"}`,
          type: arquivoAnexo.tipo === "pdf" ? "application/pdf" : "image/jpeg"
        });
      }

      // 2. Chamar a API
      const response = await axios.post(`${API_URL}${endpoint}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      // 3. Montar o "pacote" de dados para uso no celular (AsyncStorage backup)
      const novoRegistro = {
        id: response.data.id_consulta || response.data.id_exame || response.data.id_vacinas || Date.now().toString(),
        tipo: tipoSelecionado,
        titulo: titulo,
        data: dataRegistro,
        local: local,
        notas: notas,
        anexo: arquivoAnexo,
      };

      // 4. Salvar localmente também
      const registrosSalvos = await AsyncStorage.getItem("@heliora_registros");
      let listaRegistros = registrosSalvos ? JSON.parse(registrosSalvos) : [];
      listaRegistros.push(novoRegistro);
      await AsyncStorage.setItem(
        "@heliora_registros",
        JSON.stringify(listaRegistros),
      );

      await agendarNotificacaoMedica(titulo, dataRegistro, tipoSelecionado);

      Alert.alert("Sucesso!", "Registro salvo com segurança!");
      router.back();
    } catch (err) {
      console.error("Erro ao salvar:", err.response?.data || err.message);
      Alert.alert("Erro", "Não foi possível salvar os dados no servidor.");
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
