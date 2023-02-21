import {api} from '../services/api';
import {combineReducers} from '@reduxjs/toolkit';
import {persistConfig, petra} from '../config/PetraState';
import {persistReducer} from 'redux-persist';
import {patientApiRtk} from '../services/patientApi';
import {userApiRtk} from '../services/userApi';

export const appReducer = combineReducers({
  petra: petra.reducer,
  medTechApi: api.reducer,
  patientApi: patientApiRtk.reducer,
  userApi: userApiRtk.reducer,
});

export const persistedReducer = persistReducer(persistConfig, appReducer);

export type AppState = ReturnType<typeof appReducer>;
