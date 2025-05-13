import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { registerUser } from '../services/api';

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

  return (
    <ScrollView contentContainerStyle={styles.container}>
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
            await registerUser({
              email: values.email,
              pwd: values.pwd,
              name: values.name,
              surName: values.surName,
              regNum: values.regNum.replace(/\D/g, ''),
              address
            });
            Alert.alert('Sucesso', 'Usuário cadastrado com sucesso!');
            navigation.navigate('Login');
          } catch (err) {
            Alert.alert('Erro', 'Falha ao registrar.');
            console.error(err);
          }
        }}
      >
        {({ handleChange, handleBlur, handleSubmit, values, errors, touched }) => (
          <>
            <Text style={styles.title}>Inscrição</Text>
            {[['Nome', 'name'], ['Sobrenome', 'surName'], ['Email', 'email'], ['Senha', 'pwd'], ['CPF', 'regNum'], ['CEP', 'cep'], ['Estado', 'state'], ['Cidade', 'city'], ['Bairro', 'neighborhood'], ['Rua', 'street'], ['Número', 'number'], ['Complemento', 'complement']].map(([label, field]) => (
              <View key={field}>
                <TextInput
                  style={styles.input}
                  placeholder={label}
                  secureTextEntry={field === 'pwd'}
                  onChangeText={handleChange(field)}
                  onBlur={handleBlur(field)}
                  value={values[field]}
                />
                {touched[field] && errors[field] && <Text style={styles.error}>{errors[field]}</Text>}
              </View>
            ))}
            <TouchableOpacity onPress={handleSubmit} style={styles.button}>
              <Text style={styles.buttonText}>Inscrever-se</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.link}>Tem uma conta? Conecte-se</Text>
            </TouchableOpacity>
          </>
        )}
      </Formik>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 10 },
  error: { color: 'red', fontSize: 12, marginBottom: 10 },
  button: { backgroundColor: '#233ED9', padding: 15, borderRadius: 8, alignItems: 'center', marginVertical: 10 },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  link: { color: '#233ED9', textAlign: 'center', marginTop: 10 }
});

export default SignUpScreen;