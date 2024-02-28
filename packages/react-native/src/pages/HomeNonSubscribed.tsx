import {StyleSheet, Text, View, ScrollView} from 'react-native';
import {useState} from 'react';
import {logger} from 'react-native-logs';
const log = logger.createLogger().extend('HomeNonSubscribed');

import {Button} from '../ui/Button';
import {ActivityIndicator} from '../ui/ActivityIndicator';

import {Subscribe} from './subscribe/Subscribe';
import {W3mConnectButton} from '@web3modal/wagmi-react-native';
import {useAccount} from 'wagmi';

export function HomeNonSubscribed({isConnected}: {isConnected: boolean}) {
  const [visible, setVisible] = useState(false);
  const {isDisconnected: isUserDisconnected} = useAccount();

  const Content = () => {
    return (
      <View>
        <Text style={styles.text}>
          You are not registered. Click below button to register.
        </Text>
        <Button mode="contained" onPress={() => setVisible(true)}>
          Register
        </Button>
      </View>
    );
  };

  return (
    <ScrollView style={styles.view}>
      <Text style={styles.title}>HERITAGE</Text>
      {isUserDisconnected ? (
        <W3mConnectButton
          label="Connect your wallet"
          loadingLabel="Connecting"
        />
      ) : !isConnected ? (
        <>
          <Text style={styles.text}>
            Waiting for connection to the contract
          </Text>
          <ActivityIndicator />
        </>
      ) : (
        <Content />
      )}
      <Subscribe visible={visible} setVisible={setVisible} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  view: {},
  title: {
    alignSelf: 'center',
    fontSize: 24,
    paddingVertical: 10,
    paddingBottom: 20,
  },
  text: {
    alignSelf: 'center',
  },
});
