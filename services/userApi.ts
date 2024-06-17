import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import { User } from '@icure/medical-device-sdk'
import { guard, medTechApi, currentUser, setUser } from './api'
import { IUser } from '@icure/typescript-common/models/User.model'

export const userApiRtk = createApi({
  reducerPath: 'userApi',
  tagTypes: ['User'],
  baseQuery: fetchBaseQuery({
    baseUrl: '/rest/v2/user',
  }),
  endpoints: (builder) => ({
    getUser: builder.query<IUser, string>({
      async queryFn(id, { getState }) {
        const api = await medTechApi(getState)
        if (api === undefined) {
          throw new Error('No medTechApi available')
        }
        const { userApi } = api
        return guard([userApi], async () => {
          return (await userApi.getUser(id)).toJSON()
        })
      },
      providesTags: ['User'],
    }),
    updateUser: builder.mutation<IUser, IUser>({
      async queryFn(user, { getState, dispatch }) {
        const api = await medTechApi(getState)
        if (api === undefined) {
          throw new Error('No medTechApi available')
        }
        const { userApi } = api
        return guard([userApi], async () => {
          const updatedUser = (await userApi.createOrModifyUser(new User(user))).toJSON()
          if (user.id === currentUser(getState)?.id) {
            dispatch(setUser({ user: updatedUser }))
          }
          return updatedUser
        })
      },
      invalidatesTags: ['User'],
    }),
    shareDataWith: builder.mutation<IUser, { ids: string[] }>({
      async queryFn({ ids }, { getState, dispatch }) {
        const api = await medTechApi(getState)
        if (api === undefined) {
          throw new Error('No medTechApi available')
        }
        const { userApi } = api
        return guard([userApi], async () => {
          const updatedUser = (await userApi.shareAllFutureDataWith(ids, 'medicalInformation')).toJSON()
          dispatch(setUser({ user: updatedUser }))
          return updatedUser
        })
      },
      invalidatesTags: [{ type: 'User', id: 'all' }],
    }),
    stopSharingWith: builder.mutation<IUser, { ids: string[] }>({
      async queryFn({ ids }, { getState, dispatch }) {
        const api = await medTechApi(getState)
        if (api === undefined) {
          throw new Error('No medTechApi available')
        }
        const { userApi } = api
        return guard([userApi], async () => {
          const updatedUser = (await userApi.stopSharingDataWith(ids, 'medicalInformation')).toJSON()
          dispatch(setUser({ user: updatedUser }))
          return updatedUser
        })
      },
      invalidatesTags: ['User'],
    }),
  }),
})

export const { useGetUserQuery, useUpdateUserMutation, useShareDataWithMutation, useStopSharingWithMutation } = userApiRtk
