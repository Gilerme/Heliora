import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F0F4F8',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoTexto: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#4A729A',
    marginBottom: 8,
  },
  subtitulo: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    color: '#333',
  },
  botaoEsqueci: {
    alignSelf: 'flex-end',
    marginTop: 12,
    marginBottom: 24,
  },
  textoEsqueci: {
    color: '#4A729A',
    fontSize: 14,
    fontWeight: '500',
  },
  botaoPrincipal: {
    backgroundColor: '#4A729A',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  textoBotaoPrincipal: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 40,
  },
  textoFooter: {
    color: '#666',
    fontSize: 14,
  },
  textoCadastro: {
    color: '#4A729A',
    fontSize: 14,
    fontWeight: 'bold',
  },
});