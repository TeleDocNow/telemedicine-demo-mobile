import { takeEvery, call, put, all } from 'redux-saga/effects';
import { NavigationActions } from 'react-navigation';

import { makePost } from 'utils/request';
import { showModal, showPreloader, hidePreloader } from 'containers/App/actions';
import { signUp, signUpSuccess, signUpFailed } from './actions';

function* onSignUp({ payload }) {
    yield put(showPreloader());
    try {
        yield call(makePost, '/td/signup/', payload.values);
        yield put(signUpSuccess());
    } catch (err) {
        yield put(signUpFailed(err.data));
    }
}

function* onSignUpSuccess() {
    yield put(hidePreloader());
    yield put(NavigationActions.navigate({ routeName: 'Login' }));
    yield put(showModal('You\'ve successfully registered.'));
}

function* onSignUpFailed({ payload }) {
    yield put(hidePreloader());
    yield put(showModal(payload.error.msg));
}

export default function* signUpSaga() {
    yield all([
        takeEvery(signUp, onSignUp),
        takeEvery(signUpSuccess, onSignUpSuccess),
        takeEvery(signUpFailed, onSignUpFailed),
    ]);
}
