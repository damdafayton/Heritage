import {StyleSheet, View} from 'react-native';
import {logger} from '../utils/logger';
const log = logger('ContractData');

import {ActivityIndicator} from '../ui/ActivityIndicator';
import {Text} from '../ui/Text';
import {useContext} from 'react';
import {HerritageWalletContext} from '../context/HerritageWallet.context';

export function ContractData() {
  const {minFeePerYear, feeThousandagePerYear} = useContext(
    HerritageWalletContext,
  );

  log.debug({minFeePerYear, feeThousandagePerYear});

  const contractIsLoaded = minFeePerYear && feeThousandagePerYear;

  return (
    <View style={styles.contractData}>
      {contractIsLoaded ? (
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
      ) : (
        <ActivityIndicator />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  contractData: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    columnGap: 2,
    marginBottom: 5,
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
