import React, {useState} from 'react';
import {StyleSheet, View, Dimensions} from 'react-native';
import DatePicker from '@react-native-community/datetimepicker';

import {globalStyles} from '../../../styles/GlobalStyles';
import {SquareButton} from '../index';

const WIDTH_MODAL = Dimensions.get('window').width;
const HEIGHT_MODAL = Dimensions.get('window').height;

type DatePickerModalProps = {
  onClose: () => void;
  onSave: (date: Date) => void;
  patientBirthDay: Date;
};

export const DatePickerModal: React.FC<DatePickerModalProps> = ({onClose, patientBirthDay, onSave}) => {
  const [date, setDate] = useState(patientBirthDay ?? new Date());

  const onDateChange = (_, selectedDate: Date) => {
    setDate(selectedDate);
  };

  const handleCancel = () => {
    onClose();
  };

  const handleSave = () => {
    onSave(date);
    onClose();
  };

  return (
    <View style={styles.container}>
      <View style={styles.popup}>
        <View style={styles.scrollableContainer}>
          <DatePicker value={date} mode="date" display="spinner" onChange={onDateChange} />

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
  },
  popup: {
    width: '100%',
    marginTop: HEIGHT_MODAL * 0.6,
    height: HEIGHT_MODAL,
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
