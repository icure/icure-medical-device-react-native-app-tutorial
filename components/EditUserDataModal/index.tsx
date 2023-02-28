import React, {useEffect, useState} from 'react';
import {ScrollView, StyleSheet, View, Dimensions, Text, Image, TouchableOpacity, Modal, ActivityIndicator} from 'react-native';
import {Patient, Address, Telecom} from '@icure/medical-device-sdk';
import {useForm, Controller} from 'react-hook-form';
import {format, parse} from 'date-fns';
import {useNavigate} from 'react-router-native';

import {globalStyles} from '../../styles/GlobalStyles';
import {SquareInput, SquareButton, ErrorMessage, DatePickerModal, FakeSquareInput, SearchSquareInput} from '../FormElements';
import {useCreateOrUpdatePatientMutation, useCurrentPatientQuery} from '../../services/patientApi';
import {useAppSelector, useAppDispatch} from '../../redux/hooks';
import {logout} from '../../services/api';
import {useFilterHealthcareProfessionalsQuery} from '../../services/healthcareProfessionalApi';
import {DoctorCardRemove, DoctorCardAdd} from '../DoctorCard';
import {routes} from '../../navigation/Router';

const WIDTH_MODAL = Dimensions.get('window').width;
const HEIGHT_MODAL = Dimensions.get('window').height;

type EditUserDataModalProps = {
  onCancel: () => void;
  onSave: () => void;
  onShareWithDoctor: () => void;
  onEditDoctor: () => void;
};

export const EditUserDataModal: React.FC<EditUserDataModalProps> = ({onCancel, onSave}) => {
  /* My information Tab */
  const {data: patient, isFetching} = useCurrentPatientQuery();
  const [activeTab, setActiveTab] = useState('my-information');

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [patientBirthDay, setPatientBirthDay] = useState<number>();

  const [formValues, setFormValues] = useState({firstName: '', lastName: '', email: '', mobilePhone: '', dateOfBirth: undefined});

  const [createOrUpdatePatient] = useCreateOrUpdatePatientMutation();

  useEffect(() => {
    if (!isFetching && patient) {
      setFormValues({
        firstName: patient.firstName,
        lastName: patient.lastName,
        email: patient.addresses[0].telecoms.find(item => item.telecomType === 'email').telecomNumber,
        mobilePhone: patient.addresses[0].telecoms.find(item => item.telecomType === 'mobile').telecomNumber,
        dateOfBirth: patient.dateOfBirth,
      });
    }
  }, [patient, isFetching]);

  const {
    control,
    handleSubmit,
    formState: {errors},
    setValue,
  } = useForm({
    values: formValues,
  });

  useEffect(() => {
    if (patientBirthDay) {
      setValue('dateOfBirth', patientBirthDay);
    }
  }, [patientBirthDay, setValue]);

  const handleCancel = () => {
    onCancel();
  };

  const handleSave = (data: {firstName: string; lastName: string; email: string; mobilePhone: string; dateOfBirth: number}) => {
    const {firstName, lastName, email, mobilePhone, dateOfBirth} = data;

    const address = new Address({
      addressType: 'home',
      telecoms: [
        new Telecom({
          telecomType: 'email',
          telecomNumber: email,
        }),
        new Telecom({
          telecomType: 'mobile',
          telecomNumber: mobilePhone,
        }),
      ],
    });

    createOrUpdatePatient(new Patient({...patient, firstName, lastName, dateOfBirth, addresses: [address]}));

    onSave();
  };

  const showFormatedDay = (date: number) => {
    const numberToData = parse(`${date}`, 'yyyyMMdd', new Date());
    return format(new Date(numberToData), 'dd MMM yyyy');
  };

  // My doctors Tab
  const [isSearchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const {user} = useAppSelector(state => ({
    ...state.medTechApi,
    user: state.medTechApi.user,
  }));

  const {data: hcpListSearchResult, isFetching: isHcpSearchFetching} = useFilterHealthcareProfessionalsQuery({name: searchQuery}, {skip: !searchQuery?.length});

  // if doctor already has access to the user's medical data, we should not show him in this list
  const filteredHcpList = hcpListSearchResult?.filter(item => !user?.sharingDataWith?.medicalInformation || ![...user?.sharingDataWith?.medicalInformation].includes(item.id));

  // Logout tab
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    // dispatch(logout());
    // navigate(routes.login);
  };

  return (
    <>
      <View style={styles.container}>
        <View style={styles.popup}>
          {/* Header */}
          <View style={styles.titleContainer}>
            <Text style={styles.title}>Manage account</Text>
            <TouchableOpacity onPress={handleCancel} style={styles.closeIcnContainer}>
              <Image style={styles.closeIcn} source={require('../../assets/images/close.png')} />
            </TouchableOpacity>
          </View>
          {/* Tabs */}
          <ScrollView contentContainerStyle={styles.scrollableContainer}>
            <View style={[styles.tabsHeader]}>
              <View style={styles.tabsInnerContainer}>
                <View style={styles.leftTabs}>
                  <TouchableOpacity onPress={() => setActiveTab('my-information')}>
                    <Text style={[globalStyles.baseText, styles.tabTitle, activeTab === 'my-information' && styles.activeTab]}>My information</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.centerTab} onPress={() => setActiveTab('my-doctors')}>
                    <Text style={[globalStyles.baseText, styles.tabTitle, activeTab === 'my-doctors' && styles.activeTab]}>My doctors</Text>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity onPress={() => setActiveTab('logout')}>
                  <Text style={[globalStyles.baseText, styles.tabTitle, activeTab === 'logout' && styles.activeTab]}>Logout</Text>
                </TouchableOpacity>
              </View>
            </View>
            {/* my-information Tab */}
            {isFetching && (
              <View style={[styles.activityIndicator, globalStyles.ph16]}>
                <ActivityIndicator color="#151B5D" />
              </View>
            )}
            {activeTab === 'my-information' && !isFetching && (
              <View style={[globalStyles.mt16, globalStyles.ph16]}>
                <Controller
                  control={control}
                  rules={{
                    required: {
                      value: true,
                      message: 'This field is required.',
                    },
                  }}
                  render={({field: {onChange, onBlur, value}}) => (
                    <View style={styles.input}>
                      <SquareInput onBlur={onBlur} onChange={onChange} value={value} label="First name" isRequired />
                    </View>
                  )}
                  name="firstName"
                />
                {errors.firstName && <ErrorMessage text={errors.firstName.message.toString()} />}
                <Controller
                  control={control}
                  rules={{
                    required: {
                      value: true,
                      message: 'This field is required.',
                    },
                  }}
                  render={({field: {onChange, onBlur, value}}) => (
                    <View style={styles.input}>
                      <SquareInput onBlur={onBlur} onChange={onChange} value={value} label="Last name" isRequired />
                    </View>
                  )}
                  name="lastName"
                />
                {errors.lastName && <ErrorMessage text={errors.lastName.message.toString()} />}
                <Controller
                  control={control}
                  rules={{
                    required: {
                      value: true,
                      message: 'This field is required.',
                    },
                  }}
                  render={({field: {onChange, onBlur, value}}) => (
                    <View style={styles.input}>
                      <SquareInput onBlur={onBlur} onChange={onChange} value={value} label="Email" isRequired />
                    </View>
                  )}
                  name="email"
                />
                {errors.email && <ErrorMessage text={errors.email.message.toString()} />}
                <Controller
                  control={control}
                  rules={{
                    required: {
                      value: true,
                      message: 'This field is required.',
                    },
                  }}
                  render={({field: {onChange, onBlur, value}}) => (
                    <View style={styles.input}>
                      <SquareInput onBlur={onBlur} onChange={onChange} value={value} label="Mobile phone" isRequired />
                    </View>
                  )}
                  name="mobilePhone"
                />
                {errors.mobilePhone && <ErrorMessage text={errors.mobilePhone.message.toString()} />}

                <Controller
                  control={control}
                  render={({field: {value}}) => (
                    <TouchableOpacity onPress={() => setShowDatePicker(!showDatePicker)}>
                      <View style={styles.input}>
                        <FakeSquareInput value={value ? showFormatedDay(value) : ''} label="Date of birth" />
                      </View>
                    </TouchableOpacity>
                  )}
                  name="dateOfBirth"
                />

                {/* ButtonsGroup */}
                <View style={[globalStyles.mt24, styles.buttonsGroup]}>
                  <View style={globalStyles.mr16}>
                    <SquareButton title="Cancel" onClick={handleCancel} outlined />
                  </View>
                  <SquareButton title="Save" onClick={handleSubmit(handleSave)} />
                </View>
              </View>
            )}
            {activeTab === 'my-doctors' && (
              <View style={globalStyles.mt24}>
                <Text style={[styles.description, globalStyles.ph16]}>
                  If you would like to share your medical data with the doctor, please, search for this doctor and add him to the list.{' '}
                </Text>
                <View style={[globalStyles.mt24, globalStyles.ph16]}>
                  <SearchSquareInput
                    onSubmit={(value: string) => {
                      setSearchQuery(value);
                    }}
                    onClose={() => {
                      setSearchQuery('');
                      setSearchOpen(false);
                    }}
                    onOpen={() => setSearchOpen(true)}
                    placeholder="Search for the doctor by name"
                  />
                  {isHcpSearchFetching && (
                    <View style={globalStyles.mt12}>
                      <ActivityIndicator color="#151B5D" />
                    </View>
                  )}
                  {!isHcpSearchFetching && searchQuery && filteredHcpList?.length === 0 && (
                    <View style={styles.noSearchResultContainer}>
                      <Text style={styles.noSearchResultText}>
                        We could not find a doctor with the name: "<Text style={{fontWeight: '700'}}>{searchQuery}</Text>".
                      </Text>
                      <Text style={[styles.noSearchResultText, globalStyles.mt4]}>Please, change the search query and try one more time.</Text>
                    </View>
                  )}
                  {filteredHcpList?.map((item, index) => (
                    <DoctorCardAdd key={index} name={item.name} id={item.id} />
                  ))}
                </View>
                <View style={[globalStyles.mt24, globalStyles.ph16]}>
                  {isSearchOpen && <View style={styles.bluredBg}></View>}
                  <View>
                    <Text style={styles.doctorsListHeading}>List of the doctors who currently have access to your Medical Data: </Text>
                    {user?.sharingDataWith?.medicalInformation && [...user?.sharingDataWith?.medicalInformation]?.length !== 0 ? (
                      [...user?.sharingDataWith?.medicalInformation].map((item, index) => <DoctorCardRemove key={index} id={item} />)
                    ) : (
                      <View style={styles.noSearchResultContainer}>
                        <Text style={styles.noSearchResultText}>You do not share your medical information with any doctor. </Text>
                        <Text style={[styles.noSearchResultText, globalStyles.mt2]}>To add a doctor, please use the search.</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            )}
            {activeTab === 'logout' && (
              <View style={[styles.logoutTab, globalStyles.mt24]}>
                <Text style={[styles.description, globalStyles.ph16]}>If you are absolutely sure that you want to logout, please click the button below:</Text>
                <TouchableOpacity onPress={handleLogout} style={iconButton.container}>
                  <Image style={iconButton.icon} source={require('../../assets/images/logout-pink.png')} />
                  <Text style={iconButton.text}>Logout</Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
      <Modal
        animationType="slide"
        transparent={true}
        visible={showDatePicker}
        onRequestClose={() => {
          setShowDatePicker(!showDatePicker);
        }}>
        <DatePickerModal
          patientBirthDay={patient?.dateOfBirth}
          onClose={() => setShowDatePicker(!showDatePicker)}
          onSave={selectedDate => {
            setPatientBirthDay(selectedDate);
          }}
        />
      </Modal>
    </>
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
    fontFamily: 'Nunito-Medium',
    color: '#151B5D',
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
  tabsHeader: {
    width: '100%',
    height: 32,
    marginTop: 32,
    borderBottomColor: '#A2A4BE',
    borderBottomWidth: 1,
  },
  tabsInnerContainer: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: -1,
    paddingHorizontal: 16,
    justifyContent: 'space-between',
    width: '100%',
  },
  leftTabs: {
    flexDirection: 'row',
  },
  centerTab: {
    marginHorizontal: 24,
  },
  tabTitle: {
    paddingVertical: 8,
    fontSize: 14,
    fontFamily: 'Nunito-Regular',
    paddingHorizontal: 4,
  },
  activeTab: {
    color: '#D06676',
    borderBottomColor: '#D06676',
    borderBottomWidth: 2,
    fontFamily: 'Nunito-Bold',
  },
  buttonsGroup: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  input: {
    marginTop: 8,
  },
  description: {
    width: '100%',
    fontSize: 12,
    fontFamily: 'Nunito-Regular',
    color: '#151B5D',
  },
  doctorsListHeading: {
    fontSize: 12,
    fontFamily: 'Nunito-Bold',
    color: '#151B5D',
    marginBottom: 12,
  },
  activityIndicator: {
    width: '100%',
    height: 430,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noSearchResultContainer: {
    flex: 1,
    paddingVertical: 24,
    backgroundColor: 'rgba(242, 243, 254, 0.6)',
    borderRadius: 10,
    paddingLeft: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noSearchResultText: {
    fontSize: 12,
    fontFamily: 'Nunito-Regular',
    textAlign: 'center',
    color: '#151B5D',
  },
  bluredBg: {
    height: 300,
    width: '200%',
    position: 'absolute',
    top: 0,
    zIndex: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  logoutTab: {
    alignItems: 'flex-start',
  },
});

const iconButton = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignContent: 'center',
    gap: 8,
    marginHorizontal: 16,
    marginTop: 24,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#D06676',
  },
  icon: {
    width: 18,
    height: 18,
  },
  text: {
    color: '#D06676',
    fontSize: 14,
    fontFamily: 'Nunito-Regular',
  },
});
