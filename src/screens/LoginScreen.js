import React from 'react';
import { VStack, Input, Button, Icon, Text, Link, Divider, Box, useToast } from 'native-base';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { authenticateUser } from '../services/api';

// Esquema de validação Yup para login
const loginValidationSchema = Yup.object().shape({
  email: Yup.string()
    .email('Por favor, insira um email válido')
    .required('O email é obrigatório'),
  password: Yup.string()
    .required('A senha é obrigatória'),
});

const LoginScreen = () => {
  const navigation = useNavigation();
  const toast = useToast();

  return (
    <Formik
      initialValues={{ email: '', password: '' }}
      validationSchema={loginValidationSchema}
      onSubmit={async (values, actions) => {
        try {
          const data = await authenticateUser(values);
          toast.show({ description: "Login realizado com sucesso!", status: "success", duration: 3000 });
          navigation.navigate('Home');
        } catch (error) {
          toast.show({ description: "Falha no login. Verifique suas credenciais.", status: "error", duration: 3000 });
          console.error(error);
        } finally {
          actions.setSubmitting(false);
        }
      }}
    >
      {({ handleChange, handleBlur, handleSubmit, values, errors, touched, isSubmitting }) => (
        <VStack space={5} alignItems="center" justifyContent="center" mt="5%" px="5%">
          <Text fontSize="2xl" bold color="coolGray.800">Login</Text>
          <Text fontSize="md" color="coolGray.600">Seja bem vindo!</Text>
          <Box w="85%" maxW="300px">
            <Input
              placeholder="Email"
              value={values.email}
              onChangeText={handleChange('email')}
              onBlur={handleBlur('email')}
              fontSize="md"
              py="3"
              InputLeftElement={<Icon as={MaterialIcons} name="email" size="sm" m="2" color="muted.400" />}
              isInvalid={touched.email && errors.email}
            />
            {touched.email && errors.email &&
              <Text color="danger.600" fontSize="xs">{errors.email}</Text>
            }
            <Input
              placeholder="Senha"
              value={values.password}
              onChangeText={handleChange('password')}
              onBlur={handleBlur('password')}
              type="password"
              fontSize="md"
              py="3"
              InputLeftElement={<Icon as={MaterialIcons} name="lock" size="sm" m="2" color="muted.400" />}
              isInvalid={touched.password && errors.password}
            />
            {touched.password && errors.password &&
              <Text color="danger.600" fontSize="xs">{errors.password}</Text>
            }
            <Link _text={{ fontSize: "sm", color: "blue.500", bold: true }} alignSelf="flex-end" onPress={() => navigation.navigate('ForgotPassword')}>
              Esqueceu sua senha?
            </Link>
          </Box>
          <Button onPress={handleSubmit} isLoading={isSubmitting} w="85%" maxW="300px" bg="primary.500" py="3" _text={{ color: "white" }}>
            Login
          </Button>
          <Divider my="3" w="85%" maxW="300px" />
          <Link _text={{ fontSize: "sm", color: "blue.600" }} onPress={() => navigation.navigate('SignUp')}>
            Não tem uma conta? Inscrever-se
          </Link>
        </VStack>
      )}
    </Formik>
  );
};

export default LoginScreen;
