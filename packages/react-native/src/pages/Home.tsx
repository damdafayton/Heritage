// @web3modal/wagmi-react-native polyfill
// Add this to where there is web3modal connect button
Promise.allSettled =
  Promise.allSettled ||
  (promises =>
    Promise.all(
      promises.map(p =>
        p
          .then(value => ({
            status: 'fulfilled',
            value,
          }))
          .catch(reason => ({
            status: 'rejected',
            reason,
          })),
      ),
    ));

import {StyleSheet, Platform, View} from 'react-native';
import {W3mConnectButton} from '@web3modal/wagmi-react-native';
import {useAccount} from 'wagmi';
const log = logger('Home');

import {Text} from '../ui';
import {HomeAndroid} from './home/Home.android';
import {HomeWeb} from './home/Home.web.pwa';
import {HomeIOS} from './home/Home.ios';
import {StyledScrollView} from '../molecules/StyledScrollView';
import {logger} from '../utils/logger';

export function Home() {
  const {address} = useAccount();
  log.debug({address});

  return (
    <StyledScrollView>
      {(() => {
        return <HomeWeb />;
        switch (Platform.OS) {
          case 'android':
            return address ? <HomeAndroid /> : <HomeWithConnect />;
          case 'ios':
            return <HomeIOS />;
          default:
            return address ? <HomeWeb /> : <HomeWithConnect />;
        }
      })()}
    </StyledScrollView>
  );
}

const HomeWithConnect = () => {
  return (
    <>
      <Text variant="titleMedium" style={styles.title}>
        HERITAGE
      </Text>
      <View style={styles.w3connect}>
        <W3mConnectButton
          label="Connect your wallet"
          loadingLabel="Connecting"
        />
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  title: {
    alignSelf: 'center',
    fontSize: 24,
    paddingVertical: 10,
    paddingBottom: 20,
  },
  w3connect: {
    alignSelf: 'center',
  },
});
