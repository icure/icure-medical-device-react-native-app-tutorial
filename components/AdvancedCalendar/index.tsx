import React, {useEffect, useState, useMemo} from 'react';
import {Image, ImageBackground, Modal, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator} from 'react-native';
import {Calendar} from 'react-native-calendars';
import {format, lastDayOfMonth, formatDistanceStrict, add, max, isWithinInterval, isAfter} from 'date-fns';

import {AddUserDataSampleModal} from '../AddUserDataSampleModal';
import {useGetDataSampleBetween2DatesQuery, useGetDataSampleByTagTypeQuery} from '../../services/dataSampleApi';
import {getCyclesDates, getDayInDateFormat, getNextDay, getDayInNumberFormat} from '../../utils/helpers';

type DayOfTheMonthProps = {
  dayData: any;
  state: string;
  flowLevel?: number;
  hasComplaint?: boolean;
  isPredictedPeriod?: boolean;
};

export const AdvancedCalendar: React.FC = () => {
  const [addUserDataSampleModalVisible, setAddUserDataSampleModalVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedDateTitle, setSelectedDateTitle] = useState('');

  const monthNameFormatter = (dataFormat: 'short' | 'long') => new Intl.DateTimeFormat('en', {month: dataFormat});

  const DayOfTheMonth: React.FC<DayOfTheMonthProps> = ({dayData, state, flowLevel, hasComplaint, isPredictedPeriod}) => {
    const {day, dateString} = dayData;

    const isToday = (revievedDate: Date) => {
      const today = new Date();
      if (today.getFullYear() === revievedDate.getFullYear() && today.getMonth() === revievedDate.getMonth() && today.getDate() === revievedDate.getDate()) {
        return true;
      }
      return false;
    };

    const getTextsStyle = () => {
      switch (true) {
        case !!flowLevel:
          return dayOfTheMonthStyles.periodDaysTitle;
        case state === 'disabled' || isAfter(new Date(dateString), new Date()):
          return dayOfTheMonthStyles.disabledDaysTitle;
        default:
          break;
      }
    };

    const getDaysStyle = () => {
      switch (true) {
        case state === 'disabled' || isAfter(new Date(dateString), new Date()):
          return dayOfTheMonthStyles.disabledDay;
        case isToday(new Date(dateString)):
          return dayOfTheMonthStyles.isToday;
        default:
          break;
      }
    };

    const getDropsComponent = (amount: number) => {
      return Array(amount)
        .fill(true)
        .map((_, i) => <Image key={i} style={dayOfTheMonthStyles.drop} source={require('../../assets/images/drop.png')} />);
    };

    const handlePress = () => {
      if (state !== 'disabled') {
        const title = `${monthNameFormatter('long').format(new Date(dateString))}, ${new Date(dateString).getDate()}`;
        setSelectedDateTitle(title);
        setSelectedDate(new Date(dateString));
        setAddUserDataSampleModalVisible(true);
      }
    };

    return (
      <>
        <TouchableOpacity onPress={handlePress} style={[dayOfTheMonthStyles.day, getDaysStyle()]}>
          {isPredictedPeriod ? (
            <ImageBackground source={require('../../assets/images/striped-bg.png')} style={dayOfTheMonthStyles.predictedPeriodBg}>
              <Text style={dayOfTheMonthStyles.predictedPeriodDaysTitle}>{day}</Text>
            </ImageBackground>
          ) : (
            <Text style={[dayOfTheMonthStyles.daysTitle, getTextsStyle()]}>{day}</Text>
          )}
          <View style={dayOfTheMonthStyles.merkersContainer}>
            {!!hasComplaint && !flowLevel && <Image style={dayOfTheMonthStyles.complaint} source={require('../../assets/images/triangle.png')} />}
            {!!flowLevel && getDropsComponent(flowLevel)}
          </View>
        </TouchableOpacity>
      </>
    );
  };

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [currentMonthFirstDate, setCurrentMonthFirstDate] = useState<number>();
  const [nextMonthFirstDate, setNextMonthFirstDate] = useState<number>();

  useEffect(() => {
    setCurrentMonthFirstDate(+format(currentMonth, 'yyyyMM01') * 1000000);
    setNextMonthFirstDate(+format(getNextDay(lastDayOfMonth(currentMonth)), 'yyyyMMdd') * 1000000);
  }, [currentMonth]);

  const {data: flowLevelDataSampleBetween2Dates, isLoading: flowLevelDataSampleBetween2DatesIsLoading} = useGetDataSampleBetween2DatesQuery({
    tagType: 'LOINC',
    tagCode: '49033-4',
    startDate: currentMonthFirstDate,
    endDate: nextMonthFirstDate,
  });

  const {data: complaintDataSampleBetween2Dates, isLoading: complaintDataSampleBetween2DatesIsLoading} = useGetDataSampleBetween2DatesQuery({
    tagType: 'LOINC',
    tagCode: '75322-8',
    startDate: currentMonthFirstDate,
    endDate: nextMonthFirstDate,
  });

  const {data: noteDataSampleBetween2Dates, isLoading: noteDataSampleBetween2DatesIsLoading} = useGetDataSampleBetween2DatesQuery({
    tagType: 'LOINC',
    tagCode: '34109-9',
    startDate: currentMonthFirstDate,
    endDate: nextMonthFirstDate,
  });

  const {data: allFlowLevelDataSamples, isLoading: allFlowLevelDataSamplesIsLoading} = useGetDataSampleByTagTypeQuery({
    tagType: 'LOINC',
    tagCode: '49033-4',
  });

  const getShortNameOfTheMonth = (today: Date, direction: 'prev' | 'next') => {
    const monthData = direction === 'prev' ? new Date(today.getFullYear(), today.getMonth() - 1, 1) : new Date(today.getFullYear(), today.getMonth() + 1, 1);
    return monthNameFormatter('short').format(new Date(monthData)) + ',' + monthData.getFullYear();
  };

  const getTodayFlowLevelData = (currentDay: Date) => {
    if (!flowLevelDataSampleBetween2DatesIsLoading) {
      return flowLevelDataSampleBetween2Dates?.rows.find(item => item.valueDate === getDayInNumberFormat(currentDay));
    }
  };

  const getTodayComplaintDatas = (currentDay: Date) => {
    if (!complaintDataSampleBetween2DatesIsLoading) {
      return complaintDataSampleBetween2Dates?.rows.filter(item => item.valueDate === getDayInNumberFormat(currentDay));
    }
  };

  const getTodayNotesData = (currentDay: Date) => {
    if (!noteDataSampleBetween2DatesIsLoading) {
      return noteDataSampleBetween2Dates?.rows.find(item => item.valueDate === getDayInNumberFormat(currentDay));
    }
  };

  const predictedPeriodDates = useMemo(() => {
    if (allFlowLevelDataSamples && !allFlowLevelDataSamplesIsLoading) {
      const lastThreeCycles = [...getCyclesDates(allFlowLevelDataSamples, allFlowLevelDataSamplesIsLoading)]?.reverse().slice(1, 4);

      if (lastThreeCycles.length !== 0) {
        const lastFlowLevelDataSampleDate = max(
          allFlowLevelDataSamples?.rows.filter(item => item?.content?.en?.measureValue?.value > 0).map(item => getDayInDateFormat(item.valueDate)),
        );
        const getCycleDuration = (currentCycleFirstDay: number, currentCycleLastDay: number) => {
          const duration = formatDistanceStrict(getDayInDateFormat(currentCycleFirstDay), getDayInDateFormat(currentCycleLastDay), {unit: 'day'}).split(' ')[0];
          return +duration;
        };
        const totalDurationOfLastThreeCycles = lastThreeCycles.reduce((accamulator, item) => accamulator + getCycleDuration(item.startDate, item.endDate), 0);
        const averageCycleDuration = lastThreeCycles.length !== 0 ? Math.floor(totalDurationOfLastThreeCycles / lastThreeCycles.length) : 28;

        const firstDayOfThePredictedPeriod = add(lastFlowLevelDataSampleDate, {days: averageCycleDuration});
        // let's say the duration of the Predicted period is 7 days, which means that the users period can start at any of those days
        const lastDayOfThePredictedPeriod = add(firstDayOfThePredictedPeriod, {days: 7});

        return {start: firstDayOfThePredictedPeriod, end: lastDayOfThePredictedPeriod};
      }
    }
    return undefined;
  }, [allFlowLevelDataSamples, allFlowLevelDataSamplesIsLoading]);

  const isTodayPredictedPeriodDay = (today: Date) => {
    if (predictedPeriodDates !== undefined) {
      return isWithinInterval(today, predictedPeriodDates);
    }
    return false;
  };

  return (
    <>
      <Modal
        animationType="slide"
        transparent={true}
        visible={addUserDataSampleModalVisible}
        onRequestClose={() => {
          setAddUserDataSampleModalVisible(!addUserDataSampleModalVisible);
        }}>
        <AddUserDataSampleModal
          date={selectedDate}
          title={selectedDateTitle}
          onClose={() => setAddUserDataSampleModalVisible(!addUserDataSampleModalVisible)}
          onSave={() => setAddUserDataSampleModalVisible(!addUserDataSampleModalVisible)}
          onDelete={() => setAddUserDataSampleModalVisible(!addUserDataSampleModalVisible)}
          currentFlowLevelData={getTodayFlowLevelData}
          currentComplaintsDatas={getTodayComplaintDatas}
          currentNotesData={getTodayNotesData}
        />
      </Modal>
      {flowLevelDataSampleBetween2DatesIsLoading || complaintDataSampleBetween2DatesIsLoading || noteDataSampleBetween2DatesIsLoading ? (
        <View style={styles.activityIndicator}>
          <ActivityIndicator color="#151B5D" />
        </View>
      ) : (
        <View style={styles.advancedCalendar}>
          <Calendar
            dayComponent={({date, state}) => (
              <DayOfTheMonth
                dayData={date}
                state={state}
                flowLevel={getTodayFlowLevelData(new Date(date.dateString))?.content.en.measureValue.value}
                hasComplaint={!!getTodayComplaintDatas(new Date(date.dateString))?.length || !!getTodayNotesData(new Date(date.dateString))?.content.en.stringValue}
                isPredictedPeriod={isTodayPredictedPeriodDay(new Date(date.dateString))}
              />
            )}
            renderArrow={direction => {
              return (
                <>
                  {direction === 'left' ? (
                    <View style={styles.inactiveMonthContainer}>
                      <Image style={[styles.arrrow, styles.arrrowLeft]} source={require('../../assets/images/arrows.png')} />
                      <Text style={styles.inactiveMonth}>{getShortNameOfTheMonth(currentMonth, 'prev')}</Text>
                    </View>
                  ) : (
                    <View style={styles.inactiveMonthContainer}>
                      <Text style={styles.inactiveMonth}>{getShortNameOfTheMonth(currentMonth, 'next')}</Text>
                      <Image style={[styles.arrrow, styles.arrrowRight, {transform: [{rotateY: '3.142rad'}]}]} source={require('../../assets/images/arrows.png')} />
                    </View>
                  )}
                </>
              );
            }}
            onMonthChange={date => {
              const {dateString} = date;
              setCurrentMonth(new Date(dateString));
            }}
            allowSelectionOutOfRange={false}
            hideExtraDays={true}
            maxDate={new Date().toISOString().slice(0, 10)}
            theme={{
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
            }}
          />
        </View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  activityIndicator: {
    width: '100%',
    height: 430,
    alignItems: 'center',
    justifyContent: 'center',
  },
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
  arrrow: {
    width: 14,
    height: 14,
  },
  arrrowLeft: {
    marginRight: 4,
  },
  arrrowRight: {
    marginLeft: 4,
  },
});

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
  daysTitle: {
    width: 31,
    height: 31,
    fontSize: 14,
    fontFamily: 'Nunito-Bold',
    color: '#151B5D',
    paddingTop: '20%',
    textAlign: 'center',
    borderRadius: 50,
  },
  disabledDaysTitle: {
    color: '#background: rgba(21, 27, 93, 0.6)',
  },
  isToday: {
    borderColor: '#6273D9',
    borderWidth: 2,
  },
  disabledDay: {
    backgroundColor: 'rgba(242, 243, 254, 0.55)',
  },
  periodDaysTitle: {
    backgroundColor: '#D06676',
    color: 'white',
  },
  predictedPeriodDaysTitle: {
    color: 'white',
    fontSize: 14,
    fontFamily: 'Nunito',
  },
  predictedPeriodBg: {
    width: 31,
    height: 31,
    alignItems: 'center',
    justifyContent: 'center',
  },
  merkersContainer: {
    flexDirection: 'row',
  },
  complaint: {
    width: 12,
    height: 12,
  },
  drop: {width: 8, height: 8},
});
