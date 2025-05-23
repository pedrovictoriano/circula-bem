import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Image, Keyboard } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { registerUser, fetchAddressByCEP } from '../services/api';
import KeyboardDismissView from '../components/KeyboardDismissView';
import LoadingOverlay from '../components/LoadingOverlay';
import { useLoading } from '../hooks/useLoading';

function validateCPF(cpf) {
  cpf = cpf.replace(/[^\d]+/g, '');
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;
  let sum = 0, rest;
  for (let i = 1; i <= 9; i++) sum += parseInt(cpf.substring(i - 1, i)) * (11 - i);
  rest = (sum * 10) % 11;
  if (rest === 10 || rest === 11) rest = 0;
  if (rest !== parseInt(cpf.substring(9, 10))) return false;
  sum = 0;
  for (let i = 1; i <= 10; i++) sum += parseInt(cpf.substring(i - 1, i)) * (12 - i);
  rest = (sum * 10) % 11;
  if (rest === 10 || rest === 11) rest = 0;
  return rest === parseInt(cpf.substring(10, 11));
}

const schema = Yup.object().shape({
  name: Yup.string().required('Nome obrigatório'),
  surName: Yup.string().required('Sobrenome obrigatório'),
  email: Yup.string().email('Email inválido').required('Email obrigatório'),
  pwd: Yup.string().min(6, 'Mínimo de 6 caracteres').required('Senha obrigatória'),
  regNum: Yup.string().required('CPF obrigatório').test('cpf', 'CPF inválido', validateCPF),
  cep: Yup.string().required('CEP obrigatório'),
  state: Yup.string().required('Estado obrigatório'),
  city: Yup.string().required('Cidade obrigatória'),
  neighborhood: Yup.string().required('Bairro obrigatório'),
  street: Yup.string().required('Rua obrigatória'),
  number: Yup.string().required('Número obrigatório')
});

const SignUpScreen = () => {
  const navigation = useNavigation();
  const [isLoadingCEP, setIsLoadingCEP] = useState(false);
  const { isLoading, loadingMessage, withLoading } = useLoading();
  
  // Create refs for all inputs
  const inputRefs = {
    name: useRef(null),
    surName: useRef(null),
    email: useRef(null),
    pwd: useRef(null),
    regNum: useRef(null),
    cep: useRef(null),
    state: useRef(null),
    city: useRef(null),
    neighborhood: useRef(null),
    street: useRef(null),
    number: useRef(null),
    complement: useRef(null)
  };

  const handleCEPBlur = async (cep, setFieldValue) => {
    if (cep.length !== 8) return;
    
    setIsLoadingCEP(true);
    try {
      const addressData = await fetchAddressByCEP(cep);
      setFieldValue('street', addressData.street);
      setFieldValue('neighborhood', addressData.neighborhood);
      setFieldValue('city', addressData.city);
      setFieldValue('state', addressData.state);
      inputRefs.number.current?.focus();
    } catch (error) {
      Alert.alert('Erro', error.message);
    } finally {
      setIsLoadingCEP(false);
    }
  };

  const handleSubmitEditing = (currentField) => {
    const fields = [
      'name', 'surName', 'email', 'pwd', 'regNum',
      'cep', 'state', 'city', 'neighborhood', 'street',
      'number', 'complement'
    ];
    
    const currentIndex = fields.indexOf(currentField);
    if (currentIndex < fields.length - 1) {
      inputRefs[fields[currentIndex + 1]].current?.focus();
    } else {
      // If it's the last field, dismiss keyboard
      Keyboard.dismiss();
    }
  };

  return (
    <KeyboardDismissView contentContainerStyle={styles.scrollContainer}>
      <Formik
        initialValues={{
          name: '', surName: '', email: '', pwd: '', regNum: '',
          cep: '', state: '', city: '', neighborhood: '', street: '', number: '', complement: ''
        }}
        validationSchema={schema}
        onSubmit={async (values) => {
          const address = {
            userRegistrationNumber: values.regNum.replace(/\D/g, ''),
            cep: values.cep.replace(/\D/g, ''),
            state: values.state, city: values.city,
            neighborhood: values.neighborhood, street: values.street,
            number: values.number, complement: values.complement
          };

          try {
            await withLoading(
              registerUser({
                email: values.email,
                pwd: values.pwd,
                name: values.name,
                surName: values.surName,
                regNum: values.regNum.replace(/\D/g, ''),
                address
              }),
              'Criando sua conta...'
            );
            Alert.alert('Sucesso', 'Usuário cadastrado com sucesso!');
            navigation.navigate('Login');
          } catch (err) {
            if (err.message === 'Email not confirmed') {
              Alert.alert(
                'Email não confirmado',
                'Por favor, verifique sua caixa de entrada e confirme seu email antes de fazer login. Se não recebeu o email, verifique também sua pasta de spam.',
                [
                  {
                    text: 'OK',
                    onPress: () => navigation.navigate('Login')
                  }
                ]
              );
            } else {
              Alert.alert('Erro', 'Falha ao registrar. Por favor, tente novamente.');
            }
            console.error(err);
          }
        }}
      >
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched, setFieldValue }) => (
          <View style={styles.container}>
            <Image source={require('../../assets/logo.png')} style={styles.logo} resizeMode="contain" />
            <Text style={styles.title}>Criar Conta</Text>
            <Text style={styles.subtitle}>Preencha os dados para se cadastrar</Text>
            {[
              ['Nome', 'name'], 
              ['Sobrenome', 'surName'], 
              ['Email', 'email'], 
              ['Senha', 'pwd'], 
              ['CPF', 'regNum'], 
              ['CEP', 'cep'], 
              ['Estado', 'state'], 
              ['Cidade', 'city'], 
              ['Bairro', 'neighborhood'], 
              ['Rua', 'street'], 
              ['Número', 'number'], 
              ['Complemento', 'complement']
            ].map(([label, field]) => (
              <View key={field} style={styles.inputContainer}>
                <TextInput
                  ref={inputRefs[field]}
                  style={styles.input}
                  placeholder={label}
                  secureTextEntry={field === 'pwd'}
                  onChangeText={(text) => {
                    handleChange(field)(text);
                    if (field === 'cep') {
                      const cleanCEP = text.replace(/\D/g, '');
                      setFieldValue('cep', cleanCEP);
                    }
                  }}
                  onBlur={(e) => {
                    handleBlur(field)(e);
                    if (field === 'cep') {
                      handleCEPBlur(values.cep, setFieldValue);
                    }
                  }}
                  value={values[field]}
                  autoCapitalize={field === 'email' ? 'none' : 'words'}
                  keyboardType={
                    field === 'email' ? 'email-address' :
                    field === 'regNum' || field === 'cep' || field === 'number' ? 'numeric' :
                    'default'
                  }
                  editable={field === 'cep' ? !isLoadingCEP : true}
                  returnKeyType={field === 'complement' ? 'done' : 'next'}
                  onSubmitEditing={() => handleSubmitEditing(field)}
                />
                {field === 'cep' && isLoadingCEP && (
                  <ActivityIndicator size="small" color="#233ED9" style={styles.loadingIndicator} />
                )}
                {touched[field] && errors[field] && (
                  <Text style={styles.error}>{errors[field]}</Text>
                )}
              </View>
            ))}
            <TouchableOpacity onPress={handleSubmit} style={styles.button}>
              <Text style={styles.buttonText}>Inscrever-se</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.link}>Tem uma conta? Conecte-se</Text>
            </TouchableOpacity>
          </View>
        )}
      </Formik>
      <LoadingOverlay visible={isLoading} message={loadingMessage} />
    </KeyboardDismissView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: '#F7F8FA',
  },
  container: { 
    padding: 20,
    backgroundColor: '#F7F8FA',
    paddingTop: 40,
    paddingBottom: 40,
  },
  logo: {
    width: 100,
    height: 100,
    alignSelf: 'center',
    marginBottom: 30,
  },
  title: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    textAlign: 'center', 
    marginBottom: 8,
    color: '#222'
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#666'
  },
  inputContainer: {
    marginBottom: 15,
    position: 'relative',
  },
  input: { 
    borderWidth: 1, 
    borderColor: '#E0E0E0', 
    borderRadius: 12, 
    padding: 16,
    backgroundColor: '#FFFFFF',
    fontSize: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  error: { 
    color: '#FF6B6B', 
    fontSize: 12, 
    marginTop: 4,
    marginBottom: 4,
    marginLeft: 4
  },
  button: { 
    backgroundColor: '#4F8CFF', 
    padding: 16, 
    borderRadius: 12, 
    alignItems: 'center', 
    marginVertical: 20,
    shadowColor: '#4F8CFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: { 
    color: '#fff', 
    fontWeight: 'bold',
    fontSize: 16,
  },
  link: { 
    color: '#666', 
    textAlign: 'center', 
    marginTop: 10,
    fontSize: 16,
  },
  loadingIndicator: {
    position: 'absolute',
    right: 15,
    top: 16,
  }
});

export default SignUpScreen;
