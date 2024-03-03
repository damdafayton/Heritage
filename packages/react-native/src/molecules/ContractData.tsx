import {Linking, StyleSheet, TouchableOpacity, View} from 'react-native';

import {Text} from '../ui/Text';
import {useContext} from 'react';
import {HerritageWalletContext} from '../context/HerritageWallet.context';
import {logger} from '../utils/logger';
import {Loading} from './Loading';
import {useGetEtherScanLink} from '../hooks/useGetEtherScanLink';
const log = logger('ContractData');

export function ContractData({style}: {style?: any}) {
  const {minFeePerYear, feeThousandagePerYear} = useContext(
    HerritageWalletContext,
  );

  log.debug('rendered');

  const contractIsLoaded = minFeePerYear && feeThousandagePerYear;

  const etherscanLink = useGetEtherScanLink();

  return (
    <View style={[styles.contractData, style]}>
      {contractIsLoaded ? (
        <View style={styles.contractDataCell}>
          <View style={styles.contractDataRow}>
            <TouchableOpacity
              onPress={() => {
                Linking.openURL(etherscanLink);
              }}>
              <Text>View contract on Etherscan</Text>
            </TouchableOpacity>
          </View>
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
        <Loading />
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
