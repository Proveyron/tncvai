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
} from 'react-native';

const {CallScreening} = NativeModules;

function App(): React.JSX.Element {
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'android') {
      CallScreening.isRejectionEnabled().then((enabled: boolean) => {
        setIsEnabled(enabled);
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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.content}>
        <Text style={styles.title}>Call Rejector</Text>
        <Text style={styles.description}>
          When enabled, all incoming calls will be automatically rejected.
        </Text>
        <View style={styles.switchContainer}>
          <Text style={styles.label}>Reject All Calls</Text>
          <Switch
            trackColor={{false: '#767577', true: '#81b0ff'}}
            thumbColor={isEnabled ? '#f5dd4b' : '#f4f3f4'}
            ios_backgroundColor="#3e3e3e"
            onValueChange={toggleSwitch}
            value={isEnabled}
          />
        </View>
        <Text style={styles.status}>
          Status: {isEnabled ? 'ENABLED' : 'DISABLED'}
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  label: {
    fontSize: 18,
    marginRight: 15,
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
