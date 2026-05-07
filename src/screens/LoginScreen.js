import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { styles } from "../styles/LoginStyles";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const router = useRouter();

  return (
    <LinearGradient
      colors={["#E8EDEB", "#CDE0F5", "#E8EDEB"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.content}
        >
          {/* Cabeçalho / Logo */}
          <View style={styles.header}>
            <Text style={styles.logoTexto}>heliora.</Text>
            <Text style={styles.subtitulo}>
              Seu histórico médico em suas mãos.
            </Text>
          </View>

          {/* Formulário */}
          <View style={styles.form}>
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
              placeholder="Digite sua senha"
              placeholderTextColor="#999"
              secureTextEntry
              value={senha}
              onChangeText={setSenha}
            />

            <TouchableOpacity
              style={styles.botaoEsqueci}
              onPress={() => router.push("/esqueci-senha")}
            >
              <Text style={styles.textoEsqueci}>Esqueceu a senha?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.botaoPrincipal}
              onPress={() => router.replace("/(tabs)")}
            >
              <Text style={styles.textoBotaoPrincipal}>Entrar</Text>
            </TouchableOpacity>
          </View>

          {/* Rodapé - Cadastro */}
          <View style={styles.footer}>
            <Text style={styles.textoFooter}>Ainda não tem uma conta? </Text>
            <TouchableOpacity onPress={() => router.push("/cadastro")}>
              <Text style={styles.textoCadastro}>Cadastre-se</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}
