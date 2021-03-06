import { AppRegistry } from 'react-native';
import * as firebase from 'react-native-firebase';
import { Cursor } from 'src/contrib/typed-baobab';
import { failure, loading, RemoteData, success } from 'src/libs/schema';

export type PushToken = string;

export async function getPushToken(cursor: Cursor<RemoteData<PushToken>>): Promise<RemoteData<PushToken>> {
    cursor.set(loading);

    try {
        const token = await firebase.messaging().getToken();

        const result = success(token);
        cursor.set(result);

        return result;
    } catch (err) {
        const result = failure(err);

        cursor.set(result);
        console.warn('PushManager android: failed to get FCM token');

        return result;
    }
}

export function subscribeToPushNotifications(callback: (x: any) => void) {
    console.log('Subscribed to push notifications');

    firebase.messaging().onMessage(async (message) => {
        console.log('PushManager: FCM: notification: ' + message.data);
        callback(message.data);
    });

    AppRegistry.registerHeadlessTask('RNFirebaseBackgroundMessage', () => async (message) => callback(message.data));

    const channel = new firebase.notifications.Android.Channel(
        'td_channel_id',
        'Incoming call channel',
        firebase.notifications.Android.Importance.Max
    ).setDescription('Incoming call received');
    firebase.notifications().android.createChannel(channel);
}

export function showLocalNotification(title: string, text: string) {
    console.log('PushManager: showLocalNotification');
    try {
        const notification = new firebase.notifications.Notification()
            .setNotificationId('notificationId')
            .setTitle(title);
        notification.android.setSmallIcon('ic_vox_notification');
        notification.android.setChannelId('td_channel_id');
        firebase.notifications().displayNotification(notification);
    } catch (e) {
        console.warn(
            'React Native Firebase is not set up. Enable google-services plugin at the bottom of the build.gradle file'
        );
    }
}
