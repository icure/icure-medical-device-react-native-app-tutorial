import React, { useEffect, useState } from 'react'
import { View, Image, Text, StyleSheet } from 'react-native'
import { useForm, Controller } from 'react-hook-form'
import { useNavigate } from 'react-router-native'
import { createSelector } from '@reduxjs/toolkit'

import { CustomInput, Button, TextHelper, ErrorMessage } from '../components/FormElements'
import { completeAuthentication, login, setEmail, setToken, startAuthentication, setRecaptcha, MedTechApiState } from '../services/api'
import { useAppDispatch, useAppSelector } from '../redux/hooks'
import { WebViewComponent } from '../components/WebViewComponent'
import { YourAppState } from '../config/YourAppState'
import { routes } from '../navigation/Routes'
import { CustomActivityIndicator } from '../components/CustomActivityIndicator'

const selectMedTechApiData = (state: { medTechApi: MedTechApiState }) => state.medTechApi
const selectPetraData = (state: { petra: YourAppState }) => state.petra

const combinedSelector = createSelector([selectMedTechApiData, selectPetraData], (medTechApi: MedTechApiState, petra: YourAppState) => ({
  online: medTechApi.online,
  lsUsername: petra?.savedCredentials?.login,
  lsToken: petra?.savedCredentials?.token,
  loginProcessStarted: medTechApi.loginProcessStarted,
}))

export const Login = () => {
  const [isWaitingForCode, setWaitingForCodeState] = useState(false)
  const { online, lsUsername, lsToken, loginProcessStarted } = useAppSelector(combinedSelector)
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      userEmail: '',
      userCode: '',
    },
  })
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  useEffect(() => {
    if (lsUsername && lsToken && dispatch) {
      dispatch(setEmail({ email: lsUsername }))
      dispatch(setToken({ token: lsToken }))
      dispatch(login())
    }
  }, [navigate, lsUsername, lsToken, dispatch])

  useEffect(() => {
    if (online) {
      navigate(routes.home)
    }
  }, [online, navigate])

  const askForCode = (data: { userEmail: string }) => {
    setWaitingForCodeState(true)

    dispatch(setEmail({ email: data.userEmail }))
    dispatch(startAuthentication())
  }

  const performLogin = (data: { userCode: string }) => {
    setWaitingForCodeState(false)

    dispatch(setToken({ token: data.userCode }))
    dispatch(completeAuthentication())
  }

  return (
    <>
      {loginProcessStarted && <CustomActivityIndicator />}
      <View style={styles.registerScreen}>
        <View style={styles.contentHolder}>
          <Image style={styles.logo} source={require('../assets/images/icure-logo.png')} />
          <Text style={styles.heading}>Login</Text>
          <View style={styles.inputsContainer}>
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
            <Button title="Login" onClick={handleSubmit(performLogin)} size="large" />
          ) : (
            <Button title="Receive a one time code" onClick={handleSubmit(askForCode)} size="large" />
          )}

          <View style={styles.textHelperContainer}>
            <TextHelper text="Not registered yet?" url="/register" title="Create an account" />
          </View>
        </View>
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  registerScreen: {
    flex: 1,
    height: '100%',
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
    marginBottom: 12,
    gap: 16,
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
