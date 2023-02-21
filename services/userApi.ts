import {createApi, fetchBaseQuery} from '@reduxjs/toolkit/query/react';
import {User} from '@icure/medical-device-sdk';
import {guard, medTechApi, currentUser, setUser} from './api';

export const userApiRtk = createApi({
  reducerPath: 'userApi',
  tagTypes: ['User'],
  baseQuery: fetchBaseQuery({
    baseUrl: '/rest/v1/user',
  }),
  endpoints: builder => ({
    getUser: builder.query<User, string>({
      async queryFn(id, {getState}) {
        const {userApi} = await medTechApi(getState);
        return guard([userApi], () => {
          return userApi.getUser(id);
        });
      },
      providesTags: ['User'],
    }),
    updateUser: builder.mutation<User, User>({
      async queryFn(user, {getState, dispatch}) {
        const {userApi} = await medTechApi(getState);
        return guard([userApi], async () => {
          const updatedUser = await userApi.createOrModifyUser(user);
          if (user.id === currentUser(getState)?.id) {
            dispatch(setUser({user: updatedUser.marshal() as User}));
          }
          return updatedUser;
        });
      },
      invalidatesTags: [{type: 'User', id: 'all'}],
    }),
    shareDataWith: builder.mutation<User, {ids: string[]}>({
      async queryFn({ids}, {getState, dispatch}) {
        const {userApi} = await medTechApi(getState);
        return guard([userApi], async () => {
          const updatedUser = await userApi.shareAllFutureDataWith(ids, 'medicalInformation');
          dispatch(setUser({user: updatedUser.marshal() as User}));
          return updatedUser;
        });
      },
      invalidatesTags: [{type: 'User', id: 'all'}],
    }),
    stopSharingWith: builder.mutation<User, {ids: string[]}>({
      async queryFn({ids}, {getState, dispatch}) {
        const {userApi} = await medTechApi(getState);
        return guard([userApi], async () => {
          const updatedUser = await userApi.stopSharingDataWith(ids, 'medicalInformation');
          dispatch(setUser({user: updatedUser.marshal() as User}));
          return updatedUser;
        });
      },
      invalidatesTags: [{type: 'User', id: 'all'}],
    }),
  }),
});

export const {useGetUserQuery, useUpdateUserMutation, useShareDataWithMutation, useStopSharingWithMutation} = userApiRtk;
