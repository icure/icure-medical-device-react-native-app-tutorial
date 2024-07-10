import { api } from '../services/api'
import { combineReducers } from '@reduxjs/toolkit'
import { persistConfig, yourApp } from '../config/YourAppState'
import { persistReducer } from 'redux-persist'
import { patientApiRtk } from '../services/patientApi'

export const appReducer = combineReducers({
  petra: yourApp.reducer,
  medTechApi: api.reducer,
  patientApi: patientApiRtk.reducer,
})

export const persistedReducer = persistReducer(persistConfig, appReducer)

export type AppState = ReturnType<typeof appReducer>
