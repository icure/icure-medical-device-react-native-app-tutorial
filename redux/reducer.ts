import { api } from '../services/api'
import { combineReducers } from '@reduxjs/toolkit'
import { persistConfig, petra } from '../config/PetraState'
import { persistReducer } from 'redux-persist'
import { dataSampleApiRtk } from '../services/dataSampleApi'
import { patientApiRtk } from '../services/patientApi'
import { userApiRtk } from '../services/userApi'
import { healthcareProfessionalApiRtk } from '../services/healthcareProfessionalApi'

export const appReducer = combineReducers({
  petra: petra.reducer,
  medTechApi: api.reducer,
  dataSampleApi: dataSampleApiRtk.reducer,
  patientApi: patientApiRtk.reducer,
  healthcareProfessionalApi: healthcareProfessionalApiRtk.reducer,
  userApi: userApiRtk.reducer,
})

export const persistedReducer = persistReducer(persistConfig, appReducer)

export type AppState = ReturnType<typeof appReducer>
