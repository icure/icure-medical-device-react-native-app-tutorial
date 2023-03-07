import React, {useState} from 'react';
import {View, Text, Pressable, StyleSheet, Image} from 'react-native';

type dataItem = {
  value: string;
  flowLevel: number;
};

export type RadioButtonProps = {
  data: dataItem[];
  initialData: dataItem;
  onSelect: (selectedItem: dataItem) => void;
};

export const RadioButton: React.FC<RadioButtonProps> = ({data, initialData, onSelect}) => {
  const [userOption, setUserOption] = useState(initialData);
  const selectHandler = (value: dataItem) => {
    onSelect(value);
    setUserOption(value);
  };
  const getDropsComponent = (amount: number) => {
    return Array(amount)
      .fill(true)
      .map((_, i) => <Image key={i} style={styles.drop} source={require('../../../assets/images/drop.png')} />);
  };
  return (
    <View>
      {data.map((item, index) => {
        return (
          <Pressable key={index} style={styles.container} onPress={() => selectHandler(item)}>
            <View style={[styles.unselected, item.value === userOption.value && styles.selected]}>{item.value === userOption.value && <View style={styles.selectedCircle} />}</View>
            <Text style={styles.option}> {item.value}</Text>
            <View style={styles.merkersContainer}>{item.flowLevel > 0 && getDropsComponent(item.flowLevel)}</View>
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
  option: {
    fontSize: 12,
    fontFamily: 'Nunito-Regular',
    color: '#151B5D',
    marginLeft: 8,
    marginRight: 4,
  },
  unselected: {
    width: 15,
    height: 15,
    borderWidth: 1,
    borderRadius: 50,
    borderColor: '#A2A4BE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selected: {
    borderColor: '#D06676',
  },
  selectedCircle: {
    width: 9,
    height: 9,
    borderRadius: 50,
    backgroundColor: '#D06676',
  },
  merkersContainer: {
    flexDirection: 'row',
  },
  drop: {width: 8, height: 8},
});
