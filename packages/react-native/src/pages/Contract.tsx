import {logger} from 'react-native-logs';
const log = logger.createLogger().extend('Contract');

import {useContext, useState} from 'react';
import {HerritageWalletContext} from '../context/HerritageWallet.context';
import {Loading} from '../molecules/Loading';
import {UserNotSubscribed} from './contract/UserNotSubscribed';
import {UserSubscribedStack} from './contract/UserSubscribed.stack';
import {Text} from '../ui';
import {StyleSheet} from 'react-native';
import {StyledScrollView} from '../molecules/Tabs';
import {useAccount} from 'wagmi';
import {burnerWalletName} from '../services/wagmi-burner/BurnerConnector';
import {ErrorBanner} from '../molecules/ErrorBanner';
import {styles} from '../ui/styles';

export function Contract() {
  const {isConnected, isSubscribed} = useContext(HerritageWalletContext);

  const {connector} = useAccount();

  const isBurnerConnected = connector?.name === burnerWalletName;

  const [showBurnerBanner, setShowBurnerBanner] = useState(isBurnerConnected);

  const BurnerBanner = () => (
    <ErrorBanner
      visible={isBurnerConnected && showBurnerBanner}
      onPressDismiss={() => setShowBurnerBanner(false)}
      style={{
        marginTop: styles.text.marginTop,
        marginBottom: styles.global.marginTop,
      }}>
      <Text>
        You are running the app with a demo wallet. Dont forget to disconnect
        the demo wallet and connect your real address.
      </Text>
    </ErrorBanner>
  );

  if (isConnected)
    return (
      <>
        {showBurnerBanner && <BurnerBanner />}
        {isSubscribed ? (
          <UserSubscribedStack />
        ) : (
          <StyledScrollView>
            <UserNotSubscribed />
          </StyledScrollView>
        )}
      </>
    );

  return (
    <>
      <BurnerBanner />
      <StyledScrollView>
        <Text style={[localStyles.text]}>
          Waiting for connection to the contract
        </Text>
        <Loading />
      </StyledScrollView>
    </>
  );
}

const localStyles = StyleSheet.create({
  text: {
    alignSelf: 'center',
  },
});
