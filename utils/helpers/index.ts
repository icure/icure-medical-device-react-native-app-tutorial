import { format, parse, formatDistanceStrict } from 'date-fns'
import { IDataSample } from '@icure/medical-device-sdk'

export const getDayInDateFormat = (date: number) => parse(`${date}`, 'yyyyMMdd000000', new Date())
export const getDayInNumberFormat = (date: Date) => +format(date, 'yyyyMMdd') * 1000000
export const getPreviousDay = (date: Date) => {
  const yesterday = new Date(date)
  yesterday.setDate(yesterday.getDate() - 1)
  return yesterday
}
export const getNextDay = (date: Date) => {
  const yesterday = new Date(date)
  yesterday.setDate(yesterday.getDate() + 1)
  return yesterday
}
export const getCyclesDates = (periodDataSamples: { rows: IDataSample[] } | undefined) => {
  if (periodDataSamples?.rows.length) {
    const sortedPeriodData = periodDataSamples.rows
      .filter((item) => item?.content?.['en']?.measureValue?.value ?? 0 > 0)
      .map((item) => item.valueDate)
      .sort((a, b) => (a ?? 0) - (b ?? 0))
    const periodStartingDays = sortedPeriodData.filter((item, index) => {
      if (index === 0) {
        return true
      }
      // 5 = 5 days, so if the user forgot to add flowLevelsData of period, it will not be taken into account
      const daysDistance = formatDistanceStrict(getDayInDateFormat(item ?? 0), getDayInDateFormat(sortedPeriodData[index - 1] ?? 0), { unit: 'day' }).split(' ')
      return +daysDistance[0] > 5
    })
    const cycles = periodStartingDays.map((item, index) => {
      if (index === periodStartingDays.length - 1) {
        return {
          startDate: item ?? 0,
          endDate: getDayInNumberFormat(new Date()),
        }
      }
      const nextPeriodStartDay = getDayInDateFormat(periodStartingDays[index + 1] ?? 0)
      const currentPeriodEndDay = getPreviousDay(nextPeriodStartDay)

      return {
        startDate: item ?? 0,
        endDate: getDayInNumberFormat(currentPeriodEndDay),
      }
    })
    return cycles
  }
  return []
}

export const monthNameFormatter = (dataFormat: 'short' | 'long') => new Intl.DateTimeFormat('en', { month: dataFormat })
export const getShortNameOfTheMonth = (today: Date, direction: 'prev' | 'next') => {
  const monthData = direction === 'prev' ? new Date(today.getFullYear(), today.getMonth() - 1, 1) : new Date(today.getFullYear(), today.getMonth() + 1, 1)
  return monthNameFormatter('short').format(new Date(monthData)) + ',' + monthData.getFullYear()
}
