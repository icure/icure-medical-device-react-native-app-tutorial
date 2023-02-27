import React from 'react';
import {View, Text, Pressable, StyleSheet, Image} from 'react-native';

type dataItem = {
  label: string;
  isChecked: boolean;
  SNOMED_CT_CODE: string;
};

export type CheckBoxProps = {
  onPress: (value: dataItem[]) => void;
  data: dataItem[];
};

export const CheckBox: React.FC<CheckBoxProps> = ({onPress, data}) => {
  const toggleCheckbox = (index: number) => {
    const checkboxData = [...data];
    checkboxData[index].isChecked = !checkboxData[index].isChecked;
    onPress(checkboxData);
  };

  return (
    <View>
      {data.map((item, index) => {
        const {isChecked, label} = item;
        return (
          <Pressable key={index} onPress={() => toggleCheckbox(index)} style={styles.container}>
            <View style={[styles.checkBox, isChecked && styles.checked]}>
              {isChecked && <Image style={styles.checkIcn} source={require('../../../assets/images/check.png')} />}
            </View>
            <Text style={styles.label}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  label: {
    fontSize: 12,
    color: '#151B5D',
    marginLeft: 8,
    fontFamily: 'Nunito-Regular',
  },
  checkBox: {
    width: 15,
    height: 15,
    borderWidth: 1,
    borderRadius: 2,
    borderColor: '#A2A4BE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checked: {
    borderColor: '#D06676',
    backgroundColor: '#D06676',
  },

  checkIcn: {
    width: 10,
    height: 7,
  },
});
