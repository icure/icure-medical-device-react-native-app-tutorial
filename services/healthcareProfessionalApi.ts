import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react';
import {currentUser, guard, medTechApi} from './api';
import {HealthcareProfessional, HealthcareProfessionalFilter} from '@icure/medical-device-sdk';

export const healthcareProfessionalApiRtk = createApi({
  reducerPath: 'healthcareProfessionalApi',
  tagTypes: ['hcp'],
  baseQuery: fetchBaseQuery({
    baseUrl: '/rest/v1/healthcareProfessional',
  }),
  endpoints: builder => ({
    getHealthcareProfessional: builder.query<HealthcareProfessional, string>({
      async queryFn(id, {getState}) {
        const api = await medTechApi(getState);
        if (api === undefined) {
          throw new Error('No medTechApi available');
        }
        const {healthcareProfessionalApi} = api;
        return guard([healthcareProfessionalApi], async () => {
          return HealthcareProfessional.toJSON(await healthcareProfessionalApi.getHealthcareProfessional(id));
        });
      },
      providesTags: hcp => (!!hcp ? [{type: 'hcp', id: hcp.id}] : []),
    }),
    currentHealthcareProfessional: builder.query<HealthcareProfessional, void>({
      async queryFn(_, {getState}) {
        const api = await medTechApi(getState);
        if (api === undefined) {
          throw new Error('No medTechApi available');
        }
        const {healthcareProfessionalApi, dataOwnerApi} = api;
        const user = currentUser(getState);
        if (user === undefined) {
          throw new Error('No user available');
        }
        return guard([healthcareProfessionalApi, dataOwnerApi], async () => {
          const dataOwner = dataOwnerApi.getDataOwnerIdOf(user);
          return HealthcareProfessional.toJSON(await healthcareProfessionalApi.getHealthcareProfessional(dataOwner));
        });
      },
      providesTags: hcp => (!!hcp ? [{type: 'hcp', id: hcp.id}] : []),
    }),
    filterHealthcareProfessionals: builder.query<HealthcareProfessional[], {name: string}>({
      async queryFn({name}, {getState}) {
        const api = await medTechApi(getState);
        if (api === undefined) {
          throw new Error('No medTechApi available');
        }
        const {healthcareProfessionalApi} = api;
        return guard([healthcareProfessionalApi], async () => {
          return (
            await healthcareProfessionalApi.filterHealthcareProfessionalBy(
              await new HealthcareProfessionalFilter(api)
                .byMatches(
                  name
                    .toLowerCase()
                    .normalize('NFD')
                    .replace(/[ \t\u0300-\u036f]/g, ''),
                )
                .build(),
            )
          ).rows.map(HealthcareProfessional.toJSON);
        });
      },
    }),
    createOrUpdateHealthcareProfessional: builder.mutation<HealthcareProfessional, HealthcareProfessional>({
      async queryFn(healthcareProfessional, {getState}) {
        const api = await medTechApi(getState);
        if (api === undefined) {
          throw new Error('No medTechApi available');
        }
        const {healthcareProfessionalApi} = api;
        return guard([healthcareProfessionalApi], async () => {
          return HealthcareProfessional.toJSON(await healthcareProfessionalApi.createOrModifyHealthcareProfessional(healthcareProfessional));
        });
      },
      invalidatesTags: hcp => (!!hcp ? [{type: 'hcp', id: hcp.id}] : []),
    }),
  }),
});

export const {useGetHealthcareProfessionalQuery, useCurrentHealthcareProfessionalQuery, useCreateOrUpdateHealthcareProfessionalMutation, useFilterHealthcareProfessionalsQuery} =
  healthcareProfessionalApiRtk;
