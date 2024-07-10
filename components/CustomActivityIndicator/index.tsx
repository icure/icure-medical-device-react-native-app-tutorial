import React from 'react'
import { ActivityIndicator, Dimensions, StyleSheet, View } from 'react-native'

const WIDTH_MODAL = Dimensions.get('window').width
const HEIGHT_MODAL = Dimensions.get('window').height

export const CustomActivityIndicator: React.FC = () => {
  return (
    <View style={styles.activityIndicator}>
      <View style={styles.indicatorContainer}>
        <ActivityIndicator size="large" color="#303443" />
      </View>
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
    zIndex: 100,
  },
  indicatorContainer: {
    width: '100%',
    height: '100%',
    borderRadius: 15,
    backgroundColor: 'rgba(235, 237, 249, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
})
