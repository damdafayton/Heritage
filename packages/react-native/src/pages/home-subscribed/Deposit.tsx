import {useContext} from 'react';
import {HerritageWalletContext} from '../../context/HerritageWallet.context';

import {useHeritageWalletContract} from '../../hooks/useHeritageWalletContract';
import {useAccount, useContractWrite} from 'wagmi';
import {DepositForm, DepositFormVals} from '../../forms/DepositForm';
import {useConvertDepositToWei} from '../../forms/hooks/useConvertDepositToWei';
import {ActivityIndicator} from '../../ui/ActivityIndicator';
import {logger} from '../../utils/logger';
import {StyleSheet, Text, View} from 'react-native';

const log = logger('Deposit');

export function Deposit(props) {
  const {subscriptionData, refetchSubscriptionData} = useContext(
    HerritageWalletContext,
  );

  if (!subscriptionData) return <ActivityIndicator />;

  const {abi, address} = useHeritageWalletContract();

  const {getDepositInWei} = useConvertDepositToWei();

  const {
    writeAsync: writeAsyncDeposit,
    isLoading,
    isSuccess,
  } = useContractWrite({
    abi,
    address,
    functionName: 'deposit',
  });

  const {address: userAddr} = useAccount();

  const onSubmitDeposit = async (vals: DepositFormVals, options) => {
    const wei = await getDepositInWei(vals);
    log.info({wei});

    if (!userAddr) return;

    try {
      await writeAsyncDeposit({
        value: wei,
        args: [userAddr],
      });

      refetchSubscriptionData();
      isSuccess && options.resetForm();
    } catch (e) {}
  };

  return (
    <>
      <View style={styles.contractDataRow}>
        <Text>Deposited: </Text>
        <Text>{subscriptionData.deposited}</Text>
        <Text>ETH</Text>
      </View>
      <DepositForm onSubmit={onSubmitDeposit} isLoading={isLoading} />
    </>
  );
}

const styles = StyleSheet.create({
  contractDataRow: {
    display: 'flex',
    flexDirection: 'row',
    columnGap: 2,
    alignItems: 'center',
  },
});
