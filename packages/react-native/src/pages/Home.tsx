import {StyleSheet, ScrollView} from 'react-native';
import {W3mConnectButton} from '@web3modal/wagmi-react-native';
import {useAccount} from 'wagmi';
import {logger} from 'react-native-logs';
const log = logger.createLogger().extend('Home');

import {Text} from '../ui';
import {HomeActionsStack} from './home/HomeActions.stack';
import {useTheme} from 'react-native-paper/src/core/theming';

export function Home() {
  const {address} = useAccount();
  log.debug('address', address);

  return !address ? <HomeWithConnect /> : <HomeActionsStack />;
}

const HomeWithConnect = () => {
  const theme = useTheme();

  return (
    <ScrollView
      style={[styles.view, {backgroundColor: theme.colors.background}]}>
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
  );
};

const styles = StyleSheet.create({
  view: {},
  title: {
    alignSelf: 'center',
    fontSize: 24,
    paddingVertical: 10,
    paddingBottom: 20,
  },
});
