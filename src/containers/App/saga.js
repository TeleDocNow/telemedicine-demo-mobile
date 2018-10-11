import { AppState, Platform, PermissionsAndroid } from 'react-native';
import { eventChannel, delay } from 'redux-saga';
import { all, takeLatest, takeEvery, take, put, select, race } from 'redux-saga/effects';
import { NavigationActions } from 'react-navigation';
import { Voximplant } from 'react-native-voximplant';

import { showModal } from 'containers/Modal/actions';
import {
    logout,
    initApp,
    deinitApp,
    setActiveCall,
    savePushToken,

    pushNotificationReceived,
    incomingCallReceived,
    appStateChanged,
} from './actions';
import { selectActiveCall, selectPushToken } from './selectors';
import { createPushTokenChannel, createPushNotificationChannel } from './pushnotification';

function* onLogout() {
    const client = Voximplant.getInstance();

    try {
        yield client.disconnect();
    } catch (err) {
    }
    yield put(deinitApp());
    yield put(NavigationActions.navigate({ routeName: 'Login' }));
}

export function* requestPermissions(isVideo) {
    if (Platform.OS === 'android') {
        let permissions = [
            PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
        ];
        if (isVideo) {
            permissions.push(PermissionsAndroid.PERMISSIONS.CAMERA);
        }
        const granted = yield PermissionsAndroid.requestMultiple(permissions);
        const recordAudioGranted = granted['android.permission.RECORD_AUDIO'] === 'granted';
        if (recordAudioGranted) {
            if (isVideo) {
                const cameraGranted = granted['android.permission.CAMERA'] === 'granted';

                if (!cameraGranted) {
                    throw new Error('Camera permission is not granted');
                }
            }
        } else {
            throw new Error('Record audio permission is not granted');
        }
    }

    return true;
}

export function createCallChannel(activeCall) {
    return eventChannel((emit) => {
        const handler = (event) => {
            emit(event);
        };

        Object.keys(Voximplant.CallEvents)
            .forEach((eventName) => activeCall.on(eventName, handler));

        return () => {
            Object.keys(Voximplant.CallEvents)
                .forEach((eventName) => activeCall.off(eventName, handler));
        };
    });
}

function createIncomingCallChannel() {
    const client = Voximplant.getInstance();

    return eventChannel((emit) => {
        const incomingCallHandler = (event) => {
            emit(event.call);
        };
        client.on(Voximplant.ClientEvents.IncomingCall, incomingCallHandler);

        return () => {
            client.off(Voximplant.ClientEvents.IncomingCall, incomingCallHandler);
        };
    });
}

function createAppStateChangedChannel() {
    return eventChannel((emit) => {
        const handler = (newState) => {
            emit(newState);
        };
        AppState.addEventListener('change', handler);

        return () => {
            AppState.removeEventListener('change', handler);
        };
    });
}

function* onAppStateChanged({ payload: { newState } }) {
    console.log('Current app state changed to ' + newState);
    // if (this.currentAppState === 'active' && this.showIncomingCallScreen && this.call !== null) {
    //     NavigationService.navigate('IncomingCall', {
    //         callId: this.call.callId,
    //         isVideo: null,
    //         from: null,
    //     });
    // }
}

function* onInitApp() {
    const pushTokenChannel = yield createPushTokenChannel();
    const { pushToken } = yield race({
        pushToken: take(pushTokenChannel),
        // timeout: delay(5000),
    });
    if (pushToken) {
        yield put(savePushToken(pushToken));
        console.log('push token', pushToken);

        const client = Voximplant.getInstance();
        client.registerPushNotificationsToken(pushToken);
    } else {
        yield put(showModal('Cannot receive push token'));
    }
    pushTokenChannel.close();

    const pushNotificationChannel = createPushNotificationChannel();
    const incomingCallChannel = yield createIncomingCallChannel();
    const appStateChangedChannel = yield createAppStateChangedChannel();

    yield takeEvery(pushNotificationChannel, function* pushNotificationReceivedHandler(notification) {
        yield put(pushNotificationReceived(notification));
    });
    yield takeEvery(incomingCallChannel, function* incomingCallReceivedHandler(newIncomingCall) {
        yield put(incomingCallReceived(newIncomingCall));
    });
    yield takeEvery(appStateChangedChannel, function* appStateChangedHandler(newState) {
        yield put(appStateChanged(newState));
    });

    yield take(deinitApp);
    incomingCallChannel.close();
    appStateChangedChannel.close();
    pushNotificationChannel.close();
}

function* onDeinitApp() {
    const pushToken = yield select(selectPushToken);
    if (pushToken) {
        const client = Voximplant.getInstance();
        client.unregisterPushNotificationsToken(pushToken);
    }
}

function* onIncomingCallReceived({ payload }) {
    const { call } = payload;
    const activeCall = yield select(selectActiveCall);
    if (activeCall && activeCall.id !== call.id) {
        call.decline();
        yield put(showModal('You\'ve received one another call, but we declined it.'));
    } else {
        yield put(setActiveCall(call));
        yield put(NavigationActions.navigate({
            routeName: 'IncomingCall',
            params: {
                callId: call.callId,
            },
        }));
    }
}

function onPushNotificationReceived({ payload: { notification } }) {
    console.log('New notification', notification);
}

export default function* appSaga() {
    yield all([
        takeLatest(logout, onLogout),
        takeLatest(initApp, onInitApp),
        takeLatest(deinitApp, onDeinitApp),

        takeEvery(incomingCallReceived, onIncomingCallReceived),
        takeEvery(appStateChanged, onAppStateChanged),
        takeEvery(pushNotificationReceived, onPushNotificationReceived),
    ]);
}
