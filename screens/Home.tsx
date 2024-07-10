import React from 'react'
import { ScrollView, StyleSheet, Image, View, Dimensions, Linking, Text } from 'react-native'

import { Header } from '../components/Header'
import { useCurrentPatientQuery } from '../services/patientApi'
import { globalStyles } from '../styles/GlobalStyles'

const WIDTH_MODAL = Dimensions.get('window').width
const HEIGHT_MODAL = Dimensions.get('window').height

export const Home = () => {
  const { data: patient } = useCurrentPatientQuery()
  const openDoc = () => {
    Linking.openURL('https://docs.icure.com/sdks/how-to/index')
  }
  return (
    <ScrollView contentContainerStyle={styles.homeScreen}>
      <View style={styles.content}>
        <Header userName={patient?.firstName || patient?.lastName ? `${patient.firstName} ${patient.lastName}` : 'Dear User'} />
        <Image style={styles.logo} source={require('../assets/images/icure-logo.png')} />
        <View style={styles.description}>
          <Text style={styles.heading}>Well done!</Text>
          <Text style={[globalStyles.baseText, styles.subtitle]}>
            If you arrived here, it means you completed your registration / login successfully. Time to head to{' '}
            <Text style={styles.link} onPress={openDoc}>
              iCure Documentation{' '}
            </Text>
            to add some data!
          </Text>
        </View>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  homeScreen: {
    flex: 1,
    minHeight: HEIGHT_MODAL,
    width: WIDTH_MODAL,
    backgroundColor: '#FFFDFE',
  },
  content: {
    alignItems: 'center',
    gap: 42,
  },
  logo: {
    width: 250,
    height: 100,
  },
  description: {
    gap: 8,
  },
  heading: {
    fontSize: 24,
    fontFamily: 'Nunito-Bold',
    color: '#009290',
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
  },
  link: {
    textDecorationLine: 'underline',
    color: '#009290',
  },
})
