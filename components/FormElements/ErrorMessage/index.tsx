import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { globalStyles } from '../../../styles/GlobalStyles'

export type Props = {
  text: string
}

export const ErrorMessage: React.FC<Props> = ({ text }) => {
  return (
    <View>
      <Text style={[globalStyles.baseText, styles.errorText]}>{text}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  errorText: {
    color: '#EB3437',
  },
})
