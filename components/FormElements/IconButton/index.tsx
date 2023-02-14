import React from 'react';
import {TouchableOpacity, Image, StyleSheet} from 'react-native';

export type IconButtonProps = {
  icon: 'arrow' | 'close' | 'plus';
  fulfilled?: boolean;
  borderless?: boolean;
  style?: 'fulfilled' | 'borderless';
  onClick: () => void;
};

export const IconButton: React.FC<IconButtonProps> = ({icon, onClick, fulfilled, borderless}) => {
  const showIcon = () => {
    switch (icon) {
      case 'arrow':
        return <Image style={styles.icn} source={require('../../../assets/images/single-arrow.png')} />;
      case 'plus':
        return <Image style={[styles.icn, {transform: [{rotate: '45deg'}]}]} source={require('../../../assets/images/smooth-close.png')} />;
      case 'close':
        if (fulfilled) {
          return <Image style={styles.icn} source={require('../../../assets/images/smooth-close-white.png')} />;
        }
        if (borderless) {
          return <Image style={styles.icn} source={require('../../../assets/images/smooth-close.png')} />;
        }
        return <Image style={styles.icn} source={require('../../../assets/images/smooth-close.png')} />;
    }
  };

  return (
    <TouchableOpacity onPress={onClick} style={[styles.icnContainer, (icon === 'arrow' || fulfilled) && styles.fulfield, borderless && styles.borderless]}>
      {showIcon()}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  icnContainer: {
    padding: 8,
    borderWidth: 1,
    borderColor: '#D06676',
    borderRadius: 5,
    backgroundColor: '#FFFDFE',
  },
  fulfield: {
    backgroundColor: '#D06676',
  },
  borderless: {
    borderWidth: 0,
    borderRadius: 5,
    backgroundColor: '#F2F3FE',
  },
  icn: {
    width: 15,
    height: 15,
  },
});
