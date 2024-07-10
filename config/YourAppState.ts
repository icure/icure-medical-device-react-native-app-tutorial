import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import storage from '../utils/storage'

export const persistConfig = {
  key: 'petra',
  storage: storage,
  whitelist: ['petra'],
}

export interface YourAppState {
  cache: string
  savedCredentials?: {
    tokenTimestamp: number
    login: string
    token: string
  }
}

const initialState = {} as YourAppState

export const yourApp = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setSavedCredentials(state, { payload: savedCredentials }: PayloadAction<{ login: string; token: string; tokenTimestamp: number } | undefined>) {
      state.savedCredentials = savedCredentials
    },
    revertAll() {
      return initialState
    },
  },
})

export const { setSavedCredentials, revertAll } = yourApp.actions
