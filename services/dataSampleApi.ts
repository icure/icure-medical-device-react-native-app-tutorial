import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react';
import {currentUser, guard, medTechApi} from './api';
import {DataSample, DataSampleFilter, FilterComposition, PaginatedList} from '@icure/medical-device-sdk';

export const dataSampleApiRtk = createApi({
  reducerPath: 'dataSampleApi',
  tagTypes: ['DataSample'],
  baseQuery: fetchBaseQuery({
    baseUrl: '/rest/v1/dataSample',
  }),
  endpoints: builder => ({
    getDataSamples: builder.query<PaginatedList<DataSample>, {ids: string[]; nextDataSampleId?: string; limit: number}>({
      async queryFn({ids, nextDataSampleId = undefined, limit = 1000}, {getState}) {
        const api = await medTechApi(getState);
        if (api === undefined) {
          throw new Error('No medTechApi available');
        }
        const {dataSampleApi, dataOwnerApi} = api;
        const user = currentUser(getState)!;
        return guard([dataSampleApi, dataOwnerApi], async () => {
          const dataOwner = dataOwnerApi.getDataOwnerIdOf(user);
          const paginatedList = await dataSampleApi.filterDataSample(await new DataSampleFilter(api).forDataOwner(dataOwner).byIds(ids).build(), nextDataSampleId, limit);
          return PaginatedList.toJSON(paginatedList, DataSample.fromJSON);
        });
      },
      providesTags: result => result?.rows?.map(({id}) => ({type: 'DataSample', id})) ?? [],
    }),
    createOrUpdateDataSample: builder.mutation<DataSample, DataSample>({
      async queryFn(dataSample, {getState}) {
        const api = await medTechApi(getState);
        if (api === undefined) {
          throw new Error('No medTechApi available');
        }
        const {dataSampleApi, dataOwnerApi} = api;
        const user = currentUser(getState)!;
        return guard([dataSampleApi, dataOwnerApi], async () => {
          const dataOwner = dataOwnerApi.getDataOwnerIdOf(user);
          return DataSample.toJSON(await dataSampleApi.createOrModifyDataSampleFor(dataOwner, dataSample));
        });
      },
      invalidatesTags: ds => (ds ? [{type: 'DataSample', id: ds.id}] : []),
    }),
    deleteDataSamples: builder.mutation<string[], DataSample[]>({
      async queryFn(dataSamples, {getState}) {

        console.log('dataSamples to delete', dataSamples);

        const api = await medTechApi(getState);
        if (api === undefined) {
          throw new Error('No medTechApi available');
        }
        const {dataSampleApi, dataOwnerApi} = api;
        return guard([dataSampleApi, dataOwnerApi], async () => {
          const groupedDataSamples: {[batchId: string]: string[]} = dataSamples.reduce((acc, dataSample) => {
            if (dataSample.batchId && dataSample.id) {
              acc[dataSample.batchId] = [...(acc[dataSample.batchId] ?? []), dataSample.id];
            }
            return acc;
          }, {} as {[batchId: string]: string[]});

          Object.values(groupedDataSamples).forEach(ids => {
            console.log('ids', ids);
          });

          return (await Promise.all(Object.values(groupedDataSamples).map(ids => dataSampleApi.deleteDataSamples(ids)))).flatMap(x => x).filter(x => x !== undefined);
        });
      },
      invalidatesTags: result => result?.map(id => ({type: 'DataSample', id})) ?? [],
    }),
    createOrUpdateDataSamples: builder.mutation<DataSample[], DataSample[]>({
      async queryFn(dataSamples, {getState}) {
        console.log('createOrUpdateDataSamples', dataSamples);

        const api = await medTechApi(getState);
        if (api === undefined) {
          throw new Error('No medTechApi available');
        }
        console.log('createOrUpdateDataSamples: api check');
        const {dataSampleApi, dataOwnerApi} = api;
        const user = currentUser(getState)!;
        console.log('createOrUpdateDataSamples: user check', user);
        return guard([dataSampleApi, dataOwnerApi], async () => {
          try {
            const dataOwner = dataOwnerApi.getDataOwnerIdOf(user);
            console.log('dataOwner', dataOwner);
            const updatedDss = await dataSampleApi.createOrModifyDataSamplesFor(dataOwner, dataSamples).then(samples => samples.map(DataSample.toJSON));
            console.log('updatedDss', updatedDss);
            return updatedDss;
          } catch (e) {
            console.error('Error', e);
            throw e;
          }
        });
      },
      invalidatesTags: dataSamples => dataSamples?.map(ds => ({type: 'DataSample', id: ds.id})) ?? [],
    }),
    getDataSampleBetween2Dates: builder.query<
      PaginatedList<DataSample>,
      {tagCodes: {tagType?: string; tagCode?: string; codeType?: string; codeCode?: string}[]; startDate: number; endDate: number; nextDataSampleId?: string; limit?: number}
    >({
      async queryFn({tagCodes, startDate, endDate, nextDataSampleId = undefined, limit = 1000}, {getState}) {
        const api = await medTechApi(getState);
        if (api === undefined) {
          throw new Error('No medTechApi available');
        }
        const {dataSampleApi, dataOwnerApi} = api;
        const user = currentUser(getState)!;
        return guard([dataSampleApi, dataOwnerApi], async () => {
          const dataOwner = dataOwnerApi.getDataOwnerIdOf(user);
          const tagCodesFilters = await Promise.all(
            tagCodes.map(async ({tagType, tagCode, codeType, codeCode}) =>
              new DataSampleFilter(api).forDataOwner(dataOwner).byLabelCodeDateFilter(tagType, tagCode, codeType, codeCode, startDate, endDate).build(),
            ),
          );

          const unionFilter = FilterComposition.union(...tagCodesFilters);
          try {
            return await dataSampleApi.filterDataSample(unionFilter, nextDataSampleId, limit).then(p => PaginatedList.toJSON(p, DataSample.toJSON));
          } catch (e) {
            console.error('Error filterDataSample', e);
            throw e;
          }
        });
      },
      providesTags: result => result?.rows?.map(({id}) => ({type: 'DataSample', id})) ?? [],
    }),
    getDataSampleByTagType: builder.query<PaginatedList<DataSample>, {tagType: string; tagCode: string; nextDataSampleId?: string; limit?: number}>({
      async queryFn({tagType, tagCode, nextDataSampleId = undefined, limit = 1000}, {getState}) {
        const api = await medTechApi(getState);
        if (api === undefined) {
          throw new Error('No medTechApi available');
        }
        const {dataSampleApi, dataOwnerApi} = api;
        const user = currentUser(getState)!;
        return guard([dataSampleApi, dataOwnerApi], async () => {
          const dataOwner = dataOwnerApi.getDataOwnerIdOf(user);
          return await dataSampleApi
            .filterDataSample(
              await new DataSampleFilter(api).forDataOwner(dataOwner).byLabelCodeDateFilter(tagType, tagCode, undefined, undefined, undefined, undefined).build(),
              nextDataSampleId,
              limit,
            )
            .then(p => PaginatedList.toJSON(p, DataSample.fromJSON));
        });
      },
      providesTags: result => result?.rows?.map(({id}) => ({type: 'DataSample', id})) ?? [],
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
