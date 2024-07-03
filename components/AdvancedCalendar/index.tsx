import React, { useEffect, useState, useMemo } from 'react'
import { Image, Modal, StyleSheet, Text, View } from 'react-native'
import { Calendar } from 'react-native-calendars'
import { format, lastDayOfMonth, formatDistanceStrict, add, max, isWithinInterval } from 'date-fns'

import { AddDataSamplesModal } from '../AddDataSamplesModal'
import {
  useCreateOrUpdateDataSamplesMutation,
  useDeleteDataSamplesMutation,
  useGetDataSampleBetween2DatesQuery,
  useGetDataSampleByTagTypeQuery,
} from '../../services/dataSampleApi'
import { getCyclesDates, getDayInDateFormat, getNextDay, getDayInNumberFormat, getShortNameOfTheMonth } from '../../utils/helpers'
import { IDataSample } from '@icure/medical-device-sdk'
import { CustomActivityIndicator } from '../CustomActivityIndicator'
import { CalendarCustomDay } from './CalendarCustomDay'

export const AdvancedCalendar: React.FC = () => {
  const [addUserDataSampleModalVisible, setAddUserDataSampleModalVisible] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedDateTitle, setSelectedDateTitle] = useState('')
  const [dataSamples, setDataSamples] = useState<{ flowLevel: IDataSample[]; complaints: IDataSample[]; notes: IDataSample[] } | undefined>()

  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [currentMonthFirstDate, setCurrentMonthFirstDate] = useState<number>()
  const [nextMonthFirstDate, setNextMonthFirstDate] = useState<number>()

  useEffect(() => {
    setCurrentMonthFirstDate(+format(currentMonth, 'yyyyMM01') * 1000000)
    setNextMonthFirstDate(+format(getNextDay(lastDayOfMonth(currentMonth)), 'yyyyMMdd') * 1000000)
  }, [currentMonth])

  const [createOrUpdateDataSamples, { isLoading: isCreateOrUpdateDataSamplesLoading }] = useCreateOrUpdateDataSamplesMutation()
  const [deleteDataSamples, { isLoading: isDeleteDataSamplesLoading }] = useDeleteDataSamplesMutation()
  const periodFilter = useMemo(
    () => ({
      tagType: 'LOINC',
      tagCode: '49033-4',
    }),
    [],
  )
  const monthFilter = useMemo(
    () => ({
      tagCodes: [
        { tagType: 'LOINC', tagCode: '49033-4' },
        { tagType: 'LOINC', tagCode: '75322-8' },
        { tagType: 'LOINC', tagCode: '34109-9' },
      ],
      startDate: currentMonthFirstDate ?? 0,
      endDate: nextMonthFirstDate ?? 0,
    }),
    [currentMonthFirstDate, nextMonthFirstDate],
  )
  const { data: flowLevelComplaintsAndNotesDataSamplesBetween2Dates, isLoading: flowLevelComplaintsAndNotesDataSamplesBetween2DatesIsLoading } = useGetDataSampleBetween2DatesQuery(
    monthFilter,
    { skip: !currentMonthFirstDate || !nextMonthFirstDate },
  )
  const { data: periodDataSamples, isLoading: periodDataSamplesIsLoading } = useGetDataSampleByTagTypeQuery(periodFilter)

  useEffect(() => {
    if (!!flowLevelComplaintsAndNotesDataSamplesBetween2Dates) {
      const dataSamplesToProcess = flowLevelComplaintsAndNotesDataSamplesBetween2Dates?.rows
      const flowLevelDataSample = dataSamplesToProcess.filter((ds) => ds.labels.some((it) => it.type === 'LOINC' && it.code === '49033-4'))
      const complainsDataSample = dataSamplesToProcess.filter((ds) => ds.labels.some((it) => it.type === 'LOINC' && it.code === '75322-8'))
      const notesDataSample = dataSamplesToProcess.filter((ds) => ds.labels.some((it) => it.type === 'LOINC' && it.code === '34109-9'))
      setDataSamples({ flowLevel: flowLevelDataSample, complaints: complainsDataSample, notes: notesDataSample })
    }
  }, [flowLevelComplaintsAndNotesDataSamplesBetween2Dates])

  const getDataSamplesOnDate = (dataSamples?: IDataSample[], currentDay?: Date) => {
    if (!!dataSamples && !!currentDay) {
      return dataSamples.filter((item) => item.valueDate === getDayInNumberFormat(currentDay))
    } else {
      return []
    }
  }

  const predictedPeriodDates = useMemo(() => {
    if (periodDataSamples && !periodDataSamplesIsLoading) {
      const lastThreeCycles = [...getCyclesDates(periodDataSamples)]?.reverse().slice(1, 4)

      if (lastThreeCycles.length !== 0) {
        const lastPeriodDataSampleDate = max(
          periodDataSamples?.rows.filter((item) => (item?.content?.['en']?.measureValue?.value ?? 0) > 0).map((item) => getDayInDateFormat(item.valueDate ?? 0)),
        )
        const getCycleDuration = (currentCycleFirstDay: number, currentCycleLastDay: number) => {
          const duration = formatDistanceStrict(getDayInDateFormat(currentCycleFirstDay), getDayInDateFormat(currentCycleLastDay), { unit: 'day' }).split(' ')[0]
          return +duration
        }
        const totalDurationOfLastThreeCycles = lastThreeCycles.reduce((accamulator, item) => accamulator + getCycleDuration(item.startDate ?? 0, item.endDate), 0)
        const averageCycleDuration = lastThreeCycles.length !== 0 ? Math.floor(totalDurationOfLastThreeCycles / lastThreeCycles.length) : 28

        const firstDayOfThePredictedPeriod = add(lastPeriodDataSampleDate, { days: averageCycleDuration })
        // let's say the duration of the Predicted period is 7 days, which means that the users period can start at any of those days
        const lastDayOfThePredictedPeriod = add(firstDayOfThePredictedPeriod, { days: 5 })

        return { start: firstDayOfThePredictedPeriod, end: lastDayOfThePredictedPeriod }
      }
    }
    return undefined
  }, [periodDataSamples, periodDataSamplesIsLoading])
  const isTodayPredictedPeriodDay = (today?: Date) => {
    if (!!predictedPeriodDates && !!today) {
      return isWithinInterval(today, predictedPeriodDates)
    }
    return false
  }

  return (
    <>
      <Modal
        animationType="slide"
        transparent={true}
        visible={addUserDataSampleModalVisible}
        onRequestClose={() => {
          setAddUserDataSampleModalVisible(!addUserDataSampleModalVisible)
        }}
      >
        <AddDataSamplesModal
          date={selectedDate}
          title={selectedDateTitle}
          onClose={() => setAddUserDataSampleModalVisible(!addUserDataSampleModalVisible)}
          onSave={() => setAddUserDataSampleModalVisible(!addUserDataSampleModalVisible)}
          onDelete={() => setAddUserDataSampleModalVisible(!addUserDataSampleModalVisible)}
          currentFlowLevelData={(d) => getDataSamplesOnDate(dataSamples?.flowLevel, d)[0]}
          currentComplaintsDatas={(d) => getDataSamplesOnDate(dataSamples?.complaints, d)}
          currentNotesData={(d) => getDataSamplesOnDate(dataSamples?.notes, d)[0]}
          createOrUpdateDataSamples={createOrUpdateDataSamples}
          deleteDataSamples={deleteDataSamples}
        />
      </Modal>
      {flowLevelComplaintsAndNotesDataSamplesBetween2DatesIsLoading ||
        periodDataSamplesIsLoading ||
        isCreateOrUpdateDataSamplesLoading ||
        (isDeleteDataSamplesLoading && <CustomActivityIndicator />)}
      <View style={styles.advancedCalendar}>
        <Calendar
          dayComponent={({ date, state }) =>
            date ? (
              <CalendarCustomDay
                dayData={date}
                state={state}
                flowLevel={getDataSamplesOnDate(dataSamples?.flowLevel, date ? new Date(date.dateString) : undefined)[0]?.content?.['en']?.measureValue?.value}
                hasComplaint={
                  !!getDataSamplesOnDate(dataSamples?.complaints, date && new Date(date.dateString))?.length ||
                  !!getDataSamplesOnDate(dataSamples?.notes, date && new Date(date.dateString))[0]?.content?.['en']?.stringValue
                }
                isPredictedPeriod={isTodayPredictedPeriodDay(date && new Date(date.dateString))}
                setSelectedDateTitle={setSelectedDateTitle}
                setSelectedDate={setSelectedDate}
                setAddUserDataSampleModalVisible={setAddUserDataSampleModalVisible}
              />
            ) : (
              <View></View>
            )
          }
          renderArrow={(direction) => {
            return (
              <>
                {direction === 'left' ? (
                  <View style={styles.inactiveMonthContainer}>
                    <Image style={[styles.arrow, styles.arrowLeft]} source={require('../../assets/images/arrows.png')} />
                    <Text style={styles.inactiveMonth}>{getShortNameOfTheMonth(currentMonth, 'prev')}</Text>
                  </View>
                ) : (
                  <View style={styles.inactiveMonthContainer}>
                    <Text style={styles.inactiveMonth}>{getShortNameOfTheMonth(currentMonth, 'next')}</Text>
                    <Image style={[styles.arrow, styles.arrowRight, { transform: [{ rotateY: '3.142rad' }] }]} source={require('../../assets/images/arrows.png')} />
                  </View>
                )}
              </>
            )
          }}
          onMonthChange={(date) => {
            const { dateString } = date
            setCurrentMonth(new Date(dateString))
          }}
          allowSelectionOutOfRange={false}
          hideExtraDays={true}
          maxDate={new Date().toISOString().slice(0, 10)}
          theme={
            {
              'stylesheet.calendar.header': {
                header: {
                  width: '100%',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'flex-end',
                  paddingBottom: 8,
                  borderBottomColor: '#E3E4EF',
                  borderBottomWidth: 1,
                },
                monthText: {
                  fontSize: 20,
                  color: '#151B5D',
                  paddingBottom: 6,
                  fontFamily: 'Nunito-Bold',
                },
                week: {
                  marginVertical: 16,
                  flexDirection: 'row',
                  justifyContent: 'space-around',
                  backgroundColor: '#FFFDFE',
                },
                dayHeader: {
                  width: 43,
                  textAlign: 'center',
                  fontSize: 12,
                  color: '#A2A4BE',
                  fontFamily: 'Nunito-Bold',
                },
                arrow: {
                  padding: 0,
                },
              },
              'stylesheet.calendar.main': {
                container: {
                  paddingHorizontal: 16,
                },
                week: {
                  marginVertical: 2,
                  flexDirection: 'row',
                  justifyContent: 'space-around',
                  backgroundColor: '#FFFDFE',
                },
              },
            } as any
          }
        />
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  advancedCalendar: {
    width: '100%',
    marginTop: 24,
  },
  inactiveMonthContainer: {
    flexDirection: 'row',
  },
  inactiveMonth: {
    fontSize: 10,
    color: '#A2A4BE',
    fontFamily: 'Nunito-Regular',
  },
  arrow: {
    width: 14,
    height: 14,
  },
  arrowLeft: {
    marginRight: 4,
  },
  arrowRight: {
    marginLeft: 4,
  },
})
