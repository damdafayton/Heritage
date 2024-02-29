import {HomeNonSubscribed} from './HomeNonSubscribed';
import {StyleSheet, ScrollView} from 'react-native';
import {useContext} from 'react';
import {W3mConnectButton} from '@web3modal/wagmi-react-native';
import {useAccount} from 'wagmi';
import {logger} from 'react-native-logs';
const log = logger.createLogger().extend('Home');

import {HomeStack} from './home-subscribed/HomeStack';
import {ActivityIndicator, Text} from '../ui';
import {HerritageWalletContext} from '../context/HerritageWallet.context';

export function Home() {
  const {isDisconnected: isUserDisconnected} = useAccount();
  log.debug('isUserDisconnected', isUserDisconnected);

  const {isSubscribed, isConnected} = useContext(HerritageWalletContext);

  const Loading = () => {
    return (
      <>
        <Text style={[styles.text, {marginBottom: 14}]}>
          Waiting for connection to the contract
        </Text>
        <ActivityIndicator />
      </>
    );
  };

  if (isSubscribed) return <HomeStack />;

  return (
    <ScrollView style={styles.view}>
      <Text variant="titleMedium" style={styles.title}>
        HERITAGE
      </Text>
      {isUserDisconnected ? (
        <W3mConnectButton
          label="Connect your wallet"
          loadingLabel="Connecting"
        />
      ) : isConnected ? (
        <HomeNonSubscribed />
      ) : (
        <Loading />
      )}
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
