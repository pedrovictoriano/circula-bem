import React, { useState, useEffect } from 'react';
import { KeyboardAvoidingView, ScrollView, Platform, TouchableWithoutFeedback, Keyboard, Dimensions, View } from 'react-native';

const KeyboardDismissView = ({ children, style, contentContainerStyle }) => {
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const windowHeight = Dimensions.get('window').height;

  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        setKeyboardHeight(e.endCoordinates.height);
      }
    );

    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[{ flex: 1 }, style]}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView
        contentContainerStyle={[
          contentContainerStyle,
          {
            paddingBottom: keyboardHeight > 0 ? keyboardHeight + 100 : 0,
            minHeight: windowHeight
          }
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        onScrollBeginDrag={Keyboard.dismiss}
        bounces={true}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={{ flex: 1 }}>
            {children}
          </View>
        </TouchableWithoutFeedback>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default KeyboardDismissView; 
