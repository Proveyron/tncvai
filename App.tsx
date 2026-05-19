import React, {useState, useEffect} from 'react';
import {
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  Switch,
  NativeModules,
  Alert,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import Slider from '@react-native-community/slider';

const {CallScreening} = NativeModules;

function App(): React.JSX.Element {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isNonContactsEnabled, setIsNonContactsEnabled] = useState(false);
  const [dimIntensity, setDimIntensity] = useState(100);

  useEffect(() => {
    if (Platform.OS === 'android') {
      CallScreening.isRejectionEnabled().then((enabled: boolean) => {
        setIsEnabled(enabled);
      });
      CallScreening.isRejectNonContactsEnabled().then((enabled: boolean) => {
        setIsNonContactsEnabled(enabled);
      });
    }
  }, []);

  const toggleSwitch = async () => {
    if (Platform.OS !== 'android') {
      Alert.alert('Not Supported', 'This app only works on Android.');
      return;
    }

    const newValue = !isEnabled;

    if (newValue) {
      try {
        const granted = await CallScreening.requestRole();
        if (granted) {
          CallScreening.toggleRejection(true);
          setIsEnabled(true);
        } else {
          Alert.alert(
            'Permission Required',
            'You must set this app as the default Call Screening app to reject calls.',
          );
        }
      } catch (error) {
        console.error(error);
        Alert.alert('Error', 'An error occurred while requesting permissions.');
      }
    } else {
      CallScreening.toggleRejection(false);
      setIsEnabled(false);
    }
  };

  const toggleNonContactsSwitch = async () => {
    if (Platform.OS !== 'android') {
      Alert.alert('Not Supported', 'This app only works on Android.');
      return;
    }

    const newValue = !isNonContactsEnabled;

    if (newValue) {
      try {
        const roleGranted = await CallScreening.requestRole();
        if (!roleGranted) {
          Alert.alert(
            'Permission Required',
            'You must set this app as the default Call Screening app to reject calls.',
          );
          return;
        }

        const contactsGranted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
          {
            title: 'Contacts Permission',
            message: 'This app needs access to your contacts to know who not to reject.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );

        if (contactsGranted === PermissionsAndroid.RESULTS.GRANTED) {
          CallScreening.toggleRejectNonContacts(true);
          setIsNonContactsEnabled(true);
        } else {
          Alert.alert(
            'Permission Required',
            'Contacts permission is required to identify known numbers.',
          );
        }
      } catch (error) {
        console.error(error);
        Alert.alert('Error', 'An error occurred while requesting permissions.');
      }
    } else {
      CallScreening.toggleRejectNonContacts(false);
      setIsNonContactsEnabled(false);
    }
  };

  return (
    <>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.content}>
          <Text style={styles.title}>Call Rejector</Text>
          <Text style={styles.description}>
            When enabled, incoming calls will be automatically rejected.
          </Text>

          <View style={styles.switchContainer}>
            <View style={styles.switchRow}>
              <Text style={styles.label}>Reject ALL Calls</Text>
              <Switch
                trackColor={{false: '#767577', true: '#81b0ff'}}
                thumbColor={isEnabled ? '#f5dd4b' : '#f4f3f4'}
                ios_backgroundColor="#3e3e3e"
                onValueChange={toggleSwitch}
                value={isEnabled}
              />
            </View>
            <View style={styles.divider} />
            <View style={styles.switchRow}>
              <Text style={styles.label}>Reject Non-Contacts</Text>
              <Switch
                trackColor={{false: '#767577', true: '#81b0ff'}}
                thumbColor={isNonContactsEnabled ? '#f5dd4b' : '#f4f3f4'}
                ios_backgroundColor="#3e3e3e"
                onValueChange={toggleNonContactsSwitch}
                value={isNonContactsEnabled}
              />
            </View>
          </View>

          <Text style={styles.status}>
            Status: {isEnabled ? 'BLOCKING ALL' : isNonContactsEnabled ? 'BLOCKING UNKNOWN' : 'DISABLED'}
          </Text>

          <View style={styles.sliderContainer}>
            <Text style={styles.label}>Screen Dimmer ({Math.round(dimIntensity)}%)</Text>
            <Slider
              style={{width: 250, height: 40, marginTop: 10, alignSelf: 'center'}}
              minimumValue={0}
              maximumValue={100}
              minimumTrackTintColor="#81b0ff"
              maximumTrackTintColor="#d3d3d3"
              thumbTintColor="#f5dd4b"
              value={dimIntensity}
              onValueChange={setDimIntensity}
            />
          </View>
        </View>
      </SafeAreaView>
      <View
        pointerEvents="none"
        style={[
          styles.overlay,
          {backgroundColor: `rgba(0, 0, 0, ${Math.min(1 - (dimIntensity / 100), 0.95)})`},
        ]}
      />
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingHorizontal: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
  },
  switchContainer: {
    width: '100%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 15,
  },
  sliderContainer: {
    width: '100%',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 40,
  },
  slider: {
    width: 200,
    height: 40,
    marginTop: 10,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  label: {
    fontSize: 18,
    color: '#333',
  },
  status: {
    marginTop: 20,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#888',
  },
});

export default App;