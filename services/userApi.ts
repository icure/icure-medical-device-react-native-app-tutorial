import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react';
import {User} from '@icure/medical-device-sdk';
import {guard, medTechApi, currentUser, setUser} from './api';

export const userApiRtk = createApi({
  reducerPath: 'userApi',
  tagTypes: ['User'],
  baseQuery: fetchBaseQuery({
    baseUrl: '/rest/v2/user',
  }),
  endpoints: builder => ({
    getUser: builder.query<User, string>({
      async queryFn(id, {getState}) {
        const api = await medTechApi(getState);
        if (api === undefined) {
          throw new Error('No medTechApi available');
        }
        const {userApi} = api;
        return guard([userApi], async () => {
          return User.toJSON(await userApi.getUser(id));
        });
      },
      providesTags: ['User'],
    }),
    updateUser: builder.mutation<User, User>({
      async queryFn(user, {getState, dispatch}) {
        const api = await medTechApi(getState);
        if (api === undefined) {
          throw new Error('No medTechApi available');
        }
        const {userApi} = api;
        return guard([userApi], async () => {
          const updatedUser = await userApi.createOrModifyUser(user);
          if (user.id === currentUser(getState)?.id) {
            dispatch(setUser({user: User.toJSON(updatedUser)}));
          }
          return User.toJSON(updatedUser);
        });
      },
      invalidatesTags: ['User'],
    }),
    shareDataWith: builder.mutation<User, {ids: string[]}>({
      async queryFn({ids}, {getState, dispatch}) {
        const api = await medTechApi(getState);
        if (api === undefined) {
          throw new Error('No medTechApi available');
        }
        const {userApi} = api;
        return guard([userApi], async () => {
          const updatedUser = await userApi.shareAllFutureDataWith(ids, 'medicalInformation');
          dispatch(setUser({user: User.toJSON(updatedUser)}));
          return User.toJSON(updatedUser);
        });
      },
      invalidatesTags: [{type: 'User', id: 'all'}],
    }),
    stopSharingWith: builder.mutation<User, {ids: string[]}>({
      async queryFn({ids}, {getState, dispatch}) {
        const api = await medTechApi(getState);
        if (api === undefined) {
          throw new Error('No medTechApi available');
        }
        const {userApi} = api;
        return guard([userApi], async () => {
          const updatedUser = await userApi.stopSharingDataWith(ids, 'medicalInformation');
          dispatch(setUser({user: User.toJSON(updatedUser)}));
          return User.toJSON(updatedUser);
        });
      },
      invalidatesTags: ['User'],
    }),
  }),
});

export const {useGetUserQuery, useUpdateUserMutation, useShareDataWithMutation, useStopSharingWithMutation} = userApiRtk;
