import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { IPatient, Patient, User } from '@icure/medical-device-sdk'
import { currentUser, guard, medTechApi } from './api'

export const patientApiRtk = createApi({
  reducerPath: 'patientApi',
  tagTypes: ['Patient'],
  baseQuery: fetchBaseQuery({
    baseUrl: '/rest/v2/patient',
  }),
  endpoints: (builder) => ({
    currentPatient: builder.query<IPatient, void>({
      async queryFn(_, { getState }) {
        const api = await medTechApi(getState)
        if (api === undefined) {
          throw new Error('No medTechApi available')
        }
        const { patientApi, dataOwnerApi } = api
        const user = currentUser(getState)

        if (user === undefined) {
          throw new Error('No user available')
        }

        return guard([patientApi, dataOwnerApi], async () => {
          const dataOwner = dataOwnerApi.getDataOwnerIdOf(new User(user))
          return (await patientApi.get(dataOwner)).toJSON()
        })
      },
      providesTags: (patient) => (!!patient ? [{ type: 'Patient', id: patient.id }] : []),
    }),
    createOrUpdatePatient: builder.mutation<IPatient, IPatient>({
      async queryFn(patient, { getState }) {
        const api = await medTechApi(getState)

        if (api === undefined) {
          throw new Error('No medTechApi available')
        }

        const { patientApi } = api
        return guard([patientApi], async () => {
          return (await patientApi.createOrModifyPatient(new Patient(patient))).toJSON()
        })
      },
      invalidatesTags: (patient) => (!!patient ? [{ type: 'Patient', id: patient.id }] : []),
    }),
  }),
})

export const { useCurrentPatientQuery, useCreateOrUpdatePatientMutation } = patientApiRtk
