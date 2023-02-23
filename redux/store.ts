import {configureStore} from '@reduxjs/toolkit';
import {persistedReducer} from './reducer';
import {persistStore} from 'redux-persist';
import thunk from 'redux-thunk';
import {dataSampleApiRtk} from '../services/dataSampleApi';
import {patientApiRtk} from '../services/patientApi';
import {userApiRtk} from '../services/userApi';
import {healthcareProfessionalApiRtk} from '../services/healthcareProfessionalApi';

export const store = configureStore({
  reducer: persistedReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({serializableCheck: false, immutableCheck: false}).concat(
      thunk,
      dataSampleApiRtk.middleware,
      patientApiRtk.middleware,
      userApiRtk.middleware,
      healthcareProfessionalApiRtk.middleware,
    ),
});
export const persistor = persistStore(store);

export type AppDispatch = typeof store.dispatch;
