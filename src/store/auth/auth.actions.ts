import { LOGOUT, NEXT_VIEW, SIGN_IN, UPDATE_TOKEN } from './auth.constants';
import { ILoginData, INextView, ISignInPayload } from './auth.type';
import { IThunkType } from '../rootReducer';
import { refreshTokenAPI, sendRequest } from '../../apis';
import { IRegistration } from '../../types/apiDataTypes';

export const singIn = (payloadIn: ISignInPayload) => {
  return {
    type: SIGN_IN,
    payload: payloadIn,
  };
};

export const updateToken = (payloadIn: ISignInPayload) => {
  return {
    type: UPDATE_TOKEN,
    payload: payloadIn,
  };
};

export const logOut = () => {
  localStorage.removeItem('marine-farm');
  localStorage.removeItem('marine-farm-user_id');
  localStorage.removeItem('marine-farm-refresh');
  localStorage.setItem(
    'redux-local-tab-sync',
    JSON.stringify({ source: 'another tab', type: 'AUTH/LOGOUT' }),
  );
  return {
    type: LOGOUT,
  };
};

export const nextView = (value: INextView) => {
  return {
    type: NEXT_VIEW,
    payload: value,
  };
};

export const signUp = (data: IRegistration, type: string) => {
  return async (dispatch: IThunkType) => {
    let res;
    if (type === 'signUp') {
      res = await sendRequest(data, 'POST', 'api/auth/signup');
    }
    if (type === 'invite') {
      res = await sendRequest(data, 'POST', 'api/auth/signup-by-invitation');
    }
    if (type === 'forgotPassword') {
      res = await sendRequest(data, 'POST', 'api/password/create');
    }

    if (res?.status === 'Success') {
      dispatch(
        nextView({
          isSuccess: true,
          email: data?.email,
        }),
      );
    } else if (type === 'forgotPassword' && res?.status !== 'Error') {
      dispatch(
        nextView({
          isSuccess: true,
          email: data?.email,
        }),
      );
    } else if (type === 'invite' && res?.status === 'success') {
      dispatch(
        nextView({
          isSuccess: false,
          message: 'Success',
        }),
      );
    } else {
      dispatch(
        nextView({
          isSuccess: false,
          message: res?.message || res?.status,
        }),
      );
    }
  };
};

export const authLogin = (data: ILoginData) => {
  return async (dispatch: IThunkType) => {
    const res = await sendRequest(data, 'POST', 'api/auth/login', true);
    if (res?.status === 'Success') {
      localStorage.setItem('marine-farm', res?.data.access_token);
      localStorage.setItem('marine-farm-user_id', res?.user_id);
      if (data.remember) {
        localStorage.setItem('marine-farm-refresh', res?.data.refresh_token);
      }

      dispatch(
        singIn({
          isAuth: true,
          access_token: res?.data.access_token,
          refresh_token: res?.data.refresh_token,
          id: res?.user_id,
        }),
      );
    } else {
      dispatch(
        singIn({
          isAuth: false,
          message: res?.message,
        }),
      );
    }
  };
};

export const refreshToken = (data: any) => {
  return async (dispatch: IThunkType) => {
    const res = await refreshTokenAPI(data);
    if (res?.status === 'Success') {
      localStorage.setItem('marine-farm', res?.data.access_token);
      localStorage.setItem('marine-farm-refresh', res?.data.refresh_token);

      dispatch(
        updateToken({
          isAuth: true,
          access_token: res?.data.access_token,
          refresh_token: res?.data.refresh_token,
          id: res?.user_id,
        }),
      );
    } else {
      dispatch(logOut());
    }
  };
};
