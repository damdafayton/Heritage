import {StyleSheet, ScrollView} from 'react-native';
import {W3mConnectButton} from '@web3modal/wagmi-react-native';
import {useAccount} from 'wagmi';
import {logger} from 'react-native-logs';
const log = logger.createLogger().extend('Home');

import {Text} from '../ui';
import {HomeActionsStack} from './home/HomeActions.stack';

export function Home() {
  const {isDisconnected: isUserDisconnected} = useAccount();
  log.debug('isUserDisconnected', isUserDisconnected);

  return isUserDisconnected ? (
    <ScrollView style={styles.view}>
      <Text variant="titleMedium" style={styles.title}>
        HERITAGE
      </Text>
      {
        <W3mConnectButton
          label="Connect your wallet"
          loadingLabel="Connecting"
        />
      }
    </ScrollView>
  ) : (
    <HomeActionsStack />
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
});
