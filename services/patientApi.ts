import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { Patient } from '@icure/medical-device-sdk'
import { currentUser, guard, medTechApi } from './api'

export const patientApiRtk = createApi({
  reducerPath: 'patientApi',
  tagTypes: ['Patient'],
  baseQuery: fetchBaseQuery({
    baseUrl: '/rest/v2/patient',
  }),
  endpoints: (builder) => ({
    getPatient: builder.query<Patient, string>({
      async queryFn(id, { getState }) {
        const api = await medTechApi(getState)
        if (api === undefined) {
          throw new Error('No medTechApi available')
        }

        const { patientApi } = api

        return guard([patientApi], async () => {
          return Patient.toJSON(await patientApi.get(id))
        })
      },
      providesTags: (patient) => {
        return patient ? [{ type: 'Patient', id: patient.id }] : []
      },
    }),
    currentPatient: builder.query<Patient, void>({
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
          const dataOwner = dataOwnerApi.getDataOwnerIdOf(user)
          return Patient.toJSON(await patientApi.get(dataOwner))
        })
      },
      providesTags: (patient) => (!!patient ? [{ type: 'Patient', id: patient.id }] : []),
    }),
    createOrUpdatePatient: builder.mutation<Patient, Patient>({
      async queryFn(patient, { getState }) {
        const api = await medTechApi(getState)

        if (api === undefined) {
          throw new Error('No medTechApi available')
        }

        const { patientApi } = api
        return guard([patientApi], async () => {
          return Patient.toJSON(await patientApi.createOrModifyPatient(patient))
        })
      },
      invalidatesTags: (patient) => (!!patient ? [{ type: 'Patient', id: patient.id }] : []),
    }),
  }),
})

export const { useGetPatientQuery, useCurrentPatientQuery, useCreateOrUpdatePatientMutation } = patientApiRtk
