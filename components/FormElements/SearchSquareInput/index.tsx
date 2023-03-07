import React, {useState, useRef} from 'react';
import {View, TextInput, StyleSheet, Image} from 'react-native';

import {IconButton} from '../index';
import {globalStyles} from '../../../styles/GlobalStyles';

export type SearchSquareInputProps = {
  onSubmit?: (value?: string) => void;
  onClose?: () => void;
  onOpen?: () => void;
  placeholder?: string;
};

export const SearchSquareInput: React.FC<SearchSquareInputProps> = ({onSubmit, placeholder, onClose, onOpen}) => {
  const [isInputTouched, setInputTouched] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const textInputReference = useRef(null);
  const handleChange = (value: string) => {
    setSearchValue(value);
  };

  const handleClear = () => {
    textInputReference.current.blur();
    textInputReference.current.clear();
    setInputTouched(false);
    onClose();
  };

  const handleSubmit = (value: string) => {
    onSubmit(value);
    // textInputReference.current.blur();
    // textInputReference.current.clear();
    // setInputTouched(false);
  };

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
          onChangeText={(value: string) => handleChange(value)}
          value={searchValue}
          autoCapitalize="none"
          placeholder={placeholder ? placeholder : null}
          placeholderTextColor="#A2A4BE"
          onPressIn={() => {
            setInputTouched(true);
            onOpen();
          }}
          ref={textInputReference}
        />
      </View>
      {isInputTouched && (
        <View style={styles.buttonGroup}>
          <View style={globalStyles.mr4}>
            <IconButton icon="arrow" onClick={() => handleSubmit(searchValue)} />
          </View>
          <IconButton icon="close" onClick={handleClear} />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    justifyContent: 'flex-end',
  },
  inputContainer: {
    flex: 1,
    height: 42,
    borderWidth: 1,
    borderColor: '#A2A4BE',
    borderRadius: 10,
    paddingLeft: 12,
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
  },
});
