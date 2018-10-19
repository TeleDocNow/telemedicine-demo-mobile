import { all, takeLatest, put, select, call } from 'redux-saga/effects';
import { makeGet } from 'utils/request';
import { selectApiToken } from 'containers/App/selectors';
import { showModal } from 'containers/Modal/actions';

import {
    fetchContacts,
    saveContactList,
} from './actions';

function flattenUserEntry({ username, displayName, voxImplantId }) {
    return {
        username,
        displayName,
        voxImplantId,
    };
}

function* onFetchContacts() {
    const apiToken = yield select(selectApiToken);
    try {
        const users = yield call(
            () => makeGet('/User/', {}, apiToken)
        );
        const contactList = users.entry.map((user) => flattenUserEntry(user.resource));
        yield put(saveContactList(contactList));
    } catch (err) {
        yield put(showModal(`Cannot fetch users list.\n${err.message}`));
    }
}

export default function* appSaga() {
    yield all([
        takeLatest(fetchContacts, onFetchContacts),
    ]);
}
