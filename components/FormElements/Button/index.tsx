import React from 'react'
import { TouchableOpacity, Text, StyleSheet, DimensionValue } from 'react-native'
import { globalStyles } from '../../../styles/GlobalStyles'

export type ButtonProps = {
  danger?: boolean
  onClick: () => void
  outlined?: boolean
  title: string
  width?: DimensionValue
  size?: 'large'
}

export const Button: React.FC<ButtonProps> = ({ title, onClick, outlined, danger, width, size }) => {
  return (
    <TouchableOpacity
      onPress={onClick}
      style={[styles.appButtonContainer, outlined && styles.outlined, danger && styles.danger, size === 'large' && styles.large, { width: width ?? 'auto' }]}
    >
      <Text style={[globalStyles.baseText, styles.appButtonText, outlined && styles.outlinedCaseText, danger && styles.dangerCaseText]}>{title}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  appButtonContainer: {
    backgroundColor: '#D06676',
    paddingHorizontal: 24,
    height: 42,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#D06676',
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlined: {
    backgroundColor: 'transparent',
  },
  danger: {
    backgroundColor: 'transparent',
    borderColor: '#F05B5D',
  },
  large: {
    paddingHorizontal: 40,
  },
  appButtonText: {
    color: '#FFFDFE',
  },
  outlinedCaseText: {
    color: '#151B5D',
  },
  dangerCaseText: {
    color: '#F05B5D',
  },
})
