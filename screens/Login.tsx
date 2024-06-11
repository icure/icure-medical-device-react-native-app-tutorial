import React, { useEffect, useState } from 'react'
import { View, Image, Text, StyleSheet } from 'react-native'
import { useForm, Controller } from 'react-hook-form'
import { useNavigate } from 'react-router-native'
import { createSelector } from '@reduxjs/toolkit'

import { RoundedInput, RoundedButton, TextHelper, ErrorMessage } from '../components/FormElements'
import { completeAuthentication, login, setEmail, setToken, startAuthentication, setRecaptcha, MedTechApiState } from '../services/api'
import { useAppDispatch, useAppSelector } from '../redux/hooks'
import { WebViewComponent } from '../components/WebViewComponent'
import { PetraState } from '../config/PetraState'
import { routes } from '../navigation/Routes'

const selectMedTechApiData = (state: { medTechApi: MedTechApiState }) => state.medTechApi
const selectPetraData = (state: { petra: PetraState }) => state.petra

const combinedSelector = createSelector([selectMedTechApiData, selectPetraData], (medTechApi: MedTechApiState, petra: PetraState) => ({
  online: medTechApi.online,
  lsUsername: petra?.savedCredentials?.login,
  lsToken: petra?.savedCredentials?.token,
}))

export const Login = () => {
  const [isWaitingForCode, setWaitingForCodeState] = useState(false)
  const { online, lsUsername, lsToken } = useAppSelector(combinedSelector)
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
    <View style={styles.registerScreen}>
      <View style={styles.contentHolder}>
        <Image style={styles.logo} source={require('../assets/images/logo.png')} />
        <Text style={styles.heading}>Login</Text>
        <View style={styles.inputsContainer}>
          <Controller
            control={control}
            rules={{
              required: true,
            }}
            render={({ field: { onChange, onBlur, value } }) => <RoundedInput label="Email or phone number" onBlur={onBlur} onChange={onChange} value={value} isRequired />}
            name="userEmail"
          />
          {errors.userEmail && <ErrorMessage text="This field is required." />}
          {isWaitingForCode ? (
            <>
              <Controller
                control={control}
                rules={{
                  required: true,
                }}
                render={({ field: { onChange, onBlur, value } }) => <RoundedInput label="Code" onBlur={onBlur} onChange={onChange} value={value} isRequired />}
                name="userCode"
              />
              {errors.userCode && <ErrorMessage text="This field is required." />}
            </>
          ) : null}
        </View>

        <View style={styles.webviewContainer}>
          <WebViewComponent sitekey={process.env.EXPO_PUBLIC_FRIENDLY_CAPTCHA_SITE_KEY!} onFinish={(value) => dispatch(setRecaptcha({ recaptcha: value }))} />
        </View>

        {isWaitingForCode ? (
          <RoundedButton title="Login" onClick={handleSubmit(performLogin)} />
        ) : (
          <RoundedButton title="Receive a one time code" onClick={handleSubmit(askForCode)} />
        )}

        <View style={styles.textHelperContainer}>
          <TextHelper text="Not registered yet?" url="/register" title="Create an account" />
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  registerScreen: {
    flex: 1,
    height: '100%',
    paddingTop: 40,
    backgroundColor: '#FFFDFE',
  },
  heading: {
    fontSize: 24,
    color: '#151B5D',
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
    width: 201,
    height: 201,
    marginBottom: 32,
  },
  inputsContainer: {
    width: '100%',
    marginBottom: 12,
  },
  textHelperContainer: {
    marginTop: 24,
  },
  webviewContainer: {
    width: '100%',
    height: 75,
    marginBottom: 24,
    backgroundColor: 'red',
    borderWidth: 1,
    borderColor: '#A2A4BE',
    borderRadius: 25,
  },
})
