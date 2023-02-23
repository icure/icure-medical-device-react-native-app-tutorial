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
        const {healthcareProfessionalApi} = await medTechApi(getState);
        return guard([healthcareProfessionalApi], () => {
          return healthcareProfessionalApi.getHealthcareProfessional(id);
        });
      },
      providesTags: ({id}) => [{type: 'hcp', id}],
    }),
    currentHealthcareProfessional: builder.query<HealthcareProfessional, void>({
      async queryFn(_, {getState}) {
        const {healthcareProfessionalApi, dataOwnerApi} = await medTechApi(getState);
        const user = currentUser(getState);
        return guard([healthcareProfessionalApi, dataOwnerApi], () => {
          const dataOwner = dataOwnerApi.getDataOwnerIdOf(user);
          return healthcareProfessionalApi.getHealthcareProfessional(dataOwner);
        });
      },
      providesTags: ({id}) => [{type: 'hcp', id}],
    }),
    filterHealthcareProfessionals: builder.query<HealthcareProfessional[], {name: string}>({
      async queryFn({name}, {getState}) {
        const {healthcareProfessionalApi} = await medTechApi(getState);
        return guard([healthcareProfessionalApi], async () => {
          return (
            await healthcareProfessionalApi.filterHealthcareProfessionalBy(
              await new HealthcareProfessionalFilter()
                .byMatches(
                  name
                    .toLowerCase()
                    .normalize('NFD')
                    .replace(/[ \t\u0300-\u036f]/g, ''),
                )
                .build(),
            )
          ).rows;
        });
      },
    }),
    createOrUpdateHealthcareProfessional: builder.mutation<HealthcareProfessional, HealthcareProfessional>({
      async queryFn(healthcareProfessional, {getState}) {
        const {healthcareProfessionalApi} = await medTechApi(getState);
        return guard([healthcareProfessionalApi], () => {
          return healthcareProfessionalApi.createOrModifyHealthcareProfessional(healthcareProfessional);
        });
      },
      invalidatesTags: ({id}) => [{type: 'hcp', id}],
    }),
  }),
});

export const {useGetHealthcareProfessionalQuery, useCurrentHealthcareProfessionalQuery, useCreateOrUpdateHealthcareProfessionalMutation, useFilterHealthcareProfessionalsQuery} =
  healthcareProfessionalApiRtk;
