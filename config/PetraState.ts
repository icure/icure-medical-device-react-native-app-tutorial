import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const persistConfig = {
  key: 'petra',
  storage: AsyncStorage,
  whitelist: ['petra'],
};

export interface PetraState {
  cache: string;
  savedCredentials?: {
    tokenTimestamp: number;
    login: string;
    token: string;
  };
}

const initialState = {} as PetraState;

export const petra = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setSavedCredentials(state, {payload: savedCredentials}: PayloadAction<{login: string; token: string; tokenTimestamp: number} | undefined>) {
      state.savedCredentials = savedCredentials;
    },
    revertAll() {
      return initialState;
    }
  },
});

export const {setSavedCredentials, revertAll} = petra.actions;
