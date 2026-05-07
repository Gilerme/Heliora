import axios from "axios";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { styles } from "../styles/CadastroStyles";

const API_URL = "http://192.168.0.163:8000";

// Função para comunicar com o seu FastAPI
const registerUser = async (nome, email, cpf, senha, tipoSanguineo) => {
  try {
    const response = await axios.post(`${API_URL}/register`, {
      nome: nome,
      email: email,
      cpf: cpf,
      senha: senha,
      tipo_sanguineo: tipoSanguineo
    });
    return response.data;
  } catch (error) {
    console.error(error.response?.data || error.message);
    throw error;
  }
};

export default function CadastroScreen() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [tipoSanguineo, setTipoSanguineo] = useState("");
  const [cpf, setCpf] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const router = useRouter();

  const formatarCpf = (texto) => {
    let t = texto.replace(/\D/g, "").substring(0, 11);
    if (t.length > 3) t = t.substring(0, 3) + "." + t.substring(3);
    if (t.length > 7) t = t.substring(0, 7) + "." + t.substring(7);
    if (t.length > 11) t = t.substring(0, 11) + "-" + t.substring(11);
    setCpf(t);
  };

  const handleCadastrar = async () => {
    // Validações básicas
    if (!nome || !email || !cpf || !senha || !confirmarSenha) {
      Alert.alert("Atenção", "Por favor, preencha todos os campos.");
      return;
    }

    if (senha !== confirmarSenha) {
      Alert.alert("Erro", "As senhas não coincidem!");
      return;
    }

    try {
      // Envia os parâmetros que a rota /register do backend espera
      await registerUser(nome, email, cpf, senha, tipoSanguineo);
      
      Alert.alert("Sucesso", "Conta criada com sucesso!");
      router.replace("/"); // Redireciona para a tela de login
    } catch (error) {
      console.log(error.response.data);
      const mensagem = error.response?.data?.detail || "Erro ao tentar cadastrar usuário.";
      Alert.alert("Erro", mensagem);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <Text style={styles.titulo}>Criar Conta</Text>
            <Text style={styles.subtitulo}>Complete seus dados para começar.</Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>Nome Completo</Text>
            <TextInput
              style={styles.input}
              placeholder="Digite seu nome"
              placeholderTextColor="#999"
              value={nome}
              onChangeText={setNome}
            />

            <Text style={styles.label}>E-mail</Text>
            <TextInput
              style={styles.input}
              placeholder="seu@email.com"
              placeholderTextColor="#999"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />

            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <View style={{ width: "30%" }}>
                <Text style={styles.label}>Tipo Sang.</Text>
                <TextInput
                  style={styles.input}
                  placeholder="O+"
                  placeholderTextColor="#999"
                  autoCapitalize="characters"
                  maxLength={3}
                  value={tipoSanguineo}
                  onChangeText={setTipoSanguineo}
                />
              </View>
              <View style={{ width: "65%" }}>
                <Text style={styles.label}>CPF</Text>
                <TextInput
                  style={styles.input}
                  placeholder="000.000.000-00"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                  value={cpf}
                  onChangeText={formatarCpf}
                />
              </View>
            </View>

            <Text style={styles.label}>Senha</Text>
            <TextInput
              style={styles.input}
              placeholder="Crie uma senha"
              placeholderTextColor="#999"
              secureTextEntry
              value={senha}
              onChangeText={setSenha}
            />

            <Text style={styles.label}>Confirmar Senha</Text>
            <TextInput
              style={styles.input}
              placeholder="Repita a senha"
              placeholderTextColor="#999"
              secureTextEntry
              value={confirmarSenha}
              onChangeText={setConfirmarSenha}
            />

            <TouchableOpacity style={styles.botaoPrincipal} onPress={handleCadastrar}>
              <Text style={styles.textoBotaoPrincipal}>Cadastrar</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.textoFooter}>Já tem uma conta? </Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.textoLogin}>Entrar</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}