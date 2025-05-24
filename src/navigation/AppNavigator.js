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
import ProfileScreen from '../screens/ProfileScreen';
import CreateProduct from '../screens/CreateProduct';
import CreateGroup from '../screens/CreateGroup';
import MyRentsScreen from '../screens/MyRentsScreen';
import GroupsScreen from '../screens/GroupsScreen';
import AccountScreen from '../screens/AccountScreen';

const Stack = createStackNavigator();

const AppNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
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
      <Stack.Screen name="ProfileScreen" component={ProfileScreen} options={{ title: 'Perfil' }} />
      <Stack.Screen name="CreateProduct" component={CreateProduct} />
      <Stack.Screen name="CreateGroup" component={CreateGroup} options={{ title: 'Criar Grupo' }} />
      <Stack.Screen name="MyRents" component={MyRentsScreen} options={{ title: 'Meus Aluguéis' }} />
      <Stack.Screen name="Groups" component={GroupsScreen} options={{ title: 'Meus Grupos' }} />
      <Stack.Screen name="Account" component={AccountScreen} options={{ title: 'Minha Conta' }} />
    </Stack.Navigator>
  );
};

export default AppNavigator;
