import React, { useEffect, useState, useMemo } from 'react'
import { Image, ImageBackground, Modal, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from 'react-native'
import { Calendar } from 'react-native-calendars'
import { format, lastDayOfMonth, formatDistanceStrict, add, max, isWithinInterval, isAfter } from 'date-fns'

import { AddUserDataSampleModal } from '../AddUserDataSampleModal'
import {
  useCreateOrUpdateDataSamplesMutation,
  useDeleteDataSamplesMutation,
  useGetDataSampleBetween2DatesQuery,
  useGetDataSampleByTagTypeQuery,
} from '../../services/dataSampleApi'
import { getCyclesDates, getDayInDateFormat, getNextDay, getDayInNumberFormat } from '../../utils/helpers'
import { DataSample, IDataSample } from '@icure/medical-device-sdk'
import { CustomActivityIndicator } from '../CustomActivityIndicator'

type DayOfTheMonthProps = {
  dayData: any
  state?: string
  flowLevel?: number
  hasComplaint?: boolean
  isPredictedPeriod?: boolean
}

export const AdvancedCalendar: React.FC = () => {
  const [addUserDataSampleModalVisible, setAddUserDataSampleModalVisible] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedDateTitle, setSelectedDateTitle] = useState('')
  const [dataSamples, setDataSamples] = useState<{ flowLevel: IDataSample[]; complaints: IDataSample[]; notes: IDataSample[] } | undefined>()

  const monthNameFormatter = (dataFormat: 'short' | 'long') => new Intl.DateTimeFormat('en', { month: dataFormat })
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [currentMonthFirstDate, setCurrentMonthFirstDate] = useState<number>()
  const [nextMonthFirstDate, setNextMonthFirstDate] = useState<number>()

  useEffect(() => {
    setCurrentMonthFirstDate(+format(currentMonth, 'yyyyMM01') * 1000000)
    setNextMonthFirstDate(+format(getNextDay(lastDayOfMonth(currentMonth)), 'yyyyMMdd') * 1000000)
  }, [currentMonth])

  const [createOrUpdateDataSamples, { isLoading: isCreateOrUpdateDataSamplesLoading }] = useCreateOrUpdateDataSamplesMutation()

  const [deleteDataSamples, { isLoading: isDeleteDataSamplesLoading }] = useDeleteDataSamplesMutation()
  const predictionFilter = useMemo(
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
  const { data: allFlowLevelDataSamples, isLoading: allFlowLevelDataSamplesIsLoading } = useGetDataSampleByTagTypeQuery(predictionFilter)

  useEffect(() => {
    if (!!flowLevelComplaintsAndNotesDataSamplesBetween2Dates) {
      const dataSamplesToProcess = flowLevelComplaintsAndNotesDataSamplesBetween2Dates?.rows
      const flowLevelDataSample = dataSamplesToProcess.filter((ds) => [...ds.labels].some((it) => it.type === 'LOINC' && it.code === '49033-4'))
      const complainsDataSample = dataSamplesToProcess.filter((ds) => [...ds.labels].some((it) => it.type === 'LOINC' && it.code === '75322-8'))
      const notesDataSample = dataSamplesToProcess.filter((ds) => [...ds.labels].some((it) => it.type === 'LOINC' && it.code === '34109-9'))
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

  const getShortNameOfTheMonth = (today: Date, direction: 'prev' | 'next') => {
    const monthData = direction === 'prev' ? new Date(today.getFullYear(), today.getMonth() - 1, 1) : new Date(today.getFullYear(), today.getMonth() + 1, 1)
    return monthNameFormatter('short').format(new Date(monthData)) + ',' + monthData.getFullYear()
  }

  const predictedPeriodDates = useMemo(() => {
    return undefined
    if (allFlowLevelDataSamples && !allFlowLevelDataSamplesIsLoading) {
      const lastThreeCycles = [...(getCyclesDates(allFlowLevelDataSamples, allFlowLevelDataSamplesIsLoading) ?? [])]?.reverse().slice(1, 4)

      if (lastThreeCycles.length !== 0) {
        const lastFlowLevelDataSampleDate = max(
          allFlowLevelDataSamples?.rows.filter((item) => (item?.content?.['en']?.measureValue?.value ?? 0) > 0).map((item) => getDayInDateFormat(item.valueDate ?? 0)),
        )
        const getCycleDuration = (currentCycleFirstDay: number, currentCycleLastDay: number) => {
          const duration = formatDistanceStrict(getDayInDateFormat(currentCycleFirstDay), getDayInDateFormat(currentCycleLastDay), { unit: 'day' }).split(' ')[0]
          return +duration
        }
        const totalDurationOfLastThreeCycles = lastThreeCycles.reduce((accamulator, item) => accamulator + getCycleDuration(item.startDate ?? 0, item.endDate), 0)
        const averageCycleDuration = lastThreeCycles.length !== 0 ? Math.floor(totalDurationOfLastThreeCycles / lastThreeCycles.length) : 28

        const firstDayOfThePredictedPeriod = add(lastFlowLevelDataSampleDate, { days: averageCycleDuration })
        // let's say the duration of the Predicted period is 7 days, which means that the users period can start at any of those days
        const lastDayOfThePredictedPeriod = add(firstDayOfThePredictedPeriod, { days: 7 })

        return { start: firstDayOfThePredictedPeriod, end: lastDayOfThePredictedPeriod }
      }
    }
    return undefined
  }, [allFlowLevelDataSamples, allFlowLevelDataSamplesIsLoading])
  const isTodayPredictedPeriodDay = (today?: Date) => {
    if (!!predictedPeriodDates && !!today) {
      return isWithinInterval(today, predictedPeriodDates)
    }
    return false
  }

  const DayOfTheMonth: React.FC<DayOfTheMonthProps> = ({ dayData, state, flowLevel, hasComplaint, isPredictedPeriod }) => {
    const { day, dateString } = dayData
    const isToday = (revievedDate: Date) => {
      const today = new Date()
      return today.getFullYear() === revievedDate.getFullYear() && today.getMonth() === revievedDate.getMonth() && today.getDate() === revievedDate.getDate()
    }
    const getExtraTextStyle = () => {
      if (!!flowLevel) {
        return dayOfTheMonthStyles.periodDayTitle
      } else if (state === 'disabled' || isAfter(new Date(dateString), new Date())) {
        return dayOfTheMonthStyles.disabledDayTitle
      }
    }
    const getExtraDayBgStyle = () => {
      if (!!flowLevel) {
        return dayOfTheMonthStyles.periodDayBg
      }
    }
    const getExtraDayStyle = () => {
      if (state === 'disabled' || isAfter(new Date(dateString), new Date())) {
        return dayOfTheMonthStyles.disabledDay
      } else if (isToday(new Date(dateString))) {
        return dayOfTheMonthStyles.isToday
      }
    }
    const getDropsComponent = (amount: number) => {
      return Array(amount)
        .fill(true)
        .map((_, i) => <Image key={i} style={dayOfTheMonthStyles.drop} source={require('../../assets/images/drop.png')} />)
    }

    const handlePress = () => {
      if (state !== 'disabled') {
        const title = `${monthNameFormatter('long').format(new Date(dateString))}, ${new Date(dateString).getDate()}`
        setSelectedDateTitle(title)
        setSelectedDate(new Date(dateString))
        setAddUserDataSampleModalVisible(true)
      }
    }

    return (
      <>
        <TouchableOpacity onPress={handlePress} style={[dayOfTheMonthStyles.day, getExtraDayStyle()]}>
          {isPredictedPeriod ? (
            <ImageBackground source={require('../../assets/images/striped-bg.png')} style={dayOfTheMonthStyles.predictedPeriodBg}>
              <Text style={dayOfTheMonthStyles.predictedPeriodDayTitle}>{day}</Text>
            </ImageBackground>
          ) : (
            <View style={[dayOfTheMonthStyles.dayBg, getExtraDayBgStyle()]}>
              <Text style={[dayOfTheMonthStyles.dayTitle, getExtraTextStyle()]}>{day}</Text>
            </View>
          )}
          <View style={dayOfTheMonthStyles.markersContainer}>
            {!!hasComplaint && !flowLevel && <Image style={dayOfTheMonthStyles.complaint} source={require('../../assets/images/triangle.png')} />}
            {!!flowLevel && getDropsComponent(flowLevel)}
          </View>
        </TouchableOpacity>
      </>
    )
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
        <AddUserDataSampleModal
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
        allFlowLevelDataSamplesIsLoading ||
        isCreateOrUpdateDataSamplesLoading ||
        (isDeleteDataSamplesLoading && <CustomActivityIndicator />)}
      <View style={styles.advancedCalendar}>
        <Calendar
          dayComponent={({ date, state }) => (
            <DayOfTheMonth
              dayData={date}
              state={state}
              flowLevel={getDataSamplesOnDate(dataSamples?.flowLevel, date ? new Date(date.dateString) : undefined)[0]?.content?.['en']?.measureValue?.value}
              hasComplaint={
                !!getDataSamplesOnDate(dataSamples?.complaints, date && new Date(date.dateString))?.length ||
                !!getDataSamplesOnDate(dataSamples?.notes, date && new Date(date.dateString))[0]?.content?.['en']?.stringValue
              }
              isPredictedPeriod={isTodayPredictedPeriodDay(date && new Date(date.dateString))}
            />
          )}
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

const dayOfTheMonthStyles = StyleSheet.create({
  day: {
    width: 43,
    height: 60,
    backgroundColor: 'rgba(214, 223, 248, 0.6)',
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 6,
  },
  dayBg: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayTitle: {
    width: 31,
    height: 31,
    fontSize: 14,
    fontFamily: 'Nunito-Bold',
    color: '#151B5D',
    paddingTop: '20%',
    textAlign: 'center',
  },
  disabledDayTitle: {
    color: 'rgba(21, 27, 93, 0.6)',
    fontFamily: 'Nunito-Regular',
  },
  isToday: {
    borderColor: '#6273D9',
    borderWidth: 2,
  },
  disabledDay: {
    backgroundColor: 'rgba(242, 243, 254, 0.6)',
  },
  periodDayTitle: {
    color: 'white',
  },
  periodDayBg: {
    backgroundColor: '#D06676',
    borderRadius: 50,
  },
  predictedPeriodDayTitle: {
    color: 'white',
    fontSize: 14,
    fontFamily: 'Nunito-Bold',
  },
  predictedPeriodBg: {
    width: 31,
    height: 31,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markersContainer: {
    flexDirection: 'row',
  },
  complaint: {
    width: 12,
    height: 12,
  },
  drop: {
    width: 8,
    height: 8,
  },
})
