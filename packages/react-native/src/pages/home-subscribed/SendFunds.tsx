import {useContext} from 'react';
import {useAccount, useContractWrite} from 'wagmi';

import {HerritageWalletContext} from '../../context/HerritageWallet.context';
import {useHeritageWalletContract} from '../../hooks/useHeritageWalletContract';
import {useConvertDepositToWei} from '../../forms/hooks/useConvertDepositToWei';
import {SendFundsForm, SendFundsFormVals} from '../../forms/SendFundsForm';
import {logger} from '../../utils/logger';
import {StyleSheet, View} from 'react-native';
import {Text} from '../../ui';
const log = logger('SendFunds');

export function SendFunds(props) {
  const {address: userAddr} = useAccount();

  const {subscriptionData, refetchSubscriptionData} = useContext(
    HerritageWalletContext,
  );

  const {abi, address} = useHeritageWalletContract();

  const {getDepositInWei} = useConvertDepositToWei();

  const {
    writeAsync: writeAsyncSendFunds,
    isSuccess,
    isLoading,
  } = useContractWrite({
    abi,
    address,
    functionName: 'sendFunds',
  });

  const onSubmitSendFunds = async (vals: SendFundsFormVals) => {
    const wei = await getDepositInWei(vals);
    log.info({wei});

    if (!userAddr) return;

    await writeAsyncSendFunds({
      args: [wei, vals.receiverAddress],
    });

    refetchSubscriptionData();
  };

  return (
    <>
      <View style={styles.contractDataRow}>
        <Text>Deposited: </Text>
        <Text>{subscriptionData?.deposited}</Text>
        <Text>ETH</Text>
      </View>
      <SendFundsForm onSubmit={onSubmitSendFunds} />
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
