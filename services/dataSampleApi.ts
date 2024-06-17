import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { currentUser, guard, medTechApi } from './api'
import { DataSample, DataSampleFilter, FilterComposition, IDataSample, PaginatedList, User } from '@icure/medical-device-sdk'
import { IPaginatedList } from '@icure/typescript-common/models/PaginatedList.model'

export const dataSampleApiRtk = createApi({
  reducerPath: 'dataSampleApi',
  tagTypes: ['DataSample'],
  baseQuery: fetchBaseQuery({
    baseUrl: '/rest/v1/dataSample',
  }),
  endpoints: (builder) => ({
    getDataSamples: builder.query<IPaginatedList<IDataSample>, { ids: string[]; nextDataSampleId?: string; limit: number }>({
      async queryFn({ ids, nextDataSampleId = undefined, limit = 1000 }, { getState }) {
        const api = await medTechApi(getState)
        if (api === undefined) {
          throw new Error('No medTechApi available')
        }
        const { dataSampleApi, dataOwnerApi } = api
        const user = currentUser(getState)
        if (!user) {
          throw new Error('No user set')
        }
        return guard([dataSampleApi, dataOwnerApi], async () => {
          const dataOwner = dataOwnerApi.getDataOwnerIdOf(new User(user))
          const paginatedList = await dataSampleApi.filterDataSample(await new DataSampleFilter(api).forDataOwner(dataOwner).byIds(ids).build(), nextDataSampleId, limit)
          return PaginatedList.toJSON(paginatedList, (d) => d.toJSON())
        })
      },
      providesTags: (result) => result?.rows?.map(({ id }) => ({ type: 'DataSample', id })) ?? [],
    }),
    createOrUpdateDataSample: builder.mutation<IDataSample, IDataSample>({
      async queryFn(dataSample, { getState }) {
        const api = await medTechApi(getState)
        if (api === undefined) {
          throw new Error('No medTechApi available')
        }
        const { dataSampleApi, dataOwnerApi } = api
        const user = currentUser(getState)
        if (!user) {
          throw new Error('No user set')
        }
        return guard([dataSampleApi, dataOwnerApi], async () => {
          const dataOwner = dataOwnerApi.getDataOwnerIdOf(new User(user))
          return (await dataSampleApi.createOrModifyDataSampleFor(dataOwner, new DataSample(dataSample))).toJSON()
        })
      },
      invalidatesTags: (ds) => (ds ? [{ type: 'DataSample', id: ds.id }] : []),
    }),
    deleteDataSamples: builder.mutation<string[], IDataSample[]>({
      async queryFn(dataSamples, { getState }) {
        console.log('dataSamples to delete', dataSamples)

        const api = await medTechApi(getState)
        if (api === undefined) {
          throw new Error('No medTechApi available')
        }
        const { dataSampleApi, dataOwnerApi } = api
        return guard([dataSampleApi, dataOwnerApi], async () => {
          const groupedDataSamples: { [batchId: string]: string[] } = dataSamples.reduce((acc, dataSample) => {
            if (dataSample.batchId && dataSample.id) {
              acc[dataSample.batchId] = [...(acc[dataSample.batchId] ?? []), dataSample.id]
            }
            return acc
          }, {} as { [batchId: string]: string[] })

          Object.values(groupedDataSamples).forEach((ids) => {
            console.log('ids', ids)
          })

          return (await Promise.all(Object.values(groupedDataSamples).map((ids) => dataSampleApi.deleteDataSamples(ids)))).flatMap((x) => x).filter((x) => x !== undefined)
        })
      },
      invalidatesTags: (result) => result?.map((id) => ({ type: 'DataSample', id })) ?? [],
    }),
    createOrUpdateDataSamples: builder.mutation<IDataSample[], IDataSample[]>({
      async queryFn(dataSamples, { getState }) {
        console.log('createOrUpdateDataSamples', dataSamples)

        const api = await medTechApi(getState)
        if (api === undefined) {
          throw new Error('No medTechApi available')
        }
        console.log('createOrUpdateDataSamples: api check')
        const { dataSampleApi, dataOwnerApi } = api
        const user = currentUser(getState)
        if (!user) {
          throw new Error('No user set')
        }
        console.log('createOrUpdateDataSamples: user check', user)
        return guard([dataSampleApi, dataOwnerApi], async () => {
          try {
            const dataOwner = dataOwnerApi.getDataOwnerIdOf(new User(user))
            console.log('dataOwner', dataOwner)
            const updatedDss = await dataSampleApi
              .createOrModifyDataSamplesFor(
                dataOwner,
                dataSamples.map((d) => new DataSample(d)),
              )
              .then((samples) => samples.map((d) => d.toJSON()))
            console.log('updatedDss', updatedDss)
            return updatedDss
          } catch (e) {
            console.error('Error', e)
            throw e
          }
        })
      },
      invalidatesTags: (dataSamples) => dataSamples?.map((ds) => ({ type: 'DataSample', id: ds.id })) ?? [],
    }),
    getDataSampleBetween2Dates: builder.query<
      IPaginatedList<IDataSample>,
      { tagCodes: { tagType?: string; tagCode?: string; codeType?: string; codeCode?: string }[]; startDate: number; endDate: number; nextDataSampleId?: string; limit?: number }
    >({
      async queryFn({ tagCodes, startDate, endDate, nextDataSampleId = undefined, limit = 1000 }, { getState }) {
        const api = await medTechApi(getState)
        if (api === undefined) {
          throw new Error('No medTechApi available')
        }
        const { dataSampleApi, dataOwnerApi } = api
        const user = currentUser(getState)
        if (!user) {
          throw new Error('No user set')
        }
        return guard([dataSampleApi, dataOwnerApi], async () => {
          const dataOwner = dataOwnerApi.getDataOwnerIdOf(new User(user))
          const tagCodesFilters = await Promise.all(
            tagCodes.map(async ({ tagType, tagCode, codeType, codeCode }) =>
              new DataSampleFilter(api).forDataOwner(dataOwner).byLabelCodeDateFilter(tagType, tagCode, codeType, codeCode, startDate, endDate).build(),
            ),
          )

          const unionFilter = FilterComposition.union(...tagCodesFilters)
          try {
            return PaginatedList.toJSON(await dataSampleApi.filterDataSample(unionFilter, nextDataSampleId, limit), (d) => d.toJSON())
          } catch (e) {
            console.error('Error filterDataSample', e)
            throw e
          }
        })
      },
      providesTags: (result) => result?.rows?.map(({ id }) => ({ type: 'DataSample', id })) ?? [],
    }),
    getDataSampleByTagType: builder.query<IPaginatedList<IDataSample>, { tagType: string; tagCode: string; nextDataSampleId?: string; limit?: number }>({
      async queryFn({ tagType, tagCode, nextDataSampleId = undefined, limit = 1000 }, { getState }) {
        const api = await medTechApi(getState)
        if (api === undefined) {
          throw new Error('No medTechApi available')
        }
        const { dataSampleApi, dataOwnerApi } = api
        const user = currentUser(getState)
        if (!user) {
          throw new Error('No user set')
        }
        return guard([dataSampleApi, dataOwnerApi], async () => {
          const dataOwner = dataOwnerApi.getDataOwnerIdOf(new User(user))
          return PaginatedList.toJSON(
            await dataSampleApi.filterDataSample(
              await new DataSampleFilter(api).forDataOwner(dataOwner).byLabelCodeDateFilter(tagType, tagCode, undefined, undefined, undefined, undefined).build(),
              nextDataSampleId,
              limit,
            ),
            (d) => d.toJSON(),
          )
        })
      },
      providesTags: (result) => result?.rows?.map(({ id }) => ({ type: 'DataSample', id })) ?? [],
    }),
  }),
})

export const {
  useGetDataSamplesQuery,
  useGetDataSampleBetween2DatesQuery,
  useGetDataSampleByTagTypeQuery,
  useCreateOrUpdateDataSampleMutation,
  useCreateOrUpdateDataSamplesMutation,
  useDeleteDataSamplesMutation,
} = dataSampleApiRtk
