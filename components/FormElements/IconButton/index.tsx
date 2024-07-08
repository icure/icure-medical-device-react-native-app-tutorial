import React from 'react'
import { TouchableOpacity, Image, StyleSheet } from 'react-native'

export type IconButtonProps = {
  icon: 'arrow' | 'close' | 'plus' | 'delete'
  fulfilled?: boolean
  borderless?: boolean
  style?: 'fulfilled' | 'borderless'
  onClick: () => void
}

export const IconButton: React.FC<IconButtonProps> = ({ icon, onClick, fulfilled, borderless }) => {
  const showIcon = () => {
    switch (icon) {
      case 'arrow':
        return <Image style={styles.icn} source={require('../../../assets/images/single-arrow.png')} />
      case 'plus':
        return <Image style={[styles.icn, { transform: [{ rotate: '45deg' }] }]} source={require('../../../assets/images/smooth-close.png')} />
      case 'delete':
        return <Image style={styles.icn} source={require('../../../assets/images/delete.png')} />
      case 'close':
        if (fulfilled) {
          return <Image style={styles.icn} source={require('../../../assets/images/smooth-close-white.png')} />
        }
        if (borderless) {
          return <Image style={styles.icn} source={require('../../../assets/images/smooth-close.png')} />
        }
        return <Image style={styles.icn} source={require('../../../assets/images/smooth-close.png')} />
    }
  }

  return (
    <TouchableOpacity onPress={onClick} style={[styles.icnContainer, (icon === 'arrow' || fulfilled) && styles.fulfilled, borderless && styles.borderless]}>
      {showIcon()}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  icnContainer: {
    width: 42,
    height: 42,
    padding: 8,
    borderWidth: 1,
    borderColor: '#D06676',
    borderRadius: 25,
    backgroundColor: '#FFFDFE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fulfilled: {
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
})
