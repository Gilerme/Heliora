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
import { styles } from "../styles/EsqueciSenhaStyles";

export default function EsqueciSenhaScreen() {
  const [email, setEmail] = useState("");
  const router = useRouter();

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
            onPress={() => alert("Link de recuperação enviado para: " + email)}
          >
            <Text style={styles.textoBotaoPrincipal}>Enviar Link</Text>
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
