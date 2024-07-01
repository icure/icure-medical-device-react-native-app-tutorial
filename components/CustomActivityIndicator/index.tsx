import React from 'react'
import { ActivityIndicator, Dimensions, StyleSheet, View } from 'react-native'

const WIDTH_MODAL = Dimensions.get('window').width
const HEIGHT_MODAL = Dimensions.get('window').height

export const CustomActivityIndicator: React.FC = () => {
  return (
    <View style={styles.activityIndicator}>
      <ActivityIndicator size="large" color="white" />
    </View>
  )
}

const styles = StyleSheet.create({
  activityIndicator: {
    minWidth: WIDTH_MODAL,
    width: '100%',
    minHeight: HEIGHT_MODAL,
    height: '100%',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    backgroundColor: 'rgba(21, 27, 93, 0.5)',
    zIndex: 100,
  },
})
