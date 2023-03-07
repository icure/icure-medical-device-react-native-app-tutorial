import React from 'react';
import {TouchableOpacity, Text, StyleSheet} from 'react-native';
import {globalStyles} from '../../../styles/GlobalStyles';

export type Props = {
  title: string;
  onClick: () => void;
  outlined?: boolean;
  danger?: boolean;
  size?: 'small';
};

export const SquareButton: React.FC<Props> = ({title, onClick, outlined, danger, size}) => {
  return (
    <TouchableOpacity onPress={onClick} style={[styles.appButtonContainer, outlined && styles.outlined, danger && styles.danger, size === 'small' && styles.smallContainer]}>
      <Text style={[globalStyles.baseText, styles.appButtonText, outlined && styles.outlinedCaseText, danger && styles.dangerCaseText, size === 'small' && styles.smallText]}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  appButtonContainer: {
    backgroundColor: '#D06676',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#D06676',
  },
  outlined: {
    backgroundColor: 'transparent',
  },
  danger: {
    backgroundColor: 'transparent',
    borderColor: '#F05B5D',
  },
  outlinedCaseText: {
    color: '#151B5D',
  },
  dangerCaseText: {
    color: '#F05B5D',
  },
  appButtonText: {
    color: '#FFFDFE',
  },
  smallText: {
    fontSize: 12,
    fontFamily: 'Nunito-Regular',
  },
  smallContainer: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
});
