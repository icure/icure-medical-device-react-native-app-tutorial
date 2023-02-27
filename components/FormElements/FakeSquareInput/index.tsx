import React from 'react';
import {View, Text, StyleSheet} from 'react-native';

export type FakeSquareInputProps = {
  label?: string;
  value: string | number | undefined;
  isRequired?: boolean;
  placeholder?: string;
};

export const FakeSquareInput: React.FC<FakeSquareInputProps> = ({label, value, placeholder, isRequired}) => {
  return (
    <View style={styles.container}>
      {label && (
        <Text style={styles.label}>
          {isRequired && <Text style={styles.star}>*</Text>} {label}
        </Text>
      )}
      <View style={styles.textWrap}>
        <Text style={[styles.input, !value && placeholder && styles.inputPlaceholder]}>{value ? value : placeholder ? placeholder : ''}</Text>
      </View>
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
  textWrap: {
    width: '100%',
    height: 42,
    borderWidth: 1,
    borderColor: '#A2A4BE',
    borderRadius: 10,
    paddingLeft: 12,
    justifyContent: 'center',
  },
  input: {
    fontSize: 13,
    fontFamily: 'Nunito-Regular',
  },
  inputPlaceholder: {
    color: '#A2A4BE',
  },
});
