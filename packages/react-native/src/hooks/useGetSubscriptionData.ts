import {useContractRead} from 'wagmi';
import {logger, consoleTransport} from 'react-native-logs';
const log = logger.createLogger().extend('useGetSubscriptionData');

import deployedContracts from '../../contracts/deployedContracts';
import {displayTxResult} from '../components/Contract/utils';
import {formatEther} from 'ethers';
import {useEffect, useState} from 'react';
import {useHeritageWalletContract} from './useHeritageWalletContract';

const defaultABI = deployedContracts['31337']['HeritageWallet'].abi;

defaultABI[9].outputs;

export function useGetSubscriptionData(userAddress) {
  const [subscriptionData, setsubscriptionData] = useState<SubscriptionData>();

  const {address: heritageAddress, abi} = useHeritageWalletContract();

  const {
    data,
    isFetching,
    isFetched,
    refetch: refetchSubscriptionData,
  } = useContractRead({
    abi,
    address: heritageAddress,
    functionName: 'addressSubscriptionMap',
    args: [userAddress],
    enabled: false,
  });

  useEffect(() => {
    if (!heritageAddress || !userAddress) return;

    refetchSubscriptionData();
  }, [heritageAddress, userAddress]);

  useEffect(() => {
    const [
      startTimestamp,
      minFeePerYear,
      feeThousandagePerYear,
      paidFeeCount,
      lastYearPaid,
      deposited,
      canModify,
    ] = data || [];

    const _subscriptionData = {
      startTimestamp: displayTxResult(startTimestamp),
      minFeePerYear: displayTxResult(minFeePerYear),
      feeThousandagePerYear: displayTxResult(feeThousandagePerYear),
      paidFeeCount: displayTxResult(paidFeeCount),
      lastYearPaid: Boolean(displayTxResult(lastYearPaid)),
      deposited: deposited
        ? parseFloat(parseFloat(formatEther(deposited)).toFixed(4))
        : 0,
    } as unknown as SubscriptionData;

    log.info({subscriptionData: _subscriptionData});

    setsubscriptionData(_subscriptionData);
  }, [data]);

  return {subscriptionData, isFetching, isFetched, refetchSubscriptionData};
}

export type SubscriptionData = {
  startTimestamp: number;
  minFeePerYear: number;
  feeThousandagePerYear: number;
  paidFeeCount: number;
  lastYearPaid: boolean;
  deposited: number;
};
