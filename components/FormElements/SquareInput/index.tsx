import React from 'react';
import {View, TextInput, Text, StyleSheet} from 'react-native';

export type Props = {
  label?: string;
  value: string | number | undefined;
  onChange: (value?: string) => void;
  onBlur: () => void;
  isRequired?: boolean;
  placeholder?: string;
};

export const SquareInput: React.FC<Props> = ({label, value, onChange, onBlur, placeholder, isRequired}) => {
  return (
    <View style={styles.container}>
      {label && (
        <Text style={styles.label}>
          {isRequired && <Text style={styles.star}>*</Text>} {label}
        </Text>
      )}
      <TextInput
        style={styles.input}
        onBlur={onBlur}
        onChangeText={onChange}
        value={value?.toString()}
        autoCapitalize="none"
        placeholder={placeholder ? placeholder : null}
        placeholderTextColor="#A2A4BE"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: 8,
  },
  label: {
    marginBottom: 8,
    fontSize: 14,
    color: '#151B5D',
    fontFamily: 'Nunito-Regular',
  },
  star: {
    color: '#EB3437',
  },
  input: {
    width: '100%',
    height: 42,
    borderWidth: 1,
    borderColor: '#A2A4BE',
    borderRadius: 10,
    fontSize: 13,
    paddingLeft: 12,
    fontFamily: 'Nunito-Regular',
  },
});
