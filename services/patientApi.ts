import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react';
import {Patient} from '@icure/medical-device-sdk';
import {currentUser, guard, medTechApi} from './api';

export const patientApiRtk = createApi({
  reducerPath: 'patientApi',
  tagTypes: ['Patient'],
  baseQuery: fetchBaseQuery({
    baseUrl: '/rest/v1/patient',
  }),
  endpoints: builder => ({
    currentPatient: builder.query<Patient, void>({
      async queryFn(_, {getState}) {
        const {patientApi, dataOwnerApi} = await medTechApi(getState);
        const user = currentUser(getState);
        return guard([patientApi, dataOwnerApi], () => {
          const dataOwner = dataOwnerApi.getDataOwnerIdOf(user);
          return patientApi.getPatient(dataOwner);
        });
      },
      providesTags: ({id}) => [{type: 'Patient', id}],
    }),
  }),
});

export const {useCurrentPatientQuery} = patientApiRtk;
