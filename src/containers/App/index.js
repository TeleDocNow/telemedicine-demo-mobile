import React from 'react';
import {
    Text,
    View,
    Modal,
    TouchableHighlight,
    TouchableOpacity,
    TextInput,
    SafeAreaView,
    StatusBar,
    PermissionsAndroid,
    Platform
} from 'react-native';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';

// import LoginManager from '../manager/LoginManager';
// import CallManager from '../manager/CallManager';

import { makeSelectUserList } from 'containers/App/selectors';

import COLOR from 'styles/Color';
import COLOR_SCHEME from 'styles/ColorScheme';
import styles from 'styles/Styles';
import Form from './Form';

import { logout, loadUsers } from './actions';


class App extends React.Component {
    componentDidMount() {
        this.props.loadUsers();
    }

    static navigationOptions = ({ navigation }) => {
        console.log("in options",navigation)
        const params = navigation.state.params || {};

        return {
            headerLeft: (
                <View>
                    <Text style={styles.headerButton}>
                        Telemedicine Demo
                    </Text>
                </View>

            ),
            headerRight: (
                <TouchableOpacity onPress={() => navigation.dispatch(logout())}>
                    <Text style={styles.headerButton}>
                        Logout
                    </Text>
                </TouchableOpacity>
            ),
        };
    };
    // constructor(props) {
    //     super(props);
    //     this.number = '';
    //     this.state = {
    //         isModalOpen: false,
    //         modalText: ''
    //     }
    // }
    //
    // componentDidMount() {
    //     this.props.navigation.setParams({ settingsClick: this._goToSettings, backClicked: this._goToLogin });
    //     LoginManager.getInstance().on('onConnectionClosed', this._connectionClosed);
    // }
    //
    // componentWillUnmount() {
    //     LoginManager.getInstance().off('onConnectionClosed', this._connectionClosed);
    // }
    //
    // _goToSettings = () => {
    //     this.props.navigation.navigate('Settings')
    // };
    //
    // _goToLogin = () => {
    //     LoginManager.getInstance().logout();
    //     this.props.navigation.navigate("Login");
    // };
    //
    // _connectionClosed = () => {
    //     this.props.navigation.navigate("Login");
    // };
    //
    // async makeCall(isVideoCall) {
    //     console.log('MainScreen: make call: ' + this.number + ', isVideo:' + isVideoCall);
    //     try {
    //         if (Platform.OS === 'android') {
    //             let permissions = [PermissionsAndroid.PERMISSIONS.RECORD_AUDIO];
    //             if (isVideoCall) {
    //                 permissions.push(PermissionsAndroid.PERMISSIONS.CAMERA);
    //             }
    //             const granted = await PermissionsAndroid.requestMultiple(permissions);
    //             const recordAudioGranted = granted['android.permission.RECORD_AUDIO'] === 'granted';
    //             const cameraGranted = granted['android.permission.CAMERA'] === 'granted';
    //             if (recordAudioGranted) {
    //                 if (isVideoCall && !cameraGranted) {
    //                     console.warn('MainScreen: makeCall: camera permission is not granted');
    //                     return;
    //                 }
    //             } else {
    //                 console.warn('MainScreen: makeCall: record audio permission is not granted');
    //                 return;
    //             }
    //         }
    //         const callSettings = {
    //             video: {
    //                 sendVideo: isVideoCall,
    //                 receiveVideo: isVideoCall
    //             }
    //         };
    //         let call = await Voximplant.getInstance().call(this.number, callSettings);
    //         CallManager.getInstance().addCall(call);
    //         this.props.navigation.navigate('Call', {
    //             callId: call.callId,
    //             isVideo: isVideoCall,
    //             isIncoming: false
    //         });
    //     } catch (e) {
    //         console.warn('MainScreen: makeCall failed' + e);
    //     }
    // }

    render() {
        return (
            <SafeAreaView style={styles.safearea}>
                <StatusBar
                    barStyle={COLOR_SCHEME.LIGHT}
                    backgroundColor={COLOR.PRIMARY_DARK}
                />

                <Form
                    makeCall={this.props.makeCall}
                    userList={this.props.userList || []}
                />
            </SafeAreaView>
        );
    }
}

const mapStateToProps = createStructuredSelector({
  userList: makeSelectUserList(),
});

const mapDispatchToProps = (dispatch) => ({
    loadUsers: () => dispatch(loadUsers()),
    makeCall: () => console.log('call'),
});

export default connect(mapStateToProps, mapDispatchToProps)(App);
