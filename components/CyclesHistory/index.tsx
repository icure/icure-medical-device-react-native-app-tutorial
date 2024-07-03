import React, { useMemo, useState } from 'react'
import { ScrollView, StyleSheet, Image, Text, View, Dimensions, Modal, TouchableOpacity, ActivityIndicator } from 'react-native'

import { useGetDataSampleByTagTypeQuery } from '../../services/dataSampleApi'
import { CycleItem } from './CycleItem'
import { getCyclesDates } from '../../utils/helpers'

const WIDTH_MODAL = Dimensions.get('window').width
const HEIGHT_MODAL = Dimensions.get('window').height

export const CyclesHistory = () => {
  const [showCyclesHistoryWindow, setShowCyclesHistoryWindow] = useState(false)
  const periodFilter = useMemo(
    () => ({
      tagType: 'LOINC',
      tagCode: '49033-4',
    }),
    [],
  )
  const { data: periodDataSamples, isLoading: periodDataSamplesAreLoading } = useGetDataSampleByTagTypeQuery(periodFilter)

  return (
    <>
      {periodDataSamplesAreLoading ? (
        <ActivityIndicator color="#151B5D" />
      ) : (
        <View style={blockStyles.container}>
          <Text style={blockStyles.heading}>My cycles</Text>
          <View style={blockStyles.innerContainer}>
            {getCyclesDates(periodDataSamples)?.length === 0 ? (
              <View style={blockStyles.placeholderContainer}>
                <Text style={blockStyles.placeholderText}>There is no Cycle History data yet. </Text>
                <Text style={blockStyles.placeholderText}>Please, add you period data to the calendar above.</Text>
              </View>
            ) : (
              <>
                <TouchableOpacity style={blockStyles.cyclesHistoryLinkContainer} onPress={() => setShowCyclesHistoryWindow(true)}>
                  <Text style={blockStyles.cyclesHistoryLinkTitle}>Cycles History</Text>
                  <View style={blockStyles.arrowIcnContainer}>
                    <Image style={blockStyles.arrowIcn} source={require('../../assets/images/purple-arrow-right.png')} />
                  </View>
                </TouchableOpacity>
                {[...getCyclesDates(periodDataSamples)]
                  ?.reverse()
                  .slice(0, 3)
                  .map((item, index) => (
                    <CycleItem key={index} cycle={item} />
                  ))}
              </>
            )}
          </View>
        </View>
      )}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showCyclesHistoryWindow}
        onRequestClose={() => {
          setShowCyclesHistoryWindow(!showCyclesHistoryWindow)
        }}
      >
        <View style={cycleHistoryPopupStyles.container}>
          <View style={cycleHistoryPopupStyles.popup}>
            {/* Header */}
            <View style={cycleHistoryPopupStyles.titleContainer}>
              <Text style={cycleHistoryPopupStyles.title}>Cycle History</Text>
              <TouchableOpacity onPress={() => setShowCyclesHistoryWindow(false)} style={cycleHistoryPopupStyles.closeIcnContainer}>
                <Image style={cycleHistoryPopupStyles.closeIcn} source={require('../../assets/images/close.png')} />
              </TouchableOpacity>
            </View>
            <ScrollView contentContainerStyle={cycleHistoryPopupStyles.scrollableContainer}>
              {getCyclesDates(periodDataSamples)?.length === 0 ? (
                <ActivityIndicator color="#151B5D" />
              ) : (
                [...getCyclesDates(periodDataSamples)]?.reverse().map((item, index) => (
                  <View key={index} style={cycleHistoryPopupStyles.cycleItemContainer}>
                    <CycleItem expanded cycle={item} />
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  )
}

const cycleHistoryPopupStyles = StyleSheet.create({
  container: {
    width: WIDTH_MODAL,
    height: HEIGHT_MODAL,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  popup: {
    width: '100%',
    marginTop: HEIGHT_MODAL * 0.05,
    height: HEIGHT_MODAL,
    backgroundColor: '#FFFDFE',
    borderTopRightRadius: 15,
    borderTopLeftRadius: 15,
    paddingVertical: 32,
  },
  scrollableContainer: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 16,
    paddingRight: 8,
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    color: '#151B5D',
    fontFamily: 'Nunito-Medium',
  },
  closeIcnContainer: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcn: {
    width: 16,
    height: 16,
  },
  cycleItemContainer: {
    marginTop: 12,
    backgroundColor: '#F2F3FE',
    borderRadius: 5,
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
})

const blockStyles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    marginTop: 24,
  },
  heading: {
    fontSize: 20,
    color: '#151B5D',
    fontFamily: 'Nunito-Bold',
  },
  placeholderContainer: {
    width: '100%',
    paddingVertical: 16,
  },
  placeholderText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#151B5D',
    fontFamily: 'Nunito-Regular',
  },
  innerContainer: {
    marginTop: 16,
    backgroundColor: '#F2F3FE',
    borderRadius: 15,
    paddingHorizontal: 8,
    paddingVertical: 16,
  },
  cyclesHistoryLinkContainer: {
    width: '100%',
    height: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cyclesHistoryLinkTitle: {
    fontSize: 14,
    color: '#6273D9',
    fontFamily: 'Nunito-Bold',
  },
  arrowIcnContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowIcn: {
    width: 15,
    height: 15,
  },
})
