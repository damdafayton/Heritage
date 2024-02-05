import {StyleSheet, Text, View} from 'react-native';
import {useContext} from 'react';
import {logger} from 'react-native-logs';
const log = logger.createLogger().extend('Contract');

import {isSubscribed} from '../helpers/isSubscribed';
import {HerritageWalletContext} from '../context/HerritageWallet.context';
import {ActivityIndicator} from '../ui/ActivityIndicator';

export function Contract({minFeePerYear, feeThousandagePerYear}) {
  const {subscriptionData} = useContext(HerritageWalletContext);
  log.info({minFeePerYear, feeThousandagePerYear});

  const contractIsLoaded = minFeePerYear && feeThousandagePerYear;

  return contractIsLoaded ? (
    <View style={styles.contractData}>
      <View style={styles.contractDataCell}>
        <View style={styles.contractDataRow}>
          <Text>Annual fee: </Text>
          <Text>{feeThousandagePerYear}</Text>
          <Text>‰</Text>
        </View>
        <View style={styles.contractDataRow}>
          <Text>Minimum fee: </Text>
          <Text>{minFeePerYear}</Text>
          <Text>$</Text>
        </View>
      </View>
    </View>
  ) : (
    <ActivityIndicator />
  );
}

const styles = StyleSheet.create({
  contractData: {
    display: 'flex',
    flexDirection: 'row',
    columnGap: 2,
  },
  contractDataCell: {
    flex: 1,
  },
  contractDataRow: {
    display: 'flex',
    columnGap: 1,
    flexDirection: 'row',
  },
});
