<<<<<<< HEAD
import AsyncStorage from '@react-native-async-storage/async-storage'; // ✅
import axios from "axios";
=======
import { LinearGradient } from "expo-linear-gradient";
>>>>>>> 67b461d78994a96f5fa8ff7689ece17b3bdbb6aa
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { styles } from "../styles/LoginStyles";

// Substitua pelo IP da sua rede ou localhost (se rodar emulador)
const API_URL = "http://192.168.0.163:8000";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    if (!email || !senha) {
      Alert.alert("Atenção", "Por favor, preencha todos os campos.");
      return;
    }

    try {
      // Cria o formulário codificado que o FastAPI espera no /token
      const params = new URLSearchParams();
      params.append("username", email);
      params.append("password", senha);

      const response = await axios.post(`${API_URL}/token`, params, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      // Se o token for retornado com sucesso
      if (response.data.access_token) {
        Alert.alert("Sucesso", "Login realizado com sucesso!");

        await AsyncStorage.setItem("token", response.data.access_token);
        if (response.data.id_paciente) {
          await AsyncStorage.setItem("id_paciente", response.data.id_paciente.toString());
          
          // Buscar perfil do paciente
          try {
            const perfilResponse = await axios.get(`${API_URL}/pacientes/${response.data.id_paciente}`);
            const perfilData = {
              nome: perfilResponse.data.nome || "",
              email: perfilResponse.data.email || "",
              cpf: perfilResponse.data.cpf || "",
              dataNascimento: perfilResponse.data.data_nascimento || "",
              telefone: perfilResponse.data.telefone || "",
              endereco: perfilResponse.data.endereco || "",
              tipoSanguineo: perfilResponse.data.tipo_sanguineo || "",
              peso: perfilResponse.data.peso || "",
              altura: perfilResponse.data.altura || "",
              fotoPerfil: perfilResponse.data.foto_perfil || null,
            };
            await AsyncStorage.setItem("@heliora_perfil", JSON.stringify(perfilData));
          } catch (e) {
            console.error("Erro ao buscar perfil após login", e);
          }
        }

        router.replace("/(tabs)");
      }
    } catch (error) {
      console.error(error.response?.data || error.message);

      if (error.response?.status === 401) {
        Alert.alert("Erro", "E-mail ou senha incorretos.");
      } else {
        Alert.alert("Erro", "Não foi possível conectar ao servidor. Verifique a URL ou sua conexão.");
      }
    }
  };

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

<<<<<<< HEAD
          {/* Botão de Entrar integrado à API */}
          <TouchableOpacity
            style={styles.botaoPrincipal}
            onPress={handleLogin}
          >
            <Text style={styles.textoBotaoPrincipal}>Entrar</Text>
          </TouchableOpacity>
        </View>
=======
            <TouchableOpacity
              style={styles.botaoPrincipal}
              onPress={() => router.replace("/(tabs)")}
            >
              <Text style={styles.textoBotaoPrincipal}>Entrar</Text>
            </TouchableOpacity>
          </View>
>>>>>>> 67b461d78994a96f5fa8ff7689ece17b3bdbb6aa

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