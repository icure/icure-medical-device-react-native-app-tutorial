import React, {useState} from 'react';
import {StyleSheet, View, Dimensions} from 'react-native';
import DatePicker from 'react-native-modern-datepicker';
import {format} from 'date-fns';

import {globalStyles} from '../../../styles/GlobalStyles';
import {SquareButton} from '../index';

const WIDTH_MODAL = Dimensions.get('window').width;
const HEIGHT_MODAL = Dimensions.get('window').height;

type DatePickerModalProps = {
  onClose: () => void;
  onSave: (date: number) => void;
  patientBirthDay: number;
};

export const DatePickerModal: React.FC<DatePickerModalProps> = ({onClose, patientBirthDay, onSave}) => {
  const [date, setDate] = useState(patientBirthDay ?? +format(new Date(), 'yyyyMMdd'));

  const onDateChange = (selectedDate: number) => {
    setDate(selectedDate);
  };

  const handleCancel = () => {
    onClose();
  };

  const handleSave = () => {
    onSave(date);
    onClose();
  };

  const getDateFormat = (value: number) => {
    if (!value) {
      return undefined;
    }
    const year = Math.floor(value / 10000);
    const month = Math.floor(value / 100) % 100;
    const day = value % 100;

    return `${year}/${month}/${day}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.popup}>
        <View style={styles.scrollableContainer}>
          <DatePicker
            onSelectedChange={(newData: string) => {
              onDateChange(+newData.replace(/[/]/g, ''));
            }}
            selected={getDateFormat(date)}
            mode="calendar"
            current={getDateFormat(date)}
            options={{
              mainColor: '#D06676',
              defaultFont: 'Nunito-Regular',
              headerFont: 'Nunito-Regular',
            }}
          />

          {/* ButtonsGroup */}
          <View style={[globalStyles.mt24, styles.buttonsGroup]}>
            <View style={globalStyles.mr16}>
              <SquareButton title="Close" onClick={handleCancel} outlined />
            </View>
            <SquareButton title="Save" onClick={handleSave} />
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: WIDTH_MODAL,
    height: HEIGHT_MODAL,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    justifyContent: 'flex-end',
  },
  popup: {
    width: '100%',
    height: 'auto',
    backgroundColor: '#FFFDFE',
    borderTopRightRadius: 15,
    borderTopLeftRadius: 15,
    paddingVertical: 32,
  },
  scrollableContainer: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    alignItems: 'center',
  },
  buttonsGroup: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
