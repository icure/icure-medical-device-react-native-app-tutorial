import React, { JSX, useEffect, useState } from 'react'
import { View, Image, Text, StyleSheet, Dimensions } from 'react-native'
import { useForm, Controller } from 'react-hook-form'
import { useNavigate } from 'react-router-native'

import { CustomInput, Button, TextHelper, ErrorMessage } from '../components/FormElements'
import { useAppDispatch, useAppSelector } from '../redux/hooks'
import { setRegistrationInformation, setToken, startAuthentication, completeAuthentication, setRecaptcha, MedTechApiState } from '../services/api'
import { WebViewComponent } from '../components/WebViewComponent'
import { createSelector } from '@reduxjs/toolkit'
import { routes } from '../navigation/Routes'
import { CustomActivityIndicator } from '../components/CustomActivityIndicator'

const selectMedTechApiData = createSelector([(state: { medTechApi: MedTechApiState }) => state.medTechApi], (medTechApi: MedTechApiState) => ({
  online: medTechApi.online,
  loginProcessStarted: medTechApi.loginProcessStarted,
}))

const WIDTH_MODAL = Dimensions.get('window').width
const HEIGHT_MODAL = Dimensions.get('window').height

export const Register = (): JSX.Element => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      userFirstName: '',
      userLastName: '',
      userEmail: '',
      userCode: '',
    },
  })
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const [isWaitingForCode, setWaitingForCode] = useState(false)

  const { online, loginProcessStarted } = useAppSelector(selectMedTechApiData)

  useEffect(() => {
    if (online) {
      navigate(routes.home)
    }
  }, [online, navigate])

  const onAskCode = (data: { userEmail: string; userFirstName: string; userLastName: string }) => {
    setWaitingForCode(true)
    dispatch(setRegistrationInformation({ email: data.userEmail, firstName: data.userFirstName, lastName: data.userLastName }))
    dispatch(startAuthentication())
  }

  const onRegister = (data: { userCode: string }) => {
    setWaitingForCode(false)
    dispatch(setToken({ token: data.userCode }))
    dispatch(completeAuthentication())
  }

  return (
    <>
      {loginProcessStarted && <CustomActivityIndicator />}
      <View style={styles.registerScreen}>
        <View style={styles.contentHolder}>
          <Image style={styles.logo} source={require('../assets/images/icure-logo.png')} />
          <Text style={styles.heading}>Registration</Text>
          <View style={styles.inputsContainer}>
            <View style={styles.input}>
              <Controller
                control={control}
                rules={{
                  required: {
                    value: true,
                    message: 'First name is required.',
                  },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <CustomInput label="First name" onBlur={onBlur} onChange={onChange} value={value} isRequired error={!!errors.userFirstName?.message} />
                )}
                name="userFirstName"
              />
              {errors.userFirstName?.message && <ErrorMessage text={errors.userFirstName.message?.toString()} />}
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
                  <CustomInput label="Last name" onBlur={onBlur} onChange={onChange} value={value} isRequired error={!!errors.userLastName?.message} />
                )}
                name="userLastName"
              />
              {errors.userLastName?.message && <ErrorMessage text={errors.userLastName.message?.toString()} />}
            </View>
            <View style={styles.input}>
              <Controller
                control={control}
                rules={{
                  required: {
                    value: true,
                    message: 'Email or phone number is required.',
                  },
                }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <CustomInput label="Email or phone number" onBlur={onBlur} onChange={onChange} value={value} isRequired error={!!errors.userEmail?.message} />
                )}
                name="userEmail"
              />
              {errors.userEmail?.message && <ErrorMessage text={errors.userEmail.message?.toString()} />}
            </View>

            {isWaitingForCode ? (
              <View style={styles.input}>
                <Controller
                  control={control}
                  rules={{
                    required: {
                      value: true,
                      message: 'Confirmation code is required.',
                    },
                  }}
                  render={({ field: { onChange, onBlur, value } }) => (
                    <CustomInput label="Code" onBlur={onBlur} onChange={onChange} value={value} isRequired error={!!errors.userCode?.message} />
                  )}
                  name="userCode"
                />
                {errors.userCode?.message && <ErrorMessage text={errors.userCode.message?.toString()} />}
              </View>
            ) : null}
          </View>

          <View style={styles.webviewContainer}>
            <WebViewComponent sitekey={process.env.EXPO_PUBLIC_FRIENDLY_CAPTCHA_SITE_KEY!} onFinish={(value) => dispatch(setRecaptcha({ recaptcha: value }))} />
          </View>

          {isWaitingForCode ? (
            <Button title="Register" onClick={handleSubmit(onRegister)} size="large" />
          ) : (
            <Button title="Receive a one time code" onClick={handleSubmit(onAskCode)} size="large" />
          )}

          <View style={styles.textHelperContainer}>
            <TextHelper text="Already have an account?" url="/" title="Log in" />
          </View>
        </View>
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  registerScreen: {
    flex: 1,
    width: WIDTH_MODAL,
    height: HEIGHT_MODAL,
    paddingTop: 24,
    backgroundColor: '#FFFDFE',
  },
  heading: {
    fontSize: 24,
    color: '#303443',
    textAlign: 'center',
    marginBottom: 32,
    marginTop: 24,
    fontFamily: 'Nunito-Regular',
  },
  contentHolder: {
    alignItems: 'center',
    padding: 24,
  },
  logo: {
    width: 150,
    height: 60,
    marginBottom: 32,
  },
  inputsContainer: {
    width: '100%',
    gap: 16,
    marginBottom: 12,
  },
  input: {
    gap: 4,
  },
  textHelperContainer: {
    marginTop: 24,
  },
  webviewContainer: {
    width: '100%',
    marginBottom: 24,
  },
})
