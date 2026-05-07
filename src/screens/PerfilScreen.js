import { FontAwesome } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import axios from "axios";
import React, { useEffect, useState } from "react";
import {
  Alert,
  DeviceEventEmitter,
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { styles } from "../styles/PerfilStyles";

const API_URL = "http://192.168.0.163:8000";

export default function PerfilScreen() {
  const router = useRouter();

  // Estados dos Dados Pessoais
  const [fotoPerfil, setFotoPerfil] = useState(null);
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [cpf, setCpf] = useState("");
  const [tipoSanguineo, setTipoSanguineo] = useState("");
  const [peso, setPeso] = useState("");
  const [altura, setAltura] = useState("");

  // Carrega os dados salvos ao abrir a tela
  useEffect(() => {
    const carregarPerfil = async () => {
      try {
        const dados = await AsyncStorage.getItem("@heliora_perfil");
        if (dados) {
          const perfil = JSON.parse(dados);
          setFotoPerfil(perfil.fotoPerfil || null);
          setNome(perfil.nome || "");
          setEmail(perfil.email || "");
          setDataNascimento(perfil.dataNascimento || "");
          setCpf(perfil.cpf || "");
          setTipoSanguineo(perfil.tipoSanguineo || "");
          setPeso(perfil.peso || "");
          setAltura(perfil.altura || "");
        }
      } catch (e) {
        console.error("Erro ao carregar perfil:", e);
      }
    };
    carregarPerfil();
  }, []);

  // Função para escolher foto da galeria
  const escolherFoto = async () => {
    try {
      const resultado = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true, // Permite cortar quadrado
        aspect: [1, 1], // Força proporção 1:1
        quality: 0.5, // Reduz qualidade para não ocupar muito espaço no storage
      });
      if (!resultado.canceled) {
        setFotoPerfil(resultado.assets[0].uri);
      }
    } catch (err) {
      console.error("Erro no ImagePicker: ", err);
      Alert.alert("Erro", "Não foi possível acessar a galeria.");
    }
  };

  // Máscara de Data (reutilizada)
  const formatarData = (texto) => {
    let textoLimpo = texto.replace(/\D/g, "").substring(0, 8);
    if (textoLimpo.length > 2)
      textoLimpo = textoLimpo.substring(0, 2) + "/" + textoLimpo.substring(2);
    if (textoLimpo.length > 5)
      textoLimpo = textoLimpo.substring(0, 5) + "/" + textoLimpo.substring(5);
    setDataNascimento(textoLimpo);
  };

  // Máscara de CPF (###.###.###-##)
  const formatarCpf = (texto) => {
    let textoLimpo = texto.replace(/\D/g, "").substring(0, 11);
    if (textoLimpo.length > 3)
      textoLimpo = textoLimpo.substring(0, 3) + "." + textoLimpo.substring(3);
    if (textoLimpo.length > 7)
      textoLimpo = textoLimpo.substring(0, 7) + "." + textoLimpo.substring(7);
    if (textoLimpo.length > 11)
      textoLimpo = textoLimpo.substring(0, 11) + "-" + textoLimpo.substring(11);
    setCpf(textoLimpo);
  };

  const formatarAltura = (texto) => {
    let textoLimpo = texto.replace(/\D/g, ""); // Remove tudo que não é número
    if (textoLimpo.length > 2)
      textoLimpo =
        textoLimpo.substring(0, 1) + "." + textoLimpo.substring(1, 3);
    setAltura(textoLimpo);
  };

  const fazerLogout = () => {
    Alert.alert("Sair da Conta", "Tem certeza que deseja sair do aplicativo?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Sair",
        style: "destructive", // Deixa o texto vermelho no iOS
        onPress: () => router.replace("/"), // No futuro, limpar token aqui
      },
    ]);
  };

  const salvarPerfil = async () => {
    if (!nome || !email) {
      Alert.alert("Aviso", "Nome e E-mail são obrigatórios.");
      return;
    }
    try {
      const perfil = {
        fotoPerfil,
        nome,
        email,
        dataNascimento,
        cpf,
        tipoSanguineo,
        peso,
        altura,
      };
      
      const idPaciente = await AsyncStorage.getItem("id_paciente");
      if (idPaciente) {
        await axios.put(`${API_URL}/pacientes/${idPaciente}`, {
          nome: perfil.nome,
          email: perfil.email,
          data_nascimento: perfil.dataNascimento,
          cpf: perfil.cpf,
          tipo_sanguineo: perfil.tipoSanguineo,
          peso: perfil.peso,
          altura: perfil.altura,
          foto_perfil: perfil.fotoPerfil
        });
      }

      await AsyncStorage.setItem("@heliora_perfil", JSON.stringify(perfil));
      DeviceEventEmitter.emit("atualizarPerfilHome");
      Alert.alert("Sucesso 🎉", "Seu perfil foi atualizado com segurança!");
      router.back();
    } catch (e) {
      console.error("Erro ao salvar perfil: ", e);
      Alert.alert("Erro", "Não foi possível salvar os dados.");
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 5 }}>
          <FontAwesome name="arrow-left" size={20} color="#4A729A" />
        </TouchableOpacity>
        <Text style={styles.title}>Meu Perfil</Text>
        <View style={{ width: 30 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            {fotoPerfil ? (
              <Image source={{ uri: fotoPerfil }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <FontAwesome name="user" size={70} color="#CBD5E0" />
              </View>
            )}
          </View>
          <TouchableOpacity
            style={styles.botaoMudarFoto}
            onPress={escolherFoto}
          >
            <FontAwesome name="camera" size={16} color="#4A729A" />
            <Text style={styles.textoMudarFoto}>Alterar Foto</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          <Text style={styles.sectionSubtitle}>Informações Básicas</Text>
          <Text style={styles.label}>Nome Completo</Text>
          <TextInput
            style={styles.input}
            value={nome}
            onChangeText={setNome}
            placeholder="Seu nome como no documento"
            placeholderTextColor="#A0AEC0"
          />

          <Text style={styles.label}>E-mail</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="seu@email.com"
            placeholderTextColor="#A0AEC0"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.sectionSubtitle}>Dados Médicos Pessoais</Text>

          <View
            style={{ flexDirection: "row", justifyContent: "space-between" }}
          >
            <View style={{ width: "48%" }}>
              <Text style={styles.label}>Data de Nascimento</Text>
              <TextInput
                style={styles.input}
                value={dataNascimento}
                onChangeText={formatarData}
                placeholder="DD/MM/AAAA"
                placeholderTextColor="#A0AEC0"
                keyboardType="numeric"
                maxLength={10}
              />
            </View>
            <View style={{ width: "48%" }}>
              <Text style={styles.label}>Tipo Sanguíneo</Text>
              <TextInput
                style={styles.input}
                value={tipoSanguineo}
                onChangeText={(txt) => setTipoSanguineo(txt.toUpperCase())}
                placeholder="Ex: AB+"
                placeholderTextColor="#A0AEC0"
                autoCapitalize="characters"
                maxLength={3}
              />
            </View>
          </View>

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginTop: 20,
            }}
          >
            <View style={{ width: "48%" }}>
              <Text style={styles.label}>Peso (kg)</Text>
              <TextInput
                style={styles.input}
                value={peso}
                onChangeText={(txt) => setPeso(txt.replace(/[^0-9.,]/g, ""))}
                placeholder="Ex: 70.5"
                placeholderTextColor="#A0AEC0"
                keyboardType="numeric"
                maxLength={6}
              />
            </View>
            <View style={{ width: "48%" }}>
              <Text style={styles.label}>Altura (m)</Text>
              <TextInput
                style={styles.input}
                value={altura}
                onChangeText={formatarAltura}
                placeholder="Ex: 1.75"
                placeholderTextColor="#A0AEC0"
                keyboardType="numeric"
                maxLength={4}
              />
            </View>
          </View>

          <View style={{ marginBottom: 20 }} />
          <Text style={styles.label}>CPF (para receitas e laudos)</Text>
          <TextInput
            style={styles.input}
            value={cpf}
            onChangeText={formatarCpf}
            placeholder="000.000.000-00"
            placeholderTextColor="#A0AEC0"
            keyboardType="numeric"
            maxLength={14}
          />

          <TouchableOpacity style={styles.botaoSalvar} onPress={salvarPerfil}>
            <Text style={styles.textoBotao}>Salvar Alterações</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.botaoSair} onPress={fazerLogout}>
            <Text style={styles.textoSair}>Sair do Aplicativo</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
