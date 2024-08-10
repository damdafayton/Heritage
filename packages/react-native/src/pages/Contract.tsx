const log = logger('Contract');
import {useContext} from 'react';

import {HerritageWalletContext} from '../context/HerritageWallet.context';
import {Loading} from '../molecules/Loading';
import {UserNotSubscribed} from './contract/UserNotSubscribed';
import {
  StyledScrollViewWithDemoBanner,
  UserSubscribedStack,
} from '../molecules/UserSubscribed.navigator';
import {Text} from '../ui';
import {StyleSheet} from 'react-native';
import {StyledScrollView} from '../molecules/StyledScrollView';
import {logger} from '../utils/logger';

export function Contract() {
  const {isConnected, isSubscribed} = useContext(HerritageWalletContext);

  if (isConnected)
    return (
      <>
        {isSubscribed ? (
          <UserSubscribedStack />
        ) : (
          <StyledScrollViewWithDemoBanner>
            <UserNotSubscribed />
          </StyledScrollViewWithDemoBanner>
        )}
      </>
    );

  return (
    <StyledScrollView>
      <Text style={[localStyles.text]}>
        Waiting for connection to the contract
      </Text>
      <Loading />
    </StyledScrollView>
  );
}

const localStyles = StyleSheet.create({
  text: {
    alignSelf: 'center',
  },
});
