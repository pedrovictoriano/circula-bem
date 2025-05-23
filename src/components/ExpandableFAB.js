import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View, Animated } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';

const ExpandableFAB = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigation = useNavigation();
  const animation = new Animated.Value(0);

  const toggleMenu = () => {
    const toValue = isOpen ? 0 : 1;
    Animated.spring(animation, {
      toValue,
      friction: 5,
      useNativeDriver: true,
    }).start();
    setIsOpen(!isOpen);
  };

  const handleAddProduct = () => {
    navigation.navigate('CreateProduct');
    toggleMenu();
  };

  const handleAddGroup = () => {
    navigation.navigate('CreateGroup');
    toggleMenu();
  };

  const productStyle = {
    transform: [
      { scale: animation },
      {
        translateY: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -80],
        }),
      },
    ],
  };

  const groupStyle = {
    transform: [
      { scale: animation },
      {
        translateY: animation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -40],
        }),
      },
    ],
  };

  const rotation = {
    transform: [
      {
        rotate: animation.interpolate({
          inputRange: [0, 1],
          outputRange: ['0deg', '45deg'],
        }),
      },
    ],
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.button, styles.secondary, productStyle]}>
        <TouchableOpacity onPress={handleAddProduct}>
          <MaterialIcons name="add-shopping-cart" size={24} color="#FFF" />
        </TouchableOpacity>
      </Animated.View>

      <Animated.View style={[styles.button, styles.secondary, groupStyle]}>
        <TouchableOpacity onPress={handleAddGroup}>
          <MaterialIcons name="group-add" size={24} color="#FFF" />
        </TouchableOpacity>
      </Animated.View>

      <Animated.View style={[styles.button, styles.menu, rotation]}>
        <TouchableOpacity onPress={toggleMenu}>
          <MaterialIcons name="add" size={24} color="#FFF" />
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    alignItems: 'center',
  },
  button: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  menu: {
    backgroundColor: '#2196F3',
  },
  secondary: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2196F3',
  },
});

export default ExpandableFAB; 
