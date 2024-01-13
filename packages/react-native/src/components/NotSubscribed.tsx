import {useEffect, useState} from 'react';

import {NotSubscribedView} from './NotSubscribedView';
import {useHeritageContract} from '../hooks/useHeritageContract';
import {
  readContracts,
  useAccount,
  useContractRead,
  useContractWrite,
} from 'wagmi';
import {parseEther} from 'ethers';

export function NotSubscribed({
  refetchAddressSubscriptionMap,
}: {
  refetchAddressSubscriptionMap: Function;
}) {
  const {address, abi, getHeritageFunction} = useHeritageContract();

  const [depositAmountInWEI, setDepositAmountInWEI] = useState<bigint>();
  const [depositAmountInUSD, setDepositAmountInUSD] = useState<number>();

  const {
    data: usdValInWei,
    isFetching,
    refetch: refetchConvertUsdToWei,
  } = useContractRead({
    abi,
    address,
    functionName: 'convertUsdToWei',
    args: [depositAmountInUSD],
    enabled: false,
  });

  const {address: userAddress, isConnecting, isDisconnected} = useAccount();

  const {
    write,
    data,
    isLoading,
    isSuccess: registerSubscriberIsSuccess,
  } = useContractWrite({
    abi,
    address,
    functionName: 'registerSubscriber',
  });

  const handleFormSubmit = async ({depositType, depositAmount}) => {
    console.log({depositType, depositAmount});
    setDepositAmountInWEI(undefined);
    setDepositAmountInUSD(undefined);

    switch (depositType) {
      case 'ETH':
        const valueInWei = parseEther(depositAmount);

        setDepositAmountInWEI(valueInWei);
        break;
      case 'USD':
        setDepositAmountInUSD(depositAmount);
        break;
    }
  };

  useEffect(() => {
    if (!depositAmountInUSD) return;

    refetchConvertUsdToWei();
  }, [depositAmountInUSD]);

  useEffect(() => {
    setDepositAmountInWEI(usdValInWei as bigint);
  }, [usdValInWei]);

  useEffect(() => {
    console.log({depositAmountInWEI});

    if (!depositAmountInWEI) return;

    write({
      // from: userAddress,
      value: depositAmountInWEI,
    });
  }, [depositAmountInWEI]);

  useEffect(() => {
    if (registerSubscriberIsSuccess) refetchAddressSubscriptionMap();
  }, [registerSubscriberIsSuccess]);

  return <NotSubscribedView handleFormSubmit={handleFormSubmit} />;
}
