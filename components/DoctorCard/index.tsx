import React, {useState} from 'react';
import {StyleSheet, View, Text, Image, Modal, Dimensions} from 'react-native';

import {globalStyles} from '../../styles/GlobalStyles';
import {IconButton} from '../FormElements';
import {SquareButton} from '../FormElements';
import {useGetHealthcareProfessionalQuery} from '../../services/healthcareProfessionalApi';
import {useShareDataWithMutation, useStopSharingWithMutation} from '../../services/userApi';

type DoctorCardAddProps = {
  name: string;
  id: string;
};

type DoctorCardRemoveProps = {
  id: string;
};

type ConfirmationWindowProps = {
  title: string;
  description: string;
  onPositiveButtonClick: () => void;
  onNegativeButtonClick: () => void;
};

const WIDTH_MODAL = Dimensions.get('window').width;
const HEIGHT_MODAL = Dimensions.get('window').height;

const ConfirmationWindow: React.FC<ConfirmationWindowProps> = ({title, description, onPositiveButtonClick, onNegativeButtonClick}) => {
  return (
    <View style={confirmationWindowStyles.container}>
      <View style={confirmationWindowStyles.popup}>
        <Text style={confirmationWindowStyles.title}>{title}</Text>
        <Text style={confirmationWindowStyles.subtitle}>{description}</Text>
        <View style={confirmationWindowStyles.buttonsGroup}>
          <View style={confirmationWindowStyles.leftButton}>
            <SquareButton title="Confirm" onClick={onPositiveButtonClick} />
          </View>
          <SquareButton title="Cancel" onClick={onNegativeButtonClick} outlined={true} />
        </View>
      </View>
    </View>
  );
};

export const DoctorCardAdd: React.FC<DoctorCardAddProps> = ({name, id}) => {
  const [showConfirmationWindow, setShowConfirmationWindow] = useState(false);
  const [shareDataWithDoctor] = useShareDataWithMutation();
  const handleAdd = () => {
    shareDataWithDoctor({ids: [id]});
    setShowConfirmationWindow(false);
  };
  return (
    <>
      <View style={styles.doctorCard}>
        <View style={styles.doctorsTitle}>
          <View style={styles.doctorIcnContainer}>
            <Image style={styles.doctorIcn} source={require('../../assets/images/stethoscope.png')} />
          </View>
          <Text style={globalStyles.baseText}>{name}</Text>
        </View>
        <View style={styles.doctorsAction}>
          <IconButton icon="plus" onClick={() => setShowConfirmationWindow(true)} />
        </View>
      </View>
      <Modal
        animationType="slide"
        transparent={true}
        visible={showConfirmationWindow}
        onRequestClose={() => {
          setShowConfirmationWindow(!showConfirmationWindow);
        }}>
        <ConfirmationWindow
          title="Add doctor"
          description="Are you sure you want to start sharing your Medical Data with this doctor?"
          onPositiveButtonClick={handleAdd}
          onNegativeButtonClick={() => setShowConfirmationWindow(false)}
        />
      </Modal>
    </>
  );
};

export const DoctorCardRemove: React.FC<DoctorCardRemoveProps> = ({id}) => {
  const [showConfirmationWindow, setShowConfirmationWindow] = useState(false);
  const {data: hcp} = useGetHealthcareProfessionalQuery(id, {skip: !id});

  const [stopSharingDataWithDoctor] = useStopSharingWithMutation();

  const handleRevome = () => {
    stopSharingDataWithDoctor({ids: [id]});
    setShowConfirmationWindow(false);
  };

  return (
    <>
      <View style={styles.doctorCard}>
        <View style={styles.doctorsTitle}>
          <View style={styles.doctorIcnContainer}>
            <Image style={styles.doctorIcn} source={require('../../assets/images/stethoscope.png')} />
          </View>
          <Text style={globalStyles.baseText}>{hcp?.lastName + ' ' + hcp?.firstName}</Text>
        </View>
        <View style={styles.doctorsAction}>
          <IconButton
            icon="close"
            onClick={() => {
              setShowConfirmationWindow(true);
            }}
            fulfilled
          />
        </View>
      </View>
      <Modal
        animationType="slide"
        transparent={true}
        visible={showConfirmationWindow}
        onRequestClose={() => {
          setShowConfirmationWindow(!showConfirmationWindow);
        }}>
        <ConfirmationWindow
          title="Remove doctor"
          description="Are you sure you want to stop sharing your Medical Data with this doctor?"
          onPositiveButtonClick={handleRevome}
          onNegativeButtonClick={() => setShowConfirmationWindow(false)}
        />
      </Modal>
    </>
  );
};

const confirmationWindowStyles = StyleSheet.create({
  container: {
    width: WIDTH_MODAL,
    height: HEIGHT_MODAL,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  popup: {
    width: '95%',
    paddingVertical: 40,
    paddingHorizontal: 24,
    backgroundColor: '#FFFDFE',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    textAlign: 'center',
    color: '#151B5D',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    fontFamily: 'Nunito',
  },
  subtitle: {
    textAlign: 'center',
    color: '#151B5D',
    fontSize: 14,
    fontFamily: 'Nunito',
  },
  buttonsGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 32,
  },
  leftButton: {
    marginRight: 24,
  },
});
const styles = StyleSheet.create({
  doctorCard: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F2F3FE',
    borderRadius: 7,
    padding: 4,
    paddingRight: 8,
    marginBottom: 8,
  },
  doctorsTitle: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  doctorIcnContainer: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  doctorIcn: {
    width: 20,
    height: 20,
  },
  doctorsAction: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
