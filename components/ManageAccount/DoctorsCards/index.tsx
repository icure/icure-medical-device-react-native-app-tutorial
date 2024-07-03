import React, { useState } from 'react'
import { StyleSheet, View, Text, Image, Modal, Dimensions } from 'react-native'
import { IHealthcareProfessional } from '@icure/medical-device-sdk'

import { globalStyles } from '../../../styles/GlobalStyles'
import { IconButton } from '../../FormElements'
import { Button } from '../../FormElements'
import { useGetHealthcareProfessionalQuery } from '../../../services/healthcareProfessionalApi'
import { useShareDataWithMutation, useStopSharingWithMutation } from '../../../services/userApi'

type DoctorCardAddProps = {
  hcp: IHealthcareProfessional
}

type DoctorCardRemoveProps = {
  id: string
}

type ConfirmationWindowProps = {
  title: string
  description: string
  onPositiveButtonClick: () => void
  onNegativeButtonClick: () => void
}

const WIDTH_MODAL = Dimensions.get('window').width
const HEIGHT_MODAL = Dimensions.get('window').height

const ConfirmationWindow: React.FC<ConfirmationWindowProps> = ({ title, description, onPositiveButtonClick, onNegativeButtonClick }) => {
  return (
    <View style={confirmationWindowStyles.container}>
      <View style={confirmationWindowStyles.popup}>
        <Text style={confirmationWindowStyles.title}>{title}</Text>
        <Text style={confirmationWindowStyles.subtitle}>{description}</Text>
        <View style={confirmationWindowStyles.buttonsGroup}>
          <Button title="Confirm" onClick={onPositiveButtonClick} width={'50%'} />
          <Button title="Cancel" onClick={onNegativeButtonClick} outlined={true} width={'50%'} />
        </View>
      </View>
    </View>
  )
}

export const DoctorToBeAddedCard: React.FC<DoctorCardAddProps> = ({ hcp }) => {
  const [showConfirmationWindow, setShowConfirmationWindow] = useState(false)
  const [shareDataWithDoctor] = useShareDataWithMutation()
  const handleAdd = () => {
    hcp.id && shareDataWithDoctor({ ids: [hcp.id] })
    setShowConfirmationWindow(false)
  }
  return (
    <>
      <View style={styles.card}>
        <View style={styles.cardInnerContainer}>
          <View style={styles.icnContainer}>
            <Image style={styles.doctorIcn} source={require('../../../assets/images/stethoscope.png')} />
          </View>
          <View style={styles.cardContent}>
            <Text style={globalStyles.baseText}>{hcp?.firstName + ' ' + hcp?.lastName}</Text>
            <Text style={styles.email}>{hcp?.addresses[0]?.telecoms.find((item) => item.telecomType === 'email')?.telecomNumber}</Text>
          </View>
        </View>
        <View style={styles.actionBtn}>
          <IconButton icon="plus" onClick={() => setShowConfirmationWindow(true)} />
        </View>
      </View>
      <Modal
        animationType="slide"
        transparent={true}
        visible={showConfirmationWindow}
        onRequestClose={() => {
          setShowConfirmationWindow(!showConfirmationWindow)
        }}
      >
        <ConfirmationWindow
          title="Add doctor"
          description="Are you sure you want to start sharing your Medical Data with this doctor?"
          onPositiveButtonClick={handleAdd}
          onNegativeButtonClick={() => setShowConfirmationWindow(false)}
        />
      </Modal>
    </>
  )
}

export const DoctorToBeRemovedCard: React.FC<DoctorCardRemoveProps> = ({ id }) => {
  const [showConfirmationWindow, setShowConfirmationWindow] = useState(false)
  const { data: hcp } = useGetHealthcareProfessionalQuery(id, { skip: !id })
  const [stopSharingDataWithDoctor] = useStopSharingWithMutation()

  const handleRemove = () => {
    stopSharingDataWithDoctor({ ids: [id] })
    setShowConfirmationWindow(false)
  }

  return (
    <>
      <View style={styles.card}>
        <View style={styles.cardInnerContainer}>
          <View style={styles.icnContainer}>
            <Image style={styles.doctorIcn} source={require('../../../assets/images/stethoscope.png')} />
          </View>
          <View style={styles.cardContent}>
            <Text style={globalStyles.baseText}>{hcp?.firstName + ' ' + hcp?.lastName}</Text>
            <Text style={styles.email}>{hcp?.addresses[0]?.telecoms.find((item) => item.telecomType === 'email')?.telecomNumber}</Text>
          </View>
        </View>
        <View style={styles.actionBtn}>
          <IconButton
            icon="delete"
            onClick={() => {
              setShowConfirmationWindow(true)
            }}
            fulfilled
          />
        </View>
      </View>
      <Modal
        animationType="slide"
        transparent={true}
        visible={showConfirmationWindow}
        onRequestClose={() => {
          setShowConfirmationWindow(!showConfirmationWindow)
        }}
      >
        <ConfirmationWindow
          title="Stop sharing"
          description="Are you sure you want to stop sharing your Medical Data with this doctor?"
          onPositiveButtonClick={handleRemove}
          onNegativeButtonClick={() => setShowConfirmationWindow(false)}
        />
      </Modal>
    </>
  )
}

const confirmationWindowStyles = StyleSheet.create({
  container: {
    width: WIDTH_MODAL,
    height: HEIGHT_MODAL,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popup: {
    width: '95%',
    paddingVertical: 40,
    paddingHorizontal: 24,
    backgroundColor: '#FFFDFE',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    textAlign: 'center',
    color: '#151B5D',
    fontSize: 18,
    marginBottom: 12,
    fontFamily: 'Nunito-Bold',
  },
  subtitle: {
    textAlign: 'center',
    color: '#151B5D',
    fontSize: 14,
    fontFamily: 'Nunito-Regular',
  },
  buttonsGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 32,
    gap: 16,
  },
})
const styles = StyleSheet.create({
  card: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F2F3FE',
    borderRadius: 15,
    padding: 8,
    paddingRight: 8,
  },
  cardInnerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardContent: {
    gap: 4,
  },
  email: {
    fontSize: 12,
    color: '#A2A4BE',
    fontFamily: 'Nunito-Regular',
  },
  icnContainer: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  doctorIcn: {
    width: 20,
    height: 20,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
})
