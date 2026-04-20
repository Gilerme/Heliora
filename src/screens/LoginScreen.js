import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  SafeAreaView,
  KeyboardAvoidingView,
  Platform
} from 'react-native';

import { useRouter } from 'expo-router';
import { styles } from '../styles/LoginStyles';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

    const router = useRouter();
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.content}
      >
        {/* Cabeçalho / Logo */}
        <View style={styles.header}>
          <Text style={styles.logoTexto}>Heliora</Text>
          <Text style={styles.subtitulo}>Seu histórico médico em suas mãos.</Text>
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

          <TouchableOpacity style={styles.botaoEsqueci}>
            <Text style={styles.textoEsqueci}>Esqueceu a senha?</Text>
          </TouchableOpacity>

          {/* Botão de Entrar */}
          <TouchableOpacity 
            style={styles.botaoPrincipal}
            onPress={() => router.replace('/(tabs)')}
          >
            <Text style={styles.textoBotaoPrincipal}>Entrar</Text>
          </TouchableOpacity>
        </View>

        {/* Rodapé - Cadastro */}
        <View style={styles.footer}>
          <Text style={styles.textoFooter}>Ainda não tem uma conta? </Text>
          <TouchableOpacity>
            <Text style={styles.textoCadastro}>Cadastre-se</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
