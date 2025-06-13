// components/Input.tsx
import React from 'react';
import { TextInput, StyleSheet, View, Text, TextInputProps } from 'react-native';
import { Colors } from '../constants/Colors';

interface InputProps extends TextInputProps {
  label?: string;
  placeholder?: string;
}

const Input: React.FC<InputProps> = ({ label, placeholder, style, ...props }) => {
  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[styles.input, style]}
        placeholderTextColor={Colors.textDark}
        placeholder={placeholder}
        {...props}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
    width: '100%',
  },
  label: {
    fontSize: 16,
    color: Colors.textDark,
    marginBottom: 5,
  },
  input: {
    height: 50,
    borderColor: Colors.secondaryBlue,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    color: Colors.textDark,
    backgroundColor: Colors.background,
  },
});

export default Input;