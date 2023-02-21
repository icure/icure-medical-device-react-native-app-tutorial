import React from 'react';
import {ScrollView, StyleSheet, Image, View, Dimensions} from 'react-native';

import {Header} from '../components/Header';
import {useCurrentPatientQuery} from '../services/patientApi';

/* List Calendar is additional pop up for adding periods for previous months */
// import {ListCalendar} from '../components/ListCalendar';

const WIDTH_MODAL = Dimensions.get('window').width;
const HEIGHT_MODAL = Dimensions.get('window').height;

export const Home = () => {
  const {data: patient} = useCurrentPatientQuery();
  console.log('Home screen');

  return (
    <ScrollView contentContainerStyle={styles.homeScreen}>
      <View style={styles.contentTopBlock}>
        <Header userName={patient ? `${patient.firstName} ${patient.lastName}` : 'User'} />
        <Image style={styles.logo} source={require('../assets/images/logo-with-pod.png')} />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  homeScreen: {
    flex: 1,
    minHeight: HEIGHT_MODAL,
    width: WIDTH_MODAL,
    backgroundColor: '#FFFDFE',
  },
  contentTopBlock: {
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  logo: {
    width: 100,
    height: 100,
    marginTop: 16,
  },
  infoIcnContainer: {
    width: '100%',
    alignItems: 'flex-end',
  },
  infoIcn: {
    width: 24,
    height: 24,
  },
});
