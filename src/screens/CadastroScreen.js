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

  const cadastrar = async () => {
  if (!nome || !email || !cpf || !senha) {
    alert("Preencha todos os campos obrigatórios");
    return;
  }

  if (senha !== confirmarSenha) {
    alert("As senhas não coincidem");
    return;
  }
  const cpfLimpo = cpf.replace(/\D/g, "");

  try {
    const response = await fetch("http://192.168.0.163:8000/register/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email,
        nome: nome,
        senha: senha,
        cpf: cpfLimpo,
      }),
    });

    const data = await response.json();
    console.log("STATUS:", response.status);
    console.log(JSON.stringify(data, null, 2));

    if (!response.ok) {
      alert(data.detail || "Erro ao cadastrar");
      return;
    }

    alert("Conta criada com sucesso!");
    router.replace("/(tabs)");

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
              Complete seus dados para começar.
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
              placeholder="seu@email.com"
              placeholderTextColor="#999"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />

            <View
              style={{ flexDirection: "row", justifyContent: "space-between" }}
            >
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

            <TouchableOpacity style={styles.botaoPrincipal} onPress={cadastrar}>
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
