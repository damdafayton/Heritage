import {StyleSheet, Text, View} from 'react-native';
import {useContext} from 'react';

import {isSubscribed} from '../helpers/isSubscribed';
import {HerritageWalletContext} from '../context/HerritageWallet.context';

export function Header({minFeePerYear, feeThousandagePerYear}) {
  const {subscriptionData} = useContext(HerritageWalletContext);

  return (
    <View style={styles.contractData}>
      <View style={styles.contractDataCell}>
        <Text>Fees for new users</Text>
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
      {subscriptionData && isSubscribed(subscriptionData) ? (
        <View style={styles.contractDataCell}>
          <Text>Fees for you</Text>
          <View style={styles.contractDataRow}>
            <Text>Annual fee: </Text>
            <Text>{subscriptionData.feeThousandagePerYear}</Text>
            <Text>‰</Text>
          </View>
          <View style={styles.contractDataRow}>
            <Text>Minimum fee: </Text>
            <Text>{subscriptionData.minFeePerYear}</Text>
            <Text>$</Text>
          </View>
        </View>
      ) : (
        <></>
      )}
    </View>
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
    backgroundColor: 'yellow',
  },
  contractDataRow: {
    display: 'flex',
    columnGap: 2,
    flexDirection: 'row',
  },
});
