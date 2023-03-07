import React from 'react';
import {ScrollView, StyleSheet, View, Dimensions, Text, Image, TouchableOpacity} from 'react-native';

import {globalStyles} from '../../styles/GlobalStyles';
import {SquareButton} from '../FormElements';

const WIDTH_MODAL = Dimensions.get('window').width;
const HEIGHT_MODAL = Dimensions.get('window').height;

type SymbolsExplanationModalProps = {
  onClose: () => void;
};

export const SymbolsExplanationModal: React.FC<SymbolsExplanationModalProps> = ({onClose}) => {
  const handleCancel = () => {
    onClose();
  };

  return (
    <View style={styles.container}>
      <View style={styles.popup}>
        {/* Header */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Symbols</Text>
          <TouchableOpacity onPress={handleCancel} style={styles.closeIcnContainer}>
            <Image style={styles.closeIcn} source={require('../../assets/images/close.png')} />
          </TouchableOpacity>
        </View>
        {/* Content */}
        <ScrollView contentContainerStyle={styles.scrollableContainer}>
          <View style={styles.symbolsContainer}>
            <View style={styles.symbolsItem}>
              <View style={styles.symbolsIcnContainer}>
                <Image style={styles.symbolsIcn} source={require('../../assets/images/circle.png')} />
              </View>
              <Text style={globalStyles.baseText}>Period day</Text>
            </View>
            <View style={styles.symbolsItem}>
              <View style={styles.symbolsIcnContainer}>
                <Image style={styles.symbolsIcn} source={require('../../assets/images/drop.png')} />
              </View>
              <Text style={globalStyles.baseText}>Flow level</Text>
            </View>
            <View style={styles.symbolsItem}>
              <View style={styles.symbolsIcnContainer}>
                <Image style={styles.symbolsIcn} source={require('../../assets/images/striped-bg.png')} />
              </View>
              <Text style={globalStyles.baseText}>Predicted period day</Text>
            </View>
            <View style={styles.symbolsItem}>
              <View style={styles.symbolsIcnContainer}>
                <Image style={styles.symbolsIcn} source={require('../../assets/images/triangle.png')} />
              </View>
              <Text style={globalStyles.baseText}>Complients and notes</Text>
            </View>
          </View>
          {/* ButtonsGroup */}
          <View style={[globalStyles.mt24, styles.buttonsGroup]}>
            <SquareButton title="Close" onClick={handleCancel} outlined />
          </View>
        </ScrollView>
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
    marginTop: HEIGHT_MODAL * 0.05,
    height: HEIGHT_MODAL,
    backgroundColor: '#FFFDFE',
    borderTopRightRadius: 15,
    borderTopLeftRadius: 15,
    paddingVertical: 32,
  },
  scrollableContainer: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingLeft: 16,
    paddingRight: 8,
  },
  title: {
    fontSize: 20,
    color: '#151B5D',
    fontFamily: 'Nunito-Medium',
  },
  closeIcnContainer: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcn: {
    width: 16,
    height: 16,
  },
  buttonsGroup: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  symbolsContainer: {
    marginTop: 24,
  },
  symbolsItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  symbolsIcnContainer: {
    width: 15,
    height: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  symbolsIcn: {
    width: 15,
    height: 15,
  },
});
