import React, { useState, useRef } from 'react'
import { View, TextInput, StyleSheet, Image } from 'react-native'

import { IconButton } from '../IconButton'

export type SearchSquareInputProps = {
  onSubmit?: (value?: string) => void
  onClose?: () => void
  onOpen?: () => void
  placeholder?: string
  onSearchQueryChange: (value?: string) => void
  searchQuery: string | undefined
}

export const SearchSquareInput: React.FC<SearchSquareInputProps> = ({ onSubmit, placeholder, onClose, onOpen, searchQuery, onSearchQueryChange }) => {
  const [isInputTouched, setInputTouched] = useState(false)
  const textInputReference = useRef(null as TextInput | null)
  // const handleChange = (value: string) => {
  //   setSearchValue(value)
  // }

  const handleClear = () => {
    const current = textInputReference.current
    if (!current) {
      return
    }
    current.blur()
    current.clear()
    setInputTouched(false)
    onClose?.()
  }

  const handleSubmit = (value: string) => {
    onSubmit?.(value)
  }

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        {!isInputTouched && (
          <View style={styles.searchIcnContainer}>
            <Image style={styles.searchIcn} source={require('../../../assets/images/search.png')} />
          </View>
        )}
        <TextInput
          style={styles.input}
          onChangeText={(value: string) => onSearchQueryChange(value)}
          value={searchQuery}
          autoCapitalize="none"
          placeholder={placeholder ?? ''}
          placeholderTextColor="#A2A4BE"
          onPressIn={() => {
            setInputTouched(true)
            onOpen?.()
          }}
          ref={textInputReference}
        />
      </View>
      {isInputTouched && (
        <View style={styles.buttonGroup}>
          <IconButton icon="arrow" onClick={() => searchQuery && handleSubmit(searchQuery)} />
          <IconButton icon="close" onClick={handleClear} />
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  inputContainer: {
    flex: 1,
    height: 42,
    borderWidth: 1,
    borderColor: '#A2A4BE',
    borderRadius: 25,
    paddingLeft: 15,
    flexDirection: 'row',
    alignItems: 'center',
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
    flex: 1,
    fontSize: 13,
    fontFamily: 'Nunito-Regular',
  },
  searchIcnContainer: {
    width: 15,
    height: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  searchIcn: {
    width: 15,
    height: 15,
  },
  buttonGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 4,
    paddingRight: 8,
    gap: 4,
  },
})
