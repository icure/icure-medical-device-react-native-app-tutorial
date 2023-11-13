import {AnonymousMedTechApi, AnonymousMedTechApiBuilder, ICURE_CLOUD_URL, MedTechApi, MedTechApiBuilder, MSG_GW_CLOUD_URL, User, ua2b64} from '@icure/medical-device-sdk';
import crypto from '@icure/icure-react-native-crypto';
import {createAsyncThunk, createSlice, PayloadAction} from '@reduxjs/toolkit';
import {AuthenticationProcess} from '@icure/medical-device-sdk/src/models/AuthenticationProcess';
import {revertAll, setSavedCredentials} from '../config/PetraState';
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
  recaptcha?: string;
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
  recaptcha: undefined,
};

export const medTechApi = async (getState: () => unknown) => {
  const state = getState() as {medTechApi: MedTechApiState};
  return await getApiFromState(() => state);
};

export const currentUser = (getState: () => unknown) => {
  const state = getState() as {medTechApi: MedTechApiState};
  return state.medTechApi.user;
};

export const guard = async <T>(guardedInputs: unknown[], lambda: () => Promise<T>): Promise<{error: FetchBaseQueryError} | {data: T|undefined}> => {
  if (guardedInputs.some(x => !x)) {
    return {data: undefined};
  }
  try {
    const res = await lambda();
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
    medTechApi: {email, firstName, lastName, recaptcha},
  } = getState() as {medTechApi: MedTechApiState};

  if (!email) {
    throw new Error('No email provided');
  }

  const anonymousApi = await new AnonymousMedTechApiBuilder()
    .withCrypto(crypto)
    .withMsgGwSpecId(Config.EXTERNAL_SERVICES_SPEC_ID!)
    .withAuthProcessByEmailId(Config.EMAIL_AUTHENTICATION_PROCESS_ID!)
    .withStorage(storage)
    .preventCookieUsage()
    .build();

  const recaptchaType = 'friendly-captcha';

  const authProcess = await anonymousApi.authenticationApi.startAuthentication(
    recaptcha,
    email,
    undefined,
    firstName,
    lastName,
    Config.PARENT_ORGANISATION_ID,
    undefined,
    undefined,
    recaptchaType,
  );

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
  const result = await anonymousApi.authenticationApi.completeAuthentication(authProcess, token);
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
    .withMsgGwSpecId(Config.EXTERNAL_SERVICES_SPEC_ID!)
    .withAuthProcessByEmailId(Config.EMAIL_AUTHENTICATION_PROCESS_ID!)
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
  dispatch(revertAll());
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
    },
    setRecaptcha: (state, {payload: {recaptcha}}: PayloadAction<{recaptcha: string}>) => {
      state.recaptcha = recaptcha;
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

export const {setEmail, setToken, setAuthProcess, setUser, setRegistrationInformation, resetCredentials, setRecaptcha} = api.actions;
