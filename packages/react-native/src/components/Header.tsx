import {StyleSheet, Text, View} from 'react-native';

import {DisplayVariable} from './Contract/DiplayVariable';
import {isSubscribed} from '../helpers/isSubscribed';

export function Header({
  subscriptionData,
  findContractFunction,
  heritageAddress,
}) {
  const contractIsFound = !!heritageAddress;

  const fnFeeThousandage = findContractFunction?.('feeThousandagePerYear');
  const fnMinFee = findContractFunction?.('minFeePerYearInUsd');

  const refreshDisplayVariables = true;

  const {minFeePerYear, feeThousandagePerYear} = subscriptionData || {};

  console.info({minFeePerYear, feeThousandagePerYear});

  return contractIsFound ? (
    <View style={styles.contractData}>
      <View style={styles.contractDataCell}>
        <Text>Fees for new users</Text>
        <View style={styles.contractDataRow}>
          <Text>Annual fee: </Text>
          <DisplayVariable
            abiFunction={fnFeeThousandage}
            contractAddress={heritageAddress}
            refreshDisplayVariables={refreshDisplayVariables}
          />
          <Text>‰</Text>
        </View>
        <View style={styles.contractDataRow}>
          <Text>Minimum fee: </Text>
          <DisplayVariable
            abiFunction={fnMinFee}
            contractAddress={heritageAddress}
            refreshDisplayVariables={refreshDisplayVariables}
          />
          <Text>$</Text>
        </View>
      </View>
      {isSubscribed(subscriptionData) ? (
        <View style={styles.contractDataCell}>
          <Text>Fees for you</Text>
          <View style={styles.contractDataRow}>
            <Text>Annual fee: </Text>
            <DisplayVariable
              abiFunction={fnFeeThousandage}
              contractAddress={heritageAddress}
              refreshDisplayVariables={refreshDisplayVariables}
              overrideValue={feeThousandagePerYear}
            />
            <Text>‰</Text>
          </View>
          <View style={styles.contractDataRow}>
            <Text>Minimum fee: </Text>
            <DisplayVariable
              abiFunction={fnMinFee}
              contractAddress={heritageAddress}
              refreshDisplayVariables={refreshDisplayVariables}
              overrideValue={minFeePerYear}
            />
            <Text>$</Text>
          </View>
        </View>
      ) : (
        <></>
      )}
    </View>
  ) : (
    <Text>Loading</Text>
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
