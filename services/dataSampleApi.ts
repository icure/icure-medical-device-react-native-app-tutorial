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
          throw new Error('MedTechApi in unavailable')
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
    deleteDataSamples: builder.mutation<string[], IDataSample[]>({
      async queryFn(dataSamples, { getState }) {
        const api = await medTechApi(getState)
        if (api === undefined) {
          throw new Error('MedTechApi in unavailable')
        }
        const { dataSampleApi, dataOwnerApi } = api
        return guard([dataSampleApi, dataOwnerApi], async () => {
          const groupedDataSamples: { [batchId: string]: string[] } = dataSamples.reduce((acc, dataSample) => {
            if (dataSample.batchId && dataSample.id) {
              acc[dataSample.batchId] = [...(acc[dataSample.batchId] ?? []), dataSample.id]
            }
            return acc
          }, {} as { [batchId: string]: string[] })

          return (await Promise.all(Object.values(groupedDataSamples).map((ids) => dataSampleApi.deleteDataSamples(ids)))).flatMap((x) => x).filter((x) => x !== undefined)
        })
      },
      invalidatesTags: (result: string[] | undefined) => result?.map((id) => ({ type: 'DataSample', id })) ?? [],
    }),
    createOrUpdateDataSamples: builder.mutation<IDataSample[], IDataSample[]>({
      async queryFn(dataSamples, { getState }) {
        const api = await medTechApi(getState)
        if (api === undefined) {
          throw new Error('MedTechApi in unavailable')
        }
        const { dataSampleApi, dataOwnerApi } = api
        const user = currentUser(getState)
        if (!user) {
          throw new Error('No user set')
        }
        return guard([dataSampleApi, dataOwnerApi], async () => {
          try {
            // TODO: is the dataOwner correct?
            const dataOwner = dataOwnerApi.getDataOwnerIdOf(new User(user))

            const res = await Promise.all(
              await dataSampleApi.createOrModifyDataSamplesFor(
                dataOwner,
                dataSamples.map((ds) => new DataSample(ds)),
              ),
            )
            return res.map((ds) => ds.toJSON())
          } catch (e) {
            console.error('Custom Error:', e)
            throw e
          }
        })
      },
      invalidatesTags: (res: IDataSample[] | undefined) => {
        return res?.length
          ? [
              { type: 'DataSample', id: 'all' },
              ...res.map((ds) => {
                return {
                  type: 'DataSample',
                  id: ds.id,
                } as { type: 'DataSample'; id: string }
              }),
            ]
          : []
      },
    }),
    getDataSampleBetween2Dates: builder.query<
      IPaginatedList<IDataSample>,
      { tagCodes: { tagType?: string; tagCode?: string; codeType?: string; codeCode?: string }[]; startDate: number; endDate: number; nextDataSampleId?: string; limit?: number }
    >({
      async queryFn({ tagCodes, startDate, endDate, nextDataSampleId = undefined, limit = 1000 }, { getState }) {
        const api = await medTechApi(getState)
        if (api === undefined) {
          throw new Error('MedTechApi in unavailable')
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
            const result = await dataSampleApi.filterDataSample(unionFilter, nextDataSampleId, limit)
            return PaginatedList.toJSON(result, (d) => d.toJSON())
          } catch (e) {
            console.error('Error in getDataSampleBetween2Dates:', e)
            throw e
          }
        })
      },
      providesTags: (res) =>
        res
          ? [
              { type: 'DataSample', id: 'all' },
              ...res.rows.map((ds) => {
                return {
                  type: 'DataSample',
                  id: ds.id,
                } as { type: 'DataSample'; id: string }
              }),
            ]
          : [{ type: 'DataSample', id: 'all' }],
    }),
    getDataSampleByTagType: builder.query<IPaginatedList<IDataSample>, { tagType: string; tagCode: string; nextDataSampleId?: string; limit?: number }>({
      async queryFn({ tagType, tagCode, nextDataSampleId = undefined, limit = 1000 }, { getState }) {
        const api = await medTechApi(getState)
        if (api === undefined) {
          throw new Error('MedTechApi in unavailable')
        }
        const { dataSampleApi, dataOwnerApi } = api
        const user = currentUser(getState)
        if (!user) {
          throw new Error('No user set')
        }
        return guard([dataSampleApi, dataOwnerApi], async () => {
          const dataOwner = dataOwnerApi.getDataOwnerIdOf(new User(user))
          try {
            const result = await dataSampleApi.filterDataSample(
              await new DataSampleFilter(api).forDataOwner(dataOwner).byLabelCodeDateFilter(tagType, tagCode, undefined, undefined, undefined, undefined).build(),
              nextDataSampleId,
              limit,
            )

            return PaginatedList.toJSON(result, (d) => d.toJSON())
          } catch (e) {
            console.error('Error in getDataSampleByTagType:', e)
            throw e
          }
        })
      },
      providesTags: (res) =>
        res
          ? [
              { type: 'DataSample', id: 'all' },
              ...res.rows.map((ds) => {
                return {
                  type: 'DataSample',
                  id: ds.id,
                } as { type: 'DataSample'; id: string }
              }),
            ]
          : [{ type: 'DataSample', id: 'all' }],
    }),
  }),
})

export const { useGetDataSamplesQuery, useGetDataSampleBetween2DatesQuery, useGetDataSampleByTagTypeQuery, useCreateOrUpdateDataSamplesMutation, useDeleteDataSamplesMutation } =
  dataSampleApiRtk
