import React, { useState } from 'react'
import { ScrollView, StyleSheet, Image, View, Dimensions, Modal, TouchableOpacity } from 'react-native'

import { Header } from '../components/Header'
import { AdvancedCalendar } from '../components/AdvancedCalendar'
import { SymbolsExplanationModal } from '../components/SymbolsExplanationModal'
import { useCurrentPatientQuery } from '../services/patientApi'
import { CyclesHistory } from '../components/CyclesHistory'

const WIDTH_MODAL = Dimensions.get('window').width
const HEIGHT_MODAL = Dimensions.get('window').height

export const Home = () => {
  const [symbolsExplanationmodalVisible, setSymbolsExplanationModalVisible] = useState(false)

  const { data: patient } = useCurrentPatientQuery()

  return (
    <ScrollView contentContainerStyle={styles.homeScreen}>
      <View style={styles.contentTopBlock}>
        <Header userName={patient?.firstName || patient?.lastName ? `${patient.firstName} ${patient.lastName}` : 'Dear User'} />
        <Image style={styles.logo} source={require('../assets/images/logo-with-pod.png')} />
        <TouchableOpacity style={styles.infoIcnContainer} onPress={() => setSymbolsExplanationModalVisible(true)}>
          <Image style={styles.infoIcn} source={require('../assets/images/info.png')} />
        </TouchableOpacity>
      </View>
      <AdvancedCalendar />
      <CyclesHistory />
      <Modal
        animationType="slide"
        transparent={true}
        visible={symbolsExplanationmodalVisible}
        onRequestClose={() => {
          setSymbolsExplanationModalVisible(!symbolsExplanationmodalVisible)
        }}
      >
        <SymbolsExplanationModal onClose={() => setSymbolsExplanationModalVisible(!symbolsExplanationmodalVisible)} />
      </Modal>
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
  contentTopBlock: {
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  logo: {
    width: 100,
    height: 100,
    marginTop: 16,
  },
  infoIcnContainer: {
    width: '100%',
    alignItems: 'flex-end',
  },
  infoIcn: {
    width: 24,
    height: 24,
  },
})
