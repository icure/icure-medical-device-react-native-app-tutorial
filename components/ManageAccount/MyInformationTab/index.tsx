import { StyleSheet, View } from 'react-native'

import { Controller, useForm } from 'react-hook-form'
import { ErrorMessage, CustomInput } from '../../FormElements'
import React, { useEffect, useState } from 'react'
import { Address, Patient, Telecom } from '@icure/medical-device-sdk'
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
}

export const MyInformationTab: React.FC<MyInformationTabProps> = ({ onCancel, onSave }) => {
  const { data: patient, isFetching } = useCurrentPatientQuery()
  const [createOrUpdatePatient, { isLoading: patientUpdatingIsLoading }] = useCreateOrUpdatePatientMutation()
  const [initialValues, setInitialValues] = useState<UpdatePatientForm>({})
  useEffect(() => {
    if (!isFetching && patient) {
      setInitialValues({
        firstName: patient.firstName,
        lastName: patient.lastName,
        email: patient?.addresses[0]?.telecoms.find((item) => item.telecomType === 'email')?.telecomNumber,
        mobilePhone: patient?.addresses[0]?.telecoms.find((item) => item.telecomType === 'mobile')?.telecomNumber,
      })
    }
  }, [patient, isFetching])

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    values: initialValues,
  })

  const handleSave = (data: UpdatePatientForm) => {
    const { firstName, lastName, email, mobilePhone } = data

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

    createOrUpdatePatient(new Patient({ ...patient, firstName, lastName, addresses: [address] }))
    onSave()
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
        </View>

        {/* ButtonsGroup */}
        <View style={styles.buttonsGroup}>
          <Button title="Cancel" onClick={onCancel} width={'50%'} outlined />
          <Button title="Save" onClick={handleSubmit(handleSave)} width={'50%'} />
        </View>
      </View>
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
