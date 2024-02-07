import {Button, StyleSheet, Text, View} from 'react-native';
import PolyfillCrypto from 'react-native-webview-crypto';

import {findYearsPassed} from '../../helpers/findYearsPassed';
import {useContext, useEffect, useState} from 'react';
import {HerritageWalletContext} from '../../context/HerritageWallet.context';
import {
  AddInheritantForm,
  AddInheritantVals,
} from '../../forms/AddInheritantForm';
import {useHeritageWalletContract} from '../../hooks/useHeritageWalletContract';
import {useAccount, useContractWrite} from 'wagmi';
import {DepositForm, DepositFormVals} from '../../forms/DepositForm';
import {useConvertDepositToWei} from '../../forms/hooks/useConvertDepositToWei';
import {SendFundsForm, SendFundsFormVals} from '../../forms/SendFundsForm';
import {EncryptedData} from './EncryptedData';
import {ActivityIndicator} from '../../ui/ActivityIndicator';
import {logger} from '../../utils/logger';
const log = logger('Subscribed');

export function Subscribed() {
  log.debug('rendering Subscribed');

  const {subscriptionData, refetchSubscriptionData} = useContext(
    HerritageWalletContext,
  );

  if (!subscriptionData) return <ActivityIndicator />;

  const {deposited, paidFeeCount, lastYearPaid, startTimestamp, minFeePerYear} =
    subscriptionData;

  const [activeForm, setActiveForm] = useState<
    | 'send'
    | 'deposit'
    | 'add-inheritant'
    | 'pay-fee'
    | 'encrypted-data'
    | undefined
  >(undefined);

  const {abi, address} = useHeritageWalletContract();

  const {writeAsync: writeAsyncFee} = useContractWrite({
    abi,
    address,
    functionName: 'forcePaySingleFee',
  });

  const payFee = async () => {
    setActiveForm(undefined);
    await writeAsyncFee();

    refetchSubscriptionData();
  };

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

  const {writeAsync: writeAsyncSendFunds, isSuccess: isSuccess2} =
    useContractWrite({
      abi,
      address,
      functionName: 'sendFunds',
    });

  const {write: writeAddInheritant, isSuccess: isSuccess3} = useContractWrite({
    abi,
    address,
    functionName: 'addInheritant',
  });

  const {address: userAddr} = useAccount();

  const onSubmitDeposit = async (vals: DepositFormVals) => {
    const wei = await getDepositInWei(vals);
    log.info({wei});

    if (!userAddr) return;

    await writeAsyncDeposit({
      value: wei,
      args: [userAddr],
    });

    refetchSubscriptionData();

    if (isSuccess) setActiveForm(undefined);
  };

  const onSubmitSendFunds = async (vals: SendFundsFormVals) => {
    const wei = await getDepositInWei(vals);
    log.info({wei});

    if (!userAddr) return;

    await writeAsyncSendFunds({
      args: [wei, vals.receiverAddress],
    });

    refetchSubscriptionData();

    if (isSuccess2) setActiveForm(undefined);
  };

  const onSubmitAddInheritant = async (vals: AddInheritantVals) => {
    await writeAddInheritant({args: [vals.address, BigInt(vals.percent)]});

    if (isSuccess3) setActiveForm(undefined);
  };

  return (
    <>
      <PolyfillCrypto />
      <View style={styles.contractDataRow}>
        <Text>Deposited: </Text>
        <Text>{deposited}</Text>
        <Text>ETH</Text>
      </View>
      <View style={styles.contractDataRow}>
        <Text>Last year paid: </Text>
        <Text>{lastYearPaid}</Text>
      </View>
      <View style={styles.contractDataRow}>
        <Text>Years paid: </Text>
        <Text>{paidFeeCount}</Text>
      </View>
      <View style={styles.contractDataRow}>
        <Text>Years required to pay: </Text>
        <Text>{findYearsPassed(startTimestamp * 1000)}</Text>
      </View>
      <View style={styles.buttonContainer}>
        <Button onPress={() => setActiveForm('send')} title="Send funds" />
        <Button
          onPress={() => setActiveForm('deposit')}
          title="Deposit funds"
        />
      </View>
      <View style={styles.buttonContainer}>
        <Button
          onPress={() => setActiveForm('add-inheritant')}
          title="Add inheritant"
        />
        <Button onPress={payFee} title="Pay 1 year fee" />
      </View>
      <Button
        onPress={() => setActiveForm('encrypted-data')}
        title="Encrypted data"
      />
      {(() => {
        switch (activeForm) {
          case 'deposit':
            return <DepositForm onSubmit={onSubmitDeposit} />;
          case 'encrypted-data':
            return <EncryptedData />;
          case 'send':
            return <SendFundsForm onSubmit={onSubmitSendFunds} />;
          case 'add-inheritant':
            return (
              <AddInheritantForm
                onSubmit={onSubmitAddInheritant}
                isSuccess={isSuccess3}
              />
            );
        }
      })()}
    </>
  );
}

const styles = StyleSheet.create({
  buttonContainer: {flexDirection: 'row', justifyContent: 'center'},
  contractDataRow: {
    display: 'flex',
    flexDirection: 'row',
    columnGap: 2,
  },
});

{
  /* {subscriptionData && isSubscribed(subscriptionData) ? (
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
      )} */
}
