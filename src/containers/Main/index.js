import React from 'react';
import {
    Text,
    View,
    TouchableOpacity,
    SafeAreaView,
    StatusBar,
} from 'react-native';
import { connect } from 'react-redux';
import { createStructuredSelector } from 'reselect';

import { logout } from 'containers/App/actions';
import Modal from 'components/Modal';
import COLOR from 'styles/Color';
import COLOR_SCHEME from 'styles/ColorScheme';
import styles from 'styles/Styles';
import Form from './Form';
import { fetchContacts, makeCall, makeVideoCall } from './actions';
import { makeSelectContactList } from './selectors';

class App extends React.Component {
    componentDidMount() {
        this.props.fetchContacts();
    }

    static navigationOptions = ({ navigation }) => {
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

    render() {
        return (
            <SafeAreaView style={styles.safearea}>
                <StatusBar
                    barStyle={COLOR_SCHEME.LIGHT}
                    backgroundColor={COLOR.PRIMARY_DARK}
                />

                <Form
                    makeCall={this.props.makeCall}
                    makeVideoCall={this.props.makeVideoCall}
                    contactList={this.props.contactList || []}
                />
                <Modal />
            </SafeAreaView>
        );
    }
}

const mapStateToProps = createStructuredSelector({
  contactList: makeSelectContactList(),
});

const mapDispatchToProps = {
    fetchContacts,
    makeCall,
    makeVideoCall,
};

export default connect(mapStateToProps, mapDispatchToProps)(App);