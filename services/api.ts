import { AnonymousMedTechApi, AuthenticationProcess, MedTechApi, User, NativeCryptoPrimitivesBridge } from '@icure/medical-device-sdk'
import { SimpleMedTechCryptoStrategies } from '@icure/medical-device-sdk/src/services/MedTechCryptoStrategies'
import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit'
import { revertAll, setSavedCredentials } from '../config/YourAppState'
import { FetchBaseQueryError } from '@reduxjs/toolkit/query'
import storage from '../utils/storage'
import * as ExpoKryptomModule from '@icure/expo-kryptom'
import { IUser } from '@icure/typescript-common/models/User.model'

const apiCache: { [key: string]: MedTechApi | AnonymousMedTechApi } = {}

export interface MedTechApiState {
  email?: string
  token?: string
  user?: IUser
  keyPair?: { publicKey: string; privateKey: string }
  authProcess?: AuthenticationProcess
  online: boolean
  invalidEmail: boolean
  invalidToken: boolean
  firstName?: string
  lastName?: string
  dateOfBirth?: number
  mobilePhone?: string
  recaptcha?: string
  recaptchaReloadForced: boolean
  loginProcessStarted?: boolean
}

const initialState: MedTechApiState = {
  email: undefined,
  token: undefined,
  user: undefined,
  keyPair: undefined,
  authProcess: undefined,
  online: false,
  invalidEmail: false,
  invalidToken: false,
  firstName: undefined,
  lastName: undefined,
  dateOfBirth: undefined,
  mobilePhone: undefined,
  recaptcha: undefined,
  recaptchaReloadForced: false,
  loginProcessStarted: false,
}

export const medTechApi = async (getState: () => unknown) => {
  const state = getState() as { medTechApi: MedTechApiState }
  return await getApiFromState(() => state)
}

export const currentUser = (getState: () => unknown) => {
  const state = getState() as { medTechApi: MedTechApiState }
  return state.medTechApi.user
}

export const guard = async <T>(guardedInputs: unknown[], lambda: () => Promise<T>): Promise<{ error: FetchBaseQueryError } | { data: T }> => {
  if (guardedInputs.some((x) => !x)) {
    console.error('Guarded input is undefined')
    throw new Error('Guarded input is undefined')
  }
  try {
    return { data: await lambda() }
  } catch (e) {
    return { error: getError(e as Error) }
  }
}

function getError(e: Error): FetchBaseQueryError {
  return { status: 'CUSTOM_ERROR', error: e.message, data: undefined }
}

export const getApiFromState = async (getState: () => MedTechApiState | { medTechApi: MedTechApiState } | undefined): Promise<MedTechApi | undefined> => {
  const state = getState()
  if (!state) {
    throw new Error('No state found')
  }
  const medTechApiState = 'medTechApi' in state ? state.medTechApi : state
  const { user } = medTechApiState

  if (!user) {
    console.error('There is no user in the medTechApiState')
    return undefined
  }

  return apiCache[`${user.groupId}/${user.id}`] as MedTechApi
}

export const startAuthentication = createAsyncThunk('medTechApi/startAuthentication', async (_payload, { getState, dispatch }) => {
  const {
    medTechApi: { email, firstName, lastName, recaptcha: captcha },
  } = getState() as { medTechApi: MedTechApiState }

  dispatch(setLoginProcessStarted({ loginProcessStarted: true }))

  if (!email) throw new Error('No email provided')

  try {
    const anonymousApi = await new AnonymousMedTechApi.Builder()
      .withCrypto(new NativeCryptoPrimitivesBridge(ExpoKryptomModule))
      .withCryptoStrategies(new SimpleMedTechCryptoStrategies())
      .withMsgGwSpecId(process.env.EXPO_PUBLIC_EXTERNAL_SERVICES_SPEC_ID!)
      .withAuthProcessByEmailId(process.env.EXPO_PUBLIC_EMAIL_AUTHENTICATION_PROCESS_ID!)
      .withStorage(storage)
      .withICureBaseUrl('https://api.icure.cloud')
      .build()
    const captchaType = 'friendly-captcha'

    const authProcess = await anonymousApi.authenticationApi.startAuthentication({ recaptcha: captcha!, email, firstName, lastName, recaptchaType: captchaType })

    apiCache[`${authProcess.login}/${authProcess.requestId}`] = anonymousApi
    return authProcess
  } catch (e) {
    console.error(`Couldn't complete authentication: ${e}`)
    dispatch(forceRecaptchaReload(true))
    throw e
  } finally {
    dispatch(setLoginProcessStarted({ loginProcessStarted: false }))
  }
})

export const completeAuthentication = createAsyncThunk('medTechApi/completeAuthentication', async (_payload, { getState, dispatch }) => {
  const {
    medTechApi: { authProcess, token },
  } = getState() as { medTechApi: MedTechApiState }

  dispatch(setLoginProcessStarted({ loginProcessStarted: true }))

  if (!authProcess) {
    dispatch(setLoginProcessStarted({ loginProcessStarted: false }))
    throw new Error('No authProcess provided')
  }

  if (!token) {
    dispatch(setLoginProcessStarted({ loginProcessStarted: false }))
    throw new Error('No token provided')
  }

  const anonymousApi = apiCache[`${authProcess.login}/${authProcess.requestId}`] as AnonymousMedTechApi

  try {
    const result = await anonymousApi.authenticationApi.completeAuthentication(authProcess, token)
    const api = result.medTechApi
    const user = await api.userApi.getLoggedUser()

    apiCache[`${result.groupId}/${result.userId}`] = api
    delete apiCache[`${authProcess.login}/${authProcess.requestId}`]

    dispatch(setSavedCredentials({ login: `${result.groupId}/${result.userId}`, token: result.token, tokenTimestamp: +Date.now() }))
    return user.toJSON()
  } catch (e) {
    console.error(`Couldn't complete authentication: ${e}`)
    dispatch(forceRecaptchaReload(true))
    throw e
  } finally {
    dispatch(setLoginProcessStarted({ loginProcessStarted: false }))
  }
})

export const login = createAsyncThunk('medTechApi/login', async (_, { getState, dispatch }) => {
  const {
    medTechApi: { email, token },
  } = getState() as { medTechApi: MedTechApiState }

  dispatch(setLoginProcessStarted({ loginProcessStarted: true }))
  if (!email) throw new Error('No email provided')
  if (!token) throw new Error('No token provided')
  try {
    const api = await new MedTechApi.Builder()
      .withCrypto(new NativeCryptoPrimitivesBridge(ExpoKryptomModule))
      .withCryptoStrategies(new SimpleMedTechCryptoStrategies())
      .withStorage(storage)
      .withMsgGwSpecId(process.env.EXPO_PUBLIC_EXTERNAL_SERVICES_SPEC_ID!)
      .withAuthProcessByEmailId(process.env.EXPO_PUBLIC_EMAIL_AUTHENTICATION_PROCESS_ID!)
      .withUserName(email)
      .withPassword(token)
      .withICureBaseUrl('https://api.icure.cloud')
      .build()
    const user = await api.userApi.getLoggedUser()

    apiCache[`${user.groupId}/${user.id}`] = api
    return user.toJSON()
  } catch (e) {
    console.error(`Couldn't complete authentication: ${e}`)
    dispatch(forceRecaptchaReload(true))
    throw e
  } finally {
    dispatch(setLoginProcessStarted({ loginProcessStarted: false }))
  }
})

export const logout = createAsyncThunk('medTechApi/logout', async (_, { dispatch }) => {
  dispatch(revertAll())
  dispatch(resetCredentials())
})

export const api = createSlice({
  name: 'medTechApi',
  initialState,
  reducers: {
    setEmail: (state, { payload: { email } }: PayloadAction<{ email: string }>) => {
      state.email = email
      state.invalidEmail = false
    },
    setToken: (state, { payload: { token } }: PayloadAction<{ token: string }>) => {
      state.token = token
      state.invalidToken = false
    },
    setAuthProcess: (state, { payload: { authProcess } }: PayloadAction<{ authProcess: AuthenticationProcess }>) => {
      state.authProcess = authProcess
    },
    setRegistrationInformation: (state, { payload: { firstName, lastName, email } }: PayloadAction<{ firstName: string; lastName: string; email: string }>) => {
      state.firstName = firstName
      state.lastName = lastName
      state.email = email
    },
    resetCredentials(state) {
      state.online = false
    },
    setRecaptcha: (state, { payload: { recaptcha } }: PayloadAction<{ recaptcha: string }>) => {
      state.recaptcha = recaptcha
    },
    forceRecaptchaReload: (state, { payload: status }: PayloadAction<boolean>) => {
      state.recaptchaReloadForced = status
    },
    setLoginProcessStarted: (state, { payload: { loginProcessStarted } }: PayloadAction<{ loginProcessStarted: boolean }>) => {
      state.loginProcessStarted = loginProcessStarted
    },
  },
  extraReducers: (builder) => {
    builder.addCase(startAuthentication.fulfilled, (state, { payload: authProcess }) => {
      state.authProcess = authProcess
    })
    builder.addCase(completeAuthentication.fulfilled, (state, { payload: user }) => {
      state.user = { ...user }
      state.online = true
    })
    builder.addCase(startAuthentication.rejected, (state, {}) => {
      state.invalidEmail = true
    })
    builder.addCase(completeAuthentication.rejected, (state, {}) => {
      state.invalidToken = true
    })
    builder.addCase(login.fulfilled, (state, { payload: user }) => {
      state.user = new User(user)
      state.online = true
    })
    builder.addCase(login.rejected, (state, {}) => {
      state.invalidToken = true
      state.online = false
    })
  },
})

export const { setEmail, setToken, forceRecaptchaReload, setRegistrationInformation, resetCredentials, setRecaptcha, setLoginProcessStarted } = api.actions
