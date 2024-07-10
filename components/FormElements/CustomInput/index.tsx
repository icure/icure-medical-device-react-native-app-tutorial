import React from 'react'
import { View, TextInput, Text, StyleSheet } from 'react-native'

export type Props = {
  label?: string
  value: string | number | undefined
  onChange: (value?: string) => void
  onBlur?: () => void
  isRequired?: boolean
  placeholder?: string
  error?: boolean
}

export const CustomInput: React.FC<Props> = ({ label, value, onChange, onBlur, placeholder, isRequired, error }) => {
  return (
    <View style={styles.container}>
      {label && (
        <Text style={styles.label}>
          {isRequired && <Text style={styles.star}>*</Text>} {label}
        </Text>
      )}
      <TextInput
        style={[styles.input, error && styles.error]}
        onBlur={onBlur}
        onChangeText={onChange}
        value={value?.toString()}
        autoCapitalize="none"
        placeholder={placeholder ? placeholder : undefined}
        placeholderTextColor="#DDE3E7"
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  label: {
    marginBottom: 8,
    fontSize: 14,
    color: '#303443',
    fontFamily: 'Nunito-Regular',
  },
  star: {
    color: '#EB3437',
  },
  input: {
    width: '100%',
    height: 42,
    borderWidth: 1,
    borderColor: '#DDE3E7',
    borderRadius: 15,
    fontSize: 13,
    paddingLeft: 12,
    fontFamily: 'Nunito-Regular',
  },
  error: {
    borderColor: '#EB3437',
  },
})
