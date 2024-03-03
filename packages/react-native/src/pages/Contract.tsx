import {logger} from 'react-native-logs';
const log = logger.createLogger().extend('Contract');

import {useContext} from 'react';
import {HerritageWalletContext} from '../context/HerritageWallet.context';
import {Loading} from '../molecules/Loading';
import {UserNotSubscribed} from './contract/UserNotSubscribed';
import {UserSubscribedStack} from './contract/UserSubscribed.stack';
import {Text} from '../ui';
import {StyleSheet} from 'react-native';
import {useTheme} from '@react-navigation/native';
import {StyledScrollView} from '../molecules/Tabs';

export function Contract() {
  const {isConnected, isSubscribed} = useContext(HerritageWalletContext);

  const theme = useTheme();

  return isConnected ? (
    <>
      {isSubscribed ? (
        <UserSubscribedStack />
      ) : (
        <StyledScrollView>
          <UserNotSubscribed />
        </StyledScrollView>
      )}
    </>
  ) : (
    <StyledScrollView>
      <Text style={[styles.text]}>Waiting for connection to the contract</Text>
      <Loading />
    </StyledScrollView>
  );
}

const styles = StyleSheet.create({
  text: {
    alignSelf: 'center',
  },
});
