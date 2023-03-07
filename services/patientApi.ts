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
    getPatient: builder.query<Patient, string>({
      async queryFn(id, {getState}) {
        const {patientApi} = await medTechApi(getState);
        return guard([patientApi], () => {
          return patientApi.getPatient(id);
        });
      },
      providesTags: ({id}) => [{type: 'Patient', id}],
    }),
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
    createOrUpdatePatient: builder.mutation<Patient, Patient>({
      async queryFn(patient, {getState}) {
        const {patientApi} = await medTechApi(getState);
        return guard([patientApi], () => {
          return patientApi.createOrModifyPatient(patient);
        });
      },
      invalidatesTags: ({id}) => [{type: 'Patient', id}],
    }),
  }),
});

export const {useGetPatientQuery, useCurrentPatientQuery, useCreateOrUpdatePatientMutation} = patientApiRtk;
