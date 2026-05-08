import { useRouter } from "expo-router";
import React, { useState } from "react";
import axios from "axios";
import {
    KeyboardAvoidingView,
    Platform,
    SafeAreaView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    Alert,
} from "react-native";
import { styles } from "../styles/EsqueciSenhaStyles";

const API_URL = "http://192.168.0.163:8000";

export default function EsqueciSenhaScreen() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRecuperarSenha = async () => {
    if (!email) {
      Alert.alert("Atenção", "Por favor, digite seu e-mail.");
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${API_URL}/esqueci-senha`, { email });
      Alert.alert("Sucesso", "Se o e-mail existir, um link de recuperação será enviado.");
      router.back();
    } catch (error) {
      console.error(error);
      Alert.alert("Erro", "Não foi possível conectar ao servidor. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.content}
      >
        <View style={styles.header}>
          <Text style={styles.titulo}>Recuperar Senha</Text>
          <Text style={styles.descricao}>
            Digite o e-mail associado à sua conta e enviaremos um link para você
            redefinir sua senha.
          </Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>Seu E-mail</Text>
          <TextInput
            style={styles.input}
            placeholder="Digite seu e-mail"
            placeholderTextColor="#999"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          <TouchableOpacity
            style={styles.botaoPrincipal}
            onPress={handleRecuperarSenha}
            disabled={loading}
          >
            <Text style={styles.textoBotaoPrincipal}>{loading ? "Enviando..." : "Enviar Link"}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.textoVoltar}>Voltar para o Login</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
