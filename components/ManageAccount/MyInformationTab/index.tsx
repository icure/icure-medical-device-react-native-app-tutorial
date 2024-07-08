import { Modal, StyleSheet, TouchableOpacity, View } from 'react-native'

import { Controller, useForm } from 'react-hook-form'
import { DatePickerModal, ErrorMessage, FakeSquareInput, CustomInput } from '../../FormElements'
import React, { useEffect, useState } from 'react'
import { Address, Patient, Telecom } from '@icure/medical-device-sdk'
import { format, parse } from 'date-fns'
import { useCreateOrUpdatePatientMutation, useCurrentPatientQuery } from '../../../services/patientApi'
import { Button } from '../../FormElements'
import { CustomActivityIndicator } from '../../CustomActivityIndicator'

type MyInformationTabProps = {
  onCancel: () => void
  onSave: () => void
}

interface UpdatePatientForm {
  firstName?: string
  lastName?: string
  email?: string
  mobilePhone?: string
  dateOfBirth?: number
}

export const MyInformationTab: React.FC<MyInformationTabProps> = ({ onCancel, onSave }) => {
  const { data: patient, isFetching } = useCurrentPatientQuery()
  const [createOrUpdatePatient, { isLoading: patientUpdatingIsLoading }] = useCreateOrUpdatePatientMutation()
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [initialValues, setInitialValues] = useState<UpdatePatientForm>({})
  useEffect(() => {
    if (!isFetching && patient) {
      setInitialValues({
        firstName: patient.firstName,
        lastName: patient.lastName,
        email: patient?.addresses[0]?.telecoms.find((item) => item.telecomType === 'email')?.telecomNumber,
        mobilePhone: patient?.addresses[0]?.telecoms.find((item) => item.telecomType === 'mobile')?.telecomNumber,
        dateOfBirth: patient.dateOfBirth,
      })
    }
  }, [patient, isFetching])

  const {
    control,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm({
    values: initialValues,
  })

  const handleSave = (data: UpdatePatientForm) => {
    const { firstName, lastName, email, mobilePhone, dateOfBirth } = data

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
    })

    createOrUpdatePatient(new Patient({ ...patient, firstName, lastName, dateOfBirth, addresses: [address] }))
    onSave()
  }

  const showFormattedDay = (date: number) => {
    const numberToData = parse(`${date}`, 'yyyyMMdd', new Date())
    return format(new Date(numberToData), 'dd MMMM yyyy')
  }

  return (
    <>
      {(isFetching || patientUpdatingIsLoading) && <CustomActivityIndicator />}
      <View style={styles.tab}>
        <View style={styles.inputs}>
          <View style={styles.input}>
            <Controller
              control={control}
              rules={{
                required: {
                  value: true,
                  message: 'First Name is required.',
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <CustomInput onBlur={onBlur} onChange={onChange} value={value} label="First name" isRequired error={!!errors.firstName?.message} />
              )}
              name="firstName"
            />
            {errors.firstName?.message && <ErrorMessage text={errors.firstName.message?.toString()} />}
          </View>
          <View style={styles.input}>
            <Controller
              control={control}
              rules={{
                required: {
                  value: true,
                  message: 'Last name is required.',
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <CustomInput onBlur={onBlur} onChange={onChange} value={value} label="Last name" isRequired error={!!errors.lastName?.message} />
              )}
              name="lastName"
            />
            {errors.lastName?.message && <ErrorMessage text={errors.lastName.message.toString()} />}
          </View>
          <View style={styles.input}>
            <Controller
              control={control}
              rules={{
                required: {
                  value: true,
                  message: 'Email address is required.',
                },
              }}
              render={({ field: { onChange, onBlur, value } }) => (
                <CustomInput onBlur={onBlur} onChange={onChange} value={value} label="Email" isRequired error={!!errors.email?.message} />
              )}
              name="email"
            />
            {errors.email?.message && <ErrorMessage text={errors.email.message?.toString()} />}
          </View>
          <Controller
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <View>
                <CustomInput onBlur={onBlur} onChange={onChange} value={value} label="Mobile phone" />
              </View>
            )}
            name="mobilePhone"
          />
          <Controller
            control={control}
            render={({ field: { value } }) => (
              <TouchableOpacity onPress={() => setShowDatePicker(!showDatePicker)}>
                <View>
                  <FakeSquareInput value={value ? showFormattedDay(value) : ''} label="Date of birth" />
                </View>
              </TouchableOpacity>
            )}
            name="dateOfBirth"
          />
        </View>

        {/* ButtonsGroup */}
        <View style={styles.buttonsGroup}>
          <Button title="Cancel" onClick={onCancel} width={'50%'} outlined />
          <Button title="Save" onClick={handleSubmit(handleSave)} width={'50%'} />
        </View>
      </View>
      <Modal
        animationType="slide"
        transparent={true}
        visible={showDatePicker}
        onRequestClose={() => {
          setShowDatePicker(!showDatePicker)
        }}
      >
        <DatePickerModal
          patientBirthDay={patient?.dateOfBirth}
          onClose={() => setShowDatePicker(!showDatePicker)}
          onSave={(selectedDate) => {
            setValue('dateOfBirth', selectedDate)
          }}
        />
      </Modal>
    </>
  )
}

const styles = StyleSheet.create({
  tab: {
    flexGrow: 1,
    paddingVertical: 20,
    gap: 32,
  },
  inputs: {
    gap: 16,
  },
  input: {
    gap: 4,
  },
  buttonsGroup: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
})
