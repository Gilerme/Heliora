import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
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

export default function CadastroScreen() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  const router = useRouter();

  
  // 🔌 FUNÇÃO DE CADASTRO
  const cadastrar = async () => {
    if (senha !== confirmarSenha) {
      alert("As senhas não coincidem");
      return;
    }

    try {
      // 1️⃣ Criar paciente
      const pacienteResponse = await fetch("http://192.168.0.163:8000/pacientes/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nome: nome,
          email: email,
        }),
      });

      const pacienteData = await pacienteResponse.json();

      // 2️⃣ Criar login (ROTA CORRIGIDA 🔥)
      const loginResponse = await fetch("http://192.168.0.163:8000/register/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id_paciente: pacienteData.id_paciente,
          username: email,
          senha: senha,
        }),
      });

      const loginData = await loginResponse.json();

      console.log(loginData);

      // ✅ FORMA CORRETA
      if (loginResponse.ok) {
        alert("Conta criada com sucesso!");
        router.replace("/");
      } else {
        alert(loginData.erro || "Erro ao criar conta");
      }

    } catch (error) {
      console.log(error);
      alert("Erro ao conectar com o servidor");
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
            <Text style={styles.subtitulo}>
              Junte-se ao Heliora e tenha sua saúde em suas mãos.
            </Text>
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
              placeholder="Digite seu e-mail"
              placeholderTextColor="#999"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />

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
              placeholder="Repita sua senha"
              placeholderTextColor="#999"
              secureTextEntry
              value={confirmarSenha}
              onChangeText={setConfirmarSenha}
            />

            {/* 🔥 BOTÃO CONECTADO AO BACKEND */}
            <TouchableOpacity
              style={styles.botaoPrincipal}
              onPress={cadastrar}
            >
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