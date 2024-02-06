import {StyleSheet, View} from 'react-native';
import {logger} from 'react-native-logs';
const log = logger.createLogger().extend('ContractData');

import {ActivityIndicator} from '../ui/ActivityIndicator';
import {Text} from '../ui/Text';
import {useContext} from 'react';
import {HerritageWalletContext} from '../context/HerritageWallet.context';

export function ContractData() {
  const {minFeePerYear, feeThousandagePerYear} = useContext(
    HerritageWalletContext,
  );
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
