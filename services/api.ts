import {AnonymousMedTechApi, AnonymousMedTechApiBuilder, ICURE_CLOUD_URL, MedTechApi, MedTechApiBuilder, MSG_GW_CLOUD_URL, User, ua2b64} from '@icure/medical-device-sdk';
import crypto from '@icure/icure-react-native-crypto';
import {createAsyncThunk, createSlice, PayloadAction} from '@reduxjs/toolkit';
import {AuthenticationProcess} from '@icure/medical-device-sdk/src/models/AuthenticationProcess';
import {setSavedCredentials} from '../config/PetraState';
import Config from 'react-native-config';
import {FetchBaseQueryError} from '@reduxjs/toolkit/query';
import storage from '../utils/storage';

const apiCache: {[key: string]: MedTechApi | AnonymousMedTechApi} = {};

export interface MedTechApiState {
  email?: string;
  token?: string;
  user?: User;
  keyPair?: {publicKey: string; privateKey: string};
  authProcess?: AuthenticationProcess;
  online: boolean;
  invalidEmail: boolean;
  invalidToken: boolean;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: number;
  mobilePhone?: string;
}

const initialState: MedTechApiState = {
  email: undefined,
  token: undefined,
  user: undefined,
  keyPair: undefined,
  authProcess: undefined,
  online: false,
  invalidEmail: false,
  invalidToken: false,
  firstName: undefined,
  lastName: undefined,
  dateOfBirth: undefined,
  mobilePhone: undefined,
};

export const medTechApi = async (getState: () => unknown) => {
  const state = getState() as {medTechApi: MedTechApiState};
  return await getApiFromState(() => state);
};

export const currentUser = (getState: () => unknown) => {
  const state = getState() as {medTechApi: MedTechApiState};
  return state.medTechApi.user;
};

export const guard = async <T>(guardedInputs: unknown[], lambda: () => Promise<T>): Promise<{error: FetchBaseQueryError} | {data: T}> => {
  if (guardedInputs.some(x => !x)) {
    return {data: undefined};
  }
  try {
    const res = await lambda();
    // const curate = (result: T): T => {
    //   return (result === null || result === undefined ? null : Array.isArray(result) ? result.map(curate) : typeof result === 'object' ? (result as any).marshal() : result) as T;
    // };
    const curate = (result: T): T => {
      return (
        result === null || result === undefined
          ? null
          : res instanceof ArrayBuffer
          ? ua2b64(res)
          : Array.isArray(result)
          ? result.map(curate)
          : typeof result === 'object'
          ? (result as any).marshal()
          : result
      ) as T;
    };
    return {data: curate(res)};
  } catch (e) {
    return {error: getError(e as Error)};
  }
};

function getError(e: Error): FetchBaseQueryError {
  return {status: 'CUSTOM_ERROR', error: e.message, data: undefined};
}

export const getApiFromState = async (getState: () => MedTechApiState | {medTechApi: MedTechApiState} | undefined): Promise<MedTechApi | undefined> => {
  const state = getState();
  if (!state) {
    throw new Error('No state found');
  }
  const medTechApiState = 'medTechApi' in state ? state.medTechApi : state;
  const {user} = medTechApiState;

  if (!user) {
    return undefined;
  }

  const cachedApi = apiCache[`${user.groupId}/${user.id}`] as MedTechApi;

  return cachedApi;
};

export const startAuthentication = createAsyncThunk('medTechApi/startAuthentication', async (_payload, {getState}) => {
  const {
    medTechApi: {email, firstName, lastName},
  } = getState() as {medTechApi: MedTechApiState};

  if (!email) {
    throw new Error('No email provided');
  }

  console.log('startAuthentication', email);

  const anonymousApi = await new AnonymousMedTechApiBuilder()
    .withCrypto(crypto)
    .withICureBaseUrl(`${ICURE_CLOUD_URL}/rest/v1`)
    .withMsgGwUrl(MSG_GW_CLOUD_URL)
    .withMsgGwSpecId(Config.REACT_APP_MSGGW_SPEC_ID!)
    .withAuthProcessByEmailId(Config.REACT_APP_AUTH_PROCESS_BY_EMAIL_ID!)
    .withAuthProcessBySmsId(Config.REACT_APP_AUTH_PROCESS_BY_EMAIL_ID!)
    .withStorage(storage)
    .preventCookieUsage()
    .build();

  console.log('medTechApi built');

  const authProcess = await anonymousApi.authenticationApi.startAuthentication(Config.REACT_APP_RECAPTCHA!, email, undefined, firstName, lastName, Config.REACT_APP_PETRA_HCP);

  console.log('authProcess', authProcess);

  apiCache[`${authProcess.login}/${authProcess.requestId}`] = anonymousApi;

  return authProcess;
});

export const completeAuthentication = createAsyncThunk('medTechApi/completeAuthentication', async (_payload, {getState, dispatch}) => {
  const {
    medTechApi: {authProcess, token},
  } = getState() as {medTechApi: MedTechApiState};

  if (!authProcess) {
    throw new Error('No authProcess provided');
  }

  if (!token) {
    throw new Error('No token provided');
  }

  const anonymousApi = apiCache[`${authProcess.login}/${authProcess.requestId}`] as AnonymousMedTechApi;
  const result = await anonymousApi.authenticationApi.completeAuthentication(authProcess, token, () => anonymousApi.generateRSAKeypair());
  const api = result.medTechApi;
  const user = await api.userApi.getLoggedUser();

  apiCache[`${result.groupId}/${result.userId}`] = api;
  delete apiCache[`${authProcess.login}/${authProcess.requestId}`];

  dispatch(setSavedCredentials({login: `${result.groupId}/${result.userId}`, token: result.token, tokenTimestamp: +Date.now()}));

  return user?.marshal();
});

export const login = createAsyncThunk('medTechApi/login', async (_, {getState}) => {
  console.log('login');
  const {
    medTechApi: {email, token},
  } = getState() as {medTechApi: MedTechApiState};

  if (!email) {
    throw new Error('No email provided');
  }

  if (!token) {
    throw new Error('No token provided');
  }

  const api = await new MedTechApiBuilder()
    .withCrypto(crypto)
    .withICureBaseUrl(`${ICURE_CLOUD_URL}/rest/v1`)
    .withMsgGwUrl(MSG_GW_CLOUD_URL)
    .withMsgGwSpecId(Config.REACT_APP_MSGGW_SPEC_ID!)
    .withAuthProcessByEmailId(Config.REACT_APP_AUTH_PROCESS_BY_EMAIL_ID!)
    .withAuthProcessBySmsId(Config.REACT_APP_AUTH_PROCESS_BY_EMAIL_ID!)
    .withStorage(storage)
    .preventCookieUsage()
    .withUserName(email)
    .withPassword(token)
    .build();
  const userKeyPair = await api.initUserCrypto();
  const user = await api.userApi.getLoggedUser();
  await api.addKeyPair(api.dataOwnerApi.getDataOwnerIdOf(user), userKeyPair[0]);

  apiCache[`${user.groupId}/${user.id}`] = api;

  return user?.marshal();
});

export const logout = createAsyncThunk('medTechApi/logout', async (payload, {getState, dispatch}) => {
  dispatch(setSavedCredentials(undefined));
  dispatch(resetCredentials());
});

export const api = createSlice({
  name: 'medTechApi',
  initialState,
  reducers: {
    setEmail: (state, {payload: {email}}: PayloadAction<{email: string}>) => {
      state.email = email;
      state.invalidEmail = false;
    },
    setToken: (state, {payload: {token}}: PayloadAction<{token: string}>) => {
      state.token = token;
      state.invalidToken = false;
    },
    setAuthProcess: (state, {payload: {authProcess}}: PayloadAction<{authProcess: AuthenticationProcess}>) => {
      state.authProcess = authProcess;
    },
    setUser: (state, {payload: {user}}: PayloadAction<{user: User}>) => {
      state.user = user;
    },
    setRegistrationInformation: (state, {payload: {firstName, lastName, email}}: PayloadAction<{firstName: string; lastName: string; email: string}>) => {
      state.firstName = firstName;
      state.lastName = lastName;
      state.email = email;
    },
    resetCredentials(state) {
      state.online = false;
      state.invalidToken = false;
      state.invalidEmail = false;

      delete state.firstName;
      delete state.lastName;
      delete state.email;
      delete state.user;
      delete state.token;
      delete state.keyPair;
      delete state.dateOfBirth;
      delete state.mobilePhone;
      delete state.authProcess;
    },
  },
  extraReducers: builder => {
    builder.addCase(startAuthentication.fulfilled, (state, {payload: authProcess}) => {
      state.authProcess = authProcess;
    });
    builder.addCase(completeAuthentication.fulfilled, (state, {payload: user}) => {
      state.user = user as User;
      state.online = true;
    });
    builder.addCase(startAuthentication.rejected, (state, {}) => {
      state.invalidEmail = true;
    });
    builder.addCase(completeAuthentication.rejected, (state, {}) => {
      state.invalidToken = true;
    });
    builder.addCase(login.fulfilled, (state, {payload: user}) => {
      state.user = user as User;
      state.online = true;
    });
    builder.addCase(login.rejected, (state, {}) => {
      state.invalidToken = true;
      state.online = false;
    });
  },
});

export const {setEmail, setToken, setAuthProcess, setUser, setRegistrationInformation, resetCredentials} = api.actions;
