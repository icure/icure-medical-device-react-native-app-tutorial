import {format, parse, formatDistanceStrict} from 'date-fns';
import {DataSample} from '@icure/medical-device-sdk';

export const getDayInDateFormat = (date: number) => parse(`${date}`, 'yyyyMMdd000000', new Date());
export const getDayInNumberFormat = (date: Date) => +format(date, 'yyyyMMdd') * 1000000;
export const getPreviousDay = (date: Date) => {
  const yesterday = new Date(date);
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday;
};
export const getNextDay = (date: Date) => {
  const yesterday = new Date(date);
  yesterday.setDate(yesterday.getDate() + 1);
  return yesterday;
};

export const getCyclesDates = (flowLevelDataSamples: {rows: DataSample[]}, flowLevelDataSamplesIsLoading: boolean) => {
  if (flowLevelDataSamples && !flowLevelDataSamplesIsLoading) {
    const flowLevelsValueDatesSorted = flowLevelDataSamples.rows
      .filter(item => item?.content?.en?.measureValue?.value > 0)
      .map(item => item.valueDate)
      .sort((a, b) => a - b);
    const periodsStartDays = flowLevelsValueDatesSorted.filter((item, index) => {
      if (index === 0) {
        return true;
      }
      // 5 = 5 days, so if the user forgot to add flowLevelsData of period, it will not be taken into account
      const daysDistance = formatDistanceStrict(getDayInDateFormat(item), getDayInDateFormat(flowLevelsValueDatesSorted[index - 1]), {unit: 'day'}).split(' ');
      return +daysDistance[0] > 5;
    });
    const cycles = periodsStartDays.map((item, index) => {
      if (index === periodsStartDays.length - 1) {
        return {
          startDate: item,
          endDate: getDayInNumberFormat(new Date()),
        };
      }
      const nextPeriodStartDay = getDayInDateFormat(periodsStartDays[index + 1]);
      const currentPeriodEndDate = getPreviousDay(nextPeriodStartDay);

      return {
        startDate: item,
        endDate: getDayInNumberFormat(currentPeriodEndDate),
      };
    });
    return cycles;
  }
  return undefined;
};
