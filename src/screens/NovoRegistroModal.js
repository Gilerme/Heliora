import { FontAwesome } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { styles } from "../styles/NovoRegistroStyles";

export default function NovoRegistroModal() {
  const [temImagem, setTemImagem] = useState(false);
  const router = useRouter();
  const [tipoSelecionado, setTipoSelecionado] = useState("Consulta"); // Pode ser Consulta, Exame ou Vacina
  const [estaGravando, setEstaGravando] = useState(false);
  const [notas, setNotas] = useState("");

  // Função para simular o Scribe da IA
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
        )}

        {/* FORMULÁRIO PADRÃO */}
        <Text style={styles.label}>Título (Ex: Clínico Geral)</Text>
        <TextInput
          style={styles.input}
          placeholder="Digite o título..."
          placeholderTextColor="#999"
        />

        <Text style={styles.label}>Data</Text>
        <TextInput
          style={styles.input}
          placeholder="DD/MM/AAAA"
          placeholderTextColor="#999"
        />

        <Text style={styles.label}>
          {tipoSelecionado === "Exame" ? "Laboratório" : "Profissional / Local"}
        </Text>
        <TextInput
          style={styles.input}
          placeholder="Nome do médico ou local..."
          placeholderTextColor="#999"
        />

        <Text style={styles.label}>Notas ou Transcrição IA</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Escreva detalhes ou use a IA para preencher..."
          placeholderTextColor="#999"
          multiline={true}
          value={notas}
          onChangeText={setNotas}
        />

        {/* ANEXO */}
        <Text style={styles.label}>Anexos (Receitas ou Laudos)</Text>
        <View style={styles.anexoContainer}>
          {temImagem ? (
            <TouchableOpacity
              style={styles.previewImagem}
              onPress={() => setTemImagem(false)}
            >
              <FontAwesome name="file-image-o" size={40} color="#4A729A" />
              <Text style={styles.textoPreview}>
                Imagem anexada (Toque para remover)
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.botaoAnexo}
              onPress={() => setTemImagem(true)}
            >
              <FontAwesome name="camera" size={20} color="#4A729A" />
              <Text style={styles.textoAnexo}>Tirar foto ou anexar PDF</Text>
            </TouchableOpacity>
          )}

          {tipoSelecionado === "Exame" && !temImagem && (
            <Text
              style={{
                fontSize: 11,
                color: "#A0AEC0",
                marginTop: 8,
                textAlign: "center",
              }}
            >
              Dica: Anexe o laudo do laboratório para consulta rápida.
            </Text>
          )}
        </View>

        {/* BOTÃO SALVAR */}
        <TouchableOpacity
          style={styles.botaoSalvar}
          onPress={() => {
            alert("Registro salvo com sucesso!");
            router.back();
          }}
        >
          <Text style={styles.textoSalvar}>Salvar Registro</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
