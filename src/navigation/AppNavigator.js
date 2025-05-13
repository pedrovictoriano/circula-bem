import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from '../screens/LoginScreen';
import SignUpScreen from '../screens/SignUpScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import HomeScreen from '../screens/HomeScreen';
import SearchResultsScreen from '../screens/SearchResultsScreen';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import SelectDateScreen from '../screens/SelectDateScreen';
import FinalizeRentalScreen from '../screens/FinalizeRentalScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import ResetPasswordScreen from '../screens/ResetPasswordScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ title: 'Esqueceu sua senha' }} />
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="SearchResults" component={SearchResultsScreen} options={{ title: 'Procurar Resultados' }} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} options={{ title: 'Detalhes do produto' }} />
      <Stack.Screen name="SelectDate" component={SelectDateScreen} options={{ title: 'Selecione a data' }} />
      <Stack.Screen name="FinalizeRental" component={FinalizeRentalScreen} options={{ title: 'Finalizar aluguel' }} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Notifcações' }} />
			<Stack.Screen name="ResetPassword" component={ResetPasswordScreen} options={{ title: 'Nova Senha' }} />
    </Stack.Navigator>
  );
};

export default AppNavigator;