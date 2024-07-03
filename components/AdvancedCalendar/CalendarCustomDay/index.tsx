import React from 'react'
import { isAfter } from 'date-fns'
import { Image, ImageBackground, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { monthNameFormatter } from '../../../utils/helpers'
import { DateData } from 'react-native-calendars'

type CalendarCustomDayProps = {
  dayData: DateData
  state?: string
  flowLevel?: number
  hasComplaint?: boolean
  isPredictedPeriod?: boolean
  setSelectedDateTitle: (title: string) => void
  setSelectedDate: (date: Date) => void
  setAddUserDataSampleModalVisible: (state: boolean) => void
}
export const CalendarCustomDay: React.FC<CalendarCustomDayProps> = ({
  dayData,
  state,
  flowLevel,
  hasComplaint,
  isPredictedPeriod,
  setSelectedDateTitle,
  setSelectedDate,
  setAddUserDataSampleModalVisible,
}) => {
  const { day, dateString } = dayData
  const isToday = (reviewedDate: Date) => {
    const today = new Date()
    return today.getFullYear() === reviewedDate.getFullYear() && today.getMonth() === reviewedDate.getMonth() && today.getDate() === reviewedDate.getDate()
  }
  const getExtraTextStyle = () => {
    if (!!flowLevel) {
      return styles.periodDayTitle
    } else if (state === 'disabled' || isAfter(new Date(dateString), new Date())) {
      return styles.disabledDayTitle
    }
  }
  const getExtraDayBgStyle = () => {
    if (!!flowLevel) {
      return styles.periodDayBg
    }
  }
  const getExtraDayStyle = () => {
    if (state === 'disabled' || isAfter(new Date(dateString), new Date())) {
      return styles.disabledDay
    } else if (isToday(new Date(dateString))) {
      return styles.isToday
    }
  }
  const getDropsComponent = (amount: number) => {
    return Array(amount)
      .fill(true)
      .map((_, i) => <Image key={i} style={styles.drop} source={require('../../../assets/images/drop.png')} />)
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
      <TouchableOpacity onPress={handlePress} style={[styles.day, getExtraDayStyle()]}>
        {isPredictedPeriod ? (
          <ImageBackground source={require('../../../assets/images/striped-bg.png')} style={styles.predictedPeriodBg}>
            <Text style={styles.predictedPeriodDayTitle}>{day}</Text>
          </ImageBackground>
        ) : (
          <View style={[styles.dayBg, getExtraDayBgStyle()]}>
            <Text style={[styles.dayTitle, getExtraTextStyle()]}>{day}</Text>
          </View>
        )}
        <View style={styles.markersContainer}>
          {!!hasComplaint && !flowLevel && <Image style={styles.complaint} source={require('../../../assets/images/triangle.png')} />}
          {!!flowLevel && getDropsComponent(flowLevel)}
        </View>
      </TouchableOpacity>
    </>
  )
}

const styles = StyleSheet.create({
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
