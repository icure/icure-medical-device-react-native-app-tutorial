import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import storage from '../utils/storage'

export const persistConfig = {
  key: 'petra',
  storage: storage,
  whitelist: ['petra'],
}

export interface PetraState {
  cache: string
  savedCredentials?: {
    tokenTimestamp: number
    login: string
    token: string
  }
  loginProcessStarted?: boolean
}

const initialState = {} as PetraState

export const petra = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setSavedCredentials(state, { payload: savedCredentials }: PayloadAction<{ login: string; token: string; tokenTimestamp: number; } | undefined>) {
      state.savedCredentials = savedCredentials
    },
    setLoginProcessStarted(state, { payload: loginProcessStarted }: PayloadAction<boolean | undefined>) {
      state.loginProcessStarted = loginProcessStarted
    },
    revertAll() {
      return initialState
    },
  },
})

export const { setSavedCredentials, revertAll, setLoginProcessStarted } = petra.actions
