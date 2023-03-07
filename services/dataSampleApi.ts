import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react';
import {currentUser, guard, medTechApi} from './api';
import {DataSample, DataSampleFilter, PaginatedListDataSample} from '@icure/medical-device-sdk';
import {tagsByIds, tagsByIdsPaginated} from '../utils/tags';

export const dataSampleApiRtk = createApi({
  reducerPath: 'dataSampleApi',
  tagTypes: ['DataSample'],
  baseQuery: fetchBaseQuery({
    baseUrl: '/rest/v1/dataSample',
  }),
  endpoints: builder => ({
    getDataSamples: builder.query<PaginatedListDataSample, {ids: string[]; nextDataSampleId?: string; limit: number}>({
      async queryFn({ids, nextDataSampleId = undefined, limit = 1000}, {getState}) {
        const {dataSampleApi, dataOwnerApi} = await medTechApi(getState);
        const user = currentUser(getState);
        return guard([dataSampleApi, dataOwnerApi], async () => {
          const dataOwner = dataOwnerApi.getDataOwnerIdOf(user);
          return await dataSampleApi.filterDataSample(await new DataSampleFilter().forDataOwner(dataOwner).byIds(ids).build(), nextDataSampleId, limit);
        });
      },
      providesTags: tagsByIdsPaginated('DataSample', 'all'),
    }),
    createOrUpdateDataSample: builder.mutation<DataSample, DataSample>({
      async queryFn(dataSample, {getState}) {
        const {dataSampleApi, dataOwnerApi} = await medTechApi(getState);
        const user = currentUser(getState);
        return guard([dataSampleApi, dataOwnerApi], () => {
          const dataOwner = dataOwnerApi.getDataOwnerIdOf(user);
          return dataSampleApi.createOrModifyDataSampleFor(dataOwner, dataSample);
        });
      },
      invalidatesTags: ({id}) => [{type: 'DataSample', id}],
    }),
    deleteDataSamples: builder.mutation<string[], DataSample[]>({
      async queryFn(dataSamples, {getState}) {
        const {dataSampleApi, dataOwnerApi} = await medTechApi(getState);
        return guard([dataSampleApi, dataOwnerApi], async () => {
          const groupedDataSamples: {[batchId: string]: string[]} = dataSamples.reduce((acc, dataSample) => {
            if (dataSample.batchId && dataSample.id) {
              acc[dataSample.batchId] = [...(acc[dataSample.batchId] ?? []), dataSample.id];
            }
            return acc;
          }, {} as {[batchId: string]: string[]});
          return (await Promise.all(Object.values(groupedDataSamples).map(ids => dataSampleApi.deleteDataSamples(ids)))).flatMap(x => x);
        });
      },
      invalidatesTags: () => [{type: 'DataSample', id: 'all'}],
    }),
    createOrUpdateDataSamples: builder.mutation<DataSample[], DataSample[]>({
      async queryFn(dataSamples, {getState}) {
        const {dataSampleApi, dataOwnerApi} = await medTechApi(getState);
        const user = currentUser(getState);
        return guard([dataSampleApi, dataOwnerApi], () => {
          const dataOwner = dataOwnerApi.getDataOwnerIdOf(user);
          return dataSampleApi.createOrModifyDataSamplesFor(dataOwner, dataSamples);
        });
      },
      invalidatesTags: tagsByIds('DataSample', 'all'),
    }),
    getDataSampleBetween2Dates: builder.query<
      PaginatedListDataSample,
      {tagType: string; tagCode: string; startDate: number; endDate: number; nextDataSampleId?: string; limit?: number}
    >({
      async queryFn({tagType, tagCode, startDate, endDate, nextDataSampleId = undefined, limit = 1000}, {getState}) {
        const {dataSampleApi, dataOwnerApi} = await medTechApi(getState);
        const user = currentUser(getState);
        return guard([dataSampleApi, dataOwnerApi], async () => {
          const dataOwner = dataOwnerApi.getDataOwnerIdOf(user);
          return await dataSampleApi.filterDataSample(
            await new DataSampleFilter().forDataOwner(dataOwner).byLabelCodeFilter(tagType, tagCode, undefined, undefined, startDate, endDate).build(),
            nextDataSampleId,
            limit,
          );
        });
      },
      providesTags: tagsByIdsPaginated('DataSample', 'all'),
    }),
    getDataSampleByTagType: builder.query<PaginatedListDataSample, {tagType: string; tagCode: string; nextDataSampleId?: string; limit?: number}>({
      async queryFn({tagType, tagCode, nextDataSampleId = undefined, limit = 1000}, {getState}) {
        const {dataSampleApi, dataOwnerApi} = await medTechApi(getState);
        const user = currentUser(getState);
        return guard([dataSampleApi, dataOwnerApi], async () => {
          const dataOwner = dataOwnerApi.getDataOwnerIdOf(user);
          return await dataSampleApi.filterDataSample(
            await new DataSampleFilter().forDataOwner(dataOwner).byLabelCodeFilter(tagType, tagCode, undefined, undefined, undefined, undefined).build(),
            nextDataSampleId,
            limit,
          );
        });
      },
      providesTags: tagsByIdsPaginated('DataSample', 'all'),
    }),
  }),
});

export const {
  useGetDataSamplesQuery,
  useGetDataSampleBetween2DatesQuery,
  useGetDataSampleByTagTypeQuery,
  useCreateOrUpdateDataSampleMutation,
  useCreateOrUpdateDataSamplesMutation,
  useDeleteDataSamplesMutation,
} = dataSampleApiRtk;
