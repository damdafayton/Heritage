import {logger} from 'react-native-logs';
const log = logger.createLogger().extend('Contract');

import {useContext, useState} from 'react';
import {HerritageWalletContext} from '../context/HerritageWallet.context';
import {Loading} from '../molecules/Loading';
import {UserNotSubscribed} from './contract/UserNotSubscribed';
import {UserSubscribedStack} from './contract/UserSubscribed.stack';
import {Text} from '../ui';
import {StyleSheet} from 'react-native';

export function Contract() {
  const {isConnected, isSubscribed} = useContext(HerritageWalletContext);

  return isConnected ? (
    <>
      {isSubscribed ? <UserSubscribedStack /> : <UserNotSubscribed />}
      {/* <ContractData />
      <Divider /> */}
    </>
  ) : (
    <>
      <Text style={[styles.text, {marginBottom: 14}]}>
        Waiting for connection to the contract
      </Text>
      <Loading />
    </>
  );
}

const styles = StyleSheet.create({
  text: {
    alignSelf: 'center',
  },
});
